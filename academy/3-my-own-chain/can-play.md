---
title: "Query - Help Find a Correct Move"
order: 18
description: Help players make good transactions
tag: deep-dive
---

# Query - Help Find a Correct Move

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [queries](../2-main-concepts/queries.md) and [Protobuf](../2-main-concepts/protobuf.md).
* You have Go installed.
* You have the checkers blockchain codebase up to gas metering. If not, follow the [previous steps](./gas-meter.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/gas-meter).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Improve usability with queries.
* Create a battery of unit and integration tests.

</HighlightBox>

A player sends a `MsgPlayMove` when [making a move](./play-game.md). This message can succeed or fail for several reasons. One error situation is when the message represents an invalid move. A GUI is the first place where a bad move can be caught, but it is still possible that a GUI wrongly enforces the rules.

Since sending transactions includes costs, how do you assist participants in making sure they at least do not make a wrong move?

Players should be able to confirm that a move is valid before burning gas. To add this functionality, you need to create a way for the player to call the [`Move`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L274) function without changing the game's state. Use a query because they are evaluated in memory and do not commit anything permanently to storage.

## Some initial thoughts

When it comes to finding a correct move, ask:

* What structure will facilitate this check?
* Who do you let make such checks?
* What acceptable limitations do you have for this?
* Are there new errors to report back?
* What event should you emit?

## Code needs

* What Ignite CLI commands, if any, will assist you?
* How do you adjust what Ignite CLI created for you?
* Where do you make your changes?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

## New information

To run a query to check the validity of a move you need to pass:

* The game ID: call the field `gameIndex`.
* The `player` color, as queries do not have a signer.
* The origin board position: `fromX` and `fromY`.
* The target board position: `toX` and `toY`.

The information to be returned is:

* A boolean for whether the move is valid, called `possible`.
* A text which explains why the move is not valid, called `reason`.

As with other data structures, you can create the query message object with Ignite CLI:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite scaffold query canPlayMove gameIndex player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool,reason
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite scaffold query canPlayMove gameIndex player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool,reason
```

</CodeGroupItem>

</CodeGroup>

Among other files, you should now have this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-query/proto/checkers/query.proto#L74-L86]
message QueryCanPlayMoveRequest {
    string gameIndex = 1;
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

Ignite CLI has created the following boilerplate for you:

* The [Protobuf gRPC interface function](https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-query/proto/checkers/query.proto#L35-L37) to submit your new `QueryCanPlayMoveRequest` and its default implementation.
* The [routing of this new query](https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-query/x/checkers/types/query.pb.gw.go#L424-L445) in the query facilities.
* An [empty function](https://github.com/cosmos/b9-checkers-academy-draft/blob/f8a6e14/x/checkers/keeper/grpc_query_can_play_move.go#L19) ready to implement the action.

## Query handling

Now you need to implement the answer to the player's query in `grpc_query_can_play_move.go`. Differentiate between two types of errors:

* Errors relating to the move, returning a reason.
* Errors indicating that testing the move is impossible, returning an error.

1. The game needs to be fetched. If it does not exist at all, you can return an error message because you did not test the move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move.go#L22-L25]
    storedGame, found := k.GetStoredGame(ctx, req.GameIndex)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, "%s", req.GameIndex)
    }
    ```

2. Has the game already been won?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move.go#L26-L31]
    if storedGame.Winner != rules.PieceStrings[rules.NO_PLAYER] {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   types.ErrGameFinished.Error(),
        }, nil
    }
    ```

3. Is the `player` given actually one of the game players?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move.go#L32-L46]
    isBlack := rules.PieceStrings[rules.BLACK_PLAYER] == req.Player
    isRed := rules.PieceStrings[rules.RED_PLAYER] == req.Player
    var player rules.Player
    if isBlack && isRed {
        player = rules.StringPieces[storedGame.Turn].Player
    } else if isBlack {
        player = rules.BLACK_PLAYER
    } else if isRed {
        player = rules.RED_PLAYER
    } else {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf("%s: %s", types.ErrCreatorNotPlayer.Error(), req.Player),
        }, nil
    }
    ```

4. Is it the player's turn?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move.go#L47-L56]
    game, err := storedGame.ParseGame()
    if err != nil {
        return nil, err
    }
    if !game.TurnIs(player) {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf("%s: %s", types.ErrNotPlayerTurn.Error(), player.Color),
        }, nil
    }
    ```

5. Attempt the move and report back:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move.go#L57-L72]
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
            Reason:   fmt.Sprintf("%s: %s", types.ErrWrongMove.Error(), moveErr.Error()),
        }, nil
    }
    ```

