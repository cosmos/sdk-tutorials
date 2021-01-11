package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgSetVote{}

type MsgSetVote struct {
  ID      string      `json:"id" yaml:"id"`
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
  PollID string `json:"pollID" yaml:"pollID"`
  Value string `json:"value" yaml:"value"`
}

func NewMsgSetVote(creator sdk.AccAddress, id string, pollID string, value string) MsgSetVote {
  return MsgSetVote{
    ID: id,
		Creator: creator,
    PollID: pollID,
    Value: value,
	}
}

func (msg MsgSetVote) Route() string {
  return RouterKey
}

func (msg MsgSetVote) Type() string {
  return "SetVote"
}

func (msg MsgSetVote) GetSigners() []sdk.AccAddress {
  return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

func (msg MsgSetVote) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg MsgSetVote) ValidateBasic() error {
  if msg.Creator.Empty() {
    return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
  }
  return nil
}