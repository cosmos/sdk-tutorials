---
title: Events - Emitting Game Information
order: 9
description: You emit game information using events
tag: deep-dive
---

# Events - Emitting Game Information

<HighlightBox type="synopsis">

Make sure you have all you need before proceeding:

* You understand the concepts of [events](../2-main-concepts/events.md).
* Have Go installed.
* The checkers blockchain codebase with `MsgPlayMove` and its handling. You can get there by following the [previous steps](./play-game.md) or checking out [the relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/play-move-handler).

</HighlightBox>

Now that you have [added the possible actions](./play-game.md) including their return values, use events to alert/notify players.

Imagine a potential or current player waiting for their turn. It is not practical to look at all the transactions and search for the ones signifying the player's turn. It is better to listen to known events that let determine whose player's turn it is.

Adding events to your application is as simple as:

1. Defining the events you want to use.
2. Emitting the events at the right locations.

## Game created event

Start with the event that announces the creation of a new game. The goal is to:

* Inform/alert the players of the game.
* Make it easy for the players to find the relevant game.

So define some new keys in `x/checkers/types/keys.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/792d879/x/checkers/types/keys.go#L34-L38]
const (
    StoredGameEventKey     = "NewGameCreated" // Indicates what key to listen to
    StoredGameEventCreator = "Creator"
    StoredGameEventIndex   = "Index" // What game is relevant
    StoredGameEventRed     = "Red" // Is it relevant to me?
    StoredGameEventBlack   = "Black" // Is it relevant to me?
)
```

Emit the event in your handler file `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/792d879/x/checkers/keeper/msg_server_create_game.go#L39-L48]
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

The only thing left to do is to implement this correspondingly in the GUI or include a server to listen for such events.

## Player moved event

The created transaction to play a move informs the opponent about:

* Which player is relevant.
* Which game does the move relate to.
* When the move happened.
* What the move's outcome was.
* Whether the game was won.

Contrary to the _create game_ event, which alerted the players about a new game, the players now know which game IDs to keep an eye out for. There is no need to repeat the players' addresses, the game ID is information enough.

You define new keys in `x/checkers/types/keys.go` similarly:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/792d879/x/checkers/types/keys.go#L41-L48]
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/792d879/x/checkers/keeper/msg_server_play_move.go#L62-L72]
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

The unit tests you have created so far still pass. However you also want to confirm that the events have been emitted in both situations. The events are recorded in the context, so the test is a little bit different. In `msg_server_create_game_test.go`, you can add this test:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/792d879/x/checkers/keeper/msg_server_create_game_test.go#L83-L106]
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

How can you _guess_ the order of elements? Easy, you created them in this order. Alternatively, you can _peek_ by using Visual Studio Code and:

1. Putting a breakpoint after `event := events[0]`.
2. Running this test in **debug mode**, by right-clicking the green arrow next to the test name.
3. Observing the live values on the left.

![Live values of event in debug mode](/go_test_debug_event_attributes.PNG)

Now, about the event emitted during a move, it is a bit unexpected. In a _move_ unit test two actions happen, a _create_ and a _move_. However, in the setup of this test, you do not create blocks, but instead _only_ hit your keeper. So the context collects events but does not flush them. This is why you need to test only for the latter attributes, and verify an array slice that discards the events that originate from the _create_ action: `event.Attributes[6:]`. This gives the test:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/792d879/x/checkers/keeper/msg_server_play_move_test.go#L103-L128]
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

## Next up

Time to add a third message to make it possible for a player to [reject a game](./reject-game.md) and make your checkers blockchain more resistant to spam.
