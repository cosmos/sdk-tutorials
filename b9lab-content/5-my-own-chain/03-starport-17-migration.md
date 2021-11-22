---
title: Migration For Leaderboard
order: 19
description: Introduce a leaderboard to your blockchain in production.
---

# Migration For Leaderboard

Until now, this guided exercise had you build your checkers blockchain from the ground up. Now, imagine you have built it from scratch, your version _v1_. It has been running in production for some time, with games created, played on, won and lost. Given its success, and following player feedback, you decide to introduce a version _v2_ of your blockchain, one that includes leaderboards. In particular:

* Any player who has **ever** played should have a tally of games won, lost, and forfeited.
* There should be a leaderboard that lists the players with the most wins, but in limited number. For instance only with the top 100 scores.
* In order to avoid squatting and increase engagement, at equal scores, a player that reached that score the most recently takes precedence over an _older_ contender.

It is not good enough to introduce a leaderboard just for players winning and losing from now on. You want to start your new version with all those that played in the past. You are in luck because all past games, and their outcomes, have been kept in the chain state. What you now need to do is go through them all and update the players with their tallies, and add a leaderboard with relevant information. That's what the migration is about in this practical case.

## The Work Ahead

Easier said than done. A certain number of things need to be done before you can focus on the migration proper:

1. Save, and mark as v1, the current data types that are about to be modified with the new version. The unmodified data types need not be identified as such.
2. Prepare your v2 blockchain, for which you need to:
    1. Define your new data types.
    2. Add helper functions to encapsulate clearly defined actions, like sorting.
    2. Adjust the existing code to make use of and to update the new data types.
3. Prepare some code to convert:
    1. Add helper functions that take large amounts of data from the v1 genesis.
    2. Add a function to migrate from v1 to v2 genesis.
    3. Make sure you can handle large amounts of data.

Large amounts, because when your migration function is called upon, it will be passed the full state at the point of migration, in the form of a monster v1 genesis.

Let's start.

## Save Your v1

Your migration steps will be handled in a new folder `x/checkers/migrations/v1tov2`. So create it. As for data structure, you are only going to change the genesis structure. Other structures are brand new. So copy paste your v1 genesis from the current commit, and save it under another name in `v1tov2/types.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/types.go#L7-L10]
type GenesisStateV1 struct {
    StoredGameList []*types.StoredGame `protobuf:"bytes,2,rep,name=storedGameList,proto3" json:"storedGameList,omitempty"`
    NextGame       *types.NextGame     `protobuf:"bytes,1,opt,name=nextGame,proto3" json:"nextGame,omitempty"`
}
```
That's it in your case. If you happened to also change the structure of `StoredGame`, for instance, you would have to save the old version too in the same file.

## New v2 Information

On to the new data structures. Thanks to the previous sections, you should have the hang of creating new data structures with Starport. Now, what are the new v2 stored information?

1. A set of stats per player. Here it makes sense to save one `struct` for each player and map that by their address. If you recall, a game is stored at `StoredGame-value-123`. Good thing there is this `StoredGame-value-` prefix because now, Starport is going to use another one for players.
    ```sh
    $ starport scaffold map playerInfo wonCount:uint lostCount:uint forfeitedCount:uint --module checkers --no-message
    ```
    Which created a Protobuf file:
    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/player_info.proto#L8-L13]
    message PlayerInfo {
        string index = 1;
        uint64 wonCount = 2;
        uint64 lostCount = 3;
        uint64 forfeitedCount = 4;
    }
    ```
    From which you removed `creator` because it has no usefulness. Not to forget its addition in the v2 genesis:
    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/genesis.proto#L16]
    import "checkers/player_info.proto";

    message GenesisState {
        ...
        repeated PlayerInfo playerInfoList = 3;
    }
    ```
