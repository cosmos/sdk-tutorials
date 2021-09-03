package types

import (
	"fmt"
	host "github.com/cosmos/cosmos-sdk/x/ibc/core/24-host"
)

// DefaultIndex is the default capability global index
const DefaultIndex uint64 = 1

// DefaultGenesis returns the default Capability genesis state
func DefaultGenesis() *GenesisState {
	return &GenesisState{
		PortId: PortID,
		// this line is used by starport scaffolding # genesis/types/default
		TimedoutPostList: []*TimedoutPost{},
		SentPostList:     []*SentPost{},
		PostList:         []*Post{},
	}
}

// Validate performs basic genesis state validation returning an error upon any
// failure.
func (gs GenesisState) Validate() error {
	if err := host.PortIdentifierValidator(gs.PortId); err != nil {
		return err
	}

	// this line is used by starport scaffolding # genesis/types/validate
	// Check for duplicated ID in timedoutPost
	timedoutPostIdMap := make(map[uint64]bool)

	for _, elem := range gs.TimedoutPostList {
		if _, ok := timedoutPostIdMap[elem.Id]; ok {
			return fmt.Errorf("duplicated id for timedoutPost")
		}
		timedoutPostIdMap[elem.Id] = true
	}
	// Check for duplicated ID in sentPost
	sentPostIdMap := make(map[uint64]bool)

	for _, elem := range gs.SentPostList {
		if _, ok := sentPostIdMap[elem.Id]; ok {
			return fmt.Errorf("duplicated id for sentPost")
		}
		sentPostIdMap[elem.Id] = true
	}
	// Check for duplicated ID in post
	postIdMap := make(map[uint64]bool)

	for _, elem := range gs.PostList {
		if _, ok := postIdMap[elem.Id]; ok {
			return fmt.Errorf("duplicated id for post")
		}
		postIdMap[elem.Id] = true
	}

	return nil
}
