package keeper

import (
	"context"
	"errors"

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

func (qs queryServer) Name(ctx context.Context, r *auction.QueryNameRequest) (*auction.QueryNameResponse, error) {
	if r == nil {
		return nil, errors.New("empty request")
	}
	if len(r.Name) == 0 {
		return nil, auction.ErrEmptyName
	}

	record, err := qs.k.GetNameRecord(ctx, r.Name)
	if err != nil {
		return nil, err
	}

	return &auction.QueryNameResponse{
		Name: &record,
	}, nil
}
