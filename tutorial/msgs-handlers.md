# Msgs and Handlers

Now that you have the `Keeper` setup, it's time to built the `Msgs` and `Handlers` that actually allow users to buy and set names.

## `Msgs`

`Msgs` trigger state transitions. `Msgs` are wrapped in [`Txs`](https://github.com/cosmos/cosmos-sdk/blob/develop/types/tx_msg.go#L34-L38) that clients submit to the network. The Cosmos-SDK wraps and unwraps `Msgs` in and from `Txs`, which means you only have to define `Msgs`. `Msgs` must satisfy the following interface:

```go
// Transactions messages must fulfill the Msg
type Msg interface {
	// Return the message type.
	// Must be alphanumeric or empty.
	Type() string

	// Returns a human-readable string for the message, intended for utilization
	// within tags
	Name() string

	// ValidateBasic does a simple validation check that
	// doesn't require access to any other information.
	ValidateBasic() Error

	// Get the canonical byte representation of the Msg.
	GetSignBytes() []byte

	// Signers returns the addrs of signers that must sign.
	// CONTRACT: All signatures must be present to be valid.
	// CONTRACT: Returns addrs in some deterministic order.
	GetSigners() []AccAddress
}
```

## `Handlers`

`Handlers` define the action that needs to be taken (which stores need to get updated, how, and under what conditions) when a given `Msg` is received.

In this application you have two types of `Msgs` that users can send to interact with the application state: [`SetName`](./set-name.md) and [`BuyName`](./buy-name.md). They will each have an associated `Handler`.

This completes the core logic of your `nameservice`. The next sections will focus on the rest of the core module. After that, focus shifts on building an app using your new module. In most cases, you'll be using similar boilerplate as well.

### Now that you have a better understanding of `Msgs` and `Handlers`, you can start building your first message: [`SetName`](./set-name.md).
