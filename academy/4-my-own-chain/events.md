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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f5764b84452983bc85e59823302464723df02f9a/x/checkers/types/keys.go#L34-L39]
const (
    StoredGameEventKey     = "NewGameCreated" // Indicates what key to listen to
    StoredGameEventCreator = "Creator"
    StoredGameEventIndex   = "Index" // What game is relevant
    StoredGameEventRed     = "Red" // Is it relevant to me?
    StoredGameEventBlack   = "Black" // Is it relevant to me?
)
```

Emit the event in your handler file `x/checkers/keeper/msg_server_create_game.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f5764b84452983bc85e59823302464723df02f9a/x/checkers/keeper/msg_server_create_game.go#L37-L46]
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f5764b84452983bc85e59823302464723df02f9a/x/checkers/types/keys.go#L41-L48]
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

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f5764b84452983bc85e59823302464723df02f9a/x/checkers/keeper/msg_server_play_move.go#L62-L72]
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

## Next up

Time to add a third message to make it possible for a player to [reject a game](./reject-game.md) and make your checkers blockchain more resistant to spam.
