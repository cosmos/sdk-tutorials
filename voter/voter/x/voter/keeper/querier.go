package keeper

import (
	// this line is used by starport scaffolding
	"github.com/cosmos/sdk-tutorials/voter/voter/x/voter/types"

	abci "github.com/tendermint/tendermint/abci/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// NewQuerier creates a new querier for voter clients.
func NewQuerier(k Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) ([]byte, error) {
		switch path[0] {
		// this line is used by starport scaffolding # 2
		case types.QueryListVote:
			return listVote(ctx, k)
		case types.QueryListPoll:
			return listPoll(ctx, k)
		default:
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "unknown voter query endpoint")
		}
	}
}
