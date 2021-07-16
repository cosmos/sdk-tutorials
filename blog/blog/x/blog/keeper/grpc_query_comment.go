package keeper

import (
	"context"

	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/cosmos-sdk/types/query"
	"github.com/example/blog/x/blog/types"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (k Keeper) CommentAll(c context.Context, req *types.QueryAllCommentRequest) (*types.QueryAllCommentResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var comments []*types.Comment
	ctx := sdk.UnwrapSDKContext(c)

	store := ctx.KVStore(k.storeKey)
	commentStore := prefix.NewStore(store, types.KeyPrefix(types.CommentKey))

	pageRes, err := query.Paginate(commentStore, req.Pagination, func(key []byte, value []byte) error {
		var comment types.Comment
		if err := k.cdc.UnmarshalBinaryBare(value, &comment); err != nil {
			return err
		}

		comments = append(comments, &comment)
		return nil
	})

	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &types.QueryAllCommentResponse{Comment: comments, Pagination: pageRes}, nil
}

func (k Keeper) Comment(c context.Context, req *types.QueryGetCommentRequest) (*types.QueryGetCommentResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var comment types.Comment
	ctx := sdk.UnwrapSDKContext(c)

	if !k.HasComment(ctx, req.Id) {
		return nil, sdkerrors.ErrKeyNotFound
	}

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.CommentKey))
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetCommentIDBytes(req.Id)), &comment)

	return &types.QueryGetCommentResponse{Comment: &comment}, nil
}
