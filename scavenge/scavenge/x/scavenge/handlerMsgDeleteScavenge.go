package scavenge

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/github-username/scavenge/x/scavenge/types"
	"github.com/github-username/scavenge/x/scavenge/keeper"
)

// Handle a message to delete name
func handleMsgDeleteScavenge(ctx sdk.Context, k keeper.Keeper, msg types.MsgDeleteScavenge) (*sdk.Result, error) {
	if !k.ScavengeExists(ctx, msg.ID) {
		// replace with ErrKeyNotFound for 0.39+
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, msg.ID)
	}
	if !msg.Creator.Equals(k.GetScavengeOwner(ctx, msg.ID)) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner")
	}

	k.DeleteScavenge(ctx, msg.ID)
	return &sdk.Result{}, nil
}
