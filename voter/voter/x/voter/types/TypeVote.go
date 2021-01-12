package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Vote struct {
	Creator sdk.AccAddress `json:"creator" yaml:"creator"`
	ID      string         `json:"id" yaml:"id"`
    PollID string `json:"pollID" yaml:"pollID"`
    Value string `json:"value" yaml:"value"`
}