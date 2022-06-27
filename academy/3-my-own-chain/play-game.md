---
title: "Message and Handler - Add a Way to Make a Move"
order: 10
description: Play a game
tag: deep-dive
---

# Message and Handler - Add a Way to Make a Move

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [transactions](../2-main-concepts/transactions.md), [messages](../2-main-concepts/messages.md), and [Protobuf](../2-main-concepts/protobuf.md).
* Go is installed.
* You have the checkers blockchain codebase with `MsgCreateGame` and its handling. If not, follow the [previous steps](./create-handling.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-create-game-handler).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Extend message handling - play the game.
* Handle moves and update the game state.
* Validate input.
* Extend unit tests.

</HighlightBox>

Your blockchain can now create games, but can you play them? Not yet...so what do you need to make this possible?

## Some initial thoughts

Before diving into the exercise, take some time to think about the following questions:

* What goes into the message?
* How do you sanitize the inputs?
* How do you unequivocally identify games?
* How do you report back errors?
* How do you use your files that implement the checkers rules?
* How do you make sure that nothing is lost?

## Code needs

When it comes to the code you need, ask yourself:

* What Ignite CLI commands will create your message?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

As before, do not bother yet with niceties like gas metering or event emission.

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

Ignite CLI only creates a response object with a single field. You can update the object after Ignite CLI has run:

```sh
$ ignite scaffold message playMove idValue fromX:uint fromY:uint toX:uint toY:uint --module checkers --response idValue
```

Ignite CLI once more creates all the necessary Protobuf files and the boilerplate for you. All you have to do is:

* Add the missing fields to the response in `proto/checkers/tx.proto`:

    ```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/proto/checkers/tx.proto#L25-L30]
    message MsgPlayMoveResponse {
        string idValue = 1;
        int64 capturedX = 2;
        int64 capturedY = 3;
        string winner = 4;
    }
    ```

    Use `int64` here so that you can enter `-1` when no pawns have been captured.

* Fill in the needed part in `x/checkers/keeper/msg_server_play_move.go`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f52a673/x/checkers/keeper/msg_server_play_move.go#L10-L17]
    func (k msgServer) PlayMove(goCtx context.Context, msg *types.MsgPlayMove) (*types.MsgPlayMoveResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgPlayMoveResponse{}, nil
    }
    ```

    Where the `TODO` is replaced as per the following.

## The move handling

The `rules` represent the ready-made file containing the rules of the game you imported earlier. Declare them in `x/checkers/types/errors.go`, given your code has to handle new error situations:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/types/errors.go#L14-L18]
ErrGameNotParseable = sdkerrors.Register(ModuleName, 1103, "game cannot be parsed")
ErrGameNotFound     = sdkerrors.Register(ModuleName, 1104, "game by id not found: %s")
ErrCreatorNotPlayer = sdkerrors.Register(ModuleName, 1105, "message creator is not a player: %s")
ErrNotPlayerTurn    = sdkerrors.Register(ModuleName, 1106, "player tried to play out of turn: %s")
ErrWrongMove        = sdkerrors.Register(ModuleName, 1107, "wrong move")
```

Take the following steps to replace the `TODO`:

