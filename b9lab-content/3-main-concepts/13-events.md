# Events

An event is an object that contains information about the execution of the application. Events are used by service providers (block explorers, wallets, and IBC relayers) to track execution of various messages and index transactions.

In the Cosmos SDK, events are implemented as an alias of the ABCI `event` type in the forms `{eventType}.{attributeKey}={attributeValue}`.

Events are objects that allow app developers to package important information about state transitions in an application. Instead of querying, events can be subscribed to using [websockets](https://docs.tendermint.com/master/tendermint-core/subscription.html#subscribing-to-events-via-websocket).

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

In the above, two elements stand out:

* A `type` to categorize the event at a high-level. For example, the Cosmos SDK uses the `message` _type_ to filter events by `Msg`.
* A list of `attributes` are key-value pairs that give more information about the categorized event. For example, for the `message` type, we can filter events by key-value pairs using `message.action={some_action}, message.module={some_module}` or `message.sender={a_sender}`.

<HighlightBox type=”info”>

To parse the attribute values as strings, make sure to add `'` (single quotes) around each attribute value.

</HighlightBox>

Events, their type and attributes are defined on a per-module basis in the module's `/types/events.go` file, and are triggered from the module's Protobuf `Msg` service by using the `EventManager`. Additionally, each module documents its events under `spec/xx_events.md`.
Events are returned to the underlying consensus engine in response to the following ABCI messages:

* `BeginBlock`
* `EndBlock`
* `CheckTx`
* `DeliverTx`

Events are managed by an abstraction called the `EventManager`.

## EventManager

For each of the 4 ABCI calls, `CheckTx`, `DeliverTx`, `BeginBlock` and `EndBlock`, the `EventManager` keeps a list of events and delivers it in full as part of the ABCI response. After delivery in an ABCI response, the `EventManager` empties its list of events. In practice, the `EventManager` implements a simple wrapper around a slice of `Event` objects that can be emitted from and provides useful methods. The most often used method for Cosmos SDK module and application developers is `EmitEvent`.

<HighlightBox type=”info”>

Module developers should handle event emission via the `EventManager#EmitEvent` in each message handler and in each `BeginBlock` or `EndBlock` handler, accessed via the `Context`, where event emission generally follows this pattern:

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

</HighlightBox>

## Subscribing to Events

You can use Tendermint's Websocket to subscribe to events by calling the subscribe RPC method.

The main `eventCategories` you can subscribe to are:

* **NewBlock**: Contains Events triggered during `BeginBlock` and `EndBlock`.
* **Tx**: Contains events triggered during `DeliverTx` (i.e. transaction processing).
* **ValidatorSetUpdates**: Contains updates about the set of validators for the block.

<HighlightBox type=”info”>

→ You can find a full list of event categories [here](https://godoc.org/github.com/tendermint/tendermint/types#pkg-constants).

</HighlightBox>

You can filter for event types and attribute values. For example, a transfer transaction triggers an event of type `Transfer` and has `Recipient` and `Sender` as attributes, as defined in the `events.go` file of the bank module.

## Next Up

You just learned about events, where they are expected, and how to emit or receive them. Have a look at the code samples below or head next to learn about the `Context` object in the [next section](./14-context).

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
