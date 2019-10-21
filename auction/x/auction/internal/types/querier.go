package types

const (
	QueryAuctions = "auctions"
	QueryAuction  = "auction"
)

type QueryResAuctions struct {
	Auctions []Auction
}

func NewQueryAuctions(aus []Auction) QueryResAuctions {
	return QueryResAuctions{
		Auctions: aus,
	}
}