2. A structure that will be repeated inside the leaderboard. It stores the information of a player that makes it to the leaderboard. You don't need to store it directly in storage as it is part of the leaderboard. So don't involve Starport and instead create it by hand:
    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/winning_player.proto#L8-L12]
    message WinningPlayer {
        string playerAddress = 1;
        uint64 wonCount = 2;
        string dateAdded = 3;
    }
    ```
    Where:

    * `playerAddress` will inform about which player this is. In effect, what `PlayerInfo.index` this is about.
    * `wonCount` determines the ranking on the leaderboard. The higher the count, the closer to the `0` index in the array.
    * `dateAdded` also determines the ranking if there is a tie in `wonCount`. The more recent the date, the closer to the `0` in the array.
3. A structure for the leaderboard. There is a single stored leaderboard for the whole application. So you get help from Starport:
    ```sh
    $ starport scaffold single leaderboard winners --module checkers --no-message
    ```
    Which created a Protobuf file that you update with the right desired type, and its `import`. And also remove `creator`.
    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/leaderboard.proto#L9-L11]
    import "checkers/winning_player.proto";

    message Leaderboard {
        repeated WinningPlayer winners = 1;
    }
    ```
    And also an update to the v2 genesis file. Good thing you saved a copy of the v1 earlier.
    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/proto/checkers/genesis.proto#L15]
    import "checkers/leaderboard.proto";

    message GenesisState {
        ...
        Leaderboard leaderboard = 4;
    }
    ```
    You need to also make sure the initial value stored for the leaderboard is not `nil`. So head to `genesis.go` and adjust it such that:
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
    This is just a function that returns a default genesis, which makes sense if you started afresh from here. Of course you don't, what with the upcoming genesis migration. But still, better be consistent here.

Now, looking at your v2 in isolation, it's time to add the code elements that make use of these new elements.

## v2 Player Info Helpers

Eventually, you need to do `+1` on one of the `count` when a game reaches a resolution.

<ExpansionPanel title="Yes, I want to see this detail">

Start by adding a helper private function that gets the stats from storage, updates the numbers as instructed, and saves it back:

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
But which player should get `+1` on what count? To get it right, you need to identify the loser and the winner. For that, you create this other private helper:

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

## v2 Player Info Handling

This is the easy part, where you call your helper functions are the right junctures, on a win:

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
And a forfeit:

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

## v2 Leaderboard Helpers

You are not yet at the migration part, you are still on the road to making your v2 complete. What you want to achieve with your leaderboard helpers is that you can:

1. Add a new candidate to your array.
2. Sort the array according to the rules mentioned at the beginning of this section.
3. Clip the array to 100 and save the result.

The sorting entails comparing dates, in case of a tie when comparing scores. This is potentially expensive if you are deserializing in the comparator itself. So you ought to prepare a data structure that has already deserialized the `dateAdded`. With that, you can deserialize all the elements of the whole array, sort it, and then reserialize its elements. You do not need to use this deserialized element type anywhere else, so you keep it private:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/full_leaderboard.go#L11-L15]
type winningPlayerParsed struct {
    PlayerAddress string
    WonCount      uint64
    DateAdded     time.Time
}
```

<ExpansionPanel title="By the way, how is this dateAdded serialized?">

