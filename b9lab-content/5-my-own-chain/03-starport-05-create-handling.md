---
title: Create the Game Handling
order: 7
description: You create a proper game
tag: deep-dive
---

# Create the Game Handling

<HighlightBox type="info">

Before proceeding, make sure you have all you need:

* Have Go installed.
* The checkers blockchain with its `MsgCreateGame` created by Starport:
    * Either because you followed the [previous steps](./03-starport-04-create-message).
    * Or because you checked out [its outcome](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-msg).

</HighlightBox>

In the [previous section](./03-starport-04-create-message), with the help of Starport, you added the message to create a game, along with its serialization and dedicated gRPC function.

There remains to add code that actually:

* Creates a brand new game.
* Saves it in storage.
* Returns the ID of the new game.

Given Starport's seperation of concerns, it isolated this concern into a separate file, `x/checkers/keeper/msg_server_create_game.go`, for you to edit:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/keeper/msg_server_create_game.go#L10-L17]
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgCreateGameResponse{}, nil
}
```

All the message processing code was created for you and all you are left to do is code the meat of the action. As you can see, opting for Starport is a wise decision.

Given that you have already done a lot of preparatory work, what does it involve to code the action? With what do you replace `// TODO: Handling the message`?

* First, `rules` represent the ready-made file with the imported rules of the game:

    ```go
    import (
        rules "github.com/xavierlepretre/checkers/x/checkers/rules"
    )
    ```

1. Get the new game's ID:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L15-L19]
    nextGame, found := k.Keeper.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    newIndex := strconv.FormatUint(nextGame.IdValue, 10)
    ```

    Using the [`Keeper.GetNextGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/next_game.go#L17) function created by the `starport scaffold single nextGame...` command.

2. Create the object to be stored:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L20-L26]
    storedGame := types.StoredGame{
        Creator: msg.Creator,
        Index:   newIndex,
        Game:    rules.New().String(),
        Red:     msg.Red,
        Black:   msg.Black,
    }
    ```

    Notice the use of:

    * The [`rules.New()`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/rules/checkers.go#L122) command, part of the Checkers rules file you imported earlier.
    * The string content of the `msg *types.MsgCreateGame`, namely `.Creator`, `.Red`, and `.Black`.

3. Confirm that the values in it are correct by checking the validity of the players' addresses:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L27-L30]
    err := storedGame.Validate()
    if err != nil {
        return nil, err
    }
    ```

    Because the `.Creator`, `.Red`, and `.Black` were copied as **strings** indeed, so they need to be checked. Note that the check on `.Creator` is redundant here because at this stage, the message's signatures have been verified and in particular the creator is the signer.

4. Save the `StoredGame` object:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L31]
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

    Using the [`Keeper.SetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/stored_game.go#L10) function created by the `starport scaffold map storedGame...` command

5. Prepare the ground for the next game with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L33-L34]
    nextGame.IdValue++
    k.Keeper.SetNextGame(ctx, nextGame)
    ```

    Using the [`Keeper.SetNextGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/next_game.go#L10) function created by Starport.

6. Return the newly created ID for reference:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L36-L38]
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

## Next up

In the next sections, you will modify this handling:

* To add [new fields](./03-starport-09-game-fifo) to the stored information.
* To add [an event](./03-starport-07-events).
* To consume [some gas](./03-starport-gas-meter).
* To facilitate the eventual [deadline enforcement](03-starport-12-game-forfeit).
* To add [_money_](03-starport-13-game-wager) handling, including [foreign tokens](./03-starport-16-wager-denom).

Now that a game is created, it is time to play it. That's the subject of the [next section](./03-starport-06-play-game).
