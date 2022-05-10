---
title: "IBC/TAO"
order: 
description: 
tag: deep-dive
---

## Channels

After a connection is established, an application needs to bind to a port and a channel. It is important to understand what a channel is before diving further.

A channel serves as a **conduit for packets** passing between a module on one chain and a module on another one to ensure that packets are executed only once, they are delivered in the order in which they were sent (if necessary), and they are delivered only to the corresponding module owning the other end of the channel on the destination chain. Each channel is associated with a particular connection. A connection may have any number of associated channels, allowing the use of common identifiers and amortizing the cost of header verification across all the channels utilizing a connection and a light client.

Channels are payload agnostic: the modules sending and receiving IBC packets decide how to construct packet data and how to act upon the incoming packet data, and must use their own application logic to determine which state transactions to apply according to what data the packet contains.

An **ordered channel** is _a channel where packets are delivered exactly in the order in which they were sent_. 
An **unordered channel** is _a channel where packets can be delivered in any order_, which may differ from the order in which they were sent.

![Channel Handshake](/academy/ibc/images/channelhandshake.png)

You can see that an IBC channel handshake is smiliar to a connection handshake:

1. `ChanOpenInit`: sets chain A into `INIT` state. This calls `OnChanOpenInit` so application A can apply its `INIT`logic (e.g. check if the port is set correctly). 
2. `ChanOpenTry`: sets chain B into `TRY` state. This calls `OnChanOpenConfirm` so application B can apply its `TRY` logic. 
3. `ChanOpenAck`: sets chain A into `OPEN` state. This calls `OnChanOpenAck` which is implemented by the application.
4. `ChanOpenConfirm`: sets chain B into `OPEN` state, so application B can apply its `CONFIRM` logic. 

If an application returns an error during this process, the handshake will fail.

Note that if you use a channel between two applications, you have to trust that the applications on both ends are not malicious.

