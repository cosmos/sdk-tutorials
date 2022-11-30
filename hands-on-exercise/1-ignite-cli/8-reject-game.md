---
title: "Make Sure a Player Can Reject a Game"
order: 9
description: Message and handler - reject a game
tags:
  - guided-coding
  - cosmos-sdk
---

# Make Sure a Player Can Reject a Game

<HighlightBox type="prerequisite">

Before proceeding, make sure you have all you need:

* You understand the concepts of [transactions](/academy/2-cosmos-concepts/3-transactions.md), [messages](/academy/2-cosmos-concepts/4-messages.md), and [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md).
* You know how to [create a message](./4-create-message.md) with Ignite CLI, and code [its handling](./5-create-handling.md). This section does not aim to repeat what can be learned in earlier sections.
* Go is installed.
* You have the checkers blockchain codebase with the previous messages and their events. If not, follow the [previous steps](./7-events.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/two-events).

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
* How do you use your files that implement the checkers rules?
* What do you do with a rejected game?

## Code needs

When you think about the code you might need, try to first answer the following questions:

* What Ignite CLI commands will create your message?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

As before, do not bother yet with niceties like gas metering.

If anyone can create a game for any two other players, it is important to allow a player to reject a game. But a player should not be allowed to reject a game once they have made their first move.

To reject a game, a player needs to provide the ID of the game that the player wants to reject. Call the field `gameIndex`. This should be sufficient, as the signer of the message is implicitly the player.

## Working with Ignite CLI

Name the message object `RejectGame`. Invoke Ignite CLI:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite scaffold message rejectGame gameIndex --module checkers
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite scaffold message rejectGame gameIndex --module checkers
```

</CodeGroupItem>

</CodeGroup>

This creates all the boilerplate for you and leaves a single place for the code you want to include:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-msg/x/checkers/keeper/msg_server_reject_game.go#L10-L17]
func (k msgServer) RejectGame(goCtx context.Context, msg *types.MsgRejectGame) (*types.MsgRejectGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgRejectGameResponse{}, nil
}
```

## Additional information

A new rule of the game should be that a player cannot reject a game once they begin to play. When loading a `StoredGame` from storage you have no way of knowing whether a player already played or not. To access this information add a new field to the `StoredGame` called `MoveCount`. In `proto/checkers/stored_game.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/proto/checkers/stored_game.proto#L12]
message StoredGame {
    ...
    uint64 moveCount = 6;
}
```

Run Protobuf to recompile the relevant Go files:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite generate proto-go
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite generate proto-go
```

</CodeGroupItem>

</CodeGroup>

`MoveCount` should start at `0` and increment by `1` on each move.

1. Adjust it first in the handler when creating the game:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_create_game.go#L28]
    storedGame := types.StoredGame{
        ...
        MoveCount: 0,
    }
    ```

2. Before saving to the storage, adjust it in the handler when playing a move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_play_move.go#L57]
    ...
    storedGame.MoveCount++
    storedGame.Game = game.String()
    ...
    ```

With `MoveCount` counting properly, you are now ready to handle a rejection request.

## The reject handling

To follow the Cosmos SDK conventions, declare the following new errors:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/types/errors.go#L18-L19]
ErrBlackAlreadyPlayed = sdkerrors.Register(ModuleName, 1107, "black player has already played")
ErrRedAlreadyPlayed   = sdkerrors.Register(ModuleName, 1108, "red player has already played")
```

This time you will add an event for rejection. Begin by preparing the new keys:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/types/keys.go#L45-L49]
const (
    GameRejectedEventType      = "game-rejected"
    GameRejectedEventCreator   = "creator"
    GameRejectedEventGameIndex = "game-index"
)
```

In the message handler, the reject steps are:

1. Fetch the relevant information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game.go#L14-L17]
    storedGame, found := k.Keeper.GetStoredGame(ctx, msg.GameIndex)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "%s", msg.GameIndex)
    }
    ```

2. Is the player expected? Did the player already play? Check with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game.go#L19-L29]
    if storedGame.Black == msg.Creator {
        if 0 < storedGame.MoveCount { // Notice the use of the new field
            return nil, types.ErrBlackAlreadyPlayed
        }
    } else if storedGame.Red == msg.Creator {
        if 1 < storedGame.MoveCount { // Notice the use of the new field
            return nil, types.ErrRedAlreadyPlayed
        }
    } else {
        return nil, sdkerrors.Wrapf(types.ErrCreatorNotPlayer, "%s", msg.Creator)
    }
    ```

    Remember that the player with the color black plays first.

3. Remove the game using the [`Keeper.RemoveStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/create-game-msg/x/checkers/keeper/stored_game.go#L38) function created long ago by the `ignite scaffold map storedGame...` command:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game.go#L31]
    k.Keeper.RemoveStoredGame(ctx, msg.GameIndex)
    ```

4. Emit the relevant event:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game.go#L33-L38]
    ctx.EventManager().EmitEvent(
        sdk.NewEvent(types.GameRejectedEventType,
            sdk.NewAttribute(types.GameRejectedEventCreator, msg.Creator),
            sdk.NewAttribute(types.GameRejectedEventGameIndex, msg.GameIndex),
        ),
    )
    ```

