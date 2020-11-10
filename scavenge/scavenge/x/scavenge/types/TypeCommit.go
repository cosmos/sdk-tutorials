package types

import (
	"fmt"
	"strings"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Commit struct {
	Scavenger             sdk.AccAddress `json:"scavenger" yaml:"scavenger"`
	SolutionHash          string         `json:"solutionHash" yaml:"solutionHash"`
	SolutionScavengerHash string         `json:"solutionScavengerHash" yaml:"solutionScavengerHash"`
}

func (c Commit) String() string {
	return strings.TrimSpace(fmt.Sprintf(`Scavenger: %s
	SolutionHash: %s
	SolutionScavengerHash: %s`,
		c.Scavenger,
		c.SolutionHash,
		c.SolutionScavengerHash,
	))
}
