package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	gtypes "github.com/cosmos/sdk-tutorials/hellochain/x/greeter/internal/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

// Keeper maintains the link to data storage and exposes getter/setter methods for the various
// parts of the state machine
type Keeper struct {
	storeKey sdk.StoreKey // Unexposed key to access store from sdk.Context

	cdc *codec.Codec // The wire codec for binary encoding/decoding.
}

// NewKeeper creates new instances of the greeter Keeper
func NewKeeper(storeKey sdk.StoreKey, cdc *codec.Codec) Keeper {
	return Keeper{
		storeKey: storeKey,
		cdc:      cdc,
	}
}

// GetGreetings returns the greetings for a given address and given sender
func (k Keeper) GetGreetings(ctx sdk.Context, addr sdk.AccAddress, from sdk.Address) gtypes.GreetingsList {
	store := ctx.KVStore(k.storeKey)
	if !store.Has([]byte(addr)) {
		return gtypes.GreetingsList{}
	}
	bz := store.Get([]byte(addr))
	var list gtypes.GreetingsList
	k.cdc.MustUnmarshalBinaryBare(bz, &list)

	if from != nil {
		// return only those from specified sender
		var fromList gtypes.GreetingsList
		for _, g := range list {
			if g.Sender.Equals(from) {
				fromList = append(fromList, g)
			}
		}
		return fromList
	}
	return list
}

// SetGreeting saves a greeting for a given address.
func (k Keeper) SetGreeting(ctx sdk.Context, greeting gtypes.Greeting) {
	if greeting.Sender.Empty() {
		return
	}
	store := ctx.KVStore(k.storeKey)
	list := k.GetGreetings(ctx, greeting.Recipient, nil)
	list = append(list, greeting)
	store.Set(greeting.Recipient.Bytes(), k.cdc.MustMarshalBinaryBare(list))
}

// GetGreetingsIterator returns  an iterator over all names in which the keys
// are the addresses and the values are lists of greetings.
func (k Keeper) GetGreetingsIterator(ctx sdk.Context) sdk.Iterator {
	store := ctx.KVStore(k.storeKey)
	return sdk.KVStorePrefixIterator(store, nil)
}
