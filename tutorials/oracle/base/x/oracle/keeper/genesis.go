package keeper

import (
	"context"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle"
)

// InitGenesis initializes the module state from a genesis state.
func (k *Keeper) InitGenesis(ctx context.Context, data *oracle.GenesisState) error {
	for _, counter := range data.Counters {
		if err := k.Counter.Set(ctx, counter.Address, counter.Count); err != nil {
			return err
		}
	}

	return nil
}

// ExportGenesis exports the module state to a genesis state.
func (k *Keeper) ExportGenesis(ctx context.Context) (*oracle.GenesisState, error) {
	var counters []oracle.Counter
	if err := k.Counter.Walk(ctx, nil, func(address string, count uint64) (bool, error) {
		counters = append(counters, oracle.Counter{
			Address: address,
			Count:   count,
		})

		return false, nil
	}); err != nil {
		return nil, err
	}

	return &oracle.GenesisState{
		Counters: counters,
	}, nil
}
