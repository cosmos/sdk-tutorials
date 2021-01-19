package scavenge

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/github-username/scavenge/x/scavenge/keeper"
	"github.com/github-username/scavenge/x/scavenge/types"
)

func handleMsgSetScavenge(ctx sdk.Context, k keeper.Keeper, msg types.MsgSetScavenge) (*sdk.Result, error) {
	var scavenge = types.Scavenge{
		Creator:      msg.Creator,
		Description:  msg.Description,
		SolutionHash: msg.SolutionHash,
		Solution:     msg.Solution,
	}
	if !msg.Creator.Equals(k.GetScavengeOwner(ctx, msg.SolutionHash)) { // Checks if the the msg sender is the same as the current owner
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner") // If not, throw an error
	}

	k.SetScavenge(ctx, scavenge)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
