package keeper

import (
	"encoding/binary"
	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/user/planet/x/blog/types"
	"strconv"
)

// GetPostCount get the total number of TypeName.LowerCamel
func (k Keeper) GetPostCount(ctx sdk.Context) uint64 {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostCountKey))
	byteKey := types.KeyPrefix(types.PostCountKey)
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

// SetPostCount set the total number of post
func (k Keeper) SetPostCount(ctx sdk.Context, count uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostCountKey))
	byteKey := types.KeyPrefix(types.PostCountKey)
	bz := []byte(strconv.FormatUint(count, 10))
	store.Set(byteKey, bz)
}

// AppendPost appends a post in the store with a new id and update the count
func (k Keeper) AppendPost(
	ctx sdk.Context,
	post types.Post,
) uint64 {
	// Create the post
	count := k.GetPostCount(ctx)

	// Set the ID of the appended value
	post.Id = count

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	appendedValue := k.cdc.MustMarshalBinaryBare(&post)
	store.Set(GetPostIDBytes(post.Id), appendedValue)

	// Update post count
	k.SetPostCount(ctx, count+1)

	return count
}

// SetPost set a specific post in the store
func (k Keeper) SetPost(ctx sdk.Context, post types.Post) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	b := k.cdc.MustMarshalBinaryBare(&post)
	store.Set(GetPostIDBytes(post.Id), b)
}

// GetPost returns a post from its id
func (k Keeper) GetPost(ctx sdk.Context, id uint64) types.Post {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	var post types.Post
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetPostIDBytes(id)), &post)
	return post
}

// HasPost checks if the post exists in the store
func (k Keeper) HasPost(ctx sdk.Context, id uint64) bool {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	return store.Has(GetPostIDBytes(id))
}

// GetPostOwner returns the creator of the
func (k Keeper) GetPostOwner(ctx sdk.Context, id uint64) string {
	return k.GetPost(ctx, id).Creator
}

// RemovePost removes a post from the store
func (k Keeper) RemovePost(ctx sdk.Context, id uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	store.Delete(GetPostIDBytes(id))
}

// GetAllPost returns all post
func (k Keeper) GetAllPost(ctx sdk.Context) (list []types.Post) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	iterator := sdk.KVStorePrefixIterator(store, []byte{})

	defer iterator.Close()

	for ; iterator.Valid(); iterator.Next() {
		var val types.Post
		k.cdc.MustUnmarshalBinaryBare(iterator.Value(), &val)
		list = append(list, val)
	}

	return
}

// GetPostIDBytes returns the byte representation of the ID
func GetPostIDBytes(id uint64) []byte {
	bz := make([]byte, 8)
	binary.BigEndian.PutUint64(bz, id)
	return bz
}

// GetPostIDFromBytes returns ID in uint64 format from a byte array
func GetPostIDFromBytes(bz []byte) uint64 {
	return binary.BigEndian.Uint64(bz)
}
