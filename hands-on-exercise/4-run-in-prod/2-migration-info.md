---
title: "Tally Player Info After Production"
order: 3
description: A new player info for your in-production blockchain via state migration
tags: 
  - guided-coding
  - cosmos-sdk
  - cosm-js
---

# Tally Player Info After Production

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md) and [migrations](/academy/2-cosmos-concepts/13-migrations.md).
* Go is installed.
* You have the checkers blockchain codebase up to the _Simulate Production in Docker_. If not, follow the [previous steps](/hands-on-exercise/4-run-in-prod/1-run-prod-docker.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/run-prod).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add a new storage structure to tally player information.
* Upgrade your blockchain in production.
* Deal with data migrations and logic upgrades.

</HighlightBox>

If you have been running _v1_ of your checkers blockchain for a while, games have been created, played on, won, and lost. In this section, you will introduce _v1.1_ of your blockchain where wins and losses and tallied in a new storage data structure. 

<HighlightBox type="tip">

This is not done in vain. Instead, looking forward, this is done to support the addition of a leaderboard module for your _v2_ in the [next section](./3-migration-leaderboard.md).

</HighlightBox>

For now, a good tally should be such that for any player who has **ever** played it should be possible to access a tally of games won. While you are at it, you will add games lost and forfeited. Fortunately, this is possible because all past games and their outcomes are kept in the chain's state. Migration is a good method to tackle the initial tally.

For the avoidance of doubt, **v1 and v1.1 refer to the overall versions of the application**, and not to the _consensus versions_ of individual modules, which may change or not. As it happens, your application has a single module, apart from those coming from the Cosmos SDK.

## Introducing a new data structure

Several things need to be addressed before you can focus all your attention on the migration:

1. Save and mark as v1 the current data types about to be modified with the new version. Data types that will remain unmodified need not be identified as such.
2. Prepare your v1.1 blockchain:
    1. Define your new data types.
    2. Add helper functions to encapsulate clearly defined actions.
    3. Adjust the existing code to make use of and update the new data types.
3. Prepare for your v1-to-v1.1 migration:
    1. Add helper functions to process large amounts of data from the latest chain state of v1.
    2. Add a function to migrate your state from v1 to v1.1.
    3. Make sure you can handle large amounts of data.

_Why do you need to make sure you can handle large amounts of data?_ The full state at the point of migration may well have millions of games. You do not want your process to grind to a halt because of a lack of memory or I/O capacity.

## Preparation

For your convenience, you decide to keep all the migration steps in a new folder, `x/checkers/migrations`, and subfolders, which needs to be created:

```sh
$ mkdir x/checkers/migrations
```

Your data types are defined at a given consensus version of the module, not the application level v1. Find out the checkers module's current consensus version:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/x/checkers/module.go#L166]
func (AppModule) ConsensusVersion() uint64 { return 2 }
```

Keep a note of it. At some point, you will create a `cv2` subfolder (Where `cv` is short for _consensus version_) for anything related to the consensus version at this level.

If your migration happened to require the _old_ data structure at an earlier consensus version, you would save the old types here.

## New v1.1 information

It is time to take a closer look at the new data structures being introduced with the version upgrade.

<HighlightBox type="tip">

If you feel unsure about creating new data structures with Ignite CLI, look at the [previous sections](/hands-on-exercise/1-ignite-cli/4-create-message.md) of the exercise again.

</HighlightBox>

To give the new v1.1 information a data structure, you need the following:

1. Add a set of **stats per player**: it makes sense to save one `struct` for each player and to map it by address. Remember that a game is stored at a _notional_ [`StoredGame/value/123/`](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/x/checkers/keeper/stored_game.go#L24-L28), where [`StoredGame/value/`](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/x/checkers/types/key_stored_game.go#L9) is a constant prefix. Similarly, Ignite CLI creates a new constant to use as the prefix for players:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ ignite scaffold map playerInfo \
        wonCount:uint lostCount:uint forfeitedCount:uint \
        --module checkers --no-message
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker run --rm -it \
        -v $(pwd):/checkers \
        -w /checkers \
        checkers_i \
        ignite scaffold map playerInfo \
        wonCount:uint lostCount:uint forfeitedCount:uint \
        --module checkers --no-message
    ```

    </CodeGroupItem>

    </CodeGroup>

    <HighlightBox type="info">

    The new `PlayerInfo/value/` prefix for players helps differentiate between the value for players and the value for games prefixed with `StoredGame/value/`.
    <br/><br/>
    Now you can safely have both `StoredGame/value/123/` and `PlayerInfo/value/123/` side by side in storage.

    </HighlightBox>

    This creates a Protobuf file:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-object/proto/checkers/player_info.proto#L6-L11]
    message PlayerInfo {
        string index = 1;
        uint64 wonCount = 2;
        uint64 lostCount = 3;
        uint64 forfeitedCount = 4;
    }
    ```

    It also added the map of new objects to the genesis, effectively your v1.1 genesis:

    ```diff-protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-object/proto/checkers/genesis.proto#L18]
        import "checkers/player_info.proto";

        message GenesisState {
            ...
    +      repeated PlayerInfo playerInfoList = 4 [(gogoproto.nullable) = false];
        }
    ```

    You will use the player's address as a key to the map.

With the structure set up, it is time to add the code using these new elements in normal operations, before thinking about any migration.

## v1.1 player information helpers

When a game reaches its resolution, one of the `count`s needs to add `+1`.

<ExpansionPanel title="A detailed look into the code">

To start, add a private helper function that gets the stats from the storage, updates the numbers as instructed, and saves it back:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/player_info_handler.go#L11-L33]
func mustAddDeltaGameResultToPlayer(
    k *Keeper,
    ctx sdk.Context,
    player sdk.AccAddress,
    wonDelta uint64,
    lostDelta uint64,
    forfeitedDelta uint64,
) (playerInfo types.PlayerInfo) {
    playerInfo, found := k.GetPlayerInfo(ctx, player.String())
    if !found {
        playerInfo = types.PlayerInfo{
            Index:          player.String(),
            WonCount:       0,
            LostCount:      0,
            ForfeitedCount: 0,
        }
    }
    playerInfo.WonCount += wonDelta
    playerInfo.LostCount += lostDelta
    playerInfo.ForfeitedCount += forfeitedDelta
    k.SetPlayerInfo(ctx, playerInfo)
    return playerInfo
}
```

You can easily call this from these public one-liner functions added to the keeper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/player_info_handler.go#L35-L45]
func (k *Keeper) MustAddWonGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) types.PlayerInfo {
    return mustAddDeltaGameResultToPlayer(k, ctx, player, 1, 0, 0)
}

func (k *Keeper) MustAddLostGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) types.PlayerInfo {
    return mustAddDeltaGameResultToPlayer(k, ctx, player, 0, 1, 0)
}

