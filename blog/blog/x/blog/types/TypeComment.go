package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

type Comment struct {
	Creator sdk.AccAddress `json:"creator" yaml:"creator"`
	ID      string         `json:"id" yaml:"id"`
	Body    string         `json:"body" yaml:"body"`
	PostID  string         `json:"postID" yaml:"postID"`
}
