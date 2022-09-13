---
title: "EndBlock - Auto-Expiring Games"
order: 15
description: Enforce the expiration of games
tags: 
  - guided-coding
  - cosmos-sdk
---

# EndBlock - Auto-Expiring Games

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [ABCI](../2-main-concepts/architecture.md).
* Go is installed.
* You have the checkers blockchain codebase with the elements necessary for forfeit. If not, follow the [previous steps](./game-winner.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-winner).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Do begin block and end block operations.
* Forfeit games automatically.
* Do garbage collection.

</HighlightBox>

In the [previous section](./game-winner.md) you prepared the expiration of games:

* A First-In-First-Out (FIFO) that always has old games at its head and freshly updated games at its tail.
* A deadline field to guide the expiration.
* A winner field to further assist with forfeiting.

## New information

A game expires in two different situations:

1. It was never really played, so it is removed quietly. That includes a single move by a single player.
2. Moves were played by both players, making it a proper game, and forfeit is the outcome because a player then failed to play a move in time.

In the latter case, you want to emit a new event which differentiates forfeiting a game from a win involving a move. Therefore you define new error constants:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/types/keys.go#L63-L68]
const (
    GameForfeitedEventType      = "game-forfeited"
    GameForfeitedEventGameIndex = "game-index"
    GameForfeitedEventWinner    = "winner"
    GameForfeitedEventBoard     = "board"
)
```

## Putting callbacks in place

When you use Ignite CLI to scaffold your module, it creates the [`x/checkers/module.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/module.go) file with a lot of functions to accommodate your application. In particular, the function that **may** be called on your module on `EndBlock` is named `EndBlock`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/41ac3c6/x/checkers/module.go#L163-L165]
func (am AppModule) EndBlock(_ sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
    return []abci.ValidatorUpdate{}
}
```

Ignite CLI left this empty. It is here that you add what you need done right before the block gets sealed. Create a new file named `x/checkers/keeper/end_block_server_game.go` to encapsulate the knowledge about game expiry. Leave your function empty for now:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L12]
func (k Keeper) ForfeitExpiredGames(goCtx context.Context) {
    // TODO
}
```

In `x/checkers/module.go` update `EndBlock` with:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/module.go#L173-L176]
func (am AppModule) EndBlock(ctx sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
    am.keeper.ForfeitExpiredGames(sdk.WrapSDKContext(ctx))
    return []abci.ValidatorUpdate{}
}
```

This ensures that **if** your module's `EndBlock` function is called the expired games will be handled. For the **whole application to call your module** you have to instruct it to do so. This takes place in `app/app.go`, where the application is initialized with the proper order to call the `EndBlock` functions in different modules. In fact, yours has already been placed at the end by Ignite:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/app/app.go#L493]
app.mm.SetOrderEndBlockers(
    crisistypes.ModuleName,
    ...
    checkersmoduletypes.ModuleName,
)
```

Your `ForfeitExpiredGames` function will now be called at the end of each block.

Also prepare a new error:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/types/errors.go#L22]
ErrCannotFindWinnerByColor = sdkerrors.Register(ModuleName, 1111, "cannot find winner by color: %s")
```

## Expire games handler

With the callbacks in place, it is time to code the expiration properly.

### Prepare the main loop

In `ForfeitExpiredGames`, it is a matter of looping through the FIFO, starting from the head, and handling games that are expired. You can stop at the first active game, as all those that come after are also active thanks to the careful updating of the FIFO.

1. Prepare useful information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L13-L18]
    ctx := sdk.UnwrapSDKContext(goCtx)

    opponents := map[string]string{
        rules.PieceStrings[rules.BLACK_PLAYER]: rules.PieceStrings[rules.RED_PLAYER],
        rules.PieceStrings[rules.RED_PLAYER]:   rules.PieceStrings[rules.BLACK_PLAYER],
    }
    ```

2. Initialize the parameters before entering the loop:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L21-L27]
    systemInfo, found := k.GetSystemInfo(ctx)
    if !found {
        panic("SystemInfo not found")
    }

    gameIndex := systemInfo.FifoHeadIndex
    var storedGame types.StoredGame
    ```

3. Enter the loop:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L28]
    for {
        // TODO
    }
    ```

    See below for what goes in this `TODO`.

