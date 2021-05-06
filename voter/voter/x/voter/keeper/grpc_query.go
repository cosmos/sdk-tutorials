package keeper

import (
	"github.com/username/voter/x/voter/types"
)

var _ types.QueryServer = Keeper{}
