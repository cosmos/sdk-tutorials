---
title: Create the Game Handling
order: 7
description: You create a proper game
---

# Create the Game Handling

In the [previous section](./03-starport-04-create-message), you added the message to create a game, along with its serialization and dedicated gRPC function.

There remains to add code that actually:

* Creates a brand new game.
* Saves it in storage.
* Returns the ID of the new game.

Given Starport's seperation of concerns, it isolates this concern into a separate file, `x/checkers/keeper/msg_server_create_game.go`, for you to edit:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/keeper/msg_server_create_game.go#L10-L17]
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgCreateGameResponse{}, nil
}
```

Now, all the message processing code was created for you and all you are left to do is code the action. As you can see, opting for Starport is a wise decision.

Given that you have already done a lot of preparatory work, what does it involve to code in the action? `rules` represent the ready-made file with the imported rules of the game:

* Get the new game's ID:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L15-L19]
    nextGame, found := k.Keeper.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    newIndex := strconv.FormatUint(nextGame.IdValue, 10)
    ```
* Create the object to be stored:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L20-L26]
    storedGame := types.StoredGame{
        Creator: msg.Creator,
        Index:   newIndex,
        Game:    rules.New().String(),
        Red:     msg.Red,
        Black:   msg.Black,
    }
    ```

* Confirm that the values in it are correct by checking the validity of the players' addresses:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L27-L30]
    err := storedGame.Validate()
    if err != nil {
        return nil, err
    }
    ```

* Save the game:

<!-- Are we saving the game or the address? Please be more precise. -->

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L31]
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

* Prepare the ground for the next game with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L33-L34]
    nextGame.IdValue++
    k.Keeper.SetNextGame(ctx, nextGame)
    ```

* Return the newly created ID for reference:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L36-L38]
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

As you can see, proper preparation in the previous sections made handling this a breeze. In the next sections, you will modify this handling:

* To add new fields to the stored information.
* To add an event.
* To consume some gas.
* To facilitate the eventual deadline enforcement.
* To add _money_ handling.

Now, that a game is created, it is time to play it.
