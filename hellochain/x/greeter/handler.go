package greeter

import (
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	gtypes "github.com/cosmos/sdk-tutorials/hellochain/x/greeter/types"
)

// NewHandler creates an sdk.Handler for all the greeter type messages
func NewHandler(k Keeper) sdk.Handler {
	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		ctx = ctx.WithEventManager(sdk.NewEventManager())
		switch msg := msg.(type) {
		// TODO: Define your msg cases
		case MsgGreet:
			return handleMsgGreet(ctx, k, msg)
		default:
			errMsg := fmt.Sprintf("unrecognized %s message type: %T", ModuleName, msg)
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, errMsg)
		}
	}
}

// handleMsgGreet saves the greeting under its recipient's address and emits a Greeting event
//TO inett ou keeper function
func handleMsgGreet(ctx sdk.Context, k Keeper, msg MsgGreet) (sdk.Result, error) {
	greeting, err := k.AppendGreeting(msg.Sender, msg.Body, msg.Recipient)
	if err != nil {
		return nil, err
	}

	keeper.AppendGreeting(msg.Recipient, ctx, greeting)

	// TODO: Define your msg events
	ctx.EventManager().EmitEvent(
		sdk.NewEvent(
			sdk.EventTypeMessage,
			sdk.NewAttribute(sdk.AttributeKeyModule, AttributeValueCategory),
			sdk.NewAttribute(sdk.AttributeKeySender, msg.ValidatorAddr.String()),
		),
	)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
