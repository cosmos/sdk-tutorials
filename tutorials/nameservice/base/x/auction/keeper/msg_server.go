package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"

	auction "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"
)

type msgServer struct {
	k Keeper
}

var _ auction.MsgServer = msgServer{}

func NewMsgServerImpl(keeper Keeper) auction.MsgServer {
	return &msgServer{k: keeper}
}

func (ms msgServer) Bid(goCtx context.Context, msg *auction.MsgBid) (*auction.MsgBidResponse, error) {
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

	return &auction.MsgBidResponse{}, nil
}
