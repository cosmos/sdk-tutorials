---
title: "Message and Handler - Make Sure a Player Can Reject a Game"
order: 11
description: Reject a game
tag: deep-dive
---

# Message and Handler - Make Sure a Player Can Reject a Game

<HighlightBox type="prerequisite">

Before proceeding, make sure you have all you need:

* You understand the concepts of [transactions](../2-main-concepts/transactions.md), [messages](../2-main-concepts/messages.md)), and [Protobuf](../2-main-concepts/protobuf.md).
* You know how to [create a message](./create-message.md) with Ignite CLI, and code [its handling](./create-handling.md). This section does not aim to repeat what can be learned in earlier sections.
* Go is installed.
* You have the checkers blockchain codebase with the previous messages and their events. If not, follow the [previous steps](./events.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-two-events).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Add a new protocol rule.
* Define custom errors.
* Add a message handler.
* Extend unit tests.

</HighlightBox>

Your blockchain can now create and play games, and inform the outside world about the process. It would be good to add a way for players to back out of games they do not want to play. What do you need to make this possible?

## Some initial thoughts

Ask yourself:

* What goes into the message?
* How do you sanitize the inputs?
* How do you unequivocally identify games?
* What conditions have to be satisfied to reject a game?
* How do you report back errors?
* What event should you emit?
* How do you use your files that implement the Checkers rules?
* What do you do with a rejected game?

## Code needs

When you think about the code you might need, try to first answer the following questions:

* What Ignite CLI commands will create your message?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

As before, do not bother yet with niceties like gas metering.

If anyone can create a game for any two other players, it is important to allow a player to reject a game. But a player should not be allowed to reject a game once they have made their first move.

To reject a game, a player needs to provide the ID of the game that the player wants to reject. Call the field `idValue`. This should be sufficient, as the signer of the message is implicitly the player.

## Working with Ignite CLI

Name the message object `RejectGame`. Invoke Ignite CLI:

```sh
$ ignite scaffold message rejectGame idValue --module checkers
```

This creates all the boilerplate for you and leaves a single place for the code you want to include:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/93d048c/x/checkers/keeper/msg_server_reject_game.go#L10-L17]
func (k msgServer) RejectGame(goCtx context.Context, msg *types.MsgRejectGame) (*types.MsgRejectGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgRejectGameResponse{}, nil
}
```

## Additional information

A new rule of the game should be that a player cannot reject a game once they begin to play. When loading a `StoredGame` from storage you have no way of knowing whether a player already played or not. To access this information add a new field to the `StoredGame` called `MoveCount`. In `proto/checkers/stored_game.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/proto/checkers/stored_game.proto#L13]
message StoredGame {
    ...
    uint64 moveCount = 7;
}
```

Run Protobuf to recompile the relevant Go files:

```sh
$ ignite generate proto-go
```

`MoveCount` should start at `0` and increment by `1` on each move. Adjust it first in the handler when creating the game:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_create_game.go#L28]
storedGame := types.StoredGame{
    ...
    MoveCount: 0,
}
```

Before saving to the storage, in the handler when playing a move:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_play_move.go#L59]
...
storedGame.MoveCount++
storedGame.Game = game.String()
...
```

With `MoveCount` counting properly, you are now ready to handle a rejection request.

## The reject handling

To follow the Cosmos SDK conventions, declare the following new errors:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/types/errors.go#L19-L20]
ErrRedAlreadyPlayed   = sdkerrors.Register(ModuleName, 1108, "red player has already played")
ErrBlackAlreadyPlayed = sdkerrors.Register(ModuleName, 1109, "black player has already played")
```

Now you will add an event for rejection. Begin by preparing the new keys:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/types/keys.go#L41-L45]
const (
    RejectGameEventKey     = "GameRejected"
    RejectGameEventCreator = "Creator"
    RejectGameEventIdValue = "IdValue"
)
```

In the message handler, the reject steps are:

1. Fetch the relevant information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game.go#L15-L18]
    storedGame, found := k.Keeper.GetStoredGame(ctx, msg.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "game not found %s", msg.IdValue)
    }
    ```

