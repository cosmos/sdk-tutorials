package blog

import (
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/sdk-tutorials/starport-blog/blog/x/blog/keeper"
	"github.com/sdk-tutorials/starport-blog/blog/x/blog/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// NewHandler ...
func NewHandler(k keeper.Keeper) sdk.Handler {
	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		ctx = ctx.WithEventManager(sdk.NewEventManager())
		switch msg := msg.(type) {
    // this line is used by starport scaffolding
		case types.MsgCreateComment:
			return handleMsgCreateComment(ctx, k, msg)
		case types.MsgCreatePost:
			return handleMsgCreatePost(ctx, k, msg)
		default:
			errMsg := fmt.Sprintf("unrecognized %s message type: %T", types.ModuleName, msg)
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, errMsg)
		}
	}
}
