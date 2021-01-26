package nameservice

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/user/nameservice/x/nameservice/types"
	"github.com/user/nameservice/x/nameservice/keeper"
)

func handleMsgSetWhois(ctx sdk.Context, k keeper.Keeper, msg types.MsgSetWhois) (*sdk.Result, error) {
	var whois = types.Whois{
		Creator: msg.Creator,
		ID:      msg.ID,
    	Value: msg.Value,
    	Price: msg.Price,
	}
	if !msg.Creator.Equals(k.GetWhoisOwner(ctx, msg.ID)) { // Checks if the the msg sender is the same as the current owner
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner") // If not, throw an error
	}

	k.SetWhois(ctx, whois)

	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