2. Is the player expected? Did the player already play? Check with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game.go#L21-L31]
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

3. Remove the game using the [`Keeper.RemoveStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/keeper/stored_game.go#L30) function created long ago by the `ignite scaffold map storedGame...` command:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game.go#L34]
    k.Keeper.RemoveStoredGame(ctx, msg.IdValue)
    ```

4. Emit the relevant event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game.go#L37-L44]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(sdk.EventTypeMessage,
            sdk.NewAttribute(sdk.AttributeKeyModule, "checkers"),
            sdk.NewAttribute(sdk.AttributeKeyAction, types.RejectGameEventKey),
            sdk.NewAttribute(types.RejectGameEventCreator, msg.Creator),
            sdk.NewAttribute(types.RejectGameEventIdValue, msg.IdValue),
        ),
    )
    ```

5. Leave the returned object as it is, as you have nothing new to tell the caller.

Finally, confirm that your project at least compiles [with](https://docs.ignite.com/cli/#ignite-chain-build):

```sh
$ ignite chain build
```

## Unit tests

The tests here are similar to those you created for _create_ and _play_, except that now you test a game rejection [by the game creator](https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game_test.go#L27-L35), the [black player](https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game_test.go#L199-L215), or the [red player](https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game_test.go#L83-L91) which is made [before anyone has played](https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game_test.go#L37-L45), or after [one](https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game_test.go#L129-L145) or [two moves](https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game_test.go#L217-L241) have been made. Check also that the [game is removed](https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game_test.go#L47-L61), and that [events are emitted](https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game_test.go#L63-L81).

For instance:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/59db7fb5/x/checkers/keeper/msg_server_reject_game_test.go#L147-L169]
func TestRejectGameByRedOneMoveRemovedGame(t *testing.T) {
    msgServer, keeper, context := setupMsgServerWithOneGameForRejectGame(t)
    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator: carol,
        IdValue: "1",
        FromX:   1,
        FromY:   2,
        ToX:     2,
        ToY:     3,
    })
    msgServer.RejectGame(context, &types.MsgRejectGame{
        Creator: bob,
        IdValue: "1",
    })
    nextGame, found := keeper.GetNextGame(sdk.UnwrapSDKContext(context))
    require.True(t, found)
    require.EqualValues(t, types.NextGame{
        Creator: "",
        IdValue: 2,
    }, nextGame)
    _, found = keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "1")
    require.False(t, found)
}
```

## Interact with the CLI

Time to see if it is possible to reject a game.

First, is it possible to reject the current game from the command line?

```sh
$ checkersd tx checkers --help
```

This prints:

```
...
Available Commands:
...
  reject-game Broadcast message rejectGame
```

`reject-game` is the command. What is its syntax?

```sh
$ checkersd tx checkers reject-game --help
```

This prints:

```
...
Usage:
  checkersd tx checkers reject-game [idValue] [flags]
```

Have Alice, who played poorly in game `1`, try to reject it:

```sh
$ checkersd tx checkers reject-game 1 --from $alice
```

This returns:

```
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"RejectGame"},{"key":"module","value":"checkers"},{"key":"action","value":"GameRejected"},{"key":"Creator","value":"cosmos1gml05nvlhr0k27unas8mj827z6m77lhfpzzr3l"},{"key":"IdValue","value":"1"}]}]}]'
```

Against expectations, the system carried out Alice's request to reject the game.

<HighlightBox type="warn">

How is it possible that Alice could reject a game she had already played in, despite the code preventing that? Because game `0` was created in an earlier version of your code. This earlier version created **a game without any `.MoveCount`**. When you later added the code for rejection, Ignite CLI kept the current state of your blockchain. In effect, your blockchain was in a **broken** state, where **the code and the state were out of sync**.
<br></br>
To see how to properly handle code changes that would otherwise result in a broken state, see the section on [migrations](./migration.md).

