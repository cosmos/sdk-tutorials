package scavenge

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/types"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/keeper"
)

func handleMsgCreateScavenge(ctx sdk.Context, k keeper.Keeper, msg types.MsgCreateScavenge) (*sdk.Result, error) {
	var scavenge = types.Scavenge{
		Creator: msg.Creator,
		ID:      msg.ID,
    Description: msg.Description,
    SolutionHash: msg.SolutionHash,
    Reward: msg.Reward,
    Solution: msg.Solution,
    Scavenger: msg.Scavenger,
	}
	k.CreateScavenge(ctx, scavenge)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
