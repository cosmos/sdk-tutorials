---
title: "IBC/TAO"
order: 
description: 
tag: deep-dive
---

# Transport, Authentication, and Ordering Layer

Now that you covered the introduction and have a better understanding of how different Inter-Blockchain Communication (IBC) Protocol components and Interchain Standards (ICS) relate to each other, take a deep dive into IBC/TAO (transport, authentication, and ordering) and the [IBC module](https://github.com/cosmos/ibc-go).

## Connections

If you want to connect two blockchains with IBC, you will need to etablish an IBC **connection**. Connections, once established, are responsible for facilitating all cross-chain verification of IBC state.

<HighlightBox type="info">

The connection semantics are described in the [Interchain Standard (ICS) 3](https://github.com/cosmos/ibc/tree/master/spec/core/ics-003-connection-semantics).

</HighlightBox>

The opening handshake protocol allows each chain to verify the identifier used to reference the connection on the other chain, enabling modules on each chain to reason about the reference of the other chain.

Take a look at the [connection Protobuf](https://github.com/cosmos/ibc-go/blob/main/proto/ibc/core/connection/v1/connection.proto) for the `ConnectionEnd`:

```
message ConnectionEnd {
  option (gogoproto.goproto_getters) = false;
  // client associated with this connection.
  string client_id = 1 [(gogoproto.moretags) = "yaml:\"client_id\""];
  // IBC version which can be utilised to determine encodings or protocols for
  // channels or packets utilising this connection.
  repeated Version versions = 2;
  // current state of the connection end.
  State state = 3;
  // counterparty chain associated with this connection.
  Counterparty counterparty = 4 [(gogoproto.nullable) = false];
  // delay period that must pass before a consensus state can be used for
  // packet-verification NOTE: delay period logic is only implemented by some
  // clients.
  uint64 delay_period = 5 [(gogoproto.moretags) = "yaml:\"delay_period\""];
}
```

`ConnectionEnd` defines a stateful object on a chain connected to another separate one. Note that there must only be 2 defined `ConnectionEnd`s to establish a connection between two chains. So the connections are mapped and stored as `ConnectionEnd` on the chain.

In addition you can see that the `ConnectionEnd` has different `state`s which will change during the handshake:

![Connection state](/academy/ibc/images/connectionstate.png)

In the [connection Protobuf](https://github.com/cosmos/ibc-go/blob/main/proto/ibc/core/connection/v1/connection.proto) file you can also find the `Counterparty` definition:

```
// Counterparty defines the counterparty chain associated with a connection end.
message Counterparty {
  option (gogoproto.goproto_getters) = false;

  // identifies the client on the counterparty chain associated with a given
  // connection.
  string client_id = 1 [(gogoproto.moretags) = "yaml:\"client_id\""];
  // identifies the connection end on the counterparty chain associated with a
  // given connection.
  string connection_id = 2 [(gogoproto.moretags) = "yaml:\"connection_id\""];
  // commitment merkle prefix of the counterparty chain.
  ibc.core.commitment.v1.MerklePrefix prefix = 3 [(gogoproto.nullable) = false];
}
```

This way it is ensured that both ends of a connection agree on each others clients.

You can find the reference implementation for the connection handshake in the [IBC module repository](https://github.com/cosmos/ibc-go/blob/main/modules/core/03-connection/keeper/handshake.go). In it take a look at `ConnOpenInit`:

```go
func (k Keeper) ConnOpenInit(
  ctx sdk.Context,
  clientID string,
  counterparty types.Counterparty, // counterpartyPrefix, counterpartyClientIdentifier
  version *types.Version,
  delayPeriod uint64,
) (string, error) {
  
  ...

  // connection defines chain A's ConnectionEnd
  connectionID := k.GenerateConnectionIdentifier(ctx)
  connection := types.NewConnectionEnd(types.INIT, clientID, counterparty, types.ExportedVersionsToProto(versions), delayPeriod)
  k.SetConnection(ctx, connectionID, connection)

  if err := k.addConnectionToClient(ctx, clientID, connectionID); err != nil {
    return "", err
  }

  k.Logger(ctx).Info("connection state updated", "connection-id", connectionID, "previous-state", "NONE", "new-state", "INIT")

  defer func() {
    telemetry.IncrCounter(1, "ibc", "connection", "open-init")
  }()

  EmitConnectionOpenInitEvent(ctx, connectionID, clientID, counterparty)

  return connectionID, nil
}

```

This function creates an unique `connectionID`. You can see that it adds the connection to a list, which represents the connections associated with a specific client.

Also you can see how it creates a new `ConnectionEnd`:

```go
connection := types.NewConnectionEnd(types.INIT, clientID, counterparty, types.ExportedVersionsToProto(versions), delayPeriod)
````

**Note:** you will never see a connection related to two clients - the other way around is possible but not likely. In the end, you want to have one connection per blockchain you connect to. 

`ConnOpenInit` is triggered by the **relayer**, which constructs the message and hands it over to the SDK that uses the [`msg_server.go`](https://github.com/cosmos/ibc-go/blob/main/modules/core/keeper/msg_server.go) you saw before to call `ConnOpenInit`:

```go
// ConnectionOpenInit defines a rpc handler method for MsgConnectionOpenInit.
func (k Keeper) ConnectionOpenInit(goCtx context.Context, msg *connectiontypes.MsgConnectionOpenInit) (*connectiontypes.MsgConnectionOpenInitResponse, error) {
  ctx := sdk.UnwrapSDKContext(goCtx)

  if _, err := k.ConnectionKeeper.ConnOpenInit(ctx, msg.ClientId, msg.Counterparty, msg.Version, msg.DelayPeriod); err != nil {
    return nil, sdkerrors.Wrap(err, "connection handshake open init failed")
  }

  return &connectiontypes.MsgConnectionOpenInitResponse{}, nil
}
```

Now take a look at the `ConnOpenTry`:

```go
// ConnOpenTry relays notice of a connection attempt on chain A to chain B (this
// code is executed on chain B).
//
// NOTE:
//  - Here chain A acts as the counterparty
//  - Identifiers are checked on msg validation
func (k Keeper) ConnOpenTry(
  ctx sdk.Context,
  previousConnectionID string, // previousIdentifier
  counterparty types.Counterparty, // counterpartyConnectionIdentifier, counterpartyPrefix and counterpartyClientIdentifier
  delayPeriod uint64,
  clientID string, // clientID of chainA
  clientState exported.ClientState, // clientState that chainA has for chainB
  counterpartyVersions []exported.Version, // supported versions of chain A
  proofInit []byte, // proof that chainA stored connectionEnd in state (on ConnOpenInit)
  proofClient []byte, // proof that chainA stored a light client of chainB
  proofConsensus []byte, // proof that chainA stored chainB's consensus state at consensus height
  proofHeight exported.Height, // height at which relayer constructs proof of A storing connectionEnd in state
  consensusHeight exported.Height, // latest height of chain B which chain A has stored in its chain B client
) ...
```

and `ConnOpenAck`:

```go
func (k Keeper) ConnOpenAck(
  ctx sdk.Context,
  connectionID string,
  clientState exported.ClientState, // client state for chainA on chainB
  version *types.Version, // version that ChainB chose in ConnOpenTry
  counterpartyConnectionID string,
  proofTry []byte, // proof that connectionEnd was added to ChainB state in ConnOpenTry
  proofClient []byte, // proof of client state on chainB for chainA
  proofConsensus []byte, // proof that chainB has stored ConsensusState of chainA on its client
  proofHeight exported.Height, // height that relayer constructed proofTry
  consensusHeight exported.Height, // latest height of chainA that chainB has stored on its chainA client
) ...
```

both will do the same checks:

```go

  // Check that ChainA committed expectedConnectionEnd to its state
  if err := k.VerifyConnectionState(
    ctx, connection, proofHeight, proofInit, counterparty.ConnectionId,
    expectedConnection,
  ); err != nil {
    return "", err
  }

  // Check that ChainA stored the clientState provided in the msg
  if err := k.VerifyClientState(ctx, connection, proofHeight, proofClient, clientState); err != nil {
    return "", err
  }

  // Check that ChainA stored the correct ConsensusState of chainB at the given consensusHeight
  if err := k.VerifyClientConsensusState(
    ctx, connection, proofHeight, consensusHeight, proofConsensus, expectedConsensusState,
  ); err != nil {
    return "", err
  }
```

so both will verify the `ConnectionState`, the `clientState` and the `ConsensusState` of the other chain.

<HighlightBox type="info">

In IBC, blockchains do not directly pass messages to each other over the network.

To communicate, a blockchain commits some state to a precisely defined path reserved for a specific message type and a specific counterparty. For example, a blockchain that stores a specific `connectionEnd` as part of a handshake or a packet intended to be relayed to a module on the counterparty chain.

A relayer process monitors for updates to these paths and relays messages by submitting the data stored under the path along with a proof of that data to the counterparty chain.

</HighlightBox>

## Channels

After a connection is established, an application needs to bind to a port and a channel. Let us first understand what a channel is before diving further.

A channel serves as a **conduit for packets** passing between a module on one chain and a module on another one to ensure that packets are executed only once, delivered in the order in which they were sent (if necessary), and delivered only to the corresponding module owning the other end of the channel on the destination chain. Each channel is associated with a particular connection. A connection may have any number of associated channels, allowing the use of common identifiers and amortizing the cost of header verification across all the channels utilizing a connection and a light client.

Channels are payload-agnostic: the modules sending and receiving IBC packets decide how to construct packet data and how to act upon the incoming packet data, and must use their own application logic to determine which state transactions to apply according to what data the packet contains.

An **ordered channel** is _a channel where packets are delivered exactly in the order in which they were sent_. 
An **unordered channel** is _a channel where packets can be delivered in any order_, which may differ from the order in which they were sent.

![Channel Handshake](/academy/ibc/images/channelhandshake.png)

You can see that a IBC channel handshake is smiliar to a connection handshake:

1. `ChanOpenInit`: will set the chain A into `INIT` state. This will call `OnChanOpenInit` so application A can apply its `INIT`logic, e.g. check if the port is set correctly. 
2. `ChanOpenTry`: will set chain B into `TRY` state. It will call `OnChanOpenConfirm` so application B can apply its `TRY` logic. 
3. `ChanOpenAck`: will set the chain A into `OPEN` state. This will call `OnChanOpenAck` which will be implemented by the application.
4. `ChanOpenConfirm`: will set chain B into `OPEN` state so application B can apply its `CONFIRM` logic. 

If an application returns an error in this process, the handshake will fail.

Notice that if you use a channel between two applications, you have to trust that the applications on both ends are not malicious.

You can find the implementation of `ChannelOpenInit` in the the [`msg_server.go`](https://github.com/cosmos/ibc-go/blob/main/modules/core/keeper/msg_server.go):

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

After the verification of the module capability, first step of the channel handshake will take step and `ChanOpenInit` will be called like desribed before about the channel handshake. Notice that an application has capabilities for channels and ports and an application can only use a channel and port if the application owns the capability for that channel and port.

<HighlightBox type="info">
IBC is intended to work in execution environments where modules do not necessarily trust each other. IBC must authenticate module actions on ports and channels so that only modules with the appropriate permissions can use the channels. This security is accomplished using dynamic capabilities. Upon binding to a port or creating a channel for a module, IBC returns a dynamic capability that the module must claim to use that port or channel. This binding strategy prevents other modules from using that port or channel since those modules do not own the appropriate capability.
</HighlightBox>

You can see that the application callbacks are coming from a [router](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/router.go):

```go
// GetRoute returns a IBCModule for a given module.
func (rtr *Router) GetRoute(module string) (IBCModule, bool) {
  if !rtr.HasRoute(module) {
    return nil, false
  }
  return rtr.routes[module], true
}
```

which returns an implementation of the [IBC Module Interface](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go):

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

There you can find all the callbacks your application will need to implement. So in the `msg_serve.go` you can find in the `ChannelOpenInit`:

```go
  // Perform application logic callback
  if err = cbs.OnChanOpenInit(ctx, msg.Channel.Ordering, msg.Channel.ConnectionHops, msg.PortId, channelID, cap, msg.Channel.Counterparty, msg.Channel.Version); err != nil {
    return nil, sdkerrors.Wrap(err, "channel open init callback failed")
  }
```

will call custom logic of the application. The situation is similar for `OnChanOpenTry`, `OnChanOpenAck`, `OnChanOpenConfirm` etc in the [IBC Module Interface](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go): 

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

We will talk about applications soon but the take away here is that an application developer will need to implement the [IBC Module Interface](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go).

Modules communicate with each other by sending packets over IBC channels, take a look at the [packet definition](https://github.com/cosmos/ibc-go/blob/main/modules/core/04-channel/types/packet.go) to see the packet structure:

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

In the diagram above we have two flows(successful and not successful) to explain:

1. Application A will send a packet(call `sendPacket`) to the application B. This can be triggerd by a user but applications can also act without a user. Core IBC A will commit the packet to its own state and the relayer can query this packet and send a receive message to the Core IBC B. The verifications will be done by the Core IBC and the application B will get the packet if it is valid. Note that the applications on both ends will need to marshal and unmarshal the data. The application B then will send an acknowledgment message to the Core IBC B, which will again commit it to its own state so it can be send by a relayer to Core IBC A.
2. In second scenario the packet is not received in time. In this case, Core IBC A will receive a `TimeoutPacket` message from the relayer and will call `OnTimeoutPacket` on applicatoin A.

## Light Clients

In the IBC Protocol, an actor - an end user, an off-chain process, or a machine - needs to be able to verify updates to another machine's state that the other machine's consensus algorithm has agreed to and reject any possible updates that the other machine's consensus algorithm has not agreed upon.

![Light clients](/academy/ibc/images/lightclient.png)

Different abstraction layers are described in the ICS.

<HighlightBox type="info">

In case you want to take a refresher of ICS and the different layers, take a look at the section [What is IBC?](./what-is-ibc.md).

</HighlightBox>

**Light clients** confirm that received packets are verified. With this approach, an IBC chain is not required to maintain a **full node** for the verification of state changes of another chain. A **relayer** has access to both full nodes and passes headers from full nodes to the light clients.

Before a **connection** can be established - a connection handshake starts - chain A will create a light client for chain B and chain B will create a light client for chain A.

Start with [`msg_serve.go`](https://github.com/cosmos/ibc-go/blob/main/modules/core/keeper/msg_server.go), this is where the messages come in. In it, we first see a `CreateClient` function:

```go
// CreateClient defines a rpc handler method for MsgCreateClient.
func (k Keeper) CreateClient(goCtx context.Context, msg *clienttypes.MsgCreateClient) (*clienttypes.MsgCreateClientResponse, error) {
  ctx := sdk.UnwrapSDKContext(goCtx)

  clientState, err := clienttypes.UnpackClientState(msg.ClientState)
  ...

  consensusState, err := clienttypes.UnpackConsensusState(msg.ConsensusState)
  
  ...

  ... = k.ClientKeeper.CreateClient(ctx, clientState, consensusState); 
  
  ...

}
```

It creates a light client by calling [`ClientKeeper.CreateClient`](https://github.com/cosmos/ibc-go/blob/main/modules/core/02-client/keeper/client.go):

```go
// CreateClient creates a new client state and populates it with a given consensus
// state as defined in https://github.com/cosmos/ibc/tree/master/spec/core/ics-002-client-semantics#create
func (k Keeper) CreateClient(
  ctx sdk.Context, clientState exported.ClientState, consensusState exported.ConsensusState,
) 
  
  ...

  clientID := k.GenerateClientIdentifier(ctx, clientState.ClientType())

  ...

  k.SetClientState(ctx, clientID, clientState)

  ...

  // verifies initial consensus state against client state and initializes client store with any client-specific metadata
  // e.g. set ProcessedTime in Tendermint clients
  ... := clientState.Initialize(ctx, k.cdc, k.ClientStore(ctx, clientID), consensusState);

  ...

  EmitCreateClientEvent(ctx, clientID, clientState)

  return clientID, nil
}
```

Each client for a chain has a unique `clientID`. In addition, you can see that the function expects a [`clientState`](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/client_state.go):

 ```go
// NewClientState creates a new ClientState instance
func NewClientState(
  chainID string, trustLevel Fraction,
  trustingPeriod, ubdPeriod, maxClockDrift time.Duration,
  latestHeight clienttypes.Height, specs []*ics23.ProofSpec,
  upgradePath []string, allowUpdateAfterExpiry, allowUpdateAfterMisbehaviour bool,
) *ClientState {
  return &ClientState{
    ChainId:                      chainID,
    TrustLevel:                   trustLevel,
    TrustingPeriod:               trustingPeriod,
    UnbondingPeriod:              ubdPeriod,
    MaxClockDrift:                maxClockDrift,
    LatestHeight:                 latestHeight,
    FrozenHeight:                 clienttypes.ZeroHeight(),
    ProofSpecs:                   specs,
    UpgradePath:                  upgradePath,
    AllowUpdateAfterExpiry:       allowUpdateAfterExpiry,
    AllowUpdateAfterMisbehaviour: allowUpdateAfterMisbehaviour,
  }
}

```

`TrustLevel` in the `NewClientState` lets you set the security conditions. It determines, for example, how often the relayer will pass a header to the light client. Also it determines the portion of the validator set you want to have signing for the block confirmation.

`CreateClient` additionally expects a [`consensusState`](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/consensus_state.go):

```go
// NewConsensusState creates a new ConsensusState instance.
func NewConsensusState(
  timestamp time.Time, root commitmenttypes.MerkleRoot, nextValsHash tmbytes.HexBytes,
) *ConsensusState {
  return &ConsensusState{
    Timestamp:          timestamp,
    Root:               root,
    NextValidatorsHash: nextValsHash,
  }
}
```

This is the code from the Tendermint client. The Tendermint client tracks the timestamp (block time), validator set, and commitment root for all previously verified consensus states.

<HighlightBox type="info">

If you want to see where `ConsensusState` is stored, take a look at the [Interchain Standard (ICS) 24](https://github.com/cosmos/ibc/tree/master/spec/core/ics-024-host-requirements), which describes the paths also for other keys to be stored and used by IBC.

</HighlightBox>

The IBC module uses [Merkle trees](https://en.wikipedia.org/wiki/Merkle_tree) for the `root` [verifications](https://github.com/cosmos/ibc-go/blob/main/modules/core/23-commitment/types/merkle.go):

```go
// VerifyMembership verifies the membership pf a merkle proof against the given root, path, and value.
func (proof MerkleProof) VerifyMembership(specs []*ics23.ProofSpec, root exported.Root, path exported.Path, value []byte) error {
  if err := proof.validateVerificationArgs(specs, root); err != nil {
    return err
  }

  // VerifyMembership specific argument validation
  mpath, ok := path.(MerklePath)
  if !ok {
    return sdkerrors.Wrapf(ErrInvalidProof, "path %v is not of type MerklePath", path)
  }
  if len(mpath.KeyPath) != len(specs) {
    return sdkerrors.Wrapf(ErrInvalidProof, "path length %d not same as proof %d",
      len(mpath.KeyPath), len(specs))
  }
  if len(value) == 0 {
    return sdkerrors.Wrap(ErrInvalidProof, "empty value in membership proof")
  }

  // Since every proof in chain is a membership proof we can use verifyChainedMembershipProof from index 0
  // to validate entire proof
  if err := verifyChainedMembershipProof(root.GetHash(), specs, proof.Proofs, mpath, value, 0); err != nil {
    return err
  }
  return nil
}
```

As mentioned before, you have different security guarantees for an update depending on the trust level you set. Take a look at [`CheckHeaderAndUpdateState`](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/update.go) and read through the comments. Notice that `consensusState` is not updated, instead another `consensusState` with a different height is stored on the chain:

```go
func (cs ClientState) CheckHeaderAndUpdateState(
  ctx sdk.Context, cdc codec.BinaryCodec, clientStore sdk.KVStore,
  header exported.Header,
) (exported.ClientState, exported.ConsensusState, error) {
  tmHeader, ok := header.(*Header)
  if !ok {
    return nil, nil, sdkerrors.Wrapf(
      clienttypes.ErrInvalidHeader, "expected type %T, got %T", &Header{}, header,
    )
  }

 ...

  // get consensus state from clientStore
  trustedConsState, err := GetConsensusState(clientStore, cdc, tmHeader.TrustedHeight)
  if err != nil {
    return nil, nil, sdkerrors.Wrapf(
      err, "could not get consensus state from clientstore at TrustedHeight: %s", tmHeader.TrustedHeight,
    )
  }

  if err := checkValidity(&cs, trustedConsState, tmHeader, ctx.BlockTime()); err != nil {
    return nil, nil, err
  }

  consState := tmHeader.ConsensusState()
  // Header is different from existing consensus state and also valid, so freeze the client and return
  if conflictingHeader {
    cs.FrozenHeight = FrozenHeight
    return &cs, consState, nil
  }
  // Check that consensus state timestamps are monotonic
  prevCons, prevOk := GetPreviousConsensusState(clientStore, cdc, header.GetHeight())
  nextCons, nextOk := GetNextConsensusState(clientStore, cdc, header.GetHeight())
  // if previous consensus state exists, check consensus state time is greater than previous consensus state time
  // if previous consensus state is not before current consensus state, freeze the client and return.
  if prevOk && !prevCons.Timestamp.Before(consState.Timestamp) {
    cs.FrozenHeight = FrozenHeight
    return &cs, consState, nil
  }
  // if next consensus state exists, check consensus state time is less than next consensus state time
  // if next consensus state is not after current consensus state, freeze the client and return.
  if nextOk && !nextCons.Timestamp.After(consState.Timestamp) {
    cs.FrozenHeight = FrozenHeight
    return &cs, consState, nil
  }

  // Check the earliest consensus state to see if it is expired, if so then set the prune height
  // so that we can delete consensus state and all associated metadata.
  
  ...

  newClientState, consensusState := update(ctx, clientStore, &cs, tmHeader)
  return newClientState, consensusState, nil
}

```

`header` has not been mentioned yet, so take a look at the [header definition](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/tendermint.pb.go):

```go
type Header struct {
  *types2.SignedHeader `protobuf:"bytes,1,opt,name=signed_header,json=signedHeader,proto3,embedded=signed_header" json:"signed_header,omitempty" yaml:"signed_header"`
  ValidatorSet         *types2.ValidatorSet `protobuf:"bytes,2,opt,name=validator_set,json=validatorSet,proto3" json:"validator_set,omitempty" yaml:"validator_set"`
  TrustedHeight        types.Height         `protobuf:"bytes,3,opt,name=trusted_height,json=trustedHeight,proto3" json:"trusted_height" yaml:"trusted_height"`
  TrustedValidators    *types2.ValidatorSet `protobuf:"bytes,4,opt,name=trusted_validators,json=trustedValidators,proto3" json:"trusted_validators,omitempty" yaml:"trusted_validators"`
}
```

Header defines the Tendermint client consensus `Header`. It encapsulates all the information necessary to update from a trusted Tendermint `ConsensusState`. The inclusion of `TrustedHeight` and `TrustedValidators` allows this update to process correctly, so long as the `ConsensusState` for the `TrustedHeight` exists, this removes race conditions among relayers.

The `SignedHeader` and `ValidatorSet` are the new untrusted update fields for the client. The `TrustedHeight` is the height of a stored `ConsensusState` on the client that will be used to verify the new untrusted
header. The Trusted `ConsensusState` must be within the unbonding period of current time in order to correctly verify, and the `TrustedValidators` must hash to `TrustedConsensusState.NextValidatorsHash` since that is the last trusted validator set at the `TrustedHeight`.

The header is passed by the relayer to the light client. You can see that the the header is confirmed with:

```go
  if err := checkValidity(&cs, trustedConsState, tmHeader, ctx.BlockTime()); err != nil {
    return nil, nil, err
  }
```

So take a closer look to see the different verifications made in this call:

```go
// checkValidity checks if the Tendermint header is valid.
// CONTRACT: consState.Height == header.TrustedHeight
func checkValidity(
  clientState *ClientState, consState *ConsensusState,
  header *Header, currentTimestamp time.Time,
) error {
  if err := checkTrustedHeader(header, consState); err != nil {
    return err
  }

  // UpdateClient only accepts updates with a header at the same revision
  // as the trusted consensus state
  ...

  tmTrustedValidators, err := tmtypes.ValidatorSetFromProto(header.TrustedValidators)
  ...

  tmSignedHeader, err := tmtypes.SignedHeaderFromProto(header.SignedHeader)
  ...

  tmValidatorSet, err := tmtypes.ValidatorSetFromProto(header.ValidatorSet)
  ...

  // assert header height is newer than consensus state
  ...

  chainID := clientState.GetChainID()
  // If chainID is in revision format, then set revision number of chainID with the revision number
  // of the header we are verifying
  // This is useful if the update is at a previous revision rather than an update to the latest revision
  // of the client.
  // The chainID must be set correctly for the previous revision before attempting verification.
  // Updates for previous revisions are not supported if the chainID is not in revision format.
  if clienttypes.IsRevisionFormat(chainID) {
    chainID, _ = clienttypes.SetRevisionNumber(chainID, header.GetHeight().GetRevisionNumber())
  }

  // Construct a trusted header using the fields in consensus state
  // Only Height, Time, and NextValidatorsHash are necessary for verification
  trustedHeader := tmtypes.Header{
    ChainID:            chainID,
    Height:             int64(header.TrustedHeight.RevisionHeight),
    Time:               consState.Timestamp,
    NextValidatorsHash: consState.NextValidatorsHash,
  }
  signedHeader := tmtypes.SignedHeader{
    Header: &trustedHeader,
  }

  // Verify next header with the passed-in trustedVals
  // - asserts trusting period not passed
  // - assert header timestamp is not past the trusting period
  // - assert header timestamp is past latest stored consensus state timestamp
  // - assert that a TrustLevel proportion of TrustedValidators signed new Commit
  err = light.Verify(
    &signedHeader,
    tmTrustedValidators, tmSignedHeader, tmValidatorSet,
    clientState.TrustingPeriod, currentTimestamp, clientState.MaxClockDrift, clientState.TrustLevel.ToTendermint(),
  )

  ...

  return nil
}
```

The client is also used to [verify an incoming packet](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/client_state.go):

```go
// VerifyPacketCommitment verifies a proof of an outgoing packet commitment at
// the specified port, specified channel, and specified sequence.
func (cs ClientState) VerifyPacketCommitment(
  ctx sdk.Context,
  store sdk.KVStore,
  cdc codec.BinaryCodec,
  height exported.Height,
  delayTimePeriod uint64,
  delayBlockPeriod uint64,
  prefix exported.Prefix,
  proof []byte,
  portID,
  channelID string,
  sequence uint64,
  commitmentBytes []byte,
) error {
  merkleProof, consensusState, err := produceVerificationArgs(store, cdc, cs, height, prefix, proof)
  ...

  // check delay period has passed
  if err := verifyDelayPeriodPassed(ctx, store, height, delayTimePeriod, delayBlockPeriod); 
  ...

  commitmentPath := commitmenttypes.NewMerklePath(host.PacketCommitmentPath(portID, channelID, sequence))
  path, err := commitmenttypes.ApplyPrefix(prefix, commitmentPath)
  ...

  if err := merkleProof.VerifyMembership(cs.ProofSpecs, consensusState.GetRoot(), path, commitmentBytes);
  ...

  return nil
}
```

Now you can see how the [client is updated](https://github.com/cosmos/ibc-go/blob/main/modules/core/02-client/keeper/client.go):

```go
// UpdateClient updates the consensus state and the state root from a provided header.
func (k Keeper) UpdateClient(ctx sdk.Context, clientID string, header exported.Header) error {
  clientState, found := k.GetClientState(ctx, clientID)
  ...

  clientStore := k.ClientStore(ctx, clientID)

  ... status := clientState.Status(ctx, clientStore, k.cdc); 
  ...

  // Any writes made in CheckHeaderAndUpdateState are persisted on both valid updates and misbehaviour updates.
  // Light client implementations are responsible for writing the correct metadata (if any) in either case.
  newClientState, newConsensusState, err := clientState.CheckHeaderAndUpdateState(ctx, k.cdc, clientStore, header)
  ...

  // emit the full header in events
  ...
    // set default consensus height with header height
    consensusHeight = header.GetHeight()
  ...

  // set new client state regardless of if update is valid update or misbehaviour
  k.SetClientState(ctx, clientID, newClientState)

  // If client state is not frozen after clientState CheckHeaderAndUpdateState,
  // then update was valid. Write the update state changes, and set new consensus state.
  // Else the update was proof of misbehaviour and we must emit appropriate misbehaviour events.
  ...

    // emitting events in the keeper emits for both begin block and handler client updates
    EmitUpdateClientEvent(ctx, clientID, newClientState, consensusHeight, headerStr)
  ...

  return nil
}

```
