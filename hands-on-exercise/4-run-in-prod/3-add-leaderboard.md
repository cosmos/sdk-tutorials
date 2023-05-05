---
title: "Add a Leaderboard Module"
order: 4
description: A leaderboard integrated with checkers for your blockchain
tags: 
  - guided-coding
  - cosmos-sdk
  - cosm-js
---

# Add a Leaderboard Module

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md), [modules](/academy/2-cosmos-concepts/5-modules.md), and [migrations](/academy/2-cosmos-concepts/13-migrations.md).
* Go is installed.
* You have the checkers blockchain codebase up to the _Tally Player Info After Production_. If not, follow the [previous steps](/hands-on-exercise/4-run-in-prod/2-migration-info.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/player-info-migration).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add a new module.
* Add a leaderboard storage type.
* Add hooks for loose coupling of modules.
* Use the transient store.

</HighlightBox>

In the previous section you added a player info structure that tallies wins and losses per player. On its own, this information could be collected outside of the blockchain via a [dedicated server](/hands-on-exercise/3-cosmjs-adv/5-server-side.md).

It was in fact done on-chain so as to make this new step more relevant. If you want an on-chain leaderboard that is provably correct, then you need its information to come from the chain too. You now have the necessary information on-chain in the form of `PlayerInfo`. You need to organize it into a leaderboard.

## High level considerations

Your blockchain is now at _v1.1_. In this section, you will introduce _v2_ of your blockchain with leaderboard support. A good leaderboard fulfills these conditions:

* Any player who has **ever** played should have a tally of games won, lost, and forfeited. You already have that.
* The leaderboard should list the players with the most wins up to a pre-determined number of players. For example, the leaderboard could only include the top 100 scores.
* To avoid squatting and increase engagement, when equal in value the most recent score takes precedence over an _older_ one, so the player with the **more recent score** is listed higher on the leaderboard.

<HighlightBox type="tip">

When you introduce the leaderboard in production, you also have to consider the migration. This concern is covered in the [next section](/hands-on-exercise/4-run-in-prod/4-migration-leaderboard.md).

</HighlightBox>

The leaderboard is not strictly the concern of the game of checkers. It is a side concern. The concept of a leaderboard is also very generic. You could easily imagine it being used for other games. Therefore, it makes sense to introduce it as a **separate module**, next to the checkers module.

The checkers and leaderboard modules will exchange information. More specifically, the leaderboard needs to know when a player's total wins change as this may warrant entering the leaderboard. If you have the checkers module call the leaderboard module, just as it does call the bank when handling wagers, it means that the checkers module needs to know the details of the leaderboard module. It is best to avoid such tight coupling. Fortunately, you can reuse a **_hooks_ pattern** already used in the Cosmos SDK. With this future addition, the leaderboard module adds a listener to the hook interface of the checkers module. Then the checkers module informs the listeners, whether there is none, one, or many.

The leaderboard module will work by listening to results from the checkers module. It will not have messages of it own.

Thinking about early performance optimization, you have to decide what operations the module does when it receives one candidate from the checkers module. The first idea is to:

1. Read the leaderboard from storage, which includes all 100 members.
2. Conditionally add the candidate to the leaderboard.
3. If added, sort and clip the list.
4. Put the leaderboard back in storage.

These are a lot of expensive operations for a single candidate. There is a better way. The leaderboard needs to be computed and saved when the block is prepared, but it does not need to be up to date after each (checkers) transaction. You can imagine keeping the leaderboard, or something approximating it in memory for the whole length of the block. In the section about [expiring games](../2-ignite-cli-adv/4-game-forfeit.md), you learned about `EndBlock`. There is also a `BeginBlock` callback. It is conceivable to prepare the leaderboard in `BeginBlock` and keep **it in the context or a memory or transient storage**. Then it would be recalled with each candidate, and finally, in `EndBlock`, and only there, it would be sorted and clipped before being saved in storage proper.

Even better, actually, you do not need to _prepare_ the leaderboard in `BeginBlock`. You can just keep candidates in the transient storage as they come. Then only in `EndBlock` is the leaderboard loaded, updated, and saved.

## What you will do

Several things need to be addressed to build your v2 blockchain:
    
1. Add the leaderboard module.
2. Define your new data types.
3. Add helper functions to encapsulate clearly defined actions, like leaderboard sorting.
4. Prepare keys to store candidates in a transient store.
5. Adjust the existing code to make use of and update the new data types.
6. Add the hooks pattern elements.
7. Handle the leaderboard properly.
8. Configure the app for it.

## New v2 module

As discussed, you introduce a new leaderboard module. This is conveniently done with Ignite CLI. 

Ignite also offers the possibilty to add new `Params` to the module. These are module-wide parameters:

1. Whose original value is defined in the genesis.
2. That can be modified via governance proposal.

It could be interesting to have the length of the leaderboard be defined like that.

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ignite scaffold module leaderboard \
    --params length:uint
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    ignite scaffold module leaderboard \
    --params length:uint
```

</CodeGroupItem>

</CodeGroup>

With that, Ignite has created a new [`x/leaderboard`](https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-module/x/leaderboard) folder next to `x/checkers`. It has also put a `length` field inside `Params`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-module/proto/leaderboard/params.proto#L12]
message Params {
    ...
    uint64 length = 1 [(gogoproto.moretags) = "yaml:\"length\""];
}
```

