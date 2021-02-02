package keeper

import (
	// this line is used by starport scaffolding # 1
	"github.com/user/nameservice/x/nameservice/types"

	abci "github.com/tendermint/tendermint/abci/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// NewQuerier creates a new querier for nameservice clients.
func NewQuerier(k Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) ([]byte, error) {
		switch path[0] {
		// this line is used by starport scaffolding # 2

		case types.QueryResolveName:
			return resolveName(ctx, path[1:], k)
		case types.QueryListWhois:
			return listWhois(ctx, k)
		case types.QueryGetWhois:
			return getWhois(ctx, path[1:], k)
		default:
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "unknown nameservice query endpoint")
		}
	}
}
