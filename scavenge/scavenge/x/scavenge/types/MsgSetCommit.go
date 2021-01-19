package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgSetCommit{}

type MsgSetCommit struct {
	Scavenger             sdk.AccAddress `json:"scavenger" yaml:"scavenger"`
	SolutionHash          string         `json:"solutionHash" yaml:"solutionHash"`
	SolutionScavengerHash string         `json:"solutionScavengerHash" yaml:"solutionScavengerHash"`
}

func NewMsgSetCommit(scavenger sdk.AccAddress, id string, solutionHash string, solutionScavengerHash string) MsgSetCommit {
	return MsgSetCommit{
		Scavenger:             scavenger,
		SolutionHash:          solutionHash,
		SolutionScavengerHash: solutionScavengerHash,
	}
}

func (msg MsgSetCommit) Route() string {
	return RouterKey
}

func (msg MsgSetCommit) Type() string {
	return "SetCommit"
}

func (msg MsgSetCommit) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{sdk.AccAddress(msg.Scavenger)}
}

func (msg MsgSetCommit) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg MsgSetCommit) ValidateBasic() error {
	if msg.Scavenger.Empty() {
		return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "scavenger can't be empty")
	}
	return nil
}
