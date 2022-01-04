---
title: "Events"
order: 11
description: Using events in app development
tag: deep-dive
---

# Events

<HighlightBox type="synopsis">

Dedicate some time to events in the Cosmos SDK: learn what events are, how events are useful, and how events are implemented in applications.

Before diving into events, start with understanding the concepts covered in the following sections:

* [Transactions](./transactions.md)
* [Messages](./messages.md)
* [Modules](./modules.md)
* [Protobuf](./protobuf.md)

Code examples are provided at the end of this section. Examples show events implemented in the checkers blockchain.

</HighlightBox>

An event is an object that contains information about the execution of applications. Events are used by service providers like block explorers and wallets to track the execution of various messages and index transactions.

Events are implemented as an alias of the ABCI `event` type in the form `{eventType}.{attributeKey}={attributeValue}` in the Cosmos SDK.

Events allow application developers to attach additional information. This means that transactions might be queried using events:

```protobuf
// Events allow application developers to attach additional information to
// ResponseBeginBlock, ResponseEndBlock, ResponseCheckTx and ResponseDeliverTx.
// Later, transactions may be queried using these events.
message Event {
  string                  type       = 1;
  repeated EventAttribute attributes = 2 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag)  = "attributes,omitempty"
  ];
}
```

## Structure

Two elements stand out in the above:

* A `type` to categorize the event at a high level. For example, the Cosmos SDK uses the `message` _type_ to filter events by `Msg`.
* A list of `attributes`, which are key-value pairs giving more information on the categorized event. For example, we can filter events by key-value pairs using `message.action={some_action}, message.module={some_module}` or `message.sender={a_sender}` for the `message` type.

<HighlightBox type="info">

Make sure to add `'` (single quotes) around each attribute value to parse the attribute values as strings.

</HighlightBox>

Events, their type, and attributes are defined on a per-module basis in the module's `/types/events.go` file. Each module additionally documents its events under `spec/xx_events.md`.

Events are returned to the underlying consensus engine in response to the following ABCI messages:

* `BeginBlock`
* `EndBlock`
* `CheckTx`
* `DeliverTx`

Events are managed by an abstraction called the `EventManager`. Events are triggered from the module's Protobuf `Msg` service with `EventManager`. Let's explore this abstraction further.

## `EventManager`

`Eventmanager` tracks a list of events for the entire execution flow of a transaction or `BeginBlock`/`EndBlock`. `EventManager` implements a simple wrapper around a slice of event objects, which can be emitted from and provides useful methods. The most used method for Cosmos SDK module and application developers is `EmitEvent`.

Module developers should handle event emission via `EventManager#EmitEvent` in each message handler and in each `BeginBlock` or `EndBlock` handler accessed via the `Context`. Event emission generally follows this pattern:

```go
func (em *EventManager) EmitEvent(event Event) {
    em.events = em.events.AppendEvent(event)
}
```

Each module's handler function should also set a new `EventManager` to the context to isolate emitted events per message:

```go
func NewHandler(keeper Keeper) sdk.Handler {
    return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
        ctx = ctx.WithEventManager(sdk.NewEventManager())
        switch msg := msg.(type) {
            // event types
        }
    ...
    }
}
```

## Subscribing to events

You can use Tendermint's [WebSocket](https://docs.tendermint.com/master/tendermint-core/subscription.html#subscribing-to-events-via-websocket) to subscribe to events by calling the `subscribe` RPC method.

The main `eventCategories` you can subscribe to are:

* **`NewBlock`.** Contains events triggered during `BeginBlock` and `EndBlock`.
* **`Tx`.** Contains events triggered during `DeliverTx`, the transaction processing.
* **`ValidatorSetUpdates`.** Contains updates about the set of validators for the block.

<HighlightBox type="info">

You can find a full list of event categories in the [Tendermint Go documentation](https://godoc.org/github.com/tendermint/tendermint/types#pkg-constants).

</HighlightBox>

You can filter for event types and attribute values. For example, a transfer transaction triggers an event of type `Transfer` and has `Recipient` and `Sender` as attributes as defined in the `events.go` file of the `bank` module.

## Next up

You just learned about events, where they are expected, and how to emit or receive them. Have a look at the code samples below or head to the [next section](./context.md) to learn about the `Context` object.

<ExpansionPanel title="Show me some code for my checkers blockchain">

It would be good to document a game's lifecycle via events in your checkers blockchain.

For instance, you can emit a specific event such that when creating the game:

```go
var ctx sdk.Context
ctx.EventManager().EmitEvent(
    sdk.NewEvent(sdk.EventTypeMessage,
        sdk.NewAttribute(sdk.AttributeKeyModule, "checkers"),
        sdk.NewAttribute(sdk.AttributeKeyAction, "NewGameCreated"),
        sdk.NewAttribute("Creator", msg.Creator),
        sdk.NewAttribute("Index", newIndex),
        sdk.NewAttribute("Red", msg.Red),
        sdk.NewAttribute("Black", msg.Black),
        sdk.NewAttribute("Wager", strconv.FormatUint(msg.Wager, 10)),
        sdk.NewAttribute("Token", msg.Token),
    ),
)
```

It is easy to add events to the other transaction types. Keep in mind that events are meant to inform and notify relevant parties.

You should also emit an event for games that have timed out. This is part of their lifecycle after all. You would do that in the end blocker:

```go
ctx.EventManager().EmitEvent(
    sdk.NewEvent(sdk.EventTypeMessage,
        sdk.NewAttribute(sdk.AttributeKeyModule, "checkers"),
        sdk.NewAttribute(sdk.AttributeKeyAction, "GameForfeited"),
        sdk.NewAttribute("IdValue", storedGameId),
        sdk.NewAttribute("Winner", rules.NO_PLAYER.Color), // Or the rightful winner.
    ),
)
```

</ExpansionPanel>