func (k *Keeper) MustAddForfeitedGameResultToPlayer(ctx sdk.Context, player sdk.AccAddress) types.PlayerInfo {
    return mustAddDeltaGameResultToPlayer(k, ctx, player, 0, 0, 1)
}
```

Which player should get `+1`, and on what count? You need to identify the loser and the winner of a game to determine this. Create another private helper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/player_info_handler.go#L47-L69]
func getWinnerAndLoserAddresses(storedGame *types.StoredGame) (winnerAddress sdk.AccAddress, loserAddress sdk.AccAddress) {
    if storedGame.Winner == rules.PieceStrings[rules.NO_PLAYER] {
        panic(types.ErrThereIsNoWinner.Error())
    }
    redAddress, err := storedGame.GetRedAddress()
    if err != nil {
        panic(err.Error())
    }
    blackAddress, err := storedGame.GetBlackAddress()
    if err != nil {
        panic(err.Error())
    }
    if storedGame.Winner == rules.PieceStrings[rules.RED_PLAYER] {
        winnerAddress = redAddress
        loserAddress = blackAddress
    } else if storedGame.Winner == rules.PieceStrings[rules.BLACK_PLAYER] {
        winnerAddress = blackAddress
        loserAddress = redAddress
    } else {
        panic(fmt.Sprintf(types.ErrWinnerNotParseable.Error(), storedGame.Winner))
    }
    return winnerAddress, loserAddress
}
```

You can call this from these public helper functions added to the keeper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/player_info_handler.go#L71-L81]
func (k *Keeper) MustRegisterPlayerWin(ctx sdk.Context, storedGame *types.StoredGame) (winnerInfo types.PlayerInfo, loserInfo types.PlayerInfo) {
    winnerAddress, loserAddress := getWinnerAndLoserAddresses(storedGame)
    return k.MustAddWonGameResultToPlayer(ctx, winnerAddress),
        k.MustAddLostGameResultToPlayer(ctx, loserAddress)
}

func (k *Keeper) MustRegisterPlayerForfeit(ctx sdk.Context, storedGame *types.StoredGame) (winnerInfo types.PlayerInfo, forfeiterInfo types.PlayerInfo) {
    winnerAddress, loserAddress := getWinnerAndLoserAddresses(storedGame)
    return k.MustAddWonGameResultToPlayer(ctx, winnerAddress),
        k.MustAddForfeitedGameResultToPlayer(ctx, loserAddress)
}
```

<HighlightBox type="note">

Be aware of the two new error types: [`ErrThereIsNoWinner`](https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/types/errors.go#L28) and [`ErrWinnerNotParseable`](https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/types/errors.go#L27).

</HighlightBox>

</ExpansionPanel>

## v1.1 player information handling

Now call your helper functions:

1. On a win:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/msg_server_play_move.go#L80]
        ...
        if storedGame.Winner == rules.PieceStrings[rules.NO_PLAYER] {
            ...
        } else {
            ...
            k.Keeper.MustPayWinnings(ctx, &storedGame)
    +      k.Keeper.MustRegisterPlayerWin(ctx, &storedGame)
        }
        ...
    ```

2. On a forfeit:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/end_block_server_game.go#L57]
        ...
        if storedGame.MoveCount <= 1 {
            ...
        } else {
            ...
            k.MustPayWinnings(ctx, &storedGame)
    +      k.MustRegisterPlayerForfeit(ctx, &storedGame)
        }
        ...
    ```

Your player info tallies are now updated and saved on an on-going basis in your running v1.1 blockchain.

## Unit tests

With all these changes, it is worthwhile adding tests.

### Player info handling unit tests

Confirm with new tests that the player's information is created or updated on a win, a loss, and a forfeit. For instance, after a winning move:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/msg_server_play_move_winner_test.go#L68-L131]
func TestCompleteGameAddPlayerInfo(t *testing.T) {
    msgServer, keeper, context, ctrl, escrow := setupMsgServerWithOneGameForPlayMove(t)
    ctx := sdk.UnwrapSDKContext(context)
    defer ctrl.Finish()
    escrow.ExpectAny(context)

    testutil.PlayAllMoves(t, msgServer, context, "1", bob, carol, testutil.Game1Moves)

    bobInfo, found := keeper.GetPlayerInfo(ctx, bob)
    require.True(t, found)
    require.EqualValues(t, types.PlayerInfo{
        Index:          bob,
        WonCount:       1,
        LostCount:      0,
        ForfeitedCount: 0,
    }, bobInfo)
    carolInfo, found := keeper.GetPlayerInfo(ctx, carol)
    require.True(t, found)
    require.EqualValues(t, types.PlayerInfo{
        Index:          carol,
        WonCount:       0,
        LostCount:      1,
        ForfeitedCount: 0,
    }, carolInfo)
}

func TestCompleteGameUpdatePlayerInfo(t *testing.T) {
    msgServer, keeper, context, ctrl, escrow := setupMsgServerWithOneGameForPlayMove(t)
    ctx := sdk.UnwrapSDKContext(context)
    defer ctrl.Finish()
    escrow.ExpectAny(context)

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

    bobInfo, found := keeper.GetPlayerInfo(ctx, bob)
    require.True(t, found)
    require.EqualValues(t, types.PlayerInfo{
        Index:          bob,
        WonCount:       2,
        LostCount:      2,
        ForfeitedCount: 3,
    }, bobInfo)
    carolInfo, found := keeper.GetPlayerInfo(ctx, carol)
    require.True(t, found)
    require.EqualValues(t, types.PlayerInfo{
        Index:          carol,
        WonCount:       4,
        LostCount:      6,
        ForfeitedCount: 6,
    }, carolInfo)
}
```

