---
order: 6
---

# The Keeper

The main core of a Cosmos SDK module is a piece called the `Keeper`. It is what handles interaction with the data store, has references to other keepers for cross-module interactions, and contains most of the core functionality of a module.

## Keeper Struct

Your `nameservice.Keeper` should already be defined in the `./x/nameservice/keeper/keeper.go` file. Let's have a short introduction of the `keeper.go` file.

<<< @/nameservice/nameservice/x/nameservice/keeper/keeper.go

A couple of notes about the code:

- Two `cosmos-sdk` packages and `types` for your application are imported:
  - [`types` (as sdk)](https://godoc.org/github.com/cosmos/cosmos-sdk/types) - this contains commonly used types throughout the SDK.
  - `types` - it contains `BankKeeper` you have defined in previous section.
- The `Keeper` struct. In this keeper there are a couple of key pieces:
  - `types.BankKeeper` - This is an interface you had defined on previous section to use `bank` module. Including it allows code in this module to call functions from the `bank` module. The SDK uses an [object capabilities](https://en.wikipedia.org/wiki/Object-capability_model) approach to accessing sections of the application state. This is to allow developers to employ a least authority approach, limiting the capabilities of a faulty or malicious module from affecting parts of state it doesn't need access to.
  - [`*codec.Codec`](https://godoc.org/github.com/cosmos/cosmos-sdk/codec#Codec) - This is a pointer to the codec that is used by Amino to encode and decode binary structs.
  - [`sdk.StoreKey`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#StoreKey) - This is a store key which gates access to a `sdk.KVStore` which persists the state of your application: the Whois struct that the name points to (i.e. `map[name]Whois`).

## Getters and Setters

In our `keeper` directory we find the `whois.go` file which has been created with our `starport type` command.

The `type` command has already scaffolded most of our required getters and setters (CRUD operations) - however, we need to make a few changes, as we are using a `Name` as the key for each `Whois`, which is not defined in the type itself.

We will also be adding functions for getting specific parameters from the store based on the name. However, instead of rewriting the store getters and setters, we reuse the `GetWhois` and `SetWhois` functions.

Afterwards, your `x/nameservice/keeper/whois.go` file should look like this.

<<< @/nameservice/nameservice/x/nameservice/keeper/whois.go

Next, its time to move onto describing how users interact with your new store using `Msgs` and `Handlers`.
