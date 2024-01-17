package keeper

import (
	"context"
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	ns "github.com/cosmos/sdk-tutorials/tutorials/ns-auction/x/ns-auction"
)

var _ ns.QueryServer = queryServer{}

// NewQueryServerImpl returns an implementation of the module QueryServer.
func NewQueryServerImpl(k Keeper) ns.QueryServer {
	return queryServer{k}
}

type queryServer struct {
	k Keeper
}

func (qs queryServer) Name(goCtx context.Context, r *ns.QueryNameRequest) (*ns.QueryNameResponse, error) {
	if r == nil {
		return nil, fmt.Errorf("Empty Request")
	}
	if len(r.Name) == 0 {
		return nil, ns.ErrEmptyName
	}

	ctx := sdk.UnwrapSDKContext(goCtx)
	record, err := qs.k.GetNameRecord(ctx, r.Name)
	if err != nil {
		return nil, err
	}

	return &ns.QueryNameResponse{
		Name: &record,
	}, nil
}
