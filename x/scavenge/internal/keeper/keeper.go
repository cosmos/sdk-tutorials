package keeper

import (
	"fmt"

	"github.com/tendermint/tendermint/libs/log"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/x/bank"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// Keeper of the scavenge store
type Keeper struct {
	CoinKeeper bank.Keeper
	storeKey   sdk.StoreKey
	cdc        *codec.Codec
	codespace  sdk.CodespaceType
}

// NewKeeper creates a scavenge keeper
func NewKeeper(coinKeeper bank.Keeper, cdc *codec.Codec, key sdk.StoreKey, codespace sdk.CodespaceType) Keeper {
	keeper := Keeper{
		CoinKeeper: coinKeeper,
		storeKey:   key,
		cdc:        cdc,
		codespace:  codespace,
	}
	return keeper
}

// Logger returns a module-specific logger.
func (k Keeper) Logger(ctx sdk.Context) log.Logger {
	return ctx.Logger().With("module", fmt.Sprintf("x/%s", types.ModuleName))
}

// GetCommit returns the commit of a solution
func (k Keeper) GetCommit(ctx sdk.Context, solutionSolverHash string) (types.Commit, error) {
	store := ctx.KVStore(k.storeKey)
	var commit types.Commit
	byteKey := []byte(solutionSolverHash)
	err := k.cdc.UnmarshalBinaryLengthPrefixed(store.Get(byteKey), &commit)
	if err != nil {
		return nil, err
	}
	return commit, nil
}

// GetScavenge returns the scavenge information
func (k Keeper) GetScavenge(ctx sdk.Context, solutionHash string) (types.Scavenge, error) {
	store := ctx.KVStore(k.storeKey)
	var scavenge types.Scavenge
	byteKey := []byte(solutionHash)
	err := k.cdc.UnmarshalBinaryLengthPrefixed(store.Get(byteKey), &scavenge)
	if err != nil {
		return nil, err
	}
	return scavenge, nil
}

// SetCommit sets a scavenge
func (k Keeper) SetCommit(ctx sdk.Context, commit types.Commit) {
	solutionSolverHash := commit.SolutionSolverHash
	store := ctx.KVStore(k.storeKey)
	bz := k.cdc.MustMarshalBinaryLengthPrefixed(commit)
	store.Set([]byte(solutionSolverHash), bz)
}

// SetScavenge sets a scavenge
func (k Keeper) SetScavenge(ctx sdk.Context, scavenge types.Scavenge) {
	solutionHash := scavenge.SolutionHash
	store := ctx.KVStore(k.storeKey)
	bz := k.cdc.MustMarshalBinaryLengthPrefixed(scavenge)
	store.Set([]byte(solutionHash), bz)
}

// // DeleteScavenge deletes a scavenge
// func (k Keeper) DeleteScavenge(ctx sdk.Context, solutionHash string) {
// 	store := ctx.KVStore(k.storeKey)
// 	store.Delete([]byte(solutionHash))
// }