You can add similar tests that confirm that nothing happens after a [game creation](https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/msg_server_create_game_test.go#L414-L493) or a [non-winning move](https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/msg_server_play_move_test.go#L538-L596). You should also check that a [forfeit is registered](https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/end_block_server_game_test.go#L577-L682).

This completes your checkers v1.1 chain. If you were to start it anew as is, it would work. However, you already have the v1 of checkers running, so you need to migrate everything.

## v1 to v1.1 player information migration helper

With your v1.1 blockchain now fully operational on its own, it is time to work on the issue of stored data migration.

### Consensus version

Your checkers module's current consensus version is 2. You are about to migrate its store, so you need to increment the module's consensus version by `1` exactly (to avoid any future surprises). You should make these numbers explicit:

1. Save the v1 consensus version in a new file:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/migration/cv2/types/keys.go#L4]
    const (
        ConsensusVersion = uint64(2)
    )
    ```

2. Similarly, save the new v1.1 consensus version in another new file:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/migration/cv3/types/keys.go#L4]
    const (
        ConsensusVersion = uint64(3)
    )
    ```

3. Inform the module that it is now at the new consensus version:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/module.go#L167]
        import (
            ...
    +      cv3Types "github.com/b9lab/checkers/x/checkers/migrations/cv3/types"
        )

    -  func (AppModule) ConsensusVersion() uint64 { return 2 }
    +  func (AppModule) ConsensusVersion() uint64 { return cv3Types.ConsensusVersion }
    ```

### Problem description

Coming back to the store migration, in other words, you need to tackle the creation of player information. You will build the player information by extracting it from all the existing stored games. In the [map/reduce](https://en.wikipedia.org/wiki/MapReduce) parlance, you will _reduce_ this information from the stored games.

If performance and hardware constraints were not an issue, an easy way to do it would be the following:

1. Call [`keeper.GetAllStoredGame()`](https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/stored_game.go#L50) to get an array with all the games.
2. Keep only the games that have a winner.
3. Then for each game:
    1. Call `keeper.GetPlayerInfo` or, if that is not found, create player info both for the black player and the red player.
    2. Do `+1` on `.WonCount` or `.LostCount` according to the `game.Winner` field. In the current saved state, there is no way to differentiate between a _normal_ win and a win by forfeit.
    3. Call `keeper.SetPlayerInfo` for both black and red players.

Of course, given inevitable resource limitations, you would run into the following problems:

1. Getting all the games in a single array may not be possible, because your node's RAM may not be able to keep a million of them in memory. Or maybe it fails at 100,000 of them.
2. Calling `.GetPlayerInfo` and `.SetPlayerInfo` twice per game just to do `+1` adds up quickly. Remember that both of these calls are database calls. You could be facing a 12-hour job, during which your chain is offline.
3. Doing it all in a sequential manner would take even more time, as each blocking call blocks the whole process.

### Proposed solution

Fortunately, there exist ways to mitigate these limitations:

1. You do not need to get all the games at once. The [`keeper.StoredGameAll`](https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-handling/x/checkers/keeper/grpc_query_stored_game.go#L14) function offers pagination. With this, you can limit the impact on the RAM requirement, at the expense of multiple queries.
2. Within each subset of games, you can compute in memory the player list and how many wins and losses each player has. With this _mapping_ done, you can add the (in-memory) intermediary `WonCount` and `LostCount` sums to each player's stored sums. With this, a `+1` is potentially replaced by a `+k`, at once reducing the number of calls to `.GetPlayerInfo` and `.SetPlayerInfo`.
3. You can separate the different calls and computations into [Go routines](https://gobyexample.com/goroutines) so that a blocking call does not prevent other computations from taking place in the meantime.

The routines will use **channels** to communicate between themselves and the main function:

1. A _stored-game_ channel, that will pass along chunks of games in the `[]types.StoredGame` format.
2. A _player-info_ channel, that will pass along intermediate computations of player information in the simple `types.PlayerInfo` format.
3. A _done_ channel, whose only purpose is to flag to the main function when all has been processed.

Each channel should also be able to pass an optional error, so tuples will be used.

The processing **routines** will be divided as per the following:

1. The **game loading** routine will:

    * Fetch all games in paginated arrays.
    * Send the separate arrays on the _stored-game_ channel.
    * Send an error on the _stored-game_ channel if any is encountered.
    * Close the _stored-game_ channel after the last array, or on an error.

2. The **game processing** routine will:
    
    * Receive separate arrays of games from the _stored-game_ channel.
    * Compute the aggregate player info records from them (i.e. **_map_**).
    * Send the results on the _player-info_ channel.
    * Pass along an error if it receives any.
    * Close the _player-info_ channel after the last stored game, or on an error.

3. The **player info processing** routine will:

    * Receive individual player info records from the _player-info_ channel.
    * Fetch the corresponding player info from the store. If it does not exist yet, it will create an empty new one.
    * Update the won and lost counts (i.e. **_reduce_**). Remember, here it is doing `+= k`, not `+= 1`.
    * Save it back to the store.
    * Pass along an error if it receives any.
    * Close the _done_ channel after the last player info, or on an error.

4. The **main function** will:

    * Create the above 3 channels.
    * Launch the above 3 routines.
    * Wait for the flag on the _done_ channel.
    * Exit, perhaps with an error.

### Implementation

The processing will take your module's store from consensus version 2 to version 3. Therefore it makes sense to add the function in `x/checkers/migrations/cv3/keeper`.

The player info processing will handle an in-memory map of player addresses to their information: `map[string]*types.PlayerInfo`. Create a new file to encapsulate this whole processing. Start by creating a helper that automatically populates it with empty values when information is missing:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/migrations/cv3/keeper/migration_player_info.go#L13-L25]
func getOrNewPlayerInfoInMap(infoSoFar *map[string]*types.PlayerInfo, playerIndex string) (playerInfo *types.PlayerInfo) {
    playerInfo, found := (*infoSoFar)[playerIndex]
    if !found {
        playerInfo = &types.PlayerInfo{
            Index:          playerIndex,
            WonCount:       0,
            LostCount:      0,
            ForfeitedCount: 0,
        }
        (*infoSoFar)[playerIndex] = playerInfo
    }
    return playerInfo
}
```

Now, create the function to load the games:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/migrations/cv3/keeper/migration_player_info.go#L27-L58]
type storedGamesChunk struct {
    StoredGames []types.StoredGame
    Error       error
}

func loadStoredGames(context context.Context,
    k keeper.Keeper,
    gamesChannel chan<- storedGamesChunk,
    chunk uint64) {
    defer func() { close(gamesChannel) }()
    response, err := k.StoredGameAll(context, &types.QueryAllStoredGameRequest{
        Pagination: &query.PageRequest{Limit: chunk},
    })
    if err != nil {
        gamesChannel <- storedGamesChunk{Error: err}
        return
    }
    gamesChannel <- storedGamesChunk{StoredGames: response.StoredGame}
    for response.Pagination.NextKey != nil {
        response, err = k.StoredGameAll(context, &types.QueryAllStoredGameRequest{
            Pagination: &query.PageRequest{
                Key:   response.Pagination.NextKey,
                Limit: chunk,
            },
        })
        if err != nil {
            gamesChannel <- storedGamesChunk{Error: err}
            return
        }
        gamesChannel <- storedGamesChunk{StoredGames: response.StoredGame}
    }
}
```

<HighlightBox type="note">

Note that:

* The helper function passes along the channel a tuple `storedGamesChunk` that may contain an error. This is to obtain a result similar to when a function returns an optional error .
* It uses the paginated query so as to not overwhelm the memory if there are millions of infos.
* It closes the channel upon exit whether there is an error or not via the use of `defer`.
 
</HighlightBox>

Next, create the routine function to process the games:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/migrations/cv3/keeper/migration_player_info.go#L60-L96]
type playerInfoTuple struct {
    PlayerInfo types.PlayerInfo
    Error      error
}

func handleStoredGameChannel(k keeper.Keeper,
    gamesChannel <-chan storedGamesChunk,
    playerInfoChannel chan<- playerInfoTuple) {
    defer func() { close(playerInfoChannel) }()
    for games := range gamesChannel {
        if games.Error != nil {
            playerInfoChannel <- playerInfoTuple{Error: games.Error}
            return
        }
        playerInfos := make(map[string]*types.PlayerInfo, len(games.StoredGames))
        for _, game := range games.StoredGames {
            var winner string
            var loser string
            if game.Winner == rules.PieceStrings[rules.BLACK_PLAYER] {
                winner = game.Black
                loser = game.Red
            } else if game.Winner == rules.PieceStrings[rules.RED_PLAYER] {
                winner = game.Red
                loser = game.Black
            } else {
                continue
            }
            getOrNewPlayerInfoInMap(&playerInfos, winner).WonCount++
            getOrNewPlayerInfoInMap(&playerInfos, loser).LostCount++
        }
        for _, playerInfo := range playerInfos {
            if playerInfo != nil {
                playerInfoChannel <- playerInfoTuple{PlayerInfo: *playerInfo}
            }
        }
    }
}
```

<HighlightBox type="note">

Note that:

* This function can handle the edge case where black and red both refer to the same player.
* It prepares a map with a capacity equal to the number of games. At most the capacity would be double that. This is a value that could be worth investigating for best performance.
* Like the helper function, it passes along a tuple with an optional error.
* It closes the channel it populates upon exit whether there is an error or not via the use of `defer`.

</HighlightBox>

Create the routine function to process the player info:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/migrations/cv3/keeper/migration_player_info.go#L98-L123]
func handlePlayerInfoChannel(ctx sdk.Context, k keeper.Keeper,
    playerInfoChannel <-chan playerInfoTuple,
    done chan<- error) {
    defer func() { close(done) }()
    for receivedInfo := range playerInfoChannel {
        if receivedInfo.Error != nil {
            done <- receivedInfo.Error
            return
        }
        existingInfo, found := k.GetPlayerInfo(ctx, receivedInfo.PlayerInfo.Index)
        if found {
            existingInfo.WonCount += receivedInfo.PlayerInfo.WonCount
            existingInfo.LostCount += receivedInfo.PlayerInfo.LostCount
            existingInfo.ForfeitedCount += receivedInfo.PlayerInfo.ForfeitedCount
        } else {
            existingInfo = receivedInfo.PlayerInfo
        }
        k.SetPlayerInfo(ctx, existingInfo)
    }
    done <- nil
}
```

<HighlightBox type="note">

Note that:

* This function only passes an optional error.
* It closes the channel it populates upon exit whether there is an error or not via the use of `defer`.

</HighlightBox>

Now you can create the main function:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/migrations/cv3/keeper/migration_player_info.go#L72-L106]
func MapStoredGamesReduceToPlayerInfo(ctx sdk.Context, k keeper.Keeper, chunk uint64) error {
    context := sdk.WrapSDKContext(ctx)
    gamesChannel := make(chan storedGamesChunk)
    playerInfoChannel := make(chan playerInfoTuple)
    done := make(chan error)

    go handlePlayerInfoChannel(ctx, k, playerInfoChannel, done)
    go handleStoredGameChannel(k, gamesChannel, playerInfoChannel)
    go loadStoredGames(context, k, gamesChannel, chunk)

    return <-done
}
```

<HighlightBox type="note">

Note that:

* The main function delegates the closing of channels to the routines.
* It starts the routines in the "reverse" order that they are chained, to reduce the likelihood of channel clogging.

</HighlightBox>

Do not forget a suggested chunk size to pass as `chunk uint64` to the main function when fetching stored games:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/migrations/cv3/types/keys.go#L5]
    const (
        ConsensusVersion    = uint64(3)
+      StoredGameChunkSize = 1_000
    )
```

To find the ideal chunk size value, you would have to test with the real state and try different values.

### Unit tests

You have added migration helpers and ought to add some unit tests on them. Similarly to other unit tests, you add a setup function in a new file:

```go
func setupKeeperForV1ToV1_1Migration(t testing.TB) (keeper.Keeper, context.Context) {
    k, ctx := keepertest.CheckersKeeper(t)
    checkers.InitGenesis(ctx, *k, *types.DefaultGenesis())
    return *k, sdk.WrapSDKContext(ctx)
}
```

Add a function that tests simple cases of storage:

```go
func TestBuildPlayerInfosInPlace(t *testing.T) {
    tests := []struct {
        name     string
        games    []types.StoredGame
        expected []types.PlayerInfo
    }{
        // TODO
    }
    for _, tt := range tests {
        for chunk := uint64(1); chunk < 5; chunk++ {
            t.Run(fmt.Sprintf("%s chunk %d", tt.name, chunk), func(t *testing.T) {
                keeper, context := setupKeeperForV1ToV1_1Migration(t)
                ctx := sdk.UnwrapSDKContext(context)

                for _, game := range tt.games {
                    keeper.SetStoredGame(ctx, game)
                }
                cv3Keeper.MapStoredGamesReduceToPlayerInfo(ctx, keeper, chunk)

                playerInfos := keeper.GetAllPlayerInfo(ctx)
                require.Equal(t, len(tt.expected), len(playerInfos))
                require.EqualValues(t, tt.expected, playerInfos)
            })
        }
    }
}
```

Add the simple tests cases, such as:

1. Nothing:
    
    ```go
    {
        name:     "nothing to assemble",
        games:    []types.StoredGame{},
        expected: []types.PlayerInfo(nil),
    },
    ```

2. Single game with a win:

    ```go
    {
        name: "single game with win",
        games: []types.StoredGame{
            {
                Index:  "1",
                Winner: "b",
                Black:  "alice",
                Red:    "bob",
            },
        },
        expected: []types.PlayerInfo{
            {
                Index:     "alice",
                WonCount:  1,
                LostCount: 0,
            },
            {
                Index:     "bob",
                WonCount:  0,
                LostCount: 1,
            },
        },
    },
    ```

And so on.

It can also be interesting to measure the time it takes to compute in the case of a large data set depending on the chunk size:

```go
func TestBuild10kPlayerInfosInPlace(t *testing.T) {
    chunks := []uint64{1, 10, 100, 1_000, 10_000, 100_000, 1_000_000}
    for _, chunk := range chunks {
        keeper, context := setupKeeperForV1ToV1_1Migration(t)
        ctx := sdk.UnwrapSDKContext(context)
        for id := uint64(1); id <= 100_000; id++ {
            keeper.SetStoredGame(ctx, types.StoredGame{
                Index:  strconv.FormatUint(id, 10),
                Black:  "alice",
                Red:    "bob",
                Winner: "b",
            })
        }
        before := time.Now()
        cv3Keeper.MapStoredGamesReduceToPlayerInfo(ctx, keeper, chunk)
        after := time.Now()
        playerInfos := keeper.GetAllPlayerInfo(ctx)
        require.Equal(t, 2, len(playerInfos))
        require.EqualValues(t, []types.PlayerInfo{
            {
                Index:    "alice",
                WonCount: 100_000,
            },
            {
                Index:     "bob",
                LostCount: 100_000,
            },
        }, playerInfos)
        t.Logf("Chunk %d, duration %d millisec", chunk, after.Sub(before).Milliseconds())
    }
}
```

You can run the tests with the verbose `-v` flag to get the log:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ go test -v github.com/alice/checkers/x/checkers/migrations/cv3/keeper
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    go test -v github.com/alice/checkers/x/checkers/migrations/cv3/keeper
```

</CodeGroupItem>

</CodeGroup>

Among the verbose test results, you can find something like:

```txt
=== RUN   TestBuild10kPlayerInfosInPlace
    migration_player_info_test.go:153: Chunk 1, duration 2225 millisec
    migration_player_info_test.go:153: Chunk 10, duration 317 millisec
    migration_player_info_test.go:153: Chunk 100, duration 120 millisec
    migration_player_info_test.go:153: Chunk 1000, duration 103 millisec
    migration_player_info_test.go:153: Chunk 10000, duration 123 millisec
    migration_player_info_test.go:153: Chunk 100000, duration 172 millisec
    migration_player_info_test.go:153: Chunk 1000000, duration 158 millisec
--- PASS: TestBuild10kPlayerInfosInPlace (6.26s)
```

## v1 to v1.1 migration proper

The migration proper needs to execute the previous main function. You can encapsulate this knowledge in a function, which also makes more visible what is expected to take place:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/migrations/cv3/migration.go]
package cv3

