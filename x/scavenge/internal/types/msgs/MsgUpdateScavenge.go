package msgs

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// MsgUpdateScavenge
// ------------------------------------------------------------------------------
var _ sdk.Msg = &MsgUpdateScavenge{}

// MsgUpdateScavenge - struct for unjailing jailed validator
type MsgUpdateScavenge struct {
	ID           uint64         `json:"id" yaml:"id"`                     // id of the scavenge
	Signer       sdk.AccAddress `json:"signer" yaml:"signer"`             // signer of the msg
	Creator      sdk.AccAddress `json:"creator" yaml:"creator"`           // address of the scavenger creator
	Description  string         `json:"description" yaml:"description"`   // description of the scavenge
	SolutionHash string         `json:"solutionHash" yaml:"solutionHash"` // solution hash of the scavenge
	Reward       sdk.Coins      `json:"reward" yaml:"reward"`             // reward of the scavenger
}

// NewMsgUpdateScavenge creates a new MsgUpdateScavenge instance
func NewMsgUpdateScavenge(id uint64, signer, creator sdk.AccAddress, description, solutionHash string, reward sdk.Coins) MsgUpdateScavenge {
	return MsgUpdateScavenge{
		ID:           id,
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
func (msg MsgUpdateScavenge) Route() string { return types.RouterKey }
func (msg MsgUpdateScavenge) Type() string  { return UpdateScavengeConst }
func (msg MsgUpdateScavenge) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{sdk.AccAddress(msg.Signer)}
}

// GetSignBytes gets the bytes for the message signer to sign on
func (msg MsgUpdateScavenge) GetSignBytes() []byte {
	bz := types.ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

// ValidateBasic validity check for the AnteHandler
func (msg MsgUpdateScavenge) ValidateBasic() sdk.Error {
	if msg.Signer.Empty() {
		return sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "Signer can't be empty")
	}
	if msg.ID == 0 {
		return sdk.NewError(types.DefaultCodespace, types.CodeInvalid, "ID can't be 0")
	}
	return nil
}
