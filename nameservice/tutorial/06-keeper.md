---
order: 6
---

# What is the Keeper

The main core of a Cosmos SDK module is a piece called the `Keeper`. The keeper handles interaction with the data store, has references to other keepers for cross-module interactions, and contains most of the core functionality of a module.

## The Keeper Struct

Your `nameservice.Keeper` should already be defined in the `./x/nameservice/keeper/keeper.go` file. A short introduction of the `keeper.go` file.

```go
package keeper

import (
	"fmt"

	"github.com/tendermint/tendermint/libs/log"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/username/nameservice/x/nameservice/types"
)

type (
	Keeper struct {
		cdc      codec.Marshaler
		storeKey sdk.StoreKey
		memKey   sdk.StoreKey
	}
)

func NewKeeper(cdc codec.Marshaler, storeKey, memKey sdk.StoreKey) *Keeper {
	return &Keeper{
		cdc:      cdc,
		storeKey: storeKey,
		memKey:   memKey,
	}
}

func (k Keeper) Logger(ctx sdk.Context) log.Logger {
	return ctx.Logger().With("module", fmt.Sprintf("x/%s", types.ModuleName))
}

```

A couple of notes about the code:

- Two `cosmos-sdk` packages and `types` for your application are imported:
  - [`types` (as sdk)](https://godoc.org/github.com/cosmos/cosmos-sdk/types) - this contains commonly used types throughout the SDK.
  - `types` - it contains `BankKeeper` you have defined in previous section.
- The `Keeper` struct. In this keeper there are a couple of key pieces:
  - `types.BankKeeper` - This is an interface you had defined on previous section to use `bank` module. Including it allows code in this module to call functions from the `bank` module. The SDK uses an [object capabilities](https://en.wikipedia.org/wiki/Object-capability_model) approach to accessing sections of the application state. This is to allow developers to employ a least authority approach, limiting the capabilities of a faulty or malicious module from affecting parts of state it doesn't need access to.
  - [`*codec.Codec`](https://godoc.org/github.com/cosmos/cosmos-sdk/codec#Codec) - This is a pointer to the codec that is used by Amino to encode and decode binary structs.
  - [`sdk.StoreKey`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#StoreKey) - This is a store key which gates access to a `sdk.KVStore` which persists the state of your application: the Whois struct that the name points to (i.e. `map[name]Whois`).

## Getters and Setters

In the `keeper` directory we find the `whois.go` file which has been created with the `starport type` command.

The `type` command has already scaffolded most of the required getters and setters (CRUD operations) - however, you need to make a few changes, as you are using a `Name` as the key for each `Whois`, which is not defined in the type itself.

Add functions for getting specific parameters from the store based on the name. However, instead of rewriting the store getters and setters, reuse the `GetWhois` and `SetWhois` functions.

Afterwards, your `x/nameservice/keeper/whois.go` file should look like follows.

```go
package keeper

import (
	"encoding/binary"
	"strconv"

	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/username/nameservice/x/nameservice/types"
)

// GetWhoisCount get the total number of whois
func (k Keeper) GetWhoisCount(ctx sdk.Context) uint64 {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisCountKey))
	byteKey := types.KeyPrefix(types.WhoisCountKey)
	bz := store.Get(byteKey)

	// Count doesn't exist: no element
	if bz == nil {
		return 0
	}

	// Parse bytes
	count, err := strconv.ParseUint(string(bz), 10, 64)
	if err != nil {
		// Panic because the count should be always formattable to iint64
		panic("cannot decode count")
	}

	return count
}

// SetWhoisCount set the total number of whois
func (k Keeper) SetWhoisCount(ctx sdk.Context, count uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisCountKey))
	byteKey := types.KeyPrefix(types.WhoisCountKey)
	bz := []byte(strconv.FormatUint(count, 10))
	store.Set(byteKey, bz)
}

// AppendWhois appends a whois in the store with a new id and update the count
func (k Keeper) AppendWhois(
	ctx sdk.Context,
	owner string,
	name string,
	price int32,
) uint64 {
	// Create the whois
	count := k.GetWhoisCount(ctx)
	var whois = types.Whois{
		Owner: owner,
		Id:    count,
		Name:  name,
		Price: price,
	}

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	value := k.cdc.MustMarshalBinaryBare(&whois)
	store.Set(GetWhoisIDBytes(whois.Id), value)

	// Update whois count
	k.SetWhoisCount(ctx, count+1)

	return count
}

// SetWhois sets a whois. We modified this function to use the `name` value as the key instead of msg.ID
func (k Keeper) SetWhois(ctx sdk.Context, name string, whois types.Whois) {

	store := ctx.KVStore(k.storeKey)
	bz := k.cdc.MustMarshalBinaryLengthPrefixed(whois)
	key := []byte(types.WhoisPrefix + name)
	store.Set(key, bz)
}

// GetWhois returns a whois from its id
func (k Keeper) GetWhois(ctx sdk.Context, id uint64) types.Whois {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	var whois types.Whois
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetWhoisIDBytes(id)), &whois)
	return whois
}

// HasWhois checks if the whois exists in the store
func (k Keeper) HasWhois(ctx sdk.Context, id uint64) bool {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	return store.Has(GetWhoisIDBytes(id))
}

// GetWhoisOwner returns the owner of the whois
func (k Keeper) GetWhoisOwner(ctx sdk.Context, id uint64) string {
	return k.GetWhois(ctx, id).Owner
}

// RemoveWhois removes a whois from the store
func (k Keeper) RemoveWhois(ctx sdk.Context, id uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	store.Delete(GetWhoisIDBytes(id))
}

// GetAllWhois returns all whois
func (k Keeper) GetAllWhois(ctx sdk.Context) (list []types.Whois) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	iterator := sdk.KVStorePrefixIterator(store, []byte{})

	defer iterator.Close()

	for ; iterator.Valid(); iterator.Next() {
		var val types.Whois
		k.cdc.MustUnmarshalBinaryBare(iterator.Value(), &val)
		list = append(list, val)
	}

	return
}

// GetWhoisIDBytes returns the byte representation of the ID
func GetWhoisIDBytes(id uint64) []byte {
	bz := make([]byte, 8)
	binary.BigEndian.PutUint64(bz, id)
	return bz
}

// GetWhoisIDFromBytes returns ID in uint64 format from a byte array
func GetWhoisIDFromBytes(bz []byte) uint64 {
	return binary.BigEndian.Uint64(bz)
}

```

Next, its time to move onto describing how users interact with your new store using `Msgs` and `Handlers`.
