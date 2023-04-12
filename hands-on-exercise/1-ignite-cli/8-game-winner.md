---
title: "Record the Game Winner"
order: 9
description: Store field - store the winner of a game
tags: 
  - guided-coding
  - cosmos-sdk
---

# Record the Game Winner

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md).
* Go is installed.
* You have the checkers blockchain codebase with the new events. If not, follow the [previous steps](/hands-on-exercise/1-ignite-cli/7-events.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/two-events).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Check for a game winner.
* Extend unit tests.

</HighlightBox>

In a [previous section](/hands-on-exercise/1-ignite-cli/6-play-game.md) you made it possible to determine the outcome of a game by declaring a winner. You also [emitted it](/hands-on-exercise/1-ignite-cli/7-events.md).

The next logical step is to also record this information in storage. That will assist you in discerning between games that are current and those that have reached an end by winning. As you will see in subsequent sections about forfeit, there are other ways for a game to finish.

Therefore, a reasonable field to add is for the **winner**. It needs to contain:

* The winner of a game that reaches completion.
* Or the winner _by forfeit_ when a game is expired.
* Or a neutral value when the game is active.

<HighlightBox type="note">

In this section a draw is not handled and it would perhaps require yet another value to be saved in _winner_.

</HighlightBox>

It is time to introduce another consideration. When a game has been won, no one else is going to play it. Its board will no longer be updated and is no longer used for any further on-chain decisions. In effect, the board becomes redundant. With a view to keeping a node's storage requirement low, you should delete the board's content but keep the rest of the game's information.

To keep a trace of the last state of the board, you emit it with an event.

## New information

In the `StoredGame` Protobuf definition file:

```diff-protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/proto/checkers/stored_game.proto#L12]
    message StoredGame {
        ...
+      string winner = 6;
    }
```

Have Ignite CLI and Protobuf recompile this file:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite generate proto-go
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    ignite generate proto-go
```

</CodeGroupItem>

</CodeGroup>

Add a helper function to get the winner's address, if it exists. A good location is in `full_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/types/full_game.go#L34-L52]
func (storedGame StoredGame) GetPlayerAddress(color string) (address sdk.AccAddress, found bool, err error) {
    black, err := storedGame.GetBlackAddress()
    if err != nil {
        return nil, false, err
    }
    red, err := storedGame.GetRedAddress()
    if err != nil {
        return nil, false, err
    }
    address, found = map[string]sdk.AccAddress{
        rules.PieceStrings[rules.BLACK_PLAYER]: black,
        rules.PieceStrings[rules.RED_PLAYER]:   red,
    }[color]
    return address, found, nil
}

func (storedGame StoredGame) GetWinnerAddress() (address sdk.AccAddress, found bool, err error) {
    return storedGame.GetPlayerAddress(storedGame.Winner)
}
```

## Update and check for the winner

This is a two-part update. You set the winner where relevant, but you also introduce new checks so that a game with a winner cannot be acted upon.

Start with a new error that you define as a constant:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/types/errors.go#L18]
    var (
        ...
+      ErrGameFinished = sdkerrors.Register(ModuleName, 1107, "game is already finished")
    )
```

And a new event attribute:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/types/keys.go#L43]
    const (
        MovePlayedEventType      = "move-played"
        ...
        MovePlayedEventWinner    = "winner"
+      MovePlayedEventBoard     = "board"
    )
```

At creation, in the _create game_ message handler, start with a neutral value:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/keeper/msg_server_create_game.go#L28]
    ...
    storedGame := types.StoredGame{
        ...
+      Winner:    rules.PieceStrings[rules.NO_PLAYER],
    }
    ...
```

With further checks when handling a play in the handler:

