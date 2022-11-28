---
title: "Introduce a Leaderboard After Production"
order: 3
description: A leaderboard for your in-production blockchain via state migration
tags: 
  - guided-coding
  - cosmos-sdk
  - cosm-js
---

# Introduce a Leaderboard After Production

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md) and [migrations](/academy/2-cosmos-concepts/13-migrations.md).
* Go is installed.
* You have the checkers blockchain codebase up to the wager denomination. If not, follow the [previous steps](/hands-on-exercise/2-ignite-cli-adv/8-wager-denom.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-wager-denomination).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add a leaderboard.
* Upgrade your blockchain in production.
* Deal with data migrations and logic upgrades.

</HighlightBox>

If you have been running _v1_ of your checkers blockchain for a while, games have been created, played on, won, and lost. In this section, you will introduce _v2_ of your blockchain with leaderboard support. A good leaderboard fulfills these conditions:

* Any player who has **ever** played should have a tally of games won, lost, and forfeited.
* The leaderboard should list the players with the most wins up to a pre-determined number. For example, the leaderboard could only include the top 100 scores.
* To avoid squatting and increase engagement, when equal in value the most recent score takes precedence over an _older_ one, so the player with the recent score is listed higher on the leaderboard.

When you introduce the leaderboard, you also have to decide what to do with your existing players and their scores from your v1 checkers blockchain.

Start your v2's leaderboard as if all played past games had been counted for the leaderboard. You _only_ need to go through all played games, update the players with their tallies, and add a leaderboard including the information. This is possible because all past games and their outcomes are kept in the chain's state. Migration is a good method to tackle the initial leaderboard.

For the avoidance of doubt, **v1 and v2 refer to the overall versions of the application**, and not to the _consensus versions_ of individual modules, which may change or not.

## Introducing a leaderboard

Several things need to be addressed before you can focus all your attention on the migration:

1. Save and mark as v1 the current data types about to be modified with the new version. Data types that will remain unmodified need not be identified as such.
2. Prepare your v2 blockchain:
    1. Define your new data types.
    2. Add helper functions to encapsulate clearly defined actions, like leaderboard sorting.
    3. Adjust the existing code to make use of and update the new data types.
3. Prepare for your v1-to-v2 migration:
    1. Add helper functions to process large amounts of data from the latest chain state of type v1.
    2. Add a function to migrate your state from v1 to v2.
    3. Make sure you can handle large amounts of data.

_Why do you need to make sure you can handle large amounts of data?_ The full state at the point of migration may well have millions of games. You do not want your process to grind to a halt because of a lack of memory or I/O capacity.

## Save your v1

Your migration steps will be handled in a new folder, `x/checkers/migrations/v1tov2`, which needs to be created:

```sh
$ mkdir -p x/checkers/migrations/v1tov2
```

The only **data structure** you will eventually change is the checkers genesis structure. The other data structures are new, so you can treat them _as usual_. Although in this specific case it is not strictly necessary, it is good to make this practice habitual. Copy and paste your compiled Protobuf v1 genesis from the current commit and save it under the same name in `x/checkers/migrations/v1/types/`:

```sh
$ mkdir -p x/checkers/migrations/v1/types
$ cp x/checkers/types/genesis.pb.go x/checkers/migrations/v1/types
```

Your current genesis definition eventually becomes your v2 genesis. This should be the only data structure requiring a change. However, if for example you also changed the structure of `StoredGame`, then you would have to save its v1 version in the same `v1/types` folder.

## New v2 information

It is time to take a closer look at the new data structures being introduced with the version upgrade.

<HighlightBox type="tip">

If you feel unsure about creating new data structures with Ignite CLI, look at the [previous sections](/hands-on-exercise/1-ignite-cli/4-create-message.md) of the exercise again.

</HighlightBox>

To give the new v2 information a data structure, you need the following:

1. Add a set of **stats per player**: it makes sense to save one `struct` for each player and to map it by address. Remember that a game is stored at a _notional_ [`StoredGame/value/123/`](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/stored_game.go#L24-L28), where [`StoredGame/value/`](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/key_stored_game.go#L9) is a constant prefix. Similarly, Ignite CLI creates a new constant to use as the prefix for players:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ ignite scaffold map playerInfo wonCount:uint lostCount:uint forfeitedCount:uint --module checkers --no-message
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite scaffold map playerInfo wonCount:uint lostCount:uint forfeitedCount:uint --module checkers --no-message
    ```

    </CodeGroupItem>

    </CodeGroup>

    <HighlightBox type="info">

    The new `PlayerInfo/value/` prefix for players helps differentiate between the value for players and the value for games prefixed with `StoredGame/value/`.
    <br/><br/>
    Now you can safely have both `StoredGame/value/123/` and `PlayerInfo/value/123/` side by side in storage.

    </HighlightBox>

    This creates a Protobuf file:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/proto/checkers/player_info.proto#L6-L11]
    message PlayerInfo {
        string index = 1;
        uint64 wonCount = 2;
        uint64 lostCount = 3;
        uint64 forfeitedCount = 4;
    }
    ```

    It also added the map of new objects to the genesis, effectively your v2 genesis:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/proto/checkers/genesis.proto#L19]
    import "checkers/player_info.proto";

    message GenesisState {
        ...
        repeated PlayerInfo playerInfoList = 4 [(gogoproto.nullable) = false];
    }
    ```

    You will use the player's address as a key to the map.

2. Adjust in `types/genesis_test.go` for the expectation that you get an empty list to start with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/genesis_test.go#L124]
    func TestDefaultGenesisState_ExpectedInitialNextId(t *testing.T) {
        ...
        PlayerInfoList: []types.PlayerInfo{},
        ...
    }
    ```

3. Add a **leaderboard rung structure** to be repeated inside the leaderboard: this stores the information of a player scoring high enough to be included in the leaderboard. It is not meant to be kept directly in storage as it is only a part of the leaderboard. Instead of involving Ignite CLI, create the structure by hand in a new file:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/proto/checkers/winning_player.proto#L6-L10]
    message WinningPlayer {
        string playerAddress = 1;
        uint64 wonCount = 2;
        string dateAdded = 3;
    }
    ```

    <HighlightBox type="note">

    * `playerAddress` indicates the player, and gives information regarding `PlayerInfo.index`.
    * `wonCount` determines the ranking on the leaderboard - the higher the count, the closer to the `0` index in the array. This should exactly match the value found in the corresponding player stats. This duplication of data is a lesser evil because if `wonCount` was missing you would have to access the player stats to sort the leaderboard.
    * `dateAdded` indicates when the player's `wonCount` was last updated and determines the ranking when there is a tie in `wonCount` - the more recent, the closer to the `0` index in the array.

    </HighlightBox>

4. Add a structure for **the leaderboard**: there is a single stored leaderboard for the whole application. Let Ignite CLI help you implement a structure:

    <CodeGroup>

    <CodeGroupItem title="Local" active>

    ```sh
    $ ignite scaffold single leaderboard winners --module checkers --no-message
    ```

    </CodeGroupItem>

    <CodeGroupItem title="Docker">

    ```sh
    $ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite scaffold single leaderboard winners --module checkers --no-message
    ```

    </CodeGroupItem>

    </CodeGroup>


5. This creates a Protobuf file with `string winners`. You update it with your preferred type and its `import`. Add that each element in the map is not nullable. This will compile each `WinningPlayer` to a Go object instead of a pointer:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/proto/checkers/leaderboard.proto#L9-L11]
    import "gogoproto/gogo.proto";
    import "checkers/winning_player.proto";

    message Leaderboard {
        repeated WinningPlayer winners = 1 [(gogoproto.nullable) = false];
    }
    ```

6. The v2 genesis was also updated with the leaderboard. Tell it that the leaderboard should always be there (even if empty):

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/proto/checkers/genesis.proto#L20]
    import "checkers/leaderboard.proto";

    message GenesisState {
        ...
        Leaderboard leaderboard = 5 [(gogoproto.nullable) = false];
    }
    ```

    At this point, you should run `ignite generate proto-go` so that the corresponding Go objects are re-created.

7. Remember to make sure the initial value stored for the leaderboard is not `nil` but instead is empty. In `genesis.go` adjust:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/genesis.go#L20-L22]
    func DefaultGenesis() *GenesisState {
        return &GenesisState{
            ...
            Leaderboard: Leaderboard{
                Winners: []WinningPlayer{},
            },
        }
    }
    ```

    This function returns a default genesis. This step is important if you start fresh. In your case, you do not begin with an "empty" genesis but with one resulting from the upcoming genesis migration in this exercise.

    In particular, update the initial genesis test:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/genesis_test.go#L125-L127]
    func TestDefaultGenesisState_ExpectedInitialNextId(t *testing.T) {
        ...
            Leaderboard: types.Leaderboard{
                Winners: []types.WinningPlayer{},
            },
    }
    ```

8. Also adjust the compilation errors:

    On `genesis.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/genesis.go#L23]
    k.SetLeaderboard(ctx, genState.Leaderboard) // Not testing for nil
    ```

    On `genesis_test.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/genesis_test.go#L36-L45]
    ...
    Leaderboard: &types.Leaderboard{
        Winners: []*types.WinningPlayer{
            {
                PlayerAddress: "cosmos123",
            },
            {
                PlayerAddress: "cosmos456",
            },
        },
    },
    ...
    ```

    At this point you can add a test case that catches a duplicated winner player:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/genesis_test.go#L86-L101]
    {
        desc: "duplicated winnerPlayer",
        genState: &types.GenesisState{
            Leaderboard: types.Leaderboard{
                Winners: []types.WinningPlayer{
                    {
                        PlayerAddress: "0",
                    },
                    {
                        PlayerAddress: "0",
                    },
                },
            },
        },
        valid: false,
    },
    ```

9. This latest test case will pass, unless you update the `Validate()` method of the genesis to not allow duplicate player addresses. This is inspired by `types/genesis.go` and best kept in a separate `types/leaderboard.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/leaderboard.go#L12-L24]
    func (leaderboard Leaderboard) Validate() error {
        // Check for duplicated player address in winners
        winnerInfoIndexMap := make(map[string]struct{})

        for _, elem := range leaderboard.Winners {
            index := string(PlayerInfoKey(elem.PlayerAddress))
            if _, ok := winnerInfoIndexMap[index]; ok {
                return fmt.Errorf("duplicated playerAddress for winner")
            }
            winnerInfoIndexMap[index] = struct{}{}
        }
        return nil
    }
    ```

    After this, you can adjust the `types/genesis.go` files:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/genesis.go#L51-L54]
    ...
    // Validate Leaderboard
    if err := gs.Leaderboard.Validate(); err != nil {
        return err
    }
    ```

With the structure set up, it is time to add the code using these new elements in normal operations.

## v2 player information helpers

When a game reaches its resolution, one of the `count`s needs to add `+1`.

<ExpansionPanel title="A detailed look into the code">

To start, add a private helper function that gets the stats from the storage, updates the numbers as instructed, and saves it back:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/player_info_handler.go#L11-L33]
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/player_info_handler.go#L35-L45]
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/player_info_handler.go#L47-L69]
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/player_info_handler.go#L71-L81]
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

Be aware of the two new error types: [`ErrThereIsNoWinner`](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/errors.go#L30) and [`ErrWinnerNotParseable`](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/errors.go#L29).

</HighlightBox>

</ExpansionPanel>

## v2 player information handling

Now call your helper functions:

1. On a win:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_play_move.go#L80]
    ...
    if storedGame.Winner == rules.PieceStrings[rules.NO_PLAYER] {
        ...
    } else {
        ...
        k.Keeper.MustPayWinnings(ctx, &storedGame)
        k.Keeper.MustRegisterPlayerWin(ctx, &storedGame)
    }
    ...
    ```

2. On a forfeit:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/end_block_server_game.go#L57]
    ...
    if storedGame.MoveCount <= 1 {
        ...
    } else {
        ...
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

Sorting entails comparing dates in cases of a score tie. This is potentially expensive if you are deserializing the date in the comparator itself. Instead, the comparator should be presented with data already deserialized. Prepare a data structure that has already deserialized the `dateAdded`, which allows you to:

1. Deserialize all the elements of the whole leaderboard's array.
2. Sort its elements.
3. Only then re-serialize its elements.

Create a new file `leaderboard.go` to encapsulate all your leaderboard helpers:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/leaderboard.go#L26-L30]
type WinningPlayerParsed struct {
    PlayerAddress string
    WonCount      uint64
    DateAdded     time.Time
}
```

<ExpansionPanel title="How is dateAdded (de)serialized?">

You can reuse the [date format used for the deadline](/hands-on-exercise/2-ignite-cli-adv/2-game-deadline.md):

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/keys.go#L84]
const (
    DateAddedLayout = DeadlineLayout
)
```

Add similar functions to it, as you did when adding a deadline:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/leaderboard.go#L32-L47]
func ParseDateAddedAsTime(dateAdded string) (dateAddedParsed time.Time, err error) {
    dateAddedParsed, errDateAdded := time.Parse(DateAddedLayout, dateAdded)
    return dateAddedParsed, sdkerrors.Wrapf(errDateAdded, ErrInvalidDateAdded.Error(), dateAdded)
}

func (winningPlayer WinningPlayer) GetDateAddedAsTime() (dateAdded time.Time, err error) {
    return ParseDateAddedAsTime(winningPlayer.DateAdded)
}

func GetDateAdded(ctx sdk.Context) time.Time {
    return ctx.BlockTime()
}

func FormatDateAdded(dateAdded time.Time) string {
    return dateAdded.UTC().Format(DateAddedLayout)
}
```

Do the same for the new error message:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/errors.go#L31]
ErrInvalidDateAdded = sdkerrors.Register(ModuleName, 1120, "dateAdded cannot be parsed: %s")
```

</ExpansionPanel>

<ExpansionPanel title="Add functions to (de)serialize WinningPlayerParsed">

Create the methods:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/leaderboard.go#L49-L67]
func (winningPlayer WinningPlayer) Parse() (parsed WinningPlayerParsed, err error) {
    dateAdded, err := winningPlayer.GetDateAddedAsTime()
    if err != nil {
        return WinningPlayerParsed{}, err
    }
    return WinningPlayerParsed{
        PlayerAddress: winningPlayer.PlayerAddress,
        WonCount:      winningPlayer.WonCount,
        DateAdded:     dateAdded,
    }, nil
}

func (parsed WinningPlayerParsed) Stringify() WinningPlayer {
    return WinningPlayer{
        PlayerAddress: parsed.PlayerAddress,
        WonCount:      parsed.WonCount,
        DateAdded:     FormatDateAdded(parsed.DateAdded),
    }
}
```

The functions are called repeatedly when serializing or deserializing arrays:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/leaderboard.go#L69-L98]
func ParseWinners(winners []WinningPlayer) (parsedWinners []WinningPlayerParsed, err error) {
    parsedWinners = make([]WinningPlayerParsed, len(winners))
    var parsed WinningPlayerParsed
    for index, winningPlayer := range winners {
        parsed, err = winningPlayer.Parse()
        if err != nil {
            return nil, err
        }
        parsedWinners[index] = parsed
    }
    return parsedWinners, nil
}

func (leaderboard Leaderboard) ParseWinners() (winners []WinningPlayerParsed, err error) {
    return ParseWinners(leaderboard.Winners)
}

func StringifyWinners(winners []WinningPlayerParsed) []WinningPlayer {
    stringified := make([]WinningPlayer, len(winners))
    for index, winner := range winners {
        stringified[index] = winner.Stringify()
    }
    return stringified
}

func CreateLeaderboardFromParsedWinners(winners []WinningPlayerParsed) Leaderboard {
    return Leaderboard{
        Winners: StringifyWinners(winners),
    }
}
```

</ExpansionPanel>

As you have a function to get an array of deserialized winning players, you can now add a function to sort the slice in place:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/leaderboard.go#L100-L110]
func SortWinners(winners []WinningPlayerParsed) {
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

It tests in descending order, first for scores and then for the added dates.

<HighlightBox type="note">

There is no de-serialization in this `func(i, j int) bool` callback. It is possible to write a one-liner inside this function but at the expense of readability.

</HighlightBox>

Now you will make sure that your leaderboard never exceeds a certain length. Define the maximum length:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/keys.go#L83]
const (
    LeaderboardWinnerLength = uint64(100)
)
```

You now have the pieces in place to create the function that adds or updates a candidate to the leaderboard:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/leaderboard.go#L112-L155]
func UpdatePlayerInfoAtNow(winners []WinningPlayerParsed, now time.Time, candidate PlayerInfo) (updated []WinningPlayerParsed) {
    if candidate.WonCount < 1 {
        return winners
    }
    found := false
    for index, winner := range winners {
        if winner.PlayerAddress == candidate.Index {
            if winner.WonCount < candidate.WonCount {
                winners[index] = WinningPlayerParsed{
                    PlayerAddress: candidate.Index,
                    WonCount:      candidate.WonCount,
                    DateAdded:     now,
                }
            }
            found = true
            break
        }
    }
    if !found {
        updated = append(winners, WinningPlayerParsed{
            PlayerAddress: candidate.Index,
            WonCount:      candidate.WonCount,
            DateAdded:     now,
        })
    } else {
        updated = winners
    }
    SortWinners(updated)
    if LeaderboardWinnerLength < uint64(len(updated)) {
        updated = updated[:LeaderboardWinnerLength]
    }
    return updated
}

func (leaderboard *Leaderboard) UpdatePlayerInfoAtNow(now time.Time, candidate PlayerInfo) error {
    winners, err := leaderboard.ParseWinners()
    if err != nil {
        return err
    }
    updated := UpdatePlayerInfoAtNow(winners, now, candidate)
    leaderboard.Winners = StringifyWinners(updated)
    candidate.Index = "fake"
    return nil
}
```

## v2 leaderboard handling

You have created the leaderboard helper functions. In a separate file, add one last function to the keeper to implement the leaderboard. This function makes it possible to add a candidate winner and save the updated leaderboard:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/leaderboard_handler.go#L10-L21]
func (k *Keeper) MustAddToLeaderboard(ctx sdk.Context, winnerInfo types.PlayerInfo) types.Leaderboard {
    leaderboard, found := k.GetLeaderboard(ctx)
    if !found {
        panic("Leaderboard not found")
    }
    err := leaderboard.UpdatePlayerInfoAtNow(types.GetDateAdded(ctx), winnerInfo)
    if err != nil {
        panic(fmt.Sprintf(types.ErrCannotAddToLeaderboard.Error(), err.Error()))
    }
    k.SetLeaderboard(ctx, leaderboard)
    return leaderboard
}
```

<HighlightBox type="note">

Be aware of the new error [`ErrCannotAddToLeaderboard`](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/errors.go#L32).

</HighlightBox>

This completes most of the leaderboard preparation. The only task left is to call your new functions at the right junctures:

1. On a win:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_play_move.go#L80-L81]
    if storedGame.Winner == rules.NO_PLAYER.Color {
        ...
    } else {
        ...
        winnerInfo, _ := k.Keeper.MustRegisterPlayerWin(ctx, &storedGame)
        k.Keeper.MustAddToLeaderboard(ctx, winnerInfo)
    }
    ```

2. On a forfeit:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/end_block_server_game.go#L57-L58]
    if storedGame.MoveCount <= 1 {
        ...
    } else {
        ...
        winnerInfo, _ := k.MustRegisterPlayerForfeit(ctx, &storedGame)
        k.MustAddToLeaderboard(ctx, winnerInfo)
    }
    ```

Your leaderboard will now be updated and saved on an on-going basis as part of your v2 blockchain.

## Unit tests

With all these changes, it is worthwhile adding tests.

### Player info handling unit tests

Confirm with new tests that the player's information is created or updated on a win, a loss, and a forfeit. For instance, after a winning move:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_play_move_winner_test.go#L143-L206]
func TestCompleteGameAddPlayerInfo(t *testing.T) {
    msgServer, keeper, context, ctrl, escrow := setupMsgServerWithOneGameForPlayMove(t)
    ctx := sdk.UnwrapSDKContext(context)
    defer ctrl.Finish()
    escrow.ExpectAny(context)

    playAllMoves(t, msgServer, context, "1", game1Moves)

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

    playAllMoves(t, msgServer, context, "1", game1Moves)

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

You can add similar tests that confirm that nothing happens after a [game creation](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_create_game_test.go#L419-L498), a [reject](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_reject_game_test.go#L307-L381), or a [non-winning move](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_play_move_test.go#L538-L596). You should also check that a [forfeit is registered](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/end_block_server_game_test.go#L577-L682).

### Leaderboard handling unit tests

Start by adding tests that confirm that the sorting of the leaderboard's winners works as expected. Here an array of test cases is a good choice:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/leaderboard_test.go#L12-L152]
func TestSortStringifiedWinners(t *testing.T) {
    tests := []struct {
        name     string
        unsorted []types.WinningPlayer
        sorted   []types.WinningPlayer
        err      error
    }{
        {
            name: "cannot parse date",
            unsorted: []types.WinningPlayer{
                {
                    PlayerAddress: "alice",
                    WonCount:      2,
                    DateAdded:     "200T-01-02 15:05:05.999999999 +0000 UTC",
                },
            },
            sorted: []types.WinningPlayer{},
            err:    errors.New("dateAdded cannot be parsed: 200T-01-02 15:05:05.999999999 +0000 UTC: parsing time \"200T-01-02 15:05:05.999999999 +0000 UTC\" as \"2006-01-02 15:04:05.999999999 +0000 UTC\": cannot parse \"-01-02 15:05:05.999999999 +0000 UTC\" as \"2006\""),
        },
        ... // More test cases
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            leaderboard := types.Leaderboard{
                Winners: tt.unsorted,
            }
            parsed, err := leaderboard.ParseWinners()
            if tt.err != nil {
                require.EqualError(t, err, tt.err.Error())
            } else {
                require.NoError(t, err)
            }
            types.SortWinners(parsed)
            sorted := types.StringifyWinners(parsed)
            require.Equal(t, len(tt.sorted), len(sorted))
            require.EqualValues(t, tt.sorted, sorted)
        })
    }
}
```

With that done, you can confirm that the updating or addition of new player info to the leaderboard works as expected, again with an array of test cases:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/leaderboard_test.go#L154-L387]
func TestUpdatePlayerInfoAtNow(t *testing.T) {
    tests := []struct {
        name      string
        sorted    []types.WinningPlayer
        candidate types.PlayerInfo
        now       string
        expected  []types.WinningPlayer
    }{
        {
            name:   "add to empty",
            sorted: []types.WinningPlayer{},
            candidate: types.PlayerInfo{
                Index:    "alice",
                WonCount: 2,
            },
            now: "2006-01-02 15:05:05.999999999 +0000 UTC",
            expected: []types.WinningPlayer{
                {
                    PlayerAddress: "alice",
                    WonCount:      2,
                    DateAdded:     "2006-01-02 15:05:05.999999999 +0000 UTC",
                },
            },
        },
        ... // More test cases
    }
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            now, err := types.ParseDateAddedAsTime(tt.now)
            require.NoError(t, err)
            leaderboard := types.Leaderboard{
                Winners: tt.sorted,
            }
            err = leaderboard.UpdatePlayerInfoAtNow(now, tt.candidate)
            require.NoError(t, err)
            require.Equal(t, len(tt.expected), len(leaderboard.Winners))
            require.EqualValues(t, tt.expected, leaderboard.Winners)
            require.NoError(t, leaderboard.Validate())
        })
    }
}
```

Do not forget to also test at the length limit. For instance:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/types/leaderboard_test.go#L389-L416]
func makeMaxLengthSortedWinningPlayers() []types.WinningPlayer {
    sorted := make([]types.WinningPlayer, 100)
    for i := uint64(0); i < 100; i++ {
        sorted[i] = types.WinningPlayer{
            PlayerAddress: strconv.FormatUint(i, 10),
            WonCount:      101 - i,
            DateAdded:     "2006-01-02 15:05:05.999999999 +0000 UTC",
        }
    }
    return sorted
}

func TestUpdatePlayerInfoAtNowTooLongNoAdd(t *testing.T) {
    beforeWinners := makeMaxLengthSortedWinningPlayers()
    now, err := types.ParseDateAddedAsTime("2006-01-02 15:05:05.999999999 +0000 UTC")
    require.NoError(t, err)
    leaderboard := types.Leaderboard{
        Winners: beforeWinners,
    }
    err = leaderboard.UpdatePlayerInfoAtNow(now, types.PlayerInfo{
        Index:    "100",
        WonCount: 1,
    })
    require.NoError(t, err)
    require.Equal(t, len(beforeWinners), len(leaderboard.Winners))
    require.EqualValues(t, beforeWinners, leaderboard.Winners)
    require.NoError(t, leaderboard.Validate())
}
```