The genesis defines a [starting value](https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-module/x/leaderboard/types/genesis.go#L14) of `0` for this length. You ought to change it now to something adequate:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/types/params.go#L14]
    var (
        KeyLength = []byte("Length")
-      // TODO: Determine the default value
-      DefaultLength uint64 = 0
+  )
+
+  const (
+      DefaultLength uint64 = 100
)
```

You also make it `const` as this is the case and comes handy later on.

## New v2 information

It is time to take a closer look at the new data structures being introduced with the new module.

<HighlightBox type="tip">

If you feel unsure about creating new data structures with Ignite CLI, look at the [previous sections](/hands-on-exercise/1-ignite-cli/4-create-message.md) of the exercise again.

</HighlightBox>

To give the new v2 information a data structure, you need the following:

1. Add a structure for **the leaderboard**: you want a single stored leaderboard for the whole module. Let Ignite CLI help you implement a structure:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ ignite scaffold single leaderboard winners \
        --module leaderboard --no-message
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker run --rm -it \
        -v $(pwd):/checkers \
        -w /checkers \
        checkers_i \
        ignite scaffold single leaderboard winners \
        --module leaderboard --no-message
    ```

    </CodeGroupItem>

    </CodeGroup>

2. This creates a Protobuf file with `string winners`. This is not very useful. So you declare by hand another Protobuf message in `leaderboard.proto` for use as a leaderboard rung:

    ```diff-protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-object/proto/leaderboard/leaderboard.proto#L11-L15]
        message Leaderboard {
            string winners = 1;
        }

    +  message Winner {
    +      string address = 1;
    +      uint64 wonCount = 2;
    +      uint64 addedAt = 3;
    +  }
    ```

    <HighlightBox type="note">

    Where:

    * `address` indicates the player. It will be the same address as the one that comes in `PlayerInfo.index`.
    * `wonCount` determines the ranking on the leaderboard - the higher the count, the closer to the `0` index in the array. This should exactly match the value found in the corresponding player stats. This duplication of data is a lesser evil because if `wonCount` was missing you would have to access the player stats to sort the leaderboard.
    * `addedAt` is a timestamp that indicates when the player's `wonCount` was last updated and determines the ranking when there is a tie in `wonCount` - the more recent, the closer to the `0` index in the array.

    </HighlightBox>

3. You make the `Leaderboard` message use it as an array. Add that each element in the map is not nullable. This will compile each `WinningPlayer` to a Go object instead of a pointer:

    ```diff-protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/proto/leaderboard/leaderboard.proto#L5-L8]
    +  import "gogoproto/gogo.proto";

        message Leaderboard {
    -      string winners = 1;
    +      repeated WinningPlayer winners = 1 [(gogoproto.nullable) = false];
        }
    ```

4. The v2 genesis was also updated with the leaderboard. Tell it that the leaderboard should always be there (even if empty):

    ```diff-protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/proto/leaderboard/genesis.proto#L14]
        message GenesisState {
            ...
    -      Leaderboard leaderboard = 2;
    +      Leaderboard leaderboard = 2 [(gogoproto.nullable) = false];
        }
    ```

    At this point, you should run `ignite generate proto-go` so that the corresponding Go objects are re-created.

5. Remember to make sure the initial value stored for the leaderboard is not `nil` but instead is an empty list. In `genesis.go` adjust:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/types/genesis.go#L13-L15]
        func DefaultGenesis() *GenesisState {
            return &GenesisState{
    -          Leaderboard: nil,
    +          Leaderboard: Leaderboard{
    +              Winners: []Winner{},
    +          },
                ...
            }
        }
    ```

    This function returns a default genesis. This step is important if you start fresh. In your case, you do not begin with an "empty" genesis but with one resulting from the upcoming genesis migration in this exercise.

    In particular, add a test on the initial genesis:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/types/genesis_test.go#L61-L72]
    func TestDefaultGenesisState_ExpectedInitial(t *testing.T) {
        require.EqualValues(t,
            &types.GenesisState{
                Leaderboard: types.Leaderboard{
                    Winners:  []types.Winner{},
                },
                Params: types.Params{
                    Length: 100,
                },
            },
            types.DefaultGenesis())
    }
    ```

    Fix the compilation error in the same file:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/types/genesis_test.go#L25-L27]
    -  Leaderboard: &types.Leaderboard{
    -      Winners: "49",
    +  Leaderboard: types.Leaderboard{
    +      Winners: []types.Winner{},
        },
    ```

    And add a test case that catches a duplicated winner address:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/types/genesis_test.go#L32-L47]
    {
        desc: "duplicated winnerPlayer",
        genState: &types.GenesisState{
            Leaderboard: types.Leaderboard{
                Winners: []types.Winner{
                    {
                        Address: "cosmos123",
                    },
                    {
                        Address: "cosmos123",
                    },
                },
            },
        },
        valid: false,
    },
    ```

6. Also adjust other compilation errors:

    On `genesis.go`:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/genesis.go#L12]
    -  // Set if defined
    -  if genState.Leaderboard != nil {
    -      k.SetLeaderboard(ctx, *genState.Leaderboard)
    -  }
    +  k.SetLeaderboard(ctx, genState.Leaderboard)
    ```

    And:

    ```diff-go  [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/genesis.go#L25]
        if found {
    -      genesis.Leaderboard = &leaderboard
    +      genesis.Leaderboard = leaderboard
        }
    ```

    On `genesis_test.go`:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/genesis_test.go#L36-L45]
        ...
    -  Leaderboard: &types.Leaderboard{
    -      Winners: "94",
    +  Leaderboard: types.Leaderboard{
    +      Winners: []types.Winner{
    +          {
    +              Address: "cosmos123",
    +          },
    +          {
    +              Address: "cosmos456",
    +          },
    +      },
        },
        ...
    ```

    On `client/cli/query_leaderboard_test.go`:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/client/cli/query_leaderboard_test.go#L24-L30]
    -  leaderboard := &types.Leaderboard{}
    +  leaderboard := types.Leaderboard{}
        nullify.Fill(&leaderboard)
        state.Leaderboard = leaderboard
        buf, err := cfg.Codec.MarshalJSON(&state)
        require.NoError(t, err)
        cfg.GenesisState[types.ModuleName] = buf
    -  return network.New(t, cfg), *state.Leaderboard
    +  return network.New(t, cfg), state.Leaderboard
    ```

7. Now that the leaderboard will always be in the store, you may as well change the `GetLeaderboard` function so that it panics instead of returning an error, when it cannot find it:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/keeper/leaderboard.go#L17-L27]
    -  func (k Keeper) GetLeaderboard(ctx sdk.Context) (val types.Leaderboard, found bool) {
    +  func (k Keeper) GetLeaderboard(ctx sdk.Context) (val types.Leaderboard) {
            ...
            if b == nil {
    -          return val, false
    +          panic("Leaderboard not found")
            }

            k.cdc.MustUnmarshal(b, &val)
    -      return val, true
    +      return val
        }
    ```

    This requires further easy fixing of new compilation errors. A more complex one is the one that checks what happens when the leaderboard is removed:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/keeper/leaderboard_test.go#L31-L41]
        func TestLeaderboardRemove(t *testing.T) {
            keeper, ctx := keepertest.LeaderboardKeeper(t)
            createTestLeaderboard(keeper, ctx)
            keeper.RemoveLeaderboard(ctx)
    -      _, found := keeper.GetLeaderboard(ctx)
    -      require.False(t, found)
    +      defer func() {
    +          r := recover()
    +          require.NotNil(t, r, "The code did not panic")
    +          require.Equal(t, r, "Leaderboard not found")
    +      }()
    +      keeper.GetLeaderboard(ctx)
        }
    ```

8. The test case you added will fail, unless you update the `Validate()` method of the genesis to not allow duplicate player addresses. This is inspired by `types/genesis.go` and best kept in a separate and new `types/leaderboard.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/types/leaderboard.go#]
    func (leaderboard Leaderboard) Validate() error {
        // Check for duplicated player address in winners
        winnerInfoIndexMap := make(map[string]struct{})

        for index, elem := range leaderboard.Winners {
            if _, ok := winnerInfoIndexMap[elem.Address]; ok {
                return fmt.Errorf("duplicated address %s at index %d", elem.Address, index)
            }
            winnerInfoIndexMap[elem.Address] = struct{}{}
        }
        return nil
    }
    ```

    After this, you can adjust the `types/genesis.go` file:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/checkers/types/genesis.go#L24-L27]
        func (gs GenesisState) Validate() error {
    +      // Validate Leaderboard
    +      if err := gs.Leaderboard.Validate(); err != nil {
    +          return err
    +      }
            // this line is used by starport scaffolding # genesis/types/validate
            ...
        }
    ```

You can confirm that the existing unit tests pass.

## Transient object

You will use objects when storing candidates in a transient KVStore between `BeginBlock` and `EndBlock`. You want them to be small.

In `leaderboard.proto`, add:

```diff-protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-object/proto/leaderboard/leaderboard.proto#L17-L20]
    message Winner {
        ...
    }

+  message Candidate {
+      bytes address = 1;
+      uint64 wonCount = 2;
+  }
```

Where `bytes address` is the player's undecoded address. Remember that `sdk.AccAddress`'s underlying type is `byte[]`.

After another round of Go compilation, you can add a helper function to get a `Candidate`'s address as a Bech32 string:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/types/leaderboard.go]
func (candidate Candidate) GetAccAddress() string {
    return sdk.AccAddress(candidate.Address).String()
}
```

Where `sdk.AccAddress(candidate.Address)` is casting the `byte[]` into `sdk.AccAddress`. Also add a function to convert it into a leaderboard rung at a given time:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/types/leaderboard.go]
func (candidate Candidate) GetWinnerAtTime(now time.Time) Winner {
    return Winner{
        Address:  candidate.GetAccAddress(),
        WonCount: candidate.WonCount,
        AddedAt:  uint64(now.Unix()),
    }
}
```

With the structure set up, it is time to add the code using these new elements in normal (non-migration) operations.

## Leaderboard helpers

Continue working on your v2 before tackling the migration. In both the migration and regular operations, the leaderboard helpers have to:

1. Add a number of new candidates to your array of winners.
2. Sort the array according to the rules.
3. Clip the array to the chosen length and save the result.

You can reuse your `types/leaderboard.go` to encapsulate all your leaderboard helpers:

1. Add functions to sort a slice of winners in place:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/types/leaderboard.go#L36-L50]
    func SortWinners(winners []Winner) {
        sort.SliceStable(winners[:], func(i, j int) bool {
            if winners[i].WonCount > winners[j].WonCount {
                return true
            }
            if winners[i].WonCount < winners[j].WonCount {
                return false
            }
            return winners[i].AddedAt > winners[j].AddedAt
        })
    }

    func (leaderboard Leaderboard) SortWinners() {
        SortWinners(leaderboard.Winners)
    }
    ```

    It tests in descending order, first for scores and then for the timestamps.

    <HighlightBox type="tip">

    It is possible to write a one-liner inside this function but at the expense of readability.

    </HighlightBox>

2. When it comes to adding or updating candidates to the array of winners, your goal is to make these operations as efficiently as possible. To avoid having to find duplicate player addresses in an array, it is better to use a map. Add a function to convert an array of winners into a map:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/types/leaderboard.go#L52-L63]
    func MapWinners(winners []Winner, length int) map[string]Winner {
        mapped := make(map[string]Winner, length)
        for _, winner := range winners {
            already, found := mapped[winner.Address]
            if !found {
                mapped[winner.Address] = winner
            } else if already.WonCount < winner.WonCount {
                mapped[winner.Address] = winner
            }
        }
        return mapped
    }
    ```

3. The timestamp used when a winner is added to the leaderboard will be the block's time. In other words, it will be the same time for all candidates added in `EndBlock`. Prepare a function to do that:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/checkers/types/leaderboard.go#L112-L155]
    func AddCandidatesAtNow(winners []Winner, now time.Time, candidates []Candidate) (updated []Winner) {
        mapped := MapWinners(winners, len(winners)+len(candidates))
        for _, candidate := range candidates {
            if candidate.WonCount < 1 {
                continue
            }
            candidateWinner := candidate.GetWinnerAtTime(now)
            already, found := mapped[candidateWinner.Address]
            if !found {
                mapped[candidateWinner.Address] = candidateWinner
            } else if already.WonCount < candidateWinner.WonCount {
                mapped[candidateWinner.Address] = candidateWinner
            }
        }
        updated = make([]Winner, 0, len(mapped))
        for _, winner := range mapped {
            updated = append(updated, winner)
        }
        SortWinners(updated)
        return updated
    }
    ```

    Note how, when creating the map, it initializes with a capacity equal to the sum of both winners and candidates' lengths. This is an approximative way of increasing memory performance.

## Candidate Lifecycle

You have prepared helper functions that will update a list of winners with a list of candidates. The candidates will come from the transient store. Transient in the sense that it will be discarded after `EndBlock`. This is good for this usage as you do not want to carry candidates from one block to the next.

Your leaderboard module does not have access to a transient store by default, so you will have to prepare that first.

Additionally, you want to reduce the number of marshalling / unmarshalling taking place repeatedly. It would not make sense to unmarshall a whole array of candidates every time you want to add a single candidate to the array. Instead, it makes sense to keep each candidate as a single entry in the store, and separately keep the information on how many `n` are being stored. Later, you can retrieve them with `[k]` where `0 <= k < n`.

You will:

1. Prepare access to a transient store to your leaderboard module.
2. Define keys of the candidates transient store.
3. Add a function to prepare the candidates transient store in `BeginBlock`.
4. Add a function to add a single candidate to the store.
5. Add a function to retrieve all the candidates from the transient store.

### Prepare transient store

By default, Ignite CLI does not prepare your module to have access to a transient like it prepares it to have access to the proper store. The preparation works the same way as a normal store.

Add a transient store key in your keeper:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/keeper.go#L19]
    type (
        Keeper struct {
            ...
            memKey     sdk.StoreKey
+          tKey       sdk.StoreKey
            paramstore paramtypes.Subspace
        }
    )
```

Update the constructor accordingly:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/keeper.go#L24-L45]
    func NewKeeper(
        ...
        memKey sdk.StoreKey,
+      tKey sdk.StoreKey,
        ps paramtypes.Subspace,

    ) *Keeper {
        ...
        return &Keeper{
            ...
            memKey:     memKey,
+          tKey:       tKey,
            paramstore: ps,
        }
    }
```

This key will be identified by a new string in `app.go`'s list of transient store keys. Add a distinct such key:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/types/keys.go#L19-L20]
    MemStoreKey = "mem_leaderboard"
+  
+  // TStoreKey defines the transient store key
+  TStoreKey = "transient_leaderboard"
```

Adjust `app.go` so that it gives the keeper a valid key. And take this opportunity to fix an Ignite bug on `memKeys`:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/app/app.go#L419-L420]
    app.LeaderboardKeeper = *leaderboardmodulekeeper.NewKeeper(
        ...
-      keys[leaderboardmoduletypes.MemStoreKey],
+      memKeys[leaderboardmoduletypes.MemStoreKey],
+      tkeys[leaderboardmoduletypes.TStoreKey],
        app.GetSubspace(leaderboardmoduletypes.ModuleName),
    )
```

Not to forget to ensure that there is indeed a store key at the string(s) you asked:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/app/app.go#L303-L304]
-  tkeys := sdk.NewTransientStoreKeys(paramstypes.TStoreKey)
-  memKeys := sdk.NewMemoryStoreKeys(capabilitytypes.MemStoreKey)
+  tkeys := sdk.NewTransientStoreKeys(paramstypes.TStoreKey, leaderboardmoduletypes.TStoreKey)
+  memKeys := sdk.NewMemoryStoreKeys(capabilitytypes.MemStoreKey, leaderboardmoduletypes.MemStoreKey)
```

### Prepare candidate store keys

Your keeper has access to a transient store. Define the keys by which elements will be accessed in it. Taking inspiration from checkers' stored games use of prefixes and their use in the `GetAllStoredGame` function, you prepare prefix keys for the values in a new `types/key_candidate.go` file:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/types/key_candidate.go#L9-L23]
const (
	CandidateKeyPrefix = "Candidate/value/"
)

// CandidateKey returns the store key to retrieve a Candidate from the index field
// It is not used but is here to remind where values are stored
func CandidateKey(address []byte) []byte {
    var key []byte

    prefixBytes := []byte(CandidateKeyPrefix)
    key = append(key, prefixBytes...)
    key = append(key, address...)

    return key
}
```

### Use the candidate store

Now you can add the functions that will use the transient store at each update and on `EndBlock`. Add a new `keeper/candidate.go` file with:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/candidate.go#L9-L13]
func (k Keeper) SetCandidate(ctx sdk.Context, candidate types.Candidate) {
    candidateStore := prefix.NewStore(ctx.TransientStore(k.tKey), []byte(types.CandidateKeyPrefix))
    candidateBytes := k.cdc.MustMarshal(&candidate)
    candidateStore.Set(candidate.Address, candidateBytes)
}
```

This function saves the candidate at its address. Already having `[]byte Address` in the `Candidate` object proves useful. This also means that if there are two updates in one block for a single player, only the second update is recorded. In the case of a game that has only increasing scores, this is ok.

Next, taking inspiration from `StoredGame` again, add a function to get all candidates with an iterator:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/candidate.go#L15-L28]
func (k Keeper) GetAllCandidates(ctx sdk.Context) (candidates []types.Candidate) {
    candidateStore := prefix.NewStore(ctx.TransientStore(k.tKey), []byte(types.CandidateKeyPrefix))
    iterator := sdk.KVStorePrefixIterator(candidateStore, []byte{})

    defer iterator.Close()

    for ; iterator.Valid(); iterator.Next() {
        var candidate types.Candidate
        k.cdc.MustUnmarshal(iterator.Value(), &candidate)
        candidates = append(candidates, candidate)
    }

    return
}
```

It gets all candidates. There may be many, but not so many that it grinds the application. After all, it only gets all that was put during the block itself.

## Leaderboard handling

You have created the leaderboard helper functions and the function to get all candidates. You can now update the leaderboard. This takes place in `EndBlock`.

First, in a separate file, add one function to the keeper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/end_block_leaderboard_handler.go#L10-L17]
func (k Keeper) CollectSortAndClipLeaderboard(ctx sdk.Context) {
    leaderboard := k.GetLeaderboard(ctx)
    updated := types.AddCandidatesAtNow(leaderboard.Winners, ctx.BlockTime(), k.GetAllCandidates(ctx))
    params := k.GetParams(ctx)
    if params.Length < uint64(len(updated)) {
        updated = updated[:params.Length]
    }
    leaderboard.Winners = updated
    k.SetLeaderboard(ctx, leaderboard)
}
```

This function gets the candidates from the transient store and the leaderboard from the regular store, adds the candidates, clips the array to the maximum length found in `Params`, and saves the updated leaderboard back in storage.

This means that the leaderboard will be unmarshalled and marshalled only once per block.

Next, make sure it is called from `EndBlock`. In `module.go`:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/module.go#L173-L174]
-  func (am AppModule) EndBlock(_ sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
+  func (am AppModule) EndBlock(ctx sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
+      am.keeper.CollectSortAndClipLeaderboard(ctx)
        return []abci.ValidatorUpdate{}
    }
```

If Ignite did it right, `app.go` has [already set up](https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/app/app.go#L523) the leaderboard module to be called on `EndBlock`.

Your leaderboard will now be updated and saved on an on-going basis as part of your v2 blockchain. However, so far, you have put **nothing** in the transient store.

## Hook infrastructure for candidates

To populate candidate winners in your transient store, you are going to _listen_ to `PlayerInfo` updates emitted from the checkers module:

* This will avoid tight coupling between the modules.
* The checkers module will not care whether there is a listener or not.
* It will be the duty of `app.go` to hook the leaderboard's listener to the checkers' emitter.
* To reduce the dependency of the leaderboard module to elements of the checkers module, you are going to restrict to a single file.

With Cosmos SDK, hooks are a design pattern so you have to code them.

### On the checkers module

Add the hooks interface to the checkers module. First as an expected interface:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/checkers/types/expected_keepers.go#L25-L27]
type CheckersHooks interface {
    AfterPlayerInfoChanged(ctx sdk.Context, playerInfo PlayerInfo)
}
```

Here you can imagine you could add functions for all sorts of updates coming from checkers. But for the sake of the exercise, keep it simple.

then, taking inspiration from the [governance module's hooks](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/gov/types/hooks.go#L7-L20), you define a convenience multi hook that can accommodate multiple listeners:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/checkers/types/hooks.go#L7-L19]
var _ CheckersHooks = MultiCheckersHooks{}

type MultiCheckersHooks []CheckersHooks

func NewMultiCheckersHooks(hooks ...CheckersHooks) MultiCheckersHooks {
	return hooks
}

func (h MultiCheckersHooks) AfterPlayerInfoChanged(ctx sdk.Context, playerInfo PlayerInfo) {
	for i := range h {
		h[i].AfterPlayerInfoChanged(ctx, playerInfo)
	}
}
```

Expose this hooks interface via the checkers keeper:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/checkers/keeper/keeper.go#L17]
    type (
        Keeper struct {
            bank       types.BankEscrowKeeper
+          hooks      types.CheckersHooks
            cdc        codec.BinaryCodec
            ...
        }
    )
```

And a function to set it:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/checkers/keeper/keeper.go#L47-L55]
func (keeper *Keeper) SetHooks(hooks types.CheckersHooks) *Keeper {
    if keeper.hooks != nil {
        panic("cannot set checkers hooks twice")
    }

    keeper.hooks = hooks

    return keeper
}
```

Having a function to set the hooks is advised as that allows you to collect the listeners you need without worrying about the order of creation of other keepers.

With the hooks structure in place, there remains to have your checkers code call it. The best place for that is precisely where it is updated and saved:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/checkers/keeper/player_info_handler.go#L32-L34]
    func mustAddDeltaGameResultToPlayer(
        ...
    ) (playerInfo types.PlayerInfo) {
        ...
        k.SetPlayerInfo(ctx, playerInfo)
+      if k.hooks != nil {
+          k.hooks.AfterPlayerInfoChanged(ctx, playerInfo)
+      }
        return playerInfo
    }
```

<HighlightBox type="note">

Remember that the hook is named `AfterPlayerInfoChanged`, not _for use by the leaderboard_. Therefore you should also emit when there is a change that you know is going to be discarded by the leaderboard.
<br/><br/>
It verifies `!= nil` to make sure it does not panic if there are no listeners, which is a legitimate situation.

</HighlightBox>

The checkers module is now ready with regards to the hooks.

### On the leaderboard module

In your keeper, you define a generic checkers hook listener. In a new `keeper/hooks.go` file, put a simple:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/hooks.go#L3-L7]
type Hooks struct {
    k Keeper
}

func (k Keeper) Hooks() Hooks { return Hooks{k} }
```

Then, so as to keep the dependency on checkers' types into as few files as possible, you encapsulate the conversion knowledge in a new `types/leaderboard_checkers.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/types/leaderboard_checkers.go#L9-L18]
func MakeCandidateFromPlayerInfo(playerInfo checkerstypes.PlayerInfo) (candidate Candidate, err error) {
    address, err := sdk.AccAddressFromBech32(playerInfo.Index)
    if err != nil {
        return candidate, sdkerrors.Wrapf(err, "Could not parse address from playerInfo %s", playerInfo.Index)
    }
    return Candidate{
        Address:  address,
        WonCount: playerInfo.WonCount,
    }, nil
}
```

And you encapsulate the handling in a new `keeper/hooks_checkers.go` file:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/hooks_checkers.go#L11-L22]
var _ checkerstypes.CheckersHooks = Hooks{}

func (h Hooks) AfterPlayerInfoChanged(ctx sdk.Context, playerInfo checkerstypes.PlayerInfo) {
    candidate, err := types.MakeCandidateFromPlayerInfo(playerInfo)
    if err != nil {
        panic(fmt.Sprintf("%v", err))
    }
    if candidate.WonCount < 1 {
        return
    }
    h.k.SetCandidate(ctx, candidate)
}
```

As you can see, it takes the new information and puts it into the transient store; only if it is worth it.

<HighlightBox type="best-practice">

If your leaderboard hooks listener was set to listen from more than one module, you would add a new `hooks_othermodule.go` file that would only concerns itself with that other module.

</HighlightBox>

The leaderboard handling is now complete.

### On `app.go`

All `app.go` has to do is calling checkers' `SetHooks` with the leaderboard's listener after all keepers have been created:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/app/app.go#L427-L431]
    leaderboardModule := leaderboardmodule.NewAppModule(appCodec, app.LeaderboardKeeper, app.AccountKeeper, app.BankKeeper)

+  app.CheckersKeeper = *app.CheckersKeeper.SetHooks(
+      checkersmoduletypes.NewMultiCheckersHooks(
+          app.LeaderboardKeeper.Hooks(),
+      ),
+  )

    // this line is used by starport scaffolding # stargate/app/keeperDefinition
```

Note how `app.CheckersKeeper` is replaced. This means that you need to move the checkers module line below:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/app/app.go#L433]
-  checkersModule := checkersmodule.NewAppModule(appCodec, app.CheckersKeeper, app.AccountKeeper, app.BankKeeper)

    app.LeaderboardKeeper = *leaderboardmodulekeeper.NewKeeper
    ...

    app.CheckersKeeper = *app.CheckersKeeper.SetHooks(
        ...
    )

+  checkersModule := checkersmodule.NewAppModule(appCodec, app.CheckersKeeper, app.AccountKeeper, app.BankKeeper)

    // this line is used by starport scaffolding # stargate/app/keeperDefinition
```

If you forgot to do so, the module would be created with the _hook-less_ keeper.

## Unit tests

After all these changes, it is worthwhile adding tests.

Just like you did for the checkers module, you can add valid addresses to be reused elsewhere in a new file:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/testutil/constants.go#L3-L7]
const (
	Alice = "cosmos1jmjfq0tplp9tmx4v9uemw72y4d2wa5nr3xn9d3"
	Bob   = "cosmos1xyxs3skf3f4jfqeuv89yyaqvjc6lffavxqhc8g"
	Carol = "cosmos1e0w5t53nrq7p66fye6c8p0ynyhf6y24l4yuxd7"
)
```

### Candidate unit tests

You added a new `Candidate` type and helper functions on it. You can test that they work as expected. Add a new `leaderboard_test.go` file. No need to overdo it:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-objects/x/leaderboard/types/leaderboard_test.go#L13-L32]
const (
	alice = testutil.Alice
)

func TestCandidateGetWinnerAtTime(t *testing.T) {
    now := time.Now()
    timestamp := now.Unix()
    aliceAddress, err := sdk.AccAddressFromBech32(alice)
    require.Nil(t, err)
    candidate := types.Candidate{
        Address:  aliceAddress,
        WonCount: 23,
    }
    winner := candidate.GetWinnerAtTime(now)
    require.EqualValues(t, types.Winner{
        Address:  alice,
        WonCount: 23,
        AddedAt:  uint64(timestamp),
    }, winner)
}
```

### Leaderboard helper unit tests

Start by adding tests that confirm that the sorting of the leaderboard's winners works as expected. Here an array of test cases is a good choice:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/types/leaderboard_test.go#L35-L156]
func TestSortWinners(t *testing.T) {
    tests := []struct {
        name     string
        unsorted []types.Winner
        sorted   []types.Winner
    }{
        {
            name:     "sort empty",
            unsorted: []types.Winner{},
            sorted:   []types.Winner{},
        },
        {
            name: "sort unique",
            unsorted: []types.Winner{
                {
                    Address:  alice,
                    WonCount: 2,
                    AddedAt:  1000,
                },
            },
            sorted: []types.Winner{
                {
                    Address:  alice,
                    WonCount: 2,
                    AddedAt:  1000,
                },
            },
        },
        ... // More test cases
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            leaderboard := types.Leaderboard{
                Winners: tt.unsorted,
            }
            leaderboard.SortWinners()
            sorted := leaderboard.Winners
            require.Equal(t, len(tt.sorted), len(sorted))
            require.EqualValues(t, tt.sorted, sorted)
        })
    }
}
```

With that done, you can confirm that the updating or addition of new player info to the leaderboard works as expected, again with an array of test cases:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/types/leaderboard_test.go#L158-L433]
func TestAddCandidatesAtNow(t *testing.T) {
    aliceAdd, err := sdk.AccAddressFromBech32(alice)
    require.Nil(t, err)
    bobAdd, err := sdk.AccAddressFromBech32(bob)
    require.Nil(t, err)
    tests := []struct {
        name       string
        sorted     []types.Winner
        candidates []types.Candidate
        now        int64
        expected   []types.Winner
    }{
        {
            name:   "add to empty",
            sorted: []types.Winner{},
            candidates: []types.Candidate{{
                Address:  aliceAdd,
                WonCount: 2,
            }},
            now: 1000,
            expected: []types.Winner{
                {
                    Address:  alice,
                    WonCount: 2,
                    AddedAt:  1000,
                },
            },
        },
        ... // More test cases
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            actual := types.AddCandidatesAtNow(tt.sorted, time.Unix(tt.now, 0), tt.candidates)
            require.Equal(t, len(tt.expected), len(actual))
            require.EqualValues(t, tt.expected, actual)
            require.NoError(t, types.Leaderboard{Winners: actual}.Validate())
        })
    }
}
```

### Candidate lifecycle unit tests

You added functions to set and get candidates from the transient store. You ought to add unit tests to confirm it works as expected.

First, you need to make sure that your test keeper has a valid transient store:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/testutil/keeper/leaderboard.go#L23-L45]
    func LeaderboardKeeper(t testing.TB) (*keeper.Keeper, sdk.Context) {
        storeKey := sdk.NewKVStoreKey(types.StoreKey)
        memStoreKey := storetypes.NewMemoryStoreKey(types.MemStoreKey)
+      tStoreKey := storetypes.NewTransientStoreKey(types.TStoreKey)

        ...
        stateStore.MountStoreWithDB(memStoreKey, sdk.StoreTypeMemory, nil)
+      stateStore.MountStoreWithDB(tStoreKey, sdk.StoreTypeTransient, nil)
        require.NoError(t, stateStore.LoadLatestVersion())

        ...
        k := keeper.NewKeeper(
            cdc,
            storeKey,
            memStoreKey,
+          tStoreKey,
            paramsSubspace,
        )
        ...
    }
```

With this preparation, you can add simple tests. That you can get back [one candidate](https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/candidate_test.go#L20-L39) when there is one, or three when there are three:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/candidate_test.go#L41-L76]
func TestSetAndGetThreeCandidates(t *testing.T) {
    keeper, ctx := keepertest.LeaderboardKeeper(t)
    aliceAddress, err := sdk.AccAddressFromBech32(alice)
    require.Nil(t, err)
    bobAddress, err := sdk.AccAddressFromBech32(bob)
    require.Nil(t, err)
    carolAddress, err := sdk.AccAddressFromBech32(carol)
    require.Nil(t, err)

    keeper.SetCandidate(ctx, types.Candidate{
        Address:  aliceAddress,
        WonCount: 12,
    })
    keeper.SetCandidate(ctx, types.Candidate{
        Address:  bobAddress,
        WonCount: 34,
    })
    keeper.SetCandidate(ctx, types.Candidate{
        Address:  carolAddress,
        WonCount: 56,
    })

    candidates := keeper.GetAllCandidates(ctx)
    require.Len(t, candidates, 3)
    sort.SliceStable(candidates[:], func(i, j int) bool {
        return candidates[i].WonCount < candidates[j].WonCount
    })
    require.Equal(t,
        []types.Candidate{
            {Address: aliceAddress, WonCount: 12},
            {Address: bobAddress, WonCount: 34},
            {Address: carolAddress, WonCount: 56},
        },
        candidates,
    )
}
```

<HighlightBox type="note">

Note the small hack where the received candidates are sorted by `WonCount`. The `GetAllCandidates` function does not ensure an order, so to be able to easily use `require.Equal`, an ordering was used.

</HighlightBox>

### Leaderboard handling unit tests

You can verify that the leaderboard is updated when the `keeper.CollectSortAndClipLeaderboard` function is called.

To change the context time, you can use the SDK context's `WithBlockTime` function. For instance, test when a single candidate is [added between two](https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/end_block_leaderboard_handler_test.go#L13-L41) existing winners. Or when one candidate replaces its lower score and another enters the leaderboard for the first time:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/end_block_leaderboard_handler_test.go#L43-L76]
func TestOnePlayerAddedAndOneUpdatedToLeaderboard(t *testing.T) {
    keeper, ctx := keepertest.LeaderboardKeeper(t)
    keeper.SetLeaderboard(ctx, types.Leaderboard{
        Winners: []types.Winner{
            {Address: alice, WonCount: 12, AddedAt: 999},
            {Address: bob, WonCount: 10, AddedAt: 999},
        },
    })
    bobAddress, err := sdk.AccAddressFromBech32(bob)
    require.Nil(t, err)
    carolAddress, err := sdk.AccAddressFromBech32(carol)
    require.Nil(t, err)
    keeper.SetCandidate(ctx, types.Candidate{
        Address:  bobAddress,
        WonCount: 13,
    })
    keeper.SetCandidate(ctx, types.Candidate{
        Address:  carolAddress,
        WonCount: 12,
    })

    bobTime := time.Unix(1000, 0)
    keeper.CollectSortAndClipLeaderboard(ctx.WithBlockTime(bobTime))

    leaderboard := keeper.GetLeaderboard(ctx)
    require.Len(t, leaderboard.Winners, 3)
    require.Equal(t,
        []types.Winner{
            {Address: bob, WonCount: 13, AddedAt: 1000},
            {Address: carol, WonCount: 12, AddedAt: 1000},
            {Address: alice, WonCount: 12, AddedAt: 999},
        },
        leaderboard.Winners,
    )
}
```

Where:

* You put a leaderboard in storage.
* Put candidates in the transient storage.
* Call the collection of candidates.
* Confirm the new leaderboard order and values.

You can also add a test that confirms the leaderboard is clipped at the maximum length:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/end_block_leaderboard_handler_test.go#L78-L108]
func TestOnePlayerKicksPlayerOutOfLeaderboard(t *testing.T) {
    keeper, ctx := keepertest.LeaderboardKeeper(t)
    keeper.SetLeaderboard(ctx, types.Leaderboard{
        Winners: []types.Winner{
            {Address: alice, WonCount: 12, AddedAt: 999},
            {Address: bob, WonCount: 10, AddedAt: 999},
        },
    })
    params := keeper.GetParams(ctx)
    params.Length = 2
    keeper.SetParams(ctx, params)
    carolAddress, err := sdk.AccAddressFromBech32(carol)
    require.Nil(t, err)
    keeper.SetCandidate(ctx, types.Candidate{
        Address:  carolAddress,
        WonCount: 11,
    })
    carolTime := time.Unix(1000, 0)
    keeper.CollectSortAndClipLeaderboard(ctx.WithBlockTime(carolTime))

    leaderboard := keeper.GetLeaderboard(ctx)
    require.Len(t, leaderboard.Winners, 2)
    require.Equal(t,
        []types.Winner{
            {Address: alice, WonCount: 12, AddedAt: 999},
            {Address: carol, WonCount: 11, AddedAt: 1000},
        },
        leaderboard.Winners,
    )
}
```

Where `carol` kicked `bob` out of the leaderboard since its length was enforced at `2`:

### Hook unit tests on leaderboard

Moving to the hooks _on the leaderboard module's side_, you want to confirm that candidates are added to the transient store when the keeper receives a new update:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/hooks_checkers_test.go#L14-L31]
func TestOneCandidateAdded(t *testing.T) {
    keeper, ctx := keepertest.LeaderboardKeeper(t)
    keeper.Hooks().AfterPlayerInfoChanged(ctx, checkerstypes.PlayerInfo{
        Index:          alice,
        WonCount:       12,
        LostCount:      13,
        ForfeitedCount: 14,
    })

    aliceAddress, err := sdk.AccAddressFromBech32(alice)
    require.Nil(t, err)
    candidates := keeper.GetAllCandidates(ctx)
    require.Len(t, candidates, 1)
    require.Equal(t,
        types.Candidate{Address: aliceAddress, WonCount: 12},
        candidates[0],
    )
}
```

Also that it overwrites when it receives [an update for the same address](https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/hooks_checkers_test.go#L33-L56), or adds a second candidate [alongside an existing one](https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/leaderboard/keeper/hooks_checkers_test.go#L58-L84).

### Hook unit tests on checkers

You introduced a new type, the `MultiHook`. You should test that it indeed distributes calls to the elements of the list. That calls for a mock of the `CheckersHooks` expected interface.

Run again your [existing script](/hands-on-exercise/2-ignite-cli-adv/5-payment-winning.md) that rebuilds all the mocks.

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ make mock-expected-keepers
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    make mock-expected-keepers
```

</CodeGroupItem>

</CodeGroup>

With that, you can add a test that confirms a multihook with two hooks calls both in order:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/checkers/types/hooks_test.go#L13-L38]
func TestMultiHookCallsThem(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()
    hook1 := testutil.NewMockCheckersHooks(ctrl)
    hook2 := testutil.NewMockCheckersHooks(ctrl)
    call1 := hook1.EXPECT().AfterPlayerInfoChanged(gomock.Any(), types.PlayerInfo{
        Index:          "alice",
        WonCount:       1,
        LostCount:      2,
        ForfeitedCount: 3,
    }).Times(1)
    hook2.EXPECT().AfterPlayerInfoChanged(gomock.Any(), types.PlayerInfo{
        Index:          "alice",
        WonCount:       1,
        LostCount:      2,
        ForfeitedCount: 3,
    }).Times(1).After(call1)

    multi := types.NewMultiCheckersHooks(hook1, hook2)
    multi.AfterPlayerInfoChanged(sdk.NewContext(nil, tmproto.Header{}, false, nil), types.PlayerInfo{
        Index:          "alice",
        WonCount:       1,
        LostCount:      2,
        ForfeitedCount: 3,
    })
}
```

Your existing checkers keeper tests should still be passing.

<HighlightBox type="note">

There is a small difficulty that would not surface immediately. When you set the hooks after the `msgServer` has been created, because it takes a keeper instance, and not a pointer, the `msgServer` is created with the _old_ keeper, the one before the hooks were set.

</HighlightBox>

So add a setup function that encapsulates the knowledge to circumvent this difficulty:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/checkers/keeper/msg_server_play_move_test.go#L35-L42]
func setupMsgServerWithOneGameForPlayMoveAndHooks(t testing.TB) (types.MsgServer, keeper.Keeper, context.Context,
    *gomock.Controller, *testutil.MockBankEscrowKeeper, *testutil.MockCheckersHooks) {
    msgServer, k, context, ctrl, escrow := setupMsgServerWithOneGameForPlayMove(t)
    hookMock := testutil.NewMockCheckersHooks(ctrl)
    k.SetHooks(hookMock)
    msgServer = keeper.NewMsgServerImpl(k)
    return msgServer, k, context, ctrl, escrow, hookMock
}
```

You can now add a test that confirms that a game just played does not trigger a call to the hooks.

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/checkers/keeper/msg_server_play_move_test.go#L607-L626]
func TestPlayerInfoNoHookOnNoWinner(t *testing.T) {
	msgServer, keeper, context, ctrl, escrow, _ := setupMsgServerWithOneGameForPlayMoveAndHooks(t)
    ctx := sdk.UnwrapSDKContext(context)
    defer ctrl.Finish()
    escrow.ExpectAny(context)
    keeper.SetPlayerInfo(ctx, types.PlayerInfo{
        Index: bob,
    })
    keeper.SetPlayerInfo(ctx, types.PlayerInfo{
        Index: carol,
    })
    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator:   bob,
        GameIndex: "1",
        FromX:     1,
        FromY:     2,
        ToX:       2,
        ToY:       3,
    })
}
```

A more interesting addition is the confirmation that a listener is being called when a game is [forfeited](https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/checkers/keeper/end_block_server_game_test.go#L684-L737) or won:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/x/checkers/keeper/msg_server_play_move_winner_test.go#L133-L165]
func TestCompleteGameCallsHook(t *testing.T) {
	msgServer, keeper, context, ctrl, escrow, hookMock := setupMsgServerWithOneGameForPlayMoveAndHooks(t)
	ctx := sdk.UnwrapSDKContext(context)
    defer ctrl.Finish()
    escrow.ExpectAny(context)
    bobCall := hookMock.EXPECT().AfterPlayerInfoChanged(ctx, types.PlayerInfo{
        Index:          bob,
        WonCount:       2,
        LostCount:      2,
        ForfeitedCount: 3,
    }).Times(1)
    hookMock.EXPECT().AfterPlayerInfoChanged(ctx, types.PlayerInfo{
        Index:          carol,
        WonCount:       4,
        LostCount:      6,
        ForfeitedCount: 6,
    }).Times(1).After(bobCall)

    keeper.SetPlayerInfo(ctx, types.PlayerInfo{
        Index:          bob,
        WonCount:       1,
        LostCount:      2,
        ForfeitedCount: 3,
    })
    keeper.SetPlayerInfo(ctx, types.PlayerInfo{
        Index:          carol,
        WonCount:       4,
        LostCount:      5,
        ForfeitedCount: 6,
    })

    testutil.PlayAllMoves(t, msgServer, context, "1", bob, carol, testutil.Game1Moves)
}
```

## Integration tests

To further confirm that your code is working right, you can add integration tests. Since it starts an app, the hooks are already set up.

You could decide to piggy-back on the existing "checkers" integration tests. However, for the sake of clarity, you create a separate folder:

```sh
$ mkdir -p tests/integration/leaderboard/keeper
```

Copy the integration test suite from the checkers integration tests, with adjusted imports and others, minus all the balances and denoms. You keep the `msgServer` as that is the one that receives messages:

```go
const (
    alice = testutil.Alice
    bob   = testutil.Bob
    carol = testutil.Carol
)

type IntegrationTestSuite struct {
    suite.Suite

    app         *checkersapp.App
    msgServer   checkerstypes.MsgServer
    ctx         sdk.Context
    queryClient types.QueryClient
}

func TestLeaderboardKeeperTestSuite(t *testing.T) {
    suite.Run(t, new(IntegrationTestSuite))
}

func (suite *IntegrationTestSuite) SetupTest() {
    app := checkersapp.Setup(false)
    ctx := app.BaseApp.NewContext(false, tmproto.Header{Time: time.Now()})

    app.AccountKeeper.SetParams(ctx, authtypes.DefaultParams())
    app.BankKeeper.SetParams(ctx, banktypes.DefaultParams())

    queryHelper := baseapp.NewQueryServerTestHelper(ctx, app.InterfaceRegistry())
    types.RegisterQueryServer(queryHelper, app.LeaderboardKeeper)
    queryClient := types.NewQueryClient(queryHelper)

    suite.app = app
    suite.msgServer = checkerskeeper.NewMsgServerImpl(app.CheckersKeeper)
    suite.ctx = ctx
    suite.queryClient = queryClient
}
```

You can confirm the leaderboard is called when a game is won:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/tests/integration/leaderboard/keeper/msg_server_play_move_test.go]
func (suite *IntegrationTestSuite) setupSuiteWithOneGameForPlayMove() {
    goCtx := sdk.WrapSDKContext(suite.ctx)
    suite.msgServer.CreateGame(goCtx, &checkerstypes.MsgCreateGame{
        Creator: alice,
        Black:   bob,
        Red:     carol,
        Wager:   0,
        Denom:   "stake",
    })
}

