package abci

import (
	"sync"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle/keeper"
)

// Provider defines an interface for fetching prices and candles for a given set
// of currency pairs. The provider is presumed to be a trusted source of prices.
type Provider interface {
	GetTickerPrices(...keeper.CurrencyPair) (map[string]keeper.TickerPrice, error)
}

// ProviderAggregator is a simple aggregator for provider prices and candles.
// It is thread-safe since it is assumed to be called concurrently in price
// fetching goroutines, i.e. ExtendVote.
type ProviderAggregator struct {
	mtx sync.Mutex

	providerPrices keeper.AggregatedProviderPrices
}

func NewProviderAggregator() *ProviderAggregator {
	return &ProviderAggregator{
		providerPrices: make(keeper.AggregatedProviderPrices),
	}
}

func (p *ProviderAggregator) SetProviderTickerPricesAndCandles(
	providerName string,
	prices map[string]keeper.TickerPrice,
	pair keeper.CurrencyPair,
) bool {
	p.mtx.Lock()
	defer p.mtx.Unlock()

	// set prices and candles for this provider if we haven't seen it before
	if _, ok := p.providerPrices[providerName]; !ok {
		p.providerPrices[providerName] = make(map[string]keeper.TickerPrice)
	}

	// set price for provider/base (e.g. Binance -> ATOM -> 11.98)
	tp, pricesOk := prices[pair.String()]
	if pricesOk {
		p.providerPrices[providerName][pair.Base] = tp
	}

	// return true if we set at least one price
	return pricesOk
}
