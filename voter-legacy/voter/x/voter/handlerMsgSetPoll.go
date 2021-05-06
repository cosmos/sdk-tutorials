package voter

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/alice/voter/x/voter/types"
	"github.com/alice/voter/x/voter/keeper"
)

func handleMsgSetPoll(ctx sdk.Context, k keeper.Keeper, msg types.MsgSetPoll) (*sdk.Result, error) {
	var poll = types.Poll{
		Creator: msg.Creator,
		ID:      msg.ID,
    	Title: msg.Title,
    	Options: msg.Options,
	}
	if !msg.Creator.Equals(k.GetPollOwner(ctx, msg.ID)) { // Checks if the the msg sender is the same as the current owner
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner") // If not, throw an error
	}

	k.SetPoll(ctx, poll)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
