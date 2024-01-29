package keeper

import (
	"context"
	"errors"
	"fmt"

	"cosmossdk.io/collections"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle"
)

var _ oracle.QueryServer = queryServer{}

// NewQueryServerImpl returns an implementation of the module QueryServer.
func NewQueryServerImpl(k Keeper) oracle.QueryServer {
	return queryServer{k}
}

type queryServer struct {
	k Keeper
}

// Counter defines the handler for the Query/Counter RPC method.
func (qs queryServer) Counter(ctx context.Context, req *oracle.QueryCounterRequest) (*oracle.QueryCounterResponse, error) {
	if _, err := qs.k.addressCodec.StringToBytes(req.Address); err != nil {
		return nil, fmt.Errorf("invalid sender address: %w", err)
	}

	counter, err := qs.k.Counter.Get(ctx, req.Address)
	if err != nil {
		if errors.Is(err, collections.ErrNotFound) {
			return &oracle.QueryCounterResponse{Counter: 0}, nil
		}

		return nil, status.Error(codes.Internal, err.Error())
	}

	return &oracle.QueryCounterResponse{Counter: counter}, nil
}

func (qs queryServer) Prices(ctx context.Context, req *oracle.QueryPricesRequest) (*oracle.QueryPricesResponse, error) {
	var prices []*oracle.Price

	p, err := qs.k.GetOraclePrices(ctx)
	if err != nil {
		return nil, err
	}

	for symbol, price := range p {
		prices = append(prices, &oracle.Price{
			Symbol: symbol,
			Price:  price.String(),
		})
	}

	return &oracle.QueryPricesResponse{Prices: prices}, nil
}
