---
title: "EndBlock - Auto-Expiring Games"
order: 15
description: Enforce the expiration of games
tag: deep-dive
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/types/keys.go#L66-L70]
const (
    ForfeitGameEventKey     = "GameForfeited"
    ForfeitGameEventIdValue = "IdValue"
    ForfeitGameEventWinner  = "Winner"
)
```

## Putting callbacks in place

When you use Ignite CLI to scaffold your module, it creates the [`x/checkers/module.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/41ac3c6/x/checkers/module.go) file with a lot of functions to accommodate your application. In particular, the function that **may** be called on your module on `EndBlock` is named `EndBlock`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/41ac3c6/x/checkers/module.go#L163-L165]
func (am AppModule) EndBlock(_ sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
    return []abci.ValidatorUpdate{}
}
```

Ignite CLI left this empty. It is here that you add what you need done right before the block gets sealed. Create a new file named `x/checkers/keeper/end_block_server_game.go` to encapsulate the knowledge about game expiry. Leave your function empty for now:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L13]
func (k Keeper) ForfeitExpiredGames(goCtx context.Context) {
    // TODO
}
```

In `x/checkers/module.go` update `EndBlock` with:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/module.go#L163-L166]
func (am AppModule) EndBlock(ctx sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
    am.keeper.ForfeitExpiredGames(sdk.WrapSDKContext(ctx))
    return []abci.ValidatorUpdate{}
}
```

This ensures that **if** your module's `EndBlock` function is called the expired games will be handled. For the **whole application to call your module** you have to instruct it to do so. This takes place in `app/app.go`, where the application is initialized with the proper order to call the `EndBlock` functions in different modules. Add yours at the end:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/app/app.go#L398]
app.mm.SetOrderEndBlockers(crisistypes.ModuleName, govtypes.ModuleName, stakingtypes.ModuleName, checkersmoduletypes.ModuleName)
```

Your `ForfeitExpiredGames` function will now be called at the end of each block.

## Expire games handler

With the callbacks in place, it is time to code the expiration properly.

### Prepare the main loop

In `ForfeitExpiredGames`, it is a matter of looping through the FIFO, starting from the head, and handling games that are expired. You can stop at the first active game, as all those that come after are also active thanks to the careful updating of the FIFO.

1. Prepare useful information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L14-L19]
    ctx := sdk.UnwrapSDKContext(goCtx)

    opponents := map[string]string{
        rules.PieceStrings[rules.BLACK_PLAYER]: rules.PieceStrings[rules.RED_PLAYER],
        rules.PieceStrings[rules.RED_PLAYER]:   rules.PieceStrings[rules.BLACK_PLAYER],
    }
    ```

2. Initialize the parameters before entering the loop:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L22-L28]
    nextGame, found := k.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    storedGameId := nextGame.FifoHead
    var storedGame types.StoredGame
    ```

3. Enter the loop:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L29]
    for {
        // TODO
    }
    ```

    See below for what goes in `TODO`.

4. After the loop has ended do not forget to save the latest FIFO state:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L71]
    k.SetNextGame(ctx, nextGame)
    ```

So what goes in the `for { TODO }`?

### Identify an expired game

1. Start with a loop breaking condition, if your cursor has reached the end of the FIFO:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L31-L33]
    if strings.Compare(storedGameId, types.NoFifoIdKey) == 0 {
        break
    }
    ```

2. Fetch the expired game candidate and its deadline:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L34-L41]
    storedGame, found = k.GetStoredGame(ctx, storedGameId)
    if !found {
         panic("Fifo head game not found " + nextGame.FifoHead)
    }
    deadline, err := storedGame.GetDeadlineAsTime()
    if err != nil {
        panic(err)
    }
    ```

3. Test for expiration:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L42]
    if deadline.Before(ctx.BlockTime()) {
        // TODO
    } else {
        // All other games come after anyway
        break
    }
    ```

Now, what goes into this `if "expired" { TODO }`?

### Handle an expired game

1. If the game has expired, remove it from the FIFO:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L44]
    k.RemoveFromFifo(ctx, &storedGame, &nextGame)
    ```

2. Check whether the game is worth keeping. If it is, set the winner as the opponent of the player whose turn it is and save:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L45-L54]
    if storedGame.MoveCount <= 1 {
        // No point in keeping a game that was never really played
        k.RemoveStoredGame(ctx, storedGameId)
    } else {
        storedGame.Winner, found = opponents[storedGame.Turn]
        if !found {
            panic(fmt.Sprintf(types.ErrCannotFindWinnerByColor.Error(), storedGame.Turn))
        }
        k.SetStoredGame(ctx, storedGame)
    }
    ```

3. Emit the relevant event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L55-L62]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            sdk.NewAttribute(sdk.AttributeKeyModule, types.ModuleName),
            sdk.NewAttribute(sdk.AttributeKeyAction, types.ForfeitGameEventKey),
            sdk.NewAttribute(types.ForfeitGameEventIdValue, storedGameId),
            sdk.NewAttribute(types.ForfeitGameEventWinner, storedGame.Winner),
        ),
    )
    ```

