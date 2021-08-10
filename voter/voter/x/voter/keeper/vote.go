package keeper

import (
	"encoding/binary"
	"github.com/cosmonaut/voter/x/voter/types"
	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"strconv"
)

// GetVoteCount get the total number of TypeName.LowerCamel
func (k Keeper) GetVoteCount(ctx sdk.Context) uint64 {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VoteCountKey))
	byteKey := types.KeyPrefix(types.VoteCountKey)
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

// SetVoteCount set the total number of vote
func (k Keeper) SetVoteCount(ctx sdk.Context, count uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VoteCountKey))
	byteKey := types.KeyPrefix(types.VoteCountKey)
	bz := []byte(strconv.FormatUint(count, 10))
	store.Set(byteKey, bz)
}

// AppendVote appends a vote in the store with a new id and update the count
func (k Keeper) AppendVote(
	ctx sdk.Context,
	vote types.Vote,
) uint64 {
	// Create the vote
	count := k.GetVoteCount(ctx)

	// Set the ID of the appended value
	vote.Id = count

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VoteKey))
	appendedValue := k.cdc.MustMarshalBinaryBare(&vote)
	store.Set(GetVoteIDBytes(vote.Id), appendedValue)

	// Update vote count
	k.SetVoteCount(ctx, count+1)

	return count
}

// SetVote set a specific vote in the store
func (k Keeper) SetVote(ctx sdk.Context, vote types.Vote) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VoteKey))
	b := k.cdc.MustMarshalBinaryBare(&vote)
	store.Set(GetVoteIDBytes(vote.Id), b)
}

// GetVote returns a vote from its id
func (k Keeper) GetVote(ctx sdk.Context, id uint64) types.Vote {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VoteKey))
	var vote types.Vote
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetVoteIDBytes(id)), &vote)
	return vote
}

// HasVote checks if the vote exists in the store
func (k Keeper) HasVote(ctx sdk.Context, id uint64) bool {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VoteKey))
	return store.Has(GetVoteIDBytes(id))
}

// GetVoteOwner returns the creator of the
func (k Keeper) GetVoteOwner(ctx sdk.Context, id uint64) string {
	return k.GetVote(ctx, id).Creator
}

// RemoveVote removes a vote from the store
func (k Keeper) RemoveVote(ctx sdk.Context, id uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VoteKey))
	store.Delete(GetVoteIDBytes(id))
}

// GetAllVote returns all vote
func (k Keeper) GetAllVote(ctx sdk.Context) (list []types.Vote) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VoteKey))
	iterator := sdk.KVStorePrefixIterator(store, []byte{})

	defer iterator.Close()

	for ; iterator.Valid(); iterator.Next() {
		var val types.Vote
		k.cdc.MustUnmarshalBinaryBare(iterator.Value(), &val)
		list = append(list, val)
	}

	return
}

// GetVoteIDBytes returns the byte representation of the ID
func GetVoteIDBytes(id uint64) []byte {
	bz := make([]byte, 8)
	binary.BigEndian.PutUint64(bz, id)
	return bz
}

// GetVoteIDFromBytes returns ID in uint64 format from a byte array
func GetVoteIDFromBytes(bz []byte) uint64 {
	return binary.BigEndian.Uint64(bz)
}
