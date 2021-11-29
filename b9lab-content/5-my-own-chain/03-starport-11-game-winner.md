---
title: A Game Winner
order: 13
description: You store the winner of a game
---

# A Game Winner

<HighlightBox type="info">

Make sure you have all you need to store the winners of games:

* You understand the concepts of [transactions](../3-main-concepts/05-transactions), [messages](../3-main-concepts/07-messages), and [Protobuf](../3-main-concepts/09-protobuf).
* Have Go installed.
* The checkers blockchain with the `MsgCreateGame` and its handling. Either because you followed the [previous steps](./03-starport-05-create-handling) or because you checked out [its outcome](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-handler
).

</HighlightBox>

You need to identify games that have been terminated to be able to forcibly terminate games and avoid terminating one game twice. A good field to add is one for the **winner**. It needs to contain:

* The rightful winner of a game that reaches completion.
* Or the winner by forfeit when a game is expired.
* Or a neutral value when the game was a draw or forfeited before any relevant moves took place.

## New information

In `proto/checkers/stored_game.proto` add a winner:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/proto/checkers/stored_game.proto#L19]
message StoredGame {
    ...
    string winner = 11;
}
```

To have Starport and Protobuf recompile this file use:

```sh
$ starport generate proto-go
```

Go and add a helper function to get the winner's address, if existent, in `x/checkers/types/full_game.go` while you are at it:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/types/full_game.go#L50-L69]
func (storedGame *StoredGame) GetPlayerAddress(color string) (address sdk.AccAddress, found bool, err error) {
    red, err := storedGame.GetRedAddress()
    if err != nil {
        return nil, false, err
    }
    black, err := storedGame.GetBlackAddress()
    if err != nil {
        return nil, false, err
    }
    address, found = map[string]sdk.AccAddress{
        rules.RED_PLAYER.Color:   red,
        rules.BLACK_PLAYER.Color: black,
    }[color]
    return address, found, nil
}

 func (storedGame *StoredGame) GetWinnerAddress() (address sdk.AccAddress, found bool, err error) {
    address, found, err = storedGame.GetPlayerAddress(storedGame.Winner)
    return address, found, err
}
```

## Update and check for the winner

This is a two-part update. You set the winner where relevant but you also introduce new checks, so that a game with a winner cannot be acted upon.

It starts with a new error in `x/checkers/types/errors.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/types/errors.go#L22]
ErrGameFinished = sdkerrors.Register(ModuleName, 1111, "game is already finished")
```
Then at creation in `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_create_game.go#L28]
...
storedGame := types.StoredGame{
    ...
    Winner:    rules.NO_PLAYER.Color,
}
```

And an error when playing in `x/checkers/keeper/msg_server_play_move.go`:

* Check that the game has not finished yet:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_play_move.go#L23-L25]
    if storedGame.Winner != rules.NO_PLAYER.Color {
        return nil, types.ErrGameFinished
    }
    ```

* Update the winner, which remains neutral if there is no winner yet:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_play_move.go#L62]
    storedGame.Winner = game.Winner().Color
    ```

* Handle the FIFO differently depending on whether the game is finished or not:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_play_move.go#L69-L73]
    if storedGame.Winner == rules.NO_PLAYER.Color {
        k.Keeper.SendToFifoTail(ctx, &storedGame, &nextGame)
    } else {
        k.Keeper.RemoveFromFifo(ctx, &storedGame, &nextGame)
    }
    ```

Just in case, when rejecting a game in `x/checkers/keeper/msg_server_reject_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_reject_game.go#L21-L23]
if storedGame.Winner != rules.NO_PLAYER.Color {
    return nil, types.ErrGameFinished
}
```

Confirm it compiles and you are ready to handle the expiration of games.

## Next up

Now that you stored the winner of a game turn your attention to enforcing the game expiration in the [next section](./03-starport-12-game-forfeit).
