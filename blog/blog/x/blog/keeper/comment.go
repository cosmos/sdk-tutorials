package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-tutorials/blog/blog/x/blog/types"
)

func (k Keeper) CreateComment(ctx sdk.Context, comment types.Comment) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.CommentPrefix + comment.ID)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(comment)
	store.Set(key, value)
}

func listComment(ctx sdk.Context, k Keeper) ([]byte, error) {
	var commentList []types.Comment
	store := ctx.KVStore(k.storeKey)
	iterator := sdk.KVStorePrefixIterator(store, []byte(types.CommentPrefix))
	for ; iterator.Valid(); iterator.Next() {
		var comment types.Comment
		k.cdc.MustUnmarshalBinaryLengthPrefixed(store.Get(iterator.Key()), &comment)
		commentList = append(commentList, comment)
	}
	res := codec.MustMarshalJSONIndent(k.cdc, commentList)
	return res, nil
}
