package keeper

import (
	"context"

	auction "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"
)

func (k *Keeper) InitGenesis(ctx context.Context, data *auction.GenesisState) error {
	// TODO: Implement
	return nil
}

func (k *Keeper) ExportGenesis(ctx context.Context) (*auction.GenesisState, error) {
	// TODO: Implement
	return &auction.GenesisState{}, nil
}