1. Fetch the stored game information using the [`Keeper.GetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/stored_game.go#L17) function created by Ignite CLI:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move.go#L16-L19]
    storedGame, found := k.Keeper.GetStoredGame(ctx, msg.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "game not found %s", msg.IdValue)
    }
    ```

2. Is the player legitimate? Check with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move.go#L22-L33]
    isRed := strings.Compare(storedGame.Red, msg.Creator) == 0
    isBlack := strings.Compare(storedGame.Black, msg.Creator) == 0
    var player rules.Player
    if !isRed && !isBlack {
        return nil, types.ErrCreatorNotPlayer
    } else if isRed && isBlack {
        player = rules.StringPieces[storedGame.Turn].Player
    } else if isRed {
        player = rules.RED_PLAYER
    } else {
        player = rules.BLACK_PLAYER
    }
    ```

    This uses the certainty that the `MsgPlayMove.Creator` has been verified [by its signature](https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/types/message_play_move.go#L29-L35).

3. Instantiate the board in order to implement the rules:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move.go#L36-L39]
    game, err := storedGame.ParseGame()
    if err != nil {
        panic(err.Error())
    }
    ```

    Fortunately you previously created [this helper](https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/types/full_game.go#L27-L37).

4. Is it the player's turn? Check using the rules file's own [`TurnIs`](https://github.com/cosmos/b9-checkers-academy-draft/blob/175f467/x/checkers/rules/checkers.go#L145-L147) function:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move.go#L40-L42]
    if !game.TurnIs(player) {
        return nil, types.ErrNotPlayerTurn
    }
    ```

5. Properly conduct the move, using the rules' [`Move`](https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/rules/checkers.go#L274-L301) function:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move.go#L45-L57]
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
        return nil, sdkerrors.Wrapf(types.ErrWrongMove, moveErr.Error())
    }
    ```

6. Prepare the updated board to be stored and store the information:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move.go#L60-L62]
    storedGame.Game = game.String()
    storedGame.Turn = rules.PieceStrings[game.Turn]
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

    This updates the fields that were modified using the [`Keeper.SetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/stored_game.go#L10) function, as when you created and saved the game.

7. Return relevant information regarding the move's result:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move.go#L65-L70]
    return &types.MsgPlayMoveResponse{
        IdValue:   msg.IdValue,
        CapturedX: int64(captured.X),
        CapturedY: int64(captured.Y),
        Winner:    game.Winner().Color,
    }, nil
    ```

    The `Captured` and `Winner` information would be lost if you do not do this. More accurately, one would have to replay the transaction to discover the values. Better to be a good citizen and make this information easily accessible.

This completes the move process, facilitated by good preparation and the use of Ignite CLI.

## Unit tests

Adding unit tests for this play message is very similar to what you did for the previous message: create a new `msg_server_play_move_test.go` file and add to it. Start with a function that sets up the keeper as you prefer. In this case, already having a game saved can reduce several lines of code in each test:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move_test.go#L15-L26]
func setupMsgServerWithOneGameForPlayMove(t testing.TB) (types.MsgServer, keeper.Keeper, context.Context) {
    k, ctx := setupKeeper(t)
    checkers.InitGenesis(ctx, *k, *types.DefaultGenesis())
    server := keeper.NewMsgServerImpl(*k)
    context := sdk.WrapSDKContext(ctx)
    server.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
    })
    return server, *k, context
}
```

Now test the result of a move:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move_test.go#L28-L45]
func TestPlayMove(t *testing.T) {
    msgServer, _, context := setupMsgServerWithOneGameForPlayMove(t)
    playMoveResponse, err := msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator: carol,
        IdValue: "1",
        FromX:   1,
        FromY:   2,
        ToX:     2,
        ToY:     3,
    })
    require.Nil(t, err)
    require.EqualValues(t, types.MsgPlayMoveResponse{
        IdValue:   "1",
        CapturedX: -1,
        CapturedY: -1,
        Winner:    rules.NO_PLAYER.Color,
    }, *playMoveResponse)
}
```

Also test whether the game was [saved correctly](https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move_test.go#L71-L97). Check what happens when players try to [play out of turn](https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move_test.go#L99-L111), or [make a wrong move](https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move_test.go#L113-L125). Check after [two](https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move_test.go#L127-L188) or [three turns with a capture](https://github.com/cosmos/b9-checkers-academy-draft/blob/362ca660/x/checkers/keeper/msg_server_play_move_test.go#L190-L267).

## Interact via the CLI

With one game in storage and the game waiting for Bob's move, can Alice make a move? Look at the `play-move` message and which parameters it accepts:

```sh
$ checkersd tx checkers play-move --help
```

This returns:

```
Broadcast message playMove

Usage:
  checkersd tx checkers play-move [idValue] [fromX] [fromY] [toX] [toY] [flags]
...
```

So `Alice` tries:

```sh
$ checkersd tx checkers play-move 1 0 5 1 4 --from $alice
                                  ^ ^ ^ ^ ^
                                  | | | | To Y
                                  | | | To X
                                  | | From Y
                                  | From X
                                  Game id
```

This includes:

```
...
raw_log: 'failed to execute message; message index: 0: player tried to play out of
                                       turn'
...
txhash: D10BB8A706870F65F19E4DF48FB870E4B7D55AF4232AE0F6897C23466FF7871B
```

<HighlightBox type="tip">

If you did not get this `raw_log`, your transaction may have been sent asynchronously. You can always query a transaction by using the `txhash` with the following command:

```sh
$ checkersd query tx D10BB8A706870F65F19E4DF48FB870E4B7D55AF4232AE0F6897C23466FF7871B
```

And you are back on track:

```
...
raw_log: 'failed to execute message; message index: 0: player tried to play out of
  turn'
```

</HighlightBox>

Can Bob, who plays _black_, make a move? Can he make a wrong move? For instance, a move from `0-1` to `1-0`, which is occupied by one of his pieces.

```sh
$ checkersd tx checkers play-move 1 1 0 0 1 --from $bob
```

The computer says no:

```
...
raw_log: 'failed to execute message; message index: 0: Already piece at destination
  position: {1 0}: wrong move'
```

So far all seems to be working.

Time for Bob to make a correct move:

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $bob
```

This returns:

```
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"PlayMove"}]}]}]'
```

Confirm the move went through with your one-line formatter from the [previous section](./create-handling.md):

```sh
$ checkersd query checkers show-stored-game 1 --output json | jq ".StoredGame.game" | sed 's/"//g' | sed 's/|/\n/g'
```

This shows:

```
*b*b*b*b
b*b*b*b*
***b*b*b
**b*****
********
r*r*r*r*
*r*r*r*r
r*r*r*r*
```

Bob's piece moved down and right.

## Next up

Before you add a third message to let a player [reject a game](./reject-game.md), add events to the existing message handlers for relevant information. This is the object of the [next section](./events.md).

<HighlightBox type="tip">

If you want to skip ahead and see how you can assist a player in not submitting a transaction that would result in a failed move, you can [create a query to test a move](./can-play.md).

</HighlightBox>
