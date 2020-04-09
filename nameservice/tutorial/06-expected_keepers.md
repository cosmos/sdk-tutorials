---
order: 6
---

# Expected Keepers

Next create a file within the `/types` directory called `expected_keepers.go`. In this file we will be defining what we expect other modules to have.

For example in the nameservice module we will be using the bank module to facilitate transfers between two parties. To make this happen we will rely on two functions from the bank module.

- `SubtractCoins(ctx sdk.Context, addr sdk.AccAddress, amt sdk.Coins) (sdk.Coins, error)`
- `SendCoins(ctx sdk.Context, fromAddr sdk.AccAddress, toAddr sdk.AccAddress, amt sdk.Coins) error`

you can see below how the file is structured below:

<<< @/nameservice/x/nameservice/types/expected_keepers.go
