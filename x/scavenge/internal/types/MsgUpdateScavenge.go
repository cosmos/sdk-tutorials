package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// MsgUpdateScavenge
// ------------------------------------------------------------------------------
var _ sdk.Msg = &MsgUpdateScavenge{}

// MsgUpdateScavenge - struct for unjailing jailed validator
type MsgUpdateScavenge struct {
	Signer       sdk.AccAddress `json:"signer" yaml:"signer"`             // signer of the msg
	Creator      sdk.AccAddress `json:"creator" yaml:"creator"`           // address of the scavenger creator
	Description  string         `json:"description" yaml:"description"`   // description of the scavenge
	SolutionHash string         `json:"solutionHash" yaml:"solutionHash"` // solution hash of the scavenge
	Reward       sdk.Coins      `json:"reward" yaml:"reward"`             // reward of the scavenger
}

// NewMsgUpdateScavenge creates a new MsgUpdateScavenge instance
func NewMsgUpdateScavenge(signer, creator sdk.AccAddress, description, solutionHash string, reward sdk.Coins) MsgUpdateScavenge {
	return MsgUpdateScavenge{
		Signer:       signer,
		Creator:      creator,
		Description:  description,
		SolutionHash: solutionHash,
		Reward:       reward,
	}
}

// UpdateScavengeConst is UpdateScavenge Constant
const UpdateScavengeConst = "UpdateScavenge"

// nolint
func (msg MsgUpdateScavenge) Route() string { return RouterKey }
func (msg MsgUpdateScavenge) Type() string  { return UpdateScavengeConst }
func (msg MsgUpdateScavenge) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{sdk.AccAddress(msg.Signer)}
}

// GetSignBytes gets the bytes for the message signer to sign on
func (msg MsgUpdateScavenge) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

// ValidateBasic validity check for the AnteHandler
func (msg MsgUpdateScavenge) ValidateBasic() sdk.Error {
	if msg.Signer.Empty() {
		return sdk.NewError(DefaultCodespace, CodeInvalid, "Signer can't be empty")
	}
	if msg.SolutionHash == "" {
		return sdk.NewError(DefaultCodespace, CodeInvalid, "SolutionHash can't be empty")
	}
	return nil
}
