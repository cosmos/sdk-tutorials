package pofe

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/error
	"github.com/user/pofe/x/pofe/keeper"
	"github.com/lukitsbrian/pofe/x/pofe/types"
)

func handleMsgCreateClaim(ctx sdk.Context, k keeper.Keeper, msg *types.MsgCreateClaim) (*sdk.Result, error) {
	k.CreateClaim(ctx, *msg)

	return &sdk.Result{Events: ctx.EventManager().ABCIEvents()}, nil
}

func handleMsgUpdateClaim(ctx sdk.Context, k keeper.Keeper, msg *types.MsgUpdateClaim) (*sdk.Result, error) {
	var claim = types.Claim{
		Creator: msg.Creator,
		Id:      msg.Id,
		Proof:   msg.Proof,
	}

	if msg.Creator != k.GetClaimOwner(ctx, msg.Id) { // Checks if the the msg sender is the same as the current owner
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect owner") // If not, throw an error
	}

	k.UpdateClaim(ctx, claim)

	return &sdk.Result{Events: ctx.EventManager().ABCIEvents()}, nil
}

func handleMsgDeleteClaim(ctx sdk.Context, k keeper.Keeper, msg *types.MsgDeleteClaim) (*sdk.Result, error) {
	if !k.HasClaim(ctx, msg.Id) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, msg.Id)
	}
	if msg.Creator != k.GetClaimOwner(ctx, msg.Id) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect owner")
	}

	k.DeleteClaim(ctx, msg.Id)

	return &sdk.Result{Events: ctx.EventManager().ABCIEvents()}, nil
}
