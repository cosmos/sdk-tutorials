package pofe

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/cosmos/sdk-tutorials/proof-of-file-existence/pofe/x/pofe/keeper"
	"github.com/cosmos/sdk-tutorials/proof-of-file-existence/pofe/x/pofe/types"
)

// Handle a message to delete name
func handleMsgDeleteClaim(ctx sdk.Context, k keeper.Keeper, msg types.MsgDeleteClaim) (*sdk.Result, error) {
	if !k.ClaimExists(ctx, msg.Proof) {
		// replace with ErrKeyNotFound for 0.39+
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, msg.Proof)
	}
	if !msg.Creator.Equals(k.GetClaimOwner(ctx, msg.Proof)) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "Incorrect Owner")
	}

	k.DeleteClaim(ctx, msg.Proof)
	return &sdk.Result{}, nil
}
