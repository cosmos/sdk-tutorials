---
title: "Migrate the Leaderboard Module After Production"
order: 5
description: A migration of the leaderboard module for your in-production blockchain via state migration
tags:
  - guided-coding
  - cosmos-sdk
  - cosm-js
---

# Migrate the Leaderboard Module After Production

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md), [modules](/academy/2-cosmos-concepts/5-modules.md), and [migrations](/academy/2-cosmos-concepts/16-migrations.md).
* Go is installed.
* You have the checkers blockchain codebase up to the _Add a Leaderboard Module_. If not, follow the [previous steps](/hands-on-exercise/4-run-in-prod/3-add-leaderboard.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/leaderboard-handling).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add the leaderboard module via migration.
* Populate the module's genesis with a proper leaderboard.

</HighlightBox>

In previous sections:

* You added, and [added a migration for](/hands-on-exercise/4-run-in-prod/2-migration-info.md), a player info structure that tallies wins and losses per player. You called it v1.1.
* You added a [leaderboard module](/hands-on-exercise/4-run-in-prod/3-add-leaderboard.md), which exists only if you start a new blockchain from scratch. You called it v2.

Here you will reuse some learnings from the v1.1 migration, and adjust them for the special case of a new module.

## High level considerations

Here the decision is to start your v2's leaderboard as if all played past games had been counted for the leaderboard. You _only_ need to go through all player information and add a leaderboard including the information. Migration is a good method to tackle the initial leaderboard.

For the avoidance of doubt, **v1.1 and v2 refer to the overall versions of the application**, and not to the _consensus versions_ of individual modules, which may change or not.

## What you will do

To prepare for your v1.1-to-v2 migration, you will:

  1. Add helper functions to process large amounts of data from the latest chain state of type v1.1.
  2. Add a function to migrate your state from v1.1 to v2.
  3. Make sure you can handle large amounts of data.
  4. Put callbacks if necessary.

_Why do you need to make sure you can handle large amounts of data?_ The full state at the point of migration may well have millions of players. You do not want your process to grind to a halt because of a lack of memory or I/O capacity.

## v1.1 to v2 leaderboard migration helper

In the migration, there are two time-consuming parts:

1. Fetching the stored player info records in a paginated way, consuming mostly database resources.
2. Sorting each intermediate leaderboard, consuming mostly computation resources.

It looks beneficial to use Go routines in this case too, and to use a _player info_ channel to pass along arrays of player info records.

In practice, repeatedly building the intermediate leaderboard means adding _k_ new `Winner`s to the sorted array, sorting it, clipping it to `Params.Length`, and repeating. What constitutes a good _k_ value should be dictated by testing and performance measurements. However, you can start with your best guess in a new file created for this purpose.

### Types and interfaces

Where do you put this new file? The leaderboard module's consensus version starts at `2`. The application will go from _no leaderboard_ to _leaderboard at version 2_. So it makes sense to create a new folder to encapsulate this knowledge:

```sh
$ mkdir -p x/leaderboard/migrations/cv2/types
```

Put your target _k_ length in:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/leaderboard/migrations/cv2/types/keys.go#L6]
const (
    PlayerInfoChunkSize = types.DefaultLength * uint64(2)
)
```

With a view to reusing the module's `Candidate` types, you can add a convenience method to convert an array of `PlayerInfo` to an array of `Candidate`s:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/leaderboard//types/leaderboard_checkers.go#L20-L30]
func MakeCandidatesFromPlayerInfos(playerInfos []checkerstypes.PlayerInfo) (candidates []Candidate, err error) {
    candidates = make([]Candidate, 0, len(playerInfos))
    for _, receivedInfo := range playerInfos {
        candidate, err := MakeCandidateFromPlayerInfo(receivedInfo)
        if err != nil {
            return nil, err
        }
        candidates = append(candidates, candidate)
    }
    return candidates, nil
}
```

### `PlayerInfo` extraction

To extract the `PlayerInfo`, you need access to a checkers keeper. More precisely, you only need access to its paginated `PlayerInfoAll` function.

As usual, describe this dependency in `expected_keepers.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/leaderboard/types/expected_keepers.go#L23-L25]
type PlayerInfoKeeper interface {
    PlayerInfoAll(c context.Context, req *checkerstypes.QueryAllPlayerInfoRequest) (*checkerstypes.QueryAllPlayerInfoResponse, error)
}
```

Then put the migration-specific elements in a dedicated folder:

```sh
$ mkdir x/leaderboard/migrations/cv2/keeper
```

Create the routine that fetches player info from the checkers storage:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/leaderboard/migrations/cv2/keeper/migration_leaderboard.go#L11-L42]
type PlayerInfosChunk struct {
    PlayerInfos []checkerstypes.PlayerInfo
    Error       error
}

