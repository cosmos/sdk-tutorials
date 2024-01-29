package abci

import (
	"encoding/json"
	"errors"
	"fmt"

	"cosmossdk.io/log"
	"cosmossdk.io/math"
	abci "github.com/cometbft/cometbft/abci/types"
	cmtproto "github.com/cometbft/cometbft/proto/tendermint/types"
	"github.com/cosmos/cosmos-sdk/baseapp"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle/keeper"
)

// StakeWeightedPrices defines the structure a proposer should use to calculate
// and submit the stake-weighted prices for a given set of supported currency
// pairs, in addition to the vote extensions used to calculate them. This is so
// validators can verify the proposer's calculations.
type StakeWeightedPrices struct {
	StakeWeightedPrices map[string]math.LegacyDec
	ExtendedCommitInfo  abci.ExtendedCommitInfo
}

type ProposalHandler struct {
	logger   log.Logger
	keeper   keeper.Keeper
	valStore baseapp.ValidatorStore
}

func NewProposalHandler(logger log.Logger, keeper keeper.Keeper, valStore baseapp.ValidatorStore) *ProposalHandler {
	return &ProposalHandler{
		logger:   logger,
		keeper:   keeper,
		valStore: valStore,
	}
}

func (h *ProposalHandler) PrepareProposal() sdk.PrepareProposalHandler {
	return func(ctx sdk.Context, req *abci.RequestPrepareProposal) (*abci.ResponsePrepareProposal, error) {
		proposalTxs := req.Txs

		if req.Height >= ctx.ConsensusParams().Abci.VoteExtensionsEnableHeight && ctx.ConsensusParams().Abci.VoteExtensionsEnableHeight != 0 {
			err := baseapp.ValidateVoteExtensions(ctx, h.valStore, req.Height, ctx.ChainID(), req.LocalLastCommit)
			if err != nil {
				return nil, err
			}

			stakeWeightedPrices, err := h.computeStakeWeightedOraclePrices(ctx, req.LocalLastCommit)
			if err != nil {
				return nil, errors.New("failed to compute stake-weighted oracle prices")
			}

			injectedVoteExtTx := StakeWeightedPrices{
				StakeWeightedPrices: stakeWeightedPrices,
				ExtendedCommitInfo:  req.LocalLastCommit,
			}

			// NOTE: We use stdlib JSON encoding, but an application may choose to use
			// a performant mechanism. This is for demo purposes only.
			bz, err := json.Marshal(injectedVoteExtTx)
			if err != nil {
				h.logger.Error("failed to encode injected vote extension tx", "err", err)
				return nil, errors.New("failed to encode injected vote extension tx")
			}

			// Inject a "fake" tx into the proposal s.t. validators can decode, verify,
			// and store the canonical stake-weighted average prices.
			proposalTxs = append(proposalTxs, bz)
		}

		// proceed with normal block proposal construction, e.g. POB, normal txs, etc...

		return &abci.ResponsePrepareProposal{
			Txs: proposalTxs,
		}, nil
	}
}

func (h *ProposalHandler) ProcessProposal() sdk.ProcessProposalHandler {
	return func(ctx sdk.Context, req *abci.RequestProcessProposal) (*abci.ResponseProcessProposal, error) {
		if len(req.Txs) == 0 {
			return &abci.ResponseProcessProposal{Status: abci.ResponseProcessProposal_ACCEPT}, nil
		}

		var injectedVoteExtTx StakeWeightedPrices
		if err := json.Unmarshal(req.Txs[0], &injectedVoteExtTx); err != nil {
			h.logger.Error("failed to decode injected vote extension tx", "err", err)
			return &abci.ResponseProcessProposal{Status: abci.ResponseProcessProposal_REJECT}, nil
		}

		err := baseapp.ValidateVoteExtensions(ctx, h.valStore, req.Height, ctx.ChainID(), injectedVoteExtTx.ExtendedCommitInfo)
		if err != nil {
			return nil, err
		}

		// Verify the proposer's stake-weighted oracle prices by computing the same
		// calculation and comparing the results. We omit verification for brevity
		// and demo purposes.
		stakeWeightedPrices, err := h.computeStakeWeightedOraclePrices(ctx, injectedVoteExtTx.ExtendedCommitInfo)
		if err != nil {
			return &abci.ResponseProcessProposal{Status: abci.ResponseProcessProposal_REJECT}, nil
		}
		if err := compareOraclePrices(injectedVoteExtTx.StakeWeightedPrices, stakeWeightedPrices); err != nil {
			return &abci.ResponseProcessProposal{Status: abci.ResponseProcessProposal_REJECT}, nil
		}

		return &abci.ResponseProcessProposal{Status: abci.ResponseProcessProposal_ACCEPT}, nil
	}
}

func (h *ProposalHandler) PreBlocker(ctx sdk.Context, req *abci.RequestFinalizeBlock) (*sdk.ResponsePreBlock, error) {
	res := &sdk.ResponsePreBlock{}
	if len(req.Txs) == 0 {
		return res, nil
	}

	var injectedVoteExtTx StakeWeightedPrices
	if err := json.Unmarshal(req.Txs[0], &injectedVoteExtTx); err != nil {
		h.logger.Error("failed to decode injected vote extension tx", "err", err)
		return nil, err
	}

	// set oracle prices using the passed in context, which will make these prices available in the current block
	if err := h.keeper.SetOraclePrices(ctx, injectedVoteExtTx.StakeWeightedPrices); err != nil {
		return nil, err
	}

	return res, nil
}

func (h *ProposalHandler) computeStakeWeightedOraclePrices(ctx sdk.Context, ci abci.ExtendedCommitInfo) (map[string]math.LegacyDec, error) {
	requiredPairs := h.keeper.GetSupportedPairs(ctx)
	stakeWeightedPrices := make(map[string]math.LegacyDec, len(requiredPairs)) // base -> average stake-weighted price
	for _, pair := range requiredPairs {
		stakeWeightedPrices[pair.Base] = math.LegacyZeroDec()
	}

	var totalStake int64
	for _, v := range ci.Votes {
		if v.BlockIdFlag != cmtproto.BlockIDFlagCommit {
			continue
		}

		var voteExt OracleVoteExtension
		if err := json.Unmarshal(v.VoteExtension, &voteExt); err != nil {
			h.logger.Error("failed to decode vote extension", "err", err, "validator", fmt.Sprintf("%x", v.Validator.Address))
			return nil, err
		}

		totalStake += v.Validator.Power

		// Compute stake-weighted average of prices for each supported pair, i.e.
		// (P1)(W1) + (P2)(W2) + ... + (Pn)(Wn) / (W1 + W2 + ... + Wn)
		//
		// NOTE: These are the prices computed at the PREVIOUS height, i.e. H-1
		for base, price := range voteExt.Prices {
			// Only compute stake-weighted average for supported pairs.
			//
			// NOTE: VerifyVoteExtension should be sufficient to ensure that only
			// supported pairs are supplied, but we add this here for demo purposes.
			if _, ok := stakeWeightedPrices[base]; ok {
				stakeWeightedPrices[base] = stakeWeightedPrices[base].Add(price.MulInt64(v.Validator.Power))
			}
		}
	}

	if totalStake == 0 {
		return nil, nil
	}

	// finalize average by dividing by total stake, i.e. total weights
	for base, price := range stakeWeightedPrices {
		stakeWeightedPrices[base] = price.QuoInt64(totalStake)
	}

	return stakeWeightedPrices, nil
}

func compareOraclePrices(p1, p2 map[string]math.LegacyDec) error {
	return nil
}
