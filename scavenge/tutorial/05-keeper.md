# Keeper

After using the `scaffold` command you should have a boilerplate `Keeper` at `./x/scavenge/internal/keeper/keeper.go`. It contains a basic keeper with references to basic functions like `Set`, `Get` and `Delete`.

Our keeper stores all our data for our module. Sometimes a module will import the keeper of another module. This will allow state to be shared and modified across modules. Since we are dealing with coins in our module as bounty rewards, we will need to access the `bank` module's keeper (which we call `CoinKeeper`). Look at our completed `Keeper` and you can see where the `bank` keeper is referenced and how `Set`, `Get` and `Delete` are expanded:

```go
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
```

## Commits and Scavenges
You may notice reference to `types.Commit` and `types.Scavenge` throughout the `Keeper`. These are new structs defined in `./x/scavenge/internal/types/types.go` that contin all necessary information about different scavenge challenges, and different commited solutions to those challenges. They appear similar to the `Msg` types we saw earlier because they contain similar information. You can create this file now and add the following:
```go
package types

import (
	"fmt"
	"strings"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

// Scavenge is the Scavenge struct
type Scavenge struct {
	Creator      sdk.AccAddress `json:"creator" yaml:"creator"`           // address of the scavenger creator
	Description  string         `json:"description" yaml:"description"`   // description of the scavenge
	SolutionHash string         `json:"solutionHash" yaml:"solutionHash"` // solution hash of the scavenge
	Reward       sdk.Coins      `json:"reward" yaml:"reward"`             // reward of the scavenger
	Solution     string         `json:"solution" yaml:"solution"`         // the solution to the scagenve
	Scavenger    sdk.AccAddress `json:"scavenger" yaml:"scavenger"`       // the scavenger who found the solution
}

// implement fmt.Stringer
func (s Scavenge) String() string {
	return strings.TrimSpace(fmt.Sprintf(`Creator: %s
	Description: %s
	SolutionHash: %s
	Reward: %s
	Solution: %s
	Scavenger: %s`,
		s.Creator,
		s.Description,
		s.SolutionHash,
		s.Reward,
		s.Solution,
		s.Scavenger,
	))
}

// Commit is the commit struct
type Commit struct {
	Scavenger             sdk.AccAddress `json:"scavenger" yaml:"scavenger"`                         // address of the scavenger scavenger
	SolutionHash          string         `json:"solutionHash" yaml:"solutionHash"`                   // SolutionHash of the scavenge
	SolutionScavengerHash string         `json:"solutionScavengerHash" yaml:"solutionScavengerHash"` // solution hash of the scavenge
}

// implement fmt.Stringer
func (c Commit) String() string {
	return strings.TrimSpace(fmt.Sprintf(`Scavenger: %s
	SolutionHash: %s
	SolutionScavengerHash: %s`,
		c.Scavenger,
		c.SolutionHash,
		c.SolutionScavengerHash,
	))
}

```
You can imagine that an unsolved `Scavenge` would contain a `nil` value for the fields `Solution` and `Scavenger` before they are solved. You might also notice that each type has the `String` method. This allows us to render the struct as a string for rendering.

## Prefixes

You may notice the use of `types.ScavengePrefix` and `types.CommitPrefix`. These are defined in a file called `./x/scavenge/internal/types/key.go` and help us keep our `Keeper` organized. The `Keeper` is really just a key value store. That means that, similar to an `Object` in javascript, all values are referenced under a key. To access a value, you need to know the key under which it is stored. This is a bit like a unique identifier (UID).

When storing a `Scavenge` we use the key of the `SolutionHash` as a unique ID, for a `Commit` we use the key of the `SolutionScavengeHash`. However since we are storing these two data types in the same location, we may want to distinguish between the types of hashes we use as keys. We can do this by adding prefixes to the hashes that allow us to recognize which is which. For `Scavenge` we add the prefix `sk-` and for `Commit` we add the prefix `ck-`. You should add these to your `key.go` file so it looks as follows:
```go
package types

const (
	// ModuleName is the name of the module
	ModuleName = "scavenge"

	// StoreKey to be used when creating the KVStore
	StoreKey = ModuleName

	// RouterKey to be used for routing msgs
	RouterKey = ModuleName

	QuerierRoute = ModuleName

	ScavengePrefix = "sk-"
	CommitPrefix   = "ck-"
)
```

## Iterators

Sometimes you will want to access a `Commit` or a `Scavenge` directly by their key. That's why we have the methods `GetCommit` and `GetScavenge`. However, sometimes you will want to get every `Scavenge` at once or every `Commit` at once. To do this we use an **Iterator** called `KVStorePrefixIterator`. This utility comes from the `sdk` and iterates over a key store. If you provide a prefix, it will only iterate over the keys that contain that prefix. Since we have prefixes defined for our `Scavenge` and our `Commit` we can use them here to only return our desired data types.

---

Now that you've seen the `Keeper` where every `Commit` and `Scavenge` are stored, we need to connect the messages to the this storage. This process is called _handling_ the messages and is done inside the `Handler`.

Let's take a look [here](./06-handler.md).