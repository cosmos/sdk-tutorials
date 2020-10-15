package voter

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-tutorials/voter/voter/x/voter/keeper"
	"github.com/cosmos/sdk-tutorials/voter/voter/x/voter/types"
)

func handleMsgCreateVote(ctx sdk.Context, k keeper.Keeper, msg types.MsgCreateVote) (*sdk.Result, error) {
	var vote = types.Vote{
		Creator: msg.Creator,
		ID:      msg.ID,
		PollID:  msg.PollID,
		Value:   msg.Value,
	}
	k.CreateVote(ctx, vote)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
