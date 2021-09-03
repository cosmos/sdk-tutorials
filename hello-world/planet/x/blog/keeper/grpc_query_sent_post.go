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

func (k Keeper) SentPostAll(c context.Context, req *types.QueryAllSentPostRequest) (*types.QueryAllSentPostResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var sentPosts []*types.SentPost
	ctx := sdk.UnwrapSDKContext(c)

	store := ctx.KVStore(k.storeKey)
	sentPostStore := prefix.NewStore(store, types.KeyPrefix(types.SentPostKey))

	pageRes, err := query.Paginate(sentPostStore, req.Pagination, func(key []byte, value []byte) error {
		var sentPost types.SentPost
		if err := k.cdc.UnmarshalBinaryBare(value, &sentPost); err != nil {
			return err
		}

		sentPosts = append(sentPosts, &sentPost)
		return nil
	})

	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &types.QueryAllSentPostResponse{SentPost: sentPosts, Pagination: pageRes}, nil
}

func (k Keeper) SentPost(c context.Context, req *types.QueryGetSentPostRequest) (*types.QueryGetSentPostResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var sentPost types.SentPost
	ctx := sdk.UnwrapSDKContext(c)

	if !k.HasSentPost(ctx, req.Id) {
		return nil, sdkerrors.ErrKeyNotFound
	}

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.SentPostKey))
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetSentPostIDBytes(req.Id)), &sentPost)

	return &types.QueryGetSentPostResponse{SentPost: &sentPost}, nil
}
