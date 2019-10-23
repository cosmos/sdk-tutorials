package types

import (
	"github.com/pkg/errors"
)

type GenesisState struct {
	AuctionRecords []Auction `json:"auction_records"`
}

func NewGenesisState(ar []Auction) GenesisState {
	return GenesisState{
		AuctionRecords: nil,
	}
}

func ValidateGenesis(data GenesisState) error {
	for _, r := range data.AuctionRecords {
		if len(r.NftID) == 0 || len(r.NftDenom) == 0 {
			return errors.New("auction item empty, Error: Missing nftID or nftDenom")
		}
		if r.StartTime.IsZero() {
			return errors.Errorf("auction start time is empty: %s, Error: Missing start time", r.StartTime)
		}
		if r.EndTime.IsZero() {
			return errors.Errorf("auction start time is empty: %s, Error: Missing start time", r.EndTime)
		}
	}
	return nil
}
