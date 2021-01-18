package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Commit struct {
	Scavenger             sdk.AccAddress `json:"scavenger" yaml:"scavenger"`
	SolutionHash          string         `json:"solutionHash" yaml:"solutionHash"`
	SolutionScavengerHash string         `json:"solutionScavengerHash" yaml:"solutionScavengerHash"`
}
