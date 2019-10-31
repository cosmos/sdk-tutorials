package auction

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	nfttypes "github.com/cosmos/modules/incubator/nft"
)

// EndBlocker checks for auctions that have ended and trasnfers the NFT
func EndBlocker(ctx sdk.Context, k Keeper) {
	// Iterate through all the auctions see which are ended
	// Transfer the nft to the highest bid
	k.IterateAuctionsQueue(ctx, func(auction Auction) bool {

		//check if end time is over
		if auction.EndTime.Before(ctx.BlockHeader().Time) {
			return false
		}
		// get the nft
		nft, err := k.NftKeeper.GetNFT(ctx, auction.NftDenom, auction.NftID)
		if err != nil {
			return false
		}

		// set the new owner
		nft.SetOwner(auction.Bid.Bidder)
		// transfer the nft to the highest bidder
		err = k.NftKeeper.UpdateNFT(ctx, auction.NftDenom, nft)
		if err != nil {
			return false
		}

		// transfer tokens from bidder to owner Implement during tutorial

		// close the auction auction
		k.DeleteAuction(ctx, auction.NftID)

		ctx.EventManager().EmitEvents(sdk.Events{
			sdk.NewEvent(
				nfttypes.EventTypeTransfer,
				sdk.NewAttribute(nfttypes.AttributeKeyRecipient, auction.Bid.Bidder.String()),
				sdk.NewAttribute(nfttypes.AttributeKeyDenom, auction.NftDenom),
				sdk.NewAttribute(nfttypes.AttributeKeyNFTID, auction.NftID),
			),
			sdk.NewEvent(
				sdk.EventTypeMessage,
				sdk.NewAttribute(sdk.AttributeKeyModule, nfttypes.AttributeValueCategory),
				sdk.NewAttribute(sdk.AttributeKeySender, nft.GetOwner().String()),
			),
		})
		return true
	})
}
