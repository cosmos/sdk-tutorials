package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgCreatePoll{}

func NewMsgCreatePoll(creator string, title string, options []string) *MsgCreatePoll {
	return &MsgCreatePoll{
		Creator: creator,
		Title:   title,
		Options: options,
	}
}

func (msg *MsgCreatePoll) Route() string {
	return RouterKey
}

func (msg *MsgCreatePoll) Type() string {
	return "CreatePoll"
}

func (msg *MsgCreatePoll) GetSigners() []sdk.AccAddress {
	creator, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{creator}
}

func (msg *MsgCreatePoll) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgCreatePoll) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
	}
	return nil
}

var _ sdk.Msg = &MsgUpdatePoll{}

func NewMsgUpdatePoll(creator string, id uint64, title string, options []string) *MsgUpdatePoll {
	return &MsgUpdatePoll{
		Id:      id,
		Creator: creator,
		Title:   title,
		Options: options,
	}
}

func (msg *MsgUpdatePoll) Route() string {
	return RouterKey
}

func (msg *MsgUpdatePoll) Type() string {
	return "UpdatePoll"
}

func (msg *MsgUpdatePoll) GetSigners() []sdk.AccAddress {
	creator, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{creator}
}

func (msg *MsgUpdatePoll) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgUpdatePoll) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
	}
	return nil
}

var _ sdk.Msg = &MsgDeletePoll{}

func NewMsgDeletePoll(creator string, id uint64) *MsgDeletePoll {
	return &MsgDeletePoll{
		Id:      id,
		Creator: creator,
	}
}
func (msg *MsgDeletePoll) Route() string {
	return RouterKey
}

func (msg *MsgDeletePoll) Type() string {
	return "DeletePoll"
}

func (msg *MsgDeletePoll) GetSigners() []sdk.AccAddress {
	creator, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{creator}
}

func (msg *MsgDeletePoll) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgDeletePoll) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
	}
	return nil
}
