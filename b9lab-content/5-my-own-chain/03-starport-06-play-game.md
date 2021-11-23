---
title: The Play Game Elements
order: 8
description: You play a game.
---

# The Play Game Elements

In order to see in details what Starport would create, refer back to [The Create Game Message](./03-starport-04-create-message.md). Here, it is sufficient to say that to play a game, a player only needs to specify:

* The id of the game to play in. Let's call the field `idValue`.
* The initial position of the pawn to play. Let's call the fields `fromX` and `fromY`.
* The final position of the pawn to play. Let's call the fields `toX` and `toY`.

The player need not be made explicit as a field in the message because, implicitly, it is the signer of the message. Let's name the object `PlayMove`. Now, unlike when creating the game, here you may want to return more than just a game id. In particular:

* The game id. Let's call the field `idValue` too.
* A potential captured piece. Let's call the fields `capturedX` and `capturedY`.
* A potential winner. Let's call the field `winner`.

## With Starport

Now, Starport only creates a response object with a single field. Not to worry, you can update the object after Starport has run. Therefore:

```sh
$ starport scaffold message playMove idValue fromX:uint fromY:uint toX:uint toY:uint --module checkers --response idValue
```
Once more, Starport has created all the necessary Protobuf files and the boilerplate for you. All you are left to do is:

* Add to `proto/checkers/tx.proto`:
    ```proto [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc4feaf38687092712849f35a5d74a11378/proto/checkers/tx.proto#L25-L30]
    message MsgPlayMoveResponse {
        string idValue = 1;
        int64 capturedX = 2;
        int64 capturedY = 3;
        string winner = 4;
    }
    ```
* Fill in the meaty part in `x/checkers/keeper/msg_server_play_move.go`:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f52a673c3fbd2c31c408f0c0aecb70d8c1a880f7/x/checkers/keeper/msg_server_play_move.go#L10-L17]
    func (k msgServer) PlayMove(goCtx context.Context, msg *types.MsgPlayMove) (*types.MsgPlayMoveResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgPlayMoveResponse{}, nil
    }
    ```

You should start getting the hang of it.

## The Move Handling Part

Below, `rules` represent the ready-made file with the rules of the game you imported earlier. And the following errors have been declared in `x/checkers/types/errors.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc4feaf38687092712849f35a5d74a11378/x/checkers/types/errors.go#L14-L18]
ErrGameNotFound     = sdkerrors.Register(ModuleName, 1104, "game by id not found: %s")
ErrCreatorNotPlayer = sdkerrors.Register(ModuleName, 1105, "message creator is not a player: %s")
ErrNotPlayerTurn    = sdkerrors.Register(ModuleName, 1106, "player tried to play out of turn: %s")
ErrWrongMove        = sdkerrors.Register(ModuleName, 1107, "wrong move")
```
The steps are none other than:

* Fetch the stored game information:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L16-L19]
    storedGame, found := k.Keeper.GetStoredGame(ctx, msg.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "game not found %s", msg.IdValue)
    }
    ```
* Is the player legitimate:
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
* Instantiate the board so that we can use rules:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L32-L35]
    game, err := storedGame.ParseGame()
    if err != nil {
        panic(err.Error())
    }
    ```
* Is it the player's turn:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L36-L38]
    if !game.TurnIs(player) {
        return nil, types.ErrNotPlayerTurn
    }
    ```
* All good, do the move proper:
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
* Prepare the updated board to be stored, and store the information:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L56-L58]
    storedGame.Game = game.String()
    storedGame.Turn = game.Turn.Color
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```
* Return relevant information about the result of the move:
    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/8d686fc/x/checkers/keeper/msg_server_play_move.go#L61-L66]
    return &types.MsgPlayMoveResponse{
        IdValue:   msg.IdValue,
        CapturedX: int64(captured.X),
        CapturedY: int64(captured.Y),
        Winner:    game.Winner().Color,
    }, nil
    ```

And that's all there is to it. Good preparation and the use of Starport yield rewards.
