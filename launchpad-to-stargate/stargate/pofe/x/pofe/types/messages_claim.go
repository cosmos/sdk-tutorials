package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgCreateClaim{}

func NewMsgCreateClaim(creator string, proof string) *MsgCreateClaim {
  return &MsgCreateClaim{
		Creator: creator,
    Proof: proof,
	}
}

func (msg *MsgCreateClaim) Route() string {
  return RouterKey
}

func (msg *MsgCreateClaim) Type() string {
  return "CreateClaim"
}

func (msg *MsgCreateClaim) GetSigners() []sdk.AccAddress {
  creator, err := sdk.AccAddressFromBech32(msg.Creator)
  if err != nil {
    panic(err)
  }
  return []sdk.AccAddress{creator}
}

func (msg *MsgCreateClaim) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg *MsgCreateClaim) ValidateBasic() error {
  _, err := sdk.AccAddressFromBech32(msg.Creator)
  	if err != nil {
  		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
  	}
  return nil
}

var _ sdk.Msg = &MsgUpdateClaim{}

func NewMsgUpdateClaim(creator string, id string, proof string) *MsgUpdateClaim {
  return &MsgUpdateClaim{
        Id: id,
		Creator: creator,
    Proof: proof,
	}
}

func (msg *MsgUpdateClaim) Route() string {
  return RouterKey
}

func (msg *MsgUpdateClaim) Type() string {
  return "UpdateClaim"
}

func (msg *MsgUpdateClaim) GetSigners() []sdk.AccAddress {
  creator, err := sdk.AccAddressFromBech32(msg.Creator)
  if err != nil {
    panic(err)
  }
  return []sdk.AccAddress{creator}
}

func (msg *MsgUpdateClaim) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg *MsgUpdateClaim) ValidateBasic() error {
  _, err := sdk.AccAddressFromBech32(msg.Creator)
  if err != nil {
    return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
  }
   return nil
}

var _ sdk.Msg = &MsgCreateClaim{}

func NewMsgDeleteClaim(creator string, id string) *MsgDeleteClaim {
  return &MsgDeleteClaim{
        Id: id,
		Creator: creator,
	}
} 
func (msg *MsgDeleteClaim) Route() string {
  return RouterKey
}

func (msg *MsgDeleteClaim) Type() string {
  return "DeleteClaim"
}

func (msg *MsgDeleteClaim) GetSigners() []sdk.AccAddress {
  creator, err := sdk.AccAddressFromBech32(msg.Creator)
  if err != nil {
    panic(err)
  }
  return []sdk.AccAddress{creator}
}

func (msg *MsgDeleteClaim) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg *MsgDeleteClaim) ValidateBasic() error {
  _, err := sdk.AccAddressFromBech32(msg.Creator)
  if err != nil {
    return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
  }
  return nil
}
