package types

import (
	"fmt"
	"time"

	"github.com/cosmos/cosmos-sdk/types"
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

func (b Bid) String() string {
	strg := fmt.Sprintf(`
	Bidder: %s,
	Bid: 		%s,
	NftID: 	%s,
	`, b.Bidder, b.Bid, b.NftID)
	return strg
}

// -----

type Auction struct {
	NftID     string    `json:"nft"`
	Bid       Bid       `json:"bid"`        // bid for the nft
	StartTime time.Time `json:"start_time"` // start time of the auction
	EndTime   time.Time `json:"end_time"`   // end time of the auction
}

func NewAuction(nftID string, st, et time.Time) Auction {
	return Auction{
		NftID:     nftID,
		Bid:       Bid{},
		StartTime: st,
		EndTime:   et,
	}
}

func (au Auction) String() string {
	strg := fmt.Sprintf(`
	NftID: 				%s,
	Bid: 				%s,
	Start Time: %s,
	End Time: 	%s,
	`, au.NftID, au.Bid, au.StartTime, au.EndTime)
	return strg
}

// ReplaceBid, replaces the old bid if the new bid is greater
func (au *Auction) ReplaceBid(b Bid) {
	au.Bid = b
}
