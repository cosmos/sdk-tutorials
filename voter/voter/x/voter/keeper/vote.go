package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-tutorials/voter/voter/x/voter/types"
)

func (k Keeper) CreateVote(ctx sdk.Context, vote types.Vote) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.VotePrefix + vote.PollID + "-" + string(vote.Creator))
	value := k.cdc.MustMarshalBinaryLengthPrefixed(vote)
	store.Set(key, value)
}

func listVote(ctx sdk.Context, k Keeper) ([]byte, error) {
	var voteList []types.Vote
	store := ctx.KVStore(k.storeKey)
	iterator := sdk.KVStorePrefixIterator(store, []byte(types.VotePrefix))
	for ; iterator.Valid(); iterator.Next() {
		var vote types.Vote
		k.cdc.MustUnmarshalBinaryLengthPrefixed(store.Get(iterator.Key()), &vote)
		voteList = append(voteList, vote)
	}
	res := codec.MustMarshalJSONIndent(k.cdc, voteList)
	return res, nil
}
