---
title: "Events - Emit Game Information"
order: 10
description: Emit game information using events
tag: deep-dive
---

# Events - Emitting Game Information

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [events](../2-main-concepts/events.md).
* Go is installed.
* You have the checkers blockchain codebase with `MsgPlayMove` and its handling. If not, follow the [previous steps](./play-game.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/play-move-handler).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Define event types.
* Emit events.
* Extend unit tests.

</HighlightBox>

Now that you have [added the possible actions](./play-game.md), including their return values, use events to notify players. Your blockchain can now create and play games. However, it does not inform the outside world about this in a convenient way. That is where events come in - but what do you need to emit them?

Imagine a potential or current player waiting for their turn. It is not practical to look at all the transactions and search for the ones signifying the player's turn. It is better to listen to known events that let clients determine which player's turn it is.

Adding events to your application is as simple as:

1. Defining the events you want to use.
2. Emitting corresponding events as actions unfold.

## Some initial thoughts

Before you dive into the specifics of the exercise, ask yourself:

* Why do actions warrant a detailed event?
* What level of detail goes into each event?
* How do you make it easy for external parties to understand your events?
* At what stage do you emit events?

## Code needs

Now start by thinking about the following:

* How do you adjust your code to do all this?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

Only focus on the narrow issue of event emission.

## Game-created event

Start with the event that announces the creation of a new game. The goal is to:

* Inform the players about the game.
* Make it easy for the players to find the relevant game.

Define new keys in `x/checkers/types/keys.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/two-events/x/checkers/types/keys.go#L28-L34]
const (
    GameCreatedEventType      = "new-game-created" // Indicates what event type to listen to
    GameCreatedEventCreator   = "creator"          // Subsidiary information
    GameCreatedEventGameIndex = "game-index"       // What game is relevant
    GameCreatedEventBlack     = "black"            // Is it relevant to me?
    GameCreatedEventRed       = "red"              // Is it relevant to me?
)
```

Emit the event in your handler file `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/two-events/x/checkers/keeper/msg_server_create_game.go#L39-L46]
ctx.EventManager().EmitEvent(
    sdk.NewEvent(types.GameCreatedEventType,
        sdk.NewAttribute(types.GameCreatedEventCreator, msg.Creator),
        sdk.NewAttribute(types.GameCreatedEventGameIndex, newIndex),
        sdk.NewAttribute(types.GameCreatedEventBlack, msg.Black),
        sdk.NewAttribute(types.GameCreatedEventRed, msg.Red),
    ),
)
```

Now you must implement this correspondingly in the GUI, or include a server to listen for such events.

## Player-moved event

The created transaction to play a move informs the opponent about:

* Which player is relevant.
* Which game the move relates to.
* When the move happened.
* The move's outcome.
* Whether the game was won.

<HighlightBox type="info">

Contrary to the _create game_ event, which alerted the players about a new game, the players now know which game IDs to watch for. There is no need to repeat the players' addresses, the game ID is information enough.

</HighlightBox>

You define new keys in `x/checkers/types/keys.go` similarly:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/two-events/x/checkers/types/keys.go#L36-L43]
const (
    MovePlayedEventType      = "move-played"
    MovePlayedEventCreator   = "creator"
    MovePlayedEventGameIndex = "game-index"
    MovePlayedEventCapturedX = "captured-x"
    MovePlayedEventCapturedY = "captured-y"
    MovePlayedEventWinner    = "winner"
)
```

Emit the event in your file `x/checkers/keeper/msg_server_play_move.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/two-events/x/checkers/keeper/msg_server_play_move.go#L61-L69]
ctx.EventManager().EmitEvent(
    sdk.NewEvent(types.MovePlayedEventType,
        sdk.NewAttribute(types.MovePlayedEventCreator, msg.Creator),
        sdk.NewAttribute(types.MovePlayedEventGameIndex, msg.GameIndex),
        sdk.NewAttribute(types.MovePlayedEventCapturedX, strconv.FormatInt(int64(captured.X), 10)),
        sdk.NewAttribute(types.MovePlayedEventCapturedY, strconv.FormatInt(int64(captured.Y), 10)),
        sdk.NewAttribute(types.MovePlayedEventWinner, rules.PieceStrings[game.Winner()]),
    ),
)
```

## Unit tests

The unit tests you have created so far still pass. However you also want to confirm that the events have been emitted in both situations. The events are recorded in the context, so the test is a little bit different. In `msg_server_create_game_test.go`, add this test:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/two-events/x/checkers/keeper/msg_server_create_game_test.go#L82-L103]
func TestCreate1GameEmitted(t *testing.T) {
    msgSrvr, _, context := setupMsgServerCreateGame(t)
    msgSrvr.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Black:   bob,
        Red:     carol,
    })
    ctx := sdk.UnwrapSDKContext(context)
    require.NotNil(t, ctx)
    events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
    require.Len(t, events, 1)
    event := events[0]
    require.EqualValues(t, sdk.StringEvent{
        Type: "new-game-created",
        Attributes: []sdk.Attribute{
            {Key: "creator", Value: alice},
            {Key: "game-index", Value: "1"},
            {Key: "black", Value: bob},
            {Key: "red", Value: carol},
        },
    }, event)
}
```

