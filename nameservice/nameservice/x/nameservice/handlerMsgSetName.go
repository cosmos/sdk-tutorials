package nameservice

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/sdk-tutorials/nameservice/nameservice/x/nameservice/keeper"
	"github.com/cosmos/sdk-tutorials/nameservice/nameservice/x/nameservice/types"
)

// Handle a message to set name
func handleMsgSetName(ctx sdk.Context, keeper keeper.Keeper, msg types.MsgSetName) (*sdk.Result, error) {

	if !msg.Owner.Equals(keeper.GetOwner(ctx, msg.Name)) { // Checks if the the msg sender is the same as the current owner
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner") // If not, throw an error
	}
	keeper.SetName(ctx, msg.Name, msg.Value) // If so, set the name to the value specified in the msg.
	return &sdk.Result{}, nil                // return
}
