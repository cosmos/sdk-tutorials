package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/google/uuid"
)

var _ sdk.Msg = &MsgCreateComment{}

type MsgCreateComment struct {
	ID      string
	Creator sdk.AccAddress `json:"creator" yaml:"creator"`
	Body    string         `json:"body" yaml:"body"`
	PostID  string         `json:"postID" yaml:"postID"`
}

func NewMsgCreateComment(creator sdk.AccAddress, body string, postID string) MsgCreateComment {
	return MsgCreateComment{
		ID:      uuid.New().String(),
		Creator: creator,
		Body:    body,
		PostID:  postID,
	}
}

func (msg MsgCreateComment) Route() string {
	return RouterKey
}

func (msg MsgCreateComment) Type() string {
	return "CreateComment"
}

func (msg MsgCreateComment) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

func (msg MsgCreateComment) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg MsgCreateComment) ValidateBasic() error {
	if msg.Creator.Empty() {
		return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
	}
	return nil
}
