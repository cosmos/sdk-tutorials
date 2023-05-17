---
title: "IBC/TAO - Channels"
order: 4
description: The role of channels in IBC
tags:
  - concepts
  - ibc
  - dev-ops
---

## Transport, Authentication, and Ordering Layer - Channels

<HighlightBox type="learning">

In this section, you will:

* Establish a channel.
* Learn about the application packet flow.

</HighlightBox>

Connections and clients comprise the main components of the transport layer in IBC. However, application to application communication in IBC is conducted over **channels**, which route between an application module such as the module which handles Interchain Standard (ICS) 20 token transfers on one chain, and the corresponding application module on another one. These applications are namespaced by **port identifiers** such as 'transfer' for ICS-20 token transfers.

<HighlightBox type="note">

Note that it is possible to have either a _symmetric_ case, where the application logic is independent of the direction of the packet being sent, or an _asymmetric_ case, where packets should only be sent in one direction (or the logic can be different depending on the send direction). It makes sense (but is not imposed) to use the same port ID on both application modules in the symmetric case, and different port IDs on either chain in the asymmetric.
<br/><br/>
For example, in the case of interchain accounts, there are two different port IDs for the host and controller submodules: in the interchain accounts module, `icahost` is the default port ID that the host submodule binds to, whereas `icacontroller-...` is the default port prefix that the controller submodule binds to.

</HighlightBox>

Contrary to the core IBC transport layer logic, which handles only verification, ordering, and all around basic packet correctness, the application layer over channels handles only the application-specific logic which interprets the packets that have been sent over the transport layer. This concern separation between transport and application layer in IBC is similar to the concern separation between CometBFT's consensus layer (consensus, mempool, ordering of transactions) and ABCI layer (process of those transaction bytes).

<HighlightBox type="remember">

A connection may have any number of associated channels. However, each channel is associated with only one connection ID, which indicates which light client it is secured by, and one port ID which indicates the application that it is connected to.

</HighlightBox>

As mentioned above, channels are payload agnostic. The application modules sending and receiving IBC packets decide how to interpret and act upon the incoming packet data, and use their own application logic and handlers to determine which state transitions to apply according to the data contained in each received packet.

<HighlightBox type="info">

Remember the abbreviation _IBC/TAO_ where the _O_ represents _Ordering_. There are currently two different types of channels in terms of ordering:

* An **ordered channel** is _a channel where packets are delivered exactly in the order in which they were sent_.
* An **unordered channel** is _a channel where packets can be delivered in any order_, which may differ from the order in which they were sent.

</HighlightBox>

## Establishing a channel

Similarly to how connections are established, **channels are established through a four-way handshake**, in which each step is initiated by a relayer:

![Channel Handshake](/academy/3-ibc/images/channelhandshake.png)

1. `ChanOpenInit`: will set the chain A into `INIT` state. This will call `OnChanOpenInit` so application A can apply the custom callback that it has set on `INIT`, e.g. check if the port has been set correctly, the channel is indeed unordered/ordered as expected, etc. An application version is also proposed in this step.
2. `ChanOpenTry`: will set chain B into `TRY` state. It will call `OnChanOpenTry` so application B can apply its custom `TRY` callback. Application version negotiation also happens during this step.
3. `ChanOpenAck`: will set the chain A into `OPEN` state. This will call `OnChanOpenAck` which will be implemented by the application. Application version negotiation is finalised during this step.
4. `ChanOpenConfirm`: will set chain B into `OPEN` state so application B can apply its `CONFIRM` logic.

<HighlightBox type="note">

