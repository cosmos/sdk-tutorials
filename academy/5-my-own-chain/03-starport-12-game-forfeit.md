---
title: The Expired Game Elements
order: 14
description: You enforce the expiration of games
tag: deep-dive
---

# The Expired Game Elements

<HighlightBox type="info">

Make sure you have all you need before proceeding:

* You understand the concepts of [ABCI](../3-main-concepts/02-architecture.md).
* Have Go installed.
* The checkers blockchain with the elements necessary for forfeit. Either because you followed the [previous steps](./03-starport-11-game-winner.md) or because you checked out [its outcome](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-winner).

</HighlightBox>

In the [previous section](./03-starport-11-game-winner.md), you prepared the ground to enforce the expiration of games, namely:

* A First-In-First-Out (FIFO) that always has old games at its head and freshly updated games at its tail.
* A deadline field to guide the expiration.
* A winner field to further assist with forfeiting.

## New information

An expired game will expire in two different cases:

1. It was never really played on, so it is removed quietly.
2. It was played on, making it a proper game, and forfeit is the outcome because a player failed to play in time.

In the latter case, you want to emit a new event, which differentiates forfeiting a game from a win involving a move. Therefore you define new error constants:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/types/keys.go#L66-L70]
const (
    ForfeitGameEventKey     = "GameForfeited"
    ForfeitGameEventIdValue = "IdValue"
    ForfeitGameEventWinner  = "Winner"
)
```

## Putting callbacks in place

When you use Starport to scaffold your module, it creates the [`x/checkers/module.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/41ac3c6ef4b2deb996e54f18f597b24fafbf02e1/x/checkers/module.go) file with a lot of functions to accommodate your application. In particular, the function that **may** be called on your module on `EndBlock` is named `EndBlock`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/41ac3c6ef4b2deb996e54f18f597b24fafbf02e1/x/checkers/module.go#L163-L165]
func (am AppModule) EndBlock(_ sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
    return []abci.ValidatorUpdate{}
}
```

Starport left it empty. It is here that you add what you need to see done, right before the block gets sealed. To stay in the spirit of Starport, of one concern per file, create a brand new file named `x/checkers/keeper/end_block_server_game.go` to encapsulate the knowledge about game expiry. Leave your function, empty for now:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L13]
func (k Keeper) ForfeitExpiredGames(goCtx context.Context) {
    // TODO
}
```

So that, back in `x/checkers/module.go`, you can update `EndBlock` with:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/module.go#L163-L166]
func (am AppModule) EndBlock(ctx sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
    am.keeper.ForfeitExpiredGames(sdk.WrapSDKContext(ctx))
    return []abci.ValidatorUpdate{}
}
```

With this, you ensure that **if** your module's `EndBlock` function is called, the expired games will be handled. But, for the **whole application to call your module**, you have to instruct it to do so. This takes place in `app/app.go`, where the application is initialized with the proper order to call the `EndBlock` functions in different modules. Add yours at the end:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/app/app.go#L398]
app.mm.SetOrderEndBlockers(crisistypes.ModuleName, govtypes.ModuleName, stakingtypes.ModuleName, checkersmoduletypes.ModuleName)
```

With this wiring in place, your `ForfeitExpiredGames` function will be called at the end of each block. Time to have it do something useful.

## Expire games handler

With the callbacks in place, it is time to code the expiration properly. In `ForfeitExpiredGames`, it is _simply_ a matter of looping through the FIFO, starting from the head, and handling games that are expired. You can stop at the first on-going game, as all those that come after are also on-going, thanks to the careful updating of the FIFO.

1. Prepare useful information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L14-L19]
    ctx := sdk.UnwrapSDKContext(goCtx)

    opponents := map[string]string{
        rules.BLACK_PLAYER.Color: rules.RED_PLAYER.Color,
        rules.RED_PLAYER.Color:   rules.BLACK_PLAYER.Color,
    }
    ```

2. Initialize the parameters before entering the loop:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L22-L28]
    nextGame, found := k.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    storedGameId := nextGame.FifoHead
    var storedGame types.StoredGame
    ```

3. Enter the loop:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L29]
    for {
        // TODO
    }
    ```

    1. Start with the loop breaking condition:

        ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L31-L33]
        if strings.Compare(storedGameId, types.NoFifoIdKey) == 0 {
            break
        }
        ```

    2. Fetch the expired game candidate and its deadline:

        ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L34-L41]
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

        ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L42]
        if deadline.Before(ctx.BlockTime()) {
            // TODO
        } else {
            // All other games come after anyway
            break
        }
        ```

        * If the game has expired, remove it from the FIFO:
            ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L44]
            k.RemoveFromFifo(ctx, &storedGame, &nextGame)
            ```

        * Then check whether the game is worth keeping. If it is, set the winner as the opponent of the player whose turn it is and save:
            ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L45-L55]
            if storedGame.MoveCount == 0 {
                storedGame.Winner = rules.NO_PLAYER.Color
                // No point in keeping a game that was never played
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
            ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L56-L63]
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
            ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L65]
            storedGameId = nextGame.FifoHead
            ```

4. After the loop has ended, do not forget to save the latest FIFO state:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/7739537804f350241f59ee55b443a66b68883fc8/x/checkers/keeper/end_block_server_game.go#L72]
    k.SetNextGame(ctx, nextGame)
    ```

And that's about it. It takes a few steps but again nothing out of the ordinary. Review once more the part above where you have to put callbacks in place, so that you remember it better. Starport created the `EndBlock` function, but it was not called from `app.go` by default.

<HighlightBox type="tip">

For an explanation as to why this setup is resistant to an attack from an unbounded number of expired games see the [section on the game's FIFO](./03-starport-09-game-fifo.md).

</HighlightBox>

## Next up

With stale games taken care of, you are now safe in the knowledge that if and when games involve money, then money won't stay stuck by negligence. Money? Yes, that's what the [next section](./03-starport-13-game-wager.md) introduces, via token wagers.
