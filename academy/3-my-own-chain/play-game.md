---
title: "Message and Handler - Add a Way to Make a Move"
order: 9
description: Play a game
tag: deep-dive
---

# Message and Handler - Add a Way to Make a Move

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [transactions](../2-main-concepts/transactions.md), [messages](../2-main-concepts/messages.md), and [Protobuf](../2-main-concepts/protobuf.md).
* Go is installed.
* You have the checkers blockchain codebase with `MsgCreateGame` and its handling. If not, follow the [previous steps](./create-handling.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/create-game-handler).

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

* The ID of the game the player wants to join. Call the field `gameIndex`.
* The initial positions of the pawn. Call the fields `fromX` and `fromY` and make them `uint`.
* The final position of the pawn after a player's move. Call the fields `toX` and `toY` to be `uint` too.

The player does not need to be explicitly added as a field in the message because the player **is** implicitly the signer of the message. Name the object `PlayMove`.

Unlike when creating the game, you want to return:

* The captured piece, if any. Call the fields `capturedX` and `capturedY`. Make then `int` so that you can pass `-1` when no pieces have been captured.
* The (potential) winner in the field `winner`.

## With Ignite CLI

Ignite CLI can create the message and the response objects with a single command:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite scaffold message playMove gameIndex fromX:uint fromY:uint toX:uint toY:uint --module checkers --response capturedX:int,capturedY:int,winner
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite scaffold message playMove gameIndex fromX:uint fromY:uint toX:uint toY:uint --module checkers --response capturedX:int,capturedY:int,winner
```

</CodeGroupItem>

</CodeGroup>

Ignite CLI once more creates all the necessary Protobuf files and boilerplate for you. See `tx.proto`:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-msg/proto/checkers/tx.proto#L25-L38]
message MsgPlayMove {
  string creator = 1;
  string gameIndex = 2;
  uint64 fromX = 3;
  uint64 fromY = 4;
  uint64 toX = 5;
  uint64 toY = 6;
}

message MsgPlayMoveResponse {
  int32 capturedX = 1;
  int32 capturedY = 2;
  string winner = 3;
}
```

All you have to do is fill in the needed part in `x/checkers/keeper/msg_server_play_move.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-msg/x/checkers/keeper/msg_server_play_move.go#L10-L17]
func (k msgServer) PlayMove(goCtx context.Context, msg *types.MsgPlayMove) (*types.MsgPlayMoveResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handling the message
    _ = ctx

    return &types.MsgPlayMoveResponse{}, nil
}
```

Where the `TODO` is replaced as per the following.

## The move handling

