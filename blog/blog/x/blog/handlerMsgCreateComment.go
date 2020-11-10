package blog

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-tutorials/blog/blog/x/blog/keeper"
	"github.com/cosmos/sdk-tutorials/blog/blog/x/blog/types"
)

func handleMsgCreateComment(ctx sdk.Context, k keeper.Keeper, msg types.MsgCreateComment) (*sdk.Result, error) {
	var comment = types.Comment{
		Creator: msg.Creator,
		ID:      msg.ID,
		Body:    msg.Body,
		PostID:  msg.PostID,
	}
	k.CreateComment(ctx, comment)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
