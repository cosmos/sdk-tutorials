package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// When a module wishes to interact with an otehr module it is good practice to define what it will use
// as an interface so the module can not use things that are not permitted.
type BankKeeper interface {
	SubtractCoins(ctx sdk.Context, addr sdk.AccAddress, amt sdk.Coins) (sdk.Coins, error)
	SendCoins(ctx sdk.Context, fromAddr sdk.AccAddress, toAddr sdk.AccAddress, amt sdk.Coins) error
}
