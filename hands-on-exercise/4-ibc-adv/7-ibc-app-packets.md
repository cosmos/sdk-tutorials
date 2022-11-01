---
title: "Adding Packet and Acknowledgment Data"
order: 7
description: 
tags: 
  - guided-coding
  - dev-ops
  - ibc
---

# Adding Packet and Acknowledgment Data

This section demonstrates how to define packets and acks (acknowledgments) for the leaderboard blockchain. Remember that this blockchain will mostly be receiving packets from the checkers blockchain or other gaming chains. This will be handled in the checkers blockchain extension tutorial. In this section, you will add an additional packet definition that will enable the Leaderboard chain to send a packet to connected game chains when a player has entered the top of the rankings.

The documentation on how to define packets and acks in the Inter-Blockchain Communication Protocol (IBC) can be found in [the ibc-go docs](https://ibc.cosmos.network/main/ibc/apps/packets_acks.html).

## Scaffold a packet with Ignite CLI

You are now going to scaffold the IBC packet data with Ignite CLI, and compare it once more with _git diff_:

```bash
$ ignite scaffold packet ibcTopRank playerId rank:uint score:uint --ack playerId --module leaderboard
```

<HighlightBox type="note">

The packet is called `ibcTopRank`, which includes the fields `playerId`, `rank`, and `score`. Additionally, you send back the `playerId` of the player who entered the top of the rankings through the `Acknowledgement`.

</HighlightBox>

The output on the terminal gives an overview of the changes made:

```bash
modify proto/leaderboard/packet.proto
modify proto/leaderboard/tx.proto
modify x/leaderboard/client/cli/tx.go
create x/leaderboard/client/cli/tx_ibc_top_rank.go
modify x/leaderboard/handler.go
create x/leaderboard/keeper/ibc_top_rank.go
create x/leaderboard/keeper/msg_server_ibc_top_rank.go
modify x/leaderboard/module_ibc.go
modify x/leaderboard/types/codec.go
modify x/leaderboard/types/events_ibc.go
create x/leaderboard/types/messages_ibc_top_rank.go
create x/leaderboard/types/messages_ibc_top_rank_test.go
create x/leaderboard/types/packet_ibc_top_rank.go

🎉 Created a packet `ibcTopRank`.
```

In the next paragraphs, you will investigate each of the most important additions to the code.

## Proto definitions

The first additions are to the proto definitions in the `packet.proto` and `tx.proto` files:

```diff
@@ message LeaderboardPacketData in proto/leaderboard/packet.proto {
    oneof packet {
        NoData noData = 1;
        // this line is used by starport scaffolding # ibc/packet/proto/field
+		IbcTopRankPacketData ibcTopRankPacket = 2;
        // this line is used by starport scaffolding # ibc/packet/proto/field/number
    }
}
```

One addition is `IbcTopRankPacketData`:

```protobuf
// IbcTopRankPacketData defines a struct for the packet payload
message IbcTopRankPacketData {
  string playerId = 1;
  uint64 rank = 2;
  uint64 score = 3;
}
```

The next addition is the ack:

```protobuf
// IbcTopRankPacketAck defines a struct for the packet acknowledgment
message IbcTopRankPacketAck {
	  string playerId = 1;
}
```

And in `tx.proto` a Message service is added:

```diff
// Msg defines the Msg service.
service Msg {
+   rpc SendIbcTopRank(MsgSendIbcTopRank) returns (MsgSendIbcTopRankResponse);
    // this line is used by starport scaffolding # proto/tx/rpc
}
```

Where:

```protobuf
message MsgSendIbcTopRank {
  string creator = 1;
  string port = 2;
  string channelID = 3;
  uint64 timeoutTimestamp = 4;
  string playerId = 5;
  uint64 rank = 6;
  uint64 score = 7;
}

message MsgSendIbcTopRankResponse {
}
```

<HighlightBox type="info">

The proto message `MsgSendIbcTopRank` includes the field `timeoutTimestamp`, which is added by Ignite CLI when scaffolding an IBC packet. This is an IBC channel parameter that is important in IBC and Ignite CLI abstracts this away, removing the need for the user to add this manually.

</HighlightBox>

<HighlightBox type="note">

The proto definitions will be compiled into `types/packet.pb.go` and `types/tx.pb.go`.

</HighlightBox>

## CLI commands

Ignite CLI also creates CLI commands to send packets and adds them to the `client/cli/` folder.

Packets can be sent from the CLI with the following command:

```bash
$ leaderboardd tx leaderboard send-ibc-top-rank [portID] [channelID] [playerId] [rank] [score]
```

## `SendPacket` and packet callback logic

When scaffolding an IBC module with Ignite CLI, you already saw the implementation of the `IBCModule` interface, including a bare-bones packet callbacks structure. Now that you've also scaffolded a packet (and ack), the callbacks have been added with logic to handle the receive, ack, and timeout scenarios.

Additionally, for the sending of a packet, a message server has been added that handles a SendPacket message, in this case `MsgSendIbcTopRank`.

<HighlightBox type="tip">

IBC allows some freedom to the developers regarding how to implement the custom logic, decoding and encoding packets, and processing acks. The provided structure is but one example of how to tackle this. Therefore, it makes sense to focus on the general flow to handle user messages or IBC callbacks rather than the specific implementation by Ignite CLI.

</HighlightBox>

### Sending packets

To handle a user submitting a message to send an IBC packet, a message server is added to the handler:

```diff
    @@ x/leaderboard/handler.go
    func NewHandler(k keeper.Keeper) sdk.Handler {
+        msgServer := keeper.NewMsgServerImpl(k)

        return func(ctx sdk.Context, msg sdk.Msg) (*sdk.Result, error) {
            ctx = ctx.WithEventManager(sdk.NewEventManager())

            switch msg := msg.(type) {
+           case *types.MsgSendIbcTopRank:
+               res, err := msgServer.SendIbcTopRank(sdk.WrapSDKContext(ctx), msg)
+               return sdk.WrapServiceResult(ctx, res, err)
                // this line is used by starport scaffolding # 1
            default:
                errMsg := fmt.Sprintf("unrecognized %s message type: %T", types.ModuleName, msg)
                return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, errMsg)
            }
        }
    }
```

It calls the `SendIbcTopRank` method on the message server, defined as:

```go
// x/leaderboard/keeper/msg_server_ibc_top_rank.go but up to dev
func (k msgServer) SendIbcTopRank(goCtx context.Context, msg *types.MsgSendIbcTopRank) (*types.MsgSendIbcTopRankResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	// TODO: logic before transmitting the packet

	// Construct the packet
	var packet types.IbcTopRankPacketData

	packet.PlayerId = msg.PlayerId
	packet.Rank = msg.Rank
	packet.Score = msg.Score

	// Transmit the packet
	err := k.TransmitIbcTopRankPacket(
		ctx,
		packet,
		msg.Port,
		msg.ChannelID,
		clienttypes.ZeroHeight(),
		msg.TimeoutTimestamp,
	)
	if err != nil {
		return nil, err
	}

	return &types.MsgSendIbcTopRankResponse{}, nil
}
```

This in turn calls the `TransmitIbcTopRankPacket` method on the module's keeper, defined in `x/leaderboard/keeper/ibc_top_rank.go`. This method gets all of the required metadata from core IBC before sending the packet using the ChannelKeeper's `SendPacket` function:

```go
func (k Keeper) TransmitIbcTopRankPacket(
	ctx sdk.Context,
	packetData types.IbcTopRankPacketData,
	sourcePort,
	sourceChannel string,
	timeoutHeight clienttypes.Height,
	timeoutTimestamp uint64,
) error {

	sourceChannelEnd, found := k.ChannelKeeper.GetChannel(ctx, sourcePort, sourceChannel)
	... // error validation

	destinationPort := sourceChannelEnd.GetCounterparty().GetPortID()
	destinationChannel := sourceChannelEnd.GetCounterparty().GetChannelID()

	// get the next sequence
	sequence, found := k.ChannelKeeper.GetNextSequenceSend(ctx, sourcePort, sourceChannel)
	... // error validation

	channelCap, ok := k.ScopedKeeper.GetCapability(ctx, host.ChannelCapabilityPath(sourcePort, sourceChannel))
	... // error validation

	packetBytes, err := packetData.GetBytes()
	... // error validation

	packet := channeltypes.NewPacket(
		packetBytes,
		sequence,
		sourcePort,
		sourceChannel,
		destinationPort,
		destinationChannel,
		timeoutHeight,
		timeoutTimestamp,
	)

	if err := k.ChannelKeeper.SendPacket(ctx, channelCap, packet); err != nil {
		return err
	}

	return nil
}
```

<HighlightBox type="note">

When you want to add additional custom logic before transmitting the packet, you do this in the `SendIbcTopRank` method on the message server.

</HighlightBox>

### Receiving packets

In a previous section you examined the `OnRecvPacket` callback in the `x/leaderboard/module_ibc.go` file. There, Ignite CLI had set up a structure to dispatch the packet depending on packet type through a switch statement. Now by adding the `IbcTopRank` packet, a case has been added:

```go
// @ switch packet := modulePacketData.Packet.(type) in OnRecvPacket
case *types.LeaderboardPacketData_IbcTopRankPacket:
	packetAck, err := am.keeper.OnRecvIbcTopRankPacket(ctx, modulePacket, *packet.IbcTopRankPacket)
	if err != nil {
		ack = channeltypes.NewErrorAcknowledgement(err.Error())
	} else {
		// Encode packet acknowledgment
		packetAckBytes, err := types.ModuleCdc.MarshalJSON(&packetAck)
		if err != nil {
			return channeltypes.NewErrorAcknowledgement(sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error()).Error())
		}
		ack = channeltypes.NewResultAcknowledgement(sdk.MustSortJSON(packetAckBytes))
	}
	ctx.EventManager().EmitEvent(
		sdk.NewEvent(
			types.EventTypeIbcTopRankPacket,
			sdk.NewAttribute(sdk.AttributeKeyModule, types.ModuleName),
			sdk.NewAttribute(types.AttributeKeyAckSuccess, fmt.Sprintf("%t", err != nil)),
		),
	)
```

The first line of code in the case statement calls the application's `OnRecvIbcTopRankPacket` callback on the keeper to process the reception of the packet:

```go
// OnRecvIbcTopRankPacket processes packet reception
func (k Keeper) OnRecvIbcTopRankPacket(ctx sdk.Context, packet channeltypes.Packet, data types.IbcTopRankPacketData) (packetAck types.IbcTopRankPacketAck, err error) {
	// validate packet data upon receiving
	if err := data.ValidateBasic(); err != nil {
		return packetAck, err
	}

	// TODO: packet reception logic

	return packetAck, nil
}
```

<HighlightBox type="note">

Remember that the `OnRecvPacket` callback writes an acknowledgment as well (this course covers the synchronous write ack case).

</HighlightBox>

### Acknowledging packets

Similarly to the `OnRecvPacket` case before, Ignite CLI has already prepared the structure of the `OnAcknowledgementPacket` with the switch statement. Again, scaffolding the packet adds a case to the switch:

```go
// @ switch packet := modulePacketData.Packet.(type) in OnAcknowledgmentPacket
case *types.LeaderboardPacketData_IbcTopRankPacket:
	err := am.keeper.OnAcknowledgementIbcTopRankPacket(ctx, modulePacket, *packet.IbcTopRankPacket, ack)
	if err != nil {
		return err
	}
	eventType = types.EventTypeIbcTopRankPacket
```

This calls into the newly created application keeper's ack packet callback:

```go
func (k Keeper) OnAcknowledgementIbcTopRankPacket(ctx sdk.Context, packet channeltypes.Packet, data types.IbcTopRankPacketData, ack channeltypes.Acknowledgement) error {
	switch dispatchedAck := ack.Response.(type) {
	case *channeltypes.Acknowledgement_Error:

		// TODO: failed acknowledgment logic
		_ = dispatchedAck.Error

		return nil
	case *channeltypes.Acknowledgement_Result:
		// Decode the packet acknowledgment
		var packetAck types.IbcTopRankPacketAck

		if err := types.ModuleCdc.UnmarshalJSON(dispatchedAck.Result, &packetAck); err != nil {
			// The counter-party module doesn't implement the correct acknowledgment format
			return errors.New("cannot unmarshal acknowledgment")
		}

		// TODO: successful acknowledgment logic

		return nil
	default:
		// The counter-party module doesn't implement the correct acknowledgment format
		return errors.New("invalid acknowledgment format")
	}
}
```

This allows us to add custom application logic for both failed and successful acks.

### Timing out packets

Timing out the packets follows the same flow, adding a case to the switch statement in `OnTimeoutPacket`, calling into the keeper's timeout packet callback where the custom logic can be implemented. It is left to the reader to investigate this independently.

### Extra details

Next to the above, some additions have also been made to the `types` package. These include `codec.go`, `events_ibc.go`, and `messages_ibc_top_rank.go`.

Again, the reader is invited to check these out independently.

<HighlightBox type="info">

Events in IBC are important because relayers process events to check if there are packets (or acknowledgments) to relay.
<br/><br/>
Ignite CLI has scaffolded some events in `x/leaderboard/types/events_ibc.go` for timeout and the `ibcTopRank` packet which you have defined:

```go
package types

// IBC events
const (
	EventTypeTimeout          = "timeout"
	EventTypeIbcTopRankPacket = "ibcTopRank_packet"
	// this line is used by starport scaffolding # ibc/packet/event

	AttributeKeyAckSuccess = "success"
	AttributeKeyAck        = "acknowledgement"
	AttributeKeyAckError   = "error"
)
```

Here are found both the `Event` type and the attributes it contains.
<br/><br/>
These are not the only relevant events for IBC, though, the others can be found in the core IBC source code:

* [Client events](https://github.com/cosmos/ibc-go/blob/main/modules/core/02-client/types/events.go)
* [Connection events](https://github.com/cosmos/ibc-go/blob/main/modules/core/03-connection/types/events.go)
* [Channel events](https://github.com/cosmos/ibc-go/blob/main/modules/core/04-channel/types/events.go)

You can go back to the code examined so far to take note of the events emitted.

</HighlightBox>

## Summary

<HighlightBox type="synopsis">

To summarize, this section has explored:

* Scaffolding a chain with an IBC-enabled module, with both chain and module called leaderboard.
* How Ignite CLI made sure to implement the `IBCModule` interface, including channel handshake and packet callbacks.
* How Ignite CLI has bound our IBC module to a port and added a route to the IBC router.
* Scaffolding an IBC packet, `IbcTopRankPacket`.
* How Ignite CLI defined the packet and ack data.
* How Ignite CLI sets up the basic message handling and packet handling to send, receive, acknowledge, and timeout packets.

</HighlightBox>

<HighlightBox type="note">

Even though the ability to send and receive packets is now enabled, no application logic to execute has yet been implemented. This is outside the scope of this section. The reader is invited to follow the checkers blockchain extension tutorial [insert link].

</HighlightBox>

<HighlightBox type="note">

When scaffolding a packet, Ignite CLI will ensure the chain can act both as the sender or receiver of a packet by default. This is a symmetrical setup which makes sense for some applications, like ICS20.
<br/><br/>
However, it's also possible to have an asymmetrical setup where one chain will always be the source _or_ destination chain for a given packet, not both. In this case, the message server and packet callbacks can be updated to error when, for example, a chain receives a packet though it is supposed to exclusively be the destination chain. Interchain Accounts or ICS27 is an example of this asymmetrical situation, as is the checkers extension tutorial.

</HighlightBox>
