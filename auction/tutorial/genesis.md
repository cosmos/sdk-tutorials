---
order: 10
---

# Genesis Exercise

In this exercise you will be creating you Genesis state for your module. The `ModuleBasicManager` calls this function on each module when initializing the chain. This module consists of an array of auctions, within these auctions we must validate they adhere to the sanity check, make sure all the fields are populated as expected.

Start by creating the `types/genesis.go` file.

1. You must first define your type for genesis state, this type is required to be called `GenesisState`.
2. Create a constructor for this type, this was done in the messages section if you would like to double check how to do it.

- The constructor will return the type but within the type the value will be nil in our case.

3. Loop through the auctions in order to check that all of them have valid fields, within the `ValidateGenesis()` function.

### The next page will consist of the answer.
