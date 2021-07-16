package keeper

import (
	"testing"

	"github.com/cosmonaut/voter/x/voter/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/assert"
)

func createNVote(keeper *Keeper, ctx sdk.Context, n int) []types.Vote {
	items := make([]types.Vote, n)
	for i := range items {
		items[i].Creator = "any"
		items[i].Id = keeper.AppendVote(ctx, items[i])
	}
	return items
}

func TestVoteGet(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNVote(keeper, ctx, 10)
	for _, item := range items {
		assert.Equal(t, item, keeper.GetVote(ctx, item.Id))
	}
}

func TestVoteExist(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNVote(keeper, ctx, 10)
	for _, item := range items {
		assert.True(t, keeper.HasVote(ctx, item.Id))
	}
}

func TestVoteRemove(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNVote(keeper, ctx, 10)
	for _, item := range items {
		keeper.RemoveVote(ctx, item.Id)
		assert.False(t, keeper.HasVote(ctx, item.Id))
	}
}

func TestVoteGetAll(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNVote(keeper, ctx, 10)
	assert.Equal(t, items, keeper.GetAllVote(ctx))
}

func TestVoteCount(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNVote(keeper, ctx, 10)
	count := uint64(len(items))
	assert.Equal(t, count, keeper.GetVoteCount(ctx))
}
