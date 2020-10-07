package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/google/uuid"
)

var _ sdk.Msg = &MsgCreateVote{}

type MsgCreateVote struct {
  ID      string
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
  PollID string `json:"pollID" yaml:"pollID"`
  Value string `json:"value" yaml:"value"`
}

func NewMsgCreateVote(creator sdk.AccAddress, pollID string, value string) MsgCreateVote {
  return MsgCreateVote{
    ID: uuid.New().String(),
		Creator: creator,
    PollID: pollID,
    Value: value,
	}
}

func (msg MsgCreateVote) Route() string {
  return RouterKey
}

func (msg MsgCreateVote) Type() string {
  return "CreateVote"
}

func (msg MsgCreateVote) GetSigners() []sdk.AccAddress {
  return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

func (msg MsgCreateVote) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg MsgCreateVote) ValidateBasic() error {
  if msg.Creator.Empty() {
    return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
  }
  return nil
}