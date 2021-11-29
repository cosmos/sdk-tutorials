---
title: Migration for Leaderboard
order: 19
description: Introducing a leaderboard to your in-production blockchain
---

# Migration for Leaderboard

<HighlightBox type="info">

Make sure you have all you need to reward validators for their work:

* You understand the concepts of [transactions](../3-main-concepts/05-transactions), [messages](../3-main-concepts/07-messages), [Protobuf](../3-main-concepts/09-protobuf), and [migrations](../3-main-concepts/15-migrations).
* Have Go installed.
* The checkers blockchain with the `MsgCreateGame` and its handling. Either because you followed the [previous steps](./03-starport-05-create-handling) or because you checked out [its outcome](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-handler
).

</HighlightBox>

Imagine you have built your checkers blockchain from scratch. This is version _v1_ of the checkers blockchain. It has been running in production for some time: games are created, played on, won, and lost. Now you decide to introduce a version _v2_ of your blockchain - one that includes leaderboards. The condition to fulfill are:

* Any player who has **ever** played should have a tally of games won, lost, and forfeited.
* The leaderboard should list the players with the most wins up to a pre-determined number. For example, the leaderboard could only include the top 100 scores.
* To avoid squatting and increase engagement, the most recent score takes precedence over an _older_ one so the player with the recent score is listed.

You also have to decide what to do with players and scores from your v1 checkers blockchain when you introduce the leaderboard. You want to start your new version, v2, including all games played, past and future ones. You only need to go through all played games, update the players with their tallies, and add a leaderboard including the information as all past games and their outcomes are kept in the chain's state. A migration is a good option to tackle the leaderboard.

## Introducing a leaderboard

Several things need to be addressed before you can focus all your attention on the migration:

1. Save and mark as v1 the current data types about to be modified with the new version. All data types, which will be unmodified, need not be identified as such.
2. Prepare your v2 blockchain by:
    1. Defining your new data types.
    2. Adding helper functions to encapsulate clearly defined actions, like sorting.
    2. Adjust the existing code to make use of and update the new data types.
3. Prepare some code by:
    1. Adding helper functions to take large amounts of data from the v1 genesis.
    2. Adding a function to migrate from v1 to v2 genesis.
    3. Making sure you can handle large amounts of data.

_Why do you need to make sure you can handle large amounts of data?_ The full state at the point of migration will be passed in the form of a gigantic v1 genesis when your migration function is called.

Start preparing the migration.

## Save your v1

Your migration steps will be handled in a new folder, `x/checkers/migrations/v1tov2`, that needs to be created.

As for the **data structure**, you only need to change the genesis structure. The other structures are brand new. So copy and paste your v1 genesis from the current commit and save it under another name in `v1tov2/types.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/types.go#L7-L10]
type GenesisStateV1 struct {
    StoredGameList []*types.StoredGame `protobuf:"bytes,2,rep,name=storedGameList,proto3" json:"storedGameList,omitempty"`
    NextGame       *types.NextGame     `protobuf:"bytes,1,opt,name=nextGame,proto3" json:"nextGame,omitempty"`
}
```

This should be all requiring a change. Unless you happened to also change the structure of `StoredGame` for instance, then you would too have to save the old version in the same file.

## New v2 information

It is time to take a closer look at the new data structures being introduced with the version upgrade.

<HighlightBox type="tip">

If you are feeling unsure about creating new data structures with Starport, take another look at the previous sections of the exercise.

</HighlightBox>

To give the new v2 information a fitting data structure you need:

