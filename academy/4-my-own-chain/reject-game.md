---
title: Message and Handler - Make Sure a Player Can Reject a Game
order: 10
description: You reject a game
tag: deep-dive
---

# Message and Handler - Make Sure a Player Can Reject a Game

<HighlightBox type="synopsis">

Before proceeding, make sure you have all you need:

* You understand the concepts of [transactions](../2-main-concepts/transactions.md), [messages](../2-main-concepts/messages.md)), and [Protobuf](../2-main-concepts/protobuf.md).
* You know how to [create a message](./create-message.md) with Ignite CLI, and code [its handling](./create-handling.md). This section does not aim to repeat what can be learned in earlier sections.
* Have Go installed.
* The checkers blockchain codebase with the previous messages and their events. You can get there by following the [previous steps](./events.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/two-events).

</HighlightBox>

If anyone can create a game for any two other players, it is important to allow a player to reject a game. But a player should not be allowed to reject a game once they have made their first move.

To reject a game, a player needs to provide the ID of the game that the player wants to reject. Call the field `idValue`. This should be sufficient as the signer of the message is implicitly the player.

## Working with Ignite CLI

Name the message object `RejectGame`. Invoke Ignite CLI with:

```sh
$ ignite scaffold message rejectGame idValue --module checkers
```

It creates all the boilerplate for you and leaves a single place for the code you want to include:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/93d048c2b7fbdc26825b41bd043d6203ec9c861c/x/checkers/keeper/msg_server_reject_game.go#L10-L17]
func (k msgServer) RejectGame(goCtx context.Context, msg *types.MsgRejectGame) (*types.MsgRejectGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgRejectGameResponse{}, nil
}
```

## Additional information

A new rule of the game should be that a player cannot reject a game once they begin to play. When loading a `StoredGame` from storage you have no way of knowing whether a player already played or not. To access this information add a new field to the `StoredGame` called `MoveCount`. In `proto/checkers/stored_game.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/proto/checkers/stored_game.proto#L15]
storedGame := types.StoredGame{
    ...
    uint64 moveCount = 7;
}
```

Run Protobuf to recompile the relevant Go files:

```sh
$ ignite generate proto-go
```

`MoveCount` should start at `0` and increment by `1` on each move. So adjust it first in the handler when creating the game:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_create_game.go#L26]
storedGame := types.StoredGame{
    ...
    MoveCount: 0,
}
```

Just before saving to the storage, in the handler when playing a move:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_play_move.go#L55]
...
storedGame.MoveCount++
storedGame.Game = game.String()
...
```

With `MoveCount` counting properly, you are now ready to handle a rejection request.

## The reject handling

To follow the Cosmos SDK conventions declare the following new errors:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/types/errors.go#L19-L20]
ErrRedAlreadyPlayed   = sdkerrors.Register(ModuleName, 1108, "red player has already played")
ErrBlackAlreadyPlayed = sdkerrors.Register(ModuleName, 1109, "black player has already played")
```

You will add an event for rejection. Begin by preparing the new keys:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/types/keys.go#L41-L45]
const (
    RejectGameEventKey     = "GameRejected"
    RejectGameEventCreator = "Creator"
    RejectGameEventIdValue = "IdValue"
)
```

In the message handler the reject steps are:

1. Fetch the relevant information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_reject_game.go#L15-L18]
    storedGame, found := k.Keeper.GetStoredGame(ctx, msg.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "game not found %s", msg.IdValue)
    }
    ```

2. Is the player expected? Did the player already play? Check with:

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

    Remember that the player with the color black plays first.

3. Remove the game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_reject_game.go#L34]
    k.Keeper.RemoveStoredGame(ctx, msg.IdValue)
    ```

    Finally using the [`Keeper.RemoveStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/keeper/stored_game.go#L30) function created long ago by the `ignite scaffold map storedGame...` command.

4. Emit the relevant event:

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

5. Leave the returned object as it is as you have nothing new to tell the caller.

You can confirm that your project at least compiles [with](https://docs.ignite.com/cli/#ignite-chain-build):

```sh
$ ignite chain build
```



## Next up

The next four sections cover forfeits and how games end. In the next section you create a [doubly-linked FIFO](./game-fifo.md).

Later you add a [deadline](./game-deadline.md) and a [game winner](./game-winner.md) fields, before being able to finally [enforce the forfeit](./game-forfeit.md).

If you want to enable token wagers in your games instead, skip ahead to [wagers](./game-wager.md).
