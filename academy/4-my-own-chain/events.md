---
title: Events - Emitting Game Information
order: 9
description: You emit game information using events
tag: deep-dive
---

# Events - Emitting Game Information

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [events](../2-main-concepts/events.md).
* Go is installed.
* You have the checkers blockchain codebase with `MsgPlayMove` and its handling. If not, follow the [previous steps](./play-game.md) or check out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/play-move-handler).
 
</HighlightBox>

<HighlightBox type="synopsis">

In this section, you will:

* Define event types.
* Emit events.
* Extend unit tests.

</HighlightBox>

Now that you have [added the possible actions](./play-game.md), including their return values, use events to alert/notify players.

Imagine a potential or current player waiting for their turn. It is not practical to look at all the transactions and search for the ones signifying the player's turn. It is better to listen to known events that let clients determine which player's turn it is.

Adding events to your application is as simple as:

1. Defining the events you want to use.
2. Emitting corresponding events as actions unfold.

## Game-created event

Start with the event that announces the creation of a new game. The goal is to:

* Inform/alert the players of the game.
* Make it easy for the players to find the relevant game.

Define new keys in `x/checkers/types/keys.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f026b947/x/checkers/types/keys.go#L34-L38]
const (
    StoredGameEventKey     = "NewGameCreated" // Indicates what key to listen to
    StoredGameEventCreator = "Creator"
    StoredGameEventIndex   = "Index" // What game is relevant
    StoredGameEventRed     = "Red" // Is it relevant to me?
    StoredGameEventBlack   = "Black" // Is it relevant to me?
)
```

Emit the event in your handler file `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f026b947/x/checkers/keeper/msg_server_create_game.go#L39-L48]
ctx.EventManager().EmitEvent(
    sdk.NewEvent(sdk.EventTypeMessage,
        sdk.NewAttribute(sdk.AttributeKeyModule, "checkers"),
        sdk.NewAttribute(sdk.AttributeKeyAction, types.StoredGameEventKey),
        sdk.NewAttribute(types.StoredGameEventCreator, msg.Creator),
        sdk.NewAttribute(types.StoredGameEventIndex, newIndex),
        sdk.NewAttribute(types.StoredGameEventRed, msg.Red),
        sdk.NewAttribute(types.StoredGameEventBlack, msg.Black),
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

Contrary to the _create game_ event, which alerted the players about a new game, the players now know which game IDs to keep an eye out for. There is no need to repeat the players' addresses, the game ID is information enough.

</HighlightBox>

You define new keys in `x/checkers/types/keys.go` similarly:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f026b947/x/checkers/types/keys.go#L41-L48]
const (
    PlayMoveEventKey       = "MovePlayed"
    PlayMoveEventCreator   = "Creator"
    PlayMoveEventIdValue   = "IdValue"
    PlayMoveEventCapturedX = "CapturedX"
    PlayMoveEventCapturedY = "CapturedY"
    PlayMoveEventWinner    = "Winner"
)
```

Emit the event in your file `x/checkers/keeper/msg_server_play_move.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f026b947/x/checkers/keeper/msg_server_play_move.go#L66-L76]
ctx.EventManager().EmitEvent(
     sdk.NewEvent(sdk.EventTypeMessage,
        sdk.NewAttribute(sdk.AttributeKeyModule, "checkers"),
        sdk.NewAttribute(sdk.AttributeKeyAction, types.PlayMoveEventKey),
        sdk.NewAttribute(types.PlayMoveEventCreator, msg.Creator),
        sdk.NewAttribute(types.PlayMoveEventIdValue, msg.IdValue),
        sdk.NewAttribute(types.PlayMoveEventCapturedX, strconv.FormatInt(int64(captured.X), 10)),
        sdk.NewAttribute(types.PlayMoveEventCapturedY, strconv.FormatInt(int64(captured.Y), 10)),
        sdk.NewAttribute(types.PlayMoveEventWinner, game.Winner().Color),
    ),
)
```

## Unit tests

