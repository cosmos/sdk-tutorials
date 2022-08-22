---
title: "Transport, Authentication, and Ordering Layer - Clients"
order: 5
description: Clients in IBC
tag:  
  - concepts
  - ibc
  - dev-ops
---

# Transport, Authentication, and Ordering Layer - Clients

<HighlightBox type="learning">

In this section, you will learn:

* How a client is created.
* How client state and consensus can be verified.
* How packets are verified.

</HighlightBox>

![clients](/academy/4-ibc/images/lightclient.png)

As previously shown, IBC is structured as several layers of abstraction. At the top, applications such as [Interchain Standard (ICS) 20 token transfers](https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer) implement the [ICS-26 IBC standard](https://github.com/cosmos/ibc/blob/master/spec/core/ics-026-routing-module/README.md), which describe the routing and callback functionality used to connect the application layer to the transport layer. Underneath the application are channels, which are unique for each application (for example, a channel that allows a transfer application on chain A to speak to a transfer application on chain B). [Connections](/academy/4-ibc/connections.md), which may have many channels, are used to connect two clients (for example, to allow the entire IBC stack of chain A to connect to the IBC stack of chain B). These clients, which may have many connections, comprise the foundational layer of IBC.

<HighlightBox type="info">

IBC application developers will primarily interact with [IBC channels](/academy/4-ibc/channels.md). This layer is comprised of the handshakes and packet callbacks.

</HighlightBox>

In the IBC setup, each chain will have a **client** of the other chain in its own IBC stack. IBC clients track the consensus states of other blockchains, and the proof specs of those blockchains that are required to properly verify proofs against the client's consensus state. The packets, acknowledgements, and timeouts that off-chain relayers send back and forth can be verified by proving that the packet commitments exist inside of these clients on each chain.

<HighlightBox type="info">

Although relayers do not perform any verification of the packets, and therefore do not need to be trusted, relayers have a particularly important role in IBC setup in addition to IBC network liveness through submission of packets. They are responsible for submitting the initial messages to create a new client, as well as keeping the client states updated on each chain, so that proof verification on a submitted packet is successful. Relayers are also responsible for sending the connection and channel handshakes to establish connections and channels between chains. Furthermore, relayers can submit evidence of misbehaviour if a chain on the other end of a connection tries to fork or attempts other types of malicious behaviour.

</HighlightBox>

## Creating a client

Start with [`msg_serve.go`](https://github.com/cosmos/ibc-go/blob/main/modules/core/keeper/msg_server.go), which is where the messages come in. This is the first appearance of the `CreateClient` function, which will be submitted by a relayer through the relaying software to create an IBC client on the chain that the message is submitted to:

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

It creates a client by calling [`ClientKeeper.CreateClient`](https://github.com/cosmos/ibc-go/blob/main/modules/core/02-client/keeper/client.go):

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

A local, unique identifier `clientID` is generated for each client on the chain. This is not related to the `chainID`, as IBC does not actually use the `chainID` as an identifier.

<HighlightBox type="info">

The IBC security model is based on clients and not specific chains. This means that the IBC protocol does not need to know who the chains are on either side of a connection, provided that the IBC clients are kept in sync with valid updates, and these updates or other types of messages (i.e. ICS-20 token transfers) can be verified as a Merkle proof against an initial consensus state (root of trust). This is analogous to IP addresses and DNS, where IP addresses would be the corollary to IBC `clientIDs`, and DNS the `chainIDs`.

Because of this separation of concerns, IBC clients can be created for any number of machine types, from fully-fledged blockchains to keypair-based solo machines, and upgrades to chains which increment the chainID do not break the underlying IBC client and connections.

</HighlightBox>

In addition, you can see that the function expects a `ClientState`. This `ClientState` will look different depending on which type of client is to be created for IBC. In the case of Cosmos-SDK chains and the corresponding implementation of ibc-go, the [Tendermint client](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/client_state.go) is offered out of the box:

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

The Tendermint `ClientState` contains all the information needed to verify a header. This includes properties which are applicable for all Tendermint clients, such as the corresponding chainID, the unbonding period of the chain, the latest height of the client, etc.

`TrustingPeriod` determines the duration of the period since the latest timestamp during which the submitted headers are valid for upgrade. If a client is not updated within the `TrustingPeriod`, the client will expire. This does not mean the client is irrecoverable. However, recovery of an expired Tendermint client will require a [governance proposal](https://ibc.cosmos.network/main/ibc/proposals.html#preconditions) for each client which has expired. If both clients on either side of a connection have expired, then a governance proposal will be required on each chain in order to revive each client.

`TrustLevel` determines the portion of the validator set you want to have signing a header for it to be considered as valid. Tendermint defines this as 2/3, and the IBC Tendermint client inherits this property from Tendermint.

<HighlightBox type="note">

Properties such as `TrustLevel` and `TrustingPeriod` can be customised, such that different clients on the same chain can have different security guarantees with different tradeoffs for efficiency of processing updates.

</HighlightBox>

<HighlightBox type="info">

It is important to highlight that certain parameters of an IBC client cannot be updated after the client has been created, in order to preserve the security guarantees of each client and prevent a situation where a relayer unilaterally updates those security guarantees. These parameters are: `MaxClockDrift`, `TrustingPeriod`, and `TrustLevel`.

As stated before, `TrustLevel` is inherited from Tendermint and will be 2/3 for all Tendermint clients. However, this could change for other client types.

It is recommended that `TrustingPeriod` should be set as 2/3 of the UnbondingPeriod.

It is also recommended that `MaxClockDrift` should be set to at least 5sec and up to 15sec, depending on expected block size differences between the chains in the connection. The Hermes (Rust) relayer will compute this value for you if you do not manually set it.

</HighlightBox>

`CreateClient` additionally expects a [`ConsensusState`](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/consensus_state.go). In the case of a Tendermint client, the initial root of trust (or consensus state) looks like this:

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

The Tendermint client `ConsensusState` tracks the timestamp of the block being created, the hash of the validator set for the next block of the counterparty blockchain, and the root of the counterparty blockchain. The initial `ConsensusState` does not need to start with the genesis block of a counterparty chain.

<HighlightBox type="tip">

The next validator set is used for verifying subsequent submitted headers or updates to the counterparty `ConsensusState`. See the following part on [Updating clients](https://interchainacademy.cosmos.network/academy/ibc/clients.html#updating-a-client) for more information about what happens when a validator set changes between blocks.

</HighlightBox>

The root is the **AppHash**, or the hash of the application state of the counterparty blockchain that this client is representing. This root hash is particularly important because it is the root hash used on a receiving chain when verifying [Merkle](https://en.wikipedia.org/wiki/Merkle_tree) proofs associated with a packet coming over IBC, to determine whether or not the relevant transaction has been actually been executed on the sending chain. If the Merkle proof associated with a packet commitment delivered by a relayer successfully hashes up to this `ConsensusState` root hash, it is certain that the transaction was actually executed on the sending chain and included in the state of the sending blockchain.

The following is an example of how the Tendermint client handles this Merkle [proof verification](https://github.com/cosmos/ibc-go/blob/main/modules/core/23-commitment/types/merkle.go). The [ICS-23 spec](https://github.com/cosmos/ibc/tree/master/spec/core/ics-023-vector-commitments) addresses how to construct membership proofs, and the [ICS-23 implementation](https://github.com/confio/ics23) currently supports Tendermint IAVL and simple Merkle proofs out of the box. Note that non-Tendermint client types may choose to handle proof verification differently:

```go
// VerifyMembership verifies the membership of a merkle proof against the given root, path, and value.
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

<HighlightBox type="info">

IBC on-chain clients can also be referred to as **light clients**. In contrast to the full nodes, which track the entire state of blockchain and contain every single tx/block, these on-chain IBC "light clients" track only the few pieces of information about counterparty chains previously mentioned (timestamp, root hash, next validator set hash). This saves space and increases the efficiency of processing consensus state updates.

The objective is to avoid a situation where it is necessary to have a copy of chain B on chain A in order to create a trustless IBC connection. However, full nodes which track the entire state of a blockchain are useful for IBC relayer operators as an endpoint to query for the proofs needed to verify IBC packet commitments. This entire process maintains the trustless, permissionless, and highly secure design of IBC. As proof verification still happens in the IBC client itself, no trust in the relayer operator is needed and anyone can permissionlessly spin up a relaying operation, provided that they have access to a full node endpoint.

</HighlightBox>

## Updating a client

Assume that the initial ConsensusState was created at block 50, but you want to submit a proof of a transaction which happened in block 100. In this case, you need to first update the ConsensusState to reflect all the changes that have happened between block 50 and block 100.

To update the `ConsensusState` of the counterparty on the client, an `UpdateClient` message containing a `Header` of the chain to be updated must be submitted by a relayer. For all IBC client types, Tendermint or otherwise, this `Header` contains the information necessary to update the `ConsensusState`. However, IBC does not dictate what the `Header` must contain beyond the basic methods for returning `ClientType` and `GetClientID`. The specifics of what each client expects as important information to perform a `ConsensusState` update will be found in each client implementation.

For example, the Tendermint client `Header` looks like [this](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/tendermint.pb.go):

```go
type Header struct {
    *types2.SignedHeader `protobuf:"bytes,1,opt,name=signed_header,json=signedHeader,proto3,embedded=signed_header" json:"signed_header,omitempty" yaml:"signed_header"`
    ValidatorSet         *types2.ValidatorSet `protobuf:"bytes,2,opt,name=validator_set,json=validatorSet,proto3" json:"validator_set,omitempty" yaml:"validator_set"`
    TrustedHeight        types.Height         `protobuf:"bytes,3,opt,name=trusted_height,json=trustedHeight,proto3" json:"trusted_height" yaml:"trusted_height"`
    TrustedValidators    *types2.ValidatorSet `protobuf:"bytes,4,opt,name=trusted_validators,json=trustedValidators,proto3" json:"trusted_validators,omitempty" yaml:"trusted_validators"`
}
```

The Tendermint `SignedHeader` is a header and commit that the counterparty chain has created. In the `UpdateClient` example, this would be the header of block 100 which will contain the timestamp of the block, the hash of the next validator set, and the root hash needed to update the `ConensusState` on record for the counterparty chain. The commit will be a signature of at least 2/3 of the validator set over that header, which is guaranteed as part of Tendermint's BFT consensus model.

`ValidatorSet` will be the actual validator set, as opposed to the hash of the next validator set stored on the `ConsensusState`. This is important for the Tendermint `UpdateClient` because, in order to preserve the Tendermint security model, it is necessary to be able to prove that at least 2/3 of the validators who signed the initial header at block 50 have signed the header to update the `ConsensusState` to block 100. This `ValidatorSet` will be submitted by the relayer as part of the `UpdateClient` message, as the relayer has access to full nodes from which this information can be extracted.

`TrustedValidators` are the validators associated with that height. Note that `TrustedValidators` must hash to the `ConsensusState` `NextValidatorsHash` since that is the last trusted validator set at the `TrustedHeight`.

The `TrustedHeight` is the height of a stored `ConsensusState` on the client that will be used to verify the new untrusted header. You can see the code that takes the `ConsensusState` at the `TrustedHeight` and uses it to verify the new header [here](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/update.go). This code proves that the submitted header is valid and creates a verified `ConsensusState` for the submitted header, as well as updating the client state to reflect the new latest height of the submitted header. This verified `ConsensusState` will be added to the client as part of the set of `ClientConsensusStates`, and can subsequently be used as a trusted state at its corresponding height.

<HighlightBox type="info">

If you want to see where `ConsensusState` is stored, see the [Interchain Standard (ICS) 24](https://github.com/cosmos/ibc/tree/master/spec/core/ics-024-host-requirements), which also describes the paths for other keys to be stored and used by IBC.

</HighlightBox>

## Verifying packet commitments

As shown in the deep dive on [channels](/academy/4-ibc/channels.md), a relayer will first submit an `UpdateClient` to update the sending chain client on the destination chain, before relaying packets containing other message types, such as ICS-20 token transfers. The destination chain can be sure that the packet will be contained in its ConsensusState root hash, and successfully verify this packet and packet commitment proof against the state contained in its (updated) IBC light client.

The code snippet which illustrates how a client [verifies an incoming packet](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint/types/client_state.go) is as follows:

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

## Next up

Now that you explored connections, channels, and clients of the transport, authentication, and ordering layer, the [next section](./token-transfer.md) takes a closer look at cross-chain fungible token transfers.
