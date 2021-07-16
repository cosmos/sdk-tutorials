package keeper

import (
	"testing"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/example/blog/x/blog/types"
	"github.com/stretchr/testify/assert"
)

func createNComment(keeper *Keeper, ctx sdk.Context, n int) []types.Comment {
	items := make([]types.Comment, n)
	for i := range items {
		items[i].Creator = "any"
		items[i].Id = keeper.AppendComment(ctx, items[i])
	}
	return items
}

func TestCommentGet(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNComment(keeper, ctx, 10)
	for _, item := range items {
		assert.Equal(t, item, keeper.GetComment(ctx, item.Id))
	}
}

func TestCommentExist(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNComment(keeper, ctx, 10)
	for _, item := range items {
		assert.True(t, keeper.HasComment(ctx, item.Id))
	}
}

func TestCommentRemove(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNComment(keeper, ctx, 10)
	for _, item := range items {
		keeper.RemoveComment(ctx, item.Id)
		assert.False(t, keeper.HasComment(ctx, item.Id))
	}
}

func TestCommentGetAll(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNComment(keeper, ctx, 10)
	assert.Equal(t, items, keeper.GetAllComment(ctx))
}

func TestCommentCount(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNComment(keeper, ctx, 10)
	count := uint64(len(items))
	assert.Equal(t, count, keeper.GetCommentCount(ctx))
}
