package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgDeleteWhois{}

type MsgDeleteWhois struct {
  ID      string         `json:"id" yaml:"id"`
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
}

func NewMsgDeleteWhois(id string, creator sdk.AccAddress) MsgDeleteWhois {
  return MsgDeleteWhois{
    ID: id,
		Creator: creator,
	}
}

func (msg MsgDeleteWhois) Route() string {
  return RouterKey
}

func (msg MsgDeleteWhois) Type() string {
  return "DeleteWhois"
}

func (msg MsgDeleteWhois) GetSigners() []sdk.AccAddress {
  return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

func (msg MsgDeleteWhois) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg MsgDeleteWhois) ValidateBasic() error {
  if msg.Creator.Empty() {
    return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
  }
  return nil
}