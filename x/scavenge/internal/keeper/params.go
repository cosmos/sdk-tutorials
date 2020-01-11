package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// GetParams returns the total set of scavenge parameters.
func (k Keeper) GetParams(ctx sdk.Context) (params types.Params) {
	return nil
}

// SetParams sets the scavenge parameters to the param space.
func (k Keeper) SetParams(ctx sdk.Context, params types.Params) {
}
