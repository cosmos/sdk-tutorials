package auction

import (
	"cosmossdk.io/errors"
)

var (
	ErrNameReserved = errors.Register(ModuleName, 1, "name already reserved")
	ErrEmptyName    = errors.Register(ModuleName, 2, "name cannot be empty")
)