The `rules` represent the ready-made file containing the rules of the game you imported earlier. Declare your new errors in `x/checkers/types/errors.go`, given your code has to handle new error situations:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/types/errors.go#L14-L17]
ErrGameNotFound     = sdkerrors.Register(ModuleName, 1103, "game by id not found")
ErrCreatorNotPlayer = sdkerrors.Register(ModuleName, 1104, "message creator is not a player")
ErrNotPlayerTurn    = sdkerrors.Register(ModuleName, 1105, "player tried to play out of turn")
ErrWrongMove        = sdkerrors.Register(ModuleName, 1106, "wrong move")
```

Take the following steps to replace the `TODO`:

1. Fetch the stored game information using the [`Keeper.GetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/stored_game.go#L19) function created by Ignite CLI:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move.go#L15-L18]
    storedGame, found := k.Keeper.GetStoredGame(ctx, msg.GameIndex)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "%s", msg.GameIndex)
    }
    ```

    You return an error because this is a player mistake.

2. Is the player legitimate? Check with:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move.go#L20-L31]
    isBlack := storedGame.Black == msg.Creator
    isRed := storedGame.Red == msg.Creator
    var player rules.Player
    if !isBlack && !isRed {
        return nil, sdkerrors.Wrapf(types.ErrCreatorNotPlayer, "%s", msg.Creator)
    } else if isBlack && isRed {
        player = rules.StringPieces[storedGame.Turn].Player
    } else if isBlack {
        player = rules.BLACK_PLAYER
    } else {
        player = rules.RED_PLAYER
    }
    ```

    This uses the certainty that the `MsgPlayMove.Creator` has been verified [by its signature](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/types/message_play_move.go#L29-L35).

3. Instantiate the board in order to implement the rules:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move.go#L33-L36]
    game, err := storedGame.ParseGame()
    if err != nil {
        panic(err.Error())
    }
    ```

    Fortunately you previously created [this helper](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/types/full_game.go#L22-L32). Here you `panic` because if the game cannot be parsed the cause may be database corruption.

4. Is it the player's turn? Check using the rules file's own [`TurnIs`](https://github.com/cosmos/b9-checkers-academy-draft/blob/175f467/x/checkers/rules/checkers.go#L145-L147) function:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move.go#L38-L40]
    if !game.TurnIs(player) {
        return nil, sdkerrors.Wrapf(types.ErrNotPlayerTurn, "%s", player)
    }
    ```

5. Properly conduct the move, using the rules' [`Move`](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/rules/checkers.go#L274-L301) function:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move.go#L42-L54]
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

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move.go#L56-L58]
    storedGame.Board = game.String()
    storedGame.Turn = rules.PieceStrings[game.Turn]
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

    This updates the fields that were modified using the [`Keeper.SetStoredGame`](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/stored_game.go#L10) function, as when you created and saved the game.

7. Return relevant information regarding the move's result:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move.go#L60-L64]
    return &types.MsgPlayMoveResponse{
        CapturedX: int32(captured.X),
        CapturedY: int32(captured.Y),
        Winner:    rules.PieceStrings[game.Winner()],
    }, nil
    ```

    The `Captured` and `Winner` information would be lost if you did not get it out of the function one way or another. More accurately, one would have to replay the transaction to discover the values. It is best to make this information easily accessible.

This completes the move process, facilitated by good preparation and the use of Ignite CLI.

## Unit tests

Adding unit tests for this play message is very similar to what you did for the previous message: create a new `msg_server_play_move_test.go` file and declare it as `package keeper_test`. Start with a function that conveniently sets up the keeper for the tests. In this case, already having a game saved can reduce several lines of code in each test:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move_test.go#L15-L26]
func setupMsgServerWithOneGameForPlayMove(t testing.TB) (types.MsgServer, keeper.Keeper, context.Context) {
    k, ctx := keepertest.CheckersKeeper(t)
    checkers.InitGenesis(ctx, *k, *types.DefaultGenesis())
    server := keeper.NewMsgServerImpl(*k)
    context := sdk.WrapSDKContext(ctx)
    server.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Black:   bob,
        Red:     carol,
    })
    return server, *k, context
}
```

Note that it reuses `alice`, `bob` and `carol` found in the file [`msg_server_create_game_test.go`](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_create_game_test.go#L16-L18) of the same package.

Now test the result of a move. Blacks play first, which according to `setupMsgServerWithOneGameForPlayMove` corresponds to `bob`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move_test.go#L28-L44]
func TestPlayMove(t *testing.T) {
    msgServer, _, context := setupMsgServerWithOneGameForPlayMove(t)
    playMoveResponse, err := msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator:   bob,
        GameIndex: "1",
        FromX:     1,
        FromY:     2,
        ToX:       2,
        ToY:       3,
    })
    require.Nil(t, err)
    require.EqualValues(t, types.MsgPlayMoveResponse{
        CapturedX: -1,
        CapturedY: -1,
        Winner:    "*",
    }, *playMoveResponse)
}
```

Also test whether the game was [saved correctly](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move_test.go#L83-L108). Check what happens when [the game cannot be found](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move_test.go#L46-L58), the sender [is not a player](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move_test.go#L110-L122), a player tries to [play out of turn](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move_test.go#L145-L157), or [makes a wrong move](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move_test.go#L159-L171). Check after [two](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move_test.go#L173-L232) or [three turns with a capture](https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move_test.go#L234-L309).

As a special case, add a test to check what happens when a board is not parseable, which is expected to end up in a `panic`, not with a returned error:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/play-move-handler/x/checkers/keeper/msg_server_play_move_test.go#L124-L143]
func TestPlayMoveCannotParseGame(t *testing.T) {
    msgServer, k, context := setupMsgServerWithOneGameForPlayMove(t)
    ctx := sdk.UnwrapSDKContext(context)
    storedGame, _ := k.GetStoredGame(ctx, "1")
    storedGame.Board = "not a board"
    k.SetStoredGame(ctx, storedGame)
    defer func() {
        r := recover()
        require.NotNil(t, r, "The code did not panic")
        require.Equal(t, r, "game cannot be parsed: invalid board string: not a board")
    }()
    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator:   bob,
        GameIndex: "1",
        FromX:     1,
        FromY:     2,
        ToX:       2,
        ToY:       3,
    })
}
```

Note the use of [`defer`](https://stackoverflow.com/a/31596110), which can be used as a Go way of implementing `try catch` of panics. The `defer` statement is set up right before the `msgServer.PlayMove` statement that is expected to fail, so that it does not _catch_ panics that may happen earlier.

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

## Interact via the CLI

Start your chain again:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite chain serve
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it --name checkers -v $(pwd):/checkers -w /checkers checkers_i ignite chain serve
```

</CodeGroupItem>

</CodeGroup>

If you restarted from the [previous section](./create-handling.md), there is already one game in storage and it is waiting for Alice's move. If that is not the case, recreate a game via the CLI. 

Can Bob make a move? Look at the `play-move` message and which parameters it expects:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move --help
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move --help
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
Broadcast message playMove

Usage:
  checkersd tx checkers play-move [game-index] [from-x] [from-y] [to-x] [to-y] [flags]
...
```

So Bob tries:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 0 5 1 4 --from $bob
                                  ^ ^ ^ ^ ^
                                  | | | | To Y
                                  | | | To X
                                  | | From Y
                                  | From X
                                  Game id
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move 1 0 5 1 4 --from $bob
                                                           ^ ^ ^ ^ ^
                                                           | | | | To Y
                                                           | | | To X
                                                           | | From Y
                                                           | From X
                                                           Game id
```

</CodeGroupItem>

</CodeGroup>

After you accept sending the transaction, it should complain with the result including:

```txt
...
raw_log: 'failed to execute message; message index: 0: {red}: player tried to play
  out of turn'
...
txhash: D10BB8A706870F65F19E4DF48FB870E4B7D55AF4232AE0F6897C23466FF7871B
```

<HighlightBox type="tip">

If you did not get this `raw_log`, your transaction may have been sent asynchronously. You can always query a transaction by using the `txhash` with the following command:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query tx D10BB8A706870F65F19E4DF48FB870E4B7D55AF4232AE0F6897C23466FF7871B
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query tx D10BB8A706870F65F19E4DF48FB870E4B7D55AF4232AE0F6897C23466FF7871B
```

</CodeGroupItem>

</CodeGroup>

And you are back on track:

```txt
...
raw_log: 'failed to execute message; message index: 0: {red}: player tried to play
  out of turn'
```

</HighlightBox>

Can Alice, who plays _black_, make a move? Can she make a wrong move? For instance, a move from `0-1` to `1-0`, which is occupied by one of her pieces.

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 1 0 0 1 --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move 1 1 0 0 1 --from $alice
```

</CodeGroupItem>

</CodeGroup>

The computer says no:

```txt
...
raw_log: 'failed to execute message; message index: 0: Already piece at destination
  position: {0 1}: wrong move'
```

So far all seems to be working.

Time for Alice to make a correct move:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move 1 1 2 2 3 --from $alice
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"play_move"}]}]}]'
```

Confirm the move went through with your one-line formatter from the [previous section](./create-handling.md):

<CodeGroup>

<CodeGroupItem title="Linux" active>

```sh
$ checkersd query checkers show-stored-game 1 --output json | jq ".storedGame.board" | sed 's/"//g' | sed 's/|/\n/g'
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c "checkersd query checkers show-stored-game 1 --output json | jq \".storedGame.board\" | sed 's/\"//g' | sed 's/|/\n/g'"
```

</CodeGroupItem>

<CodeGroupItem title="Mac">

```sh
$ checkersd query checkers show-stored-game 1 --output json | jq ".storedGame.board" | sed 's/"//g' | sed 's/|/\'$'\n/g'
```

</CodeGroupItem>

</CodeGroup>

This shows:

```txt
*b*b*b*b
b*b*b*b*
***b*b*b
**b*****     <--- Here
********
r*r*r*r*
*r*r*r*r
r*r*r*r*
```

Bob's piece moved down and right.

When you are done with this exercise you can stop Ignite's `chain serve`.

## Next up

Before you add a third message to let a player [reject a game](./reject-game.md), add events to the existing message handlers for relevant information. This is the object of the [next section](./events.md).

<HighlightBox type="tip">

If you want to skip ahead and see how you can assist a player in not submitting a transaction that would result in a failed move, you can [create a query to test a move](./can-play.md).

</HighlightBox>
