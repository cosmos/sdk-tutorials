---
title: Message Handler - Create and Save a Game Properly
order: 7
description: You create a proper game
tag: deep-dive
---

# Message Handler - Create and Save a Game Properly

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* Have Go installed.
* The checkers blockchain codebase with `MsgCreateGame` created by Ignite CLI. You can get there by following the [previous steps](./create-message.md) checking out  [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-msg).

</HighlightBox>

You added the message to create a game along with its serialization and dedicated gRPC function with the help of Ignite CLI in the [previous section](./create-message.md).

Now all that remains is to add code that:

* Creates a brand new game.
* Saves it in storage.
* Returns the ID of the new game.

Ignite CLI isolated this concern into a separate file, `x/checkers/keeper/msg_server_create_game.go`, for you to edit:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/keeper/msg_server_create_game.go#L10-L17]
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgCreateGameResponse{}, nil
}
```

All the message processing code were created for you and all you are left to do is code the meat of the action. Opting for Ignite CLI is a wise decision as you can see.

Given that you have already done a lot of preparatory work: what does it involve to code the action? With what do you replace `// TODO: Handling the message`?

* First, `rules` represent the ready-made file with the imported rules of the game:

    ```go
    import (
        rules "github.com/alice/checkers/x/checkers/rules"
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

    Using the [`Keeper.GetNextGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/next_game.go#L17) function created by the `ignite scaffold single nextGame...` command.

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

    * The [`rules.New()`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/rules/checkers.go#L122) command, which is part of the Checkers rules file you imported earlier.
    * The string content of the `msg *types.MsgCreateGame` namely `.Creator`, `.Red`, and `.Black`.

3. Confirm that the values in it are correct by checking the validity of the players' addresses:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L27-L30]
    err := storedGame.Validate()
    if err != nil {
        return nil, err
    }
    ```

    The `.Creator`, `.Red`, and `.Black` need to be checked because they were copied as **strings**. The check on `.Creator` is redundant here because at this stage the message's signatures have been verified and in particular the creator is the signer.

4. Save the `StoredGame` object:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L31]
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

    Using the [`Keeper.SetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/stored_game.go#L10) function created by the `ignite scaffold map storedGame...` command

5. Prepare the ground for the next game with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L33-L34]
    nextGame.IdValue++
    k.Keeper.SetNextGame(ctx, nextGame)
    ```

    Using the [`Keeper.SetNextGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/next_game.go#L10) function created by Ignite CLI.

6. Return the newly created ID for reference:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L36-L38]
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

## Next up

You will modify this handling in the next sections:

* To add [new fields](./game-fifo.md) to the stored information.
* To add [an event](./events.md).
* To consume [some gas](./gas-meter.md).
* To facilitate the eventual [deadline enforcement](./game-forfeit.md).
* To add [_money_](./game-wager.md) handling including [foreign tokens](./wager-denom.md).

Now that a game is created, it is time to play it. That is the subject of the [next section](./play-game.md).
