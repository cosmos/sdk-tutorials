package nameservice

import (
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-tutorials/nameservice/nameservice/x/nameservice/keeper"
	"github.com/cosmos/sdk-tutorials/nameservice/nameservice/x/nameservice/types"
)

// Handle a message to buy name
func handleMsgBuyName(ctx sdk.Context, keeper keeper.Keeper, msg types.MsgBuyName) (*sdk.Result, error) {
	// Checks if the the bid price is greater than the price paid by the current owner
	if keeper.GetPrice(ctx, msg.Name).IsAllGT(msg.Bid) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInsufficientFunds, "Bid not high enough") // If not, throw an error
	}
	if keeper.HasOwner(ctx, msg.Name) {
		err := keeper.CoinKeeper.SendCoins(ctx, msg.Buyer, keeper.GetOwner(ctx, msg.Name), msg.Bid)
		if err != nil {
			return nil, err
		}
	} else {
		_, err := keeper.CoinKeeper.SubtractCoins(ctx, msg.Buyer, msg.Bid) // If so, deduct the Bid amount from the sender
		if err != nil {
			return nil, err
		}
	}
	keeper.SetOwner(ctx, msg.Name, msg.Buyer)
	keeper.SetPrice(ctx, msg.Name, msg.Bid)
	return &sdk.Result{}, nil
}
