---
title: "Store Field - Record the Game Winner"
order: 14
description: Store the winner of a game
tag: deep-dive
---

# Store Field - Record the Game Winner

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [Protobuf](../2-main-concepts/protobuf.md).
* Go is installed.
* You have the checkers blockchain codebase with the deadline field and its handling. If not, follow the [previous steps](./game-deadline.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/v1-game-deadline).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Check for a game winner.
* Extend unit tests.

</HighlightBox>

To be able to terminate games, you need to discern between games that are current and those that have reached an end - for example, when they have been won. Therefore a good field to add is for the **winner**. It needs to contain:

* The winner of a game that reaches completion.
* Or the winner _by forfeit_ when a game is expired.
* Or a neutral value when the game is active.

<HighlightBox type="note">

In this exercise a draw is not handled and it would require yet another value to save in _winner_.

</HighlightBox>

## New information

In the `StoredGame` Protobuf definition file:

```protobuf [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/proto/checkers/stored_game.proto#L17]
message StoredGame {
    ...
    string winner = 11;
}
```

Have Ignite CLI and Protobuf recompile this file:

```sh
$ ignite generate proto-go
```

Add a helper function to get the winner's address, if it exists. A location is in `full_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/types/full_game.go#L53-L72]
func (storedGame *StoredGame) GetPlayerAddress(color string) (address sdk.AccAddress, found bool, err error) {
    red, err := storedGame.GetRedAddress()
    if err != nil {
        return nil, false, err
    }
    black, err := storedGame.GetBlackAddress()
    if err != nil {
        return nil, false, err
    }
    address, found = map[string]sdk.AccAddress{
        rules.RED_PLAYER.Color:   red,
        rules.BLACK_PLAYER.Color: black,
    }[color]
    return address, found, nil
}

func (storedGame *StoredGame) GetWinnerAddress() (address sdk.AccAddress, found bool, err error) {
    address, found, err = storedGame.GetPlayerAddress(storedGame.Winner)
    return address, found, err
}
```

## Update and check for the winner

This is a two-part update. You set the winner where relevant, but you also introduce new checks so that a game with a winner cannot be acted upon.

Start with a new error that you define as a constant:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/types/errors.go#L22]
ErrGameFinished = sdkerrors.Register(ModuleName, 1111, "game is already finished")
```
At creation, in the _create game_ message handler, start with a neutral value:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/keeper/msg_server_create_game.go#L32]
...
storedGame := types.StoredGame{
    ...
    Winner:    rules.PieceStrings[rules.NO_PLAYER],
}
```

With further checks when handling a play in the handler:

1. Check that the game has not finished yet:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/keeper/msg_server_play_move.go#L23-L25]
    if storedGame.Winner != rules.PieceStrings[rules.NO_PLAYER] {
        return nil, types.ErrGameFinished
    }
    ```

2. Update the winner field, which [remains neutral](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L165) if there is no winner yet:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/keeper/msg_server_play_move.go#L62]
    storedGame.Winner = rules.PieceStrings[game.Winner()]
    ```

3. Handle the FIFO differently depending on whether the game is finished or not:

    ```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/keeper/msg_server_play_move.go#L73-L77]
    if storedGame.Winner == rules.PieceStrings[rules.NO_PLAYER] {
        k.Keeper.SendToFifoTail(ctx, &storedGame, &nextGame)
    } else {
        k.Keeper.RemoveFromFifo(ctx, &storedGame, &nextGame)
    }
    ```

And when rejecting a game, in its handler:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/keeper/msg_server_reject_game.go#L21-L23]
if storedGame.Winner != rules.PieceStrings[rules.NO_PLAYER] {
    return nil, types.ErrGameFinished
}
```

Confirm the code compiles, add unit tests, and you are ready to handle the expiration of games.

## Unit tests

You need to update your existing tests so that they pass with a new `Winner` value. Most of your tests need to add this line:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/keeper/msg_server_play_move_fifo_test.go#L49]
require.EqualValues(t, types.StoredGame{
    ...
    Winner:    "*",
}, game1)
```

This means that in your tests no games have reached a conclusion with a winner. Time to fix that. In a dedicated `msg_server_play_move_winner_test.go` file, prepare all the moves that will be played in the test. For convenience, a move will be written as:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/keeper/msg_server_play_move_winner_test.go#L11-L17]
type GameMoveTest struct {
    player string
    fromX  uint64
    fromY  uint64
    toX    uint64
    toY    uint64
}
```

