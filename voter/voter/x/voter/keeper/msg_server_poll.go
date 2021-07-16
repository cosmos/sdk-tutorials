package keeper

import (
	"context"
	"fmt"

	"github.com/cosmonaut/voter/x/voter/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/tendermint/tendermint/crypto"
)

func (k msgServer) CreatePoll(goCtx context.Context, msg *types.MsgCreatePoll) (*types.MsgCreatePollResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	moduleAcct := sdk.AccAddress(crypto.AddressHash([]byte(types.ModuleName)))
	feeCoins, err := sdk.ParseCoinsNormalized("200token")
	if err != nil {
		return nil, err
	}

	creatorAddress, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return nil, err
	}
	if err := k.bankKeeper.SendCoins(ctx, creatorAddress, moduleAcct, feeCoins); err != nil {
		return nil, err
	}

	var poll = types.Poll{
		Creator: msg.Creator,
		Title:   msg.Title,
		Options: msg.Options,
	}

	id := k.AppendPoll(
		ctx,
		poll,
	)

	return &types.MsgCreatePollResponse{
		Id: id,
	}, nil
}

func (k msgServer) UpdatePoll(goCtx context.Context, msg *types.MsgUpdatePoll) (*types.MsgUpdatePollResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	var poll = types.Poll{
		Creator: msg.Creator,
		Id:      msg.Id,
		Title:   msg.Title,
		Options: msg.Options,
	}

	// Checks that the element exists
	if !k.HasPoll(ctx, msg.Id) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrKeyNotFound, fmt.Sprintf("key %d doesn't exist", msg.Id))
	}

	// Checks if the the msg sender is the same as the current owner
	if msg.Creator != k.GetPollOwner(ctx, msg.Id) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "incorrect owner")
	}

	k.SetPoll(ctx, poll)

	return &types.MsgUpdatePollResponse{}, nil
}

func (k msgServer) DeletePoll(goCtx context.Context, msg *types.MsgDeletePoll) (*types.MsgDeletePollResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	if !k.HasPoll(ctx, msg.Id) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrKeyNotFound, fmt.Sprintf("key %d doesn't exist", msg.Id))
	}
	if msg.Creator != k.GetPollOwner(ctx, msg.Id) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "incorrect owner")
	}

	k.RemovePoll(ctx, msg.Id)

	return &types.MsgDeletePollResponse{}, nil
}
