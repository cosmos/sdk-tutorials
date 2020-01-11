package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// Scavenge is the Scavenge struct
type Scavenge struct {
	Creator      sdk.AccAddress `json:"creator" yaml:"creator"`           // address of the scavenger creator
	Description  string         `json:"description" yaml:"description"`   // description of the scavenge
	SolutionHash string         `json:"solutionHash" yaml:"solutionHash"` // solution hash of the scavenge
	Reward       sdk.Coins      `json:"reward" yaml:"reward"`             // reward of the scavenger
	Solution     string         `json:"solution" yaml:"solution"`         // the solution to the scagenve
	Scavenger    sdk.AccAddress `json:"scavenger" yaml:"scavenger"`       // the scavenger who found the solution
}

// Commit is the commit struct
type Commit struct {
	Scavenger             sdk.AccAddress `json:"scavenger" yaml:"scavenger"`                         // address of the scavenger scavenger
	SolutionHash          string         `json:"solutionHash" yaml:"solutionHash"`                   // SolutionHash of the scavenge
	SolutionScavengerHash string         `json:"solutionScavengerHash" yaml:"solutionScavengerHash"` // solution hash of the scavenge
}
