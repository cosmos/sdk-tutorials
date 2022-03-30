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

Imagine a potential or current player waiting for their turn. It is not practical to look at all the transactions and search for the ones signifying the player's turn. It is better to listen to known events that let clients determine whose player's turn it is.

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

## Player moved the event

The created transaction to play a move informs the opponent about:

* Which player is relevant.
* Which game does the move relate to.
* When the move happened.
* What the move's outcome was.
* Whether the game was won.

Contrary to the _create game_ event, which alerted the players about a new game, the players now know which game IDs to keep an eye out for. There is no need to repeat the players' addresses, the game ID is sufficient.

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

## Interact with the CLI

Bob made a move. Will Alice's move emit an event?

```sh
$ checkersd tx checkers play-move 0 0 5 1 4 --from $alice
```

The log is longer and admittedly, a little less readable:

```
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"PlayMove"},{"key":"module","value":"checkers"},{"key":"action","value":"MovePlayed"},{"key":"Creator","value":"cosmos1gml05nvlhr0k27unas8mj827z6m77lhfpzzr3l"},{"key":"IdValue","value":"0"},{"key":"CapturedX","value":"-1"},{"key":"CapturedY","value":"-1"},{"key":"Winner","value":"NO_PLAYER"}]}]}]'
```

The expected elements are present. To parse the events and display them in a more user-friendly way, you can take the `txhash` again and do:

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

The rules of the game included in this project mandate that the player captures a piece when possible. So Bob goes ahead and captures the piece:

```sh
$ checkersd tx checkers play-move 0 2 3 0 5 --from $bob
```

It duly informs us that:

```
...
raw_log: '[{"events":[{"type":"message","attributes":[{"key":"action","value":"PlayMove"},{"key":"module","value":"checkers"},{"key":"action","value":"MovePlayed"},{"key":"Creator","value":"cosmos1w0uumlj04eyvevhfawasm2dtjc24nexxygr8qx"},{"key":"IdValue","value":"0"},{"key":"CapturedX","value":"1"},{"key":"CapturedY","value":"4"},{"key":"Winner","value":"NO_PLAYER"}]}]}]'
```

Which formatted is:

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

Correct, Bob captured a piece and the board looks like this:

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

Confirming that the _play_ event is emitted as expected. You can do the same for the _game created_ event.

## Next up

Time to add a third message to make it possible for a player to [reject a game](./reject-game.md) and make your checkers blockchain more resistant to spam.
