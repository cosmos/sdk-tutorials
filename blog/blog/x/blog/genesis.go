package blog

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/example/blog/x/blog/keeper"
	"github.com/example/blog/x/blog/types"
)

// InitGenesis initializes the capability module's state from a provided genesis
// state.
func InitGenesis(ctx sdk.Context, k keeper.Keeper, genState types.GenesisState) {
	// this line is used by starport scaffolding # genesis/module/init
	// Set all the comment
	for _, elem := range genState.CommentList {
		k.SetComment(ctx, *elem)
	}

	// Set comment count
	k.SetCommentCount(ctx, genState.CommentCount)

	// this line is used by starport scaffolding # ibc/genesis/init
}

// ExportGenesis returns the capability module's exported genesis.
func ExportGenesis(ctx sdk.Context, k keeper.Keeper) *types.GenesisState {
	genesis := types.DefaultGenesis()

	// this line is used by starport scaffolding # genesis/module/export
	// Get all comment
	commentList := k.GetAllComment(ctx)
	for _, elem := range commentList {
		elem := elem
		genesis.CommentList = append(genesis.CommentList, &elem)
	}

	// Set the current count
	genesis.CommentCount = k.GetCommentCount(ctx)

	// this line is used by starport scaffolding # ibc/genesis/export

	return genesis
}
