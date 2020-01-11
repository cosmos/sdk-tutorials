package msgs

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// MsgCommitSolution
// ------------------------------------------------------------------------------
var _ sdk.Msg = &MsgCommitSolution{}

// MsgCommitSolution - struct for unjailing jailed validator
type MsgCommitSolution struct {
	Solver             sdk.AccAddress `json:"solver" yaml:"solver"`                         // address of the scavenger solver
	SolutionHash       string         `json:"solutionhash" yaml:"solutionhash"`             // solutionhash of the scavenge
	SolutionSolverHash string         `json:"solutionSolverHash" yaml:"solutionSolverHash"` // solution hash of the scavenge
}

// NewMsgCommitSolution creates a new MsgCommitSolution instance
func NewMsgCommitSolution(solver sdk.AccAddress, solutionHash string, solutionSolverHash string) MsgCommitSolution {
	return MsgCommitSolution{
		Solver:             solver,
		SolutionHash:       solutionHash,
		SolutionSolverHash: solutionSolverHash,
	}
}

// CommitSolutionConst is CommitSolution Constant
const CommitSolutionConst = "CommitSolution"

// nolint
func (msg MsgCommitSolution) Route() string { return types.RouterKey }
func (msg MsgCommitSolution) Type() string  { return CommitSolutionConst }
func (msg MsgCommitSolution) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{sdk.AccAddress(msg.Solver)}
}

// GetSignBytes gets the bytes for the message signer to sign on
func (msg MsgCommitSolution) GetSignBytes() []byte {
	bz := types.ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

// ValidateBasic validity check for the AnteHandler
func (msg MsgCommitSolution) ValidateBasic() sdk.Error {
	if msg.Solver.Empty() {
		return sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "Creator can't be empty")
	}
	if msg.SolutionHash == "" {
		return sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "SolutionHash can't be empty")
	}
	if msg.SolutionSolverHash == "" {
		return sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "SolutionSolverHash can't be empty")
	}
	return nil
}
