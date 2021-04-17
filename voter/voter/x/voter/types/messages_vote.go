package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgCreateVote{}

func NewMsgCreateVote(creator string, pollID string, option string) *MsgCreateVote {
	return &MsgCreateVote{
		Creator: creator,
		PollID:  pollID,
		Option:  option,
	}
}

func (msg *MsgCreateVote) Route() string {
	return RouterKey
}

func (msg *MsgCreateVote) Type() string {
	return "CreateVote"
}

func (msg *MsgCreateVote) GetSigners() []sdk.AccAddress {
	creator, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{creator}
}

func (msg *MsgCreateVote) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgCreateVote) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
	}
	return nil
}

var _ sdk.Msg = &MsgUpdateVote{}

func NewMsgUpdateVote(creator string, id uint64, pollID string, option string) *MsgUpdateVote {
	return &MsgUpdateVote{
		Id:      id,
		Creator: creator,
		PollID:  pollID,
		Option:  option,
	}
}

func (msg *MsgUpdateVote) Route() string {
	return RouterKey
}

func (msg *MsgUpdateVote) Type() string {
	return "UpdateVote"
}

func (msg *MsgUpdateVote) GetSigners() []sdk.AccAddress {
	creator, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{creator}
}

func (msg *MsgUpdateVote) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgUpdateVote) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
	}
	return nil
}

var _ sdk.Msg = &MsgCreateVote{}

func NewMsgDeleteVote(creator string, id uint64) *MsgDeleteVote {
	return &MsgDeleteVote{
		Id:      id,
		Creator: creator,
	}
}
func (msg *MsgDeleteVote) Route() string {
	return RouterKey
}

func (msg *MsgDeleteVote) Type() string {
	return "DeleteVote"
}

func (msg *MsgDeleteVote) GetSigners() []sdk.AccAddress {
	creator, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{creator}
}

func (msg *MsgDeleteVote) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgDeleteVote) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
	}
	return nil
}
