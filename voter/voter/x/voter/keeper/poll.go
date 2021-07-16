package keeper

import (
	"encoding/binary"
	"github.com/cosmonaut/voter/x/voter/types"
	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"strconv"
)

// GetPollCount get the total number of TypeName.LowerCamel
func (k Keeper) GetPollCount(ctx sdk.Context) uint64 {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PollCountKey))
	byteKey := types.KeyPrefix(types.PollCountKey)
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

// SetPollCount set the total number of poll
func (k Keeper) SetPollCount(ctx sdk.Context, count uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PollCountKey))
	byteKey := types.KeyPrefix(types.PollCountKey)
	bz := []byte(strconv.FormatUint(count, 10))
	store.Set(byteKey, bz)
}

// AppendPoll appends a poll in the store with a new id and update the count
func (k Keeper) AppendPoll(
	ctx sdk.Context,
	poll types.Poll,
) uint64 {
	// Create the poll
	count := k.GetPollCount(ctx)

	// Set the ID of the appended value
	poll.Id = count

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PollKey))
	appendedValue := k.cdc.MustMarshalBinaryBare(&poll)
	store.Set(GetPollIDBytes(poll.Id), appendedValue)

	// Update poll count
	k.SetPollCount(ctx, count+1)

	return count
}

// SetPoll set a specific poll in the store
func (k Keeper) SetPoll(ctx sdk.Context, poll types.Poll) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PollKey))
	b := k.cdc.MustMarshalBinaryBare(&poll)
	store.Set(GetPollIDBytes(poll.Id), b)
}

// GetPoll returns a poll from its id
func (k Keeper) GetPoll(ctx sdk.Context, id uint64) types.Poll {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PollKey))
	var poll types.Poll
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetPollIDBytes(id)), &poll)
	return poll
}

// HasPoll checks if the poll exists in the store
func (k Keeper) HasPoll(ctx sdk.Context, id uint64) bool {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PollKey))
	return store.Has(GetPollIDBytes(id))
}

// GetPollOwner returns the creator of the
func (k Keeper) GetPollOwner(ctx sdk.Context, id uint64) string {
	return k.GetPoll(ctx, id).Creator
}

// RemovePoll removes a poll from the store
func (k Keeper) RemovePoll(ctx sdk.Context, id uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PollKey))
	store.Delete(GetPollIDBytes(id))
}

// GetAllPoll returns all poll
func (k Keeper) GetAllPoll(ctx sdk.Context) (list []types.Poll) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PollKey))
	iterator := sdk.KVStorePrefixIterator(store, []byte{})

	defer iterator.Close()

	for ; iterator.Valid(); iterator.Next() {
		var val types.Poll
		k.cdc.MustUnmarshalBinaryBare(iterator.Value(), &val)
		list = append(list, val)
	}

	return
}

// GetPollIDBytes returns the byte representation of the ID
func GetPollIDBytes(id uint64) []byte {
	bz := make([]byte, 8)
	binary.BigEndian.PutUint64(bz, id)
	return bz
}

// GetPollIDFromBytes returns ID in uint64 format from a byte array
func GetPollIDFromBytes(bz []byte) uint64 {
	return binary.BigEndian.Uint64(bz)
}
