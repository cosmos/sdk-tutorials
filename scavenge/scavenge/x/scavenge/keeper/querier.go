package keeper

import (
  // this line is used by starport scaffolding # 1
	"github.com/github-username/scavenge/x/scavenge/types"
		
	
		
	abci "github.com/tendermint/tendermint/abci/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// NewQuerier creates a new querier for scavenge clients.
func NewQuerier(k Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) ([]byte, error) {
		switch path[0] {
    // this line is used by starport scaffolding # 2
		case types.QueryListCommit:
			return listCommit(ctx, k)
		case types.QueryGetCommit:
			return getCommit(ctx, path[1:], k)
		case types.QueryListScavenge:
			return listScavenge(ctx, k)
		case types.QueryGetScavenge:
			return getScavenge(ctx, path[1:], k)
		default:
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "unknown scavenge query endpoint")
		}
	}
}
