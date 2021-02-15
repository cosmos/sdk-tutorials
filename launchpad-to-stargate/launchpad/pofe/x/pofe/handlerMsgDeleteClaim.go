package pofe

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/user/pofe/x/pofe/types"keer
	"github.com/user/pofe/x/pofe/keeper"tys
)

// Handle a message to delete name
func handleMsgDeleteClaim(ctx sdk.Context, k keeper.Keeper, msg types.MsgDeleteClaim) (*sdk.Result, error) {
	if !k.ClaimExists(ctx, msg.ID) {
		// replace with ErrKeyNotFound for 0.39+
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, msg.ID)
	}
	if !msg.Creator.Equals(k.GetClaimOwner(ctx, msg.ID)) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner")
	}

	k.DeleteClaim(ctx, msg.ID)
	return &sdk.Result{}, nil
}
