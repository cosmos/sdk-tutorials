---
order: 5
---

# Create Order Pairs

## Order book indexes

We defined the order books as indexed types in the store but we didn't define what is this index

```go
// types/keys.go
import "fmt"

//...

func OrderBookIndex(
	portID string,
	channelID string,
	sourceDenom string,
	targetDenom string,
) string {
	return fmt.Sprintf("%s-%s-%s-%s",
		portID,
		channelID,
		sourceDenom,
		targetDenom,
	)
}

```

## Pre-transmit

Check the pair doesn't exist

```go
// keeper/msg_server_createPair.go
import "errors"

//...

func (k msgServer) SendCreatePair(goCtx context.Context, msg *types.MsgSendCreatePair) (*types.MsgSendCreatePairResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	// Cannot create the pair if it already exists
	pairIndex := types.OrderBookIndex(msg.Port, msg.ChannelID, msg.SourceDenom, msg.TargetDenom)
	_, found := k.GetSellOrderBook(ctx, pairIndex)
	if found {
		return &types.MsgSendCreatePairResponse{}, errors.New("the pair already exist")
	}

	// ...
}
```

## Onrecv

Create the buy order book

```go
// keeper/createPair.go
func (k Keeper) OnRecvCreatePairPacket(ctx sdk.Context, packet channeltypes.Packet, data types.CreatePairPacketData) (packetAck types.CreatePairPacketAck, err error) {
	// validate packet data upon receiving
	if err := data.ValidateBasic(); err != nil {
		return packetAck, err
	}

	// Check if the buy order book exists
	pairIndex := types.OrderBookIndex(packet.SourcePort, packet.SourceChannel, data.SourceDenom, data.TargetDenom)
	_, found := k.GetBuyOrderBook(ctx, pairIndex)
	if found {
		return packetAck, errors.New("the pair already exist")
	}

	// Set the buy order book
	book := types.NewBuyOrderBook(data.SourceDenom, data.TargetDenom)
	book.Index = pairIndex
	k.SetBuyOrderBook(ctx, book)

	return packetAck, nil
}
```

## onack

Create the sell order book

```go
// keeper/createPair.go
func (k Keeper) OnAcknowledgementCreatePairPacket(ctx sdk.Context, packet channeltypes.Packet, data types.CreatePairPacketData, ack channeltypes.Acknowledgement) error {
	switch dispatchedAck := ack.Response.(type) {
	case *channeltypes.Acknowledgement_Error:
		return nil
	case *channeltypes.Acknowledgement_Result:
		// Decode the packet acknowledgment
		var packetAck types.CreatePairPacketAck
		err := packetAck.Unmarshal(dispatchedAck.Result)
		if err != nil {
			// The counter-party module doesn't implement the correct acknowledgment format
			return errors.New("cannot unmarshal acknowledgment")
		}

		// Set the sell order book
		pairIndex := types.OrderBookIndex(packet.SourcePort, packet.SourceChannel, data.SourceDenom, data.TargetDenom)
		book := types.NewSellOrderBook(data.SourceDenom, data.TargetDenom)
		book.Index = pairIndex
		k.SetSellOrderBook(ctx, book)

		return nil
	default:
		// The counter-party module doesn't implement the correct acknowledgment format
		return errors.New("invalid acknowledgment format")
	}
}
```

## ontimeout

A timeout will have no consequences.