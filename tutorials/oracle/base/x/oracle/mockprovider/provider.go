package mockprovider

import (
	"cosmossdk.io/math"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle/keeper"
)

type Provider interface {
	GetTickerPrices(...keeper.CurrencyPair) (map[string]keeper.TickerPrice, error)
}

var _ Provider = MockProvider{}

type MockProvider struct{}

func NewMockProvider() MockProvider {
	return MockProvider{}
}

func (p MockProvider) GetTickerPrices(pairs ...keeper.CurrencyPair) (map[string]keeper.TickerPrice, error) {
	tickers := map[string]keeper.TickerPrice{}
	for _, p := range pairs {

		pair := p.String()
		price := math.LegacyNewDec(0)
		switch pair {
		case "ATOMUSD":
			price = math.LegacyNewDec(10)
		case "OSMOUSD":
			price = math.LegacyNewDec(2)
		}

		tickers[pair] = keeper.TickerPrice{
			Price:  price,
			Volume: math.LegacyNewDec(10000000),
		}
	}

	return tickers, nil
}