</HighlightBox>

You need to create other games and test the rejection on them. Notice the incrementing game ID.

<PanelList>
<PanelListItem number="1">

Bob rejects:

```sh
$ checkersd tx checkers create-game $alice $bob --from $bob
$ checkersd tx checkers reject-game 2 --from $bob
```

Above, Bob creates a game and rejects it immediately. This returns:

```
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"RejectGame"},{"key":"module","value":"checkers"},{"key":"action","value":"GameRejected"},{"key":"Creator","value":"cosmos1w0uumlj04eyvevhfawasm2dtjc24nexxygr8qx"},{"key":"IdValue","value":"2"}]}]}]'
```

Correct result, because nobody played a move.

</PanelListItem>
<PanelListItem number="2">

Alice rejects:

```sh
$ checkersd tx checkers create-game $alice $bob --from $bob
$ checkersd tx checkers reject-game 3 --from $alice
```

Above, Bob creates a game and Alice rejects it immediately. This returns:

```
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"RejectGame"},{"key":"module","value":"checkers"},{"key":"action","value":"GameRejected"},{"key":"Creator","value":"cosmos1gml05nvlhr0k27unas8mj827z6m77lhfpzzr3l"},{"key":"IdValue","value":"3"}]}]}]'
```

Correct again, because nobody played a move.

</PanelListItem>
<PanelListItem number="3">

Bob plays and rejects:

```sh
$ checkersd tx checkers create-game $alice $bob --from $bob
$ checkersd tx checkers play-move 4 1 2 2 3 --from $bob
$ checkersd tx checkers reject-game 4 --from $bob
```

Above, Bob creates a game, makes a move, and then rejects the game. This returns:

```
...
raw_log: 'failed to execute message; message index: 0: black player has already played'
```

Correct: the request fails, because Bob has already played a move.

</PanelListItem>
<PanelListItem number="4">

Bob plays and Alice rejects:

```sh
$ checkersd tx checkers create-game $alice $bob --from $bob
$ checkersd tx checkers play-move 5 1 2 2 3 --from $bob
$ checkersd tx checkers reject-game 5 --from $alice
```

Above, Bob creates a game, makes a move, and Alice rejects the game. This returns:

```
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"RejectGame"},{"key":"module","value":"checkers"},{"key":"action","value":"GameRejected"},{"key":"Creator","value":"cosmos1gml05nvlhr0k27unas8mj827z6m77lhfpzzr3l"},{"key":"IdValue","value":"5"}]}]}]'
```

Correct: Alice has not played a move yet, so she can still reject the game.

</PanelListItem>
<PanelListItem number="5" :last="true">

Bob & Alice play, Alice rejects:

```sh
$ checkersd tx checkers create-game $alice $bob --from $bob
$ checkersd tx checkers play-move 6 1 2 2 3 --from $bob
$ checkersd tx checkers play-move 6 0 5 1 4 --from $alice
$ checkersd tx checkers reject-game 6 --from $alice
```

Above, Bob creates a game and makes a move, then Alice makes a poor move and rejects the game. This returns:

```
...
raw_log: 'failed to execute message; message index: 0: red player has already played'
```

Correct: this time Alice could not reject the game because the state recorded her move in `.MoveCount`.

</PanelListItem>
</PanelList>

---

<HighlightBox type="warning">

To belabor the point made in the earlier warning box: if you change your code, think about what it means for the current state of the chain and whether you end up in a broken state.

</HighlightBox>

## Next up

The [next section](./game-fifo.md) covers modularity and data organization styles. You create a [doubly-linked FIFO](./game-fifo.md).

Later you add [deadline](./game-deadline.md) and [game winner](./game-winner.md) fields, before being able to finally [enforce the forfeit](./game-forfeit.md).

<HighlightBox type="tip">

If you want to enable token wagers in your games instead, skip ahead to [wagers](./game-wager.md).

</HighlightBox>
