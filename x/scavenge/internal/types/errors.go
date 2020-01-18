package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// CodeType is a Local code type
type CodeType = sdk.CodeType

const (
	// DefaultCodespace is a scavenge codespace
	DefaultCodespace sdk.CodespaceType = ModuleName

	CodeInvalid CodeType = 101
)

// // You can see how they are constructed below:
// func ErrInvalid(codespace sdk.CodespaceType) sdk.Error {
// 	return sdk.NewError(codespace, CodeInvalid, "custom error message")
// }
