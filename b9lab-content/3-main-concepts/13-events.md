# Events

# Events
An event is an object that contains information about the execution of the application. Events are used by service providers (block explorers, wallets) to track execution of various messages and index transactions.

In Cosmo SDK, events are implemented as an alias of ABCI `event` type in the forms `{eventType}.{attributeKey}={attributeValue}`.

Events allow app devs to attach additional information. This means that transactions might be queried using the events:

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

* A `type` to categorize the Event at a high-level; for example, the SDK uses the "message" type to filter Events by Msgs.
* A list of `attributes` are key-value pairs that give more information about the categorized Event. For example, for the "message" type, we can filter Events by key-value pairs using `message.action={some_action}, message.module={some_module}` or `message.sender={a_sender}`.

<HighlightBox type=”info”>
To parse the attribute values as strings, make sure to add ' (single quotes) around each attribute value
</HighlightBox>

Events, the type and attributes are defined on a per-module basis in the module's `/types/events.go` file, and are triggered from the module's Protobuf Msg service by using the EventManager. Additionally, each module documents its Events under `spec/xx_events.md`.
Events are returned to the underlying consensus engine in response to the following ABCI messages:

* BeginBlock
* EndBlock
* CheckTx
* DeliverTx

Events are managed by an abstraction called the `EventManager`.

## EventManager

Eventmanager tracks a list of Events for the entire execution flow of a transaction or BeginBlock/EndBlock. EventManager implements a simple wrapper around a slice of Event objects that can be emitted from and provides useful methods. The most used method for Cosmos SDK module and application developers is `EmitEvent`.

<HighlightBox type=”info”>
Module developers should handle Event emission via the EventManager#EmitEvent in each message Handler and in each BeginBlock/EndBlock handler, accessed via the Context, where Event emission generally follows this pattern: 

```
func (em *EventManager) EmitEvent(event Event) {
    em.events = em.events.AppendEvent(event)
}
```

Each module's handler function should also set a new EventManager to the context to isolate emitted Events per message:

```
func NewHandler(keeper Keeper) sdk.Handler {
    return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
        ctx = ctx.WithEventManager(sdk.NewEventManager())
        switch msg := msg.(type) {
    // event types
```
</HighlightBox>


## Subscribing to Events

You can use Tendermint's Websocket (opens new window) to subscribe to Events by calling the subscribe RPC method.

The main eventCategories you can subscribe to are:

* **NewBlock**: Contains Events triggered during BeginBlock and EndBlock.
* **Tx**: Contains Events triggered during DeliverTx (i.e. transaction processing).
* **ValidatorSetUpdates**: Contains validator set updates for the block.

<HighlightBox type=”info”>
→ full list of event categories at: https://godoc.org/github.com/tendermint/tendermint/types#pkg-constants
</HighlightBox>

You can filter for event types and attribute values.For example, a transfer transaction triggers an Event of type Transfer and has Recipient and Sender as attributes (as defined in the events.go file of the bank module

## Long-running exercise

We want to surface some information that is usable for server systems and GUIs:

* Per transaction:
    * The game was created. Both players need to be notified.
    * The player has played. The other player needs to be notified.
    * The game was rejected. The other player needs to be notified.
    * Perhaps the game was won. Both players need to be notified.
* Per block:
    * These games timed out. The game ids and the involved players need to be notified.

TODO implement them.
