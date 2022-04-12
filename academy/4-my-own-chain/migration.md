---
title: Migration - Introduce a Leaderboard After Production
order: 19
description: Introducing a leaderboard to your in-production blockchain
tag: deep-dive
---

# Migration - Introduce a Leaderboard After Production

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [Protobuf](../2-main-concepts/protobuf.md), and [migrations](../2-main-concepts/migrations.md).
* Have Go installed.
* The checkers blockchain codebase up to the wager denomination. You can get there by following the [previous steps](./wager-denom.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/wager-denomination).

</HighlightBox>

If you have been running _v1_ of your checkers blockchain for a while, games have been created, played on, won, and lost. In this section you will introduce _v2_ of your blockchain with leaderboard support. A good leaderboard fulfills these conditions:

* Any player who has **ever** played should have a tally of games won, lost, and forfeited.
* The leaderboard should list the players with the most wins up to a pre-determined number. For example, the leaderboard could only include the top 100 scores.
* To avoid squatting and increase engagement, when equal in value, the most recent score takes precedence over an _older_ one so the player with the recent score is listed.

When you introduce the leaderboard, you also have to decide what to do with your existing players and their scores from your v1 checkers blockchain.

Start your v2's leaderboard as if all played past games had been counted for the leaderboard. You _only_ need to go through all played games, update the players with their tallies, and add a leaderboard including the information. This is possible because all past games and their outcomes are kept in the chain's state. A migration is a good method to tackle the initial leaderboard.

## Introducing a leaderboard

Several things need to be addressed before you can focus all your attention on the migration:

1. Save and mark as v1 the current data types about to be modified with the new version. All data types, which will remain unmodified, need not be identified as such.
2. Prepare your v2 blockchain by:
    1. Defining your new data types.
    2. Adding helper functions to encapsulate clearly defined actions, like leaderboard sorting.
    2. Adjust the existing code to make use of and update the new data types.
3. Prepare your v1 to v2 migration by:
    1. Adding helper functions to take large amounts of data from the latest chain state under the shape of a v1 genesis.
    2. Adding a function to migrate from v1 to v2 genesis.
    3. Making sure you can handle large amounts of data.

_Why do you need to make sure you can handle large amounts of data?_ The full state at the point of migration will be passed in the form of a gigantic v1 genesis when your migration function is called. You don't want your process to grind to a halt because of a lack of memory.

## Save your v1

Your migration steps will be handled in a new folder, `x/checkers/migrations/v1tov2`, that needs to be created:

```sh
$ mkdir -p x/checkers/migrations/v1tov2
```

As for the **data structure**, the only one you will eventually change is the genesis structure. The other data structures are brand new so you can treat them _as usual_. Copy and paste your v1 genesis from the current commit and save it under another name in `v1tov2/types.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/types.go#L7-L10]
type GenesisStateV1 struct {
    StoredGameList []*types.StoredGame `protobuf:"bytes,2,rep,name=storedGameList,proto3" json:"storedGameList,omitempty"`
    NextGame       *types.NextGame     `protobuf:"bytes,1,opt,name=nextGame,proto3" json:"nextGame,omitempty"`
}
```

Your current genesis definition becomes your v2 genesis. This should be all when it comes to data structures requiring a change. Unless you happened to also change the structure of `StoredGame` for instance, then you would have to save its v1 version in the same `types.go` file.

## New v2 information

It is time to take a closer look at the new data structures being introduced with the version upgrade.

<HighlightBox type="tip">

If you are feeling unsure about creating new data structures with Ignite CLI, take another look at the [previous sections](./create-message.md) of the exercise.

</HighlightBox>

To give the new v2 information a data structure you need:

