package voter

import (
	"github.com/cosmonaut/voter/x/voter/keeper"
	"github.com/cosmonaut/voter/x/voter/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// InitGenesis initializes the capability module's state from a provided genesis
// state.
func InitGenesis(ctx sdk.Context, k keeper.Keeper, genState types.GenesisState) {
	// this line is used by starport scaffolding # genesis/module/init
	// Set all the vote
	for _, elem := range genState.VoteList {
		k.SetVote(ctx, *elem)
	}

	// Set vote count
	k.SetVoteCount(ctx, genState.VoteCount)

	// Set all the poll
	for _, elem := range genState.PollList {
		k.SetPoll(ctx, *elem)
	}

	// Set poll count
	k.SetPollCount(ctx, genState.PollCount)

	// this line is used by starport scaffolding # ibc/genesis/init
}

// ExportGenesis returns the capability module's exported genesis.
func ExportGenesis(ctx sdk.Context, k keeper.Keeper) *types.GenesisState {
	genesis := types.DefaultGenesis()

	// this line is used by starport scaffolding # genesis/module/export
	// Get all vote
	voteList := k.GetAllVote(ctx)
	for _, elem := range voteList {
		elem := elem
		genesis.VoteList = append(genesis.VoteList, &elem)
	}

	// Set the current count
	genesis.VoteCount = k.GetVoteCount(ctx)

	// Get all poll
	pollList := k.GetAllPoll(ctx)
	for _, elem := range pollList {
		elem := elem
		genesis.PollList = append(genesis.PollList, &elem)
	}

	// Set the current count
	genesis.PollCount = k.GetPollCount(ctx)

	// this line is used by starport scaffolding # ibc/genesis/export

	return genesis
}