How can you _guess_ the order of elements? Easily, as you created them in this order. Alternatively, you can _peek_ by using Visual Studio Code:

1. Put a breakpoint on the line after `event := events[0]`.
2. Run this test in **debug mode**: right-click the green arrow next to the test name.
3. Observe the live values on the left.

![Live values of event in debug mode](/academy/4-my-own-chain/images/go_test_debug_event_attributes.png)

As for the events emitted during the _play move_ test, there are two of them: one for the creation and the other for the play. Because this is a unit test and each action is not isolated into individual transactions, the context collects all events emitted during the test. It just so happens that the context prepends them - the newest one is at index `0`. Which is why, when you fetch them, the play event is at `events[0]`.

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/two-events/x/checkers/keeper/msg_server_play_move_test.go#L110-L135]
func TestPlayMoveEmitted(t *testing.T) {
    msgServer, _, context := setupMsgServerWithOneGameForPlayMove(t)
    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator:   bob,
        GameIndex: "1",
        FromX:     1,
        FromY:     2,
        ToX:       2,
        ToY:       3,
    })
    ctx := sdk.UnwrapSDKContext(context)
    require.NotNil(t, ctx)
    events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
    require.Len(t, events, 2)
    event := events[0]
    require.EqualValues(t, sdk.StringEvent{
        Type: "move-played",
        Attributes: []sdk.Attribute{
            {Key: "creator", Value: bob},
            {Key: "game-index", Value: "1"},
            {Key: "captured-x", Value: "-1"},
            {Key: "captured-y", Value: "-1"},
            {Key: "winner", Value: "*"},
        },
    }, event)
}
```

When two players play one after the other, the context collates the attributes of `move-played` all together in a single array in an appending fashion, with the older attributes at the lower indices, starting at `0`. For instance, you have to rely on array slices like `event.Attributes[5:]` to test the attributes of the second `move-played` event:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/two-events/x/checkers/keeper/msg_server_play_move_test.go#L261-L292]
func TestPlayMove2Emitted(t *testing.T) {
    msgServer, _, context := setupMsgServerWithOneGameForPlayMove(t)
    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator:   bob,
        GameIndex: "1",
        FromX:     1,
        FromY:     2,
        ToX:       2,
        ToY:       3,
    })
    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator:   carol,
        GameIndex: "1",
        FromX:     0,
        FromY:     5,
        ToX:       1,
        ToY:       4,
    })
    ctx := sdk.UnwrapSDKContext(context)
    require.NotNil(t, ctx)
    events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
    require.Len(t, events, 2)
    event := events[0]
    require.Equal(t, "move-played", event.Type)
    require.EqualValues(t, []sdk.Attribute{
        {Key: "creator", Value: carol},
        {Key: "game-index", Value: "1"},
        {Key: "captured-x", Value: "-1"},
        {Key: "captured-y", Value: "-1"},
        {Key: "winner", Value: "*"},
    }, event.Attributes[5:])
}
```

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

## Interact with the CLI

If you did not do it already, start your chain with Ignite.

