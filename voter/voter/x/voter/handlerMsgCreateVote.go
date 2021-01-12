package voter

import (
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/alice/voter/x/voter/types"
	"github.com/alice/voter/x/voter/keeper"
)

func handleMsgCreateVote(ctx sdk.Context, k keeper.Keeper, msg types.MsgCreateVote) (*sdk.Result, error) {
	k.CreateVote(ctx, msg)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
