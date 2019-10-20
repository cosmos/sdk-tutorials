package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// DefaultCodespace is the Module Name
const (
	DefaultCodespace sdk.CodespaceType = ModuleName

	CodeBidSmaller      sdk.CodeType = 101
	CodeAuctionOver     sdk.CodeType = 102
	CodeAuctionNotFound sdk.CodeType = 103
)

// ErrBidSmaller is the error for a bid being smaller than the current bid
func ErrBidSmaller(codespace sdk.CodespaceType) sdk.Error {
	return sdk.NewError(codespace, CodeBidSmaller, "Bid is less than current bid")
}

func ErrAuctionOver(codespace sdk.CodespaceType) sdk.Error {
	return sdk.NewError(codespace, CodeAuctionOver, "Auction is over")
}

func ErrAuctionNotFound(codespace sdk.CodespaceType) sdk.Error {
	return sdk.NewError(codespace, CodeAuctionNotFound, "Auction doesnt Exist")
}
