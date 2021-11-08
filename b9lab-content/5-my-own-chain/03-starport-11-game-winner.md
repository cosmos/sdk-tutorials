---
title: A Game Winner
order: 13
description: You store the winner of game.
---

# A Game Winner

Actually so that you can forcibly terminate games, and avoid terminating one twice, you need to identify games that have been so. A good field to do the job is to add a **winner**. It will contain:

* The rightful winner of a game that reaches completion.
* Or the winner by forfeit when a game is expired.
* Or a neutral value when the game was a draw or forfeited before relevant moves.

Just as in the previous section, it is quite straightforward.

## New Information

In `proto/checkers/stored_game.proto`:

```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/proto/checkers/stored_game.proto#L19]
message StoredGame {
    ...
    string winner = 11;
}
```
To have Starport and Protobuf recompile this file, you can use:

```sh
$ starport chain serve
```
While you are at it, go and add a helper function to get the winner's address, if it exists, in `x/checkers/types/full_game.go`:

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

## Update and Check The Winner

This is a 2-part update. Obviously you set the winner where relevant, but you also introduce new checks so that a game with a winner cannot be acted upon.

It starts with a new error in `x/checkers/types/errors.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/types/errors.go#L22]
ErrGameFinished = sdkerrors.Register(ModuleName, 1111, "game is already finished")
```
Then at creation, in `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_create_game.go#L28]
...
storedGame := types.StoredGame{
    ...
    Winner:    rules.NO_PLAYER.Color,
}
```
And, a bit more elaborate, when playing, in `x/checkers/keeper/msg_server_play_move.go`:

* Check that the game is not finished yet:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_play_move.go#L23-L25]
    if storedGame.Winner != rules.NO_PLAYER.Color {
        return nil, types.ErrGameFinished
    }
    ```
* Update the winner, which remains neutral if there isn't any yet:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_play_move.go#L62]
    storedGame.Winner = game.Winner().Color
    ```
* Handle the FIFO differently whether the game is finished or not:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_play_move.go#L69-L73]
    if storedGame.Winner == rules.NO_PLAYER.Color {
        k.Keeper.SendToFifoTail(ctx, &storedGame, &nextGame)
    } else {
        k.Keeper.RemoveFromFifo(ctx, &storedGame, &nextGame)
    }
    ```

Finally, when rejecting a game, just in case, in `x/checkers/keeper/msg_server_reject_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e50ceaedb52cbbb2e802a1c887657cdc8f52f25b/x/checkers/keeper/msg_server_reject_game.go#L21-L23]
if storedGame.Winner != rules.NO_PLAYER.Color {
    return nil, types.ErrGameFinished
}
```
And that's about it. Now you are ready for real to handle the expiry of games.
