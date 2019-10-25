---
order: 14
---

# Queriers

Within `internal/` another file is needed in order to query the data that is in the blockchain. Create a `querier.go` file and set your imports to be:

```go
package keeper

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-application-tutorial/auction/x/auction/internal/types"
	abci "github.com/tendermint/tendermint/abci/types"
)
```

Now you will be defining a `NewQuerier` this is primarily about routing your query requests to the appropriate function to retrieve your data.
Below you will see how to create your new querier, for now within the switch statement does not have any cases but this will expand as we add new functions.

```go
func NewQuerier(keeper Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) (res []byte, err sdk.Error) {
		switch path[0] {
		default:
			return nil, sdk.ErrUnknownRequest("unknown auction query endpoint")
		}
	}
}
```

First we must define a function to get a specific auction.

- For this we can use the methods we defined in the keeper to get the auction.
- The bottom part of the function will primarily stay the same throughout querys

```go
func queryAuction(ctx sdk.Context, path []string, req abci.RequestQuery, keeper Keeper) ([]byte, sdk.Error) {

	res, err := codec.MarshalJSONIndent(keeper.cdc, auction)
	if err != nil {
		panic("could not marshal result to JSON")
	}
	return res, nil
}
```

Next we also need a function to query all the available auctions.

> It will be similar to the function above, but will not receive a path