If you do not want to create a complete game yourself, you can choose this one:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/keeper/msg_server_play_move_winner_test.go#L19-L63]
var (
    game1moves = []GameMoveTest{
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/keeper/msg_server_play_move_winner_test.go#L65-L70]
func getPlayer(color string) string {
    if color == "b" {
        return carol
    }
    return bob
}
```

Now create the test that plays all the moves, and checks at the end that the game has been saved with the right winner and that the FIFO is empty again:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/1b52b43b/x/checkers/keeper/msg_server_play_move_winner_test.go#L72-L125]
func TestPlayMoveUpToWinner(t *testing.T) {
    msgServer, keeper, context := setupMsgServerWithOneGameForPlayMove(t)
    ctx := sdk.UnwrapSDKContext(context)

    for _, move := range game1moves {
        _, err := msgServer.PlayMove(context, &types.MsgPlayMove{
            Creator: getPlayer(move.player),
            IdValue: "1",
            FromX:   move.fromX,
            FromY:   move.fromY,
            ToX:     move.toX,
            ToY:     move.toY,
        })
        require.Nil(t, err)
    }

    nextGame, found := keeper.GetNextGame(ctx)
    require.True(t, found)
    require.EqualValues(t, types.NextGame{
        Creator:  "",
        IdValue:  2,
        FifoHead: "-1",
        FifoTail: "-1",
    }, nextGame)

    game1, found1 := keeper.GetStoredGame(ctx, "1")
    require.True(t, found1)
    require.EqualValues(t, types.StoredGame{
        Creator:   alice,
        Index:     "1",
        Game:      "*b*b****|**b*b***|*****b**|********|***B****|********|*****b**|********",
        Turn:      "b",
        Red:       bob,
        Black:     carol,
        MoveCount: uint64(len(game1moves)),
        BeforeId:  "-1",
        AfterId:   "-1",
        Deadline:  types.FormatDeadline(ctx.BlockTime().Add(types.MaxTurnDuration)),
        Winner:    "b",
    }, game1)
    events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
    require.Len(t, events, 1)
    event := events[0]
    require.Equal(t, event.Type, "message")
    require.EqualValues(t, []sdk.Attribute{
        {Key: "module", Value: "checkers"},
        {Key: "action", Value: "MovePlayed"},
        {Key: "Creator", Value: carol},
        {Key: "IdValue", Value: "1"},
        {Key: "CapturedX", Value: "2"},
        {Key: "CapturedY", Value: "5"},
        {Key: "Winner", Value: "b"},
    }, event.Attributes[6+39*7:])
}
```

Feel free to create another game won by the red player.

## Interact via the CLI

If you have created games in an earlier version of the code, you are now in a broken state. You cannot even play the old games because they have `.Winner == ""` and this will be caught by the `if storedGame.Winner != rules.PieceStrings[rules.NO_PLAYER]` test. Start again:

```sh
$ ignite chain serve --reset-once
```

Do not forget to export `alice` and `bob` again, as explained in an [earlier section](./create-message.md).

Confirm that there is no winner for a game when it is created:

```sh
$ checkersd tx checkers create-game $alice $bob --from $alice
$ checkersd query checkers show-stored-game 1
```

This should show:

```
...
  winner: "*"
...
```

And when a player plays:

```sh
$ checkersd tx checkers play-move 1 1 2 2 3 --from $bob
$ checkersd query checkers show-stored-game 1
```

Testing with the CLI up to the point where the game is resolved with a rightful winner is better covered by unit tests or with a nice GUI. You will be able to partially test this in the [next section](./game-forfeit.md), via a forfeit.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to prepare for terminating games by defining a **winner** field that differentiates between the outright winner of a completed game, the winner by forfeit when a game is expired, or a game which is still active.
* What new information and functions to add and where, including the winner field, helper functions to get any winner's address, a new error for games already finished, and checks for various application actions.
* How to update your tests to check the functionality of your code.
* How interacting via the CLI is partially impeded by any existing test games now being in a broken state due to the absence of a value in the winner field, with recommendations for next actions to take.

</HighlightBox>

<!--## Next up

You have introduced a [game FIFO](./game-fifo.md), a [game deadline](./game-deadline.md), and a game winner. Time to turn your attention to the [next section](./game-forfeit.md) to look into game forfeits.-->