The unit tests you have created so far still pass. However you also want to confirm that the events have been emitted in both situations. The events are recorded in the context, so the test is a little bit different. In `msg_server_create_game_test.go`, add this test:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f026b947/x/checkers/keeper/msg_server_create_game_test.go#L83-L106]
func TestCreate1GameEmitted(t *testing.T) {
    msgSrvr, _, context := setupMsgServerCreateGame(t)
    msgSrvr.CreateGame(context, &types.MsgCreateGame{
        Creator: alice,
        Red:     bob,
        Black:   carol,
    })
    ctx := sdk.UnwrapSDKContext(context)
    require.NotNil(t, ctx)
    events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
    require.Len(t, events, 1)
    event := events[0]
    require.EqualValues(t, sdk.StringEvent{
        Type: "message",
        Attributes: []sdk.Attribute{
            {Key: "module", Value: "checkers"},
            {Key: "action", Value: "NewGameCreated"},
            {Key: "Creator", Value: alice},
            {Key: "Index", Value: "1"},
            {Key: "Red", Value: bob},
            {Key: "Black", Value: carol},
        },
    }, event)
}
```

How can you _guess_ the order of elements? Easily, as you created them in this order. Alternatively, you can _peek_ by using Visual Studio Code:

1. Put a breakpoint after `event := events[0]`.
2. Run this test in **debug mode**: right-click the green arrow next to the test name.
3. Observe the live values on the left.

![Live values of event in debug mode](/academy/4-my-own-chain/images/go_test_debug_event_attributes.PNG)

The event emitted during a move may seem unexpected. In a _move_ unit test, two actions occur: a _create_, and a _move_. However, in the setup of this test you do not create blocks but _only_ hit your keeper. Therefore the context collects events but does not flush them. This is why you need to test only for the latter attributes, and verify an array slice that discards events that originate from the _create_ action: `event.Attributes[6:]`. This gives the following test:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f026b947/x/checkers/keeper/msg_server_play_move_test.go#L127-L152]
func TestPlayMoveEmitted(t *testing.T) {
    msgServer, _, context := setupMsgServerWithOneGameForPlayMove(t)
    msgServer.PlayMove(context, &types.MsgPlayMove{
        Creator: carol,
        IdValue: "1",
        FromX:   1,
        FromY:   2,
        ToX:     2,
        ToY:     3,
    })
    ctx := sdk.UnwrapSDKContext(context)
    require.NotNil(t, ctx)
    events := sdk.StringifyEvents(ctx.EventManager().ABCIEvents())
    require.Len(t, events, 1)
    event := events[0]
    require.Equal(t, event.Type, "message")
    require.EqualValues(t, []sdk.Attribute{
        {Key: "module", Value: "checkers"},
        {Key: "action", Value: "MovePlayed"},
        {Key: "Creator", Value: carol},
        {Key: "IdValue", Value: "1"},
        {Key: "CapturedX", Value: "-1"},
        {Key: "CapturedY", Value: "-1"},
        {Key: "Winner", Value: "NO_PLAYER"},
    }, event.Attributes[6:])
}
```

## Interact with the CLI

Bob made a move. Will Alice's move emit an event?

```sh
$ checkersd tx checkers play-move 0 0 5 1 4 --from $alice
```

The log is longer and not very readable, but the expected elements are present:

```
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"PlayMove"},{"key":"module","value":"checkers"},{"key":"action","value":"MovePlayed"},{"key":"Creator","value":"cosmos1gml05nvlhr0k27unas8mj827z6m77lhfpzzr3l"},{"key":"IdValue","value":"0"},{"key":"CapturedX","value":"-1"},{"key":"CapturedY","value":"-1"},{"key":"Winner","value":"NO_PLAYER"}]}]}]'
```

To parse the events and display them in a more user-friendly way, take the `txhash` again:

```sh
$ checkersd query tx 531E5708A1EFBE08D14ABF947FBC888BFC69CD6F04A589D478204BF3BA891AB7 --output json | jq ".raw_log | fromjson"
```

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
            "value": "PlayMove"
          },
          {
            "key": "module",
            "value": "checkers"
          },
          {
            "key": "action",
            "value": "MovePlayed"
          },
          {
            "key": "Creator",
            "value": "cosmos1r80ns8496ehe73dd70r3rnr07tk23mhu2wmw66"
          },
          {
            "key": "IdValue",
            "value": "0"
          },
          {
            "key": "CapturedX",
            "value": "-1"
          },
          {
            "key": "CapturedY",
            "value": "-1"
          },
          {
            "key": "Winner",
            "value": "NO_PLAYER"
          }
        ]
      }
    ]
  }
]
```

As you can see, no pieces were captured. However, it turns out that Alice placed her piece ready to be captured by Bob:

```sh
$ checkersd query checkers show-stored-game 0 --output json | jq ".StoredGame.game" | sed 's/"//g' | sed 's/|/\'$'\n/g'
*b*b*b*b
b*b*b*b*
***b*b*b
**b*****
*r******
**r*r*r*
*r*r*r*r
r*r*r*r*
```

The rules of the game included in this project mandate that the player captures a piece when possible. So Bob captures the piece:

```sh
$ checkersd tx checkers play-move 0 2 3 0 5 --from $bob
```

This returns:

```
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"PlayMove"},{"key":"module","value":"checkers"},{"key":"action","value":"MovePlayed"},{"key":"Creator","value":"cosmos1w0uumlj04eyvevhfawasm2dtjc24nexxygr8qx"},{"key":"IdValue","value":"0"},{"key":"CapturedX","value":"1"},{"key":"CapturedY","value":"4"},{"key":"Winner","value":"NO_PLAYER"}]}]}]'
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
            "value": "PlayMove"
          },
          {
            "key": "module",
            "value": "checkers"
          },
          {
            "key": "action",
            "value": "MovePlayed"
          },
          {
            "key": "Creator",
            "value": "cosmos1w0uumlj04eyvevhfawasm2dtjc24nexxygr8qx"
          },
          {
            "key": "IdValue",
            "value": "0"
          },
          {
            "key": "CapturedX",
            "value": "1"
          },
          {
            "key": "CapturedY",
            "value": "4"
          },
          {
            "key": "Winner",
            "value": "NO_PLAYER"
          }
        ]
      }
    ]
  }
]
```

Correct: Bob captured a piece and the board now looks like this:

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

This confirms that the _play_ event is emitted as expected. You can do the same for the _game created_ event.

## Next up

Time to add a third message to make it possible for a player to [reject a game](./reject-game.md) and to make your checkers blockchain more resistant to spam.
