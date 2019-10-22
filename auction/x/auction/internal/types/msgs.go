package types

import (
	"time"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

type MsgCreateAuction struct {
	NftID    string         `json:"nft_id"`
	NftDenom string         `json:"nft_denom"`
	Owner    sdk.AccAddress `json:"owner"`
	EndTime  time.Duration  `json:"end_time"`
}

func NewMsgCreateAuction(nftID, denom string, owner sdk.AccAddress, et time.Duration) MsgCreateAuction {
	return MsgCreateAuction{
		NftID:    nftID,
		NftDenom: denom,
		Owner:    owner,
		EndTime:  et,
	}
}

// Route Implements Msg.
func (msg MsgCreateAuction) Route() string { return RouterKey }

// Type Implements Msg.
func (msg MsgCreateAuction) Type() string { return "create_auction" }

// ValidateBasic Implements Msg.
func (msg MsgCreateAuction) ValidateBasic() sdk.Error {
	if msg.Owner.Empty() {
		return sdk.ErrInvalidAddress("missing sender address")
	}
	if len(msg.NftID) != 0 || len(msg.NftDenom) != 0 {
		return sdk.ErrUnknownRequest("NftID or NftDenom are empty")
	}
	return nil
}

// GetSignBytes Implements Msg.
func (msg MsgCreateAuction) GetSignBytes() []byte {
	return sdk.MustSortJSON(ModuleCdc.MustMarshalJSON(msg))
}

// GetSigners Implements Msg.
func (msg MsgCreateAuction) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{msg.Owner}
}

type MsgBid struct {
	Bidder sdk.AccAddress `json:"bidder"`
	Bid    sdk.Coins      `json:"bid"`
	NftID  string         `json:"nft_id"`
}

func NewMsgBid(bidder sdk.AccAddress, bid sdk.Coins, nftID string) MsgBid {
	return MsgBid{
		Bidder: bidder,
		Bid:    bid,
		NftID:  nftID,
	}
}

// Route Implements Msg.
func (msg MsgBid) Route() string { return RouterKey }

// Type Implements Msg.
func (msg MsgBid) Type() string { return "bid" }

// ValidateBasic Implements Msg.
func (msg MsgBid) ValidateBasic() sdk.Error {
	if msg.Bidder.Empty() {
		return sdk.ErrInvalidAddress("missing sender address")
	}
	if len(msg.NftID) != 0 {
		return sdk.ErrUnknownRequest("NftID or NftDenom are empty")
	}
	if !msg.Bid.IsAllPositive() {
		return sdk.ErrInsufficientCoins("Bids must be positive")
	}
	return nil
}

// GetSignBytes Implements Msg.
func (msg MsgBid) GetSignBytes() []byte {
	return sdk.MustSortJSON(ModuleCdc.MustMarshalJSON(msg))
}

// GetSigners Implements Msg.
func (msg MsgBid) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{msg.Bidder}
}
