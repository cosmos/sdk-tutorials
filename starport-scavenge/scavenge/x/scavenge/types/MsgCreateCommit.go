package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/google/uuid"
)

var _ sdk.Msg = &MsgCreateCommit{}

type MsgCreateCommit struct {
  ID      string
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
  SolutionHash string `json:"solutionHash" yaml:"solutionHash"`
  SolutionScavengerHash string `json:"solutionScavengerHash" yaml:"solutionScavengerHash"`
}

func NewMsgCreateCommit(creator sdk.AccAddress, solutionHash string, solutionScavengerHash string) MsgCreateCommit {
  return MsgCreateCommit{
    ID: uuid.New().String(),
		Creator: creator,
    SolutionHash: solutionHash,
    SolutionScavengerHash: solutionScavengerHash,
	}
}

func (msg MsgCreateCommit) Route() string {
  return RouterKey
}

func (msg MsgCreateCommit) Type() string {
  return "CreateCommit"
}

func (msg MsgCreateCommit) GetSigners() []sdk.AccAddress {
  return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

func (msg MsgCreateCommit) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg MsgCreateCommit) ValidateBasic() error {
  if msg.Creator.Empty() {
    return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
  }
  return nil
}