package types

import (
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
