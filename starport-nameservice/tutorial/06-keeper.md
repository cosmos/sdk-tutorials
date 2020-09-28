---
order: 6
---

# The Keeper

The main core of a Cosmos SDK module is a piece called the `Keeper`. It is what handles interaction with the store, has references to other keepers for cross-module interactions, and contains most of the core functionality of a module.

## Keeper Struct

To start your SDK module, define your `nameservice.Keeper` in the `./x/nameservice/keeper/keeper.go` file. Defined in this generated file are a few extra items that we will not cover at this time, for this reason we will start by clearing the `keeper.go` file in favor of following this tutorial.

<<< @/starport-nameservice/nameservice/x/nameservice/keeper/keeper.go

A couple of notes about the above code:

- Two `cosmos-sdk` packages and `types` for your application are imported:
  - [`codec`](https://godoc.org/github.com/cosmos/cosmos-sdk/codec) - the `codec` provides tools to work with the Cosmos encoding format, [Amino](https://github.com/tendermint/go-amino).
  - [`types` (as sdk)](https://godoc.org/github.com/cosmos/cosmos-sdk/types) - this contains commonly used types throughout the SDK.
  - `types` - it contains `BankKeeper` you have defined in previous section.
- The `Keeper` struct. In this keeper there are a couple of key pieces:
  - `types.BankKeeper` - This is an interface you had defined previous section to use `bank` module. Including it allows code in this module to call functions from the `bank` module. The SDK uses an [object capabilities](https://en.wikipedia.org/wiki/Object-capability_model) approach to accessing sections of the application state. This is to allow developers to employ a least authority approach, limiting the capabilities of a faulty or malicious module from affecting parts of state it doesn't need access to.
  - [`*codec.Codec`](https://godoc.org/github.com/cosmos/cosmos-sdk/codec#Codec) - This is a pointer to the codec that is used by Amino to encode and decode binary structs.
  - [`sdk.StoreKey`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#StoreKey) - This is a store key which gates access to a `sdk.KVStore` which persists the state of your application: the Whois struct that the name points to (i.e. `map[name]Whois`).

## Getters and Setters

The `type` command has already scaffolded most of our required getters and setters (CRUD operations) - however, we need to make some small changes, as we are using the `Value` as the key rather when storing the `Whois`. After this is done, your `keeper/whois.go` file should look like this - 
<<< @/starport-nameservice/nameservice/x/nameservice/keeper/whois.go{1-89}


Now, we add functions for getting specific parameters from the store based on the name. However, instead of rewriting the store getters and setters, we reuse the `GetWhois` and `SetWhois` functions. For example, to set a field, first we grab the whole `Whois` data, update our specific field, and put the new version back into the store.
<<< @/starport-nameservice/nameservice/x/nameservice/keeper/whois.go{90-134}

Next, its time to move onto describing how users interact with your new store using `Msgs` and `Handlers`.
