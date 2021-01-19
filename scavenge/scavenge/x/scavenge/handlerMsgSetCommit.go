package scavenge

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/github-username/scavenge/x/scavenge/keeper"
	"github.com/github-username/scavenge/x/scavenge/types"
)

func handleMsgSetCommit(ctx sdk.Context, k keeper.Keeper, msg types.MsgSetCommit) (*sdk.Result, error) {
	var commit = types.Commit{
		Scavenger:             msg.Scavenger,
		SolutionHash:          msg.SolutionHash,
		SolutionScavengerHash: msg.SolutionScavengerHash,
	}
	if !msg.Scavenger.Equals(k.GetCommitOwner(ctx, msg.SolutionHash)) { // Checks if the the msg sender is the same as the current owner
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner") // If not, throw an error
	}

	k.SetCommit(ctx, commit)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
