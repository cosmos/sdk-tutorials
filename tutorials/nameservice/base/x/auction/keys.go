package auction

import "cosmossdk.io/collections"

const (
	ModuleName = "auction"
	StoreKey   = ModuleName
)

var (
	NamesKey  = collections.NewPrefix(0)
	OwnersKey = collections.NewPrefix(1)
)
