package keeper

import (
	"testing"

	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/assert"
	"github.com/user/planet/x/blog/types"
)

func createNSentPost(keeper *Keeper, ctx sdk.Context, n int) []types.SentPost {
	items := make([]types.SentPost, n)
	for i := range items {
		items[i].Creator = "any"
		items[i].Id = keeper.AppendSentPost(ctx, items[i])
	}
	return items
}

func TestSentPostGet(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNSentPost(keeper, ctx, 10)
	for _, item := range items {
		assert.Equal(t, item, keeper.GetSentPost(ctx, item.Id))
	}
}

func TestSentPostExist(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNSentPost(keeper, ctx, 10)
	for _, item := range items {
		assert.True(t, keeper.HasSentPost(ctx, item.Id))
	}
}

func TestSentPostRemove(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNSentPost(keeper, ctx, 10)
	for _, item := range items {
		keeper.RemoveSentPost(ctx, item.Id)
		assert.False(t, keeper.HasSentPost(ctx, item.Id))
	}
}

func TestSentPostGetAll(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNSentPost(keeper, ctx, 10)
	assert.Equal(t, items, keeper.GetAllSentPost(ctx))
}

func TestSentPostCount(t *testing.T) {
	keeper, ctx := setupKeeper(t)
	items := createNSentPost(keeper, ctx, 10)
	count := uint64(len(items))
	assert.Equal(t, count, keeper.GetSentPostCount(ctx))
}
