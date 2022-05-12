---
title: EndBlock - Auto-expiring Games
order: 14
description: You enforce the expiration of games
tag: deep-dive
---

# EndBlock - Auto-expiring Games

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [ABCI](../2-main-concepts/architecture.md).
* Go is installed.
* You have the checkers blockchain codebase with the elements necessary for forfeit. If not, follow the [previous steps](./game-winner.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-winner).

</HighlightBox>

In the [previous section](./game-winner.md) you prepared expiration of games:

* A First-In-First-Out (FIFO) that always has old games at its head and freshly updated games at its tail.
* A deadline field to guide the expiration.
* A winner field to further assist with forfeiting.

## New information

A game expires in two different situations:

1. Not more than a single move was ever played, so at least one player failed to express their interest in the game. The game is removed quietly.
2. Two or more moves were played, making it a proper game, and the outcome is a forfeit because one player failed to play in time.

In the latter case, you want to emit a new event which differentiates forfeiting a game from a win involving a move. Therefore you define new error constants:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/types/keys.go#L66-L70]
const (
    ForfeitGameEventKey     = "GameForfeited"
    ForfeitGameEventIdValue = "IdValue"
    ForfeitGameEventWinner  = "Winner"
)
```

## Putting callbacks in place

When you use Ignite CLI to scaffold your module, it creates the [`x/checkers/module.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/41ac3c6ef4b2deb996e54f18f597b24fafbf02e1/x/checkers/module.go) file with a lot of functions to accommodate your application. In particular, the function that **may** be called on your module on `EndBlock` is named `EndBlock`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/41ac3c6ef4b2deb996e54f18f597b24fafbf02e1/x/checkers/module.go#L163-L165]
func (am AppModule) EndBlock(_ sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
    return []abci.ValidatorUpdate{}
}
```

Ignite CLI left this empty. It is here that you add what you need done right before the block gets sealed. Create a new file named `x/checkers/keeper/end_block_server_game.go` to encapsulate the knowledge about game expiry. Leave your function empty for now:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L13]
func (k Keeper) ForfeitExpiredGames(goCtx context.Context) {
    // TODO
}
```

In `x/checkers/module.go` update `EndBlock` with:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/module.go#L163-L166]
func (am AppModule) EndBlock(ctx sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
    am.keeper.ForfeitExpiredGames(sdk.WrapSDKContext(ctx))
    return []abci.ValidatorUpdate{}
}
```

This ensures that **if** your module's `EndBlock` function is called the expired games will be handled. For the **whole application to call your module** you have to instruct it to do so. This takes place in `app/app.go`, where the application is initialized with the proper order to call the `EndBlock` functions in different modules. Add yours at the end:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/app/app.go#L398]
app.mm.SetOrderEndBlockers(crisistypes.ModuleName, govtypes.ModuleName, stakingtypes.ModuleName, checkersmoduletypes.ModuleName)
```

Your `ForfeitExpiredGames` function will now be called at the end of each block.

## Expire games handler

With the callbacks in place, it is time to code the expiration properly. In `ForfeitExpiredGames`, it is a matter of looping through the FIFO, starting from the head, and handling games that are expired. You can stop at the first active game, as all those that come after are also active thanks to the careful updating of the FIFO.

1. Prepare useful information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L14-L19]
    ctx := sdk.UnwrapSDKContext(goCtx)

    opponents := map[string]string{
        rules.BLACK_PLAYER.Color: rules.RED_PLAYER.Color,
        rules.RED_PLAYER.Color:   rules.BLACK_PLAYER.Color,
    }
    ```

2. Initialize the parameters before entering the loop:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L22-L28]
    nextGame, found := k.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    storedGameId := nextGame.FifoHead
    var storedGame types.StoredGame
    ```

