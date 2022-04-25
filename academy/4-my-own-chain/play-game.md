---
title: Message and Handler - Add a Way to Make a Move
order: 8
description: You play a game
tag: deep-dive
---

# Message and Handler - Add a Way to Make a Move

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [transactions](../2-main-concepts/transactions.md), [messages](../2-main-concepts/messages.md)), and [Protobuf](../2-main-concepts/protobuf.md).
* Have Go installed.
* The checkers blockchain codebase with `MsgCreateGame` and its handling. You can get there by following the [previous steps](./create-handling.md) or checking out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-handler).

</HighlightBox>

To play a game a player only needs to specify:

* The ID of the game the player wants to join. Call the field `idValue`.
* The initial positions of the pawn. Call the fields `fromX` and `fromY` and make them `uint`.
* The final position of the pawn after a player's move. Call the fields `toX` and `toY` to be `uint` too.

The player does not need to be explicitly added as a field in the message because the player **is** implicitly the signer of the message. Name the object `PlayMove`.

Unlike when creating the game, you want to return:

* The game ID again. Call this field `idValue`.
* The captured piece, if any. Call the fields `capturedX` and `capturedY`.
* The winner in the field `winner`.

## With Ignite CLI

Now Ignite CLI only creates a response object with a single field. You can update the object after Ignite CLI has run:

```sh
$ ignite scaffold message playMove idValue fromX:uint fromY:uint toX:uint toY:uint --module checkers --response idValue
```

Ignite CLI once more creates all the necessary Protobuf files and the boilerplate for you. All you have left to do is:

* Add the missing fields to the response in `proto/checkers/tx.proto`:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc4feaf38687092712849f35a5d74a11378/proto/checkers/tx.proto#L25-L30]
    message MsgPlayMoveResponse {
        string idValue = 1;
        int64 capturedX = 2;
        int64 capturedY = 3;
        string winner = 4;
    }
    ```

    Use `int64` here so that you can enter `-1` when no pawns have been captured.

* Fill in the needed part in `x/checkers/keeper/msg_server_play_move.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f52a673c3fbd2c31c408f0c0aecb70d8c1a880f7/x/checkers/keeper/msg_server_play_move.go#L10-L17]
    func (k msgServer) PlayMove(goCtx context.Context, msg *types.MsgPlayMove) (*types.MsgPlayMoveResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgPlayMoveResponse{}, nil
    }
    ```

    Where the `TODO` is replaced as per below.

## The move handling

`rules` represent the ready-made file containing the rules of the game you imported earlier. Declare them in `x/checkers/types/errors.go` given your code has to handle new error situations:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc4feaf38687092712849f35a5d74a11378/x/checkers/types/errors.go#L14-L18]
ErrGameNotFound     = sdkerrors.Register(ModuleName, 1104, "game by id not found: %s")
ErrCreatorNotPlayer = sdkerrors.Register(ModuleName, 1105, "message creator is not a player: %s")
ErrNotPlayerTurn    = sdkerrors.Register(ModuleName, 1106, "player tried to play out of turn: %s")
ErrWrongMove        = sdkerrors.Register(ModuleName, 1107, "wrong move")
```

Take the following steps to replace the `TODO`:

1. Fetch the stored game information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L16-L19]
    storedGame, found := k.Keeper.GetStoredGame(ctx, msg.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "game not found %s", msg.IdValue)
    }
    ```

    Using the [`Keeper.GetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc4feaf38687092712849f35a5d74a11378/x/checkers/keeper/stored_game.go#L17) function created by Ignite CLI.

2. Is the player legitimate? Check with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L22-L29]
    var player rules.Player
    if strings.Compare(storedGame.Red, msg.Creator) == 0 {
        player = rules.RED_PLAYER
    } else if strings.Compare(storedGame.Black, msg.Creator) == 0 {
        player = rules.BLACK_PLAYER
    } else {
        return nil, types.ErrCreatorNotPlayer
    }
    ```

    Using the certainty that the `MsgPlayMove.Creator` has been verified [by its signature](https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc4feaf38687092712849f35a5d74a11378/x/checkers/types/message_play_move.go#L29-L35).

3. Instantiate the board to implement the rules:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L32-L35]
    game, err := storedGame.ParseGame()
    if err != nil {
        panic(err.Error())
    }
    ```

    Good thing you previously created [this helper](https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc4feaf38687092712849f35a5d74a11378/x/checkers/types/full_game.go#L24-L33).

4. Is it the player's turn? Check with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L36-L38]
    if !game.TurnIs(player) {
        return nil, types.ErrNotPlayerTurn
    }
    ```

    Using the rules file's own [`TurnIs`](https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc4feaf38687092712849f35a5d74a11378/x/checkers/rules/checkers.go#L145-L147) function.

5. Properly conduct the move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L41-L53]
    captured, moveErr := game.Move(
        rules.Pos{
            X: int(msg.FromX),
            Y: int(msg.FromY),
        },
        rules.Pos{
            X: int(msg.ToX),
            Y: int(msg.ToY),
        },
    )
    if moveErr != nil {
        return nil, sdkerrors.Wrapf(moveErr, types.ErrWrongMove.Error())
    }
    ```

    Using the rules' [`Move`](https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc4feaf38687092712849f35a5d74a11378/x/checkers/rules/checkers.go#L274-L301) function.

6. Prepare the updated board to be stored and store the information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L56-L58]
    storedGame.Game = game.String()
    storedGame.Turn = game.Turn.Color
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

    Updating the fields that were modified using the [`Keeper.SetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc4feaf38687092712849f35a5d74a11378/x/checkers/keeper/stored_game.go#L10) function just as when you created and saved the game.

7. Return relevant information regarding the move's result:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L61-L66]
    return &types.MsgPlayMoveResponse{
        IdValue:   msg.IdValue,
        CapturedX: int64(captured.X),
        CapturedY: int64(captured.Y),
        Winner:    game.Winner().Color,
    }, nil
    ```

    The `Captured` and `Winner` information would be lost if you do not. More accurately, one would have to replay the transaction to find out the values. Better be a good citizen and make this information easily accessible.

That is all there is to it: good preparation and the use of Ignite CLI.

## Next up

Before you add a third Message to let a player [reject a game](./reject-game.md), add events to the existing message handlers for relevant information. That is the object of the [next section](./events.md).

If you want to skip ahead and see how you can assist a player in not submitting a transaction that would result in a failed move, you can [create a query to test a move](./can-play.md).
