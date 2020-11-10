package scavenge

import (
	"crypto/sha256"
	"encoding/hex"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/sdk-tutorials/scavenge/scavenge/x/scavenge/keeper"
	"github.com/cosmos/sdk-tutorials/scavenge/scavenge/x/scavenge/types"
	"github.com/tendermint/tendermint/crypto"
)

func handleMsgRevealSolution(ctx sdk.Context, k keeper.Keeper, msg types.MsgRevealSolution) (*sdk.Result, error) {
	var solutionScavengerBytes = []byte(msg.Solution + msg.Scavenger.String())
	var solutionScavengerHash = sha256.Sum256(solutionScavengerBytes)
	var solutionScavengerHashString = hex.EncodeToString(solutionScavengerHash[:])
	_, err := k.GetCommit(ctx, solutionScavengerHashString)
	if err != nil {
		return nil, sdkerrors.Wrap(err, "Commit with that hash doesn't exists")
	}

	var solutionHash = sha256.Sum256([]byte(msg.Solution))
	var solutionHashString = hex.EncodeToString(solutionHash[:])
	var scavenge types.Scavenge
	scavenge, err = k.GetScavenge(ctx, solutionHashString)
	if err != nil {
		return nil, sdkerrors.Wrap(err, "Scavenge with that solution hash doesn't exists")
	}
	if scavenge.Scavenger != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrInvalidRequest, "Scavenge has already been solved")
	}
	scavenge.Scavenger = msg.Scavenger
	scavenge.Solution = msg.Solution

	moduleAcct := sdk.AccAddress(crypto.AddressHash([]byte(types.ModuleName)))
	sdkError := k.CoinKeeper.SendCoins(ctx, moduleAcct, scavenge.Scavenger, scavenge.Reward)
	if sdkError != nil {
		return nil, sdkError
	}
	k.SetScavenge(ctx, scavenge)
	ctx.EventManager().EmitEvent(
		sdk.NewEvent(
			sdk.EventTypeMessage,
			sdk.NewAttribute(sdk.AttributeKeyModule, types.AttributeValueCategory),
			sdk.NewAttribute(sdk.AttributeKeyAction, types.EventTypeSolveScavenge),
			sdk.NewAttribute(sdk.AttributeKeySender, msg.Scavenger.String()),
			sdk.NewAttribute(types.AttributeSolutionHash, solutionHashString),
			sdk.NewAttribute(types.AttributeDescription, scavenge.Description),
			sdk.NewAttribute(types.AttributeSolution, msg.Solution),
			sdk.NewAttribute(types.AttributeScavenger, scavenge.Scavenger.String()),
			sdk.NewAttribute(types.AttributeReward, scavenge.Reward.String()),
		),
	)
	return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
