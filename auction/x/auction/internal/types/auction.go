package types

import (
	"fmt"
	"time"

	"github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/modules/incubator/nft"
)

type Bid struct {
	Bidder types.AccAddress `json:"bidder"`
	Bid    types.Coins      `json:"Bid"`
	NftID  string           `json:"nft_id"`
}

func NewBid(bidder types.AccAddress, bid types.Coins, nftID string) Bid {
	return Bid{
		Bidder: bidder,
		Bid:    bid,
		NftID:  nftID,
	}
}

func (B Bid) String() string {
	strg := fmt.Sprintf(`
	Bidder: %s,
	Bid: 		%s,
	NftID: 	%s,
	`, b.Bidder, b.Bid, b.NftID)
}

// -----

type Auction struct {
	Nft       nft.BaseNFT      `json:"nft"`
	Bid  			Bid 							`json:"bid"`        // bid for the nft
	StartTime time.Time        `json:"start_time"` // start time of the auction
	Endtime   time.Time        `json:"end_time"`   // end time of the auction
}

func NewAuction(nft nft.BaseNFT, st, et time.Time) Auction {
	return Auction{
		Nft:       nft,
		Bid:       nil,
		StartTime: st,
		EndTime:   et,
	}
}

func (au Auction) String() string {
	strg := fmt.Sprintf(`
	Nft: 				%v,
	Bid: 				%s,
	Start Time: %s,
	End Time: 	%s,
	`, au.NFT, au.Bid, au.StartTime, au.EndTime)
	return strg
}

// CheckBid, checks which bid is greater
func (au Auctin) checkBid(newB Bid) (Bid, bool) {
	if newB.Bid > oldB {
		return newB, true
	}
	return nil, false
}

// ReplaceBid, replaces the old bid if the new bid is greater
func (au *Auction) ReplaceBid(b Bid) {
	newB, ok := checkBid(b); ok {
		au.Bid = newB.Bid
	}
}



