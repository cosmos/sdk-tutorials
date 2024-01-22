package keeper

import (
	"context"
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	auction "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"
)

var _ auction.QueryServer = queryServer{}

// NewQueryServerImpl returns an implementation of the module QueryServer.
func NewQueryServerImpl(k Keeper) auction.QueryServer {
	return queryServer{k}
}

type queryServer struct {
	k Keeper
}

func (qs queryServer) Name(goCtx context.Context, r *auction.QueryNameRequest) (*auction.QueryNameResponse, error) {
	if r == nil {
		return nil, fmt.Errorf("Empty Request")
	}
	if len(r.Name) == 0 {
		return nil, auction.ErrEmptyName
	}

	ctx := sdk.UnwrapSDKContext(goCtx)
	record, err := qs.k.GetNameRecord(ctx, r.Name)
	if err != nil {
		return nil, err
	}

	return &auction.QueryNameResponse{
		Name: &record,
	}, nil
}