You can find the implementation of `ChannelOpenInit` in the [`msg_server.go`](https://github.com/cosmos/ibc-go/blob/main/modules/core/keeper/msg_server.go):

```go
// ChannelOpenInit defines a rpc handler method for MsgChannelOpenInit.
// ChannelOpenInit will perform 04-channel checks, route to the application
// callback, and write an OpenInit channel into state upon successful execution.
func (k Keeper) ChannelOpenInit(goCtx context.Context, msg *channeltypes.MsgChannelOpenInit) (*channeltypes.MsgChannelOpenInitResponse, error) {
  ctx := sdk.UnwrapSDKContext(goCtx)

  // Lookup module by port capability
  module, portCap, err := k.PortKeeper.LookupModuleByPort(ctx, msg.PortId)
  if err != nil {
    return nil, sdkerrors.Wrap(err, "could not retrieve module from port-id")
  }

  ...

  // Perform 04-channel verification
  channelID, cap, err := k.ChannelKeeper.ChanOpenInit(
    ctx, msg.Channel.Ordering, msg.Channel.ConnectionHops, msg.PortId,
    portCap, msg.Channel.Counterparty, msg.Channel.Version,
  )

  ...

  // Perform application logic callback
  if err = cbs.OnChanOpenInit(ctx, msg.Channel.Ordering, msg.Channel.ConnectionHops, msg.PortId, channelID, cap, msg.Channel.Counterparty, msg.Channel.Version); err != nil {
    return nil, sdkerrors.Wrap(err, "channel open init callback failed")
  }

  // Write channel into state
  k.ChannelKeeper.WriteOpenInitChannel(ctx, msg.PortId, channelID, msg.Channel.Ordering, msg.Channel.ConnectionHops, msg.Channel.Counterparty, msg.Channel.Version)

  return &channeltypes.MsgChannelOpenInitResponse{
    ChannelId: channelID,
  }, nil
}
```

After verification of the module capability, the first step of the channel handshake will take place and `ChanOpenInit` will be called as described previously. Note that an application has capabilities for different channels and ports, and can only use a specific channel and port if it owns the capability for them.

<HighlightBox type="info">

IBC is intended to work in execution environments where modules do not necessarily trust each other. IBC must authenticate module actions on ports and channels so that only modules with the appropriate permissions can use those channels. This security is accomplished using dynamic capabilities. Upon binding to a port or creating a channel for a module, IBC returns a dynamic capability that the module must claim to use that port or channel. This binding strategy prevents another module from using that port or channel since it does not own the appropriate capability.

</HighlightBox>

You can see that the application callbacks come from a [router](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/router.go):

```go
// GetRoute returns a IBCModule for a given module.
func (rtr *Router) GetRoute(module string) (IBCModule, bool) {
  if !rtr.HasRoute(module) {
    return nil, false
  }
  return rtr.routes[module], true
}
```

This returns an implementation of the [IBC Module Interface](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go):

```go
// IBCModule defines an interface that implements all the callbacks
// that modules must define as specified in ICS-26
type IBCModule interface {
  // OnChanOpenInit will verify that the relayer-chosen parameters are
  // valid and perform any custom INIT logic.It may return an error if
  // the chosen parameters are invalid in which case the handshake is aborted.
  // OnChanOpenInit should return an error if the provided version is invalid.
  OnChanOpenInit(
    ctx sdk.Context,
    order channeltypes.Order,
    connectionHops []string,
    portID string,
    channelID string,
    channelCap *capabilitytypes.Capability,
    counterparty channeltypes.Counterparty,
    version string,
  ) error

```

Here you find all the callbacks your application will need to implement. For example, in the `msg_serve.go` you find the following in the `ChannelOpenInit`:

```go
  // Perform application logic callback
  if err = cbs.OnChanOpenInit(ctx, msg.Channel.Ordering, msg.Channel.ConnectionHops, msg.PortId, channelID, cap, msg.Channel.Counterparty, msg.Channel.Version); err != nil {
    return nil, sdkerrors.Wrap(err, "channel open init callback failed")
  }
```

This calls the custom logic of the application. The situation is similar for `OnChanOpenTry`, `OnChanOpenAck`, `OnChanOpenConfirm`, and others in the [IBC Module Interface](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go): 

```go
  // OnChanOpenTry will verify the relayer-chosen parameters along with the
  // counterparty-chosen version string and perform custom TRY logic.
  // If the relayer-chosen parameters are invalid, the callback must return
  // an error to abort the handshake. If the counterparty-chosen version is not
  // compatible with this modules supported versions, the callback must return
  // an error to abort the handshake. If the versions are compatible, the try callback
  // must select the final version string and return it to core IBC.
  // OnChanOpenTry may also perform custom initialization logic
  OnChanOpenTry(
    ctx sdk.Context,
    order channeltypes.Order,
    connectionHops []string,
    portID,
    channelID string,
    channelCap *capabilitytypes.Capability,
    counterparty channeltypes.Counterparty,
    counterpartyVersion string,
  ) (version string, err error)

  // OnChanOpenAck will error if the counterparty selected version string
  // is invalid to abort the handshake. It may also perform custom ACK logic.
  OnChanOpenAck(
    ctx sdk.Context,
    portID,
    channelID string,
    counterpartyChannelID string,
    counterpartyVersion string,
  ) error

  // OnChanOpenConfirm will perform custom CONFIRM logic and may error to abort the handshake.
  OnChanOpenConfirm(
    ctx sdk.Context,
    portID,
    channelID string,
  ) error

...
```

Applications will be discussed soon, but the important point here is that an application developer will need to implement the [IBC Module Interface](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go).

Modules communicate with each other by sending packets over IBC channels. Look at the [packet definition](https://github.com/cosmos/ibc-go/blob/main/modules/core/04-channel/types/packet.go) to see the packet structure:

```go
// NewPacket creates a new Packet instance. It panics if the provided
// packet data interface is not registered.
func NewPacket(
  data []byte,
  sequence uint64, sourcePort, sourceChannel,
  destinationPort, destinationChannel string,
  timeoutHeight clienttypes.Height, timeoutTimestamp uint64,
) Packet {
  return Packet{
    Data:               data,
    Sequence:           sequence,
    SourcePort:         sourcePort,
    SourceChannel:      sourceChannel,
    DestinationPort:    destinationPort,
    DestinationChannel: destinationChannel,
    TimeoutHeight:      timeoutHeight,
    TimeoutTimestamp:   timeoutTimestamp,
  }
}
```

`Sequence` will determine if packet delivery is ordered. `TimeoutTimestamp` and `TimeoutHeight` determine the deadline before which the receiving module must process a packet. If the timeout passes without the packet being successfully received, the sending module can timeout the packet and take appropriate actions.

![Packet flow](/academy/ibc/images/packetflow.png)

The previous diagram show successful and unsuccessful packet flows:

1. **Successful:** Application A sends a packet (call `sendPacket`) to application B. This can be triggerd by a user, but applications can also act without a user. Core IBC A commits the packet to its own state, and the relayer can query this packet and send a receive message to Core IBC B. Verifications are done by Core IBC B and application B gets the packet if it is valid. Note that the applications on both ends need to marshal and unmarshal the data. Application B then sends an acknowledgment message to Core IBC B, which again commits it to its own state so it can be sent by a relayer to Core IBC A.
2. **Unsuccessful:** In second scenario, the packet is not received in time. In this case, Core IBC A receives a `TimeoutPacket` message from the relayer and calls `OnTimeoutPacket` on application A.
