package keeper

import (
	"github.com/username/nameservice/x/nameservice/types"
)

var _ types.QueryServer = Keeper{}
