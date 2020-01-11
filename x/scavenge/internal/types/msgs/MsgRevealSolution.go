package msgs

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// MsgRevealSolution
// ------------------------------------------------------------------------------
var _ sdk.Msg = &MsgRevealSolution{}

// MsgRevealSolution - struct for unjailing jailed validator
type MsgRevealSolution struct {
	Scavenger    sdk.AccAddress `json:"scavenger" yaml:"scavenger"`       // address of the scavenger scavenger
	SolutionHash string         `json:"solutionHash" yaml:"solutionHash"` // SolutionHash of the scavenge
	Solution     string         `json:"solution" yaml:"solution"`         // solution of the scavenge
}

// NewMsgRevealSolution creates a new MsgRevealSolution instance
func NewMsgRevealSolution(scavenger sdk.AccAddress, solutionHash string, solution string) MsgRevealSolution {
	return MsgRevealSolution{
		Scavenger:    scavenger,
		SolutionHash: solutionHash,
		Solution:     solution,
	}
}

// RevealSolutionConst is RevealSolution Constant
const RevealSolutionConst = "RevealSolution"

// nolint
func (msg MsgRevealSolution) Route() string { return types.RouterKey }
func (msg MsgRevealSolution) Type() string  { return RevealSolutionConst }
func (msg MsgRevealSolution) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{sdk.AccAddress(msg.Scavenger)}
}

// GetSignBytes gets the bytes for the message signer to sign on
func (msg MsgRevealSolution) GetSignBytes() []byte {
	bz := types.ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

// ValidateBasic validity check for the AnteHandler
func (msg MsgRevealSolution) ValidateBasic() sdk.Error {
	if msg.Scavenger.Empty() {
		return sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "Creator can't be empty")
	}
	if msg.SolutionHash == "" {
		return sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "SolutionHash can't be empty")
	}
	if msg.Solution == "" {
		return sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "Solution can't be empty")
	}
	return nil
}
