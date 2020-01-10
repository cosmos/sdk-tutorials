package types

import (
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// Local code type
type CodeType = sdk.CodeType

const (
	// Default scavenge codespace
	DefaultCodespace sdk.CodespaceType = ModuleName

	// CodeInvalid      CodeType = 101
)

// TODO: Fill out some custom errors for the module
// You can see how they are constructed below:
// func ErrInvalid(codespace sdk.CodespaceType) sdk.Error {
// 	return sdkerrors(codespace, CodeInvalid, "custom error message")
// }
