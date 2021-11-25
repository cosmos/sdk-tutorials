---
title: Adding Events
order: 9
description: Inform your players
---

# Adding Events

Now that you have [added the possible actions](./03-starport-06-play-game.md), including their return values, use events to alert/notify players.

Imagine a potential or current player waiting for their turn. It is not practical to look at all the transactions and search for the ones signifying the player's turn. It is better to instead listen to known events that let determine whose player's turn it is.

This is where events come in. Adding events to your application is as simple as:

1. Defining the events you want to use.
2. Emitting them at the right locations.

## Game created event

Let's start with the event that announces the creation of a new game. The goal is to:

* Inform/alert the concerned players (the players of the game).
* Make it easy for the players to find the relevant game.

So, define some new keys in `x/checkers/types/keys.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f5764b84452983bc85e59823302464723df02f9a/x/checkers/types/keys.go#L34-L39]
const (
    StoredGameEventKey     = "NewGameCreated" // Indicates what key to listen to
    StoredGameEventCreator = "Creator"
    StoredGameEventIndex   = "Index" // What game is relevant
    StoredGameEventRed     = "Red" // Is it relevant to me?
    StoredGameEventBlack   = "Black" // Is it relevant to me?
)
```

Emit the event in your file `x/checkers/keeper/msg_server_create_game.go`:

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

The only thing left to do is to implement this correspondingly in the GUI or include a server listening for such events.

## Player moved event

Since you also created a transaction to play a move, it is expected to inform the opponent about:

* Which player is relevant.
* Which game does the move relate to.
* When the move happened.
* What the move's outcome was.
* Whether the game was won.

Contrary to the "create game" event, the players know which game IDs to keep an eye out for. So, there is no need to repeat the players' addresses. The game ID is information enough.

Similarly, you define new keys in `x/checkers/types/keys.go`:

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

That is it: you have emitted two events that inform external systems of step changes in the lifecycle of a game. Time to make it possible for a player to reject a game.