Alice made a move. Will Bob's move emit an event?

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 0 5 1 4 --from $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move 1 0 5 1 4 --from $bob
```

</CodeGroupItem>

</CodeGroup>

The log is longer and not very readable, but the expected elements are present:

```txt
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"play_move"}]},{"type":"move-played","attributes":[{"key":"creator","value":"cosmos1xf6s64kaw7at7um8lnwj65vadxqr6hnyhr9v83"},{"key":"game-index","value":"1"},{"key":"captured-x","value":"-1"},{"key":"captured-y","value":"-1"},{"key":"winner","value":"*"}]}]}]'
```

To parse the events and display them in a more user-friendly way, take the `txhash` again:

```sh
$ checkersd query tx 531E5708A1EFBE08D14ABF947FBC888BFC69CD6F04A589D478204BF3BA891AB7 --output json | jq ".raw_log | fromjson"
```
<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd query tx 531E5708A1EFBE08D14ABF947FBC888BFC69CD6F04A589D478204BF3BA891AB7 --output json | jq '.raw_log | fromjson'
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c "checkersd query tx 531E5708A1EFBE08D14ABF947FBC888BFC69CD6F04A589D478204BF3BA891AB7 --output json | jq '.raw_log | fromjson'"
```

</CodeGroupItem>

</CodeGroup>

This returns something like:

```json
[
  {
    "events": [
      {
        "type": "message",
        "attributes": [
          {
            "key": "action",
            "value": "play_move"
          }
        ]
      },
      {
        "type": "move-played",
        "attributes": [
          {
            "key": "creator",
            "value": "cosmos1xf6s64kaw7at7um8lnwj65vadxqr6hnyhr9v83"
          },
          {
            "key": "game-index",
            "value": "1"
          },
          {
            "key": "captured-x",
            "value": "-1"
          },
          {
            "key": "captured-y",
            "value": "-1"
          },
          {
            "key": "winner",
            "value": "*"
          }
        ]
      }
    ]
  }
]
```

As you can see, no pieces were captured. However, it turns out that Bob placed his piece ready to be captured by Alice:

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

Which prints:

```
*b*b*b*b
b*b*b*b*
***b*b*b
**b*****
*r******    <-- Ready to be captured
**r*r*r*
*r*r*r*r
r*r*r*r*
```

The rules of the game included in this project mandate that the player captures a piece when possible. So Alice captures the piece:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd tx checkers play-move 1 2 3 0 5 --from $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd tx checkers play-move 1 2 3 0 5 --from $alice
```

</CodeGroupItem>

</CodeGroup>

This returns:

```txt
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"play_move"}]},{"type":"move-played","attributes":[{"key":"creator","value":"cosmos1qxeu0aclpl45429aeveh3t4e7y9ghr22r5d9r2"},{"key":"game-index","value":"1"},{"key":"captured-x","value":"1"},{"key":"captured-y","value":"4"},{"key":"winner","value":"*"}]}]}]'
```

When formatted for clarity, you see the following::

```json
[
  {
    "events": [
      {
        "type": "message",
        "attributes": [
          {
            "key": "action",
            "value": "play_move"
          }
        ]
      },
      {
        "type": "move-played",
        "attributes": [
          {
            "key": "creator",
            "value": "cosmos1qxeu0aclpl45429aeveh3t4e7y9ghr22r5d9r2"
          },
          {
            "key": "game-index",
            "value": "1"
          },
          {
            "key": "captured-x",
            "value": "1"
          },
          {
            "key": "captured-y",
            "value": "4"
          },
          {
            "key": "winner",
            "value": "*"
          }
        ]
      }
    ]
  }
]
```

Correct: Alice captured a piece and the board now looks like this:

```
*b*b*b*b
b*b*b*b*
***b*b*b
********
********
b*r*r*r*
*r*r*r*r
r*r*r*r*
```

This confirms that the _play_ event is emitted as expected. You can confirm the same for the _game created_ event.

When you are done with this exercise you can stop Ignite's `chain serve.`

## Next up

Time to add a third message to make it possible for a player to [reject a game](./reject-game.md) and to make your checkers blockchain more resistant to spam.
