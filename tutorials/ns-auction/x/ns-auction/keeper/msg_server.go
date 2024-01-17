package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"

	ns "github.com/cosmos/sdk-tutorials/tutorials/ns-auction/x/ns-auction"
)

type msgServer struct {
	k Keeper
}

var _ ns.MsgServer = msgServer{}

func NewMsgServerImpl(keeper Keeper) ns.MsgServer {
	return &msgServer{k: keeper}
}

func (ms msgServer) Bid(goCtx context.Context, msg *ns.MsgBid) (*ns.MsgBidResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	if err := ms.k.checkAvailability(ctx, msg.Name); err != nil {
		return nil, err
	}

	nameReservation, err := ms.k.validateAndFormat(ctx, msg)
	if err != nil {
		return nil, err
	}

	if err = ms.k.reserveName(ctx, nameReservation); err != nil {
		return nil, err
	}

	return &ns.MsgBidResponse{}, nil
}
