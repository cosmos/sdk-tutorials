package keeper

import (
	"strconv"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/alice/voter/x/voter/types"
	"github.com/cosmos/cosmos-sdk/codec"
)

// GetVoteCount get the total number of vote
func (k Keeper) GetVoteCount(ctx sdk.Context) int64 {
	store := ctx.KVStore(k.storeKey)
	byteKey := []byte(types.VoteCountPrefix)
	bz := store.Get(byteKey)

	// Count doesn't exist: no element
	if bz == nil {
		return 0
	}

	// Parse bytes
	count, err := strconv.ParseInt(string(bz), 10, 64)
	if err != nil {
		// Panic because the count should be always formattable to int64
		panic("cannot decode count")
	}

	return count
}

// SetVoteCount set the total number of vote
func (k Keeper) SetVoteCount(ctx sdk.Context, count int64) {
	store := ctx.KVStore(k.storeKey)
	byteKey := []byte(types.VoteCountPrefix)
	bz := []byte(strconv.FormatInt(count, 10))
	store.Set(byteKey, bz)
}

// CreateVote creates a vote
func (k Keeper) CreateVote(ctx sdk.Context, msg types.MsgCreateVote) {
	// Create the vote
	count := k.GetVoteCount(ctx)
	var vote = types.Vote{
		Creator: msg.Creator,
		ID:      strconv.FormatInt(count, 10),
		PollID:  msg.PollID,
		Value:   msg.Value,
	}

	store := ctx.KVStore(k.storeKey)
	key := []byte(types.VotePrefix + vote.PollID + "-" + string(vote.Creator))
	value := k.cdc.MustMarshalBinaryLengthPrefixed(vote)
	store.Set(key, value)

	// Update vote count
	k.SetVoteCount(ctx, count+1)
}

// GetVote returns the vote information
func (k Keeper) GetVote(ctx sdk.Context, key string) (types.Vote, error) {
	store := ctx.KVStore(k.storeKey)
	var vote types.Vote
	byteKey := []byte(types.VotePrefix + key)
	err := k.cdc.UnmarshalBinaryLengthPrefixed(store.Get(byteKey), &vote)
	if err != nil {
		return vote, err
	}
	return vote, nil
}

// SetVote sets a vote
func (k Keeper) SetVote(ctx sdk.Context, vote types.Vote) {
	voteKey := vote.ID
	store := ctx.KVStore(k.storeKey)
	bz := k.cdc.MustMarshalBinaryLengthPrefixed(vote)
	key := []byte(types.VotePrefix + voteKey)
	store.Set(key, bz)
}

// DeleteVote deletes a vote
func (k Keeper) DeleteVote(ctx sdk.Context, key string) {
	store := ctx.KVStore(k.storeKey)
	store.Delete([]byte(types.VotePrefix + key))
}

//
// Functions used by querier
//

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

func getVote(ctx sdk.Context, path []string, k Keeper) (res []byte, sdkError error) {
	key := path[0]
	vote, err := k.GetVote(ctx, key)
	if err != nil {
		return nil, err
	}

	res, err = codec.MarshalJSONIndent(k.cdc, vote)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}

// Get creator of the item
func (k Keeper) GetVoteOwner(ctx sdk.Context, key string) sdk.AccAddress {
	vote, err := k.GetVote(ctx, key)
	if err != nil {
		return nil
	}
	return vote.Creator
}

// Check if the key exists in the store
func (k Keeper) VoteExists(ctx sdk.Context, key string) bool {
	store := ctx.KVStore(k.storeKey)
	return store.Has([]byte(types.VotePrefix + key))
}
