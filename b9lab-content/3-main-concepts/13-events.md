---
title: "Events"
order: 10
description: Using events in app development
tag: deep-dive
---

# Events

An event is an object that contains information about the execution of the application. Events are used by service providers (block explorers, wallets, and IBC relayers) to track execution of various messages and index transactions.

In the Cosmos SDK, events are implemented as an alias of the ABCI `event` type in the forms `{eventType}.{attributeKey}={attributeValue}`.

Events allow app developers to attach additional information. This means that transactions might be queried using the events:

```
// Events allows application developers to attach additional information to
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

* A `type` to categorize the Event at a high-level; for example, the Cosmos SDK uses the `message` _type_ to filter events by Msgs.
* A list of `attributes` are key-value pairs that give more information about the categorized event. For example, for the "message" type, we can filter events by key-value pairs using `message.action={some_action}, message.module={some_module}` or `message.sender={a_sender}`.

<HighlightBox type=”info”>

To parse the attribute values as strings, make sure to add `'` (single quotes) around each attribute value.

</HighlightBox>

Events, their type and attributes are defined on a per-module basis in the module's `/types/events.go` file, and are triggered from the module's Protobuf Msg service by using the `EventManager`. Additionally, each module documents its events under `spec/xx_events.md`.
Events are returned to the underlying consensus engine in response to the following ABCI messages:

* `BeginBlock`
* `EndBlock`
* `CheckTx`
* `DeliverTx`

Events are managed by an abstraction called the `EventManager`.

## EventManager

`EventManager` tracks a list of events for the entire execution flow of a transaction or `BeginBlock`/`EndBlock`. `EventManager` implements a simple wrapper around a slice of `Event` objects that can be emitted from and provides useful methods. The most used method for Cosmos SDK module and application developers is `EmitEvent`.

<HighlightBox type=”info”>

Module developers should handle event emission via the `EventManager#EmitEvent` in each message handler and in each `BeginBlock`/`EndBlock` handler, accessed via the `Context`, where event emission generally follows this pattern:

```
func (em *EventManager) EmitEvent(event Event) {
    em.events = em.events.AppendEvent(event)
}
```

Each module's handler function should also set a new `EventManager` to the context to isolate emitted events per message:

```
func NewHandler(keeper Keeper) sdk.Handler {
    return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
        ctx = ctx.WithEventManager(sdk.NewEventManager())
        switch msg := msg.(type) {
    // event types
```

</HighlightBox>

## Subscribing to Events

You can use Tendermint's Websocket (opens new window) to subscribe to events by calling the subscribe RPC method.

The main `eventCategories` you can subscribe to are:

* **NewBlock**: Contains Events triggered during `BeginBlock` and `EndBlock`.
* **Tx**: Contains events triggered during `DeliverTx` (i.e. transaction processing).
* **ValidatorSetUpdates**: Contains validator set updates for the block.

<HighlightBox type=”info”>

→ You can find a full list of event categories [here](https://godoc.org/github.com/tendermint/tendermint/types#pkg-constants)

</HighlightBox>

You can filter for event types and attribute values. For example, a transfer transaction triggers an event of type `Transfer` and has `Recipient` and `Sender` as attributes (as defined in the `events.go` file of the bank module.

<ExpansionPanel title="Show me some code for my checkers blockchain">

In your checkers blockchain, it would be good to document a game's lifecycle via events. For instance, when creating the game, you can emit a specific event such that:

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
From this model, it is easy to add events to the other transaction types, where you keep in mind that the events are meant to inform and notify relevant parties.

You should also emit an event for games that have timed out. After all, this is part of their lifecycle. You would do that in the end blocker:

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