4. After the loop has ended do not forget to save the latest FIFO state:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L68]
    k.SetSystemInfo(ctx, systemInfo)
    ```

So what goes in the `for { TODO }`?

### Identify an expired game

1. Start with a loop breaking condition, if your cursor has reached the end of the FIFO:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L30-L32]
    if gameIndex == types.NoFifoIndex {
        break
    }
    ```

2. Fetch the expired game candidate and its deadline:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L34-L41]
    storedGame, found = k.GetStoredGame(ctx, gameIndex)
    if !found {
        panic("Fifo head game not found " + systemInfo.FifoHeadIndex)
    }
    deadline, err := storedGame.GetDeadlineAsTime()
    if err != nil {
        panic(err)
    }
    ```

3. Test for expiration:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L41]
    if deadline.Before(ctx.BlockTime()) {
        // TODO
    } else {
        // All other games after are active anyway
        break
    }
    ```

Now, what goes into this `if "expired" { TODO }`?

### Handle an expired game

1. If the game has expired, remove it from the FIFO:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L43]
    k.RemoveFromFifo(ctx, &storedGame, &systemInfo)
    ```

2. Check whether the game is worth keeping. If it is, set the winner as the opponent of the player whose turn it is, remove the board, and save:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L44-L55]
    lastBoard := storedGame.Board
    if storedGame.MoveCount <= 1 {
        // No point in keeping a game that was never really played
        k.RemoveStoredGame(ctx, gameIndex)
    } else {
        storedGame.Winner, found = opponents[storedGame.Turn]
        if !found {
            panic(fmt.Sprintf(types.ErrCannotFindWinnerByColor.Error(), storedGame.Turn))
        }
        storedGame.Board = ""
        k.SetStoredGame(ctx, storedGame)
    }
    ```

3. Emit the relevant event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L56-L62]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(types.GameForfeitedEventType,
            sdk.NewAttribute(types.GameForfeitedEventGameIndex, gameIndex),
            sdk.NewAttribute(types.GameForfeitedEventWinner, storedGame.Winner),
            sdk.NewAttribute(types.GameForfeitedEventBoard, lastBoard),
        ),
    )
    ```

4. Move along the FIFO for the next run of the loop:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game.go#L64]
    gameIndex = systemInfo.FifoHeadIndex
    ```

<HighlightBox type="tip">

