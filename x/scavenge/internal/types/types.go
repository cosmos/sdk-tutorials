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
	Solver             sdk.AccAddress `json:"solver" yaml:"solver"`                         // address of the scavenger solver
	SolutionHash       string         `json:"solutionHash" yaml:"solutionHash"`             // SolutionHash of the scavenge
	SolutionSolverHash string         `json:"solutionSolverHash" yaml:"solutionSolverHash"` // solution hash of the scavenge
}