1. A set of stats per player: it makes sense to save one `struct` for each player and map it by address. Recall that a game is stored at `StoredGame-value-123`. Starport is going to use a new prefix for players similar to the `StoredGame-value-` prefix:

    ```sh
    $ starport scaffold map playerInfo wonCount:uint lostCount:uint forfeitedCount:uint --module checkers --no-message
    ```

    <HighlightBox type="info">

    The new prefix for players helps differentiate between the value for players and the one for games prefixed with `StoredGame-value-`.

    </HighlightBox>

    Which creates a Protobuf file:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/player_info.proto#L8-L13]
    message PlayerInfo {
        string index = 1;
        uint64 wonCount = 2;
        uint64 lostCount = 3;
        uint64 forfeitedCount = 4;
    }
    ```

    From which you remove `creator` because it fulfills no use. Do not forget to add the new object to the v2 genesis:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/genesis.proto#L16]
    import "checkers/player_info.proto";

    message GenesisState {
        ...
        repeated PlayerInfo playerInfoList = 3;
    }
    ```

2. A structure repeated inside the leaderboard: it stores the information of a player scoring high enough to be included in the leaderboard. You do not need to store it directly in the storage as it is part of the leaderboard. Instead of involving Starport, create the structure by hand:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/winning_player.proto#L8-L12]
    message WinningPlayer {
        string playerAddress = 1;
        uint64 wonCount = 2;
        string dateAdded = 3;
    }
    ```

    Where:

    * `playerAddress` indicates the player, so to say gives information regarding `PlayerInfo.index`.
    * `wonCount` determines the ranking on the leaderboard - the higher the count, the closer to the `0` index in the array.
    * `dateAdded` determines the ranking when there is a tie in `wonCount` - the more recent, the closer to the `0` in the array.

3. A structure for the leaderboard: there is a single stored leaderboard for the whole application. Let Starport help you implement a structure:

    ```sh
    $ starport scaffold single leaderboard winners --module checkers --no-message
    ```

    Which creates a Protobuf file that you update with your preferred type and its `import`. Also, remove the `creator`:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/leaderboard.proto#L9-L11]
    import "checkers/winning_player.proto";

    message Leaderboard {
        repeated WinningPlayer winners = 1;
    }
    ```

    And update the v2 genesis file by using your earlier saved copy from v1:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/genesis.proto#L15]
    import "checkers/leaderboard.proto";

    message GenesisState {
        ...
        Leaderboard leaderboard = 4;
    }
    ```

    Make sure the initial value stored for the leaderboard is not `nil`. Head to `genesis.go` for this and adjust it:

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

    This function returns a default genesis. This step is important if you start fresh. You do not begin with an "empty" genesis but one resulting from the upcoming genesis migration in this exercise.

With the structure set up it is time to add the code using these new elements.

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

Which you can easily call from these public one-liner functions attached to the keeper:

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

Which you can call from these public almost-one-liner helper functions attached to the keeper:

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

Notice the two new error types [`ErrThereIsNoWinner`](https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/errors.go#L31) and [`ErrWinnerNotParseable`](ErrWinnerNotParseable).

</ExpansionPanel>

## v2 player information handling

Now call your helper functions at the right junctures on a win:

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

And call the helper functions for a forfeit:

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

Continue making your v2 complete before tackling the migration part. Your leaderboard helpers should:

1. Add a new candidate to your array.
2. Sort the array according to the rules.
3. Clip the array to 100 and save the result.

The sorting entails comparing dates in cases of a score tie. This is potentially expensive if you are deserializing in the comparator itself. So you ought to prepare a data structure that has already deserialized the `dateAdded` for you to deserialize all the elements of the whole array, sort it, and then reserialize its elements. You do not need to use this deserialized element type anywhere else. You can keep it private:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/full_leaderboard.go#L11-L15]
type winningPlayerParsed struct {
    PlayerAddress string
    WonCount      uint64
    DateAdded     time.Time
}
```

<ExpansionPanel title="How is dateAdded serialized?">

You can reuse the [date format used for the deadline](5-my-own-chain/03-starport-10-game-deadline.md):


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

<ExpansionPanel title="Adding functions to (de-)serialize winningPlayerParsed">

You create standard functions:

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

As you can get an array of deserialized winning players, you can now add a function to sort the slice in place:

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

