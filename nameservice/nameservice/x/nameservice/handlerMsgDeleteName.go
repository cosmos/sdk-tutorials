package nameservice

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/cosmos/sdk-tutorials/nameservice/nameservice/x/nameservice/keeper"
	"github.com/cosmos/sdk-tutorials/nameservice/nameservice/x/nameservice/types"
)

// Handle a message to delete name
func handleMsgDeleteName(ctx sdk.Context, k keeper.Keeper, msg types.MsgDeleteName) (*sdk.Result, error) {
	if !k.Exists(ctx, msg.Name) {
		// replace with ErrKeyNotFound for 0.39+
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, msg.Name)
	}
	if !msg.Owner.Equals(k.GetOwner(ctx, msg.Name)) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner")
	}

	k.DeleteWhois(ctx, msg.Name)
	return &sdk.Result{}, nil
}
