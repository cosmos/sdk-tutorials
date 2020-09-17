package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/types"
  "github.com/cosmos/cosmos-sdk/codec"
)

func (k Keeper) CreateCommit(ctx sdk.Context, commit types.Commit) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.CommitPrefix + commit.ID)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(commit)
	store.Set(key, value)
}

func (k Keeper) GetCommit(ctx sdk.Context, commitKey string) {
	store := ctx.KVStore(k.storeKey)
	var commit types.Commit
	byteKey := []byte(types.CommitPrefix + commitKey)
	err := k.cdc.UnmarshalBinaryLengthPrefixed(store.Get(byteKey), &commit)
	if err != nil {
		return commit, err
	}
	return commit, nil
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