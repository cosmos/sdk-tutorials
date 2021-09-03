package keeper

import (
	"context"

	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/cosmos-sdk/types/query"
	"github.com/user/planet/x/blog/types"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (k Keeper) TimedoutPostAll(c context.Context, req *types.QueryAllTimedoutPostRequest) (*types.QueryAllTimedoutPostResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var timedoutPosts []*types.TimedoutPost
	ctx := sdk.UnwrapSDKContext(c)

	store := ctx.KVStore(k.storeKey)
	timedoutPostStore := prefix.NewStore(store, types.KeyPrefix(types.TimedoutPostKey))

	pageRes, err := query.Paginate(timedoutPostStore, req.Pagination, func(key []byte, value []byte) error {
		var timedoutPost types.TimedoutPost
		if err := k.cdc.UnmarshalBinaryBare(value, &timedoutPost); err != nil {
			return err
		}

		timedoutPosts = append(timedoutPosts, &timedoutPost)
		return nil
	})

	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &types.QueryAllTimedoutPostResponse{TimedoutPost: timedoutPosts, Pagination: pageRes}, nil
}

func (k Keeper) TimedoutPost(c context.Context, req *types.QueryGetTimedoutPostRequest) (*types.QueryGetTimedoutPostResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var timedoutPost types.TimedoutPost
	ctx := sdk.UnwrapSDKContext(c)

	if !k.HasTimedoutPost(ctx, req.Id) {
		return nil, sdkerrors.ErrKeyNotFound
	}

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.TimedoutPostKey))
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetTimedoutPostIDBytes(req.Id)), &timedoutPost)

	return &types.QueryGetTimedoutPostResponse{TimedoutPost: &timedoutPost}, nil
}
