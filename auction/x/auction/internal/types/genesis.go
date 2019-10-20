package types

type GenesisState struct {
	AuctionRecords []Auction `json:"auction_records"`
}

func NewGenesisState(ar []Auction) GenesisState {
	return GenesisState{
		AuctionRecords: nil
	}
}

func ValidateGenesis(data GenesisState) error {
	for _, r := range data.AuctionRecords {
		if r.Nft == nil {
			return errors.New("auction item empty: %s, Error: Missing nft", r.Nft)
		}
		if r.StartTime == nil {
			return errors.New("auction start time is empty: %s, Error: Missing start time", r.StartTime)
		}
		if r.EndTime == nil {
			return errors.New("auction start time is empty: %s, Error: Missing start time", r.EndTime)
		}
	}
}