1. Check that the game has not finished yet:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/keeper/msg_server_play_move.go#L21-L23]
        ...
    +  if storedGame.Winner != rules.PieceStrings[rules.NO_PLAYER] {
    +      return nil, types.ErrGameFinished
    +  }
        isBlack := storedGame.Black == msg.Creator
        ...
    ```

2. Update the winner field, which [remains neutral](https://github.com/batkinson/checkers-go/blob/master/checkers/checkers.go#L165) if there is no winner yet, and adjust the board depending on whether the game is finished or not:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/keeper/msg_server_play_move.go#L61-L68]
        ...
    -  storedGame.Board = game.String()
    +  storedGame.Winner = rules.PieceStrings[game.Winner()]
    +
    +  lastBoard := game.String()
    +  if storedGame.Winner == rules.PieceStrings[rules.NO_PLAYER] {
    +      storedGame.Board = lastBoard
    +  } else {
    +      storedGame.Board = ""
    +  }
        ...
    ```

3. Add the new attribute in the event:

    ```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/keeper/msg_server_play_move.go#L80]
        ...
        ctx.EventManager().EmitEvent(
            sdk.NewEvent(types.MovePlayedEventType,
                ...
                sdk.NewAttribute(types.MovePlayedEventWinner, rules.PieceStrings[game.Winner()]),
    +          sdk.NewAttribute(types.MovePlayedEventBoard, lastBoard),
            ),
        )
        ...
    ```

Confirm the code compiles, add unit tests, and you are ready to handle the expiration of games.

## Unit tests

Add [tests](https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/types/full_game_test.go#L100-L174) for your new functions.

You also need to update your existing tests so that they pass with a new `Winner` value. Most of your tests need to add this line:

```diff-go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/keeper/msg_server_play_moveo_test.go#L107]
    ...
    require.EqualValues(t, types.StoredGame{
        ...
+      Winner: "*",
    }, game1)
    ...
```

This `"*"` means that in your tests no games have reached a conclusion with a winner. Time to fix that. In a dedicated `full_game_helpers.go` file, prepare all the moves that will be played in the test. For convenience, a move will be written as:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/testutil/full_game_helpers.go#L11-L17]
type GameMoveTest struct {
    player string
    fromX  uint64
    fromY  uint64
    toX    uint64
    toY    uint64
}
```

If you do not want to create a complete game yourself, you can choose this one:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/testutil/full_game_helpers.go#L19-L63]
var (
    Game1Moves = []GameMoveTest{
        {"b", 1, 2, 2, 3}, // "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|********|r*r*r*r*|*r*r*r*r|r*r*r*r*"
        {"r", 0, 5, 1, 4}, // "*b*b*b*b|b*b*b*b*|***b*b*b|**b*****|*r******|**r*r*r*|*r*r*r*r|r*r*r*r*"
        {"b", 2, 3, 0, 5}, // "*b*b*b*b|b*b*b*b*|***b*b*b|********|********|b*r*r*r*|*r*r*r*r|r*r*r*r*"
        ...
        {"r", 3, 6, 2, 5}, // "*b*b****|**b*b***|*****b**|********|********|**r*****|*B***b**|********"
        {"b", 1, 6, 3, 4}, // "*b*b****|**b*b***|*****b**|********|***B****|********|*****b**|********"
    }
)
```

You may want to add a small function that converts `"b"` and `"r"` into their respective player addresses:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/testutil/full_game_helpers.go#L65-L70]
func GetPlayer(color string, black string, red string) string {
    if color == "b" {
        return black
    }
    return red
}
```

And another that applies all the moves. This could become handy if you have multiple games in the future:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/testutil/full_game_helpers.go#L72-L91]
func PlayAllMoves(
    t *testing.T,
    msgServer types.MsgServer,
    context context.Context,
    gameIndex string,
    black string,
    red string,
    moves []GameMoveTest) {
    for _, move := range Game1Moves {
        _, err := msgServer.PlayMove(context, &types.MsgPlayMove{
            Creator:   GetPlayer(move.player, black, red),
            GameIndex: gameIndex,
            FromX:     move.fromX,
            FromY:     move.fromY,
            ToX:       move.toX,
            ToY:       move.toY,
        })
        require.Nil(t, err)
    }
}
```

Now, in a new file, create the test that plays all the moves, and checks at the end that the game has been saved with the right winner:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/game-winner/x/checkers/keeper/msg_server_play_move_winner_test.go#L12-L46]
func TestPlayMoveUpToWinner(t *testing.T) {
    msgServer, keeper, context := setupMsgServerWithOneGameForPlayMove(t)
    ctx := sdk.UnwrapSDKContext(context)

    testutil.PlayAllMoves(t, msgServer, context, "1", testutil.Game1Moves)

    systemInfo, found := keeper.GetSystemInfo(ctx)
    require.True(t, found)
    require.EqualValues(t, types.SystemInfo{
        NextId:        2,
    }, systemInfo)

    game, found := keeper.GetStoredGame(ctx, "1")
    require.True(t, found)
    require.EqualValues(t, types.StoredGame{
        Index:       "1",
        Board:       "",
        Turn:        "b",
        Black:       bob,
        Red:         carol,
        Winner:      "b",
    }, game)
    events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
    require.Len(t, events, 2)
    event := events[0]
    require.Equal(t, event.Type, "move-played")
    require.EqualValues(t, []sdk.Attribute{
        {Key: "creator", Value: bob},
        {Key: "game-index", Value: "1"},
        {Key: "captured-x", Value: "2"},
        {Key: "captured-y", Value: "5"},
        {Key: "winner", Value: "b"},
        {Key: "board", Value: "*b*b****|**b*b***|*****b**|********|***B****|********|*****b**|********"},
    }, event.Attributes[(len(testutil.Game1Moves)-1)*6:])
}
```

<HighlightBox type="note">

When checking the attributes, it only cares about the last six:

```go
event.Attributes[(len(testutil.Game1Moves)-1)*6:])
```

</HighlightBox>

Feel free to create another game won by the red player.

## Interact via the CLI

If you have created games in an earlier version of the code, you are now in a broken state. You cannot even play the old games because they have `.Winner == ""` and this will be caught by the `if storedGame.Winner != rules.PieceStrings[rules.NO_PLAYER]` test. At some point, look at [migrations](/hands-on-exercise/4-run-in-prod/2-migration-info.md) to avoid falling into such a situation with a blockchain in production.

Start again:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite chain serve --reset-once
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    --name checkers \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    ignite chain serve --reset-once
```

