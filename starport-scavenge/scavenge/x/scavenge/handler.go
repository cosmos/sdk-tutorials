package scavenge

import (
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/keeper"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/types"
)

// NewHandler ...
func NewHandler(k keeper.Keeper) sdk.Handler {
	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		ctx = ctx.WithEventManager(sdk.NewEventManager())
		switch msg := msg.(type) {
		// this line is used by starport scaffolding
		case types.MsgCommitSolution:
			return handleMsgCommitSolution(ctx, k, msg)
		case types.MsgCreateScavenge:
			return handleMsgCreateScavenge(ctx, k, msg)
		case types.MsgRevealSolution:
			return handleMsgRevealSolution(ctx, k, msg)
		default:
			errMsg := fmt.Sprintf("unrecognized %s message type: %T", types.ModuleName, msg)
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, errMsg)
		}
	}
}
