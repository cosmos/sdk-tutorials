---
title: "IBC/TAO"
order: 
description: 
tag: deep-dive
---

# Transport, Authentication, and Ordering Layer

Now that you covered the introduction and have a better understanding of how different Inter-Blockchain Communication (IBC) Protocol components and Interchain Standards (ICS) relate to each other, take a deep dive into IBC/TAO (transport, authentication, and ordering) and the [IBC module](https://github.com/cosmos/ibc-go).

## Connections

If you want to connect two blockchains with IBC, you will need to establish an IBC **connection**. Connections, established by a four-way handshake, are responsible for: 1) establishing the identity of the counterparty chain, and 2) preventing a malicious entity from forging incorrect information by pretending to be the counter party chain. IBC connections are established by on-chain ledger code and therefore do not require interaction with off-chain (trusted) third-party processes. 

<HighlightBox type="info">

The connection semantics are described in the [Interchain Standard (ICS) 3](https://github.com/cosmos/ibc/tree/master/spec/core/ics-003-connection-semantics).

</HighlightBox>

In the IBC stack, connections are built on top of clients, so technically there could be multiple connections for each client if the client is interacting with multiple versions of the IBC protocol. For now, the setup should connote one connection for each client.

<HighlightBox type="info">

**Version Negotiation**

Note that versioning here refers to the IBC protocol spec and not the ibc-go module. A backwards incompatible update is currently not planned.

```go
// Version defines the versioning scheme used to negotiate the IBC verison in
// the connection handshake.
type Version struct {
	// unique version identifier
	Identifier string `protobuf:"bytes,1,opt,name=identifier,proto3" json:"identifier,omitempty"`
	// list of features compatible with the specified identifier
	Features []string `protobuf:"bytes,2,rep,name=features,proto3" json:"features,omitempty"`
}
```

Protocol versioning is important to establish, as different protocol versions may not be compatible due to, for example, proofs being stored on a different path. There are three types of protocol version negotiation:

1. *Default, no selection* only one protocol version is supported, this is the default one to propose.

2. *With selection* two protocol versions can be proposed, such that the chain initiating `OpenInit` or `OpenTry` has a choice of which version to go with.

3. *Impossible communication* backwards incompatible IBC protocol version -- ie: if IBC module changes where it stores its proofs (proof paths), errors out. So far, there are no plans to upgrade to a backwards incompatible IBC protocol version.

</HighlightBox>

As discussed above, the opening handshake protocol allows each chain to verify the identifier used to reference the connection on the other chain, enabling modules on each chain to reason about the reference of the other chain.

![Connection state](/academy/ibc/images/connectionstate.png)

With regards to the connection on the other side, the [connection protobufs](https://github.com/cosmos/ibc-go/blob/main/proto/ibc/core/connection/v1/connection.proto) contain the `Counterparty` definition:

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

In this definition, `connection-id` is used to as a key to map and retrieve connections associated with a certain client from the store. 

`prefix` is being used by the clients to construct merkle prefix paths which are then used to verify proofs.


**Connection Handshakes and States**

Establishing an IBC connection between example chain A and chain B requires four handshakes. A high level overview of a successful four-way handshake:

**OpenInit**

The first handshake is `OpenInit`, which takes care of initialising any connection which may occur, while still necessitating agreement from both sides. You can think about it as a sort of identifying announcement from the IBC module on chain A which is submitted by a relayer. The relayer should also submit an `UpdateClient` with chain A as the source chain before this handshake. `UpdateClient` will update the client on the initialising chain A with the latest consensus state of chain B. 

![OpenInit](/academy/ibc/images/open_init.png)

The initiation of this handshake from chain A will lead a connection state update to `INIT`.

`OpenInit` proposes a protocol version to be used for the IBC connection. A relayer-submitted `OpenInit` which contains a protocol version that is not supported by chain A will be expected to fail.

<insert image here>

In the code, you can find the reference implementation for the connection handshake in the [IBC module repository](https://github.com/cosmos/ibc-go/blob/main/modules/core/03-connection/keeper/handshake.go). In it take a look at `ConnOpenInit`:

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
  k.SetConnection(ctx, connectionID, connection)
  
// ConnectionEnd defines a stateful object on a chain connected to another separate one.
// NOTE: there must only be 2 defined ConnectionEnds to establish
// a connection between two chains, so the connections are mapped and stored as `ConnectionEnd` on the respective chains.
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
````

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

**OpenTry**

This `OpenInit` will be followed by an `OpenTry` response. in which chain B will verify the identity of chain A according to information that chain B has about chain A in its light client (the algorithm and the last snapshot of the consensus state containing the root hash of the latest height as well as the next validator set), as well as respond to some of the information about its own identity in the `OpenInit` announcement from chain A. 

![OpenTry](/academy/ibc/images/open_try.png)

The purpose of this step of the handshake is double verification: not only for chain B to verify that the counterparty chain A is indeed the expected counterparty identity, but also to verify that the counterparty has the accurate information about chain B's identity. The relayer will also submit two `UpdateClient`s with chain A and chain B as source chains before this handshake. These `UpdateClient` will update both chain A and chain B light clients, in order to make sure that the state verifications in this step are successful.

The initiation of this handshake from chain B will lead a chain B connection state update to `TRY`.

With regards to IBC protocol versioning, `OpenTry` either accepts the protocol version which has been proposed in `OpenInit`, or proposes another protocol version from chain A's avaiable versions to be used for the IBC connection. A relayer-submitted `OpenTry` which contains an unsupported protocol version will be expected to fail.

<insert image>

The implementation of OpenTry looks like this:

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

**OpenAck**

`OpenAck` is the third handshake in establishing a connection, and is very similar to the functionality of `OpenInit` except that the information verification is occurring from chain A. As in `OpenTry`, the relayer will also submit two `UpdateClient`s with chain A and chain B as source chains before this handshake. These `UpdateClient` will update both chain A and chain B light clients, in order to make sure that the state verifications in this step are successful.

[OpenAck](/academy/ibc/images/open_ack.png)

The initiation of this handshake from chain A will lead a chain A connection state update to `OPEN`. It is important to note that for this connection state update, the counterparty chain *MUST* have a `TRY` connection state in order for the handshake and update to be successful. 

With regards to version negotiation, `OpenAck` must confirm the protocol version which has been proposed in `OpenTry`, or end the connection handshake process if the version is unwanted or unsupported.

<insert image>

Note that the code for `OpenAck` looks very similar to `OpenTry`: 

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

Both functions will do the same checks, except that `OpenTry` will take `proofInit` as a parameter, and `OpenAck` takes `proofTry`:

```go

  // This function verifies that the snapshot we have of the counter-party chain looks like the counter-party chain, verifies the light client we have of the counter-party chain
  // Check that ChainA committed expectedConnectionEnd to its state
  if err := k.VerifyConnectionState(
    ctx, connection, proofHeight, proofTry, counterparty.ConnectionId,
    expectedConnection,
  ); err != nil {
    return "", err
  }

  // This function verifies that the snapshot the counter-party chain has of us looks like us, verifies our light client on the counter-party chain
  // Check that ChainA stored the clientState provided in the msg
  if err := k.VerifyClientState(ctx, connection, proofHeight, proofClient, clientState); err != nil {
    return "", err
  }

  // This function verifies that the snapshot the counter-party chain has of us looks like us, verifies our light client on the counter-party chain
  // Check that ChainA stored the correct ConsensusState of chainB at the given consensusHeight
  if err := k.VerifyClientConsensusState(
    ctx, connection, proofHeight, consensusHeight, proofConsensus, expectedConsensusState,
  ); err != nil {
    return "", err
  }
```

so both will verify the `ConnectionState`, the `ClientState` and the `ConsensusState` of the other chain. Note again that after this step, the connection state on chain A will update from `INIT` to `OPEN`.

**OpenConfirm**

`OpenConfirm` is the fourth and final handshake, in which chain B confirms that both self-identification and counterparty identification were successful. 

![OpenConfirm](/academy/ibc/images/open_confirm.png)

The conclusion of this handshake results in the successful establishing of an IBC connection:

```go
func (k Keeper) ConnOpenConfirm(
	ctx sdk.Context,
	connectionID string,
	proofAck []byte, // proof that connection opened on ChainA during ConnOpenAck
	proofHeight exported.Height, // height that relayer constructed proofAck
)
```

The initiation of this handshake from chain B will lead a chain B connection state update from `TRY` to `OPEN`. For this connection state update, the counterparty chain *MUST* have an `OPEN` connection state in order for the handshake and update to be successful.  

<insert image>

**Crossing Hellos**

"Crossing Hellos" refers to a situation when both chains attempt the same handshake step at the same time.

If both chains submit `OpenInit` then `OpenTry` at same time, there should be no error. In this case, both sides will need to confirm with an `OpenAck`, and then no `OpenConfirm` is required because both ConnectionEnds will be in state OPEN after the successful `OpenAck`.

**An Imposter**

An attempted `OpenInit` from an imposter will fail on `OpenTry` because it will not contain valid proofs of Client/Connection/ConsensusState.