</CodeGroupItem>

</CodeGroup>

Do not forget to export `alice` and `bob` again, as explained in an [earlier section under "Interact via the CLI"](/hands-on-exercise/1-ignite-cli/4-create-message.md).

Confirm that there is no winner for a game when it is created:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
$ checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    checkersd tx checkers create-game $alice $bob --from $alice
$ docker exec -it checkers \
    checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

</CodeGroup>

This should show:

```txt
...
  winner: '*'
...
```

And when a player plays:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $alice
$ checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers \
    checkersd tx checkers play-move 1 1 2 2 3 --from $alice
$ docker exec -it checkers \
    checkersd query checkers show-stored-game 1
```

</CodeGroupItem>

</CodeGroup>

This should show:

```txt
...
  winner: '*'
...
```

Testing with the CLI up to the point where the game is resolved with a rightful winner is better covered by unit tests (as done here) or with a nice GUI. You will be able to partially test this with the CLI in the [next section](./4-game-forfeit.md), via a forfeit.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to prepare for terminating games by defining a **winner** field that differentiates between the outright winner of a completed game, the winner by forfeit when a game is expired, or a game which is still active.
* What new information and functions to add and where, including the winner field, helper functions to get any winner's address, a new error for games already finished, and checks for various application actions.
* How to update your tests to check the functionality of your code.
* How interacting via the CLI is partially impeded by any existing test games now being in a broken state due to the absence of a value in the winner field, with recommendations for next actions to take.

</HighlightBox>

<!--## Next up

You have introduced a [game FIFO](../2-ignite-cli-adv/3-game-fifo.md), a [game deadline](./1-game-deadline.md), and a game winner. Time to turn your attention to the [next section](./4-game-forfeit.md) to look into game forfeits.-->