import (
    "github.com/b9lab/checkers/x/checkers/keeper"
    cv3Keeper "github.com/b9lab/checkers/x/checkers/migrations/cv3/keeper"
    sdk "github.com/cosmos/cosmos-sdk/types"
)

func PerformMigration(ctx sdk.Context, k keeper.Keeper, storedGameChunk uint64) error {
    ctx.Logger().Info("Start to compute checkers games to player info calculation...")
    err := cv3Keeper.MapStoredGamesReduceToPlayerInfo(ctx, k, storedGameChunk)
    if err != nil {
        ctx.Logger().Error("Checkers games to player info computation ended with error")
    } else {
        ctx.Logger().Info("Checkers games to player info computation done")
    }
    return err
}
```

<HighlightBox type="note">

This does not panic in case of an error. To avoid carrying on a faulty state, the caller of this function will have to handle the panic.

</HighlightBox>

You have in place the functions that will handle the store migration. Now you have to set up the chain of command for these functions to be called by the node at the right point in time.

### Consensus version and name

The `upgrade` module keeps in its store the [different module versions](https://docs.cosmos.network/v0.45/core/upgrade.html) that are currently running. To signal an upgrade, your module needs to return a different value when queried by the `upgrade` module. You have already prepared this change from `2` to `3`.

<HighlightBox type="remember">

The consensus version number bears no resemblance to v1 or v1.1. The consensus version number is for the module, whereas v1 or v1.1 is for the whole application.

</HighlightBox>

You also have to pick a name for the upgrade you have prepared. This name will identify your specific upgrade when it is mentioned in a `Plan` (i.e. an upgrade governance proposal). This is a name relevant at the application level. Keep this information in a sub-folder of `app`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/app/upgrades/v1tov1_1/keys.go#L4]
const (
    UpgradeName = "v1tov1_1"
)
```

