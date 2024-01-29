package abci

import (
	"encoding/json"
	"fmt"
	"time"

	"cosmossdk.io/log"
	"cosmossdk.io/math"
	abci "github.com/cometbft/cometbft/abci/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"golang.org/x/sync/errgroup"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle/keeper"
)

type VoteExtHandler struct {
	logger          log.Logger
	currentBlock    int64                            // current block height
	lastPriceSyncTS time.Time                        // last time we synced prices
	providerTimeout time.Duration                    // timeout for fetching prices from providers
	providers       map[string]Provider              // mapping of provider name to provider (e.g. Binance -> BinanceProvider)
	providerPairs   map[string][]keeper.CurrencyPair // mapping of provider name to supported pairs (e.g. Binance -> [ATOM/USD])

	Keeper keeper.Keeper
}

func NewVoteExtHandler(
	logger log.Logger,
	providerTimeout time.Duration,
	providers map[string]Provider,
	providerPairs map[string][]keeper.CurrencyPair,
	keeper keeper.Keeper,
) *VoteExtHandler {
	return &VoteExtHandler{
		logger:          logger,
		providerTimeout: providerTimeout,
		providers:       providers,
		providerPairs:   providerPairs,
		Keeper:          keeper,
	}
}

// OracleVoteExtension defines the canonical vote extension structure.
type OracleVoteExtension struct {
	Height int64
	Prices map[string]math.LegacyDec
}

func (h *VoteExtHandler) ExtendVoteHandler() sdk.ExtendVoteHandler {
	return func(ctx sdk.Context, req *abci.RequestExtendVote) (*abci.ResponseExtendVote, error) {
		h.currentBlock = req.Height
		h.lastPriceSyncTS = time.Now()

		h.logger.Info("computing oracle prices for vote extension", "height", req.Height, "time", h.lastPriceSyncTS)

		g := new(errgroup.Group)
		providerAgg := NewProviderAggregator()

		// How an application determines which providers to use and for which pairs
		// can be done in a variety of ways. For demo purposes, we presume they are
		// locally configured. However, providers can be governed by governance.
		for providerName, currencyPairs := range h.providerPairs {
			providerName := providerName
			currencyPairs := currencyPairs
			priceProvider := h.providers[providerName]

			// Launch a goroutine to fetch ticker prices from this oracle provider.
			// Recall, vote extensions are not required to be deterministic.
			g.Go(func() error {
				doneCh := make(chan bool, 1)
				errCh := make(chan error, 1)

				var (
					prices map[string]keeper.TickerPrice
					err    error
				)

				go func() {
					prices, err = priceProvider.GetTickerPrices(currencyPairs...)
					if err != nil {
						h.logger.Error("failed to fetch ticker prices from provider", "provider", providerName, "err", err)
						errCh <- err
					}

					doneCh <- true
				}()

				select {
				case <-doneCh:
					break

				case err := <-errCh:
					return err

				case <-time.After(h.providerTimeout):
					return fmt.Errorf("provider %s timed out", providerName)
				}

				// aggregate and collect prices based on the base currency per provider
				for _, pair := range currencyPairs {
					success := providerAgg.SetProviderTickerPricesAndCandles(providerName, prices, pair)
					if !success {
						return fmt.Errorf("failed to find any exchange rates in provider responses")
					}
				}

				return nil
			})
		}

		if err := g.Wait(); err != nil {
			// We failed to get some or all prices from providers. In the case that
			// all prices fail, computeOraclePrices below will return an error.
			h.logger.Error("failed to get ticker prices", "err", err)
		}

		computedPrices, err := h.computeOraclePrices(providerAgg)
		if err != nil {
			// NOTE: The Cosmos SDK will ensure any error returned is captured and
			// logged. We can return nil here to indicate we do not want to produce
			// a vote extension, and thus an empty vote extension will be provided
			// automatically to CometBFT.
			return nil, err
		}

		for _, cp := range h.Keeper.GetSupportedPairs(ctx) {
			if _, ok := computedPrices[cp.Base]; !ok {
				// In the case where we fail to retrieve latest prices for a supported
				// pair, applications may have different strategies. For example, they
				// may ignore this situation entirely and rely on stale prices, or they
				// may choose to not produce a vote and instead error. We perform the
				// latter here.
				return nil, fmt.Errorf("failed to find price for %s", cp.Base)
			}
		}

		// produce a canonical vote extension
		voteExt := OracleVoteExtension{
			Height: req.Height,
			Prices: computedPrices,
		}

		h.logger.Info("computed prices", "prices", computedPrices)

		// NOTE: We use stdlib JSON encoding, but an application may choose to use
		// a performant mechanism. This is for demo purposes only.
		bz, err := json.Marshal(voteExt)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal vote extension: %w", err)
		}

		return &abci.ResponseExtendVote{VoteExtension: bz}, nil
	}
}

func (h *VoteExtHandler) VerifyVoteExtensionHandler() sdk.VerifyVoteExtensionHandler {
	return func(ctx sdk.Context, req *abci.RequestVerifyVoteExtension) (*abci.ResponseVerifyVoteExtension, error) {
		var voteExt OracleVoteExtension

		err := json.Unmarshal(req.VoteExtension, &voteExt)
		if err != nil {
			// NOTE: It is safe to return an error as the Cosmos SDK will capture all
			// errors, log them, and reject the proposal.
			return nil, fmt.Errorf("failed to unmarshal vote extension: %w", err)
		}

		if voteExt.Height != req.Height {
			return nil, fmt.Errorf("vote extension height does not match request height; expected: %d, got: %d", req.Height, voteExt.Height)
		}

		// Verify incoming prices from a validator are valid. Note, verification during
		// VerifyVoteExtensionHandler MUST be deterministic. For brevity and demo
		// purposes, we omit implementation.
		if err := h.verifyOraclePrices(ctx, voteExt.Prices); err != nil {
			return nil, fmt.Errorf("failed to verify oracle prices from validator %X: %w", req.ValidatorAddress, err)
		}

		return &abci.ResponseVerifyVoteExtension{Status: abci.ResponseVerifyVoteExtension_ACCEPT}, nil
	}
}

func (h *VoteExtHandler) computeOraclePrices(providerAgg *ProviderAggregator) (prices map[string]math.LegacyDec, err error) {
	// Compute TVWAP based on candles or VWAP based on prices. For brevity and
	// demo purposes, we omit implementation.
	prices = make(map[string]math.LegacyDec)
	for k, v := range providerAgg.providerPrices["mock"] {
		prices[k] = v.Price
	}

	return prices, err
}

func (h *VoteExtHandler) verifyOraclePrices(ctx sdk.Context, prices map[string]math.LegacyDec) error {
	return nil
}
