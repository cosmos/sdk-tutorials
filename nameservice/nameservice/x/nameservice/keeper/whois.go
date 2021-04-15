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

// SetWhois set a specific whois in the store
func (k Keeper) SetWhois(ctx sdk.Context, whois types.Whois) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	b := k.cdc.MustMarshalBinaryBare(&whois)
	store.Set(GetWhoisIDBytes(whois.Id), b)
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
