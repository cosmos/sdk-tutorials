package auction

import (
	"github.com/cosmos/sdk-tutorials/auction/x/auction/internal/keeper"
	"github.com/cosmos/sdk-tutorials/auction/x/auction/internal/types"
)

const (
	ModuleName       = types.ModuleName
	StoreKey         = types.StoreKey
	RouterKey        = types.RouterKey
	QuerierRoute     = types.QuerierRoute
	DefaultCodespace = types.DefaultCodespace
)

var (
	NewKeeper           = keeper.NewKeeper
	NewQuerier          = keeper.NewQuerier
	NewAuction          = types.NewAuction
	ModuleCdc           = types.ModuleCdc
	RegisterCodec       = types.RegisterCodec
	ValidateGenesis     = types.ValidateGenesis
	DefaultGenesisState = types.DefaultGenesisState

	// Errors
	ErrBidSmaller      = types.ErrBidSmaller
	ErrAuctionOver     = types.ErrAuctionOver
	ErrAuctionNotFound = types.ErrAuctionNotFound
	ErrOwnerInvalid    = types.ErrOwnerInvalid

	//Events
	EventTypeCreateAuction = types.EventTypeCreateAuction
	EventTypeBid           = types.EventTypeBid
	AttributeKeyNFTID      = types.AttributeKeyNFTID
	AttributeKeyNFTOwner   = types.AttributeKeyNFTOwner
	AttributeKeyStartTime  = types.AttributeKeyStartTime
	AttributeKeyEndTime    = types.AttributeKeyEndTime
	AttributeValueCategory = types.AttributeValueCategory
	AttributeKeyBid        = types.AttributeKeyBid
)

type (
	GenesisState     = types.GenesisState
	Auction          = types.Auction
	Bid              = types.Bid
	Keeper           = keeper.Keeper
	MsgCreateAuction = types.MsgCreateAuction
	MsgBid           = types.MsgBid
)
