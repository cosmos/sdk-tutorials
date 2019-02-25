# Queriers

Start by creating the `./x/nameservice/querier.go` file. This is the place to define which queries against application state users will be able to make. Your `nameservice` module will expose two queries:

- `resolve`: This takes a `name` and returns the `value` that is stored by the `nameservice`. This is similar to a DNS query.
- `whois`: This takes a `name` and returns the `price`, `value`, and `owner` of the name. Used for figuring out how much names cost when you want to buy them.

Start by defining the `NewQuerier` function which acts as a sub-router for queries to this module (similar the `NewHandler` function). Note that because there isn't an interface similar to `Msg` for queries, you need to manually define switch statement cases (they can't be pulled off of the query `.Route()` function):

```go
package nameservice

import (
	"github.com/cosmos/cosmos-sdk/codec"

	sdk "github.com/cosmos/cosmos-sdk/types"
	abci "github.com/tendermint/tendermint/abci/types"
)

// query endpoints supported by the nameservice Querier
const (
	QueryResolve = "resolve"
	QueryWhois   = "whois"
)

// NewQuerier is the module level router for state queries
func NewQuerier(keeper Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) (res []byte, err sdk.Error) {
		switch path[0] {
		case QueryResolve:
			return queryResolve(ctx, path[1:], req, keeper)
		case QueryWhois:
			return queryWhois(ctx, path[1:], req, keeper)
		default:
			return nil, sdk.ErrUnknownRequest("unknown nameservice query endpoint")
		}
	}
}
```

Now that the router is defined, define the inputs and responses for each query:

```go
// nolint: unparam
func queryResolve(ctx sdk.Context, path []string, req abci.RequestQuery, keeper Keeper) (res []byte, err sdk.Error) {
	name := path[0]

	value := keeper.ResolveName(ctx, name)

	if value == "" {
		return []byte{}, sdk.ErrUnknownRequest("could not resolve name")
	}

	return []byte(value), nil
}

// nolint: unparam
func queryWhois(ctx sdk.Context, path []string, req abci.RequestQuery, keeper Keeper) (res []byte, err sdk.Error) {
	name := path[0]

	whois := Whois{}

	whois.Value = keeper.ResolveName(ctx, name)
	whois.Owner = keeper.GetOwner(ctx, name)
	whois.Price = keeper.GetPrice(ctx, name)

	bz, err2 := codec.MarshalJSONIndent(keeper.cdc, whois)
	if err2 != nil {
		panic("could not marshal result to JSON")
	}

	return bz, nil
}

// Whois represents a name -> value lookup
type Whois struct {
	Value string         `json:"value"`
	Owner sdk.AccAddress `json:"owner"`
	Price sdk.Coins      `json:"price"`
}
```

Notes on the above code:

- Here your `Keeper`'s getters and setters come into heavy use. When building any other applications that use this module you may need to go back and define more getters/setters to access the pieces of state you need.
- If your application needs some custom response types (`Whois` in this example), define them in this file.

### Now that you have ways to mutate and view your module state it's time to put the finishing touches on it! Register your types in the [Amino encoding format next](./codec.md)!
