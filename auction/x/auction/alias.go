package auction

import (
	"github.com/cosmos/sdk-application-tutorials/auction/x/auction/internal/types"
)

const (
	ModuleName = types.ModuleName
	StoreKey              = types.StoreKey
)

var (
	NewAuction = types.NewAuction
	ModuleCdc        = types.ModuleCdc
	RegisterCodec    = types.RegisterCodec
	ValidateGenesis          = types.ValidateGenesis
)

type (
	Auction = types.Auction
	Bid     = types.Bid
)
