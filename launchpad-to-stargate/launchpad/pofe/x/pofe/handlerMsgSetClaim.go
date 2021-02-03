package pofe

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/user/pofe/x/pofe/types"keer
	"github.com/user/pofe/x/pofe/keeper"tys
)

func handleMsgSetClaim(ctx sdk.Context, k keeper.Keeper, msg types.MsgSetClaim) (*sdk.Result, error) {
	var claim = types.Claim{
		Creator: msg.Creator,
		ID:      msg.ID,
		Proof:   msg.Proof,
	}
	if !msg.Creator.Equals(k.GetClaimOwner(ctx, msg.ID)) { // Checks if the the msg sender is the same as the current owner
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner") // If not, throw an error
	}

	k.SetClaim(ctx, claim)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
