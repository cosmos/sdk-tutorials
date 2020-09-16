package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/types"
)

// CreateScavenge creates a scavenge
func (k Keeper) CreateScavenge(ctx sdk.Context, scavenge types.Scavenge) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.ScavengePrefix + scavenge.SolutionHash)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(scavenge)
	store.Set(key, value)
}

// GetScavenge returns the scavenge information
func (k Keeper) GetScavenge(ctx sdk.Context, solutionHash string) (types.Scavenge, error) {
	store := ctx.KVStore(k.storeKey)
	var scavenge types.Scavenge
	byteKey := []byte(types.ScavengePrefix + solutionHash)
	err := k.cdc.UnmarshalBinaryLengthPrefixed(store.Get(byteKey), &scavenge)
	if err != nil {
		return scavenge, err
	}
	return scavenge, nil
}

// SetScavenge sets a scavenge
func (k Keeper) SetScavenge(ctx sdk.Context, scavenge types.Scavenge) {
	solutionHash := scavenge.SolutionHash
	store := ctx.KVStore(k.storeKey)
	bz := k.cdc.MustMarshalBinaryLengthPrefixed(scavenge)
	key := []byte(types.ScavengePrefix + solutionHash)
	store.Set(key, bz)
}

// DeleteScavenge deletes a scavenge
func (k Keeper) DeleteScavenge(ctx sdk.Context, solutionHash string) {
	store := ctx.KVStore(k.storeKey)
	store.Delete([]byte(solutionHash))
}

//
// Functions used by querier
//

func listScavenge(ctx sdk.Context, k Keeper) ([]byte, error) {
	var scavengeList []types.Scavenge
	store := ctx.KVStore(k.storeKey)
	iterator := sdk.KVStorePrefixIterator(store, []byte(types.ScavengePrefix))
	for ; iterator.Valid(); iterator.Next() {
		var scavenge types.Scavenge
		k.cdc.MustUnmarshalBinaryLengthPrefixed(store.Get(iterator.Key()), &scavenge)
		scavengeList = append(scavengeList, scavenge)
	}
	res := codec.MustMarshalJSONIndent(k.cdc, scavengeList)
	return res, nil
}

func getScavenge(ctx sdk.Context, path []string, k Keeper) (res []byte, sdkError error) {
	solutionHash := path[0]
	scavenge, err := k.GetScavenge(ctx, solutionHash)
	if err != nil {
		return nil, err
	}

	res, err = codec.MarshalJSONIndent(k.cdc, scavenge)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}