`"v1tov1.1"` would have been more elegant, but dots cause problems in governance proposal names.

You have to inform your app about:

1. The mapping between the consensus version(s) and the migration process(es).
2. The mapping between this name and the module(s) consensus version(s).

Prepare these in turn.

### Callback in checkers module

Indicate that the checkers module needs to perform some upgrade steps when it is coming out of the old consensus version by calling `RegisterMigration`:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/x/checkers/module.go#L146-L150]
    import (
        ...
+      cv2types "github.com/b9lab/checkers/x/checkers/migrations/cv2/types"
+      cv3 "github.com/b9lab/checkers/x/checkers/migrations/cv3"
        cv3types "github.com/b9lab/checkers/x/checkers/migrations/cv3/types"
        ...
    )

    func (am AppModule) RegisterServices(cfg module.Configurator) {
        types.RegisterQueryServer(cfg.QueryServer(), am.keeper)

+      if err := cfg.RegisterMigration(types.ModuleName, cv2types.ConsensusVersion, func(ctx sdk.Context) error {
+          return cv3.PerformMigration(ctx, am.keeper, cv3types.StoredGameChunkSize)
+      }); err != nil {
+          panic(fmt.Errorf("failed to register cv2 player info migration of %s: %w", types.ModuleName, err))
+      }
    }
```

Note that:

* It decides on the chunk sizes to use at this point.
* It moves the consensus version up one version, from `2` to `3`.

### Callback in `app`

The function that you are going to write needs a `Configurator`. This is already created as part of your `app` preparation, but it is not kept. Instead of recreating one, adjust your code to make it easily available. Add this field to your `app`:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/app/app.go#L238]
    type App struct {
        ...
        sm *module.SimulationManager
+      configurator module.Configurator
    }
```

Now adjust the place where the configurator is created:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/app/app.go#L532-L533]
-  app.mm.RegisterServices(module.NewConfigurator(app.appCodec, app.MsgServiceRouter(), app.GRPCQueryRouter()))
+  app.configurator = module.NewConfigurator(app.appCodec, app.MsgServiceRouter(), app.GRPCQueryRouter())
+  app.mm.RegisterServices(app.configurator)
```

Create a function that encapsulates knowledge about all possible upgrades, although there is a single one here. Since it includes _empty code_ for future use, avoid cluttering the already long `NewApp` function:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/app/app.go#L752-L783]
import (
    "github.com/b9lab/checkers/app/upgrades/v1tov1_1"
    storetypes "github.com/cosmos/cosmos-sdk/store/types"
)

func (app *App) setupUpgradeHandlers() {
    // v1 to v1.1 upgrade handler
    app.UpgradeKeeper.SetUpgradeHandler(
        v1tov1_1.UpgradeName,
        func(ctx sdk.Context, plan upgradetypes.Plan, vm module.VersionMap) (module.VersionMap, error) {
            return app.mm.RunMigrations(ctx, app.configurator, vm)
        },
    )

    // When a planned update height is reached, the old binary will panic
    // writing on disk the height and name of the update that triggered it
    // This will read that value, and execute the preparations for the upgrade.
    upgradeInfo, err := app.UpgradeKeeper.ReadUpgradeInfoFromDisk()
    if err != nil {
        panic(fmt.Errorf("failed to read upgrade info from disk: %w", err))
    }

    if app.UpgradeKeeper.IsSkipHeight(upgradeInfo.Height) {
        return
    }

    var storeUpgrades *storetypes.StoreUpgrades

    switch upgradeInfo.Name {
    case v1tov1_1.UpgradeName:
    }

    if storeUpgrades != nil {
        // configure store loader that checks if version == upgradeHeight and applies store upgrades
        app.SetStoreLoader(upgradetypes.UpgradeStoreLoader(upgradeInfo.Height, storeUpgrades))
    }
}
```