For an explanation as to why this setup is resistant to an attack from an unbounded number of expired games, see the [section on the game's FIFO](./game-fifo.md).

</HighlightBox>

## Unit tests

How do you test something that is supposed to happen during the `EndBlock` event? You call the function that will be called within `EndBlock` (i.e. `Keeper.ForfeitExpiredGames`). Create a new test file `end_block_server_game_test.go` for your tests. The situations that you can test are:

1. A game was never played, while alone in the state [or not](https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game_test.go#L44-L79). Or [two games](https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game_test.go#L81-L130) were never played. In this case, you need to confirm that the game was fully deleted, and that an event was emitted with no winners:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game_test.go#L12-L42]
    func TestForfeitUnplayed(t *testing.T) {
        _, keeper, context := setupMsgServerWithOneGameForPlayMove(t)
        ctx := sdk.UnwrapSDKContext(context)
        game1, found := keeper.GetStoredGame(ctx, "1")
        require.True(t, found)
        game1.Deadline = types.FormatDeadline(ctx.BlockTime().Add(time.Duration(-1)))
        keeper.SetStoredGame(ctx, game1)
        keeper.ForfeitExpiredGames(context)

        _, found = keeper.GetStoredGame(ctx, "1")
        require.False(t, found)

        systemInfo, found := keeper.GetSystemInfo(ctx)
        require.True(t, found)
        require.EqualValues(t, types.SystemInfo{
            NextId:        2,
            FifoHeadIndex: "-1",
            FifoTailIndex: "-1",
        }, systemInfo)
        events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
        require.Len(t, events, 2)
        event := events[0]
        require.EqualValues(t, sdk.StringEvent{
            Type: "game-forfeited",
            Attributes: []sdk.Attribute{
                {Key: "game-index", Value: "1"},
                {Key: "winner", Value: "*"},
                {Key: "board", Value: "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*"},
            },
        }, event)
    }
    ```

2. A game was played with only one move, while alone in the state [or not](https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game_test.go#L172-L215). Or [two games](https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game_test.go#L217-L283) were played in this way. In this case, you need to confirm that the game was fully deleted, and that an event was emitted with no winners:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game_test.go#L132-L170]
    func TestForfeitPlayedOnce(t *testing.T) {
        msgServer, keeper, context := setupMsgServerWithOneGameForPlayMove(t)
        ctx := sdk.UnwrapSDKContext(context)
        msgServer.PlayMove(context, &types.MsgPlayMove{
            Creator:   bob,
            GameIndex: "1",
            FromX:     1,
            FromY:     2,
            ToX:       2,
            ToY:       3,
        })
        game1, found := keeper.GetStoredGame(ctx, "1")
        require.True(t, found)
        game1.Deadline = types.FormatDeadline(ctx.BlockTime().Add(time.Duration(-1)))
        keeper.SetStoredGame(ctx, game1)
        keeper.ForfeitExpiredGames(context)

        _, found = keeper.GetStoredGame(ctx, "1")
        require.False(t, found)

        systemInfo, found := keeper.GetSystemInfo(ctx)
        require.True(t, found)
        require.EqualValues(t, types.SystemInfo{
            NextId:        2,
            FifoHeadIndex: "-1",
            FifoTailIndex: "-1",
        }, systemInfo)
        events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
        require.Len(t, events, 3)
        event := events[0]
        require.EqualValues(t, sdk.StringEvent{
            Type: "game-forfeited",
            Attributes: []sdk.Attribute{
                {Key: "game-index", Value: "1"},
                {Key: "winner", Value: "*"},
                {Key: "board", Value: "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|********|r*r*r*r*|*r*r*r*r|r*r*r*r*"},
            },
        }, event)
    }
    ```

3. A game was played with at least two moves, while alone in the state [or not](https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game_test.go#L346-L410). Or [two games](https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game_test.go#L412-L520) were played in this way. In this case, you need to confirm the game was not deleted, and instead that a winner was announced, including in events:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/keeper/end_block_server_game_test.go#L285-L344]
    func TestForfeitPlayedTwice(t *testing.T) {
        msgServer, keeper, context := setupMsgServerWithOneGameForPlayMove(t)
        ctx := sdk.UnwrapSDKContext(context)
        msgServer.PlayMove(context, &types.MsgPlayMove{
            Creator:   bob,
            GameIndex: "1",
            FromX:     1,
            FromY:     2,
            ToX:       2,
            ToY:       3,
        })
        msgServer.PlayMove(context, &types.MsgPlayMove{
            Creator:   carol,
            GameIndex: "1",
            FromX:     0,
            FromY:     5,
            ToX:       1,
            ToY:       4,
        })
        game1, found := keeper.GetStoredGame(ctx, "1")
        require.True(t, found)
        oldDeadline := types.FormatDeadline(ctx.BlockTime().Add(time.Duration(-1)))
        game1.Deadline = oldDeadline
        keeper.SetStoredGame(ctx, game1)
        keeper.ForfeitExpiredGames(context)

        game1, found = keeper.GetStoredGame(ctx, "1")
        require.True(t, found)
        require.EqualValues(t, types.StoredGame{
            Index:       "1",
            Board:       "",
            Turn:        "b",
            Black:       bob,
            Red:         carol,
            MoveCount:   uint64(2),
            BeforeIndex: "-1",
            AfterIndex:  "-1",
            Deadline:    oldDeadline,
            Winner:      "r",
        }, game1)

        systemInfo, found := keeper.GetSystemInfo(ctx)
        require.True(t, found)
        require.EqualValues(t, types.SystemInfo{
            NextId:        2,
            FifoHeadIndex: "-1",
            FifoTailIndex: "-1",
        }, systemInfo)
        events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
        require.Len(t, events, 3)
        event := events[0]
        require.EqualValues(t, sdk.StringEvent{
            Type: "game-forfeited",
            Attributes: []sdk.Attribute{
                {Key: "game-index", Value: "1"},
                {Key: "winner", Value: "r"},
                {Key: "board", Value: "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|*r******|**r*r*r*|*r*r*r*r|r*r*r*r*"},
            },
        }, event)
    }
    ```

<HighlightBox type="note">

Note how all the attributes of an event of a given type (such as `"game-forfeited"`) aggregate in a single array. The context is not reset on a new transaction, so when testing attributes you either have to compare the full array or take slices to compare what matters.

</HighlightBox>

## Interact via the CLI

Currently, the game expiry is one day in the future. This is too long to test with the CLI. Temporarily set it to 5 minutes:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/forfeit-game/x/checkers/types/keys.go#L58]
MaxTurnDuration = time.Duration(5 * 60 * 1000_000_000) // 5 minutes
```

Avoid having games in the FIFO that expire in a day because of your earlier tests:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite chain serve --reset-once
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it --name checkers -v $(pwd):/checkers -w /checkers checkers_i ignite chain serve --reset-once
```

</CodeGroupItem>

</CodeGroup>

Export your aliases again:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ export alice=$(checkersd keys show alice -a)
$ export bob=$(checkersd keys show bob -a)
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ export alice=$(docker exec checkers checkersd keys show alice -a)
$ export bob=$(docker exec checkers checkersd keys show bob -a)
```

</CodeGroupItem>

</CodeGroup>

Create three games one minute apart. Have Alice play the middle one, and both Alice and Bob play the last one:

<PanelList>

<PanelListItem number="1">

First game:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $alice
```

</CodeGroupItem>

</CodeGroup>

</PanelListItem>

<PanelListItem number="2">

Wait a minute, then create your second game and play it:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $bob
$ checkersd tx checkers play-move 2 1 2 2 3 --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $bob
$ docker exec -it checkers checkersd tx checkers play-move 2 1 2 2 3 --from $alice
```

</CodeGroupItem>

</CodeGroup>

</PanelListItem>

<PanelListItem number="3" :last="true">

Wait another minute, then create your third game and play on it:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
$ checkersd tx checkers play-move 3 1 2 2 3 --from $alice
$ checkersd tx checkers play-move 3 0 5 1 4 --from $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $alice
$ docker exec -it checkers checkersd tx checkers play-move 3 1 2 2 3 --from $alice
$ docker exec -it checkers checkersd tx checkers play-move 3 0 5 1 4 --from $bob
```

</CodeGroupItem>

</CodeGroup>

</PanelListItem>

</PanelList>

Space each `tx` command from a given account by a couple of seconds so that they each go into a different block - by default `checkersd` is limited because it uses the account's transaction sequence number by fetching it from the current state.

<HighlightBox type="tip">

If you want to overcome this limitation, look at `checkersd`'s `--sequence` flag:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game --help
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game --help
```

</CodeGroupItem>

</CodeGroup>

And at your account's current sequence. For instance:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query account $alice --output json | jq -r '.sequence'
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c "checkersd query account $alice --output json | jq -r '.sequence'"
```

</CodeGroupItem>

</CodeGroup>

Which returns something like:

```json
9
```

</HighlightBox>

With three games in, confirm that you see them all:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers list-stored-game
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers list-stored-game
```

</CodeGroupItem>

</CodeGroup>

List them again after two, three, four, and five minutes. You should see games `1` and `2` disappear, and game `3` being forfeited by Alice, i.e. `red` Bob wins:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers show-stored-game 3 --output json | jq '.storedGame.winner'
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c "checkersd query checkers show-stored-game 3 --output json | jq '.storedGame.winner'"
```

</CodeGroupItem>

</CodeGroup>

This prints:

```json
"r"
```

Confirm that the FIFO no longer references the removed games nor the forfeited game:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers show-system-info
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers show-system-info
```

</CodeGroupItem>

</CodeGroup>

This should show:

```txt
SystemInfo:
  fifoHeadIndex: "-1"
  fifoTailIndex: "-1"
  nextId: "4"
```

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How games can expire under two conditions: when the game never really begins or only one player makes an opening move, in which case it is removed quietly; or when both players have participated but one has since failed to play a move in time, in which case the game is forfeited.
* What new information and functions need to be created, and to update `EndBlock` to call the `ForfeitExpiredGames` function at the end of each block.
* The correct coding for how to prepare the main loop through the FIFO, identify an expired game, and handle an expired game. 
* How to test your code to ensure that it functions as desired.
* How to interact with the CLI to check the effectiveness of your code for handling expired games.

</HighlightBox>

<!--## Next up

With no games staying in limbo forever, the project is now ready to use token wagers. These are introduced in the [next section](./game-wager.md).-->
