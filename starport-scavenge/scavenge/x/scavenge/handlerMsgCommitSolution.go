package scavenge

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/keeper"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/types"
)

func handleMsgCommitSolution(ctx sdk.Context, k keeper.Keeper, msg types.MsgCommitSolution) (*sdk.Result, error) {
	var commit = types.Commit{
		Scavenger:             msg.Scavenger,
		SolutionHash:          msg.SolutionHash,
		SolutionScavengerHash: msg.SolutionScavengerHash,
	}
	_, err := k.GetCommit(ctx, commit.SolutionScavengerHash)
	// should produce an error when commit is not found
	if err == nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "Commit with that hash already exists")
	}
	k.CreateCommit(ctx, commit)
	ctx.EventManager().EmitEvent(
		sdk.NewEvent(
			sdk.EventTypeMessage,
			sdk.NewAttribute(sdk.AttributeKeyModule, types.AttributeValueCategory),
			sdk.NewAttribute(sdk.AttributeKeyAction, types.EventTypeCommitSolution),
			sdk.NewAttribute(sdk.AttributeKeySender, msg.Scavenger.String()),
			sdk.NewAttribute(types.AttributeSolutionHash, msg.SolutionHash),
			sdk.NewAttribute(types.AttributeSolutionScavengerHash, msg.SolutionScavengerHash),
		),
	)
	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
