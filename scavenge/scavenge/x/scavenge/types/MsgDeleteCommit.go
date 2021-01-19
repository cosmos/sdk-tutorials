package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgDeleteCommit{}

type MsgDeleteCommit struct {
  ID      string         `json:"id" yaml:"id"`
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
}

func NewMsgDeleteCommit(id string, creator sdk.AccAddress) MsgDeleteCommit {
  return MsgDeleteCommit{
    ID: id,
		Creator: creator,
	}
}

func (msg MsgDeleteCommit) Route() string {
  return RouterKey
}

func (msg MsgDeleteCommit) Type() string {
  return "DeleteCommit"
}

func (msg MsgDeleteCommit) GetSigners() []sdk.AccAddress {
  return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

func (msg MsgDeleteCommit) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg MsgDeleteCommit) ValidateBasic() error {
  if msg.Creator.Empty() {
    return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
  }
  return nil
}