You test in descending order for scores first and then for the added dates. There is no deserialization in this `func(i, j int) bool` callback. It should be possible to write a one-liner in it at the expense of readability.

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

Here we assume that a candidate is added at the current block time or migration time - a candidate is not an existing winning player but a new one.

</ExpansionPanel>

## v2 leaderboard handling

You have created the helpers. Now add one last function to the keeper to implement the leaderboard. You want to make adding a candidate winner and saving the updated leaderboard possible:

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

Notice the new error [`ErrCannotAddToLeaderboard`](https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/errors.go#L33).

Most has been prepared and there is not much left to do at the right junctures, on a win:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/keeper/msg_server_play_move.go#L82-L83]
if storedGame.Winner == rules.NO_PLAYER.Color {
    ...
} else {
    ...
    winnerInfo, _ := k.Keeper.MustRegisterPlayerWin(ctx, &storedGame)
    k.Keeper.MustAddToLeaderboard(ctx, winnerInfo)
}
```

And on a forfeit:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/keeper/end_block_server_game.go#L58-L59]
if storedGame.MoveCount <= 1 {
    ...
} else {
    ...
    winnerInfo, _ := k.MustRegisterPlayerForfeit(ctx, &storedGame)
    k.MustAddToLeaderboard(ctx, winnerInfo)
}
```

Your leaderboard is updated and saved.

## v1 to v2 player information migration helper

There remains the issue of the genesis migration. So get right to it.

Your v2 is prepared. Now it is time to work on the migration.

First, tackle the migration of the player information. You will be handed a giant _v1_ genesis when migrating, which contains all the games played so far. You have to go through them all and build the `PlayerInfoList` part of the _v2_ genesis. You need to do `+1` on the relevant player stats as you go through games. Past games did not save whether a game ended in a forfeit. So it is only possible to count wins and losses. It makes sense to pick a `map[string]*types.PlayerInfo` data type given the need to call up player information by their ID.

Beginn with creating a function that gets or creates a new `PlayerInfo`:

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

And then a function that does the incrementing:

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

It assumes that the red player won and flips the function if that is not the case.

Because the v2 genesis takes a list and not a map, add a helper:

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

The leaderboard could be built as the player stats list is being built. That would entail a lot of array sorting for intermediate player stats. The v2 genesis leaderboard should be built after all player stats are gathered.

Your player stats list could include a million entries. Are you going to create another million-long array with deserialized `winningPlayerParsed` types and sort it? This would translate to doubling your memory requirement for just a 100-long array. Make doing progressive adding and sorting possible to avoid this.

What constitutes a good value should be dictated by testing and measuring. But for the sake of starting the thought process, you can use:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/leaderboard_builder.go#L9-L12]
const (
    // Adjust this length to obtain the best performance over a large map.
    IntermediaryPlayerLength = types.LeaderboardWinnerLength * 2
)
```

If your leaderboard length is 100, you would add 200 candidates for a total of 300. To accommodate such intermediate additions and sorting, you can also encapsulate this knowledge in:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/leaderboard_builder.go#L16-L20]
func CreateLeaderboardForGenesis() *types.Leaderboard {
    return &types.Leaderboard{
        Winners: make([]*types.WinningPlayer, 0, types.LeaderboardWinnerLength+IntermediaryPlayerLength),
    }
}
```

You can write the function that adds candidates up to a point with this and then sort that intermediate result before adding further candidates and so on:

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

With all the preparatory work, your genesis conversion hello `GenesisStateV1` comes down to:

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

It is short and sweet but hides a lot of computing work. Make sure to test it on large, real-world, datasets before creating a `Plan` and publishing an upgrade block height.

This is how you upgrade your blockchain in the Cosmos SDK v0.42.

## Next up

Your checkers blockchain is done. It has a leaderboard, which can be migrated.

Now it is time to explore two other helpful tools for working with the Cosmos SDK: [CosmJS](./04-cosmjs) and [CosmWasm](./05-cosmwasm). Begin with [CosmJS](./04-cosmjs).
