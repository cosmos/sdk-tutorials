package keeper

import (
	"github.com/user/planet/x/planet/types"
)

var _ types.QueryServer = Keeper{}
