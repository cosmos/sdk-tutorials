# The Keeper

The main core of a Cosmos SDK module is a piece called the `Keeper`. It is what handles interaction with the store, has references to other keepers for cross-module interactions, and contains most of the core functionality of a module.

Begin by creating the file `./x/nameservice/keeper.go` to hold the keeper for your module. In Cosmos SDK applications, the convention is that modules live in the `./x/` folder.

## Keeper Struct

To start your SDK module, define your `nameservice.Keeper` in the `./x/nameservice/keeper.go` file:

```go
package nameservice

import (
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/x/bank"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

// Keeper maintains the link to data storage and exposes getter/setter methods for the various parts of the state machine
type Keeper struct {
	coinKeeper bank.Keeper

	namesStoreKey  sdk.StoreKey // Unexposed key to access name store from sdk.Context
	ownersStoreKey sdk.StoreKey // Unexposed key to access owners store from sdk.Context
	pricesStoreKey sdk.StoreKey // Unexposed key to access prices store from sdk.Context

	cdc *codec.Codec // The wire codec for binary encoding/decoding.
}
```

A couple of notes about the above code:

* 3 different `cosmos-sdk` packages are imported:
	- [`codec`](https://godoc.org/github.com/cosmos/cosmos-sdk/codec) - the `codec` provides tools to work with the Cosmos encoding format, [Amino](https://github.com/tendermint/go-amino).
	- [`bank`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/bank) - the `bank` module controls accounts and coin transfers.
	- [`types`](https://godoc.org/github.com/cosmos/cosmos-sdk/types) - `types` contains commonly used types throughout the SDK.
* The `Keeper` struct. In this keeper there are a couple of key pieces:
	- [`bank.Keeper`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/bank#Keeper) - This is a reference to the `Keeper` from the `bank` module. Including it allows code in this module to call functions from the `bank` module. The SDK uses an [object capabilities](https://en.wikipedia.org/wiki/Object-capability_model) approach to accessing sections of the application state. This is to allow developers to employ a least authority approach, limiting the capabilities of a faulty or malicious module from affecting parts of state it doesn't need access to.
	- [`*codec.Codec`](https://godoc.org/github.com/cosmos/cosmos-sdk/codec#Codec) - This is a pointer to the codec that is used by Amino to encode and decode binary structs.
	- [`sdk.StoreKey`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#StoreKey) -  This gates access to a `sdk.KVStore` that persists the state of your application.
* This module has 3 store keys:
	- `namesStoreKey` - This is the main store that stores the value string that the name points to (i.e. `map[name]value`).
	- `ownersStoreKey` - This store contains the current owner of any given name (i.e. `map[name]sdk_address`).
	- `pricesStoreKey` - This store contains the price that the current owner paid for a given name. Anyone buying this name must spend more than the current owner. (i.e. `map[name]price`).

## Getters and Setters

Now it is time to add methods to interact with the stores through the `Keeper`. First, add a function to set the string a given name resolves to:

```go
// SetName - sets the value string that a name resolves to
func (k Keeper) SetName(ctx sdk.Context, name string, value string) {
	store := ctx.KVStore(k.namesStoreKey)
	store.Set([]byte(name), []byte(value))
}
```

In this method, first get the store object for the `map[name]value` using the the `namesStoreKey` from the `Keeper`.

> _*NOTE*_: This function uses the [`sdk.Context`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#Context). This object holds functions to access a number of important pieces of the state like `blockHeight` and `chainID`.

Next, you insert the `<name, value>` pair into the store using its `.Set([]byte, []byte)` method.  As the store only takes `[]byte`, first cast the `string`s to `[]byte` and the use them as parameters into the `Set` method.

Next, add a method to resolve the names (i.e. look up the `value` for the `name`):

```go
// ResolveName - returns the string that the name resolves to
func (k Keeper) ResolveName(ctx sdk.Context, name string) string {
	store := ctx.KVStore(k.namesStoreKey)
	bz := store.Get([]byte(name))
	return string(bz)
}
```

Here, like in the `SetName` method, first access the store using the `StoreKey`.  Next, instead of using the `Set` method on the store key, use the `.Get([]byte) []byte` method. As the parameter into the function, pass the key, which is the `name` string casted to `[]byte`, and get back the result in the form of `[]byte`. Cast this to a `string` and return the result.

Add similar functions for getting and setting name owners:

```go
// HasOwner - returns whether or not the name already has an owner
func (k Keeper) HasOwner(ctx sdk.Context, name string) bool {
	store := ctx.KVStore(k.ownersStoreKey)
	bz := store.Get([]byte(name))
	return bz != nil
}

// GetOwner - get the current owner of a name
func (k Keeper) GetOwner(ctx sdk.Context, name string) sdk.AccAddress {
	store := ctx.KVStore(k.ownersStoreKey)
	bz := store.Get([]byte(name))
	return bz
}

// SetOwner - sets the current owner of a name
func (k Keeper) SetOwner(ctx sdk.Context, name string, owner sdk.AccAddress) {
	store := ctx.KVStore(k.ownersStoreKey)
	store.Set([]byte(name), owner)
}
```

Notes on the above code:
- Instead of accessing the the data from the `namesStoreKey` store, get it from the `ownersStoreKey` store.  
- Because `sdk.AccAddress` is a type alias for `[]byte`, it can natively be casted to it.  
- There is an extra function, `HasOwner` that is a convenience to be used in conditional statements.

Finally, add a getter and setter for the price of a name:

```go
// GetPrice - gets the current price of a name.  If price doesn't exist yet, set to 1mycoin.
func (k Keeper) GetPrice(ctx sdk.Context, name string) sdk.Coins {
	if !k.HasOwner(ctx, name) {
		return sdk.Coins{sdk.NewInt64Coin("mycoin", 1)}
	}
	store := ctx.KVStore(k.pricesStoreKey)
	bz := store.Get([]byte(name))
	var price sdk.Coins
	k.cdc.MustUnmarshalBinaryBare(bz, &price)
	return price
}

// SetPrice - sets the current price of a name
func (k Keeper) SetPrice(ctx sdk.Context, name string, price sdk.Coins) {
	store := ctx.KVStore(k.pricesStoreKey)
	store.Set([]byte(name), k.cdc.MustMarshalBinaryBare(price))
}
```

Notes on the above code:
- `sdk.Coins` does not have its own bytes encoding, which means the price needs to be marsalled and unmarshalled using [Amino](https://github.com/tendermint/go-amino/) to be inserted or removed from the store.
- When getting the price for a name that has no owner (and thus no price), return `1mycoin` as the price.

The last piece of code needed in the `./x/nameservice/keeper.go` file is a constructor function for `Keeper`:

```go
// NewKeeper creates new instances of the nameservice Keeper
func NewKeeper(coinKeeper bank.Keeper, namesStoreKey sdk.StoreKey, ownersStoreKey sdk.StoreKey, priceStoreKey sdk.StoreKey, cdc *codec.Codec) Keeper {
	return Keeper{
		coinKeeper:     coinKeeper,
		namesStoreKey:  namesStoreKey,
		ownersStoreKey: ownersStoreKey,
		pricesStoreKey: priceStoreKey,
		cdc:            cdc,
	}
}
```

### Next its time to move onto describing how users interact with your new store using [`Msgs` and `Handlers`](./msgs-handlers.md)