func (suite *IntegrationTestSuite) TestPlayMoveToWinnerAddedToLeaderboard() {
    suite.setupSuiteWithOneGameForPlayMove()
    suite.app.CheckersKeeper.SetPlayerInfo(suite.ctx, checkerstypes.PlayerInfo{
        Index: alice, WonCount: 10,
    })
    suite.app.CheckersKeeper.SetPlayerInfo(suite.ctx, checkerstypes.PlayerInfo{
        Index: bob, WonCount: 10,
    })
    suite.app.LeaderboardKeeper.SetLeaderboard(suite.ctx, leaderboardtypes.Leaderboard{
        Winners: []leaderboardtypes.Winner{
            {Address: alice, WonCount: 10, AddedAt: 1000},
            {Address: bob, WonCount: 10, AddedAt: 999},
        },
    })
    testutil.PlayAllMoves(suite.T(), suite.msgServer, sdk.WrapSDKContext(suite.ctx), "1", bob, carol, testutil.Game1Moves)
    suite.app.LeaderboardKeeper.CollectSortAndClipLeaderboard(suite.ctx)
    leaderboard := suite.app.LeaderboardKeeper.GetLeaderboard(suite.ctx)
    suite.Require().EqualValues(
        []leaderboardtypes.Winner{
            {Address: bob, WonCount: 11, AddedAt: uint64(suite.ctx.BlockTime().Unix())},
            {Address: alice, WonCount: 10, AddedAt: 1000},
        },
        leaderboard.Winners)
}
```

Or expired:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-handling/tests/integration/leaderboard/keeper/end_block_server_game_test.go]
func (suite *IntegrationTestSuite) TestForfeitPlayedTwiceCalledHooks() {
    suite.setupSuiteWithOneGameForPlayMove()
    goCtx := sdk.WrapSDKContext(suite.ctx)
    suite.msgServer.PlayMove(goCtx, &types.MsgPlayMove{
        Creator:   bob,
        GameIndex: "1",
        FromX:     1,
        FromY:     2,
        ToX:       2,
        ToY:       3,
    })
    suite.msgServer.PlayMove(goCtx, &types.MsgPlayMove{
        Creator:   carol,
        GameIndex: "1",
        FromX:     0,
        FromY:     5,
        ToX:       1,
        ToY:       4,
    })
    keeper := suite.app.CheckersKeeper
    keeper.SetPlayerInfo(suite.ctx, types.PlayerInfo{
        Index: bob, WonCount: 10,
    })
    keeper.SetPlayerInfo(suite.ctx, types.PlayerInfo{
        Index: carol, WonCount: 10,
    })
    suite.app.LeaderboardKeeper.SetLeaderboard(suite.ctx, leaderboardtypes.Leaderboard{
        Winners: []leaderboardtypes.Winner{
            {Address: bob, WonCount: 10, AddedAt: 1000},
            {Address: carol, WonCount: 10, AddedAt: 999},
        },
    })
    game1, found := keeper.GetStoredGame(suite.ctx, "1")
    suite.Require().True(found)
    oldDeadline := types.FormatDeadline(suite.ctx.BlockTime().Add(time.Duration(-1)))
    game1.Deadline = oldDeadline
    keeper.SetStoredGame(suite.ctx, game1)

    keeper.ForfeitExpiredGames(goCtx)
    suite.app.LeaderboardKeeper.CollectSortAndClipLeaderboard(suite.ctx)
    leaderboard := suite.app.LeaderboardKeeper.GetLeaderboard(suite.ctx)
    suite.Require().EqualValues(
        []leaderboardtypes.Winner{
            {Address: carol, WonCount: 11, AddedAt: uint64(suite.ctx.BlockTime().Unix())},
            {Address: bob, WonCount: 10, AddedAt: 1000},
        },
        leaderboard.Winners)
}
```

