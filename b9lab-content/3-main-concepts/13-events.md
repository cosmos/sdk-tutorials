---
title: "Events"
order: 11
description: Using events in app development
tag: deep-dive
---

# Events

An event is an object that contains information about the execution of applications. Events are used by service providers (block explorers, wallets, etc.) to track the execution of various messages and index transactions.

In the Cosmo SDK, events are implemented as an alias of the ABCI `event` type in the form `{eventType}.{attributeKey}={attributeValue}`.

Events allow application developers to attach additional information. This means that transactions might be queried using events:

```
// Event allows application developers to attach additional information to
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

* A `type` to categorize the event at a high level; for example, the SDK uses the "message" type to filter events by `Msg`s.
* A list of `attributes` are key-value pairs that give more information about the categorized event. For example, for the "message" type, we can filter events by key-value pairs using `message.action={some_action}`, `message.module={some_module}`, or `message.sender={a_sender}`.

<HighlightBox type=”info”>

To parse the attribute values as strings, make sure to add `'` (single quotes) around each attribute value.

</HighlightBox>

Events, the type, and attributes are defined on a per-module basis in the module's `/types/events.go` file. They are triggered from the module's Protobuf `Msg` service by using the `EventManager`. Additionally, each module documents its events under `spec/xx_events.md`.

Events are returned to the underlying consensus engine in response to the following ABCI messages:

* `BeginBlock`
* `EndBlock`
* `CheckTx`
* `DeliverTx`

Events are managed by an abstraction called the `EventManager`. Let's explore this abstraction further.

## `EventManager`

`Eventmanager` tracks a list of events for the entire execution flow of a transaction or `BeginBlock`/`EndBlock`. `EventManager` implements a simple wrapper around a slice of event objects, that can be emitted from and provides useful methods. The most used method for Cosmos SDK module and application developers is `EmitEvent`.

<HighlightBox type=”info”>

Module developers should handle event emission via the `EventManager#EmitEvent` in each message handler and in each `BeginBlock`/`EndBlock` handler, accessed via the context, where event emission generally follows this pattern:

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

## Subscribing to events

You can use Tendermint's WebSocket to subscribe to events by calling the subscribe RPC method. The main `eventCategories` you can subscribe to are:

* **`NewBlock`:** contains events triggered during `BeginBlock` and `EndBlock`.
* **`Tx`:** contains events triggered during `DeliverTx` (the transaction processing).
* **`ValidatorSetUpdates`:** contains validator set updates for the block.

<HighlightBox type=”info”>

Want to continue exploring events? This is a [full list of event categories](https://godoc.org/github.com/tendermint/tendermint/types#pkg-constants).

</HighlightBox>

You can filter for event types and attribute values. For example, a transfer transaction triggers an event of type `Transfer` and has `Recipient` and `Sender` as attributes, as defined in the `events.go` file of the bank module.

## Long-running exercise

We want to surface some information that is usable for server systems and GUIs:

* Per transaction:
    * The game was created. Both players need to be notified.
    * The player has played. The other player needs to be notified.
    * The game was rejected. The other player needs to be notified.
    * Perhaps the game was won. Both players need to be notified.
* Per block: the games timed out. The game IDs and the involved players need to be notified.

<!-- TODO implement them. -->
