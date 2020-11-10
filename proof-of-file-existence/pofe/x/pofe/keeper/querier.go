package keeper

import (
  // this line is used by starport scaffolding # 1
	"github.com/cosmos/sdk-tutorials/proof-of-file-existence/pofe/x/pofe/types"
		
	abci "github.com/tendermint/tendermint/abci/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// NewQuerier creates a new querier for pofe clients.
func NewQuerier(k Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) ([]byte, error) {
		switch path[0] {
    // this line is used by starport scaffolding # 2
		case types.QueryListClaim:
			return listClaim(ctx, k)
		case types.QueryGetClaim:
			return getClaim(ctx, path[1:], k)
		default:
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "unknown pofe query endpoint")
		}
	}
}
