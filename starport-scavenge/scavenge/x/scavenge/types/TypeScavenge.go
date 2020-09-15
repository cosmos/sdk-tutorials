package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Scavenge struct {
	Creator sdk.AccAddress `json:"creator" yaml:"creator"`
	ID      string         `json:"id" yaml:"id"`
  Description string `json:"description" yaml:"description"`
  SolutionHash string `json:"solutionHash" yaml:"solutionHash"`
  Reward string `json:"reward" yaml:"reward"`
  Solution string `json:"solution" yaml:"solution"`
  Scavenger string `json:"scavenger" yaml:"scavenger"`
}