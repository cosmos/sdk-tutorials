---
title: Query - Help Find a Correct Move
order: 17
description: Help players make good transactions
tag: deep-dive
---

# Query - Help Find a Correct Move

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [queries](../2-main-concepts/queries.md), and [Protobuf](../2-main-concepts/protobuf.md).
* You have Go installed.
* The checkers blockchain codebase up to gas metering. You can get there by following the [previous steps](./gas-meter.md) or checking out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/gas-meter).

</HighlightBox>

A player sends a `MsgPlayMove` when [making a move](./play-game.md). This message can succeed or fail for several reasons. One error situation is when the message represents an invalid move.

Players should be able to make sure that a move is valid before burning gas. To add this functionality, you need to create a way for the player to call the [`Move`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L274) function without changing the game's state. You use a query because they are evaluated in memory and do not commit anything permanently to storage to achieve this.

## New information

To run a query to check the validity of a move you need to pass:

* The game ID, call the field `IdValue`.
* `player` as queries do not have a signer.
* The board position to start from: `fromX` and `fromY`.
* The board position to land on: `toX` and `toY`.

The information to be returned is:

* A boolean whether the move is valid, called `Possible`.
* A text reason as to why the move is not valid, called `Reason`.

As with other data structures, you can create the query message object with Starport:

```sh
$ starport scaffold query canPlayMove idValue player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool,reason
```

Among other files, you should now have this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/0f56961/proto/checkers/query.proto#L39-L51]
message QueryCanPlayMoveRequest {
    string idValue = 1;
    string player = 2;
    uint64 fromX = 3;
    uint64 fromY = 4;
    uint64 toX = 5;
    uint64 toY = 6;
 }

 message QueryCanPlayMoveResponse {
    bool possible = 1;
    string reason = 2;
}
```

Starport has created the following boilerplate for you:

* The [Protobuf gRPC interface function](https://github.com/cosmos/b9-checkers-academy-draft/blob/0f56961/proto/checkers/query.proto#L17-L19) to submit your new `QueryCanPlayMoveRequest` and its default implementation.
* The [routing of this new query](https://github.com/cosmos/b9-checkers-academy-draft/blob/0f56961/x/checkers/types/query.pb.gw.go#L319-L337) in the query facilities.
* An [empty function](https://github.com/cosmos/b9-checkers-academy-draft/blob/92864a4/x/checkers/keeper/grpc_query_can_play_move.go#L19) ready to implement the action.

## Query handling

Now you need to implement the answer to the player's query in `grpc_query_can_play_move.go`. Differentiate between two types of errors:

* Errors relating to the move, returning a reason.
* Errors if a move test is impossible, returning an error.

1. The game needs to be fetched. If it does not exist at all, you can return an error message because you did not test the move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0f56961/x/checkers/keeper/grpc_query_can_play_move.go#L23-L26]
    storedGame, found := k.GetStoredGame(ctx, req.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, types.ErrGameNotFound.Error(), req.IdValue)
    }
    ```

2. Has the game already been won?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0f56961/x/checkers/keeper/grpc_query_can_play_move.go#L29-L34]
    if storedGame.Winner != rules.NO_PLAYER.Color {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   types.ErrGameFinished.Error(),
        }, nil
    }
    ```

3. Is the `player` given a valid player?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0f56961/x/checkers/keeper/grpc_query_can_play_move.go#L37-L47]
    var player rules.Player
    if strings.Compare(rules.RED_PLAYER.Color, req.Player) == 0 {
        player = rules.RED_PLAYER
    } else if strings.Compare(rules.BLACK_PLAYER.Color, req.Player) == 0 {
        player = rules.BLACK_PLAYER
    } else {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf(types.ErrCreatorNotPlayer.Error(), req.Player),
        }, nil
    }
    ```

4. Is it the player's turn?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0f56961/x/checkers/keeper/grpc_query_can_play_move.go#L50-L59]
    game, err := storedGame.ParseGame()
    if err != nil {
        return nil, err
    }
    if !game.TurnIs(player) {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf(types.ErrNotPlayerTurn.Error(), player.Color),
        }, nil
    }
    ```

5. Attempt the move and report back:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0f56961/x/checkers/keeper/grpc_query_can_play_move.go#L62-L77]
    _, moveErr := game.Move(
        rules.Pos{
            X: int(req.FromX),
            Y: int(req.FromY),
        },
        rules.Pos{
            X: int(req.ToX),
            Y: int(req.ToY),
        },
    )
    if moveErr != nil {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf(types.ErrWrongMove.Error(), moveErr.Error()),
        }, nil
    }
    ```

