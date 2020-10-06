package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// This Msg sets values for a name, and has been modified using search-and-replace to our Msg needs.

var _ sdk.Msg = &MsgSetName{}

type MsgSetName struct {
	Owner sdk.AccAddress `json:"owner" yaml:"owner"`
	Value string         `json:"value" yaml:"value"`
	Name  string         `json:"name" yaml:"name"`
}

func NewMsgSetName(owner sdk.AccAddress, name string, value string) MsgSetName {
	return MsgSetName{
		Owner: owner,
		Value: value,
		Name:  name,
	}
}

func (msg MsgSetName) Route() string {
	return RouterKey
}

func (msg MsgSetName) Type() string {
	return "SetName"
}

func (msg MsgSetName) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{sdk.AccAddress(msg.Owner)}
}

func (msg MsgSetName) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg MsgSetName) ValidateBasic() error {
	if msg.Owner.Empty() {
		return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "owner can't be empty")
	}
	if len(msg.Name) == 0 || len(msg.Value) == 0 {
		return sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "Name and/or Value cannot be empty")
	}
	return nil
}
