package keeper

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"cosmossdk.io/collections"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle"
)

type msgServer struct {
	k Keeper
}

var _ oracle.MsgServer = msgServer{}

// NewMsgServerImpl returns an implementation of the module MsgServer interface.
func NewMsgServerImpl(keeper Keeper) oracle.MsgServer {
	return &msgServer{k: keeper}
}

// IncrementCounter defines the handler for the MsgIncrementCounter message.
func (ms msgServer) IncrementCounter(ctx context.Context, msg *oracle.MsgIncrementCounter) (*oracle.MsgIncrementCounterResponse, error) {
	if _, err := ms.k.addressCodec.StringToBytes(msg.Sender); err != nil {
		return nil, fmt.Errorf("invalid sender address: %w", err)
	}

	counter, err := ms.k.Counter.Get(ctx, msg.Sender)
	if err != nil && !errors.Is(err, collections.ErrNotFound) {
		return nil, err
	}

	counter++

	if err := ms.k.Counter.Set(ctx, msg.Sender, counter); err != nil {
		return nil, err
	}

	return &oracle.MsgIncrementCounterResponse{}, nil
}

// UpdateParams params is defining the handler for the MsgUpdateParams message.
func (ms msgServer) UpdateParams(ctx context.Context, msg *oracle.MsgUpdateParams) (*oracle.MsgUpdateParamsResponse, error) {
	if _, err := ms.k.addressCodec.StringToBytes(msg.Authority); err != nil {
		return nil, fmt.Errorf("invalid authority address: %w", err)
	}

	if authority := ms.k.GetAuthority(); !strings.EqualFold(msg.Authority, authority) {
		return nil, fmt.Errorf("unauthorized, authority does not match the module's authority: got %s, want %s", msg.Authority, authority)
	}

	if err := msg.Params.Validate(); err != nil {
		return nil, err
	}

	if err := ms.k.Params.Set(ctx, msg.Params); err != nil {
		return nil, err
	}

	return &oracle.MsgUpdateParamsResponse{}, nil
}