Note how you have to call both _end blockers_ because there are actually no blocks being produced. This recalls what you did previously when integration-testing the game forfeit.

This completes your checkers v2 chain. If you were to start it anew as is, it would work. If you want to see how you would migrate your blockchain if it were running the v1.1, jump straight to the [next section](/hands-on-exercise/4-run-in-prod/4-migration-leaderboard.md).

## Interact via the CLI

Your v2 blockchain is fully functioning. It will work as long as you start it from scratch, i.e. you should not try to migrate.

You should already know your way around testing this way. The simplest way is to use Ignite:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite chain serve --reset-once
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker network create checkers-net
$ docker run --rm -it \
    -v $(pwd):/checkers -w /checkers \
    -p 4500:4500 -p 26657:26657 \
    --network checkers-net \
    --name checkers \
    checkers_i \
    ignite chain serve --reset-once
```

</CodeGroupItem>

</CodeGroup>

Use your CosmJS integration tests to run a full game:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ npm test --prefix client
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd)/client:/client -w /client \
    --network checkers-net \
    --env RPC_URL="http://checkers:26657" \
    node:18.7-slim \
    npm test
```

</CodeGroupItem>

</CodeGroup>

---

After that, you can query your leaderboard:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query leaderboard show-leaderboard
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it \
    checkers \
    checkersd query leaderboard show-leaderboard
```

</CodeGroupItem>

</CodeGroup>

It should turn something like:

```yaml
Leaderboard:
  winners:
  - addedAt: "1682373982"
    address: cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql
    wonCount: "1"
```

Congratulations, your leaderboard is functional.

If you used Docker, you can stop the container and remove the network:

```sh
$ docker network rm checkers-net
```

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to add a leaderboard as a module to an existing blockchain, and the characteristics that a good leaderboard should boast.
* How to keep modules loosely coupled when possible, with the use of hooks.
* How to leverage the transient store to save data for use in `EndBlock`.
* How to reduce computations and overall blockchain burden by ordering the leaderboard only once per block, in `EndBlock`.
* Worthwhile unit tests, including recreating the mocks, and integration tests.

</HighlightBox>

<!--

## Next up

It is time to move away from the checkers blockchain learning exercise, and explore another helpful tool for working with the Cosmos SDK: CosmWasm.

-->
