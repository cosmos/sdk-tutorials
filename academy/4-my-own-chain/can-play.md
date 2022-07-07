---
title: "Query - Help Find a Correct Move"
order: 17
description: Help players make good transactions
tag: deep-dive
---

# Query - Help Find a Correct Move

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [queries](../2-main-concepts/queries.md) and [Protobuf](../2-main-concepts/protobuf.md).
* You have Go installed.
* You have the checkers blockchain codebase up to gas metering. If not, follow the [previous steps](./gas-meter.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-gas-meter).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Improve usability with queries.
* Create a battery of integration tests.

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

* The game ID: call the field `IdValue`.
* The `player`, as queries do not have a signer.
* The origin board position: `fromX` and `fromY`.
* The target board position: `toX` and `toY`.

The information to be returned is:

* A boolean for whether the move is valid, called `Possible`.
* A text which explains why the move is not valid, called `Reason`.

As with other data structures, you can create the query message object with Ignite CLI:

```sh
$ ignite scaffold query canPlayMove idValue player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool,reason
```

Among other files, you should now have this:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/proto/checkers/query.proto#L39-L51]
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

Ignite CLI has created the following boilerplate for you:

* The [Protobuf gRPC interface function](https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/proto/checkers/query.proto#L17-L19) to submit your new `QueryCanPlayMoveRequest` and its default implementation.
* The [routing of this new query](https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/types/query.pb.gw.go#L319-L337) in the query facilities.
* An [empty function](https://github.com/cosmos/b9-checkers-academy-draft/blob/f8a6e14/x/checkers/keeper/grpc_query_can_play_move.go#L19) ready to implement the action.

## Query handling

Now you need to implement the answer to the player's query in `grpc_query_can_play_move.go`. Differentiate between two types of errors:

* Errors relating to the move, returning a reason.
* Errors indicating a move test is impossible, returning an error.

1. The game needs to be fetched. If it does not exist at all, you can return an error message because you did not test the move:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move.go#L23-L26]
    storedGame, found := k.GetStoredGame(ctx, req.IdValue)
    if !found {
        return nil, sdkerrors.Wrapf(types.ErrGameNotFound, types.ErrGameNotFound.Error(), req.IdValue)
    }
    ```

2. Has the game already been won?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move.go#L29-L34]
    if storedGame.Winner != rules.PieceStrings[rules.NO_PLAYER] {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   types.ErrGameFinished.Error(),
        }, nil
    }
    ```

3. Is the `player` given actually one of the game players?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move.go#L37-L47]
    var player rules.Player
    if strings.Compare(rules.PieceStrings[rules.RED_PLAYER], req.Player) == 0 {
        player = rules.RED_PLAYER
    } else if strings.Compare(rules.PieceStrings[rules.BLACK_PLAYER], req.Player) == 0 {
        player = rules.BLACK_PLAYER
    } else {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf(types.ErrCreatorNotPlayer.Error(), req.Player),
        }, nil
    }
    ```

4. Is it the player's turn?

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move.go#L50-L59]
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

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move.go#L62-L77]
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

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move.go#L79-L82]
    return &types.QueryCanPlayMoveResponse{
        Possible: true,
        Reason:   "ok",
    }, nil
    ```

## Integration tests

A query is evaluated in memory, while using the current state in a read-only mode. Thanks to this, you can take some liberties with the current state before running a test, as long as reading the state works. For example, you can pretend the game has been progressed through a number of moves even though you have only pasted the board in that state. For this reason, you are going to test the new method with unit tests, even though you painstakingly prepared integration tests.

### Battery of unit tests

Take inspiration from [the other ones](https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_next_game_test.go#L18-L33), which create a battery of tests to run in a loop. Running a battery of test cases makes it easier to insert new code and surface any unintended impact:

1. Declare a `struct` that describes a test:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move_test.go#L14-L21]
    type canPlayBoard struct {
        desc     string
        board    string
        turn     string
        request  *types.QueryCanPlayMoveRequest
        response *types.QueryCanPlayMoveResponse
        err      error
    }
    ```

2. Create the common OK response, so as to reuse it later:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move_test.go#L24-L27]
    var (canPlayOkResponse = &types.QueryCanPlayMoveResponse{
        Possible: true,
        Reason:   "ok",
    })
    ```

3. Create the first test case, which you will reuse:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move_test.go#L28-L41]
    var(firstTestCase = canPlayBoard{
        desc:  "First move by black",
        board: "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
        turn:  "b",
        request: &types.QueryCanPlayMoveRequest{
            IdValue: "1",
            Player:  "b",
            FromX:   1,
            FromY:   2,
            ToX:     2,
            ToY:     3,
        },
        response: canPlayOkResponse,
    })
    ```

3. Create the list of test cases you want to run, including the just-defined `firstTestCase`:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move_test.go#L42-L120]
    var (canPlayTestRange = []canPlayBoard{
        firstTestCase,
        {
            desc:  "First move by red, wrong",
            board: "*b*b*b*b|b*b*b*b*|*b*b*b*b|********|********|r*r*r*r*|*r*r*r*r|r*r*r*r*",
            turn:  "b",
            request: &types.QueryCanPlayMoveRequest{
                IdValue: "1",
                Player:  "r",
                FromX:   1,
                FromY:   2,
                ToX:     2,
                ToY:     3,
            },
            response: &types.QueryCanPlayMoveResponse{
                Possible: false,
                Reason:   "player tried to play out of turn: red",
            },
        },
        {
            desc:  "Black can win",
            board: "*b*b****|**b*b***|*****b**|********|********|**r*****|*B***b**|********",
            turn:  "b",
            request: &types.QueryCanPlayMoveRequest{
                IdValue: "1",
                Player:  "b",
                FromX:   1,
                FromY:   6,
                ToX:     3,
                ToY:     4,
            },
            response: canPlayOkResponse,
        },
        {
            desc:  "Black must capture, see next for right move",
            board: "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|*r******|**r*r*r*|*r*r*r*r|r*r*r*r*",
            turn:  "b",
            request: &types.QueryCanPlayMoveRequest{
                IdValue: "1",
                Player:  "b",
                FromX:   7,
                FromY:   2,
                ToX:     6,
                ToY:     3,
            },
            response: &types.QueryCanPlayMoveResponse{
                Possible: false,
                Reason:   "wrong move%!(EXTRA string=Invalid move: {7 2} to {6 3})",
            },
        },
        {
            desc:  "Black can capture, same board as previous",
            board: "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|*r******|**r*r*r*|*r*r*r*r|r*r*r*r*",
            turn:  "b",
            request: &types.QueryCanPlayMoveRequest{
                IdValue: "1",
                Player:  "b",
                FromX:   2,
                FromY:   3,
                ToX:     0,
                ToY:     5,
            },
            response: canPlayOkResponse,
        },
        {
            desc:  "Black king can capture backwards",
            board: "*b*b***b|**b*b***|***b***r|********|***r****|********|***r****|r*B*r*r*",
            turn:  "b",
            request: &types.QueryCanPlayMoveRequest{
                IdValue: "1",
                Player:  "b",
                FromX:   2,
                FromY:   7,
                ToX:     4,
                ToY:     5,
            },
            response: canPlayOkResponse,
        },
    })
    ```

    Fortunately you already have a test file with [all the steps](https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/msg_server_play_move_winner_test.go#L17-L59) to a complete game.

4. With this preparation, add the single test function that runs all the cases:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move_test.go#L123-L147]
    func TestCanPlayAsExpected(t *testing.T) {
        keeper, ctx := setupKeeper(t)
        goCtx := sdk.WrapSDKContext(ctx)
        for _, testCase := range canPlayTestRange {
            t.Run(testCase.desc, func(t *testing.T) {
                keeper.SetStoredGame(ctx, types.StoredGame{
                    Creator:   alice,
                    Index:     testCase.request.IdValue,
                    Game:      testCase.board,
                    Turn:      testCase.turn,
                    Red:       bob,
                    Black:     carol,
                    MoveCount: 1,
                    BeforeId:  "-1",
                    AfterId:   "-1",
                    Deadline:  "",
                    Winner:    "*",
                    Wager:     0,
                })
                response, err := keeper.CanPlayMove(goCtx, testCase.request)
                require.Nil(t, err)
                require.EqualValues(t, testCase.response, response)
            })
        }
    }
    ```

5. Finally, add the error tests that cannot be covered with the previous test cases:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move_test.go#L149-L175]
    func TestCanPlayWrongNoRequest(t *testing.T) {
        keeper, ctx := setupKeeper(t)
        goCtx := sdk.WrapSDKContext(ctx)
        _, err := keeper.CanPlayMove(goCtx, nil)
        require.ErrorIs(t, err, status.Error(codes.InvalidArgument, "invalid request"))
    }

    func TestCanPlayWrongNoGame(t *testing.T) {
        keeper, ctx := setupKeeper(t)
        goCtx := sdk.WrapSDKContext(ctx)
        keeper.SetStoredGame(ctx, types.StoredGame{
            Creator:   alice,
            Index:     "1",
            Game:      firstTestCase.board,
            Turn:      firstTestCase.turn,
            Red:       bob,
            Black:     carol,
            MoveCount: 1,
            BeforeId:  "-1",
            AfterId:   "-1",
            Deadline:  "",
            Winner:    "*",
            Wager:     0,
        })
        _, err := keeper.CanPlayMove(goCtx, &types.QueryCanPlayMoveRequest{
            IdValue: "2",
            Player:  "b",
            FromX:   2,
            FromY:   7,
            ToX:     4,
            ToY:     5,
        })
        require.NotNil(t, err)
        require.EqualError(t, err, "game by id not found: 2: game by id not found: %s")
    }
    ```

    Note that this reuses `firstTestCase`.

### One integration test

Since you have set up the tests to work as integrated, why not create one integration test that makes use of them in the same file? Test the first case of the battery, which is the initial situation anyway:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/36602b64/x/checkers/keeper/grpc_query_can_play_move_test.go#L177-L183]
func (suite *IntegrationTestSuite) TestCanPlayAfterCreate() {
    suite.setupSuiteWithOneGameForPlayMove()
    goCtx := sdk.WrapSDKContext(suite.ctx)
    response, err := suite.queryClient.CanPlayMove(goCtx, canPlayTestRange[0].request)
    suite.Require().Nil(err)
    suite.Require().EqualValues(firstTestCase.response, response)
}
```

With these, your function should be covered.

## Interact via the CLI

A friendly reminder that the CLI can always inform you about available commands:

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
<CodeGroupItem title="Can play move">

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

<PanelList>
<PanelListItem number="1">

When there is no such game:

```sh
$ checkersd query checkers can-play-move 2048 red 1 2 2 3
```

Trying this on a game that does not exist returns:

```
Error: rpc error: code = InvalidArgument desc = game by id not found: 2048: game by id not found: %s: invalid request
...
```

Confirm this was an error from the point of view of the executable:

```sh
$ echo $?
```

This prints:

```
1
```

There is room to improve the error message, but it is important that you got an error, as expected.

</PanelListItem>
<PanelListItem number="2">

When you ask for a bad color:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y
$ checkersd query checkers can-play-move 1 white 1 2 2 3
```

If the player tries to play the wrong color on a game that exists, it returns:

```
possible: false
reason: 'message creator is not a player: white'
```

This is a proper message response, and a reason elaborating on the message.

</PanelListItem>
<PanelListItem number="3">

When you ask for a player out of turn:

```sh
$ checkersd query checkers can-play-move 1 red 0 5 1 4
```

If the opponent tries to play out of turn, it returns:

```
possible: false
reason: 'player tried to play out of turn: red'
```

</PanelListItem>
<PanelListItem number="4">

When you ask for a piece that is not that of the player:

```sh
$ checkersd query checkers can-play-move 1 black 0 5 1 4
```

If black tries to play a red piece, it returns:

```
possible: false
reason: wrong move%!(EXTRA string=Not {red}s turn)
```

</PanelListItem>
<PanelListItem number="5">

When it is correct:

```sh
$ checkersd query checkers can-play-move 1 black 1 2 2 3
```

If black tests a correct move, it returns:

```
possible: true
reason: ok
```

</PanelListItem>
<PanelListItem number="6">

When the player must capture:

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $bob -y
$ checkersd tx checkers play-move 1 0 5 1 4 --from $alice -y
$ checkersd query checkers can-play-move 1 black 2 3 3 4
```

If black fails to capture a mandatory red piece, it returns:

```
possible: false
reason: 'wrong move%!(EXTRA string=Invalid move: {2 3} to {3 4})'
```

The reason given is understandable, but it does not clarify why the move is invalid. There is room to improve this message.

</PanelListItem>
<PanelListItem number="7" :last="true">

After the game has been forfeited:

```sh
$ checkersd tx checkers create-game $alice $bob 1000000 --from $alice -y
$ checkersd tx checkers play-move 1 1 2 2 3 --from $bob -y
$ checkersd tx checkers play-move 1 0 5 1 4 --from $alice -y
$ checkersd query checkers can-play-move 1 black 2 3 0 5
```

If black tries to capture a red piece on a running game, it returns:

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

</PanelListItem>
</PanelList>

---

These queries are all satisfactory.

## Next up

Do you want to give players more flexibility about which tokens they can use for games? Let players wager any fungible token in the [next section](./wager-denom.md).
