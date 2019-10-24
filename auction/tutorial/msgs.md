---
order: 5
---

# Messages Exercise

Messages are used to write to your applications state. This is similar to actions in react/redux or vue/vuex. They are wrapped in transactions that can be sent to the network. The Cosmos SDK wraps and unwraps `Msgs` from `Txs`, which means, as an app developer, you only have to define `Msgs`. `Msgs` must satisfy the following interface (we'll implement all of these in the next section):

```go
// Transactions messages must fulfill the Msg
type Msg interface {
	// Return the message type.
	// Must be alphanumeric or empty.
	Type() string

	// Returns a human-readable string for the message, intended for utilization
	// within tags
	Route() string

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

In this exercise you will be defining two message types

1.  Type `MsgCreateAuction` which takes an nftID and nftDenom (type string), owner (type AccAddress), endtime (type time.Duration).

    - You will notice we are not receiving a startTime in this message, that is because we will use use block time of which comes in when the auction is created.

2.  Type `MsgBid` which takes a bidder (type AccAddress), bid (type Coins), and a nftID (type string).

To implement the above interface, each type must have the interface's methods. Below you can see an example:

```go
// Route Implements Msg.
func (msg MsgCreateAuction) Route() string { return RouterKey } // this will be implmented in the next section, no need to worry

// Type Implements Msg.
func (msg MsgCreateAuction) Type() string { return "<msg_type>" }

// ValidateBasic Implements Msg.
func (msg MsgCreateAuction) ValidateBasic() sdk.Error {
  // A sanity check to make sure that when the message is called it adheres to the type
 	return nil
}

// GetSignBytes Implements Msg.
func (msg MsgCreateAuction) GetSignBytes() []byte {
	return sdk.MustSortJSON(ModuleCdc.MustMarshalJSON(msg))
}

// GetSigners Implements Msg.
func (msg MsgCreateAuction) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{msg.Owner}
}
```

### The next page will consist of the answer.
