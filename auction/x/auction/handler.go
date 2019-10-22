package auction

import (
	"fmt"
	"time"

	"github.com/cosmos/modules/incubator/nft"

	"github.com/cosmos/cosmos-sdk/types"
)

func NewHandler(keeper Keeper) types.Handler {
	return func(ctx types.Context, msg types.Msg) types.Result {
		switch msg := msg.(type) {
		case MsgCreateAuction:
			return handleMsgCreateAuction(ctx, keeper, msg)
		case MsgBid:
			return handleMsgBid(ctx, keeper, msg)
		default:
			errMsg := fmt.Sprintf("unrecognized nft message type: %T", msg)
			return types.ErrUnknownRequest(errMsg).Result()
		}
	}
}

func handleMsgCreateAuction(ctx types.Context, k Keeper, msg MsgCreateAuction) types.Result {
	// need to get the nft
	nft1, err := k.NftKeeper.GetNFT(ctx, msg.NftDenom, msg.NftID)
	if err != nil {
		return nft.ErrUnknownNFT(DefaultCodespace, "could not find nft").Result()
	}

	// check the owner is the same as the one creating the auction
	if !nft1.GetOwner().Equals(msg.Owner) {
		return ErrOwnerInvalid(DefaultCodespace).Result()
	}

	startTime := ctx.BlockHeader().Time
	endTime := startTime.Add(msg.EndTime)

	// need to create the auction
	k.NewAuction(ctx, nft1.GetID(), startTime, endTime)

	ctx.EventManager().EmitEvents(types.Events{
		types.NewEvent(
			EventTypeCreateAuction,
			types.NewAttribute(AttributeKeyNFTID, msg.NftID),
			types.NewAttribute(AttributeKeyNFTOwner, msg.Owner.String()),
			types.NewAttribute(AttributeKeyStartTime, startTime.String()),
			types.NewAttribute(AttributeKeyEndTime, msg.EndTime.String()),
		),
		types.NewEvent(
			types.EventTypeMessage,
			types.NewAttribute(types.AttributeKeyModule, AttributeValueCategory),
			types.NewAttribute(types.AttributeKeySender, msg.Owner.String()),
		),
	})

	return types.Result{
		Events: ctx.EventManager().Events(),
	}
}

func handleMsgBid(ctx types.Context, k Keeper, msg MsgBid) types.Result {
	// get the auction
	auction, ok := k.GetAuction(ctx, msg.NftID)
	if !ok {
		return ErrAuctionNotFound(DefaultCodespace).Result()
	}

	// check that endtime is not over
	if auction.EndTime.Before(time.Now()) {
		return ErrAuctionOver(DefaultCodespace).Result()
	}

	// check that the new bid is greater than the current bid
	if auction.Bid != nil && auction.Bid.Bid.IsAnyGTE(msg.Bid) {
		return ErrBidSmaller(DefaultCodespace).Result()
	}
	// if not > return err code

	k.NewBid(ctx, msg.NftID, msg.Bidder, msg.Bid)

	ctx.EventManager().EmitEvents(types.Events{
		types.NewEvent(
			EventTypeBid,
			types.NewAttribute(AttributeKeyNFTID, msg.NftID),
			types.NewAttribute(AttributeKeyBid, msg.Bid.String()),
		),
		types.NewEvent(
			types.EventTypeMessage,
			types.NewAttribute(types.AttributeKeyModule, AttributeValueCategory),
			types.NewAttribute(types.AttributeKeySender, msg.Bidder.String()),
		),
	})

	return types.Result{
		Events: ctx.EventManager().Events(),
	}
}