func LoadPlayerInfosToChannel(context context.Context,
    playerInfosk types.PlayerInfoKeeper,
    playerInfosChannel chan<- PlayerInfosChunk,
    chunk uint64) {
    defer func() { close(playerInfosChannel) }()
    response, err := playerInfosk.PlayerInfoAll(context, &checkerstypes.QueryAllPlayerInfoRequest{
        Pagination: &query.PageRequest{Limit: chunk},
    })
    if err != nil {
        playerInfosChannel <- PlayerInfosChunk{PlayerInfos: nil, Error: err}
        return
    }
    playerInfosChannel <- PlayerInfosChunk{PlayerInfos: response.PlayerInfo, Error: nil}

    for response.Pagination.NextKey != nil {
        response, err = playerInfosk.PlayerInfoAll(context, &checkerstypes.QueryAllPlayerInfoRequest{
            Pagination: &query.PageRequest{
                Key:   response.Pagination.NextKey,
                Limit: chunk,
            },
        })
        if err != nil {
            playerInfosChannel <- PlayerInfosChunk{PlayerInfos: nil, Error: err}
            return
        }
        playerInfosChannel <- PlayerInfosChunk{PlayerInfos: response.PlayerInfo, Error: nil}
    }
}
```

<HighlightBox type="note">

Note that:

* This passes along the channel a tuple `PlayerInfosChunk` that may contain an error. This is to obtain a result similar to when a function returns an optional error.
* It uses the paginated query so as to not overwhelm the memory if there are millions of infos.
* It closes the channel upon exit whether there is an error or not via the use of `defer`.

</HighlightBox>

This routine populates the player info channel. What about the routine that consumes it?

### Leaderboard computation

Create the routine function that builds the leaderboard in memory and returns it when complete:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/leaderboard/migrations/cv2/keeper/migration_leaderboard.go#L44-L77]
type LeaderboardResult struct {
    Leaderboard *types.Leaderboard
    Error       error
}

func HandlePlayerInfosChannel(playerInfosChannel <-chan PlayerInfosChunk,
    leaderboardChannel chan<- LeaderboardResult,
    leaderboardLength uint64,
    addedAt time.Time,
    chunk uint64) {
    defer func() { close(leaderboardChannel) }()
    winners := make([]types.Winner, 0, leaderboardLength+chunk)
    for receivedInfos := range playerInfosChannel {
        if receivedInfos.Error != nil {
            leaderboardChannel <- LeaderboardResult{Leaderboard: nil, Error: receivedInfos.Error}
            return
        }
        if receivedInfos.PlayerInfos != nil {
            candidates, err := types.MakeCandidatesFromPlayerInfos(receivedInfos.PlayerInfos)
            if err != nil {
                leaderboardChannel <- LeaderboardResult{Leaderboard: nil, Error: err}
                return
            }
            winners = types.AddCandidatesAtNow(winners, addedAt, candidates)
            if leaderboardLength < uint64(len(winners)) {
                winners = winners[:leaderboardLength]
            }
        }
    }
    leaderboardChannel <- LeaderboardResult{
        Leaderboard: &types.Leaderboard{Winners: winners},
        Error:       nil,
    }
}
```

<HighlightBox type="note">

Note that:

* The winners are initialized at a `0` size but with a capacity of `Params.Length + chunk`, which is the expected maximum intermediate size it will reach. This initialization should ensure that the slice does not need to have its capacity increased mid-process.
* It also passes along a tuple with an optional error.
* It closes the channel it populates upon exit whether there is an error or not via the use of `defer`.

</HighlightBox>

This routine populates the leaderboard channel. Where is it consumed?

### Routines orchestration

Now you can declare the main function that creates the channels and routines, and collects the leaderboard when done:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/leaderboard/migrations/cv2/keeper/migration_leaderboard.go#L79-L89]
func MapPlayerInfosReduceToLeaderboard(context context.Context,
    k keeper.Keeper,
    playerInfosk types.PlayerInfoKeeper,
    leaderboardLength uint64,
    addedAt time.Time,
    chunk uint64) (*types.Leaderboard, error) {
    playerInfosChannel := make(chan PlayerInfosChunk)
    leaderboardChannel := make(chan LeaderboardResult)

    go HandlePlayerInfosChannel(playerInfosChannel, leaderboardChannel, leaderboardLength, addedAt, chunk)
    go LoadPlayerInfosToChannel(context, playerInfosk, playerInfosChannel, chunk)

    result := <-leaderboardChannel

    return result.Leaderboard, result.Error
}
```

<HighlightBox type="note">

Note that:

* This returns the leaderboard instead of saving it in the keeper. That is because, when **introducing a module**, you have to initialize it with a **genesis**, and this computed leaderboard will be part of the module's genesis.
* It delegates the closing of channels to the routines.
* It starts the _second_ routine first to reduce the likelihood of channel clogging.

</HighlightBox>

### Advertising the function to use

The migration proper needs to introduce the new module and then populate the genesis with the result of the `MapPlayerInfosReduceToLeaderboard` function. You can encapsulate and advertise this knowledge in two functions:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/leaderboard/migrations/cv2/migration.go#L11-L24]
func ComputeMigratedLeaderboard(ctx sdk.Context, playerInfosk types.PlayerInfoKeeper) (*types.Leaderboard, error) {
    return cv2keeper.MapPlayerInfosReduceToLeaderboard(
        sdk.WrapSDKContext(ctx),
        playerInfosk,
        types.DefaultLength,
        ctx.BlockTime(),
        cv2types.PlayerInfoChunkSize)
}

func ComputeInitGenesis(ctx sdk.Context, playerInfosk types.PlayerInfoKeeper) (*types.GenesisState, error) {
    leaderboard, err := ComputeMigratedLeaderboard(ctx, playerInfosk)
    if err != nil {
        return nil, err
    }
    return &types.GenesisState{
        Params:      types.DefaultParams(),
        Leaderboard: *leaderboard,
    }, nil
}
```

