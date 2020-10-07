package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

// This Msg deletes a name. It was originally called MsgDeleteWhois, and has been modified using search-and-replace to our Msg needs.

var _ sdk.Msg = &MsgDeleteName{}

type MsgDeleteName struct {
	Name  string         `json:"name" yaml:"name"`
	Owner sdk.AccAddress `json:"owner" yaml:"owner"`
}

func NewMsgDeleteName(name string, owner sdk.AccAddress) MsgDeleteName {
	return MsgDeleteName{
		Name:  name,
		Owner: owner,
	}
}

func (msg MsgDeleteName) Route() string {
	return RouterKey
}

func (msg MsgDeleteName) Type() string {
	return "DeleteName"
}

func (msg MsgDeleteName) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{sdk.AccAddress(msg.Owner)}
}

func (msg MsgDeleteName) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg MsgDeleteName) ValidateBasic() error {
	if msg.Owner.Empty() {
		return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "owner can't be empty")
	}
	return nil
}
