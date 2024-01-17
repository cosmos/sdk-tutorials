package keeper

import (
	"context"

	ns "github.com/cosmos/sdk-tutorials/tutorials/ns-auction/x/ns-auction"
)

func (k *Keeper) InitGenesis(ctx context.Context, data *ns.GenesisState) error {
	// TODO: Implement
	return nil
}

func (k *Keeper) ExportGenesis(ctx context.Context) (*ns.GenesisState, error) {
	// TODO: Implement
	return &ns.GenesisState{}, nil
}
