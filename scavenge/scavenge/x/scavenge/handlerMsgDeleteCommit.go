package scavenge

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/github-username/scavenge/x/scavenge/types"
	"github.com/github-username/scavenge/x/scavenge/keeper"
)

// Handle a message to delete name
func handleMsgDeleteCommit(ctx sdk.Context, k keeper.Keeper, msg types.MsgDeleteCommit) (*sdk.Result, error) {
	if !k.CommitExists(ctx, msg.ID) {
		// replace with ErrKeyNotFound for 0.39+
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, msg.ID)
	}
	if !msg.Creator.Equals(k.GetCommitOwner(ctx, msg.ID)) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner")
	}

	k.DeleteCommit(ctx, msg.ID)
	return &sdk.Result{}, nil
}
