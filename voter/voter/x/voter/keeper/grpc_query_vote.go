package keeper

import (
	"context"

	"github.com/cosmonaut/voter/x/voter/types"
	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/cosmos/cosmos-sdk/types/query"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (k Keeper) VoteAll(c context.Context, req *types.QueryAllVoteRequest) (*types.QueryAllVoteResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var votes []*types.Vote
	ctx := sdk.UnwrapSDKContext(c)

	store := ctx.KVStore(k.storeKey)
	voteStore := prefix.NewStore(store, types.KeyPrefix(types.VoteKey))

	pageRes, err := query.Paginate(voteStore, req.Pagination, func(key []byte, value []byte) error {
		var vote types.Vote
		if err := k.cdc.UnmarshalBinaryBare(value, &vote); err != nil {
			return err
		}

		votes = append(votes, &vote)
		return nil
	})

	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &types.QueryAllVoteResponse{Vote: votes, Pagination: pageRes}, nil
}

func (k Keeper) Vote(c context.Context, req *types.QueryGetVoteRequest) (*types.QueryGetVoteResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var vote types.Vote
	ctx := sdk.UnwrapSDKContext(c)

	if !k.HasVote(ctx, req.Id) {
		return nil, sdkerrors.ErrKeyNotFound
	}

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.VoteKey))
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetVoteIDBytes(req.Id)), &vote)

	return &types.QueryGetVoteResponse{Vote: &vote}, nil
}
