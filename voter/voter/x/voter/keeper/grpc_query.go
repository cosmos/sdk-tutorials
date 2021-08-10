package keeper

import (
	"github.com/cosmonaut/voter/x/voter/types"
)

var _ types.QueryServer = Keeper{}
