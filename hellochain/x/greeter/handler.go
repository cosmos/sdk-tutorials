package greeter

import (
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// NewHandler returns a handler for "greeter" type messages.
func NewHandler(keeper Keeper) sdk.Handler {
	return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
		switch msg := msg.(type) {
		case MsgGreet:
			return handleMsgGreet(ctx, keeper, msg)
		default:
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, fmt.Sprintf("Unrecognized greeter Msg type: %v", msg.Type()))

		}
	}
}

func handleMsgGreet(ctx sdk.Context, keeper Keeper, msg MsgGreet) (*sdk.Result, error) {
	if msg.Recipient == nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Missing Recipient") // If not, throw an error
	}

	greeting := NewGreeting(msg.Sender, msg.Body, msg.Recipient)

	keeper.SetGreeting(ctx, greeting)

	return &sdk.Result{}, nil
}
