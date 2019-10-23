package types

const (
	QueryAuctions = "auctions"
	QueryAuction  = "auction"
)

type QueryResAuctionParams struct {
	NftID    string
}

// Define the params for the following queries:
// - 'custom/auction'

func NewQueryAuctionParams(nftID, denom string) QueryResAuctionParams {
	return QueryResAuctionParams{
		NftID:    nftID,
	}
}
