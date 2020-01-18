package keeper

import (
	abci "github.com/tendermint/tendermint/abci/types"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// NewQuerier creates a new querier for scavenge clients.
func NewQuerier(k Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) ([]byte, sdk.Error) {
		switch path[0] {
		case types.QueryListScavenges:
			return listScavenges(ctx, k)
		case types.QueryGetScavenge:
			return getScavenge(ctx, path[1:], k)
		case types.QueryCommit:
			return getCommit(ctx, path[1:], k)
		default:
			return nil, sdk.ErrUnknownRequest("unknown scavenge query endpoint")
		}
	}
}

// RemovePrefixFromHash removes the prefix from the key
func RemovePrefixFromHash(key []byte, prefix []byte) (hash []byte) {
	hash = key[len(prefix):]
	return hash
}

func listScavenges(ctx sdk.Context, k Keeper) ([]byte, sdk.Error) {
	var scavengeList types.QueryResScavenges

	iterator := k.GetScavengesIterator(ctx)

	for ; iterator.Valid(); iterator.Next() {
		scavengeHash := RemovePrefixFromHash(iterator.Key(), []byte(types.ScavengePrefix))
		scavengeList = append(scavengeList, string(scavengeHash))
	}

	res, err := codec.MarshalJSONIndent(k.cdc, scavengeList)
	if err != nil {
		return res, sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "Could not marshal result to JSON")
	}

	return res, nil
}

func getScavenge(ctx sdk.Context, path []string, k Keeper) (res []byte, sdkError sdk.Error) {
	solutionHash := path[0]
	scavenge, err := k.GetScavenge(ctx, solutionHash)
	if err != nil {
		return nil, sdk.NewError(types.DefaultCodespace, types.CodeInvalid, err.Error())
	}

	res, err = codec.MarshalJSONIndent(k.cdc, scavenge)
	if err != nil {
		return nil, sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "Could not marshal result to JSON")
	}

	return res, nil
}

func getCommit(ctx sdk.Context, path []string, k Keeper) (res []byte, sdkError sdk.Error) {
	solutionScavengerHash := path[0]
	commit, err := k.GetCommit(ctx, solutionScavengerHash)
	if err != nil {
		return nil, sdk.NewError(types.DefaultCodespace, types.CodeInvalid, err.Error())
	}
	res, err = codec.MarshalJSONIndent(k.cdc, commit)
	if err != nil {
		return nil, sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "Could not marshal result to JSON")
	}
	return res, nil
}
