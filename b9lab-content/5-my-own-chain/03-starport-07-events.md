---
title: Adding Events
order: 9
description: Inform your players.
---

# Adding Events

Now that you have added the possible actions, including their return values, it would be welcome to use the events system in order to alert players. You can imagine that a potential or current player is there, waiting for their turn. It is not practical to look at all transactions and find the relevant ones that signify "that's my turn". Better instead to listen to known events that tell the same.

That's where events come in. Adding events to your application is as simple as:

1. Defining the events you want to use.
2. Emit them at the right locations.

## Game Created Event

Let's start with the event that informs that a new game has been created. The goal is to:

* Inform / alert the concerned players.
* Make it easy for them to find the relevant game.

So, you define some new keys in `x/checkers/types/keys.go`:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/f5764b84452983bc85e59823302464723df02f9a/x/checkers/types/keys.go#L34-L39]
const (
    StoredGameEventKey     = "NewGameCreated" // Indicates what key to listen to
    StoredGameEventCreator = "Creator"
    StoredGameEventIndex   = "Index" // What game is relevant
    StoredGameEventRed     = "Red" // Is it relevant to me?
    StoredGameEventBlack   = "Black" // Is it relevant to me?
)
```
And emit the event in your file `x/checkers/keeper/msg_server_create_game.go`:

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
There is not much more to it. What would need to be done is the counterpart of this in the GUI, or a server that listens for such events.

## Player Moved Event

Since you also created a transaction to play a move, it is expected to inform the opponent about:

* Alerting the relevant player.
* Which game this is about.
* When such a move has happened, and what its outcome was.
* Whether the game has been won.

Contrary to the create-game event, the players are already informed as to which game ids to watch out for. So there is no need to repeat the player addresses. Instead, the game id is information enough.

So, similarly, you define new keys in `x/checkers/types/keys.go`:

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

And emit the event in your file `x/checkers/keeper/msg_server_play_move.go`:

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
And that's it. You have emitted two events that inform external systems of step changes in the lifecycle of a game. Time to make it possible for a player to reject a game.
