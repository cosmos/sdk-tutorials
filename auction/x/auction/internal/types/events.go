package types

// Auction module event types
var (
	EventTypeCreateAuction = "create_auction"
	EventTypeBid           = "bid"

	AttributeValueCategory = ModuleName

	AttributeKeyNFTID     = "nft-id"
	AttributeKeyNFTOwner  = "nft-owner"
	AttributeKeyStartTime = "start-time"
	AttributeKeyEndTime   = "end-time"
	AttributeKeyBid       = "bid"
)