3. Enter the loop:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L29]
    for {
        // TODO
    }
    ```

    1. Start with the loop breaking condition:

        ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L31-L33]
        if strings.Compare(storedGameId, types.NoFifoIdKey) == 0 {
            break
        }
        ```

    2. Fetch the expired game candidate and its deadline:

        ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L34-L41]
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

        ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L42]
        if deadline.Before(ctx.BlockTime()) {
            // TODO
        } else {
            // All other games come after anyway
            break
        }
        ```

        * If the game has expired, remove it from the FIFO:
            ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L44]
            k.RemoveFromFifo(ctx, &storedGame, &nextGame)
            ```

        * Check whether the game is worth keeping. If it is, set the winner as the opponent of the player whose turn it is and save:
            ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L45-L55]
            if storedGame.MoveCount <= 1 {
                storedGame.Winner = rules.NO_PLAYER.Color
                // No point in keeping a game that was never played by both
                k.RemoveStoredGame(ctx, storedGameId)
            } else {
                storedGame.Winner, found = opponents[storedGame.Turn]
                if !found {
                    panic(fmt.Sprintf(types.ErrCannotFindWinnerByColor.Error(), storedGame.Turn))
                }
                k.SetStoredGame(ctx, storedGame)
            }
            ```

        * Emit the relevant event:
            ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L56-L63]
            ctx.EventManager().EmitEvent(
                sdk.NewEvent(sdk.EventTypeMessage,
                    sdk.NewAttribute(sdk.AttributeKeyModule, types.ModuleName),
                    sdk.NewAttribute(sdk.AttributeKeyAction, types.ForfeitGameEventKey),
                    sdk.NewAttribute(types.ForfeitGameEventIdValue, storedGameId),
                    sdk.NewAttribute(types.ForfeitGameEventWinner, storedGame.Winner),
                ),
            )
            ```

        * Move along the FIFO for the next run of the loop:
            ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L65]
            storedGameId = nextGame.FifoHead
            ```

4. After the loop has ended do not forget to save the latest FIFO state:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/keeper/end_block_server_game.go#L72]
    k.SetNextGame(ctx, nextGame)
    ```

<HighlightBox type="tip">

For an explanation as to why this setup is resistant to an attack from an unbounded number of expired games, see the [section on the game's FIFO](./game-fifo.md).

</HighlightBox>

## Unit tests



## Interact via the CLI

Currently, the game expiry is one day in the future. This is too long to test with the CLI. Temporarily set it to 5 minutes:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/a74b20c/x/checkers/types/keys.go#L38]
MaxTurnDurationInSeconds = time.Duration(5 * 60 * 1000_000_000) // 5 minutes
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
<CodeGroupItem title="Game 0" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
```

</CodeGroupItem>
<CodeGroupItem title="Game 1">

```sh
# Wait a minute
$ checkersd tx checkers create-game $alice $bob --from $bob
# Wait 5 seconds
$ checkersd tx checkers play-move 1 1 2 2 3 --from $bob
```

</CodeGroupItem>
<CodeGroupItem title="Game 2">

```sh
# Wait a minute
$ checkersd tx checkers create-game $alice $bob --from $alice
$ checkersd tx checkers play-move 2 1 2 2 3 --from $bob
# Wait 5 seconds
$ checkersd tx checkers play-move 2 0 5 1 4 --from $alice
```

</CodeGroupItem>
</CodeGroup>

---

Space each `tx` command from a given account by a couple of seconds so that they each go into a different block - by default `checkersd` is limited because it uses the account's transaction sequence number by fetching it from the current state.

<HighlightBox type="tip">

 If you want to overcome this limitation, look at `checkersd`'s `--sequence` flag:

 ```sh
 $ checkersd tx checkers create-game --help
 ```sh

And at your account's current sequence. For instance:

```sh
$ checkersd query account $alice --output json | jq ".sequence"
```sh

Which returns something like:

```json
"9"
```json

</HighlightBox>

With three games in, confirm that you see them all:

```sh
$ checkersd query checkers list-stored-game
```

List them again after 2, 3, 4, and 5 minutes. You should see games `0` and `1` disappear, and game `2` being forfeited by Bob, i.e. `red` Alice wins:

```sh
$ checkersd query checkers show-stored-game 2 --output json | jq ".StoredGame.winner"
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
  idValue: "3"
```

## Next up

With no games staying in limbo forever, the project is now ready to use token wagers. These are introduced in the [next section](./game-wager.md).
