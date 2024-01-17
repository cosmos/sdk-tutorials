package ns_auction

import "cosmossdk.io/collections"

const (
	ModuleName = "ns-auction"
	StoreKey   = "ns-auction"
)

var (
	NamesKey  = collections.NewPrefix(0)
	OwnersKey = collections.NewPrefix(1)
)
