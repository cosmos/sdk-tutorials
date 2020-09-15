package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/google/uuid"
)

var _ sdk.Msg = &MsgCreateScavenge{}

type MsgCreateScavenge struct {
  ID      string
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
  Description string `json:"description" yaml:"description"`
  SolutionHash string `json:"solutionHash" yaml:"solutionHash"`
  Reward string `json:"reward" yaml:"reward"`
  Solution string `json:"solution" yaml:"solution"`
  Scavenger string `json:"scavenger" yaml:"scavenger"`
}

func NewMsgCreateScavenge(creator sdk.AccAddress, description string, solutionHash string, reward string, solution string, scavenger string) MsgCreateScavenge {
  return MsgCreateScavenge{
    ID: uuid.New().String(),
		Creator: creator,
    Description: description,
    SolutionHash: solutionHash,
    Reward: reward,
    Solution: solution,
    Scavenger: scavenger,
	}
}

func (msg MsgCreateScavenge) Route() string {
  return RouterKey
}

func (msg MsgCreateScavenge) Type() string {
  return "CreateScavenge"
}

func (msg MsgCreateScavenge) GetSigners() []sdk.AccAddress {
  return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

func (msg MsgCreateScavenge) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}

func (msg MsgCreateScavenge) ValidateBasic() error {
  if msg.Creator.Empty() {
    return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
  }
  return nil
}