Now you are ready to inform the app proper. You do this towards the end, after the call to `app.SetEndBlocker` and before `if loadLatest`. At the correct location:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/app/app.go#L581]
    ...
    app.SetEndBlocker(app.EndBlocker)

+  app.setupUpgradeHandlers()

    if loadLatest {
        ...
    }
```

<HighlightBox type="tip">

Be aware that the `monitoring` module added by Ignite causes difficulty when experimenting below with the CLI. To keep things simple, remove [all references to `monitoring`](https://github.com/cosmos/b9-checkers-academy-draft/compare/player-info-handling..player-info-migration#diff-0f1d2976054440336a576d47a44a37b80cdf6701dd9113012bce0e3c425819b7L159) from `app.go`.

</HighlightBox>

When done right, adding the callbacks is a short and easy solution.

### Integration tests

With changes made in `app.go`, unit tests are inadequate – you have to test with integration tests. Take inspiration from the upgrade keeper's [own integration tests](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/upgrade/keeper/keeper_test.go#L215-L233).

In a new folder dedicated to your migration integration tests, copy the test suite and its setup function, which you created earlier for integration tests, minus the unnecessary `checkersModuleAddress` line:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/tests/integration/checkers/migrations/cv3/upgrade_integration_suite_test.go]
type IntegrationTestSuite struct {
	suite.Suite

	app         *checkersapp.App
	msgServer   types.MsgServer
	ctx         sdk.Context
	queryClient types.QueryClient
}

func TestUpgradeTestSuite(t *testing.T) {
	suite.Run(t, new(IntegrationTestSuite))
}

func (suite *IntegrationTestSuite) SetupTest() {
	app := checkersapp.Setup(false)
	ctx := app.BaseApp.NewContext(false, tmproto.Header{Time: time.Now()})

	app.AccountKeeper.SetParams(ctx, authtypes.DefaultParams())
	app.BankKeeper.SetParams(ctx, banktypes.DefaultParams())

	queryHelper := baseapp.NewQueryServerTestHelper(ctx, app.InterfaceRegistry())
	types.RegisterQueryServer(queryHelper, app.CheckersKeeper)
	queryClient := types.NewQueryClient(queryHelper)

	suite.app = app
	suite.msgServer = keeper.NewMsgServerImpl(app.CheckersKeeper)
	suite.ctx = ctx
	suite.queryClient = queryClient
}
```

It is necessary to redeclare, as you cannot import test elements across package boundaries.

The code that runs for these tests is always at consensus version 3. After all, you cannot wish away the player info code during the tests setup. However, you can make the `upgrade` module believe that it is still at the old state. Add this step into the suite's setup:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/tests/integration/checkers/migrations/cv3/upgrade_integration_suite_test.go#L39-L40]
    app.BankKeeper.SetParams(ctx, banktypes.DefaultParams())
+  initialVM := module.VersionMap{types.ModuleName: cv2types.ConsensusVersion}
+  app.UpgradeKeeper.SetModuleVersionMap(ctx, initialVM)
```

Now you can add a test in another file. It verifies that the consensus version increases as saved in the upgrade keeper, when calling an upgrade with the right name.

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/tests/integration/checkers/migrations/cv3/upgrade_test.go#L19-L32]
func (suite *IntegrationTestSuite) TestUpgradeConsensusVersion() {
    vmBefore := suite.app.UpgradeKeeper.GetModuleVersionMap(suite.ctx)
    suite.Require().Equal(cv2types.ConsensusVersion, vmBefore[types.ModuleName])

    v1Tov1_1Plan := upgradetypes.Plan{
        Name:   v1tov1_1.UpgradeName,
        Info:   "some text here",
        Height: 123450000,
    }
    suite.app.UpgradeKeeper.ApplyUpgrade(suite.ctx, v1Tov1_1Plan)

    vmAfter := suite.app.UpgradeKeeper.GetModuleVersionMap(suite.ctx)
    suite.Require().Equal(cv3types.ConsensusVersion, vmAfter[types.ModuleName])
}
```

You can also confirm that it panics if you pass it a wrong upgrade name:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/tests/integration/checkers/migrations/cv3/upgrade_test.go#L34-L52]
func (suite *IntegrationTestSuite) TestNotUpgradeConsensusVersion() {
    vmBefore := suite.app.UpgradeKeeper.GetModuleVersionMap(suite.ctx)
    suite.Require().Equal(cv2types.ConsensusVersion, vmBefore[types.ModuleName])

    dummyPlan := upgradetypes.Plan{
        Name:   v1tov1_1.UpgradeName + "no",
        Info:   "some text here",
        Height: 123450000,
    }
    defer func() {
        r := recover()
        suite.Require().NotNil(r, "The code did not panic")
        suite.Require().Equal(r, "ApplyUpgrade should never be called without first checking HasHandler")

        vmAfter := suite.app.UpgradeKeeper.GetModuleVersionMap(suite.ctx)
        suite.Require().Equal(cv2types.ConsensusVersion, vmAfter[types.ModuleName])
    }()
    suite.app.UpgradeKeeper.ApplyUpgrade(suite.ctx, dummyPlan)
}
```

After that, you can check that the player infos are tallied as expected by adding in storage three completed games and one still in-play, and then triggering the upgrade:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/player-info-migration/tests/integration/checkers/migrations/cv3/upgrade_test.go#L54-L111]
func (suite *IntegrationTestSuite) TestUpgradeTallyPlayerInfo() {
    suite.app.CheckersKeeper.SetStoredGame(suite.ctx, types.StoredGame{
        Index:  "1",
        Black:  alice,
        Red:    bob,
        Winner: rules.PieceStrings[rules.BLACK_PLAYER],
    })
    suite.app.CheckersKeeper.SetStoredGame(suite.ctx, types.StoredGame{
        Index:  "2",
        Black:  alice,
        Red:    carol,
        Winner: rules.PieceStrings[rules.RED_PLAYER],
    })
    suite.app.CheckersKeeper.SetStoredGame(suite.ctx, types.StoredGame{
        Index:  "3",
        Black:  alice,
        Red:    carol,
        Winner: rules.PieceStrings[rules.BLACK_PLAYER],
    })
    suite.app.CheckersKeeper.SetStoredGame(suite.ctx, types.StoredGame{
        Index:  "4",
        Black:  alice,
        Red:    bob,
        Winner: rules.PieceStrings[rules.NO_PLAYER],
    })
    suite.Require().EqualValues([]types.PlayerInfo(nil), suite.app.CheckersKeeper.GetAllPlayerInfo(suite.ctx))

    v1Tov1_1Plan := upgradetypes.Plan{
        Name:   v1tov1_1.UpgradeName,
        Info:   "some text here",
        Height: 123450000,
    }
    suite.app.UpgradeKeeper.ApplyUpgrade(suite.ctx, v1Tov1_1Plan)

    expectedInfos := map[string]types.PlayerInfo{
        alice: {
            Index:     alice,
            LostCount: 1,
            WonCount:  2,
        },
        bob: {
            Index:     bob,
            LostCount: 1,
        },
        carol: {
            Index:     carol,
            LostCount: 1,
            WonCount:  1,
        },
    }

    for who, expectedInfo := range expectedInfos {
        storedInfo, found := suite.app.CheckersKeeper.GetPlayerInfo(suite.ctx, who)
        suite.Require().True(found)
        suite.Require().Equal(expectedInfo, storedInfo)
    }
}
```