5. Leave the returned object as it is, as you have nothing new to tell the caller.

Finally, confirm that your project at least compiles [with](https://docs.ignite.com/cli/#ignite-chain-build):

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite chain build
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite chain build
```

</CodeGroupItem>

</CodeGroup>

## Unit tests

Before testing what you did when rejecting a game, you have to fix the existing tests by adding [`MoveCount: 0`](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_create_game_test.go#L61) ([or more](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_play_move_test.go#L370)) when testing a retrieved `StoredGame`.

When you are done with the existing tests, the tests for _reject_ here are similar to those you created for _create_ and _play_, except that now you test a game rejection [by the game creator](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game_test.go#L28-L36), the [black player](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game_test.go#L200-L216), or the [red player](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game_test.go#L84-L92) which is made [before anyone has played](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game_test.go#L38-L46), or after [one](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game_test.go#L130-L146) or [two moves](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game_test.go#L218-L242) have been made. Check also that the [game is removed](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game_test.go#L48-L62), and that [events are emitted](https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game_test.go#L64-L82).

For instance:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/reject-game-handler/x/checkers/keeper/msg_server_reject_game_test.go#L148-L170]
func TestRejectGameByRedOneMoveRemovedGame(t *testing.T) {
    msgServer, keeper, context := setupMsgServerWithOneGameForRejectGame(t)
    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator:   bob,
        GameIndex: "1",
        FromX:     1,
        FromY:     2,
        ToX:       2,
        ToY:       3,
    })
    msgServer.RejectGame(context, &types.MsgRejectGame{
        Creator:   carol,
        GameIndex: "1",
    })
    systemInfo, found := keeper.GetSystemInfo(sdk.UnwrapSDKContext(context))
    require.True(t, found)
    require.EqualValues(t, types.SystemInfo{
        NextId: 2,
    }, systemInfo)
    _, found = keeper.GetStoredGame(sdk.UnwrapSDKContext(context), "1")
    require.False(t, found)
}
```

Try these tests:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ go test github.com/alice/checkers/x/checkers/keeper
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i go test github.com/alice/checkers/x/checkers/keeper
```

</CodeGroupItem>

</CodeGroup>

## Interact with the CLI

Time to see if it is possible to reject a game from the command line. If you did not do it already, start your chain with Ignite.

First, is it possible to reject the current game from the command line?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers --help
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers --help
```

</CodeGroupItem>

</CodeGroup>


This prints:

```txt
...
Available Commands:
...
  reject-game Broadcast message rejectGame
```

`reject-game` is the command. What is its syntax?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers reject-game --help
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers reject-game --help
```

</CodeGroupItem>

</CodeGroup>

This prints:

```txt
...
Usage:
  checkersd tx checkers reject-game [game-index] [flags]
```

Have Bob, who played poorly in game `1`, try to reject it:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers reject-game 1 --from $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers reject-game 1 --from $bob
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
...
raw_log: '[{"events":[{"type":"game-rejected","attributes":[{"key":"creator","value":"cosmos14g3qw6nkk8zc762k87cg77w7vd8xdnffnp2w6u"},{"key":"game-index","value":"1"}]},{"type":"message","attributes":[{"key":"action","value":"reject_game"}]}]}]'
```

Against expectations, the system carried out Bob's request to reject the game. Confirm that the game has indeed been removed from storage:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
Error: rpc error: code = NotFound desc = rpc error: code = NotFound desc = not found: key not found
...
```

<HighlightBox type="learning">

How is it possible that Bob could reject a game he had already played in, despite the code preventing that? Because game `1` was created in an earlier version of your code. This earlier version created **a game without any `.MoveCount`**, or more precisely with `MoveCount == 0`. When you later added the code for rejection, Ignite CLI kept the current state of your blockchain. In effect, your blockchain was in a **broken** state, where **the code and the state were out of sync**.

To see how to properly handle code changes that would otherwise result in a broken state, see the section on [migrations](/hands-on-exercise/4-run-in-prod/2-migration.md).

</HighlightBox>

You have to create other games and test the rejection on them. Notice the incrementing game ID.

<PanelList>

<PanelListItem number="1">

Black rejects:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
$ checkersd tx checkers reject-game 2 --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $alice
$ docker exec -it checkers checkersd tx checkers reject-game 2 --from $alice
```

</CodeGroupItem>

</CodeGroup>

Above, Alice creates a game and rejects it immediately. This returns:

```txt
...
raw_log: '[{"events":[{"type":"game-rejected","attributes":[{"key":"creator","value":"cosmos1uhfa4zhsvz7cyec7r62p82swk8c85jaqt2sff5"},{"key":"game-index","value":"2"}]},{"type":"message","attributes":[{"key":"action","value":"reject_game"}]}]}]'
```

Correct result, because nobody played a move.

</PanelListItem>

<PanelListItem number="2">

Red rejects:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
$ checkersd tx checkers reject-game 3 --from $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $alice
$ docker exec -it checkers checkersd tx checkers reject-game 3 --from $bob
```

</CodeGroupItem>

</CodeGroup>

Above, Alice creates a game and Bob rejects it immediately. This returns:

```txt
...
raw_log: '[{"events":[{"type":"game-rejected","attributes":[{"key":"creator","value":"cosmos14g3qw6nkk8zc762k87cg77w7vd8xdnffnp2w6u"},{"key":"game-index","value":"3"}]},{"type":"message","attributes":[{"key":"action","value":"reject_game"}]}]}]'
```

Correct again, because nobody played a move.

</PanelListItem>

<PanelListItem number="3">

Black plays and rejects:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
$ checkersd tx checkers play-move 4 1 2 2 3 --from $alice
$ checkersd tx checkers reject-game 4 --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $alice
$ docker exec -it checkers checkersd tx checkers play-move 4 1 2 2 3 --from $alice
$ docker exec -it checkers checkersd tx checkers reject-game 4 --from $alice
```

</CodeGroupItem>

</CodeGroup>

Above, Alice creates a game, makes a move, and then rejects the game. This returns:

```txt
...
raw_log: 'failed to execute message; message index: 0: black player has already played'
```

Correct: the request fails, because Alice has already played a move.

</PanelListItem>

<PanelListItem number="4">

Alice plays and Bob rejects:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
$ checkersd tx checkers play-move 5 1 2 2 3 --from $alice
$ checkersd tx checkers reject-game 5 --from $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $alice
$ docker exec -it checkers checkersd tx checkers play-move 5 1 2 2 3 --from $alice
$ docker exec -it checkers checkersd tx checkers reject-game 5 --from $bob
```

</CodeGroupItem>

</CodeGroup>

Above, Alice creates a game, makes a move, and Bob rejects the game. This returns:

```txt
...
raw_log: '[{"events":[{"type":"game-rejected","attributes":[{"key":"creator","value":"cosmos14g3qw6nkk8zc762k87cg77w7vd8xdnffnp2w6u"},{"key":"game-index","value":"5"}]},{"type":"message","attributes":[{"key":"action","value":"reject_game"}]}]}]'
```

Correct: Bob has not played a move yet, so he can still reject the game.

</PanelListItem>

<PanelListItem number="5" :last="true">

Alice & Bob play, Bob rejects:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
$ checkersd tx checkers play-move 6 1 2 2 3 --from $alice
$ checkersd tx checkers play-move 6 0 5 1 4 --from $bob
$ checkersd tx checkers reject-game 6 --from $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob --from $alice
$ docker exec -it checkers checkersd tx checkers play-move 6 1 2 2 3 --from $alice
$ docker exec -it checkers checkersd tx checkers play-move 6 0 5 1 4 --from $bob
$ docker exec -it checkers checkersd tx checkers reject-game 6 --from $bob
```

</CodeGroupItem>

</CodeGroup>

Above, Alice creates a game and makes a move, then Bob makes a poor move and rejects the game. This returns:

```txt
...
raw_log: 'failed to execute message; message index: 0: red player has already played'
```

Correct: this time Bob could not reject the game because the state recorded his move in `.MoveCount`.

</PanelListItem>

</PanelList>

---

<HighlightBox type="warning">

To belabor the point made in the earlier box: if you change your code, think about what it means for the current state of the chain and whether you end up in a broken state.
<br/><br/>
In this case, you could first introduce the `MoveCount` and its handling. Then when all games have been correctly counted, you introduce the rejection mechanism.

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to use messages and handlers to build on the gameplay functionalities of your application by adding the capacity for players to reject participating in a game.
* How to create a new `RejectGame` message object including ID of the game to be rejected.
* How to add a new rule with the necessary additional information to prevent players from backing out of games in which they have already played moves, and how to declare new errors that respond to attempts to break this new rule.
* How to add a unit test to check that games can be rejected by the game creator, the black player, and the red player under the approved circumstances, and to check that rejected games are removed and that events are emitted.
* How to interact via the CLI to confirm the new "game rejection" function is performing as required, and to be aware that preexisting games will permit incorrect game rejection due to your blockchain being in a broken state due to your subsequent changes.

</HighlightBox>

<!--## Next up

Next week's sections cover forfeits and how games end. In the next section, you create a [doubly-linked FIFO](/hands-on-exercise/2-ignite-cli-adv/1-game-fifo.md). Later you add [deadline](/hands-on-exercise/2-ignite-cli-adv/2-game-deadline.md) and [game winner](/hands-on-exercise/2-ignite-cli-adv/3-game-winner.md) fields, before being able to finally [enforce the forfeit](/hands-on-exercise/2-ignite-cli-adv/4-game-forfeit.md).

<HighlightBox type="tip">

If you want to enable token wagers in your games instead, skip ahead to [wagers](/hands-on-exercise/2-ignite-cli-adv/5-game-wager.md).

</HighlightBox>-->
