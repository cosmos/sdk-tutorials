---
title: Store Field - Record the Game Winner
order: 13
description: You store the winner of a game
tag: deep-dive
---

# Store Field - Record the Game Winner

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [Protobuf](../2-main-concepts/protobuf.md).
* Have Go installed.
* The checkers blockchain codebase with the deadline field and its handling. You can get there by following the [previous steps](./game-deadline.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/game-deadline).

</HighlightBox>

To be able to terminate games you need to identify games that have already been terminated. A good field to add is one for the **winner**. It needs to contain:

* The rightful winner of a game that reaches completion.
* Or, the winner by forfeit, when a game is expired.
* Or a neutral value when the game is active.

In this exercise a draw is not handled and it would require yet another value to save in _winner_.

## New information

In the `StoredGame` Protobuf definition file:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/proto/checkers/stored_game.proto#L19]
message StoredGame {
    ...
    string winner = 11;
}
```

To have Ignite CLI and Protobuf recompile this file use:

```sh
$ ignite generate proto-go
```

Add a helper function to get the winner's address, if it exists. A good place for it is in `full_game.go`:

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

Start with a new error that you define as a constant:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/types/errors.go#L22]
ErrGameFinished = sdkerrors.Register(ModuleName, 1111, "game is already finished")
```
Then at creation, in the _create game_ message handler, you start with a neutral value:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_create_game.go#L28]
...
storedGame := types.StoredGame{
    ...
    Winner:    rules.NO_PLAYER.Color,
}
```

With further checks when handling a play in the handler:

1. Check that the game has not finished yet:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_play_move.go#L23-L25]
    if storedGame.Winner != rules.NO_PLAYER.Color {
        return nil, types.ErrGameFinished
    }
    ```

2. Update the winner field, which [remains neutral](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L165) if there is no winner yet:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_play_move.go#L62]
    storedGame.Winner = game.Winner().Color
    ```

3. Handle the FIFO differently depending on whether the game is finished or not:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_play_move.go#L69-L73]
    if storedGame.Winner == rules.NO_PLAYER.Color {
        k.Keeper.SendToFifoTail(ctx, &storedGame, &nextGame)
    } else {
        k.Keeper.RemoveFromFifo(ctx, &storedGame, &nextGame)
    }
    ```

Just in case, when rejecting a game, in its handler:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_reject_game.go#L21-L23]
if storedGame.Winner != rules.NO_PLAYER.Color {
    return nil, types.ErrGameFinished
}
```

Confirm the code compiles and you are ready to handle the expiration of games.

## Next up

You have introduced a [game FIFO](./game-fifo.md), a [game deadline](./game-deadline.md), and a game winner. Time to turn your attention to the [next section](./game-forfeit.md).
