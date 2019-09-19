package greeter

import (
	"fmt"
	sdk "github.com/cosmos/cosmos-sdk/types"
	gtypes "github.com/cosmos/hellochain/x/greeter/types"
)

// NewHandler returns a handler for "greeter" type messages.
func NewHandler(keeper Keeper) sdk.Handler {
	return func(ctx sdk.Context, msg sdk.Msg) sdk.Result {
		switch msg := msg.(type) {
		case gtypes.MsgGreet:
			return handleMsgGreet(ctx, keeper, msg)
		default:
			errMsg := fmt.Sprintf("Unrecognized greeter Msg type: %v", msg.Type())
			return sdk.ErrUnknownRequest(errMsg).Result()
		}
	}
}

func handleMsgGreet(ctx sdk.Context, keeper Keeper, msg gtypes.MsgGreet) sdk.Result {
	if msg.Recipient == nil {
		return sdk.ErrUnauthorized("Missing Recipient").Result() // If not, throw an error
	}

	greeting := gtypes.NewGreeting(msg.Sender, msg.Body, msg.Recipient)

	keeper.SetGreeting(ctx, greeting)

	return sdk.Result{}
}