To run the tests, put the right package path:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ go test github.com/alice/checkers/tests/integration/checkers/migrations/cv3
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    go test github.com/alice/checkers/tests/integration/checkers/migrations/cv3
```

</CodeGroupItem>

</CodeGroup>

The tests confirm that you got it right.

## Interact via the CLI

You can already execute a live upgrade from the command line. The following upgrade process takes inspiration from [this one](https://hub.cosmos.network/main/hub-tutorials/live-upgrade-tutorial.html) based on Gaia. You will:

* Check out the checkers v1 code.
* Build the v1 checkers executable.
* Initialize a local blockchain and network.
* Run v1 checkers.
* Add one or more incomplete games.
* Add one or more complete games with the help of a CosmJS integration test.
* Create a governance proposal to upgrade with the right plan name at an appropriate block height.
* Make the proposal pass.
* Wait for v1 checkers to halt on its own at the upgrade height.
* Check out the checkers v1.1 code.
* Build the v1.1 checkers executable.
* Run v1.1 checkers.
* Confirm that you now have a correct tally of player info.

Start your engines!

### Launch v1

After committing your changes, in a shell checkout v1 of checkers with the content of the _run in production_ work:

```sh
$ git checkout run-prod
$ git submodule update --init
```

Build the v1 executable for your platform:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go build -o release/v1/checkersd cmd/checkersd/main.go
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    go build -o release/v1/checkersd cmd/checkersd/main.go
```

</CodeGroupItem>

</CodeGroup>

With the `release/v1/checkersd` executable ready, you can initialize the network.

<HighlightBox type="warn">

Because this is an exercise, to avoid messing with your keyring you must always specify `--keyring-backend test`.

</HighlightBox>

Add two players:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd keys add alice --keyring-backend test
$ ./release/v1/checkersd keys add bob --keyring-backend test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker network create checkers-net
$ docker create -it \
    -v $(pwd):/checkers -w /checkers \
    -p 26657:26657 \
    --network checkers-net \
    --name checkers \
    checkers_i
$ docker start checkers
$ docker exec -t checkers \
    ./release/v1/checkersd keys add alice --keyring-backend test
$ docker exec -t checkers \
    ./release/v1/checkersd keys add bob --keyring-backend test
```

<HighlightBox type="note">

You should **not** use `docker run --rm` here because, when `checkersd` stops, you do not want to remove the container and thereby destroy the saved keys, and the future genesis too. Instead, reuse them all in the next calls.

</HighlightBox>

</CodeGroupItem>

</CodeGroup>

Create a new genesis:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd init checkers-1 --chain-id checkers-1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1/checkersd init checkers-1 --chain-id checkers-1
```

</CodeGroupItem>

</CodeGroup>

Give your players the same token amounts that were added by Ignite, as found in `config.yml`:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd add-genesis-account \
    alice 200000000stake,20000token --keyring-backend test
$ ./release/v1/checkersd add-genesis-account \
    bob 100000000stake,10000token --keyring-backend test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1/checkersd add-genesis-account \
    alice 200000000stake,20000token --keyring-backend test
$ docker exec -t checkers \
    ./release/v1/checkersd add-genesis-account \
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

That is two days, which is too long to wait for CLI tests. Choose another value, perhaps 10 minutes, i.e. `"600s"`. Update it in place in the genesis:

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

<CodeGroupItem title="By hand">

```diff-json
    ...
-  "voting_period": "172800s"
+  "voting_period": "600s"
    ...
```

</CodeGroupItem>

</CodeGroup>

You can confirm that the value is in using the earlier command.

Make Alice the chain's validator too by creating a genesis transaction modeled on that done by Ignite, as found in `config.yml`:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd gentx alice 100000000stake \
    --keyring-backend test --chain-id checkers-1
$ ./release/v1/checkersd collect-gentxs
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1/checkersd gentx alice 100000000stake \
    --keyring-backend test --chain-id checkers-1
$ docker exec -t checkers \
    ./release/v1/checkersd collect-gentxs
```

</CodeGroupItem>

</CodeGroup>

Now you can start the chain proper:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd start
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    ./release/v1/checkersd start \
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
$ export alice=$(./release/v1/checkersd keys show alice -a --keyring-backend test)
$ export bob=$(./release/v1/checkersd keys show bob -a --keyring-backend test)
$ ./release/v1/checkersd tx checkers create-game \
    $alice $bob 10 stake \
    --from $alice --keyring-backend test --yes \
    --chain-id checkers-1 \
    --broadcast-mode block
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ export alice=$(docker exec checkers ./release/v1/checkersd keys show alice -a --keyring-backend test)
$ export bob=$(docker exec checkers ./release/v1/checkersd keys show bob -a --keyring-backend test)
$ docker exec -t checkers \
    ./release/v1/checkersd tx checkers create-game \
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

To get a few complete games, you are going to run the [integration tests](https://github.com/cosmos/academy-checkers-ui/blob/main/test/integration/stored-game-action.ts) against it. These tests expect a faucet to be available. Because that is not the case, you need to:

1. Skip the faucet calls by adjusting the `"credit test accounts"` `before`. Just `return` before [`this.timeout`](https://github.com/cosmos/academy-checkers-ui/blob/server-indexing/test/integration/stored-game-action.ts#L65).

2. Credit your test accounts with standard `bank send` transactions. You can use the same values as found in the `before`:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ ./release/v1/checkersd tx bank \
        send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 300stake \
        --from $alice --keyring-backend test \
        --chain-id checkers-1 \
        --broadcast-mode block --yes
    $ ./release/v1/checkersd tx bank \
        send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 10token \
        --from $alice --keyring-backend test \
        --chain-id checkers-1 \
        --broadcast-mode block --yes
    $ ./release/v1/checkersd tx bank \
        send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 300stake \
        --from $bob --keyring-backend test \
        --chain-id checkers-1 \
        --broadcast-mode block --yes
    $ ./release/v1/checkersd tx bank \
        send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 10token \
        --from $bob --keyring-backend test \
        --chain-id checkers-1 \
        --broadcast-mode block --yes
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker exec -t checkers \
        ./release/v1/checkersd tx bank \
        send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 300stake \
        --from $alice --keyring-backend test \
        --chain-id checkers-1 \
        --broadcast-mode block --yes
    $ docker exec -t checkers \
        ./release/v1/checkersd tx bank \
        send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 10token \
        --from $alice --keyring-backend test \
        --chain-id checkers-1 \
        --broadcast-mode block --yes
    $ docker exec -t checkers \
        ./release/v1/checkersd tx bank \
        send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 300stake \
        --from $bob --keyring-backend test \
        --chain-id checkers-1 \
        --broadcast-mode block --yes
    $ docker exec -t checkers \
        ./release/v1/checkersd tx bank \
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
    -v $(pwd)/client:/client -w /client \
    --network checkers-net \
    --env RPC_URL="http://checkers:26657" \
    node:18.7-slim \
    npm test
```

