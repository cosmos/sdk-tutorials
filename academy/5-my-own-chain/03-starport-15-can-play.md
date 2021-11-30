---
title: Can Play Query
order: 17
description: Help players make good transactions
---

# Can Play Query

<HighlightBox type="info">

Make sure you have all you need before proceeding:

* You understand the concepts of [queries](../3-main-concepts/12-queries.md), and [Protobuf](../3-main-concepts/09-protobuf.md).
* Have Go installed.
* The checkers blockchain up to the gas metering. Either because you followed the [previous steps](./03-starport-14-gas-meter.md) or because you checked out [its outcome](https://github.com/cosmos/b9-checkers-academy-draft/tree/gas-meter).

</HighlightBox>

As per the game mechanics you implemented earlier, a player sends a `MsgPlayMove` when [making a move](./03-starport-06-play-game.md). As is bound to happen for any message being executed/&ZeroWidthSpace;handled, this message can succeed or fail for several reasons. One error situation is when the message represents an invalid move.

It would be helpful if the player could at least make sure that a move is valid before potentially burning gas for nothing. To add this facility, you need to create a way for the player to dry-run a call to the rules' [`Move`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L274) function, i.e. without changing the game's state for this. Here queries come in handy because they are evaluated in memory and do not commit anything permanently to storage.

## New information

To conduct a proper dry-run, the player has to pass along:

* The game ID, call the field `IdValue`.
* Which player the query relates to, `player`. You need to specify it as in queries - there is no signer and thus no message `Creator`. Expect `"black"` or `"red"` in this field.
* The position to start from: `fromX` and `fromY`.
* The position to land on: `toX` and `toY`.

The information to be returned is:

* A boolean whether the move is valid, called `Possible`.
* A text reason as to why the move is not valid, called `Reason`.

As with other data structures, you can create the query message object with Starport:

```sh
$ starport scaffold query canPlayMove idValue player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool,reason
```

Among a lot of other files, you should obtain this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/proto/checkers/query.proto#L39-L51]
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

As with a transaction message, Starport has created the following boilerplate for you:

* The [Protobuf gRPC interface function](https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/proto/checkers/query.proto#L17-L19) to submit your new `QueryCanPlayMoveRequest` and its default implementation.
* The [routing of this new query](https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/types/query.pb.gw.go#L319-L337) in the query facilities.
* An [empty function](https://github.com/cosmos/b9-checkers-academy-draft/commit/f8a6e14d753554c9122a110800455d06dbe08192#diff-0fc3b6508740faee3d86a440c1dc83e71245dc49b3f8fc688b9668dc060abb8R12-R23) ready to implement the action.

## Query handling

Let's see what needs to be done to answer the player's query in `grpc_query_can_play_move.go`. Differentiate between two types of errors:

* Errors relating to the move, in which case you give a reason.
* Errors relating to the impossibility of testing the move, in which case you return an error.

1. The game needs to be fetched. If it does not exist at all, you can return an error message because you did not even test the move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/keeper/grpc_query_can_play_move.go#L23-L26]
    storedGame, found := k.GetStoredGame(ctx, req.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, types.ErrGameNotFound.Error(), req.IdValue)
    }
    ```

2. Has the game already been won?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/keeper/grpc_query_can_play_move.go#L29-L34]
    if storedGame.Winner != rules.NO_PLAYER.Color {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   types.ErrGameFinished.Error(),
        }, nil
    }
    ```

3. Is the `player` given a valid player?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/keeper/grpc_query_can_play_move.go#L37-L47]
    var player rules.Player
    if strings.Compare(rules.RED_PLAYER.Color, req.Player) == 0 {
        player = rules.RED_PLAYER
    } else if strings.Compare(rules.BLACK_PLAYER.Color, req.Player) == 0 {
        player = rules.BLACK_PLAYER
    } else {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   types.ErrCreatorNotPlayer.Error(),
        }, nil
    }
    ```

    You could create a dedicated error, instead of awkwardly reusing an existing one.

4. Is it the player's turn?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/keeper/grpc_query_can_play_move.go#L50-L59]
    game, err := storedGame.ParseGame()
    if err != nil {
        return nil, err
    }
    if !game.TurnIs(player) {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   types.ErrNotPlayerTurn.Error(),
        }, nil
    }
    ```

5. Attempt the move. Remember, it all takes place **in-memory** because that is what happens when handling a query. And report back:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/keeper/grpc_query_can_play_move.go#L62-L77]
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

6. If all went fine, then report back too:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/keeper/grpc_query_can_play_move.go#L79-L82]
    return &types.QueryCanPlayMoveResponse{
        Possible: true,
        Reason:   "ok",
    }, nil
    ```

    The enterprising learner can add more elements to the response, for instance whether a piece was captured.

That is all there is to adding your bespoke query when you let Starport handle the boilerplate.

## Next up

Do you want to give players more flexibility on which tokens they can use for the checkers blockchain's games? Let players wager any fungible token in the [next section](./03-starport-16-wager-denom.md).