4. Move along the FIFO for the next run of the loop:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game.go#L64]
    storedGameId = nextGame.FifoHead
    ```

<HighlightBox type="tip">

For an explanation as to why this setup is resistant to an attack from an unbounded number of expired games, see the [section on the game's FIFO](./game-fifo.md).

</HighlightBox>

## Unit tests

How do you test something that is supposed to happen during the `EndBlock` event? You call the function that will be called within `EndBlock` (i.e. `Keeper.ForfeitExpiredGames`). Create a new test file `end_block_server_game_test.go` for your tests. The situations that you can test are:

1. A game was never played, while alone in the state [or not](https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game_test.go#L44-L79). Or [two games](https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game_test.go#L81-L133) were never played. In this case, you need to confirm that the game was fully deleted, and that an event was emitted with no winners:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game_test.go#L12-L42]
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

        nextGame, found := keeper.GetNextGame(ctx)
        require.True(t, found)
        require.EqualValues(t, types.NextGame{
            Creator:  "",
            IdValue:  2,
            FifoHead: "-1",
            FifoTail: "-1",
        }, nextGame)
        events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
        require.Len(t, events, 1)
        event := events[0]
        require.Equal(t, event.Type, "message")
        require.EqualValues(t, []sdk.Attribute{
            {Key: "module", Value: "checkers"},
            {Key: "action", Value: "GameForfeited"},
            {Key: "IdValue", Value: "1"},
            {Key: "Winner", Value: "*"},
        }, event.Attributes[6:])
    }
    ```

