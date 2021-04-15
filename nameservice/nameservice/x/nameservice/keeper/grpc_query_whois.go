package keeper

import (
	"context"

	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/cosmos-sdk/types/query"
	"github.com/username/nameservice/x/nameservice/types"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (k Keeper) WhoisAll(c context.Context, req *types.QueryAllWhoisRequest) (*types.QueryAllWhoisResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var whoiss []*types.Whois
	ctx := sdk.UnwrapSDKContext(c)

	store := ctx.KVStore(k.storeKey)
	whoisStore := prefix.NewStore(store, types.KeyPrefix(types.WhoisKey))

	pageRes, err := query.Paginate(whoisStore, req.Pagination, func(key []byte, value []byte) error {
		var whois types.Whois
		if err := k.cdc.UnmarshalBinaryBare(value, &whois); err != nil {
			return err
		}

		whoiss = append(whoiss, &whois)
		return nil
	})

	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &types.QueryAllWhoisResponse{Whois: whoiss, Pagination: pageRes}, nil
}

func (k Keeper) Whois(c context.Context, req *types.QueryGetWhoisRequest) (*types.QueryGetWhoisResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var whois types.Whois
	ctx := sdk.UnwrapSDKContext(c)

	if !k.HasWhois(ctx, req.Id) {
		return nil, sdkerrors.ErrKeyNotFound
	}

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetWhoisIDBytes(req.Id)), &whois)

	return &types.QueryGetWhoisResponse{Whois: &whois}, nil
}
