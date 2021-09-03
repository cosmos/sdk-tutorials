package keeper

import (
	"encoding/binary"
	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/user/planet/x/blog/types"
	"strconv"
)

// GetTimedoutPostCount get the total number of TypeName.LowerCamel
func (k Keeper) GetTimedoutPostCount(ctx sdk.Context) uint64 {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.TimedoutPostCountKey))
	byteKey := types.KeyPrefix(types.TimedoutPostCountKey)
	bz := store.Get(byteKey)

	// Count doesn't exist: no element
	if bz == nil {
		return 0
	}

	// Parse bytes
	count, err := strconv.ParseUint(string(bz), 10, 64)
	if err != nil {
		// Panic because the count should be always formattable to uint64
		panic("cannot decode count")
	}

	return count
}

// SetTimedoutPostCount set the total number of timedoutPost
func (k Keeper) SetTimedoutPostCount(ctx sdk.Context, count uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.TimedoutPostCountKey))
	byteKey := types.KeyPrefix(types.TimedoutPostCountKey)
	bz := []byte(strconv.FormatUint(count, 10))
	store.Set(byteKey, bz)
}

// AppendTimedoutPost appends a timedoutPost in the store with a new id and update the count
func (k Keeper) AppendTimedoutPost(
	ctx sdk.Context,
	timedoutPost types.TimedoutPost,
) uint64 {
	// Create the timedoutPost
	count := k.GetTimedoutPostCount(ctx)

	// Set the ID of the appended value
	timedoutPost.Id = count

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.TimedoutPostKey))
	appendedValue := k.cdc.MustMarshalBinaryBare(&timedoutPost)
	store.Set(GetTimedoutPostIDBytes(timedoutPost.Id), appendedValue)

	// Update timedoutPost count
	k.SetTimedoutPostCount(ctx, count+1)

	return count
}

// SetTimedoutPost set a specific timedoutPost in the store
func (k Keeper) SetTimedoutPost(ctx sdk.Context, timedoutPost types.TimedoutPost) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.TimedoutPostKey))
	b := k.cdc.MustMarshalBinaryBare(&timedoutPost)
	store.Set(GetTimedoutPostIDBytes(timedoutPost.Id), b)
}

// GetTimedoutPost returns a timedoutPost from its id
func (k Keeper) GetTimedoutPost(ctx sdk.Context, id uint64) types.TimedoutPost {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.TimedoutPostKey))
	var timedoutPost types.TimedoutPost
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetTimedoutPostIDBytes(id)), &timedoutPost)
	return timedoutPost
}

// HasTimedoutPost checks if the timedoutPost exists in the store
func (k Keeper) HasTimedoutPost(ctx sdk.Context, id uint64) bool {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.TimedoutPostKey))
	return store.Has(GetTimedoutPostIDBytes(id))
}

// GetTimedoutPostOwner returns the creator of the
func (k Keeper) GetTimedoutPostOwner(ctx sdk.Context, id uint64) string {
	return k.GetTimedoutPost(ctx, id).Creator
}

// RemoveTimedoutPost removes a timedoutPost from the store
func (k Keeper) RemoveTimedoutPost(ctx sdk.Context, id uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.TimedoutPostKey))
	store.Delete(GetTimedoutPostIDBytes(id))
}

// GetAllTimedoutPost returns all timedoutPost
func (k Keeper) GetAllTimedoutPost(ctx sdk.Context) (list []types.TimedoutPost) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.TimedoutPostKey))
	iterator := sdk.KVStorePrefixIterator(store, []byte{})

	defer iterator.Close()

	for ; iterator.Valid(); iterator.Next() {
		var val types.TimedoutPost
		k.cdc.MustUnmarshalBinaryBare(iterator.Value(), &val)
		list = append(list, val)
	}

	return
}

// GetTimedoutPostIDBytes returns the byte representation of the ID
func GetTimedoutPostIDBytes(id uint64) []byte {
	bz := make([]byte, 8)
	binary.BigEndian.PutUint64(bz, id)
	return bz
}

// GetTimedoutPostIDFromBytes returns ID in uint64 format from a byte array
func GetTimedoutPostIDFromBytes(bz []byte) uint64 {
	return binary.BigEndian.Uint64(bz)
}
