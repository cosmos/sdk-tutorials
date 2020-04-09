package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-tutorials/nameservice/x/nameservice/types"
)

// Keeper maintains the link to storage and exposes getter/setter methods for the various parts of the state machine
type Keeper struct {
	CoinKeeper types.BankKeeper

	storeKey sdk.StoreKey // Unexposed key to access store from sdk.Context

	cdc *codec.Codec // The wire codec for binary encoding/decoding.
}

// NewKeeper creates new instances of the nameservice Keeper
func NewKeeper(cdc *codec.Codec, storeKey sdk.StoreKey, coinKeeper types.BankKeeper) Keeper {
	return Keeper{
		cdc:        cdc,
		storeKey:   storeKey,
		CoinKeeper: coinKeeper,
	}
}

// Gets the entire Whois metadata struct for a name
func (k Keeper) GetWhois(ctx sdk.Context, name string) types.Whois {
	store := ctx.KVStore(k.storeKey)

	if !k.IsNamePresent(ctx, name) {
		return types.NewWhois()
	}

	bz := store.Get([]byte(name))

	var whois types.Whois

	k.cdc.MustUnmarshalBinaryBare(bz, &whois)

	return whois
}

// Sets the entire Whois metadata struct for a name
func (k Keeper) SetWhois(ctx sdk.Context, name string, whois types.Whois) {
	if whois.Owner.Empty() {
		return
	}

	store := ctx.KVStore(k.storeKey)

	store.Set([]byte(name), k.cdc.MustMarshalBinaryBare(whois))
}

// Deletes the entire Whois metadata struct for a name
func (k Keeper) DeleteWhois(ctx sdk.Context, name string) {
	store := ctx.KVStore(k.storeKey)
	store.Delete([]byte(name))
}

// ResolveName - returns the string that the name resolves to
func (k Keeper) ResolveName(ctx sdk.Context, name string) string {
	return k.GetWhois(ctx, name).Value
}

// SetName - sets the value string that a name resolves to
func (k Keeper) SetName(ctx sdk.Context, name string, value string) {
	whois := k.GetWhois(ctx, name)
	whois.Value = value
	k.SetWhois(ctx, name, whois)
}

// HasOwner - returns whether or not the name already has an owner
func (k Keeper) HasOwner(ctx sdk.Context, name string) bool {
	return !k.GetWhois(ctx, name).Owner.Empty()
}

// GetOwner - get the current owner of a name
func (k Keeper) GetOwner(ctx sdk.Context, name string) sdk.AccAddress {
	return k.GetWhois(ctx, name).Owner
}

// SetOwner - sets the current owner of a name
func (k Keeper) SetOwner(ctx sdk.Context, name string, owner sdk.AccAddress) {
	whois := k.GetWhois(ctx, name)
	whois.Owner = owner
	k.SetWhois(ctx, name, whois)
}

// GetPrice - gets the current price of a name
func (k Keeper) GetPrice(ctx sdk.Context, name string) sdk.Coins {
	return k.GetWhois(ctx, name).Price
}

// SetPrice - sets the current price of a name
func (k Keeper) SetPrice(ctx sdk.Context, name string, price sdk.Coins) {
	whois := k.GetWhois(ctx, name)
	whois.Price = price
	k.SetWhois(ctx, name, whois)
}

// Get an iterator over all names in which the keys are the names and the values are the whois
func (k Keeper) GetNamesIterator(ctx sdk.Context) sdk.Iterator {
	store := ctx.KVStore(k.storeKey)
	return sdk.KVStorePrefixIterator(store, nil)
}

// Check if the name is present in the store or not
func (k Keeper) IsNamePresent(ctx sdk.Context, name string) bool {
	store := ctx.KVStore(k.storeKey)
	return store.Has([]byte(name))
}