</CodeGroupItem>

</CodeGroup>

---

You can confirm that you have a mix of complete and incomplete games:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd query checkers \
    list-stored-game --output json \
    | jq '.storedGame[] | { "index":.index, "winner":.winner }'
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    bash -c "./release/v1/checkersd query checkers \
        list-stored-game --output json \
        | jq '.storedGame[] | { \"index\":.index, \"winner\":.winner }'"
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
$ ./release/v1/checkersd status \
    | jq -r ".SyncInfo.latest_block_height"
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    bash -c './release/v1/checkersd status \
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

Submit your governance proposal upgrade:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd tx gov submit-proposal software-upgrade v1tov1_1 \
    --title "v1tov1_1" \
    --description "Introduce a tally of games per player" \
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
    ./release/v1/checkersd tx gov submit-proposal software-upgrade v1tov1_1 \
    --title "v1tov1_1" \
    --description "Introduce a tally of games per player" \
    --from $alice --keyring-backend test --yes \
    --chain-id checkers-1 \
    --broadcast-mode block \
    --upgrade-height 1180 \
    --deposit 10000000stake
```

</CodeGroupItem>

</CodeGroup>

This returns something with:

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
$ ./release/v1/checkersd tx gov vote 1 yes \
    --from $alice --keyring-backend test --yes \
    --chain-id checkers-1
$ ./release/v1/checkersd tx gov vote 1 yes \
    --from $bob --keyring-backend test --yes \
    --chain-id checkers-1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1/checkersd tx gov vote 1 yes \
    --from $alice --keyring-backend test --yes \
    --chain-id checkers-1
$ docker exec -t checkers \
    ./release/v1/checkersd tx gov vote 1 yes \
    --from $bob --keyring-backend test --yes \
    --chain-id checkers-1
```

</CodeGroupItem>

</CodeGroup>

Confirm that it has collected the votes:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd query gov votes 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1/checkersd query gov votes 1
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
$ ./release/v1/checkersd query gov proposal 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1/checkersd query gov proposal 1
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

Now, wait for the chain to reach the desired block height, which should take five more minutes, as per your parameters. When it has reached that height, the shell with the running `checkersd` should show something like:

```txt
...
6:29PM INF finalizing commit of block hash=E6CB6F1E8CF4699543950F756F3E15AE447701ABAC498CDBA86633AC93A73EE7 height=1180 module=consensus num_txs=0 root=21E51E52AA3F06BE59C78CE11D3171E6F7240D297E4BCEAB07FC5A87957B3BE2
6:29PM ERR UPGRADE "v1tov1_1" NEEDED at height: 1180: 
6:29PM ERR CONSENSUS FAILURE!!! err="UPGRADE \"v1tov1_1\" NEEDED at height: 1180: " module=consensus stack="goroutine 62 [running]:\nruntime/debug.Stack
...
6:29PM INF Stopping baseWAL service impl={"Logger":{}} module=consensus wal=/root/.checkers/data/cs.wal/wal
6:29PM INF Stopping Group service impl={"Dir":"/root/.checkers/data/cs.wal","Head":{"ID":"ZsAlN7DEZAbV:/root/.checkers/data/cs.wal/wal","Path":"/root/.checkers/data/cs.wal/wal"},"ID":"group:ZsAlN7DEZAbV:/root/.checkers/data/cs.wal/wal","Logger":{}} module=consensus wal=/root/.checkers/data/cs.wal/wal
...
```

At this point, run in another shell:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd status \
    | jq -r ".SyncInfo.latest_block_height"
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    bash -c './release/v1/checkersd status \
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
{"name":"v1tov1_1","height":1180}
```

With your node (and therefore your whole blockchain) down, you are ready to move to v1.1.

### Launch v1.1

With v1 stopped and its state saved, it is time to move to v1.1. Checkout v1.1 of checkers, for instance:

```sh
$ git checkout player-info-migration
```

Back in the first shell, build the v1.1 executable:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go build -o ./release/v1_1/checkersd ./cmd/checkersd/main.go
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    go build -o ./release/v1_1/checkersd ./cmd/checkersd/main.go
```

</CodeGroupItem>

</CodeGroup>

Launch it:

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

</CodeGroupItem>

</CodeGroup>

It should start and display something like:

```txt
...
7:06PM INF applying upgrade "v1tov1_1" at height: 1180
7:06PM INF migrating module checkers from version 2 to version 3
7:06PM INF Start to compute checkers games to player info calculation...
7:06PM INF Checkers games to player info computation done
...
```

After it has started, you can confirm in another shell that you have the expected player info with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1_1/checkersd query checkers list-player-info
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -t checkers \
    ./release/v1_1/checkersd query checkers list-player-info
```

</CodeGroupItem>

</CodeGroup>

This should print something like:

```yaml
playerInfo:
- forfeitedCount: "0"
  index: cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql
  lostCount: "0"
  wonCount: "3"
- forfeitedCount: "0"
  index: cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22
  lostCount: "3"
  wonCount: "0"
```

Congratulations, you have upgraded your blockchain almost as if in production!

You can stop Ignite CLI. If you used Docker that would be:

```sh
$ docker stop checkers
$ docker rm checkers
$ docker network rm checkers-net
```

Your checkers blockchain is almost done! It now needs a leaderboard, which is introduced in the next section.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to add a new data structure in storage as a breaking change.
* How to upgrade a blockchain in production, by migrating from v1 of the blockchain to v1.1, and the new data structures that will be introduced by the upgrade.
* How to handle the data migrations and logic upgrades implicit during migration, such as with the use of private helper functions.
* Worthwhile unit tests with regard to player info handling.
* Integration tests to further confirm the validity of the upgrade.
* A complete procedure for how to conduct the update via the CLI.

</HighlightBox>

<!--

## Next up

It is time to move away from the checkers blockchain learning exercise, and explore another helpful tool for working with the Cosmos SDK: CosmWasm.

-->
