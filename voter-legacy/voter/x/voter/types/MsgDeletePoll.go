package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgDeletePoll{}

type MsgDeletePoll struct {
  ID      string         `json:"id" yaml:"id"`
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
}

func NewMsgDeletePoll(id string, creator sdk.AccAddress) MsgDeletePoll {
  return MsgDeletePoll{
    ID: id,
		Creator: creator,
	}
}

func (msg MsgDeletePoll) Route() string {
  return RouterKey
}

func (msg MsgDeletePoll) Type() string {
  return "DeletePoll"
}

func (msg MsgDeletePoll) GetSigners() []sdk.AccAddress {
  return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

func (msg MsgDeletePoll) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg MsgDeletePoll) ValidateBasic() error {
  if msg.Creator.Empty() {
    return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
  }
  return nil
}