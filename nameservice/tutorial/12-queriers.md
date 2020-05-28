---
order: 12
---

# Queriers

## Query Types

Start by navigating to `./x/nameservice/types/querier.go` file. This is where you will define your querier types.

<<< @/nameservice/x/nameservice/types/querier.go

## Querier

Now you can navigate to the `./x/nameservice/keeper/querier.go` file. This is the place to define which queries against application state users will be able to make. Your `nameservice` module will expose three queries:

- `resolve`: This takes a `name` and returns the `value` that is stored by the `nameservice`. This is similar to a DNS query.
- `whois`: This takes a `name` and returns the `price`, `value`, and `owner` of the name. Used for figuring out how much names cost when you want to buy them.
- `name` : This does not take a parameter, it returns all the names stored in the `nameservice` store.

You will see `NewQuerier` already defined, this function acts as a sub-router for queries to this module (similar the `NewHandler` function). Note that because there isn't an interface similar to `Msg` for queries, you need to manually define switch statement cases (they can't be pulled off of the query `.Route()` function):

```go
package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/sdk-tutorials/nameservice/x/nameservice/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
	abci "github.com/tendermint/tendermint/abci/types"
)

// query endpoints supported by the nameservice Querier
const (
	QueryResolve = "resolve"
	QueryWhois   = "whois"
	QueryNames   = "names"
)

// NewQuerier is the module level router for state queries
func NewQuerier(keeper Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) (res []byte, err error) {
		switch path[0] {
		case QueryResolve:
			return queryResolve(ctx, path[1:], req, keeper)
		case QueryWhois:
			return queryWhois(ctx, path[1:], req, keeper)
		case QueryNames:
			return queryNames(ctx, req, keeper)
		default:
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "unknown nameservice query endpoint")
		}
	}
}
```

Now that the router is defined, define the inputs and responses for each query:

```go
// nolint: unparam
func queryResolve(ctx sdk.Context, path []string, req abci.RequestQuery, keeper Keeper) ([]byte, error) {
	value := keeper.ResolveName(ctx, path[0])

	if value == "" {
		return []byte{}, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "could not resolve name")
	}

	res, err := codec.MarshalJSONIndent(keeper.cdc, types.QueryResResolve{Value: value})
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}

// nolint: unparam
func queryWhois(ctx sdk.Context, path []string, req abci.RequestQuery, keeper Keeper) ([]byte, error) {
	whois := keeper.GetWhois(ctx, path[0])

	res, err := codec.MarshalJSONIndent(keeper.cdc, whois)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}

func queryNames(ctx sdk.Context, req abci.RequestQuery, keeper Keeper) ([]byte, error) {
	var namesList types.QueryResNames

	iterator := keeper.GetNamesIterator(ctx)

	for ; iterator.Valid(); iterator.Next() {
		namesList = append(namesList, string(iterator.Key()))
	}

	res, err := codec.MarshalJSONIndent(keeper.cdc, namesList)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}
```

Notes on the above code:

- Here your `Keeper`'s getters and setters come into heavy use. When building any other applications that use this module you may need to go back and define more getters/setters to access the pieces of state you need.
- By convention, each output type should be something that is both JSON marshalable and stringable (implements the Golang `fmt.Stringer` interface). The returned bytes should be the JSON encoding of the output result.
  - So for the output type of `resolve` we wrap the resolution string in a struct called `QueryResResolve` which is both JSON marshalable and has a `.String()` method.
  - For the output of Whois, the normal Whois struct is already JSON marshalable, but we need to add a `.String()` method on it.
  - Same for the output of a names query, a `[]string` is already natively marshalable, but we want to add a `.String()` method on it.
- The type Whois is not defined in the `./x/nameservice/types/querier.go` file because it is created in the `./x/nameservice/types/types.go` file.

### Now that you have ways to mutate and view your module state it's time to put the finishing touches on it! Define the variables and types you would like to bring to the top level of the module.
