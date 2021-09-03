package keeper

import (
	"testing"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/assert"
	"github.com/user/planet/x/blog/types"
)

func createNTimedoutPost(keeper *Keeper, ctx sdk.Context, n int) []types.TimedoutPost {
	items := make([]types.TimedoutPost, n)
	for i := range items {
		items[i].Creator = "any"
		items[i].Id = keeper.AppendTimedoutPost(ctx, items[i])
	}
	return items
}

func TestTimedoutPostGet(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNTimedoutPost(keeper, ctx, 10)
	for _, item := range items {
		assert.Equal(t, item, keeper.GetTimedoutPost(ctx, item.Id))
	}
}

func TestTimedoutPostExist(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNTimedoutPost(keeper, ctx, 10)
	for _, item := range items {
		assert.True(t, keeper.HasTimedoutPost(ctx, item.Id))
	}
}

func TestTimedoutPostRemove(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNTimedoutPost(keeper, ctx, 10)
	for _, item := range items {
		keeper.RemoveTimedoutPost(ctx, item.Id)
		assert.False(t, keeper.HasTimedoutPost(ctx, item.Id))
	}
}

func TestTimedoutPostGetAll(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNTimedoutPost(keeper, ctx, 10)
	assert.Equal(t, items, keeper.GetAllTimedoutPost(ctx))
}

func TestTimedoutPostCount(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNTimedoutPost(keeper, ctx, 10)
	count := uint64(len(items))
	assert.Equal(t, count, keeper.GetTimedoutPostCount(ctx))
}
