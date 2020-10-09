package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/sdk-tutorials/scavenge/scavenge/x/scavenge/types"
)

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
