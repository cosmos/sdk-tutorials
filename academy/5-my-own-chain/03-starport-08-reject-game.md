---
title: The Reject Game Elements
order: 10
description: You reject a game
tag: deep-dive
---

# The Reject Game Elements

<HighlightBox type="synopsis">

Before proceeding, make sure you have all you need:

* You understand the concepts of [transactions](../main-concepts/transactions.md), [messages](../main-concepts/messages.md)), and [Protobuf](../main-concepts/protobuf.md).
* You know how to [create a message](./03-starport-04-create-message.md) with Starport, and code [its handling](./03-starport-05-create-handling.md). This section does not aim to repeat what can be learned in earlier sections.
* Have Go installed.
* The checkers blockchain with the previous too messages and their events:
    * Either because you followed the [previous steps](./03-starport-07-events.md).
    * Or because you checked out [its outcome](https://github.com/cosmos/b9-checkers-academy-draft/tree/two-events).

</HighlightBox>

If anyone can create a game for any two other players, it is important to allow a player to reject a game. However, a player should not be allowed to reject a game once they have made their first move.

To reject a game, A player needs to provide the ID of the game that the player wants to reject. Call the field `idValue`. This should be sufficient as the signer of the message is implicitly the player.

## Working with Starport

Name the message object `RejectGame`. Invoke Starport with:

```sh
$ starport scaffold message rejectGame idValue --module checkers
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

A new rule of the game should be that a player cannot reject a game once they begin to play. However, as of now, when loading a `StoredGame` from storage, you have no way of knowing whether a player already played or not. There are many ways to remediate this. Let's pick an effortless one, where you add a new field to the `StoredGame`. Let's call it `MoveCount`. So, in `proto/checkers/stored_game.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/proto/checkers/stored_game.proto#L15]
storedGame := types.StoredGame{
    ...
    uint64 moveCount = 7;
}
```

At this point, you may want to run to have Protobuf recompile the relevant Go files:

```sh
$ starport generate proto-go
```

`MoveCount` should start at `0` and increment by `1` on each move. So adjust it first in the handler when creating the game:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_create_game.go#L26]
storedGame := types.StoredGame{
    ...
    MoveCount: 0,
}
```

Plus just before saving to the storage, in the handler when playing a move:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_play_move.go#L55]
...
storedGame.MoveCount++
storedGame.Game = game.String()
...
```

With `MoveCount` counting properly, you are now ready to handle a rejection request.

## The reject handling

As a convenience, and to follow the Cosmos SDK conventions, you declare the following new errors:

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

Now, in the message handler, the reject steps are:

1. Fetch the relevant information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_reject_game.go#L15-L18]
    storedGame, found := k.Keeper.GetStoredGame(ctx, msg.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "game not found %s", msg.IdValue)
    }
    ```

2. Is the player expected? And, did the player already play? Check with:

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

    Remember that the black player plays first.

3. Get rid of the game, as it is not interesting enough to keep:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_reject_game.go#L34]
    k.Keeper.RemoveStoredGame(ctx, msg.IdValue)
    ```

    Finally using the [`Keeper.RemoveStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/keeper/stored_game.go#L30) function created long ago by the `starport scaffold map storedGame...` command.

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

You can confirm that your project at least compiles [with](https://docs.starport.network/cli/#starport-chain-build):

```sh
$ starport chain build
```

That is all there is to it. Once again, a lot of the boilerplate is taken care of with Protobuf and Starport.

## Next up

You are done with creating messages for your checkers blockchain, at least from the point of view of this exercise. It does not mean that you have covered all the game theoretic situations. In particular, a player may stop playing and never come back. How would you handle it? Have the other player, or anyone really, send a message to flag the game as dead? Why not. But what if nobody ever bothers? You would end up with a lot of ongoing-but-dead games.

That's where you can enforce a forfeit mechanism, independent from any player input. That's the object of the next four sections. Where you create a [doubly-linked FIFO](./03-starport-09-game-fifo.md), add a [deadline](./03-starport-10-game-deadline.md) and a [game winner](./03-starport-11-game-winner.md) fields, before being able to finally [enforce the forfeit](./03-starport-12-game-forfeit.md).

To engage in this journey, head to the [next section](./03-starport-09-game-fifo.md). If instead you want to enable token wagers in your games, skip ahead to [wagers](./03-starport-13-game-wager.md).
