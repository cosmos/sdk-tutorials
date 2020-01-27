package keeper

import (
	abci "github.com/tendermint/tendermint/abci/types"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// NewQuerier creates a new querier for scavenge clients.
func NewQuerier(k Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) ([]byte, error) {
		switch path[0] {
		case types.QueryListScavenges:
			return listScavenges(ctx, k)
		case types.QueryGetScavenge:
			return getScavenge(ctx, path[1:], k)
		case types.QueryCommit:
			return getCommit(ctx, path[1:], k)
		default:
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "unknown scavenge query endpoint")
		}
	}
}

// RemovePrefixFromHash removes the prefix from the key
func RemovePrefixFromHash(key []byte, prefix []byte) (hash []byte) {
	hash = key[len(prefix):]
	return hash
}

func listScavenges(ctx sdk.Context, k Keeper) ([]byte, error) {
	var scavengeList types.QueryResScavenges

	iterator := k.GetScavengesIterator(ctx)

	for ; iterator.Valid(); iterator.Next() {
		scavengeHash := RemovePrefixFromHash(iterator.Key(), []byte(types.ScavengePrefix))
		scavengeList = append(scavengeList, string(scavengeHash))
	}

	res, err := codec.MarshalJSONIndent(k.cdc, scavengeList)
	if err != nil {
		return res, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

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

func getCommit(ctx sdk.Context, path []string, k Keeper) (res []byte, sdkError error) {
	solutionScavengerHash := path[0]
	commit, err := k.GetCommit(ctx, solutionScavengerHash)
	if err != nil {
		return nil, err
	}
	res, err = codec.MarshalJSONIndent(k.cdc, commit)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}
	return res, nil
}
