package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Claim struct {
	Creator sdk.AccAddress `json:"creator" yaml:"creator"`
	ID      string         `json:"id" yaml:"id"`
    Proof string `json:"proof" yaml:"proof"`
}