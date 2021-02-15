package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgSetClaim{}

type MsgSetClaim struct {
  ID      string      `json:"id" yaml:"id"`
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
  Proof string `json:"proof" yaml:"proof"`
}

func NewMsgSetClaim(creator sdk.AccAddress, id string, proof string) MsgSetClaim {
  return MsgSetClaim{
    ID: id,
		Creator: creator,
    Proof: proof,
	}
}

func (msg MsgSetClaim) Route() string {
  return RouterKey
}

func (msg MsgSetClaim) Type() string {
  return "SetClaim"
}

func (msg MsgSetClaim) GetSigners() []sdk.AccAddress {
  return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

func (msg MsgSetClaim) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg MsgSetClaim) ValidateBasic() error {
  if msg.Creator.Empty() {
    return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
  }
  return nil
}