package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgDeleteClaim{}

type MsgDeleteClaim struct {
  ID      string         `json:"id" yaml:"id"`
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
}

func NewMsgDeleteClaim(id string, creator sdk.AccAddress) MsgDeleteClaim {
  return MsgDeleteClaim{
    ID: id,
		Creator: creator,
	}
}

func (msg MsgDeleteClaim) Route() string {
  return RouterKey
}

func (msg MsgDeleteClaim) Type() string {
  return "DeleteClaim"
}

func (msg MsgDeleteClaim) GetSigners() []sdk.AccAddress {
  return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

func (msg MsgDeleteClaim) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg MsgDeleteClaim) ValidateBasic() error {
  if msg.Creator.Empty() {
    return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
  }
  return nil
}