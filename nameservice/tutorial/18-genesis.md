---
order: 18
---

# Genesis

The AppModule interface includes a number of functions for use in initializing and exporting GenesisState for the chain. The `ModuleBasicManager` calls these functions on each module when starting, stopping or exporting the chain. Here is a very basic implementation that you can expand upon.

Go to `x/nameservice/genesis.go` and you will see that a few things are missing. We have to fill them in according to the needs of the module. Below you will see what is missing:

<<< @/nameservice/x/nameservice/genesis.go

Next we will define what the genesis state will be, the default genesis and a way to validate it so we don't run into any errors when we start the chain with preexisting state.

<<< @/nameservice/x/nameservice/types/genesis.go

A few notes about the above code:

- `ValidateGenesis()` validates the provided genesis state to ensure that expected invariants hold
- `DefaultGenesisState()` is used mostly for testing. This provides a minimal GenesisState.
- `InitGenesis()` is called on chain start, this function imports genesis state into the keeper.
- `ExportGenesis()` is called after stopping the chain, this function loads application state into a GenesisState struct to later be exported to `genesis.json` alongside data from the other modules.

### Now your module has everything it needs to be incorporated into your Cosmos SDK application.
