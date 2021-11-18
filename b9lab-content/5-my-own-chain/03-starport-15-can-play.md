---
title: Can Play Query
order: 17
description: Help players make good transactions.
---

# Can Play Query

When a player makes a move, they send a transaction. This transaction can succeed but also fail for a number of reasons. One of these reasons is that the move was invalid. Would it not be good if the player could make sure, in code, that the move is valid on the board waiting for their turn? Yes, it would.

For this to happen you need to open a way for the player to hit the rules' `Move` function without changing the blockchain state. That's where queries come in, they are evaluated in memory. As before, you get assistance from Starport.

## New Information

What does the player have to pass along for a proper check?

* The game id, let's call the field `IdValue`.
* Which player this is about: `player`. You need to specify it because in queries, there is no signer, and so no `Creator`. Make it simpler and expect `"black"` or `"red"` in this field.
* The position to start from: `fromX` and `fromY`.
* The position to land on: `toX` and `toY`.

What information ought to be returned?

* A boolean whether the move is valid: `Possible`.
* A text reason as to why the move is not valid, to be nice: `Reason`.

You can now create the query message object with Starport. Keep in mind that you can give only one return value in the Starport `scaffold` command:

```sh
$ starport scaffold query canPlayMove idValue player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool
```
After that you add the reason:

```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/proto/checkers/query.proto#L39-L51]
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
As with a transaction message, Starport has created the boilerplate for you:

* The [Protobuf gRPC interface function](https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/proto/checkers/query.proto#L17-L19) to submit your new `QueryCanPlayMoveRequest`, plus its default implementation.
* The [routing of this new query](https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/types/query.pb.gw.go#L319-L337) in the query facilities.
* An empty function ready for you to implement the meat of the action: `x/checkers/keeper/grpc_query_can_play_move.go`.

## Query Handling

So let's see what needs to be done to answer the player's query, in `x/checkers/keeper/grpc_query_can_play_move.go`. Here, you differentiate between two types of errors:

* Those that relate to the move, in which case you give a reason.
* Those that relate to the impossibility of testing the move, in which case you return an error.

The game needs to be fetched. If it does not exist at all, you can return an error message because you did not even test the move:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/keeper/grpc_query_can_play_move.go#L23-L26]
storedGame, found := k.GetStoredGame(ctx, req.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, types.ErrGameNotFound.Error(), req.IdValue)
    }
```
Has the game already been won:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/keeper/grpc_query_can_play_move.go#L29-L34]
if storedGame.Winner != rules.NO_PLAYER.Color {
    return &types.QueryCanPlayMoveResponse{
        Possible: false,
        Reason:   types.ErrGameFinished.Error(),
    }, nil
}
```
Is the `player` given a valid player:

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
Is it the player's turn:

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
Attempt the move, **in memory** because that's what happens when handling a query, and report back:

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
If all went ok, then report back too:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/b53297d8e87e31b1fc7fb839fce527e66a2a0116/x/checkers/keeper/grpc_query_can_play_move.go#L79-L82]
return &types.QueryCanPlayMoveResponse{
    Possible: true,
    Reason:   "ok",
}, nil
```

That's all there is to it. For which you can thank Starport that handled the boilerplate.
