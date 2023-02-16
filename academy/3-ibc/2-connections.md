---
title: "IBC/TAO - Connections"
order: 3
description: Establishing connections in IBC
tags:
  - concepts
  - ibc
  - dev-ops
---

# Transport, Authentication, and Ordering Layer - Connections

<HighlightBox type="learning">

IBC in depth. Discover the IBC protocol in detail:

* Learn more about connection negotiation.
* Explore connection states.
* How IBC repels hostile connection attempts.

</HighlightBox>

Now that you covered the introduction and have a better understanding of how different Inter-Blockchain Communication Protocol (IBC) components and Interchain Standards (ICS) relate to each other, take a deep dive into IBC/TAO (transport, authentication, and ordering) and the [IBC module](https://github.com/cosmos/ibc-go).

## Connections

If you want to connect two blockchains with IBC, you will need to establish an IBC **connection**. Connections, established by a four-way handshake, are responsible for:

1. Establishing the identity of the counterparty chain.
2. Preventing a malicious entity from forging incorrect information by pretending to be the counterparty chain. IBC connections are established by on-chain ledger code and therefore do not require interaction with off-chain (trusted) third-party processes.

<HighlightBox type="docs">

The connection semantics are described in [ICS-3](https://github.com/cosmos/ibc/tree/master/spec/core/ics-003-connection-semantics).

</HighlightBox>

In the IBC stack, connections are built on top of clients, so technically there could be multiple connections for each client if the client is interacting with multiple versions of the IBC protocol. For now, the setup should connote one connection for each client.

<HighlightBox type="note">

### Version negotiation

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

Protocol versioning is important to establish, as different protocol versions may not be compatible, for example due to proofs being stored on a different path. There are three types of protocol version negotiation:

1. _Default, no selection_: only one protocol version is supported. This is default to propose.
2. _With selection_: two protocol versions can be proposed, such that the chain initiating `OpenInit` or `OpenTry` has a choice of which version to go with.
3. _Impossible communication_: a backwards incompatible IBC protocol version. For example, if an IBC module changes where it stores its proofs (proof paths), errors result. There are no plans to upgrade to a backwards incompatible IBC protocol version.

</HighlightBox>

As discussed previously, the opening handshake protocol allows each chain to verify the identifier used to reference the connection on the other chain, enabling modules on each chain to reason about the reference of the other chain.

![Connection state](/academy/3-ibc/images/connectionstate.png)

With regards to the connection on the other side, the [connection protobufs](https://github.com/cosmos/ibc-go/blob/v5.1.0/proto/ibc/core/connection/v1/connection.proto) contains the `Counterparty` definition:

```go
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

In this definition, `connection-id` is used as a key to map and retrieve connections associated with a certain client from the store.

`prefix` is used by the clients to construct merkle prefix paths which are then used to verify proofs.

## Connection handshakes and states

Establishing an IBC connection (for example, between chain A and chain B) requires four handshakes:

1. OpenInit
2. OpenTry
3. OpenAck
4. OpenConfirm

<HighlightBox type="info">

Colin Axnér of Interchain gives an overview of how IBC Connections work (ICS-03), along with a code walkthrough, in the context of the Inter-Blockchain Communications Protocol (IBC).

<YoutubePlayer videoId="E3ZvqdY2tL8" />

</HighlightBox>

A high level overview of a successful four-way handshake is as follows:

### Handshake step 1 - `ConnOpenInit`

`OpenInit` initializes any connection which may occur, while still necessitating agreement from both sides. It is like an identifying announcement from the IBC module on chain A which is submitted by a relayer. The relayer should also submit a `MsgUpdateClient` with chain A as the source chain before this handshake. `MsgUpdateClient` updates the client on the initializing chain A with the latest consensus state of chain B.

![OpenInit](/academy/3-ibc/images/open_init.png)

The initiation of this handshake from chain A updates its connection state to `INIT`.

`OpenInit` proposes a protocol version to be used for the IBC connection. A relayer-submitted `OpenInit` which contains a protocol version that is not supported by chain A will be expected to fail.

<!-- TODO insert image -->

The reference implementation for the connection handshake is found in the [IBC module repository](https://github.com/cosmos/ibc-go/blob/v5.1.0/modules/core/03-connection/keeper/handshake.go). Examine `ConnOpenInit`:

```go
func (k Keeper) ConnOpenInit(
    ctx sdk.Context,
    clientID string,
    counterparty types.Counterparty, // counterpartyPrefix, counterpartyClientIdentifier
    version *types.Version,
    delayPeriod uint64,
) (string, error) {
    ... //version negotiation logic

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

This function creates a unique `connectionID`. It adds the connection to a list of connections associated with a specific client.

It creates a new `ConnectionEnd`:

```go
//@ func (k Keeper) ConnOpenInit
...
connection := types.NewConnectionEnd(types.INIT, clientID, counterparty, types.ExportedVersionsToProto(versions), delayPeriod)
k.SetConnection(ctx, connectionID, connection)
...
```

With the following proto definition:

```go

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
```

`ConnOpenInit` is triggered by the **relayer**, which constructs the message and sends it to the SDK that uses the [`msg_server.go`](https://github.com/cosmos/ibc-go/blob/v5.1.0/modules/core/keeper/msg_server.go) previously seen to call `ConnOpenInit`:

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

### Handshake step 2 - `ConnOpenTry`

`OpenInit` is followed by an `OpenTry` response, in which chain B verifies the identity of chain A according to information that chain B has about chain A in its light client (the algorithm and the last snapshot of the consensus state containing the root hash of the latest height as well as the next validator set). It also responds to some of the information about its own identity in the `OpenInit` announcement from chain A.

![OpenTry](/academy/3-ibc/images/open_try.png)

The purpose of this step of the handshake is double verification: not only for chain B to verify that chain A is the expected counterparty identity, but also to verify that the counterparty has accurate information about chain B's identity. The relayer also submits two `MsgUpdateClient`s with chain A and chain B as source chains before this handshake. These update the light clients of both chain A and chain B in order to make sure that the state verifications in this step are successful.

The initiation of this handshake from chain B updates its connection state to `TRYOPEN`.

With regards to IBC protocol versioning, `OpenTry` either accepts the protocol version which has been proposed in `OpenInit` or proposes another protocol version from the versions available to chain A to be used for the IBC connection. A relayer-submitted `OpenTry` which contains an unsupported protocol version will be expected to fail.

<!-- TODO insert image -->

The [implementation of OpenTry](https://github.com/cosmos/ibc-go/blob/v5.1.0/modules/core/03-connection/keeper/handshake.go#L61-L147) is as follows:

```go
// ConnOpenTry relays notice of a connection attempt on chain A to chain B (this
// code is executed on chain B).
//
// NOTE:
//  - Here chain A acts as the counterparty
//  - Identifiers are checked on msg validation
func (k Keeper) ConnOpenTry(
    ctx sdk.Context,
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

## Handshake step 3 - `ConnOpenAck`

`OpenAck` is very similar to the functionality of `OpenInit`, except that the information verification now occurs for chain A. As in `OpenTry`, the relayer also submits two `MsgUpdateClient`s with chain A and chain B as source chains before this handshake. These update the light clients of both chain A and chain B, in order to make sure that the state verifications in this step are successful.

![OpenAck](/academy/3-ibc/images/open_ack.png)

The initiation of this handshake from chain A updates its connection state to `OPEN`. It is important to note that the counterparty chain _must_ have a `TRYOPEN` connection state in order for the handshake and connection state update to be successful.

With regards to version negotiation, `OpenAck` must confirm the protocol version which has been proposed in `OpenTry`. It ends the connection handshake process if the version is unwanted or unsupported.

<!-- TODO insert image -->

The [`OpenAck` code](https://github.com/cosmos/ibc-go/blob/v5.1.0/modules/core/03-connection/keeper/handshake.go#L154-L247) is very similar to `OpenTry`:

```go
func (k Keeper) ConnOpenAck(
    ctx sdk.Context,
    connectionID string,
    clientState exported.ClientState, // client state for chain A on chain B
    version *types.Version, // version that Chain B chose in ConnOpenTry
    counterpartyConnectionID string,
    proofTry []byte, // proof that connectionEnd was added to Chain B state in ConnOpenTry
    proofClient []byte, // proof of client state on chain B for chain A
    proofConsensus []byte, // proof that chain B has stored ConsensusState of chain A on its client
    proofHeight exported.Height, // height that relayer constructed proofTry
    consensusHeight exported.Height, // latest height of chain A that chain B has stored on its chain A client
) ...
```

Both functions do the same checks, except that `OpenTry` takes `proofInit` as a parameter, and `OpenAck` takes `proofTry`:

```go
// @ func (k Keeper) ConnOpenAck

// This function verifies that the snapshot we have of the counter-party chain looks like the counter-party chain, verifies the light client we have of the counter-party chain
// Check that Chain A committed expectedConnectionEnd to its state
if err := k.VerifyConnectionState(
    ctx, connection, proofHeight, proofTry, counterparty.ConnectionId,
    expectedConnection,
); err != nil {
    return "", err
}

// This function verifies that the snapshot the counter-party chain has of us looks like us, verifies our light client on the counter-party chain
// Check that Chain A stored the clientState provided in the msg
if err := k.VerifyClientState(ctx, connection, proofHeight, proofClient, clientState); err != nil {
    return "", err
}

// This function verifies that the snapshot the counter-party chain has of us looks like us, verifies our light client on the counter-party chain
// Check that Chain A stored the correct ConsensusState of chain B at the given consensusHeight
if err := k.VerifyClientConsensusState(
    ctx, connection, proofHeight, consensusHeight, proofConsensus, expectedConsensusState,
); err != nil {
    return "", err
}
```

Therefore, each chain verifies the `ConnectionState`, the `ClientState`, and the `ConsensusState` of the other chain. Note that after this step the connection state on chain A updates from `INIT` to `OPEN`.

### Handshake step 4 - `ConnOpenConfirm`

`OpenConfirm` is the final handshake, in which chain B confirms that both self-identification and counterparty identification were successful.

![OpenConfirm](/academy/3-ibc/images/open_confirm.png)

The [conclusion of this handshake](https://github.com/cosmos/ibc-go/blob/v5.1.0/modules/core/03-connection/keeper/handshake.go#L253-L297) results in the successful establishing of an IBC connection:

```go
func (k Keeper) ConnOpenConfirm(
    ctx sdk.Context,
    connectionID string,
    proofAck []byte, // proof that connection opened on Chain A during ConnOpenAck
    proofHeight exported.Height, // height that relayer constructed proofAck
)
```

The initiation of this handshake from chain B updates its connection state from `TRYOPEN` to `OPEN`. The counterparty chain _must_ have an `OPEN` connection state in order for the handshake and connection state update to be successful.

<HighlightBox type="remember">

The successful four-way handshake described establishes an IBC connection between the two chains.

</HighlightBox>

Now consider two edge circumstances: simultaneous attempts by the chains to perform the same handshake, and attempts by an imposter to interfere.

### Crossing hellos

"Crossing hellos" refers to when both chains attempt the same handshake step at the same time.

<HighlightBox type="warning">

While still discussed in the video earlier, crossing hellos have been removed from ibc-go v4 onward, as referenced in [this PR](https://github.com/cosmos/ibc-go/pull/1672). The `PreviousConnectionId` in `MsgConnectionOpenTry` has been deprecated.

</HighlightBox>

### An imposter

What if an imposter tried to open a connection pretending to be another chain?

In fact this is not an issue. Any attempted `OpenInit` from an imposter will fail on `OpenTry`, because it will not contain valid proofs of `Client/Connection/ConsensusState`.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How a connection between two blockchains with IBC is established by a four-way handshake, thereby establishing the identity of the counterparty chain and preventing any malicious entity from pretending to be the counterparty.
* How versioning is important to establish, to ensure that only compatible protocol versions attempt to connect.

</HighlightBox>

<!--## Next up

Now that you finished having a look at connections in IBC/TAO, it is now time to switch your focus to channels in the [next section](./3-channels.md).-->
