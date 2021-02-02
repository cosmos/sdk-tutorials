package types

// // TODO: Describe your actions, these will implment the interface of `sdk.Msg`
// // Transactions messages must fulfill the Msg
// // type Msg interface {
// // 	// Return the message type.
// // 	// Must be alphanumeric or empty.
// // 	Type() string

// // 	// Returns a human-readable string for the message, intended for utilization
// // 	// within tags
// // 	Route() string

// // 	// ValidateBasic does a simple validation check that
// // 	// doesn't require access to any other information.
// // 	ValidateBasic() Error

// // 	// Get the canonical byte representation of the Msg.
// // 	GetSignBytes() []byte

// // 	// Signers returns the addrs of signers that must sign.
// // 	// CONTRACT: All signatures must be present to be valid.
// // 	// CONTRACT: Returns addrs in some deterministic order.
// // 	GetSigners() []AccAddress
// // }

// // /*
// // verify interface at compile time
// var _ sdk.Msg = &Msg<Action>{}

// // Msg<Action> - struct for unjailing jailed validator
// type Msg<Action> struct {
// 	ValidatorAddr sdk.ValAddress `json:"address" yaml:"address"` // address of the validator operator
// }

// // NewMsg<Action> creates a new Msg<Action> instance
// func NewMsg<Action>(validatorAddr sdk.ValAddress) Msg<Action> {
// 	return Msg<Action>{
// 		ValidatorAddr: validatorAddr,
// 	}
// }

// const <action>Const = "<action>"

// // nolint
// func (msg Msg<Action>) Route() string { return RouterKey }
// func (msg Msg<Action>) Type() string  { return <action>Const }
// func (msg Msg<Action>) GetSigners() []sdk.AccAddress {
// 	return []sdk.AccAddress{sdk.AccAddress(msg.ValidatorAddr)}
// }

// // GetSignBytes gets the bytes for the message signer to sign on
// func (msg Msg<Action>) GetSignBytes() []byte {
// 	bz := ModuleCdc.MustMarshalJSON(msg)
// 	return sdk.MustSortJSON(bz)
// }

// // ValidateBasic validity check for the AnteHandler
// func (msg Msg<Action>) ValidateBasic() error {
// 	if msg.ValidatorAddr.Empty() {
// 		return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "missing validator address")
// 	}
// 	return nil
// }
// */
