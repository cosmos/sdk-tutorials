package keeper

import (
	"testing"

	"github.com/cosmonaut/voter/x/voter/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/assert"
)

func createNPoll(keeper *Keeper, ctx sdk.Context, n int) []types.Poll {
	items := make([]types.Poll, n)
	for i := range items {
		items[i].Creator = "any"
		items[i].Id = keeper.AppendPoll(ctx, items[i])
	}
	return items
}

func TestPollGet(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNPoll(keeper, ctx, 10)
	for _, item := range items {
		assert.Equal(t, item, keeper.GetPoll(ctx, item.Id))
	}
}

func TestPollExist(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNPoll(keeper, ctx, 10)
	for _, item := range items {
		assert.True(t, keeper.HasPoll(ctx, item.Id))
	}
}

func TestPollRemove(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNPoll(keeper, ctx, 10)
	for _, item := range items {
		keeper.RemovePoll(ctx, item.Id)
		assert.False(t, keeper.HasPoll(ctx, item.Id))
	}
}

func TestPollGetAll(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNPoll(keeper, ctx, 10)
	assert.Equal(t, items, keeper.GetAllPoll(ctx))
}

func TestPollCount(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNPoll(keeper, ctx, 10)
	count := uint64(len(items))
	assert.Equal(t, count, keeper.GetPollCount(ctx))
}