1. A set of **stats per player**: it makes sense to save one `struct` for each player and map it by address. Remember that a game is stored at `StoredGame-value-123`, where `StoredGame-value-` is a constant prefix. In a similar fashion, Ignite CLI is going to create a new constant to use as the prefix for players:

    ```sh
    $ ignite scaffold map playerInfo wonCount:uint lostCount:uint forfeitedCount:uint --module checkers --no-message
    ```

    <HighlightBox type="info">

    The new `PlayerInfo-value-` prefix for players helps differentiate between the value for players and the one for games prefixed with `StoredGame-value-`. This way you can safely have both `StoredGame-value-123` and `PlayerInfo-value-123` side by side in storage.

    </HighlightBox>

    This creates a Protobuf file:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/player_info.proto#L8-L13]
    message PlayerInfo {
        string index = 1;
        uint64 wonCount = 2;
        uint64 lostCount = 3;
        uint64 forfeitedCount = 4;
    }
    ```

    From which you remove `creator` because it serves no purposes. Do not forget to add the new object to the genesis, effectively your v2 genesis:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/genesis.proto#L16]
    import "checkers/player_info.proto";

    message GenesisState {
        ...
        repeated PlayerInfo playerInfoList = 3;
    }
    ```

2. A **leaderboard rung structure** to be repeated inside the leaderboard: it stores the information of a player scoring high enough to be included in the leaderboard. It is not meant to be kept directly in storage as it is only a part of the leaderboard. So instead of involving Ignite CLI create the structure by hand into its own file:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/winning_player.proto#L8-L12]
    message WinningPlayer {
        string playerAddress = 1;
        uint64 wonCount = 2;
        string dateAdded = 3;
    }
    ```

    Where:

    * `playerAddress` indicates the player, so to say gives information regarding `PlayerInfo.index`.
    * `wonCount` determines the ranking on the leaderboard - the higher the count, the closer to the `0` index in the array. Of course, it should exactly match the value found in the corresponding player stats. This duplication of data is a lesser evil because, if `wonCount` was missing, you would have to access the player stats to sort the leaderboard.
    * `dateAdded` indicates when the player's `wonCount` was last updated and determines the ranking when there is a tie in `wonCount` - the more recent, the closer to the `0` slot in the array.

3. A structure for **the leaderboard**: there is a single stored leaderboard for the whole application. Let Ignite CLI help you implement a structure:

    ```sh
    $ ignite scaffold single leaderboard winners --module checkers --no-message
    ```

    Which creates a Protobuf file that you update with your preferred type and its `import`. Also, remove the `creator`:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/leaderboard.proto#L9-L11]
    import "checkers/winning_player.proto";

    message Leaderboard {
        repeated WinningPlayer winners = 1;
    }
    ```

    And update the v2 genesis file by adding the leaderboard:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/genesis.proto#L15]
    import "checkers/leaderboard.proto";

    message GenesisState {
        ...
        Leaderboard leaderboard = 4;
    }
    ```

    Don't forget to make sure the initial value stored for the leaderboard is not `nil` but instead an empty one. In `genesis.go` adjust:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/genesis.go#L16-L18]
    func DefaultGenesis() *GenesisState {
        return &GenesisState{
            ...
            Leaderboard: &Leaderboard{
                Winners: []*WinningPlayer{},
            },
        }
    }
    ```

    This function returns a default genesis. This step is important if you start fresh. In your case, you do not begin with an "empty" genesis but with one resulting from the upcoming genesis migration in this exercise.

With the structure set up it is time to add the code using these new elements in normal operations.

## v2 player information helpers

You need to do a `+1` on one of the `count`s when a game reaches its resolution.

<ExpansionPanel title="A detailed look into the code">

Start by adding a helper private function that gets the stats from the storage, updates the numbers as instructed, and saves it back:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/keeper/player_info_handler.go#L11-L33]
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

Which you can easily call from these public one-liner functions added to the keeper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/keeper/player_info_handler.go#L35-L45]
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