6. If all went well:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/0f56961/x/checkers/keeper/grpc_query_can_play_move.go#L79-L82]
    return &types.QueryCanPlayMoveResponse{
        Possible: true,
        Reason:   "ok",
    }, nil
    ```

## Interact via the CLI

A friendly reminder that the CLI can always inform you about the available commands:

<CodeGroup>
<CodeGroupItem title="Checkers" active>

```sh
$ checkersd query checkers --help
```

Which prints:

```
...
Available Commands:
  can-play-move    Query canPlayMove
...
```

</CodeGroupItem>
<CodeGroupItem title="Can-play-move">

```sh
$ checkersd query checkers can-play-move --help
```

Which prints:

```
...
Usage:
  checkersd query checkers can-play-move [idValue] [player] [fromX] [fromY] [toX] [toY] [flags]
...
```

</CodeGroupItem>
</CodeGroup>

---

You can test this query at any point in a game's life.

<CodeGroup>
<CodeGroupItem title="No game" active>

```sh
$ checkersd query checkers can-play-move 2048 red 1 2 2 3
```

Trying on a game that does not exist returns:

```
Error: rpc error: code = InvalidArgument desc = game by id not found: 2048: game by id not found: %s: invalid request
...
```

Confirm this was an error from the point of view of the executable:

```sh
$ echo $?
```

Which prints:

```
1
```

There is room to improve the error message but at least you got an error, as expected.

</CodeGroupItem>
<CodeGroupItem title="Bad color">

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y
$ checkersd query checkers can-play-move 0 white 1 2 2 3
```

Trying a bad color for the player on a game that exists returns:

```
possible: false
reason: 'message creator is not a player: white'
```

Good, a proper message response and a reason elaborating on the message.

</CodeGroupItem>
<CodeGroupItem title="Wrong turn">

```sh
$ checkersd query checkers can-play-move 0 red 0 5 1 4
```

The opponent trying to play out of turn returns:

```
possible: false
reason: 'player tried to play out of turn: red'
```

</CodeGroupItem>
<CodeGroupItem title="Not your piece">

```sh
$ checkersd query checkers can-play-move 0 black 0 5 1 4
```

Black trying to play a red piece returns:

```
possible: false
reason: wrong move%!(EXTRA string=Not {red}s turn)
```

</CodeGroupItem>
<CodeGroupItem title="Correct">

```sh
$ checkersd query checkers can-play-move 0 black 1 2 2 3
```

Black testing a correct move returns:

```
possible: true
reason: ok
```

</CodeGroupItem>
<CodeGroupItem title="Must capture">

```sh
$ checkersd tx checkers play-move 0 1 2 2 3 --from $bob -y
$ checkersd tx checkers play-move 0 0 5 1 4 --from $alice -y
$ checkersd query checkers can-play-move 0 black 2 3 3 4
```

Black not capturing the mandatory red piece returns:

```
possible: false
reason: 'wrong move%!(EXTRA string=Invalid move: {2 3} to {3 4})'
```

There is room to improve the reason given.

</CodeGroupItem>
<CodeGroupItem title="After forfeit">

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y
$ checkersd tx checkers play-move 1 1 2 2 3 --from $bob -y
$ checkersd tx checkers play-move 1 0 5 1 4 --from $alice -y
$ checkersd query checkers can-play-move 1 black 2 3 0 5
```

Black trying to capture a red piece on a running game returns:

```
possible: true
reason: ok
```

Wait five minutes for the forfeit:

```sh
$ checkersd query checkers can-play-move 1 black 2 3 0 5
```

Now it returns:

```
possible: false
reason: game is already finished
```

</CodeGroupItem>
</CodeGroup>

---

That will do nicely.

## Next up

Do you want to give players more flexibility on which tokens they can use for games? Let players wager any fungible token in the [next section](./wager-denom.md).
