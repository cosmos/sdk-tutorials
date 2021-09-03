package keeper

import (
	"github.com/user/planet/x/blog/types"
)

var _ types.QueryServer = Keeper{}