Which player should get `+1` on what count? You need to identify the loser and the winner of a game to determine this. Create this other private helper for this:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/keeper/player_info_handler.go#L47-L69]
func getWinnerAndLoserAddresses(storedGame *types.StoredGame) (winnerAddress sdk.AccAddress, loserAddress sdk.AccAddress) {
    if storedGame.Winner == rules.NO_PLAYER.Color {
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
    if storedGame.Winner == rules.RED_PLAYER.Color {
        winnerAddress = redAddress
        loserAddress = blackAddress
    } else if storedGame.Winner == rules.BLACK_PLAYER.Color {
        winnerAddress = blackAddress
        loserAddress = redAddress
    } else {
        panic(fmt.Sprintf(types.ErrWinnerNotParseable.Error(), storedGame.Winner))
    }
    return winnerAddress, loserAddress
}
```

Which you can call from these public helper functions added to the keeper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/keeper/player_info_handler.go#L71-L81]
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

Note the two new error types [`ErrThereIsNoWinner`](https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/errors.go#L31) and [`ErrWinnerNotParseable`](https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/errors.go#L30).

</ExpansionPanel>

## v2 player information handling

Now call your helper functions:

1. On a win:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b7001370e1cdfe9fc7c40e7144122cf1d18c6ee8/x/checkers/keeper/msg_server_play_move.go#L82]
    ...
    if storedGame.Winner == rules.NO_PLAYER.Color {
        ...
    } else {
        ...
        k.Keeper.MustPayWinnings(ctx, &storedGame)
        k.Keeper.MustRegisterPlayerWin(ctx, &storedGame)
    }
    ...
    ```

2. And on a forfeit:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b7001370e1cdfe9fc7c40e7144122cf1d18c6ee8/x/checkers/keeper/end_block_server_game.go#L58]
    ...
    if storedGame.MoveCount <= 1 {
        ...
    } else {
        k.MustPayWinnings(ctx, &storedGame)
        k.MustRegisterPlayerForfeit(ctx, &storedGame)
    }
    ...
    ```

## v2 leaderboard helpers

Continue completing your v2 before tackling the migration. Your leaderboard helpers should:

1. Add a new candidate to your array.
2. Sort the array according to the rules.
3. Clip the array to a length of 100 and save the result.

The sorting entails comparing dates in cases of a score tie. This is potentially expensive if you are deserializing the date in the comparator itself. Instead, the comparator should be presented with data already deserialized. Prepare a data structure that has already deserialized the `dateAdded` for you to:

1. Deserialize all the elements of the whole leaderboard's array.
2. Sort it.
3. And only then reserialize its elements.

You do not need to use this deserialized element type anywhere else. Therefore you should keep it private. Create a brand new file `full_leaderboard.go` to encapsulate all your leaderboard helpers:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/full_leaderboard.go#L11-L15]
type winningPlayerParsed struct {
    PlayerAddress string
    WonCount      uint64
    DateAdded     time.Time
}
```

<ExpansionPanel title="How is dateAdded serialized?">

You can reuse the [date format used for the deadline](./game-deadline.md):


```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/keys.go#L50]
const (
    DateAddedLayout = DeadlineLayout
)
```

Add similar functions to it, as you did when adding a deadline:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/full_leaderboard.go#L17-L28]
func (winningPlayer *WinningPlayer) GetDateAddedAsTime() (dateAdded time.Time, err error) {
    dateAdded, errDateAdded := time.Parse(DateAddedLayout, winningPlayer.DateAdded)
    return dateAdded, sdkerrors.Wrapf(errDateAdded, ErrInvalidDateAdded.Error(), winningPlayer.DateAdded)
}

func GetDateAdded(ctx sdk.Context) time.Time {
    return ctx.BlockTime()
}

func FormatDateAdded(dateAdded time.Time) string {
    return dateAdded.UTC().Format(DateAddedLayout)
}
```

</ExpansionPanel>

<ExpansionPanel title="Add functions to (de-)serialize winningPlayerParsed">

Create the methods:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/full_leaderboard.go#L30-L48]
func (winningPlayer *WinningPlayer) parse() (parsed *winningPlayerParsed, err error) {
    dateAdded, err := winningPlayer.GetDateAddedAsTime()
    if err != nil {
        return nil, err
    }
    return &winningPlayerParsed{
        PlayerAddress: winningPlayer.PlayerAddress,
        WonCount:      winningPlayer.WonCount,
        DateAdded:     dateAdded,
    }, nil
}

func (parsed *winningPlayerParsed) stringify() (stringified *WinningPlayer) {
    return &WinningPlayer{
        PlayerAddress: parsed.PlayerAddress,
        WonCount:      parsed.WonCount,
        DateAdded:     FormatDateAdded(parsed.DateAdded),
    }
}
```

The functions are called repeatedly when (de-)serializing arrays:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/full_leaderboard.go#L50-L69]
func (leaderboard *Leaderboard) parseWinners() (winners []*winningPlayerParsed, err error) {
    winners = make([]*winningPlayerParsed, len(leaderboard.Winners))
    var parsed *winningPlayerParsed
    for index, winningPlayer := range leaderboard.Winners {
        parsed, err = winningPlayer.parse()
        if err != nil {
            return nil, err
        }
        winners[index] = parsed
    }
    return winners, nil
}

func stringifyWinners(winners []*winningPlayerParsed) (stringified []*WinningPlayer) {
    stringified = make([]*WinningPlayer, len(winners))
    for index, winner := range winners {
        stringified[index] = winner.stringify()
    }
    return stringified
}
```

</ExpansionPanel>

As you have a function to get an array of deserialized winning players, you can now add a function to sort the slice in place:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/full_leaderboard.go#L73-L83]
func sortWinners(winners []*winningPlayerParsed) {
    sort.SliceStable(winners[:], func(i, j int) bool {
        if winners[i].WonCount > winners[j].WonCount {
            return true
        }
        if winners[i].WonCount < winners[j].WonCount {
            return false
        }
        return winners[i].DateAdded.After(winners[j].DateAdded)
    })
}
```

You test in descending order for scores first and then for the added dates. As you can see, there is no deserialization in this `func(i, j int) bool` callback. It should be possible to write a one-liner inside this function but at the expense of readability.

<ExpansionPanel title="Add a function to add a candidate and sort">

When migrating the genesis more than one candidate will be added. With this in mind, add a first helper on the deserialized elements:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/full_leaderboard.go#L85-L92]
func AddParsedCandidatesAndSort(parsedWinners []*winningPlayerParsed, candidates []*winningPlayerParsed) (updated []*winningPlayerParsed) {
    updated = append(parsedWinners, candidates...)
    sortWinners(updated)
    if LeaderboardWinnerLength < len(updated) {
        updated = updated[:LeaderboardWinnerLength]
    }
    return updated
}
```

Notice the clipping at the leaderboard's length. Similarly, You need helpers on the leaderboard.

You can get these other helpers with a de-serialization:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/full_leaderboard.go#L94-L118]
func (leaderboard *Leaderboard) AddCandidatesAndSortAtNow(now time.Time, playerInfos []*PlayerInfo) (err error) {
    parsedWinners, err := leaderboard.parseWinners()
    if err != nil {
        return err
    }
    parsedPlayers := make([]*winningPlayerParsed, len(playerInfos))
    for index, playerInfo := range playerInfos {
        parsedPlayers[index] = &winningPlayerParsed{
            PlayerAddress: playerInfo.Index,
            WonCount:      playerInfo.WonCount,
            DateAdded:     now,
        }
    }
    parsedWinners = AddParsedCandidatesAndSort(parsedWinners, parsedPlayers)
    leaderboard.Winners = stringifyWinners(parsedWinners)
    return nil
}

func (leaderboard *Leaderboard) AddCandidatesAndSort(ctx sdk.Context, playerInfos []*PlayerInfo) (err error) {
    return leaderboard.AddCandidatesAndSortAtNow(GetDateAdded(ctx), playerInfos)
}

func (leaderboard *Leaderboard) AddCandidateAndSort(ctx sdk.Context, playerInfo PlayerInfo) (err error) {
    return leaderboard.AddCandidatesAndSort(ctx, []*PlayerInfo{&playerInfo})
}
```

Here we assume that a candidate is added at the current block time or migration time. A candidate is not an existing winning player but a new one.

</ExpansionPanel>

## v2 leaderboard handling

You have created the leaderboard helper functions. In a separate file, add one last function to the keeper to implement the leaderboard. You want this function to make it possible to add a candidate winner and save the updated leaderboard:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/keeper/leaderboard_handler.go#L10-L21]
func (k *Keeper) MustAddToLeaderboard(ctx sdk.Context, winnerInfo types.PlayerInfo) types.Leaderboard {
    leaderboard, found := k.GetLeaderboard(ctx)
    if !found {
        panic("Leaderboard not found")
    }
    err := leaderboard.AddCandidateAndSort(ctx, winnerInfo)
    if err != nil {
        panic(fmt.Sprintf(types.ErrCannotAddToLeaderboard.Error(), err.Error()))
    }
    k.SetLeaderboard(ctx, leaderboard)
    return leaderboard
}
```

Note the new error [`ErrCannotAddToLeaderboard`](https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/errors.go#L33).

You are now through most of the leaderboard preparation and the only thing left is to call your new functions at the right junctures:

1. On a win:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/keeper/msg_server_play_move.go#L82-L83]
    if storedGame.Winner == rules.NO_PLAYER.Color {
        ...
    } else {
        ...
        winnerInfo, _ := k.Keeper.MustRegisterPlayerWin(ctx, &storedGame)
        k.Keeper.MustAddToLeaderboard(ctx, winnerInfo)
    }
    ```

2. And on a forfeit:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/keeper/end_block_server_game.go#L58-L59]
    if storedGame.MoveCount <= 1 {
        ...
    } else {
        ...
        winnerInfo, _ := k.MustRegisterPlayerForfeit(ctx, &storedGame)
        k.MustAddToLeaderboard(ctx, winnerInfo)
    }
    ```

Your leaderboard is now updated and saved on an on-going basis as part of your v2 blockchain.

## v1 to v2 player information migration helper

With your v2 blockchain now fully operational, it is time to work on the issue of the data migration.

First tackle the migration of the player information. You will be handed a giant _v1_ genesis when migrating, which contains all the games played so far. You have to go through them all and build the `PlayerInfoList` part of the _v2_ genesis.

You need to do `+1` on the relevant player stats as you go through games. For performance it makes sense to pick a `map[string]*types.PlayerInfo` data type so that you can call up a player's stats by its ID in `O(1)`.

Begin by creating a function that gets or creates a new `PlayerInfo` in a new file:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/winning_players_builder.go#L9-L20]
func getOrNewPlayerInfo(infoSoFar *map[string]*types.PlayerInfo, playerIndex string) (playerInfo *types.PlayerInfo) {
    playerInfo, found := (*infoSoFar)[playerIndex]
    if !found {
        playerInfo = &types.PlayerInfo{
            Index:          playerIndex,
            WonCount:       0,
            LostCount:      0,
            ForfeitedCount: 0,
        }
    }
    return playerInfo
}
```

And then a function that does the incrementing in the `map` in place:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/winning_players_builder.go#L22-L53]
func PopulatePlayerInfosWith(infoSoFar *map[string]*types.PlayerInfo, games *[]*types.StoredGame) (err error) {
    var winnerAddress, loserAddress sdk.AccAddress
    var winnerIndex, loserIndex string
    var winnerInfo, loserInfo *types.PlayerInfo
    for _, game := range *games {
        winnerAddress, err = game.GetRedAddress()
        if err != nil {
            return err
        }
        loserAddress, err = game.GetBlackAddress()
        if err != nil {
            return err
        }
        if game.Winner == rules.RED_PLAYER.Color {
            // Already correct
        } else if game.Winner == rules.BLACK_PLAYER.Color {
            winnerAddress, loserAddress = loserAddress, winnerAddress
        } else {
            // Game is still unresolved.
            continue
        }
        winnerIndex = winnerAddress.String()
        loserIndex = loserAddress.String()
        winnerInfo = getOrNewPlayerInfo(infoSoFar, winnerIndex)
        loserInfo = getOrNewPlayerInfo(infoSoFar, loserIndex)
        winnerInfo.WonCount += 1
        loserInfo.LostCount += 1
        (*infoSoFar)[winnerIndex] = winnerInfo
        (*infoSoFar)[loserIndex] = loserInfo
    }
    return nil
}
```

You are using a `map` of `PlayerIno` only for performance reasons. In the end, because the v2 genesis takes a list and not a map, you need to do a conversion. Add a helper:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/winning_players_builder.go#L55-L61]
func PlayerInfoMapToList(all *map[string]*types.PlayerInfo) []*types.PlayerInfo {
    asList := make([]*types.PlayerInfo, 0, len(*all))
    for _, playerInfo := range *all {
        asList = append(asList, playerInfo)
    }
    return asList
}
```

## v1 to v2 leaderboard migration helper

You could decide to build the leaderboard as the player stats list is being built, mimicking the regular operation of your v2 checkers blockchain. Unfortunately, that would entail a lot of array sorting for what are just intermediate player stats. Instead build the v2 genesis leaderboard only after all player stats have been gathered.

In practice you add _k_ new `winningPlayerParsed` to the array, sort it, clip it to 100, and repeat. What constitutes a good _k_ value should be dictated by testing and performance measurements. For now you can use 200. So prepare a new file to encapsulate these v1-to-v2-only operations:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/leaderboard_builder.go#L9-L12]
const (
    // Adjust this length to obtain the best performance over a large map.
    IntermediaryPlayerLength = types.LeaderboardWinnerLength * 2
)
```

If your leaderboard length is 100, you would add 200 candidates for a total of 300. To accommodate such intermediate additions and sorting you can also encapsulate this in:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/leaderboard_builder.go#L16-L20]
func CreateLeaderboardForGenesis() *types.Leaderboard {
    return &types.Leaderboard{
        Winners: make([]*types.WinningPlayer, 0, types.LeaderboardWinnerLength+IntermediaryPlayerLength),
    }
}
```

Time to write the function that adds _k_ candidates, sorts that intermediate result, and clips it, before adding further candidates:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/leaderboard_builder.go#L22-L33]
func PopulateLeaderboardWith(leaderboard *types.Leaderboard, additionalPlayers *map[string]*types.PlayerInfo, now time.Time) (err error) {
    partialPlayers := make([]*types.PlayerInfo, IntermediaryPlayerLength)
    for _, playerInfo := range *additionalPlayers {
        partialPlayers = append(partialPlayers, playerInfo)
        if len(partialPlayers) >= cap(partialPlayers) {
            leaderboard.AddCandidatesAndSortAtNow(now, partialPlayers)
            partialPlayers = partialPlayers[:0]
        }
    }
    leaderboard.AddCandidatesAndSortAtNow(now, partialPlayers)
    return nil
}
```


## A proper v1 to v2 migration

Now your full chain state migration comes down to a genesis conversion from `GenesisStateV1` to your v2 `GenesisState`. It in its own new file, you can write it:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/genesis_converter.go#L9-L26]
func (genesisV1 GenesisStateV1) Convert(now time.Time) (genesis *types.GenesisState, err error) {
    playerInfos := make(map[string]*types.PlayerInfo, 1000)
    err = PopulatePlayerInfosWith(&playerInfos, &genesisV1.StoredGameList)
    if err != nil {
        return nil, err
    }
    leaderboard := CreateLeaderboardForGenesis()
    err = PopulateLeaderboardWith(leaderboard, &playerInfos, now)
    if err != nil {
        return nil, err
    }
    return &types.GenesisState{
        Leaderboard:    leaderboard,
        PlayerInfoList: PlayerInfoMapToList(&playerInfos),
        StoredGameList: genesisV1.StoredGameList,
        NextGame:       genesisV1.NextGame,
    }, nil
}
```


## Next up

Your checkers blockchain is done. It has a leaderboard, which was introduced later in production thanks to migrations.

Now it is time to explore two other helpful tools for working with the Cosmos SDK: [CosmJS](./cosmjs.md) and [CosmWasm](./cosmwasm.md). Begin with [CosmJS](./cosmjs.md).