6. If all went well:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move.go#L74-L77]
    return &types.QueryCanPlayMoveResponse{
        Possible: true,
        Reason:   "ok",
    }, nil
    ```

Quite straightforward.

## Unit tests

A query is evaluated in memory, while using the current state in a read-only mode. Thanks to this, you can take some liberties with the current state before running a test, as long as reading the state works as intended. For example, you can pretend that the game has been progressed through a number of moves even though you have only just planted the board in that state in the keeper. For this reason, you can easily test the new method with unit tests, even though you painstakingly prepared integration tests.

Take inspiration from [the other tests on queries](https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_next_game_test.go#L18-L33), which create an array of cases to test in a loop. Running a battery of test cases makes it easier to insert new cases and surface any unintended impact. Create a new `grpc_query_can_play_move_test.go` file where you:

1. Declare a `struct` that describes a test case:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move_test.go#L12-L18]
    type canPlayGameCase struct {
        desc     string
        game     types.StoredGame
        request  *types.QueryCanPlayMoveRequest
        response *types.QueryCanPlayMoveResponse
        err      string
    }
    ```

2. Create the common OK response, so as to reuse it:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move_test.go#L21-L24]
    var (
        canPlayOkResponse = &types.QueryCanPlayMoveResponse{
            Possible: true,
            Reason:   "ok",
        }
    )
    ```

3. Prepare your array of cases:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move_test.go#L25]
    canPlayTestRange = []canPlayGameCase{
        // TODO
    }
    ```

4. In the array add your first test case, one that returns an OK response:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move_test.go#L26-L44]
    {
        desc: "First move by black",
        game: types.StoredGame{
            Index:  "1",
            Board:  "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
            Turn:   "b",
            Winner: "*",
        },
        request: &types.QueryCanPlayMoveRequest{
            GameIndex: "1",
            Player:    "b",
            FromX:     1,
            FromY:     2,
            ToX:       2,
            ToY:       3,
        },
        response: canPlayOkResponse,
        err:      "nil",
    },
    ```

5. Add [other test cases](https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move_test.go#L26-L239). Examples include a missing request:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move_test.go#L45-L56]
    {
        desc: "Nil request, wrong",
        game: types.StoredGame{
            Index:  "1",
            Board:  "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
            Turn:   "b",
            Winner: "*",
        },
        request:  nil,
        response: nil,
        err:      "rpc error: code = InvalidArgument desc = invalid request",
    },
    ```

    Or a player playing out of turn:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move_test.go#L139-L160]
    {
        desc: "First move by red, wrong",
        game: types.StoredGame{
            Index:  "1",
            Board:  "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
            Turn:   "b",
            Winner: "*",
        },
        request: &types.QueryCanPlayMoveRequest{
            GameIndex: "1",
            Player:    "r",
            FromX:     1,
            FromY:     2,
            ToX:       2,
            ToY:       3,
        },
        response: &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   "player tried to play out of turn: red",
        },
        err: "nil",
    },
    ```

6. With the test cases defined, add a single test function that runs all the cases:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move_test.go#L243-L263]
    func TestCanPlayCasesAsExpected(t *testing.T) {
        keeper, ctx := keepertest.CheckersKeeper(t)
        goCtx := sdk.WrapSDKContext(ctx)
        for _, testCase := range canPlayTestRange {
            t.Run(testCase.desc, func(t *testing.T) {
                keeper.SetStoredGame(ctx, testCase.game)
                response, err := keeper.CanPlayMove(goCtx, testCase.request)
                if testCase.response == nil {
                    require.Nil(t, response)
                } else {
                    require.EqualValues(t, testCase.response, response)
                }
                if testCase.err == "nil" {
                    require.Nil(t, err)
                } else {
                    require.EqualError(t, err, testCase.err)
                }
                keeper.RemoveStoredGame(ctx, testCase.game.Index)
            })
        }
    }
    ```

Note how all test cases are run within a single unit test. In other words, the keeper used for the second case is the same as that used for the first case, and so on for all. So to mitigate the risk of interference from one case to the next, you ought to do `keeper.RemoveStoredGame(ctx, testCase.game.Index)` at the end of the test case.

## Integration tests

You can also add integration tests on top of your unit tests. Although not compulsory, it is preferable that you put them in a separate file. Pick `grpc_query_can_play_move_integration_test.go`.

Test if it is possible to play on the first game that is created in the system:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/can-play-move-handler/x/checkers/keeper/grpc_query_can_play_move_integration_test.go#L8-L21]
func (suite *IntegrationTestSuite) TestCanPlayAfterCreate() {
    suite.setupSuiteWithOneGameForPlayMove()
    goCtx := sdk.WrapSDKContext(suite.ctx)
    response, err := suite.queryClient.CanPlayMove(goCtx, &types.QueryCanPlayMoveRequest{
        GameIndex: "1",
        Player:    "b",
        FromX:     1,
        FromY:     2,
        ToX:       2,
        ToY:       3,
    })
    suite.Require().Nil(err)
    suite.Require().EqualValues(canPlayOkResponse, response)
}
```

With these, your query handling function should be covered.

## Interact via the CLI

Set the game expiry to 5 minutes and start `ignite chain serve`. A friendly reminder that the CLI can always inform you about available commands:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers --help
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers --help
```

