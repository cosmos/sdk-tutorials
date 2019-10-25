package auction

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	abci "github.com/tendermint/tendermint/abci/types"
)

func InitGenesis(ctx sdk.Context, k Keeper, data GenesisState) []abci.ValidatorUpdate {
	for _, auction := range data.AuctionRecords {
		k.SetAuction(ctx, auction.NftID, auction)
	}
	return []abci.ValidatorUpdate{}
}

func ExportGenesis(ctx sdk.Context, k Keeper) GenesisState {
	var auctions []Auction
	iterator := k.GetAuctionsIterator(ctx)
	for ; iterator.Valid(); iterator.Next() {

		nftID := string(iterator.Key())
		auction, _ := k.GetAuction(ctx, nftID)
		auctions = append(auctions, auction)
	}

	return GenesisState{AuctionRecords: auctions}
}
