package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-tutorials/voter/voter/x/voter/types"
)

func (k Keeper) CreatePoll(ctx sdk.Context, poll types.Poll) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.PollPrefix + poll.ID)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(poll)
	store.Set(key, value)
}

func listPoll(ctx sdk.Context, k Keeper) ([]byte, error) {
	var pollList []types.Poll
	store := ctx.KVStore(k.storeKey)
	iterator := sdk.KVStorePrefixIterator(store, []byte(types.PollPrefix))
	for ; iterator.Valid(); iterator.Next() {
		var poll types.Poll
		k.cdc.MustUnmarshalBinaryLengthPrefixed(store.Get(iterator.Key()), &poll)
		pollList = append(pollList, poll)
	}
	res := codec.MustMarshalJSONIndent(k.cdc, pollList)
	return res, nil
}
