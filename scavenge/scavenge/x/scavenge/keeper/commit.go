package keeper

import (
	"strconv"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/github-username/scavenge/x/scavenge/types"
)

// GetCommitCount get the total number of commit
func (k Keeper) GetCommitCount(ctx sdk.Context) int64 {
	store := ctx.KVStore(k.storeKey)
	byteKey := []byte(types.CommitCountPrefix)
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

// SetCommitCount set the total number of commit
func (k Keeper) SetCommitCount(ctx sdk.Context, count int64) {
	store := ctx.KVStore(k.storeKey)
	byteKey := []byte(types.CommitCountPrefix)
	bz := []byte(strconv.FormatInt(count, 10))
	store.Set(byteKey, bz)
}

// CreateCommit creates a commit
func (k Keeper) CreateCommit(ctx sdk.Context, commit types.Commit) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.CommitPrefix + commit.SolutionScavengerHash)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(commit)
	store.Set(key, value)
}

func (k Keeper) GetCommit(ctx sdk.Context, key string) (types.Commit, error) {
	store := ctx.KVStore(k.storeKey)
	var commit types.Commit
	byteKey := []byte(types.CommitPrefix + key)
	err := k.cdc.UnmarshalBinaryLengthPrefixed(store.Get(byteKey), &commit)
	if err != nil {
		return commit, err
	}
	return commit, nil
}

// SetCommit sets a commit
func (k Keeper) SetCommit(ctx sdk.Context, commit types.Commit) {
	commitKey := commit.SolutionHash
	store := ctx.KVStore(k.storeKey)
	bz := k.cdc.MustMarshalBinaryLengthPrefixed(commit)
	key := []byte(types.CommitPrefix + commitKey)
	store.Set(key, bz)
}

// DeleteCommit deletes a commit
func (k Keeper) DeleteCommit(ctx sdk.Context, key string) {
	store := ctx.KVStore(k.storeKey)
	store.Delete([]byte(types.CommitPrefix + key))
}

//
// Functions used by querier
//

func getCommit(ctx sdk.Context, path []string, k Keeper) (res []byte, sdkError error) {
	key := path[0]
	commit, err := k.GetCommit(ctx, key)
	if err != nil {
		return nil, err
	}

	res, err = codec.MarshalJSONIndent(k.cdc, commit)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}

func listCommit(ctx sdk.Context, k Keeper) ([]byte, error) {
	var commitList []types.Commit
	store := ctx.KVStore(k.storeKey)
	iterator := sdk.KVStorePrefixIterator(store, []byte(types.CommitPrefix))
	for ; iterator.Valid(); iterator.Next() {
		var commit types.Commit
		k.cdc.MustUnmarshalBinaryLengthPrefixed(store.Get(iterator.Key()), &commit)
		commitList = append(commitList, commit)
	}
	res := codec.MustMarshalJSONIndent(k.cdc, commitList)
	return res, nil
}

// Get creator of the item
func (k Keeper) GetCommitOwner(ctx sdk.Context, key string) sdk.AccAddress {
	commit, err := k.GetCommit(ctx, key)
	if err != nil {
		return nil
	}
	return commit.Scavenger
}

// Check if the key exists in the store
func (k Keeper) CommitExists(ctx sdk.Context, key string) bool {
	store := ctx.KVStore(k.storeKey)
	return store.Has([]byte(types.CommitPrefix + key))
}
