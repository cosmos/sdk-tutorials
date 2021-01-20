package keeper

import (
	"github.com/example/blog/x/blog/types"
)

var _ types.QueryServer = Keeper{}