"Crossing hellos" refers to a situation when both chains attempt the same handshake step at the same time.
<br/><br/>
Crossing hellos have been removed from ibc-go v4 onward, as referenced in [this PR](https://github.com/cosmos/ibc-go/pull/1317). The `PreviousChannelId` in `MsgChannelOpenTry` has been deprecated.

</HighlightBox>

Similarly, there are also [callbacks for the closing of channels](https://github.com/cosmos/ibc/tree/main/spec/core/ics-004-channel-and-packet-semantics#closing-handshake). However, it is up to the application developers to decide if it makes sense for users to be able to trigger the closing of a channel. For token transfers for example, this is not desirable due to the risk of locking liquidity on a closed channel, hence that is [why this feature has been disallowed in the canonical `transfer` module](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/apps/transfer/ibc_module.go#L151).

## Example code: `ChannelOpenInit`

You can find the implementation of `ChannelOpenInit` in core IBC's [`msg_server.go`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/keeper/msg_server.go#L166)

The important part to note in this code snippet is that an application module has capabilities for the requested port. Therefore, an application module can only use a channel and port if the application owns the capability for that port and the module which attempting to open a channel is the module we have granted capabilities to in `app.go`:

<!-- TODO: add more content on capabilites based on Colin's deep dive https://github.com/cosmos/sdk-tutorials/issues/1277-->

```go [https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/keeper/msg_server.go#L166]
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

<HighlightBox type="info">

### Capabilities

IBC is intended to work in execution environments where modules do not necessarily trust each other. This security is accomplished using a [dynamic capability store](https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-003-dynamic-capability-store.md). This binding strategy prevents other modules from using the particular port or channel since those modules do not own the appropriate capability.
<br/><br/>
While this background information is useful, IBC application developers should not need to modify this lower level abstraction, other than setting the capabilities appropriately in `app.go`.

</HighlightBox>

## Application packet flow

As stated previously, application modules communicate with each other by sending packets over IBC channels. However, IBC modules do not directly pass these messages to each other over the network. Rather, the module will commit some state reflecting the transaction execution to a precisely defined path reserved for a specific message type and a specific counterparty. For example, as part of an ICS-20 token transfer, the bank module would escrow the portion of tokens to be transferred and store the proof of this escrow.

A relayer will monitor channels for events emitted when updates have been submitted to these paths, and (after first submitting a `MsgUpdateClient` to update the sending chain light client on the destination chain) relay the message containing the packet data along with a proof that the state transition contained in the message has been commited to the state of the sending chain. The destination chain then verifies this packet and packet commitmentment proof against the state contained in the light client.

Take a look at the [packet definition](https://github.com/cosmos/ibc/tree/main/spec/core/ics-004-channel-and-packet-semantics#definitions) to see the packet structure:

```typescript
interface Packet {
  sequence: uint64
  timeoutHeight: Height
  timeoutTimestamp: uint64
  sourcePort: Identifier
  sourceChannel: Identifier
  destPort: Identifier
  destChannel: Identifier
  data: bytes
}
```

`Sequence` denotes the sequence number of the packet in the channel.

`TimeoutTimestamp` and `TimeoutHeight` (pick one of these) dictate the time before which the receiving module must process a packet.

The diagram below shows the application packet flow for the success case (top) and unsuccessful or timeout case (bottom). Both cases will be discussed in more detail in the next paragraphs.

![Packet flow](/academy/3-ibc/images/packetflow.png)

## Success case

In the first step of a successful packet flow, application A will send a packet (call `sendPacket`) to application B. `SendPacket` can be triggered by a user, but applications can also trigger this as the result of some other application logic.

Core IBC A will commit the packet to its own state and the relayer can query this packet and send a `RecvPacket` message to core IBC B. Core IBC handles a number of verifications, including verifying that the packet was indeed sent by chain A, that the packet came in the correct order if it was sent over an ordered channel, that the state commitment proof is valid, etc. If this verification step is successful, core IBC will then route the packet to application B.

Note that core IBC is unopinionated about the actual content of the packet data, as this data is at this point just bytes. It is the responsibility of the applications on either end to marshal and unmarshal the data from and to the expected data structures on either side. This is also why application version negotiation as discussed previously in the channel handshakes is important, as different versions of an application may result in different expected data structures on either end of the channel and application.

After receiving the packet data from core IBC, application B will then marshal the data blob into the expected structure and apply the relevant application logic. In the case of an ICS-20 token transfer, for example, this would entail the minting of the received tokens on chain B to the specified receiver user account. Application B will then send an `Acknowledgement` message to core IBC B, which will again commit it to its own state so it can be queried and sent by a relayer to core IBC A.

<HighlightBox type="info">

### Synchronous and asynchronous acknowledgements

Acknowledgements can either take place synchronously or asynchronously. What this means is that the `OnRecvPacket` callback has a return value `Acknowledgement` which is optional.
<br/><br/>
In the case of a synchronous `Acknowledgement`, the callback will return an `Acknowledgement` at the end of the process and a relayer can query this `Acknowledgement` packet and relay immediately after the process has finished. This is useful in cases in which application A is expecting an `AckPacket` in order to initiate some application logic `OnAcknowledgePacket`. For example, the sending chain of an ICS-20 token transfer will do nothing in the case of a successful `AckPacket`, but in the case where an error is returned, the sending chain will unescrow the previously locked tokens.
<br/><br/>
In the case of applications like Interchain Security, there is an asynchronous `Acknowledgement` flow. This means that the `Acknowledgement` is not sent as part of the return value of `OnRecvPacket`, but it is sent at some later point. IBC is designed to handle this case by allowing for `Acknowledgements` to be committed or queried asynchronously.
<br/><br/>
In either case, even if there is no application specific logic to be initiated as a direct result of a received `Acknowledgement`, `OnAcknowledgePacket` will at the very least remove the commitment proof from the store to avoid cluttering the store with old data.

</HighlightBox>

## Timeout case

In the case that a packet is time-sensitive and the timeout block height or timeout timestamp specified in the packet parameters **based on chain B's time** has elapsed, whatever state transitions have occured as a result of the sent packet should be reversed.

In these cases, the initial flow is the same, with core IBC A first committing the packet to its own state. However, instead of querying for the packet, a relayer will submit a `QueryNonReceipt` to receive a proof that the packet was not received by core IBC B. It can then send the `MsgTimeout` to core IBC A, which will then trigger the relevant `OnTimeoutPacket` application logic. For example, the ICS-20 token transfer application will unescrow the locked up tokens and send these back to the original sender `OnTimeoutPacket`.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How application to application communication in IBC is conducted over channels, which route data between corresponding modules on different chains, and how a single connection between applications can have any number of associated channels.
* How channels are payload agnostic and simply deliver data packets over the transport layer which application modules use their own logic and handlers to interpret and act upon.
* How channels can be **ordered** (where data packets are delivered exactly in the order they were sent) or **unordered** (where packets can be delivered in any order, which may differ from that in which they were sent).
* How channels are established through a four-way handshake, which allows only the two end modules to make use of the channel, securing them against malicious entities.
* How packet flow between modules is not direct - instead, the sending module commits some particular state, thus emitting an event which is detected by a relayer, which delivers to the destination module both the packet data and a proof of the sending module's state commit, which is then verified on the destination chain.
* How it is possible for time-sensitive packets to trigger a reversal of the sending module's state change in the event that a timeout block height or timestamp has elapsed.

</HighlightBox>

<!--## Next up

You learned how to establish a channel and discovered the application packet flow. In the [next section](./4-clients.md), you get to explore clients in IBC/TAO.-->
