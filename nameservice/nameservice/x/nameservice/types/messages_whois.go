package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgCreateWhois{}

func NewMsgCreateWhois(owner string, name string, price int32) *MsgCreateWhois {
	return &MsgCreateWhois{
		Owner: owner,
		Name:  name,
		Price: price,
	}
}

func (msg *MsgCreateWhois) Route() string {
	return RouterKey
}

func (msg *MsgCreateWhois) Type() string {
	return "CreateWhois"
}

func (msg *MsgCreateWhois) GetSigners() []sdk.AccAddress {
	owner, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{owner}
}

func (msg *MsgCreateWhois) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgCreateWhois) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid owner address (%s)", err)
	}
	return nil
}

var _ sdk.Msg = &MsgUpdateWhois{}

func NewMsgUpdateWhois(owner string, id uint64, name string, price int32) *MsgUpdateWhois {
	return &MsgUpdateWhois{
		Id:    id,
		Owner: owner,
		Name:  name,
		Price: price,
	}
}

func (msg *MsgUpdateWhois) Route() string {
	return RouterKey
}

func (msg *MsgUpdateWhois) Type() string {
	return "UpdateWhois"
}

func (msg *MsgUpdateWhois) GetSigners() []sdk.AccAddress {
	owner, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{owner}
}

func (msg *MsgUpdateWhois) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgUpdateWhois) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid owner address (%s)", err)
	}
	return nil
}

var _ sdk.Msg = &MsgCreateWhois{}

func NewMsgDeleteWhois(owner string, id uint64) *MsgDeleteWhois {
	return &MsgDeleteWhois{
		Id:    id,
		Owner: owner,
	}
}
func (msg *MsgDeleteWhois) Route() string {
	return RouterKey
}

func (msg *MsgDeleteWhois) Type() string {
	return "DeleteWhois"
}

func (msg *MsgDeleteWhois) GetSigners() []sdk.AccAddress {
	owner, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{owner}
}

func (msg *MsgDeleteWhois) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgDeleteWhois) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid owner address (%s)", err)
	}
	return nil
}
