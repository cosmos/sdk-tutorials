package scavenge

import (
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// NewHandler creates an sdk.Handler for all the scavenge type messages
func NewHandler(k Keeper) sdk.Handler {
	return func(ctx sdk.Context, msg sdk.Msg) sdk.Result {
		ctx = ctx.WithEventManager(sdk.NewEventManager())
		switch msg := msg.(type) {
		// TODO: Define your msg cases
		// 
		//Example:
		// case MsgSet<Action>:
		// 	return handleMsg<Action>(ctx, keeper, msg)
		default:
			errMsg := fmt.Sprintf("unrecognized %s message type: %T", types.ModuleName,  msg)
			return sdk.ErrUnknownRequest(errMsg).Result()
		}
	}
}

// handde<Action> does x
func handleMsg<Action>(ctx sdk.Context, msg MsgType, k Keeper) sdk.Result {

	err := k.<Action>(ctx, msg.ValidatorAddr)
	if err != nil {
		return err.Result()
	}

	// TODO: Define your msg events
	ctx.EventManager().EmitEvent(
		sdk.NewEvent(
			sdk.EventTypeMessage,
			sdk.NewAttribute(sdk.AttributeKeyModule, types.AttributeValueCategory),
			sdk.NewAttribute(sdk.AttributeKeySender, msg.ValidatorAddr.String()),
		),
	)

	return sdk.Result{Events: ctx.EventManager().Events()}
}
