package types

import (
	"fmt"
	"strings"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Scavenge struct {
	Creator      sdk.AccAddress `json:"creator" yaml:"creator"`
	Description  string         `json:"description" yaml:"description"`
	SolutionHash string         `json:"solutionHash" yaml:"solutionHash"`
	Reward       sdk.Coins      `json:"reward" yaml:"reward"`
	Solution     string         `json:"solution" yaml:"solution"`
	Scavenger    sdk.AccAddress `json:"scavenger" yaml:"scavenger"`
}

func (s Scavenge) String() string {
	return strings.TrimSpace(fmt.Sprintf(`Creator: %s
	Description: %s
	SolutionHash: %s
	Reward: %s
	Solution: %s
	Scavenger: %s`,
		s.Creator,
		s.Description,
		s.SolutionHash,
		s.Reward,
		s.Solution,
		s.Scavenger,
	))
}
