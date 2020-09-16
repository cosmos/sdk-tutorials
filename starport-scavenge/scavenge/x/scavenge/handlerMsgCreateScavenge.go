package scavenge

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/keeper"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/types"
)

func handleMsgCreateScavenge(ctx sdk.Context, k keeper.Keeper, msg types.MsgCreateScavenge) (*sdk.Result, error) {
	var scavenge = types.Scavenge{
		Creator:      msg.Creator,
		Description:  msg.Description,
		SolutionHash: msg.SolutionHash,
		Reward:       msg.Reward,
	}
	k.CreateScavenge(ctx, scavenge)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
