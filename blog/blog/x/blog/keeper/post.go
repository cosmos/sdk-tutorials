package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-tutorials/blog/blog/x/blog/types"
)

func (k Keeper) CreatePost(ctx sdk.Context, post types.Post) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.PostPrefix + post.ID)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(post)
	store.Set(key, value)
}

func listPost(ctx sdk.Context, k Keeper) ([]byte, error) {
	var postList []types.Post
	store := ctx.KVStore(k.storeKey)
	iterator := sdk.KVStorePrefixIterator(store, []byte(types.PostPrefix))
	for ; iterator.Valid(); iterator.Next() {
		var post types.Post
		k.cdc.MustUnmarshalBinaryLengthPrefixed(store.Get(iterator.Key()), &post)
		postList = append(postList, post)
	}
	res := codec.MustMarshalJSONIndent(k.cdc, postList)
	return res, nil
}
