---
order: 17
---

# Genesis Exercise Part two

This is part two of the Genesis, here we will setting the `InitGenesis()` and `ExportGenesis()`.

- This genesis file will live at the root level of the module.
  These two functions help with starting a new chain and exporting state of a running application.

For the `InitGenesis` function, we need to loop through the data which is passed into the function and set it to state.

```go
func InitGenesis(ctx sdk.Context, k Keeper, data GenesisState) []abci.ValidatorUpdate {

  return []abci.ValidatorUpdate{}
}
```

For the `ExportGenesis` function we have to do the opposite, iterate through the application state, and return it to be written to the exported file.

```go
func ExportGenesis(ctx sdk.Context, k Keeper) GenesisState {

	return GenesisState{AuctionRecords: auctions} // this is the Genesis state that
}
```

### The next page will consist of the answer.
