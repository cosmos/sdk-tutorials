package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Post struct {
	Creator sdk.AccAddress `json:"creator" yaml:"creator"`
	ID      string         `json:"id" yaml:"id"`
  Title string `json:"title" yaml:"title"`
  Body string `json:"body" yaml:"body"`
}