2. A game was played with only one move, while alone in the state [or not](https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game_test.go#L175-L218). Or [two games](https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game_test.go#L220-L288) were played in this way. In this case, you need to confirm that the game was fully deleted, and that an event was emitted with no winners:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game_test.go#L135-L173]
    func TestForfeitPlayedOnce(t *testing.T) {
        msgServer, keeper, context := setupMsgServerWithOneGameForPlayMove(t)
        msgServer.PlayMove(context, &types.MsgPlayMove{
            Creator: carol,
            IdValue: "1",
            FromX:   1,
            FromY:   2,
            ToX:     2,
            ToY:     3,
        })
        ctx := sdk.UnwrapSDKContext(context)
        game1, found := keeper.GetStoredGame(ctx, "1")
        require.True(t, found)
        game1.Deadline = types.FormatDeadline(ctx.BlockTime().Add(time.Duration(-1)))
        keeper.SetStoredGame(ctx, game1)
        keeper.ForfeitExpiredGames(context)

        _, found = keeper.GetStoredGame(ctx, "1")
        require.False(t, found)

        nextGame, found := keeper.GetNextGame(ctx)
        require.True(t, found)
        require.EqualValues(t, types.NextGame{
            Creator:  "",
            IdValue:  2,
            FifoHead: "-1",
            FifoTail: "-1",
        }, nextGame)
        events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
        require.Len(t, events, 1)
        event := events[0]
        require.Equal(t, event.Type, "message")
        require.EqualValues(t, []sdk.Attribute{
            {Key: "module", Value: "checkers"},
            {Key: "action", Value: "GameForfeited"},
            {Key: "IdValue", Value: "1"},
            {Key: "Winner", Value: "*"},
        }, event.Attributes[13:])
    }
    ```

3. A game was played with at least two moves, while alone in the state [or not](https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game_test.go#L352-L417). Or [two games](https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game_test.go#L419-L532) were played in this way. In this case, you need to confirm the game was not deleted, and instead that a winner was announced, including in events:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/keeper/end_block_server_game_test.go#L290-L350]
    func TestForfeitPlayedTwice(t *testing.T) {
        msgServer, keeper, context := setupMsgServerWithOneGameForPlayMove(t)
        msgServer.PlayMove(context, &types.MsgPlayMove{
            Creator: carol,
            IdValue: "1",
            FromX:   1,
            FromY:   2,
            ToX:     2,
            ToY:     3,
        })
        msgServer.PlayMove(context, &types.MsgPlayMove{
            Creator: bob,
            IdValue: "1",
            FromX:   0,
            FromY:   5,
            ToX:     1,
            ToY:     4,
        })
        ctx := sdk.UnwrapSDKContext(context)
        game1, found := keeper.GetStoredGame(ctx, "1")
        require.True(t, found)
        oldDeadline := types.FormatDeadline(ctx.BlockTime().Add(time.Duration(-1)))
        game1.Deadline = oldDeadline
        keeper.SetStoredGame(ctx, game1)
        keeper.ForfeitExpiredGames(context)

        game1, found = keeper.GetStoredGame(ctx, "1")
        require.True(t, found)
        require.EqualValues(t, types.StoredGame{
            Creator:   alice,
            Index:     "1",
            Game:      "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|*r******|**r*r*r*|*r*r*r*r|r*r*r*r*",
            Turn:      "b",
            Red:       bob,
            Black:     carol,
            MoveCount: uint64(2),
            BeforeId:  "-1",
            AfterId:   "-1",
            Deadline:  oldDeadline,
            Winner:    "r",
        }, game1)

        nextGame, found := keeper.GetNextGame(ctx)
        require.True(t, found)
        require.EqualValues(t, types.NextGame{
            Creator:  "",
            IdValue:  2,
            FifoHead: "-1",
            FifoTail: "-1",
        }, nextGame)
        events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
        require.Len(t, events, 1)
        event := events[0]
        require.Equal(t, event.Type, "message")
        require.EqualValues(t, []sdk.Attribute{
            {Key: "module", Value: "checkers"},
            {Key: "action", Value: "GameForfeited"},
            {Key: "IdValue", Value: "1"},
            {Key: "Winner", Value: "r"},
        }, event.Attributes[20:])
    }
    ```

<HighlightBox type="info">

Note how all the events aggregate in a single context. The context is not reset on a new transaction, so you have to take slices to compare what matters. One _create_ adds 6 attributes, one _play_ adds 7.

</HighlightBox>

## Interact via the CLI

Currently, the game expiry is one day in the future. This is too long to test with the CLI. Temporarily set it to 5 minutes:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/43ec310b/x/checkers/types/keys.go#L38]
MaxTurnDuration = time.Duration(5 * 60 * 1000_000_000) // 5 minutes
```

Avoid having games in the FIFO that expire in a day because of your earlier tests:

```sh
$ ignite chain serve --reset-once
```

Export your aliases again:

```sh
$ export alice=$(checkersd keys show alice -a)
$ export bob=$(checkersd keys show bob -a)
```

Create three games 1 minute apart. Have Bob play the middle one, and both Alice and Bob play the last one:

<CodeGroup>
<CodeGroupItem title="Game 1" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
```

</CodeGroupItem>
<CodeGroupItem title="Game 2">

```sh
# Wait a minute
$ checkersd tx checkers create-game $alice $bob --from $bob
# Wait 5 seconds
$ checkersd tx checkers play-move 2 1 2 2 3 --from $bob
```

</CodeGroupItem>
<CodeGroupItem title="Game 3">

```sh
# Wait a minute
$ checkersd tx checkers create-game $alice $bob --from $alice
$ checkersd tx checkers play-move 3 1 2 2 3 --from $bob
# Wait 5 seconds
$ checkersd tx checkers play-move 3 0 5 1 4 --from $alice
```

</CodeGroupItem>
</CodeGroup>

---

Space each `tx` command from a given account by a couple of seconds so that they each go into a different block - by default `checkersd` is limited because it uses the account's transaction sequence number by fetching it from the current state.

<HighlightBox type="tip">

If you want to overcome this limitation, look at `checkersd`'s `--sequence` flag:

```sh
$ checkersd tx checkers create-game --help
```

And at your account's current sequence. For instance:

```sh
$ checkersd query account $alice --output json | jq ".sequence"
```

Which returns something like:

```json
"9"
```

</HighlightBox>

With three games in, confirm that you see them all:

```sh
$ checkersd query checkers list-stored-game
```

List them again after 2, 3, 4, and 5 minutes. You should see games `1` and `2` disappear, and game `3` being forfeited by Bob, i.e. `red` Alice wins:

```sh
$ checkersd query checkers show-stored-game 3 --output json | jq ".StoredGame.winner"
```

This prints:

```json
"red"
```

Confirm that the FIFO no longer references the removed games nor the forfeited game:

```sh
$ checkersd query checkers show-next-game
```

This should show:

```
NextGame:
  creator: ""
  fifoHead: "-1"
  fifoTail: "-1"
  idValue: "4"
```

## Next up

With no games staying in limbo forever, the project is now ready to use token wagers. These are introduced in the [next section](./game-wager.md).