You can reuse the date format used for the deadline:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/keys.go#L50]
const (
    DateAddedLayout = DeadlineLayout
)
```
And add similar functions to that used for the deadline:

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

<ExpansionPanel title="Then you add functions to de/serialize this winningPlayerParsed(s)">

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
Which are called repeatedly when de/serializing arrays:

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

With the ability to get an array of deserialized winning players, you can now add a function to sort the slice in place:

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
As you can see, you test for scores first, in descending order, then for added date, in descending order too. No deserialization in this `func(i, j int) bool` callback. Whew! It should be possible to write a one-liner in it, at the expense of readability.

<ExpansionPanel title="Now you can add a function to add a candidate and sort">

With a view to adding more than one candidate, which will happen when migrating the genesis, you add a first helper on the deserialized elements:

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
Notice the clipping at the leaderboard's length. Of course, you need the same but on the leaderboard proper. So with, first, a deserialization, you get these other helpers:

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
Of note is the assumption that a candidate is added at the current block time, or migration time. In other words, a candidate is not an existing winning player, but a new one.

</ExpansionPanel>

## v2 Leaderboard Handling

You have created the helpers, now you add one last function to the keeper to implement the leaderboard work proper, that of adding a candidate winner and save the updated leaderboard:

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
Notice the new [`ErrCannotAddToLeaderboard`](https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/types/errors.go#L33) too.

Since you have prepared your work exceedingly well, there is not much left to do at the right junctures, on a win:

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
Your leaderboard is updated and saved. Job done.

## v1 to v2 Player Info Migration Helper

Job done? Well, there remains the issue of the genesis migration, the whole point of this exercise. All that you did up to now is just to prepare your v2. Let's work on the migration, first of the player info.

When migrating, you will be handed a giant _v1_ genesis, which contains all the games so far. You have to go through them all and build the `PlayerInfoList` part of the _v2_ genesis. As you go through games you need to do `+1` on the relevant player stats. Past games did not save whether a game ended in a forfeit, so here it is only possible to count wins and losses. Given the need to call up player infos by their id, it make sense to pick a `map[string]*types.PlayerInfo` data type to do the work.

So create a function that gets or creates a new `PlayerInfo`:

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
Notice how it assumes that the red player won, and flips it if that is not the case. Now, because the v2 genesis takes a list and not a map, add a helper for that:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/winning_players_builder.go#L55-L61]
func PlayerInfoMapToList(all *map[string]*types.PlayerInfo) []*types.PlayerInfo {
    asList := make([]*types.PlayerInfo, 0, len(*all))
    for _, playerInfo := range *all {
        asList = append(asList, playerInfo)
    }
    return asList
}
```

## v1 to v2 Leaderboard Migration Helper

The leaderboard could be built as the player stats list is being built, but that would entail a lot of array sorting for what are in fine intermediate player stats. It is better for the v2 genesis leaderboard to be built after all player stats has been gathered.

Keep in mind, your player stats list could be a million long. Are you going to create another million-long array with deserialized `winningPlayerParsed` types and sort it? That means roughly doubling your memory requirement, for what ends up being a 100-long array anyway. To avoid that, you ought to make it possible to do progressive adding and sorting. Here, what constitutes a good value should be dictated by testing and measuring, but the sake of starting the thought process, you can use:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/leaderboard_builder.go#L9-L12]
const (
    // Adjust this length to obtain the best performance over a large map.
    IntermediaryPlayerLength = types.LeaderboardWinnerLength * 2
)
```
In effect, if your leaderboard length is 100, you will add 200 candidates for a grand total of 300. To accommodate such intermediate additions and sorting, you can also encapsulate this knowledge in:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ed8c76836d797af891414391f21d2f5b5f1eb6fa/x/checkers/migrations/v1tov2/leaderboard_builder.go#L16-L20]
func CreateLeaderboardForGenesis() *types.Leaderboard {
    return &types.Leaderboard{
        Winners: make([]*types.WinningPlayer, 0, types.LeaderboardWinnerLength+IntermediaryPlayerLength),
    }
}
```
With this, you can write the function that adds a bunch of candidates, up to a point, and then sort that intermediate result, before adding further candidates and so on:

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

## v1 to v2 Migration Proper

Now that was a long lead-up. However, thanks to all this preparatory work, your genesis conversion, hello `GenesisStateV1`, comes down to:

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
It's short and sweet but hides a lot of computing work. Make sure to test it on large, real-world, datasets before creating a `Plan` and publishing an upgrade block height.

And that, dear reader, is how you upgrade your blockchain in Cosmos SDK v0.42.
