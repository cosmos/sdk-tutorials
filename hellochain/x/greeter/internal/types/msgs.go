package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// RouterKey is used to route messages and queriers to the greeter module
const RouterKey = "greeter"

// MsgGreet defines the MsgGreet Message
type MsgGreet struct {
	Body      string         // content of the greeting
	Sender    sdk.AccAddress // account signing and sending the greeting
	Recipient sdk.AccAddress // account designated as recipient of the greeeting (not a signer)
}

// NewMsgGreet is a constructor function for MsgGreet
func NewMsgGreet(sender sdk.AccAddress, body string, recipient sdk.AccAddress) MsgGreet {
	return MsgGreet{
		Body:      body,
		Sender:    sender,
		Recipient: recipient,
	}
}

// Route should return the name of the module
func (msg MsgGreet) Route() string { return RouterKey }

// Type should return the action
func (msg MsgGreet) Type() string { return "greet" }

// ValidateBasic runs stateless checks on the message
func (msg MsgGreet) ValidateBasic() sdk.Error {
	if msg.Recipient.Empty() {
		return sdk.ErrInvalidAddress(msg.Recipient.String())
	}
	if len(msg.Sender) == 0 || len(msg.Body) == 0 || len(msg.Recipient) == 0 {

		return sdk.ErrUnknownRequest("Sender, Recipient and/or Body cannot be empty")
	}
	return nil
}

// GetSigners returns the addresses of those required to sign the message
func (msg MsgGreet) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{msg.Sender}
}

// GetSignBytes encodes the message for signing
func (msg MsgGreet) GetSignBytes() []byte {
	return sdk.MustSortJSON(ModuleCdc.MustMarshalJSON(msg))
}
