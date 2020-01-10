package types

import (
	"fmt"
	"time"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

// GenesisState - all scavenge state that must be provided at genesis
type GenesisState struct {
	Params       Params                          `json:"params" yaml:"params"`
	// TODO: Fill out what is needed by the module for genesis
}

// NewGenesisState creates a new GenesisState object
func NewGenesisState(
	params Params, /* TODO: Fill out with what is needed for genesis state*/
) GenesisState {

	return GenesisState{
		Params:       params,
		// TODO: Fill out according to your genesis state
	}
}

// DefaultGenesisState - default GenesisState used by Cosmos Hub
func DefaultGenesisState() GenesisState {
	return GenesisState{
		Params:       DefaultParams(),
		// TODO: Fill out according to your genesis state, these values will be initialized but empty
	}
}

// ValidateGenesis validates the scavenge genesis parameters
func ValidateGenesis(data GenesisState) error {
	// TODO: Create a sanity check to make sure the state conforms to the modules needs

	return nil
}
