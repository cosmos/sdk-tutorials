---
order: 12
---

# Keeper Exercise

The keeper is where your business logic is contained. This is the core functionality of your module, it will handle all you interaction with the store, will set up how the module will be called from your `app.go` file.

- Start by creating you `keeper` folder, this will live in `internal` folder as well.

  - The imports for this file can be copied from here:

  ```go
  package keeper

  import (
  "time"

  "github.com/cosmos/cosmos-sdk/codec"
  "github.com/cosmos/cosmos-sdk/types"
  "github.com/cosmos/cosmos-sdk/x/bank"
  "github.com/cosmos/modules/incubator/nft"
  autypes "github.com/cosmos/sdk-tutorials/auction/x/auction/internal/types"
  )
  ```

- Within this folder create `keeper.go`.
- Create a Keeper type, it should be a struct of the module codec, the storeKey and any other modules we want to use (NFT module).
- Create a constructor for this type.

Now we will begin with the business logic. To get started a helpful set of methods to have are a Get, Set, & Delete. In all these functions you first get the store you want to edit or get state from.

```go
store := ctx.KvStore(k.StoreKey)
```

Get method:

Here we want a function to Get our data from the store.

```go
func (k Keeper) Get(ctx types.Context, itemKey string) (types.Item, bool) {
  store := ctx.KVStore(k.StoreKey)
  itemByte := []byte(itemKey)
  // check if the item exists

  // If it does, then get the item and unmarshal it
	bz := store.Get(itemByte)
	var item types.Item
	k.cdc.MustUnmarshalBinaryBare(bz, &item)
  return item, true
}
```

Next we want to be able to set new or update previous data:

```go
func (k Keeper) Set(ctx types.Context, name string, item autypes.Auction) {
	store := ctx.KVStore(k.StoreKey)
	namebyte := []byte(name)
	store.Set(namebyte, k.cdc.MustMarshalBinaryBare(auction))
}
```

A delete method.

```go
func (k Keeper) Delete(ctx types.Context, name string) {
	store := ctx.KVStore(k.StoreKey)
	nameByte := []byte(name)
	store.Delete(nameByte)
}
```

A method to iterate through all the items in the store

```go
// Get an iterator over all names in which the keys are the names and the values are the whois
func (k Keeper) GetItemIterator(ctx types.Context) types.Iterator {
	store := ctx.KVStore(k.StoreKey)
	return types.KVStorePrefixIterator(store, nil)
}
```

Now you will have to implement the business logic for the module.

We need a method to create auctions, one for new bids another to iterate

### On the next page you will find the answers.