<HighlightBox type="best-practice">

To further limit the dependency of the leaderboard module on the checkers module, you could consider:

* Having the new expected interface be based on `Candidate` and not `PlayerInfo`.
* And keeping the transformation between one and the other in a file whose name is suffixed with `_checkers`.

</HighlightBox>

## v1.1 to v2 migration proper

You now have in place the functions that will handle the store migration. Next you have to set up the chain of command for these functions to be called by the node at the right point in time.

### Consensus version and name

The `upgrade` module keeps in its store the [different module versions](https://docs.cosmos.network/main/core/upgrade.html#tracking-module-versions) that are currently running. To signal an upgrade, your module needs to return a different value when queried by the `upgrade` module. As it stands, your leaderboard consensus version is `2` and that will be its first value when added to the application. To make this explicit, and consistent with the pattern used in the checkers module, you can keep this information in a constant like you did for the checkers module:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/leaderboard/migrations/cv2/types/keys.go#L7]
    const (
        PlayerInfoChunkSize = types.DefaultLength * uint64(2)
+      ConsensusVersion    = uint64(2)
    )
```

It can be used by `module.go`:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/leaderboard/module.go#L172]
-  func (AppModule) ConsensusVersion() uint64 { return 2 }
+  func (AppModule) ConsensusVersion() uint64 { return cv2types.ConsensusVersion }
```

<HighlightBox type="note">

The consensus version number has no connection to v1.1 or v2. The consensus version number is for the module, whereas v1.1 or v2 is for the whole application.

</HighlightBox>

You also have to pick a name for the upgrade you have prepared. This name will identify your specific upgrade when it is mentioned in a `Plan` (i.e. an upgrade governance proposal). Use a name that is relevant at the application level:

```sh
$ mkdir app/upgrades/v1_1tov2
```

In this you save:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/app/upgrades/v1_1tov2/keys.go#L3]
const UpgradeName = "v1_1tov2"
```

You have to inform your app about:

1. The module being introduced.
2. The genesis to use for it.

Prepare these in turn.

### Callback in leaderboard module

Although the module does not upgrade per se, you need to make sure that it does not fail when presented with an upgrade. Call `RegisterMigration` with `nil` action:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/x/leaderboard/module.go#L143-L147]
    import (
        ...
+      cv2Types "github.com/b9lab/checkers/x/checkersleaderboard/migrations/cv2/types"
        "github.com/b9lab/checkers/x/leaderboard/types"
        ...
    )
    func (am AppModule) RegisterServices(cfg module.Configurator) {
        types.RegisterQueryServer(cfg.QueryServer(), am.keeper)
+      if err := cfg.RegisterMigration(types.ModuleName, cv2Types.ConsensusVersion, func(ctx sdk.Context) error {
+          return nil
+      }); err != nil {
+          panic(fmt.Errorf("failed to register cv2 leaderboard migration of %s: %w", types.ModuleName, err))
+      }
    }
```

<HighlightBox type="best-practice">

You _could_ run a proper migration here, if you added a checkers keeper (or rather a `types.PlayerInfoKeeper`) in your module.
<br/><br/>
The downside is that this keeper would be used only at the time of migration and therefore is a massive overkill, if not a security risk.

</HighlightBox>

### Callback in `app`

In a [previous section](/hands-on-exercise/4-run-in-prod/2-migration-info.md) you already prepared `app.go` to handle a migration, namely `v1tov1_1`. Here you add to this `setupUpgradeHandlers` function in two places:

1. First, after the `v1tov1_1` upgrade method, introduce the way to get the new leaderboard's module genesis:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/app/app.go#L792-L811]
        // v1 to v1.1 upgrade handler
        app.UpgradeKeeper.SetUpgradeHandler(
            v1tov1_1.UpgradeName,
            ...
        )
    +  // v1.1 to v2 upgrade handler
    +  app.UpgradeKeeper.SetUpgradeHandler(
    +      v1_1tov2.UpgradeName,
    +      func(ctx sdk.Context, plan upgradetypes.Plan, vm module.VersionMap) (module.VersionMap, error) {
    +          vm[leaderboardmoduletypes.ModuleName] = leaderboardmodulemigrationscv2types.ConsensusVersion
    +          genesis, err := leaderboardmodulemigrationscv2.ComputeInitGenesis(ctx, app.CheckersKeeper)
    +          if err != nil {
    +              return vm, err
    +          }
    +          gen, err := app.appCodec.MarshalJSON(genesis)
    +          if err != nil {
    +              return vm, err
    +          }
    +          app.mm.Modules[leaderboardmoduletypes.ModuleName].InitGenesis(
    +              ctx,
    +              app.appCodec,
    +              gen)
    +          return app.mm.RunMigrations(ctx, app.configurator, vm)
    +      },
    +  )
        ...
    ```

    <HighlightBox type="note">

    Note that:

    * The version map is populated with the current consensus version of the leaderboard. This stops the leaderboard from being upgraded further.
    * `app.CheckersKeeper` is used. This is the only time the leaderboard module has access to the checkers module.
    * The genesis needs to be marshalled before being passed to `InitGenesis`.

    </HighlightBox>

2. Second, inform it that as part of the `v1_1tov2` upgrade a new store key is introduced:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/leaderboard-migration/app/app.go#L829-L833]
        ...
        switch upgradeInfo.Name {
        case v1tov1_1.UpgradeName:
    +  case v1_1tov2.UpgradeName:
    +      storeUpgrades = &storetypes.StoreUpgrades{
    +          Added: []string{leaderboardmoduletypes.StoreKey},
    +      }
        }
    ```

    This is where the genesis will be saved.

With this, the app is configured to handle the module upgrade.

## Unit tests

After all these changes it is worthwhile adding tests, at least on the helpers.

### New mock types

You introduced a new expected keeper. If you want to unit test your migration helpers properly, you have to mock this new expected interface:

1. Add to the relevant `Makefile` target:

    ```diff-lang-makefile
        mock-expected-keepers:
            ...
                -destination=x/checkers/testutil/expected_keepers_mocks.go
    +      mockgen -source=x/leaderboard/types/expected_keepers.go \
    +          -package testutil \
    +          -destination=x/leaderboard/testutil/expected_keepers_mocks.go
    ```

2. Now run it:

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

### Create the mock instance

In a new file, add a function to prepare your new mock:

```go
const (
    alice = testutil.Alice
    bob   = testutil.Bob
    carol = testutil.Carol
)

func setupMockForLeaderboardMigration(t testing.TB) (context.Context, *gomock.Controller, *testutil.MockPlayerInfoKeeper) {
    ctrl := gomock.NewController(t)
    playerInfoMock := testutil.NewMockPlayerInfoKeeper(ctrl)
    _, ctx := keepertest.LeaderboardKeeper(t)
    return sdk.WrapSDKContext(ctx), ctrl, playerInfoMock
}
```

In your test, prepare the mock:

```go
func TestComputeLeaderboard(t *testing.T) {
    context, ctrl, playerInfoMock := setupMockForLeaderboardMigration(t)
    // TODO
    ctrl.Finish()
}
```

### Configure the mock

To use your mock, this time it takes a bit of effort:

* To test that it was called correctly, use `.EXPECT()` with defined values.
* To have it return player infos in chunks, use `.Return()` and make sure the pagination's `NextKey` is populated when necessary.
* To confirm that one call happens before the other, use `gomock.InOrder()`.

Imagine that the keeper has:

```go
PlayerInfos: []checkerstypes.PlayerInfo{
    { Index: alice, WonCount: 1 },
    { Index: bob, WonCount: 2 },
    { Index: carol, WonCount: 3 },
}
```

Also imagine you want to have it return the info paginated in chunks of size `2`. This means two calls:

1. The first call:

    ```diff-go
        context, ctrl, playerInfoMock := setupMockForLeaderboardMigration(t)
    -  // TODO
    +  firstCall := playerInfoMock.EXPECT().
    +      PlayerInfoAll(context, &checkerstypes.QueryAllPlayerInfoRequest{
    +          Pagination: &query.PageRequest{Limit: 2},
    +      }).
    +      Return(&checkerstypes.QueryAllPlayerInfoResponse{
    +          PlayerInfo: []checkerstypes.PlayerInfo{
    +              {
    +                  Index:    alice,
    +                  WonCount: 1,
    +              },
    +              {
    +                  Index:    bob,
    +                  WonCount: 2,
    +              },
    +          },
    +          Pagination: &query.PageResponse{
    +              NextKey: []byte("more"),
    +          },
    +      }, nil)
        ...
    ```

2. The second call:

    ```diff-go
        firstCall := playerInfoMock.EXPECT().
            ...
            }, nil)
    +  secondCall := playerInfoMock.EXPECT().
    +      PlayerInfoAll(context, &checkerstypes.QueryAllPlayerInfoRequest{
    +          Pagination: &query.PageRequest{
    +              Key:   []byte("more"),
    +              Limit: 2,
    +          },
    +      }).
    +      Return(&checkerstypes.QueryAllPlayerInfoResponse{
    +          PlayerInfo: []checkerstypes.PlayerInfo{
    +              {
    +                  Index:    carol,
    +                  WonCount: 3,
    +              },
    +          },
    +          Pagination: &query.PageResponse{
    +              NextKey: nil,
    +          },
    +      }, nil)
        ...
    ```

3. Now specify the desired order:

    ```diff-go
        secondCall := playerInfoMock.EXPECT().
            ...
            }, nil)
    +  gomock.InOrder(firstCall, secondCall)
        ...
    ```

### Rest of the test

From there, the test is as usual:

```diff-go
    ...
    gomock.InOrder(firstCall, secondCall)

+  leaderboard, err := cv2keeper.MapPlayerInfosReduceToLeaderboard(
+      context,
+      playerInfoMock,
+      2,
+      time.Unix(int64(1001), 0),
+      2)

+  require.Nil(t, err)
+  require.Equal(t, 2, len(leaderboard.Winners))
+  require.EqualValues(t, types.Leaderboard{
+      Winners: []types.Winner{
+          {
+              Address:  carol,
+              WonCount: 3,
+              AddedAt:  1001,
+          },
+          {
+              Address:  bob,
+              WonCount: 2,
+              AddedAt:  1001,
+          },
+      },
+  }, *leaderboard)
    ctrl.Finish()
```

### Run it

You can confirm that the test passes by running:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go test github.com/b9lab/checkers/x/leaderboard/migrations/cv2/keeper
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    go test github.com/b9lab/checkers/x/leaderboard/migrations/cv2/keeper
```

</CodeGroupItem>

</CodeGroup>

Given the configuration difficulty of the mock, only this test will do.

It is not possible to add integration tests on the migration proper, because when the app is created it is already at v2.

## Interact via the CLI

You can execute a live upgrade from the command line. The following upgrade process takes inspiration from [this one](https://hub.cosmos.network/main/hub-tutorials/live-upgrade-tutorial.html) based on Gaia. You will:

* Check out the checkers v1.1 code.
* Build the v1.1 checkers executable.
* Initialize a local blockchain and network.
* Run v1.1 checkers.
* Add one or more incomplete games.
* Add one or more complete games with the help of a CosmJS integration test.
* Create a governance proposal to upgrade with the right plan name at an appropriate block height.
* Make the proposal pass.
* Wait for v1.1 checkers to halt on its own at the upgrade height.
* Check out the checkers v2 code.
* Build the v2 checkers executable.
* Run v2 checkers.
* Confirm that you now have a correct leaderboard.

Start your engines!

### Launch v1.1

After committing your changes, in a shell checkout v1.1 of checkers with the content of the CosmJS client work:

```sh
$ git checkout player-info-migration
$ git submodule update --init
```

Build the v1.1 executable for your platform:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go build -o release/v1_1/checkersd cmd/checkersd/main.go
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    go build -o release/v1_1/checkersd cmd/checkersd/main.go
```

</CodeGroupItem>

</CodeGroup>

With the `release/v1_1/checkersd` executable ready, you can initialize the network.

<HighlightBox type="warn">

Because this is an exercise, to avoid messing with your keyring you must always specify `--keyring-backend test`.

</HighlightBox>

Add two players:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd keys add alice --keyring-backend test
$ ./release/v1_1/checkersd keys add bob --keyring-backend test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker network create checkers-net
$ docker create -it \
    -v $(pwd):/checkers -w /checkers \
    --network checkers-net \
    --name checkers \
    -p 26657:26657 \
    checkers_i
$ docker start checkers
$ docker exec -t checkers \
    ./release/v1_1/checkersd keys add alice --keyring-backend test
$ docker exec -t checkers \
    ./release/v1_1/checkersd keys add bob --keyring-backend test
```

<HighlightBox type="note">

You should not use `docker run --rm` here, because when `checkersd` stops you do not want to remove the container and thereby destroy the saved keys, and the future genesis too. Instead, you reuse them all in the next calls.

</HighlightBox>

</CodeGroupItem>

</CodeGroup>

Create a new genesis:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd init checkers --chain-id checkers-1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1_1/checkersd init checkers --chain-id checkers-1
```

</CodeGroupItem>

</CodeGroup>

Give your players the same token amounts that were added by Ignite, as found in `config.yml`:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd add-genesis-account \
    alice 200000000stake,20000token --keyring-backend test
$ ./release/v1_1/checkersd add-genesis-account \
    bob 100000000stake,10000token --keyring-backend test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1_1/checkersd add-genesis-account \
    alice 200000000stake,20000token --keyring-backend test
$ docker exec -t checkers \
    ./release/v1_1/checkersd add-genesis-account \
    bob 100000000stake,10000token --keyring-backend test
```

</CodeGroupItem>

</CodeGroup>

To be able to run a quick test, you need to change the voting period of a proposal. This is found in the genesis:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ jq '.app_state.gov.voting_params.voting_period' ~/.checkers/config/genesis.json
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    jq '.app_state.gov.voting_params.voting_period' /root/.checkers/config/genesis.json
```

</CodeGroupItem>

</CodeGroup>

This returns something like:

```json
"172800s"
```

That is two days, which is too long to wait for CLI tests. Choose another value, perhaps 10 minutes (i.e. `"600s"`). Update it in place in the genesis:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ cat <<< $(jq '.app_state.gov.voting_params.voting_period = "600s"' ~/.checkers/config/genesis.json) \
    > ~/.checkers/config/genesis.json
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    bash -c "cat <<< \$(jq '.app_state.gov.voting_params.voting_period = \"600s\"' /root/.checkers/config/genesis.json) \
    > /root/.checkers/config/genesis.json"
```

</CodeGroupItem>

</CodeGroup>

You can confirm that the value is in using the earlier command.

Make Alice the chain's validator too by creating a genesis transaction modeled on that done by Ignite, as found in `config.yml`:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd gentx alice 100000000stake \
    --keyring-backend test --chain-id checkers-1
$ ./release/v1_1/checkersd collect-gentxs
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1_1/checkersd gentx alice 100000000stake \
    --keyring-backend test --chain-id checkers-1
$ docker exec -t checkers \
    ./release/v1_1/checkersd collect-gentxs
```

</CodeGroupItem>

</CodeGroup>

Now you can start the chain proper:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd start
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    ./release/v1_1/checkersd start \
    --rpc.laddr "tcp://0.0.0.0:26657"
```

Note that you need to force the node to listen on all IP addresses, not just `127.0.0.1` as it would do by default.

</CodeGroupItem>

</CodeGroup>

---

### Add games

From another shell, create a few un-played games with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ export alice=$(./release/v1_1/checkersd keys show alice -a --keyring-backend test)
$ export bob=$(./release/v1_1/checkersd keys show bob -a --keyring-backend test)
$ ./release/v1_1/checkersd tx checkers create-game \
    $alice $bob 10 stake \
    --from $alice --keyring-backend test --yes \
    --chain-id checkers-1 \
    --broadcast-mode block
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ export alice=$(docker exec checkers ./release/v1_1/checkersd keys show alice -a --keyring-backend test)
$ export bob=$(docker exec checkers ./release/v1_1/checkersd keys show bob -a --keyring-backend test)
$ docker exec -t checkers \
    ./release/v1_1/checkersd tx checkers create-game \
    $alice $bob 10 stake \
    --from $alice --keyring-backend test --yes \
    --chain-id checkers-1 \
    --broadcast-mode block
```

</CodeGroupItem>

</CodeGroup>

<HighlightBox type="note">

The `--broadcast-mode block` flag means that you can fire up many such games by just copying the command without facing any sequence errors.

</HighlightBox>

To get a few complete games, you are going to run the [integration tests](https://github.com/cosmos/academy-checkers-ui/blob/main/test/integration/stored-game-action.ts) against it. These tests call a faucet if the accounts do not have enough. Because you do not have a faucet here, you need to credit your test accounts with standard `bank send` transactions. You can use the same values as found in the `before`:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd tx bank \
    send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 300stake \
    --from $alice --keyring-backend test \
    --chain-id checkers-1 \
    --broadcast-mode block --yes
$ ./release/v1_1/checkersd tx bank \
    send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 10token \
    --from $alice --keyring-backend test \
    --chain-id checkers-1 \
    --broadcast-mode block --yes
$ ./release/v1_1/checkersd tx bank \
    send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 300stake \
    --from $bob --keyring-backend test \
    --chain-id checkers-1 \
    --broadcast-mode block --yes
$ ./release/v1_1/checkersd tx bank \
    send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 10token \
    --from $bob --keyring-backend test \
    --chain-id checkers-1 \
    --broadcast-mode block --yes
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1_1/checkersd tx bank \
    send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 300stake \
    --from $alice --keyring-backend test \
    --chain-id checkers-1 \
    --broadcast-mode block --yes
$ docker exec -t checkers \
    ./release/v1_1/checkersd tx bank \
    send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 10token \
    --from $alice --keyring-backend test \
    --chain-id checkers-1 \
    --broadcast-mode block --yes
$ docker exec -t checkers \
    ./release/v1_1/checkersd tx bank \
    send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 300stake \
    --from $bob --keyring-backend test \
    --chain-id checkers-1 \
    --broadcast-mode block --yes
$ docker exec -t checkers \
    ./release/v1_1/checkersd tx bank \
    send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 10token \
    --from $bob --keyring-backend test \
    --chain-id checkers-1 \
    --broadcast-mode block --yes
```

</CodeGroupItem>

</CodeGroup>

With the test accounts sufficiently credited, you can now run the integration tests. Run them three times in a row to create three complete games:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ pushd client && npm test && popd
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd)/client:/client \
    -w /client \
    --network checkers-net \
    --env RPC_URL="http://checkers:26657" \
    node:18.7-slim \
    npm test
```

</CodeGroupItem>

</CodeGroup>

---

You can confirm that you have computed player info:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd query checkers \
    list-player-info --output json \
    | jq '.playerInfo'
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    bash -c "./release/v1_1/checkersd query checkers \
        list-player-info --output json \
        | jq '.playerInfo'"
```

</CodeGroupItem>

</CodeGroup>

With enough games in the system, you can move to the software upgrade governance proposal.

### Governance proposal

For the software upgrade governance proposal, you want to make sure that it stops the chain not too far in the future but still after the voting period. With a voting period of 10 minutes, take 15 minutes. How many seconds does a block take?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ jq -r ".app_state.mint.params.blocks_per_year" \
    ~/.checkers/config/genesis.json
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    bash -c 'jq -r ".app_state.mint.params.blocks_per_year" /root/.checkers/config/genesis.json'
```

</CodeGroupItem>

</CodeGroup>

This returns something like:

```txt
6311520
```

That many `blocks_per_year` computes down to 5 seconds per block. At this rate, 15 minutes mean 180 blocks.

What is the current block height? Check:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd status \
    | jq -r ".SyncInfo.latest_block_height"
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    bash -c './release/v1_1/checkersd status \
        | jq -r ".SyncInfo.latest_block_height"'
```

</CodeGroupItem>

</CodeGroup>

This returns something like:

```json
1000
```

That means you will use:

```txt
--upgrade-height 1180
```

What is the minimum deposit for a proposal? Check:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ jq ".app_state.gov.deposit_params.min_deposit" \
    ~/.checkers/config/genesis.json
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    bash -c 'jq ".app_state.gov.deposit_params.min_deposit" \
        /root/.checkers/config/genesis.json'
```

</CodeGroupItem>

</CodeGroup>

This returns something like:

```json
[
    {
        "denom": "stake",
        "amount": "10000000"
    }
]
```

This is the minimum amount that Alice has to deposit when submitting the proposal. This will do:

```txt
--deposit 10000000stake
```

Now submit your governance proposal upgrade:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd tx gov submit-proposal software-upgrade v1_1tov2 \
    --title "v1_1tov2" \
    --description "Increase engagement via the use of a leaderboard" \
    --from $alice --keyring-backend test --yes \
    --chain-id checkers-1 \
    --broadcast-mode block \
    --upgrade-height 1180 \
    --deposit 10000000stake
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1_1/checkersd tx gov submit-proposal software-upgrade v1_1tov2 \
    --title "v1_1tov2" \
    --description "Increase engagement via the use of a leaderboard" \
    --from $alice --keyring-backend test --yes \
    --chain-id checkers-1 \
    --broadcast-mode block \
    --upgrade-height 1180 \
    --deposit 10000000stake
```

</CodeGroupItem>

</CodeGroup>

This returns something like:

```yaml
  ...
  type: proposal_deposit
- attributes:
  - key: proposal_id
    value: "1"
  - key: proposal_type
    value: SoftwareUpgrade
  - key: voting_period_start
    value: "1"
  ...
 ```

Where `1` is the proposal ID you reuse. Have Alice and Bob vote yes on it:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd tx gov vote 1 yes \
    --from $alice --keyring-backend test --yes \
    --chain-id checkers-1
$ ./release/v1_1/checkersd tx gov vote 1 yes \
    --from $bob --keyring-backend test --yes \
    --chain-id checkers-1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1_1/checkersd tx gov vote 1 yes \
    --from $alice --keyring-backend test --yes \
    --chain-id checkers-1
$ docker exec -t checkers \
    ./release/v1_1/checkersd tx gov vote 1 yes \
    --from $bob --keyring-backend test --yes \
    --chain-id checkers-1
```

</CodeGroupItem>

</CodeGroup>

Confirm that it has collected the votes:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd query gov votes 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1_1/checkersd query gov votes 1
```

</CodeGroupItem>

</CodeGroup>

It should print:

```yaml
votes:
- option: VOTE_OPTION_YES
  options:
  - option: VOTE_OPTION_YES
    weight: "1.000000000000000000"
  proposal_id: "1"
  voter: cosmos1hzftnstmlzqfaj0rz39hn5pe2vppz0phy4x9ct
- option: VOTE_OPTION_YES
  options:
  - option: VOTE_OPTION_YES
    weight: "1.000000000000000000"
  proposal_id: "1"
  voter: cosmos1hj2x82j49fv90tgtdxrdw5fz3w2vqeqqjhrxle
```

See how long you have to wait for the chain to reach the end of the voting period:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd query gov proposal 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1_1/checkersd query gov proposal 1
```

</CodeGroupItem>

</CodeGroup>

In the end this prints:

```txt
...
status: PROPOSAL_STATUS_VOTING_PERIOD
...
voting_end_time: "2022-08-25T10:38:22.240766103Z"
...
```

Wait for this period. Afterward, with the same command you should see:

```txt
...
status: PROPOSAL_STATUS_PASSED
...
```

Now wait for the chain to reach the desired block height, which should take five more minutes as per your parameters. When it has reached that height, the shell with the running `checkersd` should show something like:

```txt
...
6:29PM INF finalizing commit of block hash=E6CB6F1E8CF4699543950F756F3E15AE447701ABAC498CDBA86633AC93A73EE7 height=1180 module=consensus num_txs=0 root=21E51E52AA3F06BE59C78CE11D3171E6F7240D297E4BCEAB07FC5A87957B3BE2
6:29PM ERR UPGRADE "v1_1tov2" NEEDED at height: 1180:
6:29PM ERR CONSENSUS FAILURE!!! err="UPGRADE \"v1_1tov2\" NEEDED at height: 1180: " module=consensus stack="goroutine 62 [running]:\nruntime/debug.Stack
...
6:29PM INF Stopping baseWAL service impl={"Logger":{}} module=consensus wal=/root/.checkers/data/cs.wal/wal
6:29PM INF Stopping Group service impl={"Dir":"/root/.checkers/data/cs.wal","Head":{"ID":"ZsAlN7DEZAbV:/root/.checkers/data/cs.wal/wal","Path":"/root/.checkers/data/cs.wal/wal"},"ID":"group:ZsAlN7DEZAbV:/root/.checkers/data/cs.wal/wal","Logger":{}} module=consensus wal=/root/.checkers/data/cs.wal/wal
...
```

At this point, run in another shell:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd status \
    | jq -r ".SyncInfo.latest_block_height"
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    bash -c './release/v1_1/checkersd status \
        | jq -r ".SyncInfo.latest_block_height"'
```

</CodeGroupItem>

</CodeGroup>

You should always get the same value, no matter how many times you try. That is because the chain has stopped. For instance:

```txt
1180
```

Stop `checkersd` with <kbd>CTRL-C</kbd>. It has saved a new file:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ cat ~/.checkers/data/upgrade-info.json
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    cat /root/.checkers/data/upgrade-info.json
```

</CodeGroupItem>

</CodeGroup>

This prints:

```json
{"name":"v1_1tov2","height":1180}
```

With your node (and therefore your whole blockchain) down, you are ready to move to v2.

### Launch v2

With v1_1 stopped and its state saved, it is time to move to v2. Checkout v2 of checkers:

```sh
$ git checkout leaderboard-migration
```

Back in the first shell, build the v2 executable:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go build -o ./release/v2/checkersd ./cmd/checkersd/main.go
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    go build -o ./release/v2/checkersd ./cmd/checkersd/main.go
```

</CodeGroupItem>

</CodeGroup>

Launch it:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v2/checkersd start
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    ./release/v2/checkersd start \
    --rpc.laddr "tcp://0.0.0.0:26657"
```

</CodeGroupItem>

</CodeGroup>

It should start and display something like:

```txt
...
7:06PM INF applying upgrade "v1_1tov2" at height: 1180
7:06PM INF Leaderboard genesis saved
...
```

After it has started, you can confirm in another shell that you have the expected leaderboard with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v2/checkersd query leaderboard show-leaderboard
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v2/checkersd query leaderboard show-leaderboard
```

</CodeGroupItem>

</CodeGroup>

This should print something like:

```yaml
Leaderboard:
  winners:
  - addedAt: "1682983659"
    address: cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql
    wonCount: "3"
```

Note how it took the time of the block when v1_1 stopped.

Congratulations, you have upgraded your blockchain almost as if in production!

You can stop Ignite CLI. If you used Docker that would be:

```sh
$ docker stop checkers
$ docker rm checkers
$ docker network rm checkers-net
```

Your checkers blockchain is done! It has a leaderboard, which was introduced later in production thanks to migrations.

You no doubt have many ideas about how to improve it. In particular, you could implement the missing _draw_ mechanism, which in effect has to be accepted by both players.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to add a leaderboard to an existing blockchain.
* How to upgrade a blockchain in production, by migrating from v1_1 of the blockchain to v2, and the new store structure that will be introduced by the upgrade.
* How to handle the data migrations and logic upgrades implicit during migration, such as with the use of helper functions.
* Worthwhile unit tests with regard to leaderboard handling.
* A complete procedure for how to conduct the update via the CLI.

</HighlightBox>

<!--

## Next up

It is time to move away from the checkers blockchain learning exercise, and explore another helpful tool for working with the Cosmos SDK: CosmWasm.

-->