</CodeGroupItem>

</CodeGroup>

Which prints:

```
...
Available Commands:
  can-play-move    Query canPlayMove
...
```

What can `checkersd` tell you about the command:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers can-play-move --help
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers can-play-move --help
```

</CodeGroupItem>

</CodeGroup>

Which prints:

```txt
...
Usage:
  checkersd query checkers can-play-move [gameIndex] [player] [fromX] [fromY] [toX] [toY] [flags]
...
```

You can test this query at any point in a game's life.

<PanelList>

<PanelListItem number="1">

When there is no such game:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers can-play-move 2048 red 1 2 2 3
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers can-play-move 2048 red 1 2 2 3
```

</CodeGroupItem>

</CodeGroup>

Trying this on a game that does not exist returns:

```txt
Error: rpc error: code = InvalidArgument desc = 2048: game by id not found: invalid request
...
```

Confirm this was an error from the point of view of the executable:

```sh
$ echo $?
```

This prints:

```txt
1
```

There is room to improve the error message, but it is important that you got an error, as expected.

</PanelListItem>

<PanelListItem number="2">

When you ask for a bad player color:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y
$ checkersd query checkers can-play-move 1 w 1 2 2 3
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y
$ docker exec -it checkers checkersd query checkers can-play-move 1 w 1 2 2 3
```

</CodeGroupItem>

</CodeGroup>

If the player tries to play the wrong color on a game that exists, it returns:

```txt
possible: false
reason: 'message creator is not a player: w'
```

This is a proper message response, and a reason elaborating on the message.

</PanelListItem>

<PanelListItem number="3">

When you ask for a player out of turn:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers can-play-move 1 r 0 5 1 4
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers can-play-move 1 r 0 5 1 4
```

</CodeGroupItem>

</CodeGroup>

If the opponent tries to play out of turn, it returns:

```txt
possible: false
reason: 'player tried to play out of turn: red'
```

</PanelListItem>

<PanelListItem number="4">

When you ask for a piece that is not that of the player:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers can-play-move 1 b 0 5 1 4
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers can-play-move 1 b 0 5 1 4
```

</CodeGroupItem>

</CodeGroup>

If black tries to play a red piece, it returns:

```txt
possible: false
reason: 'wrong move: Not {red}''s turn'
```

</PanelListItem>

<PanelListItem number="5">

When it is correct:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers can-play-move 1 b 1 2 2 3
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers can-play-move 1 b 1 2 2 3
```

</CodeGroupItem>

</CodeGroup>

If black tests a correct move, it returns:

```txt
possible: true
reason: ok
```

</PanelListItem>

<PanelListItem number="6">

When the player must capture:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $alice -y
$ checkersd tx checkers play-move 1 0 5 1 4 --from $bob -y
$ checkersd query checkers can-play-move 1 b 2 3 3 4
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move 1 1 2 2 3 --from $alice -y
$ docker exec -it checkers checkersd tx checkers play-move 1 0 5 1 4 --from $bob -y
$ docker exec -it checkers checkersd query checkers can-play-move 1 b 2 3 3 4
```

</CodeGroupItem>

</CodeGroup>

If black fails to capture a mandatory red piece, it returns:

```txt
possible: false
reason: 'wrong move: Invalid move: {2 3} to {3 4}'
```

The reason given is understandable, but it does not clarify why the move is invalid. There is room to improve this message.

</PanelListItem>

<PanelListItem number="7" :last="true">

After the game has been forfeited:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y
$ checkersd tx checkers play-move 2 1 2 2 3 --from $alice -y
$ checkersd tx checkers play-move 2 0 5 1 4 --from $bob -y
$ checkersd query checkers can-play-move 2 b 2 3 0 5
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y
$ docker exec -it checkers checkersd tx checkers play-move 2 1 2 2 3 --from $alice -y
$ docker exec -it checkers checkersd tx checkers play-move 2 0 5 1 4 --from $bob -y
$ docker exec -it checkers checkersd query checkers can-play-move 2 b 2 3 0 5
```

</CodeGroupItem>

</CodeGroup>

If black tries to capture a red piece on a running game, it returns:

```txt
possible: true
reason: ok
```

Wait five minutes for the forfeit:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query checkers can-play-move 2 b 2 3 0 5
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd query checkers can-play-move 2 b 2 3 0 5
```

</CodeGroupItem>

</CodeGroup>

Now it returns:

```txt
possible: false
reason: game is already finished
```

</PanelListItem>

</PanelList>

These query results satisfy our expectations.

## Next up

Do you want to give players more flexibility about which tokens they can use for games? Let players wager any fungible token in the [next section](./wager-denom.md).
