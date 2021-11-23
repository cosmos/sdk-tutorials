---
title: The Reject Game Elements
order: 10
description: You reject a game
---

# The Reject Game Elements

If anyone can create a game for any two other players, it is important to allow a player to reject a game. However, a player should not be allowed to reject a game once they have made their first move.

<HighlightBox type="tip">

As a prerequisite to dive right into implementing game rejection, make sure you know how to [Create a Message](./03-startport-04-create-message) and [Create Handling](./03-startport-05-create-handling) with Starport.

</HighlightBox>

To reject a game, a player needs to provide the ID of the game that the player wants to reject. Let's call the field `idValue`. As the signer of the message is implicitly the player, this should be sufficient.

## Working with Starport

Let's name the message object `RejectGame`. Invoke Starport with:

```sh
$ starport scaffold message rejectGame idValue --module checkers
```

It creates all the boilerplate for you and leaves a single place for the code you want to include in `x/checkers/keeper/msg_server_reject_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/93d048c2b7fbdc26825b41bd043d6203ec9c861c/x/checkers/keeper/msg_server_reject_game.go#L10-L17]
func (k msgServer) RejectGame(goCtx context.Context, msg *types.MsgRejectGame) (*types.MsgRejectGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgRejectGameResponse{}, nil
}
```

## Additional information

A player cannot reject a game once they begin to play. However, as of now, you do not know whether a player played or not. To remediate this, you need to add a new field to the `StoredGame`, let's call it `MoveCount`. So, in `proto/checkers/stored_game.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/proto/checkers/stored_game.proto#L15]
storedGame := types.StoredGame{
    ...
    uint64 moveCount = 7;
}
```

At this point, to have Protobuf recompile the relevant Go files, you may want to run:

```sh
$ starport generate proto-go
```

`MoveCount` should start at `0` and increment by `1` on each move. So adjust it first in `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_create_game.go#L26]
storedGame := types.StoredGame{
    ...
    MoveCount: 0,
}
```

Just before saving to the storage, in `x/checkers/keeper/msg_server_play_move.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_play_move.go#L55]
...
storedGame.MoveCount++
storedGame.Game = game.String()
...
```

Now you are ready to handle a rejection request.

## The reject handling

As a convenience, and to follow Cosmos SDK conventions, you declare the following new errors in `x/checkers/types/errors.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/types/errors.go#L19-L20]
ErrRedAlreadyPlayed   = sdkerrors.Register(ModuleName, 1108, "red player has already played")
ErrBlackAlreadyPlayed = sdkerrors.Register(ModuleName, 1109, "black player has already played")
```

You add an event for rejection. Begin by preparing the keys in `x/checkers/types/keys.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/types/keys.go#L41-L45]
const (
    RejectGameEventKey     = "GameRejected"
    RejectGameEventCreator = "Creator"
    RejectGameEventIdValue = "IdValue"
)
```

Now, the reject steps are:

1. Fetch the relevant information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_reject_game.go#L15-L18]
    storedGame, found := k.Keeper.GetStoredGame(ctx, msg.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "game not found %s", msg.IdValue)
    }
    ```

2. Is the player expected? And, did the player already play?

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

3. Get rid of the game, as it is not interesting enough to keep:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/329c6d0ae8c1dffa85cd437d0cebb246a827dfb2/x/checkers/keeper/msg_server_reject_game.go#L34]
    k.Keeper.RemoveStoredGame(ctx, msg.IdValue)
    ```

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

5. Leave the returned object as it is.

You can confirm that your project at least compiles [with](https://docs.starport.network/cli/#starport-chain-build):

```sh
$ starport chain build
```

That is all there is to it. Once again, with Protobuf and Starport, a lot of the boilerplate is taken care of.
