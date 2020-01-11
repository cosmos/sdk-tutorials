package msgs

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// MsgDeleteScavenge
// ------------------------------------------------------------------------------
var _ sdk.Msg = &MsgDeleteScavenge{}

// MsgDeleteScavenge - struct for unjailing jailed validator
type MsgDeleteScavenge struct {
	SolutionHash string         `json:"solutionHash" yaml:"solutionHash"` // solutionHash of the scavenge
	Creator      sdk.AccAddress `json:"creator" yaml:"creator"`           // address of the scavenger creator
}

// NewMsgDeleteScavenge creates a new MsgDeleteScavenge instance
func NewMsgDeleteScavenge(solutionHash string, creator sdk.AccAddress) MsgDeleteScavenge {
	return MsgDeleteScavenge{
		SolutionHash: solutionHash,
		Creator:      creator,
	}
}

// DeleteScavengeConst is DeleteScavenge Constant
const DeleteScavengeConst = "DeleteScavenge"

// nolint
func (msg MsgDeleteScavenge) Route() string { return types.RouterKey }
func (msg MsgDeleteScavenge) Type() string  { return DeleteScavengeConst }
func (msg MsgDeleteScavenge) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

// GetSignBytes gets the bytes for the message signer to sign on
func (msg MsgDeleteScavenge) GetSignBytes() []byte {
	bz := types.ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

// ValidateBasic validity check for the AnteHandler
func (msg MsgDeleteScavenge) ValidateBasic() sdk.Error {
	if msg.Creator.Empty() {
		return sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "Creator can't be empty")
	}
	if msg.SolutionHash == "" {
		return sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "SolutionHash can't be empty")
	}
	return nil
}
