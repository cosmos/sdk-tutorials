package keeper

import (
	"testing"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/assert"
	"github.com/user/planet/x/blog/types"
)

func createNPost(keeper *Keeper, ctx sdk.Context, n int) []types.Post {
	items := make([]types.Post, n)
	for i := range items {
		items[i].Creator = "any"
		items[i].Id = keeper.AppendPost(ctx, items[i])
	}
	return items
}

func TestPostGet(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNPost(keeper, ctx, 10)
	for _, item := range items {
		assert.Equal(t, item, keeper.GetPost(ctx, item.Id))
	}
}

func TestPostExist(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNPost(keeper, ctx, 10)
	for _, item := range items {
		assert.True(t, keeper.HasPost(ctx, item.Id))
	}
}

func TestPostRemove(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNPost(keeper, ctx, 10)
	for _, item := range items {
		keeper.RemovePost(ctx, item.Id)
		assert.False(t, keeper.HasPost(ctx, item.Id))
	}
}

func TestPostGetAll(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNPost(keeper, ctx, 10)
	assert.Equal(t, items, keeper.GetAllPost(ctx))
}

func TestPostCount(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNPost(keeper, ctx, 10)
	count := uint64(len(items))
	assert.Equal(t, count, keeper.GetPostCount(ctx))
}
