---
title: The Reject Game Elements
order: 10
description: You reject a game.
---

# The Reject Game Elements

A natural counterpart to anyone being to create a game for any two other players, is for these players to be able to reject a game. However, a player should not be allowed to reject a game once they have made their first move. Anyway, as you are already accustomed with Starport, see [Create Message](./03-startport-04-create-message) and [Create Handling](./03-startport-05-create-handling), let's go right to business. It is sufficient to say that to reject a game, a player only needs to specify:

* The id of the game to reject. Let's call the field `idValue`.
* Nothing else really, as the signer of the message is implicitly the player.

## With Starport

Let's name the message object `RejectGame`, so now you invoke Starport:

```sh
$ starport scaffold message rejectGame idValue --module checkers
```
It has created all the boilerplate for you and has left a single place so that you can write the meat of your code. In `x/checkers/keeper/msg_server_reject_game.go`:

```go
func (k msgServer) RejectGame(goCtx context.Context, msg *types.MsgRejectGame) (*types.MsgRejectGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgRejectGameResponse{}, nil
}
```

## Additional Information

A player cannot reject a game once they've played. However, as of now, you do not know whether a player played or not. To remediate this, you need to add a new field to the `StoredGame`. Let's call it `MoveCount`. So in `proto/checkers/stored_game.proto`:

```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/proto/checkers/stored_game.proto#L15]
storedGame := types.StoredGame{
    ...
    uint64 moveCount = 7;
}
```
At this point, to have Protobuf recompile the relevant Go files, you may want to run:

```sh
$ starport chain serve
```
Or, if it complains:

```sh
$ starport chain serve --reset-once
```


This `MoveCount` should start at `0` and increment by `1` on each move. So first, in `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_create_game.go#L26]
storedGame := types.StoredGame{
    ...
    MoveCount: 0,
}
```
And in `x/checkers/keeper/msg_server_play_move.go`, just before saving to storage:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_play_move.go#L55]
...
storedGame.MoveCount++
storedGame.Game = game.String()
...
```
Now you are ready to handle a rejection request.

## The Reject Handling Part

You declare the following new errors in `x/checkers/types/errors.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/types/errors.go#L19-L20]
ErrRedAlreadyPlayed   = sdkerrors.Register(ModuleName, 1108, "red player has already played")
ErrBlackAlreadyPlayed = sdkerrors.Register(ModuleName, 1109, "black player has already played")
```
Since you have seen how to add events to action handling, you also add an event on rejection. So you prepare the keys in `x/checkers/types/keys.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/types/keys.go#L41-L45]
const (
    RejectGameEventKey     = "GameRejected"
    RejectGameEventCreator = "Creator"
    RejectGameEventIdValue = "IdValue"
)
```

Now, the reject steps are:

* Fetch the relevant information:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_reject_game.go#L15-L18]
    storedGame, found := k.Keeper.GetStoredGame(ctx, msg.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "game not found %s", msg.IdValue)
    }
    ```
* Is it an expected player, and did the player already play?
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_reject_game.go#L21-L31]
    if strings.Compare(storedGame.Red, msg.Creator) == 0 {
        if 1 < storedGame.MoveCount { // Notice the use of the new field
            return nil, types.ErrRedAlreadyPlayed
        }
    } else if strings.Compare(storedGame.Black, msg.Creator) == 0 {
        if 0 < storedGame.MoveCount { // Notice the use of the new field
            return nil, types.ErrBlackAlreadyPlayed
        }
    } else {
        return nil, types.ErrCreatorNotPlayer
    }
    ```
* Get rid of the game as it is not interesting to keep it:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_reject_game.go#L34]
    k.Keeper.RemoveStoredGame(ctx, msg.IdValue)
    ```
* Emit the relevant event:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_reject_game.go#L37-L44]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            sdk.NewAttribute(sdk.AttributeKeyModule, "checkers"),
            sdk.NewAttribute(sdk.AttributeKeyAction, types.RejectGameEventKey),
            sdk.NewAttribute(types.RejectGameEventCreator, msg.Creator),
            sdk.NewAttribute(types.RejectGameEventIdValue, msg.IdValue),
        ),
    )
    ```
* Leave the returned object as is.

That's all there is to it. Once again, with Protobuf and Starport, a lot of the boilerplate was taken care of.