With the tests at the leaderboard level done, you can move to unit tests at the keeper level. Confirm that there are no changes on [creating a game](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_create_game_test.go#L500-L553), [rejecting one](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_reject_game_test.go#L383-L444), and on a [regular move](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_play_move_test.go#L598-L651).

Confirm that a new winner is either [added](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_play_move_winner_test.go#L208-L225) or updated in the leaderboard:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/msg_server_play_move_winner_test.go#L227-L257]
func TestCompleteGameLeaderboardUpdatedWinner(t *testing.T) {
    msgServer, keeper, context, ctrl, escrow := setupMsgServerWithOneGameForPlayMove(t)
    ctx := sdk.UnwrapSDKContext(context)
    defer ctrl.Finish()
    escrow.ExpectAny(context)
    keeper.SetPlayerInfo(ctx, types.PlayerInfo{
        Index:    bob,
        WonCount: 2,
    })
    keeper.SetLeaderboard(ctx, types.Leaderboard{
        Winners: []types.WinningPlayer{
            {
                PlayerAddress: bob,
                WonCount:      2,
                DateAdded:     "2006-01-02 15:05:06.999999999 +0000 UTC",
            },
        },
    })

    playAllMoves(t, msgServer, context, "1", game1Moves)

    leaderboard, found := keeper.GetLeaderboard(ctx)
    require.True(t, found)
    require.EqualValues(t, []types.WinningPlayer{
        {
            PlayerAddress: bob,
            WonCount:      3,
            DateAdded:     types.FormatDateAdded(types.GetDateAdded(ctx)),
        },
    }, leaderboard.Winners)
}
```

Now do the same on [a forfeit](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/end_block_server_game_test.go#L684-L794).

This completes your Checkers V2 chain. If you were to start it anew as is, it would work. However, you already have the V1 of Checkers running, so you need to migrate everything.

## v1 to v2 player information migration helper

With your v2 blockchain now fully operational on its own, it is time to work on the issue of stored data migration.

First, tackle the creation of player information. You will build the player information by extracting it from all the existing stored games. In the [map/reduce](https://en.wikipedia.org/wiki/MapReduce) parlance, you will _reduce_ this information from the stored games.

### Problem description

If performance was not an issue, an easy way to do it would be the following:

1. Call [`keeper.GetAllStoredGame()`](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/stored_game.go#L50) to get an array with all the games.
2. Keep only the games that have a winner.
3. Then for each game:
    1. Call `keeper.GetPlayerInfo` or, if that is not found, create player info, both for the black player and the red player.
    2. Do `+1` on `.WonCount` or `.LostCount` according to the `game.Winner` field.
    3. Call `keeper.SetPlayerInfo` for both black and red players.

Of course, given inevitable resource limitations, you would run into the following problems:

1. Getting all the games in a single array may not be possible, because your node's RAM may not be able to keep a million of them in memory. Or maybe it fails at 100,000 of them.
2. Calling `.GetPlayerInfo` and `.SetPlayerInfo` twice per game just to do `+1` adds up quickly. Remember that both of these calls are database calls. You could be confronted with a 12-hour job, during which your chain is offline.
3. Doing it all in a sequential manner would take even more time, as each blocking call blocks the whole process.

### Proposed solution

Fortunately, there exist ways to mitigate these limitations:

1. You do not need to get all the games at once. The [`keeper.StoredGameAll`](https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/keeper/grpc_query_stored_game.go#L14) function offers pagination. With this, you can limit the impact on the RAM requirement, at the expense of multiple queries.
2. Within each subset of games, you can compute in memory the player list and how many wins and losses each player has. With this _mapping_ done, you can add the (in-memory) intermediary `WonCount` and `LostCount` sums to each player's stored sums. With this, a `+1` is potentially replaced by a `+k`, at once reducing the number of calls to `.GetPlayerInfo` and `.SetPlayerInfo`.
3. You can separate the different calls and computations into [Go routines](https://gobyexample.com/goroutines) so that a blocking call does not prevent other computations from taking place in the meantime.

The routines will use **channels** to communicate between themselves and the main function:

1. A _stored-game_ channel, that will pass along chunks of games in the `[]types.StoredGame` format.
2. A _player-info_ channel, that will pass along intermediate computations of player information in the simple `types.PlayerInfo` format.
3. A _done_ channel, whose only purpose is to flag to the main function when all has been processed.

The processing **routines** will be divided as per the following:

1. The **game processing** routine will:
    
    * Receive separate arrays of games from the _stored-game_ channel.
    * Compute the aggregate player info records from them. I.e. **_map_**.
    * Send the results on the _player-info_ channel.

    Also, if it detects that no more games are coming, it will close the _player-info_ channel.

2. The **player info processing** routine will:

    * Receive individual player info records from the _player-info_ channel.
    * Fetch the existing (or not) corresponding player info from the store.
    * Update the won and lost counts, i.e. **_reduce_**. Remember, here it is doing `+= k`, not `+= 1`.
    * Save it back to the store.

    Also, if it detects that no more player info records are coming, it will flag it on the _done_ channel.

3. The **main function** will:

    * Launch the above 2 routines.
    * Fetch all games in paginated arrays.
    * Send the separate arrays on the _stored-game_ channel.
    * Close the _stored-game_ channel after the last array.
    * Wait for the flag on the _done_ channel.
    * Exit.

### Implementation

The player info processing will handle an in-memory map of player addresses to their information: `map[string]*types.PlayerInfo`. Create a new file to encapsulate this whole processing. Start by creating a helper that automatically populates it with empty values when information is missing:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v1tov2/migration_player_info.go#L11-L23]
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

Next, create the routine function to process the games:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v1tov2/migration_player_info.go#L25-L51]
func handleStoredGameChannel(ctx sdk.Context,
    k keeper.Keeper,
    gamesChannel <-chan []types.StoredGame,
    playerInfoChannel chan<- *types.PlayerInfo) {
    for games := range gamesChannel {
        playerInfos := make(map[string]*types.PlayerInfo, len(games))
        for _, game := range games {
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
            playerInfoChannel <- playerInfo
        }
    }
    close(playerInfoChannel)
}
```

<HighlightBox type="note">

This function can handle the edge case where black and red both refer to the same player.

</HighlightBox>

Create the routine function to process the player info:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v1tov2/migration_player_info.go#L53-L70]
func handlePlayerInfoChannel(ctx sdk.Context, k keeper.Keeper,
    playerInfoChannel <-chan *types.PlayerInfo,
    done chan<- bool) {
    for receivedInfo := range playerInfoChannel {
        if receivedInfo != nil {
            existingInfo, found := k.GetPlayerInfo(ctx, receivedInfo.Index)
            if found {
                existingInfo.WonCount += receivedInfo.WonCount
                existingInfo.LostCount += receivedInfo.LostCount
                existingInfo.ForfeitedCount += receivedInfo.ForfeitedCount
            } else {
                existingInfo = *receivedInfo
            }
            k.SetPlayerInfo(ctx, existingInfo)
        }
    }
    done <- true
}
```

Now you can create the main function:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v1tov2/migration_player_info.go#L72-L106]
func MapStoredGamesReduceToPlayerInfo(ctx sdk.Context, k keeper.Keeper, chunk uint64) error {
    context := sdk.WrapSDKContext(ctx)
    response, err := k.StoredGameAll(context, &types.QueryAllStoredGameRequest{
        Pagination: &query.PageRequest{
            Limit: chunk,
        },
    })
    if err != nil {
        return err
    }
    gamesChannel := make(chan []types.StoredGame)
    playerInfoChannel := make(chan *types.PlayerInfo)
    done := make(chan bool)

    go handleStoredGameChannel(ctx, k, gamesChannel, playerInfoChannel)
    go handlePlayerInfoChannel(ctx, k, playerInfoChannel, done)
    gamesChannel <- response.StoredGame

    for response.Pagination.NextKey != nil {
        response, err = k.StoredGameAll(context, &types.QueryAllStoredGameRequest{
            Pagination: &query.PageRequest{
                Key:   response.Pagination.NextKey,
                Limit: chunk,
            },
        })
        if err != nil {
            return err
        }
        gamesChannel <- response.StoredGame
    }
    close(gamesChannel)

    <-done
    return nil
}
```

## v1 to v2 leaderboard migration helper

You could decide to build the leaderboard as the player stats list is being built, mimicking the regular operation of your v2 checkers blockchain. Unfortunately, that would entail a lot of array sorting for what are just intermediate player stats. Instead, it is better to build the v2 leaderboard only after all player stats have been gathered.

In the process, there are two time-consuming parts:

1. Fetching the stored player info records in a paginated way, consuming mostly database resources.
2. Sorting each intermediate leaderboard, consuming mostly computation resources.

It looks beneficial to use a Go routine in this case too, and a _player info_ channel to pass along arrays of player info records.

In practice, repeatedly building the intermediate leaderboard means adding _k_ new `winningPlayerParsed` to the sorted array, sorting it, clipping it to `LeaderboardWinnerLength`, and repeating. What constitutes a good _k_ value should be dictated by testing and performance measurements. However, you can start with your best guess in a new file created for this purpose:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v1tov2/constants.go#L7]
const PlayerInfoChunkSize = types.LeaderboardWinnerLength * 2
```

### Implementation

Start by adding small helpers into a new file, so that you can easily append and sort player info records:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v1tov2/migration_leaderboard.go#L12-L37]
func addParsedCandidatesAndSort(parsedWinners []types.WinningPlayerParsed, candidates []types.WinningPlayerParsed) []types.WinningPlayerParsed {
    updated := append(parsedWinners, candidates...)
    types.SortWinners(updated)
    if types.LeaderboardWinnerLength < uint64(len(updated)) {
        updated = updated[:types.LeaderboardWinnerLength]
    }
    return updated
}

func AddCandidatesAndSortAtNow(parsedWinners []types.WinningPlayerParsed, now time.Time, playerInfos []types.PlayerInfo) []types.WinningPlayerParsed {
    parsedPlayers := make([]types.WinningPlayerParsed, 0, len(playerInfos))
    for _, playerInfo := range playerInfos {
        if playerInfo.WonCount > 0 {
            parsedPlayers = append(parsedPlayers, types.WinningPlayerParsed{
                PlayerAddress: playerInfo.Index,
                WonCount:      playerInfo.WonCount,
                DateAdded:     now,
            })
        }
    }
    return addParsedCandidatesAndSort(parsedWinners, parsedPlayers)
}

func AddCandidatesAndSort(parsedWinners []types.WinningPlayerParsed, ctx sdk.Context, playerInfos []types.PlayerInfo) []types.WinningPlayerParsed {
    return AddCandidatesAndSortAtNow(parsedWinners, types.GetDateAdded(ctx), playerInfos)
}
```

<HighlightBox type="note">

`addParsedCandidatesAndSort` is not exported because it already assumes that the `candidates` do not contain any with `WinCount == 0`. This is an assumption that is not enforced.

</HighlightBox>

With this, you can create the routine function that builds the leaderboard in memory and saves it to storage once at the end:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v1tov2/migration_leaderboard.go#L39-L51]
func handlePlayerInfosChannel(ctx sdk.Context, k keeper.Keeper,
    playerInfosChannel <-chan []types.PlayerInfo,
    done chan<- bool,
    chunk uint64) {
    winners := make([]types.WinningPlayerParsed, 0, types.LeaderboardWinnerLength+chunk)
    for receivedInfo := range playerInfosChannel {
        if receivedInfo != nil {
            winners = AddCandidatesAndSort(winners, ctx, receivedInfo)
        }
    }
    k.SetLeaderboard(ctx, types.CreateLeaderboardFromParsedWinners(winners))
    done <- true
}
```

<HighlightBox type="note">

The winners are initialized at a `0` size but with a capacity of `types.LeaderboardWinnerLength+chunk`, which is the expected maximum intermediate size it will reach. This initialization should ensure that the slice does not need to have its capacity increased mid-process.

</HighlightBox>

Declare the main function:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v1tov2/migration_leaderboard.go#L53-L85]
func MapPlayerInfosReduceToLeaderboard(ctx sdk.Context, k keeper.Keeper, chunk uint64) error {
    context := sdk.WrapSDKContext(ctx)
    response, err := k.PlayerInfoAll(context, &types.QueryAllPlayerInfoRequest{
        Pagination: &query.PageRequest{
            Limit: PlayerInfoChunkSize,
        },
    })
    if err != nil {
        return err
    }
    playerInfosChannel := make(chan []types.PlayerInfo)
    done := make(chan bool)

    go handlePlayerInfosChannel(ctx, k, playerInfosChannel, done, chunk)
    playerInfosChannel <- response.PlayerInfo

    for response.Pagination.NextKey != nil {
        response, err = k.PlayerInfoAll(context, &types.QueryAllPlayerInfoRequest{
            Pagination: &query.PageRequest{
                Key:   response.Pagination.NextKey,
                Limit: PlayerInfoChunkSize,
            },
        })
        if err != nil {
            return err
        }
        playerInfosChannel <- response.PlayerInfo
    }
    close(playerInfosChannel)

    <-done
    return nil
}
```

## v1 to v2 migration proper

The migration proper needs to execute the previous functions in a specific order. You can encapsulate this knowledge in a function:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v1tov2/migration.go#L8-L22]
func PerformMigration(ctx sdk.Context, k keeper.Keeper, storedGameChunk uint64, playerInfoChunk uint64) error {
    ctx.Logger().Info("Start to compute checkers games to player info calculation...")
    err := MapStoredGamesReduceToPlayerInfo(ctx, k, storedGameChunk)
    if err != nil {
        return err
    }
    ctx.Logger().Info("Checkers games to player info computation done")
    ctx.Logger().Info("Start to compute checkers player info to leaderboard calculation...")
    err = MapPlayerInfosReduceToLeaderboard(ctx, k, playerInfoChunk)
    if err != nil {
        return err
    }
    ctx.Logger().Info("Checkers player info to leaderboard computation done")
    return nil
}
```

<HighlightBox type="note">

This does not panic in case of an error. To avoid carrying on a faulty state, the caller of this function will have to handle the panic.

</HighlightBox>

You have in place the functions that will handle the store migration. Now you have to set up the chain of command for these functions to be called by the node at the right point in time.

### Consensus version and name

The `upgrade` module keeps in its store the [different module versions](https://docs.cosmos.network/main/core/upgrade.html#tracking-module-versions) that are currently running. To signal an upgrade, your module needs to return a different value when queried by the `upgrade` module. Change it from `2` to `3`, or whichever number works for you. First, keep both these values in their respective locations:

<CodeGroup>

<CodeGroupItem title="v1">

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v1/constants.go#L4]
const TargetConsensusVersion = 2
```

</CodeGroupItem>

<CodeGroupItem title="v2">

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/migrations/v2/constants.go#L4]
const TargetConsensusVersion = 3
```

</CodeGroupItem>

</CodeGroup>

<HighlightBox type="note">

The consensus version number bears no resemblance to v1 or v2. The consensus version number is for the module, whereas v1 or v2 is for the whole application.

</HighlightBox>

Now that you are in v2, have the module return it when asked:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/module.go#L175]
func (AppModule) ConsensusVersion() uint64 { return v2.TargetConsensusVersion }
```

You also have to pick a name for the upgrade you have prepared. This name will identify your specific upgrade when it is mentioned in a `Plan`, i.e. an upgrade governance proposal. This is a name relevant at the application level:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/app/upgrades/v1tov2/constants.go#L4]
const UpgradeName = "v1tov2"
```

You have to inform your app about:

1. The mapping between the consensus version(s) and the migration process(es).
2. The mapping between this name and the module(s) consensus versions.

Prepare these in turn.

### Callback in checkers module

Indicate that the checkers module needs to perform some upgrade steps when it is coming out of the old consensus version by calling `RegisterMigration`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/x/checkers/module.go#L146-L150]
func (am AppModule) RegisterServices(cfg module.Configurator) {
    ...
    if err := cfg.RegisterMigration(types.ModuleName, v1.TargetConsensusVersion, func(ctx sdk.Context) error {
        return v1tov2.PerformMigration(ctx, am.keeper, v1tov2.StoredGameChunkSize, v1tov2.PlayerInfoChunkSize)
    }); err != nil {
        panic(fmt.Errorf("failed to register migration of %s to v2: %w", types.ModuleName, err))
    }
}
```

Note it decides on the chunk sizes to use.

### Callback in `app`

The command that you are going to write needs a `Configurator`. This is already created as part of your `app` preparation but is not kept. Instead of recreating one, adjust your code to make it easily available. Add this field to your `app`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/app/app.go#L246]
type App struct {
    ...
    configurator module.Configurator
}
```

Now adjust the place where the configurator is created:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/app/app.go#L560-L561]
app.configurator = module.NewConfigurator(app.appCodec, app.MsgServiceRouter(), app.GRPCQueryRouter())
app.mm.RegisterServices(app.configurator)
```

Create a function that encapsulates knowledge about all possible upgrades, although there is a single one here. Since it includes _empty code_ for future use, avoid cluttering the already long `NewApp` function:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/app/app.go#L753-L785]
func (app *App) setupUpgradeHandlers() {
    // v1 to v2 upgrade handler
    app.UpgradeKeeper.SetUpgradeHandler(
        v1tov2.UpgradeName,
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
    case v1tov2.UpgradeName:
    }

    if storeUpgrades != nil {
        // configure store loader that checks if version == upgradeHeight and applies store upgrades
        app.SetStoreLoader(upgradetypes.UpgradeStoreLoader(upgradeInfo.Height, storeUpgrades))
    }
}
```

Now you are ready to inform the app proper. You do this towards the end, after the call to `app.SetEndBlocker` and before `if loadLatest`. At the correct location:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration/app/app.go#L610]
...
app.SetEndBlocker(app.EndBlocker)

app.setupUpgradeHandlers()

if loadLatest {
    ...
}
```

Be aware that the `monitoring` module added by Ignite causes difficulty when experimenting below with the CLI. To make it simple, you should remove [all references to `monitoring`](https://github.com/cosmos/b9-checkers-academy-draft/compare/leaderboard-handling..migration#diff-0f1d2976054440336a576d47a44a37b80cdf6701dd9113012bce0e3c425819b7L159) from `app.go`.

When done right, adding the callbacks is a short and easy solution.

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
* Check out the checkers v2 code.
* Build the v2 checkers executable.
* Run v2 checkers.
* Confirm that you now have a correct leaderboard.

Start your engines.

### Launch v1

In a shell, checkout v1 of checkers with the content of the CosmJS client work:

```sh
$ git checkout cosmjs-elements
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
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i go build -o release/v1/checkersd cmd/checkersd/main.go
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
$ docker create --name checkers -it \
    -v $(pwd):/checkers -w /checkers \
    -p 1317:1317 -p 4500:4500 -p 5000:5000 -p 26657:26657 \
    checkers_i
$ docker start checkers
$ docker exec -it checkers ./release/v1/checkersd keys add alice --keyring-backend test
$ docker exec -it checkers ./release/v1/checkersd keys add bob --keyring-backend test
```

<HighlightBox type="note">

You should not use `docker run --rm` here because, when `checkersd` stops, you do not want to remove the container and thereby destroy the saved keys, and future genesis too. Instead, you reuse them all in the next calls.

</HighlightBox>

</CodeGroupItem>

</CodeGroup>

Create a new genesis:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd init checkers
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers ./release/v1/checkersd init checkers
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
$ docker exec -it checkers ./release/v1/checkersd add-genesis-account \
    alice 200000000stake,20000token --keyring-backend test
$ docker exec -it checkers ./release/v1/checkersd add-genesis-account \
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
$ docker exec -it checkers jq '.app_state.gov.voting_params.voting_period' /root/.checkers/config/genesis.json
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
$ cat <<< $(jq '.app_state.gov.voting_params.voting_period = "600s"' ~/.checkers/config/genesis.json) > ~/.checkers/config/genesis.json
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c "cat <<< \$(jq '.app_state.gov.voting_params.voting_period = \"600s\"' /root/.checkers/config/genesis.json) > /root/.checkers/config/genesis.json"
```

</CodeGroupItem>

</CodeGroup>

You can confirm that the value is in using the earlier command.

Make Alice the chain's validator too by creating a genesis transaction modeled on that done by Ignite, as found in `config.yml`:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd gentx alice 100000000stake \
    --keyring-backend test --chain-id checkers
$ ./release/v1/checkersd collect-gentxs
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers ./release/v1/checkersd gentx alice 100000000stake \
    --keyring-backend test --chain-id checkers
$ docker exec -it checkers ./release/v1/checkersd collect-gentxs
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
$ docker exec -it checkers ./release/v1/checkersd start \
    --rpc.laddr "tcp://0.0.0.0:26657"
```

Note that you need to force the node to listen on all IP addresses, not just `127.0.0.1` as it would do by default.

</CodeGroupItem>

</CodeGroup>

From another shell, create a few un-played games with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ export alice=$(./release/v1/checkersd keys show alice -a)
$ export bob=$(./release/v1/checkersd keys show bob -a)
$ ./release/v1/checkersd tx checkers create-game \
    $alice $bob 10 stake \
    --from $alice --keyring-backend test --yes \
    --broadcast-mode block
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ export alice=$(docker exec checkers ./release/v1/checkersd keys show alice -a --keyring-backend test)
$ export bob=$(docker exec checkers ./release/v1/checkersd keys show bob -a --keyring-backend test)
$ docker exec -it checkers ./release/v1/checkersd tx checkers create-game \
    $alice $bob 10 stake \
    --from $alice --keyring-backend test --yes \
    --broadcast-mode block
```

</CodeGroupItem>

</CodeGroup>

<HighlightBox type="note">

The `--broadcast-mode block` flag means that you can fire up many such games by just copying the command without facing any sequence errors.

</HighlightBox>

To get a few complete games, you are going to run the [integration tests](https://github.com/cosmos/academy-checkers-ui/blob/server-indexing/test/integration/stored-game-action.ts) against it. These tests were built to run against a running chain started by Ignite. What is different here is that:

1. Blocks come slower, likely every five seconds instead of every one.
2. There are no longer any faucets.

Therefore, to be able to run these tests you need to attend to the above problems, respectively:

1. Adjust the timeout of each `before` and `it`. Make it `5*(the number of expected blocks + 1)`. 
   For instance, if you send 2 transactions that each go in a block, adjust [the timeout](https://github.com/cosmos/academy-checkers-ui/blob/server-indexing/test/integration/stored-game-action.ts#L84) to `15`: `this.timeout(15_000)`.
2. Adjust the `"credit test accounts"` `before`. Just `return` before the [first `await askFaucet`](https://github.com/cosmos/academy-checkers-ui/blob/server-indexing/test/integration/stored-game-action.ts#L65).

Now that you cannot call the faucet, you have to credit your test accounts with standard `bank send` transactions. You can use the same values as found in the `before`:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd tx bank send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 300stake --from $alice --keyring-backend test --broadcast-mode block --yes
$ ./release/v1/checkersd tx bank send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 10token --from $alice --keyring-backend test --broadcast-mode block --yes
$ ./release/v1/checkersd tx bank send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 300stake --from $bob --keyring-backend test --broadcast-mode block --yes
$ ./release/v1/checkersd tx bank send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 10token --from $bob --keyring-backend test --broadcast-mode block --yes
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers ./release/v1/checkersd tx bank send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 300stake --from $alice --keyring-backend test --broadcast-mode block --yes
$ docker exec -it checkers ./release/v1/checkersd tx bank send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 10token --from $alice --keyring-backend test --broadcast-mode block --yes
$ docker exec -it checkers ./release/v1/checkersd tx bank send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 300stake --from $bob --keyring-backend test --broadcast-mode block --yes
$ docker exec -it checkers ./release/v1/checkersd tx bank send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 10token --from $bob --keyring-backend test --broadcast-mode block --yes
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
$ docker run --rm -it -v $(pwd)/client:/client -w /client node:18.7 npm test
```

<HighlightBox type="note">

Do not forget to first adjust your `client/.env` file's `RPC_URL` address to be that of your computer, so that it can access across to the `checkers` container.

</HighlightBox>

</CodeGroupItem>

</CodeGroup>

You can confirm that you have a mix of complete and incomplete games:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd query checkers list-stored-game --output json | jq '.storedGame[] | { "index":.index, "winner":.winner }'
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c "./release/v1/checkersd query checkers list-stored-game --output json | jq '.storedGame[] | { \"index\":.index, \"winner\":.winner }'"
```

</CodeGroupItem>

</CodeGroup>

With enough games in the system, you can move to the software upgrade governance proposal.

### Governance proposal

For the software upgrade governance proposal, you want to make sure that it stops the chain not too far in the future but still after the voting period. With a voting period of 10 minutes, take 15 minutes. How many seconds does a block take?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ jq -r ".app_state.mint.params.blocks_per_year" ~/.checkers/config/genesis.json
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c 'jq -r ".app_state.mint.params.blocks_per_year" /root/.checkers/config/genesis.json'
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
$ ./release/v1/checkersd status | jq -r ".SyncInfo.latest_block_height"
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c './release/v1/checkersd status | jq -r ".SyncInfo.latest_block_height"'
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
$ jq ".app_state.gov.deposit_params.min_deposit" ~/.checkers/config/genesis.json
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c 'jq ".app_state.gov.deposit_params.min_deposit" /root/.checkers/config/genesis.json' 
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
$ ./release/v1/checkersd tx gov submit-proposal software-upgrade v1tov2 \
    --title "v1tov2" \
    --description "Increase engagement via the use of a leaderboard" \
    --from $alice --keyring-backend test --yes \
    --broadcast-mode block \
    --upgrade-height 1180 \
    --deposit 10000000stake
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers ./release/v1/checkersd tx gov submit-proposal software-upgrade v1tov2 \
    --title "v1tov2" \
    --description "Increase engagement via the use of a leaderboard" \
    --from $alice --keyring-backend test --yes \
    --broadcast-mode block \
    --upgrade-height 1180 \
    --deposit 10000000stake
```

</CodeGroupItem>

</CodeGroup>

This returns something with:

```txt
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
    --from $alice --keyring-backend test --yes
$ ./release/v1/checkersd tx gov vote 1 yes \
    --from $bob --keyring-backend test --yes
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers ./release/v1/checkersd tx gov vote 1 yes \
    --from $alice --keyring-backend test --yes
$ docker exec -it checkers ./release/v1/checkersd tx gov vote 1 yes \
    --from $bob --keyring-backend test --yes
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
$ docker exec -it checkers ./release/v1/checkersd query gov votes 1
```

</CodeGroupItem>

</CodeGroup>

It should print:

```txt
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
$ docker exec -it checkers ./release/v1/checkersd query gov proposal 1
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

```
...
6:29PM INF finalizing commit of block hash=E6CB6F1E8CF4699543950F756F3E15AE447701ABAC498CDBA86633AC93A73EE7 height=1180 module=consensus num_txs=0 root=21E51E52AA3F06BE59C78CE11D3171E6F7240D297E4BCEAB07FC5A87957B3BE2
6:29PM ERR UPGRADE "v1tov2" NEEDED at height: 1180: 
6:29PM ERR CONSENSUS FAILURE!!! err="UPGRADE \"v1tov2\" NEEDED at height: 1180: " module=consensus stack="goroutine 62 [running]:\nruntime/debug.Stack
...
6:29PM INF Stopping baseWAL service impl={"Logger":{}} module=consensus wal=/root/.checkers/data/cs.wal/wal
6:29PM INF Stopping Group service impl={"Dir":"/root/.checkers/data/cs.wal","Head":{"ID":"ZsAlN7DEZAbV:/root/.checkers/data/cs.wal/wal","Path":"/root/.checkers/data/cs.wal/wal"},"ID":"group:ZsAlN7DEZAbV:/root/.checkers/data/cs.wal/wal","Logger":{}} module=consensus wal=/root/.checkers/data/cs.wal/wal
...
```

At this point, run in another shell:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v1/checkersd status | jq -r ".SyncInfo.latest_block_height"
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c './release/v1/checkersd status | jq -r ".SyncInfo.latest_block_height"'
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
$ docker exec -it checkers cat /root/.checkers/data/upgrade-info.json
```

</CodeGroupItem>

</CodeGroup>

This prints:

```json
{"name":"v1tov2","height":1180}
```

With your node (and therefore your whole blockchain) down, you are ready to move to v2.

### Launch v2

With v1 stopped and its state saved, it is time to move to v2. Checkout v2 of checkers:

```sh
$ git checkout migration
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
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i go build -o ./release/v2/checkersd ./cmd/checkersd/main.go
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
$ docker exec -it checkers ./release/v2/checkersd start \
    --rpc.laddr "tcp://0.0.0.0:26657"
```

</CodeGroupItem>

</CodeGroup>

It should start and display something like:

```txt
...
7:06PM INF applying upgrade "v1tov2" at height: 342
7:06PM INF migrating module checkers from version 2 to version 3
7:06PM INF Start to compute checkers games to player info calculation...
7:06PM INF Checkers games to player info computation done
7:06PM INF Start to compute checkers player info to leaderboard calculation...
7:06PM INF Checkers player info to leaderboard computation done
...
```

After it has started, you can confirm in another shell that you have the expected leaderboard with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ./release/v2/checkersd query checkers show-leaderboard
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers ./release/v2/checkersd query checkers show-leaderboard
```

</CodeGroupItem>

</CodeGroup>

This should print something like:

```txt
Leaderboard:
  winners:
  - dateAdded: 2022-09-06 18:29:44.020323682 +0000 UTC
    playerAddress: cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql
    wonCount: "3"
```

Note how it took the time of the block when v1 stopped.

You can similarly confirm that the player info records are correctly saved. Congratulations, you have upgraded your blockchain almost as if in production.

Your checkers blockchain is done! It has a leaderboard, which was introduced later in production thanks to migrations.

You no doubt have many ideas about how to improve it. In particular, you could implement the missing _draw_ mechanism, which in effect has to be accepted by both players.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to add a leaderboard to an existing blockchain, and the characteristics that a good leaderboard should boast.
* How to upgrade a blockchain in production, by migrating from v1 of the blockchain to v2, and the new data structures that will be introduced by the upgrade. 
* How to handle the data migrations and logic upgrades implicit during migration, such as with the use of private helper functions.
* Worthwhile unit tests with regard to player info and leaderboard handling. 
* A complete procedure for how to conduct the update via the CLI.

</HighlightBox>

<!--

## Next up

It is time to move away from the checkers blockchain learning exercise, and explore another helpful tool for working with the Cosmos SDK: CosmWasm.

-->
