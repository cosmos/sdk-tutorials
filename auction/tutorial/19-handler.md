---
order: 19
---

# Handler Exercise

The handler calls different business logic oriented functions based on the the different types of messages.

To begin, create a `handler.go` file in the root of your module.

The design is similar to the [Querier](./14-querier.md).

```go
func NewHandler(keeper Keeper) types.Handler {
	return func(ctx types.Context, msg types.Msg) types.Result {
		switch msg := msg.(type) {
		default:
			errMsg := fmt.Sprintf("unrecognized nft message type: %T", msg)
			return types.ErrUnknownRequest(errMsg).Result()
		}
	}
}
```

You can fill in the cases once we have the necessary functions.

Lets start by creating a function to handle our Msg to create auctions.

```go
func handleMsgCreateAuction(ctx types.Context, k Keeper, msg MsgCreateAuction) types.Result {
  // get the nft the user would like to open the auction for.

  // check if the owner of the auction is the same as the one from the nft

  // Get the start time from `ctx.BlockHeader().Time
  // Add the duration to the starttime.

  // Create the auction

  return types.Result{}
}
```

Before we move on from this function I would like to have some event added to make querying easier.
We defined many of the event types in the [events.go section](./07-more-types.md)
We do this by:

```go
	ctx.EventManager().EmitEvents(types.Events{
		types.NewEvent(
      EventTypeCreateAuction, // the event type
      types.NewAttribute({key/Attribute}, {value}), // the key & value of the attribute
		),
		types.NewEvent(
			types.EventTypeMessage, // What type of event it is
			types.NewAttribute(types.AttributeKeyModule, AttributeValueCategory), // the value here is the module name
			types.NewAttribute(types.AttributeKeySender, {value}),
		),
  })
```

The addition of the event will be added to the return of the function

```go
	return types.Result{
		Events: ctx.EventManager().Events(),
	}
```

Next we want to create a msg for placing bids.

```go
func handleMsgBid(ctx types.Context, k Keeper, msg MsgBid) types.Result {
	// get the auction

	// check that endtime is not over

	// check that the new bid is greater than the current bid

	// place the bid

	ctx.EventManager().EmitEvents(types.Events{
		types.NewEvent(
      // add some events
		),
		types.NewEvent(
			types.EventTypeMessage,
			types.NewAttribute(types.AttributeKeyModule, AttributeValueCategory),
			types.NewAttribute(types.AttributeKeySender, msg.Bidder.String()),
		),
	})

	return types.Result{
		Events: ctx.EventManager().Events(),
	}
}
```

### The next page will consist of the answer.
