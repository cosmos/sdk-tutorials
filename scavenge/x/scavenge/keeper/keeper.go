package keeper

import (
	"fmt"

	"github.com/tendermint/tendermint/libs/log"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/x/bank"
	"github.com/cosmos/sdk-tutorials/scavenge/x/scavenge/types"
)

// Keeper of the scavenge store
type Keeper struct {
	CoinKeeper bank.Keeper
	storeKey   sdk.StoreKey
	cdc        *codec.Codec
}

// NewKeeper creates a scavenge keeper
func NewKeeper(coinKeeper bank.Keeper, cdc *codec.Codec, key sdk.StoreKey) Keeper {
	keeper := Keeper{
		CoinKeeper: coinKeeper,
		storeKey:   key,
		cdc:        cdc,
	}
	return keeper
}

// Logger returns a module-specific logger.
func (k Keeper) Logger(ctx sdk.Context) log.Logger {
	return ctx.Logger().With("module", fmt.Sprintf("x/%s", types.ModuleName))
}

// GetCommit returns the commit of a solution
func (k Keeper) GetCommit(ctx sdk.Context, solutionScavengerHash string) (types.Commit, error) {
	store := ctx.KVStore(k.storeKey)
	var commit types.Commit
	byteKey := []byte(types.CommitPrefix + solutionScavengerHash)
	err := k.cdc.UnmarshalBinaryLengthPrefixed(store.Get(byteKey), &commit)
	if err != nil {
		return commit, err
	}
	return commit, nil
}

// GetScavenge returns the scavenge information
func (k Keeper) GetScavenge(ctx sdk.Context, solutionHash string) (types.Scavenge, error) {
	store := ctx.KVStore(k.storeKey)
	var scavenge types.Scavenge
	byteKey := []byte(types.ScavengePrefix + solutionHash)
	err := k.cdc.UnmarshalBinaryLengthPrefixed(store.Get(byteKey), &scavenge)
	if err != nil {
		return scavenge, err
	}
	return scavenge, nil
}

// SetCommit sets a scavenge
func (k Keeper) SetCommit(ctx sdk.Context, commit types.Commit) {
	solutionScavengerHash := commit.SolutionScavengerHash
	store := ctx.KVStore(k.storeKey)
	bz := k.cdc.MustMarshalBinaryLengthPrefixed(commit)
	key := []byte(types.CommitPrefix + solutionScavengerHash)
	store.Set(key, bz)
}

// SetScavenge sets a scavenge
func (k Keeper) SetScavenge(ctx sdk.Context, scavenge types.Scavenge) {
	solutionHash := scavenge.SolutionHash
	store := ctx.KVStore(k.storeKey)
	bz := k.cdc.MustMarshalBinaryLengthPrefixed(scavenge)
	key := []byte(types.ScavengePrefix + solutionHash)
	store.Set(key, bz)
}

// DeleteScavenge deletes a scavenge
func (k Keeper) DeleteScavenge(ctx sdk.Context, solutionHash string) {
	store := ctx.KVStore(k.storeKey)
	store.Delete([]byte(solutionHash))
}

// GetScavengesIterator gets an iterator over all scavnges in which the keys are the solutionHashes and the values are the scavenges
func (k Keeper) GetScavengesIterator(ctx sdk.Context) sdk.Iterator {
	store := ctx.KVStore(k.storeKey)
	return sdk.KVStorePrefixIterator(store, []byte(types.ScavengePrefix))
}

// GetCommitsIterator gets an iterator over all commits in which the keys are the prefix and solutionHashes and the values are the scavenges
func (k Keeper) GetCommitsIterator(ctx sdk.Context) sdk.Iterator {
	store := ctx.KVStore(k.storeKey)
	return sdk.KVStorePrefixIterator(store, []byte(types.CommitPrefix))
}
