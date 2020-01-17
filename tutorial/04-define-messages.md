# Define Messages

Messages are a great place to start when building a module because they define the actions that your application can make. Think of all the scenarios where a user would be able to update the state of the application in any way. These should be boiled down into basic interactions, similar to **CRUD** (Create, Read, Update, Delete). Let's start with **Create**

## MsgCreateScavenge
Messages are `types` which live inside the `./x/scavenge/internal/types/` directory. There is already a `msg.go` file but we will make a new file for each Message type. We can use `msg.go` as a starting point by renaming it to `MsgCreateScavenge.go` like `mv ./x/scavenge/internal/types/msg.go  ./x/scavenge/internal/types/MsgCreateScavenge.go` if your current working directory is the root of your application. Inside this new file we will uncomment and follow the instructions of renaming variables until it looks as follows:
```go
package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// MsgCreateScavenge
// ------------------------------------------------------------------------------
var _ sdk.Msg = &MsgCreateScavenge{}

// MsgCreateScavenge - struct for unjailing jailed validator
type MsgCreateScavenge struct {
	Creator      sdk.AccAddress `json:"creator" yaml:"creator"`           // address of the scavenger creator
	Description  string         `json:"description" yaml:"description"`   // description of the scavenge
	SolutionHash string         `json:"solutionHash" yaml:"solutionHash"` // solution hash of the scavenge
	Reward       sdk.Coins      `json:"reward" yaml:"reward"`             // reward of the scavenger
}

// NewMsgCreateScavenge creates a new MsgCreateScavenge instance
func NewMsgCreateScavenge(creator sdk.AccAddress, description, solutionHash string, reward sdk.Coins) MsgCreateScavenge {
	return MsgCreateScavenge{
		Creator:      creator,
		Description:  description,
		SolutionHash: solutionHash,
		Reward:       reward,
	}
}

// CreateScavengeConst is CreateScavenge Constant
const CreateScavengeConst = "CreateScavenge"

// nolint
func (msg MsgCreateScavenge) Route() string { return RouterKey }
func (msg MsgCreateScavenge) Type() string  { return CreateScavengeConst }
func (msg MsgCreateScavenge) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}

// GetSignBytes gets the bytes for the message signer to sign on
func (msg MsgCreateScavenge) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

// ValidateBasic validity check for the AnteHandler
func (msg MsgCreateScavenge) ValidateBasic() sdk.Error {
	if msg.Creator.Empty() {
		return sdk.NewError(DefaultCodespace, CodeInvalid, "Creator can't be empty")
	}
	if msg.SolutionHash == "" {
		return sdk.NewError(DefaultCodespace, CodeInvalid, "SolutionHash can't be empty")
	}
	return nil
}
```

Notice that all Messages in the app need to follow the `sdk.Msg` interface. The Message `struct` contains all the necessary information when creating a new scavenge: 
 * `Creator` - Who created it. This uses the `sdk.AccAddress` type which represents an account in the app controlled by public key cryptograhy.
 * `Description` - What is the question to be solved or description of the challenge.
 * `SolutionHash` - The scrambled solution.
 * `Reward` - This is the bounty that is awarded to whoever submits the answer first.
The `Msg` interface requires some other methods be set, like validating the content of the struct, and confirming the msg was signed and submitted by the Creator.

Now that one can create a scavenge the only other essential action is to be able to solve it. This should be broken into two separate actions as described before: `MsgCommitSolution` and `MsgRevealSolution`. Let's take a look at them at [Commit and Reveal Messages](`./05-commit-reveal-msgs.md`).