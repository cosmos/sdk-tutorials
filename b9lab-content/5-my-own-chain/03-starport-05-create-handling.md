---
title: The Create Game Handling
order: 7
description: You create a game proper.
---

# The Create Game Handling

In the previous section, you added the message to create a game. But that was just that, a message, along with its serialization and dedicated gRPC function. There remains to add the code that actually:

* Creates a brand new game.
* Saves it in storage.
* Returns the id of the new game.

Given how Starport has separated its concerns, it has isolated this concern into its separate file, `x/checkers/keeper/msg_server_create_game.go`, for you to edit:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/e78cba34926ba0adee23febb1ce44774e2c466b3/x/checkers/keeper/msg_server_create_game.go#L10-L17]
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgCreateGameResponse{}, nil
}
```
Now, it should be apparent to you why picking Starport was shrewd. All the message processing code was created for you and all you are left to do is the meaty part of the action.

Given that you have already done a lot of the preparation work, let's see what that involves. Here `rules` represent the ready-made file with the rules of the game you imported:

* Get the new game's id:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L15-L19]
    nextGame, found := k.Keeper.GetNextGame(ctx)
    if !found {
        panic("NextGame not found")
    }
    newIndex := strconv.FormatUint(nextGame.IdValue, 10)
    ```
* Create the object to store:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L20-L26]
    storedGame := types.StoredGame{
        Creator: msg.Creator,
        Index:   newIndex,
        Game:    rules.New().String(),
        Red:     msg.Red,
        Black:   msg.Black,
    }
    ```
* Confirm that the values in it are correct:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L27-L30]
    err := storedGame.Validate()
    if err != nil {
        return nil, err
    }
    ```
* Save it:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/d59a74496a96018c57fdff72c443980c08416499/x/checkers/keeper/msg_server_create_game.go#L31]
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```
* Prepare the ground for the next game:
    ```go
    nextGame.IdValue++
    k.Keeper.SetNextGame(ctx, nextGame)
    ```
* And return the newly created id for reference:
    ```go []
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

As you can see, proper preparation in the previous sections made this handling a breeze. In the next sections, you will modify this handling:

* To add new fields to the stored information.
* To add an event.
* To consume some gas.
* To facilitate eventual deadline enforcement.

With the game created, it's time to move to playing it.
