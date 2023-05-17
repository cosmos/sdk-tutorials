---
title: "Light Client Development"
order: 6
description: Develop light clients
tags:
  - concepts
  - ibc
---

# Light Client Development

<!--
A short intro to the topic of light client development, further info will be found in ibc-go docs.
Pre-requisites are the IBC intro + Clients section before
 -->

<HighlightBox type="learning">

In this section, you will learn:

* Why we need extra light clients to be developed
* What light client developers need to do, and where to find documentation
* How to get a new light client on your chain

</HighlightBox>

## IBC ecosystem expansion

IBC was envisioned in the original Cosmos whitepaper to be both a crucial component of the appchain thesis for the Interchain network and also a generic and universally applicable standard with respect to blockchain interoperability.

Whereas the protocol always envisioned the wider adoption of IBC, the ibc-go implementation initially was focused on its usage in Cosmos SDK chains connecting to similar chains. In order to expand IBC to other chain ecosystems, the [ibc-go v7 release](https://github.com/cosmos/ibc-go/releases/tag/v7.0.0) included a refactor to the `02-client` submodule, which should streamline the development of light clients to connect ibc-go to chains with other consensus than `07-tendermint`.

<HighlightBox type="docs">

In this section, it's assumed that the version of ibc-go is >= v7. For more information about the changes and the motivation, please refer to this [blog post](https://medium.com/the-interchain-foundation/client-refactor-laying-the-groundwork-for-ibc-to-expand-across-ecosystems-61ec5a1b63bc) or [ADR-006](https://github.com/cosmos/ibc-go/blob/main/docs/architecture/adr-006-02-client-refactor.md) on the topic of the client refactor.

</HighlightBox>

## Light client development high-level overview

<HighlightBox type="reading">

The development of a light client for heterogeneous chains is a complex topic, and is outside of the scope presented here. Light client developers are urged to instead refer to [the light client developer guide](https://ibc.cosmos.network/main/ibc/light-clients/overview.html) in the ibc-go documentation.

</HighlightBox>

### Recap: what does a light client do?

A short and succinct **summary of a light client's functionality** is the following: a light client stores a trusted consensus state, and provides functionality to verify updates to the consensus state or verify packet commitments against the trusted root by using Merkle proofs.

### Major interfaces

Access to IBC light clients are gated by the core IBC `MsgServer`, which utilizes the abstractions set by the `02-client` submodule to call into a light client module. A light client module developer is only required to implement a set of interfaces as defined in the `modules/core/exported` package of ibc-go.

A light client module developer should be concerned with three main interfaces:

* [`ClientState`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/exported/client.go#L36) contains all the information needed to verify a `ClientMessage` and perform membership and non-membership proof verification of the counterparty state. This includes properties that refer to the remote state machine, the light client type, and the specific light client instance.
* [`ConsensusState`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/exported/client.go#L133) tracks consensus data used for verification of client updates, misbehavior detection, and proof verification of the counterparty state.
* [`ClientMessage`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/exported/client.go#L147) is used for submitting block headers (single or batch) for client updates, and submission of misbehavior evidence using conflicting headers.

### Handling client messages

The light client can be updated by handling the aforementioned `ClientMessage`. This will either be an update to the `ConsensusState` through verification of a single header or multiple batched headers, or it could be evidence of misbehavior which (if confirmed) will result in the client getting frozen for security reasons.

The `ClientMessage` will be passed onto the client through a `MsgUpdateClient` (generally submitted by a relayer). The `02-client`'s [`UpdateClient`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/02-client/keeper/client.go#L48) method will then handle the client message by using [these 4 methods on the `ClientState` interface](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/exported/client.go#L98-L109):

* `VerifyClientMessage`
* `CheckForMisbehaviour`
* `UpdateStateOnMisbehaviour`
* `UpdateState`

For the full explanation, please refer to [the docs](https://ibc.cosmos.network/main/ibc/light-clients/updates-and-misbehaviour.html).

<HighlightBox type="note">

You will note that the `ClientState` interface also contains the following methods:

* `VerifyUpgradeAndUpdateState`
* `CheckSubstituteAndUpdateState`

These similarly provide functionality to update the client based on handling messages but they cover the less frequent cases of, respectively:

* Upgrading the light client when the remote chain it is representing upgrades (read the docs [here](https://ibc.cosmos.network/main/ibc/light-clients/upgrades.html)).
* Updating the client with the state of a substitute client (following a client being expired) through a governance proposal (read the docs [here](https://ibc.cosmos.network/main/ibc/light-clients/proposals.html)).

</HighlightBox>

<HighlightBox type="info">

Prior to the client refactor (prior to v7) the client and consensus states are set within the `02-client` submodule. Moving these responsibilities from the `02-client` to the individual light client implementations (including the setting of updated client state and consensus state in the client store) provides light client developers with a greater degree of flexibility with respect to storage and verification, and allows for the abstraction of different types of consensus states/consensus state verification methods away from IBC clients and the connections/channels that they support.

</HighlightBox>

### Packet commitment verification

In addition to updating the client and consensus state, the light client also provides functionality to perform the verification required for the packet flow (send, receive, and acknowledge or timeout). IBC currently uses Merkle proofs to verify against the trusted root if state is either committed or absent on a predefined standardized key path, as defined in [ICS-24 host requirements](https://github.com/cosmos/ibc/tree/main/spec/core/ics-024-host-requirements).

As you have seen in the [previous section on clients](./4-clients.md), when the IBC handler receives a message to receive, acknowledge, or timeout a packet, it will call one of the following functions on the `connectionKeeper` to verify if the remote chain includes (or does not include) the appropriate state:

* [`VerifyPacketCommitment`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/03-connection/keeper/verify.go#L205) checks if the proof added to a `MsgRecvPacket` submitted to the destination points to a valid packet commitment on the source.
* [`VerifyPacketAcknowledgement`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/03-connection/keeper/verify.go#L250) checks if the proof added to a `MsgAcknowledgePacket` submitted to the source points to a valid packet receipt commitment on the destination.
* [`VerifyPacketReceiptAbsence`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/03-connection/keeper/verify.go#L296) checks if the proof added to a `MsgTimeout` submitted to the source proves that a packet receipt is absent at a height beyond the timeout height on the destination.

All of the above rely on either `VerifyMembership` or `VerifyNonMembership` methods to prove either inclusion (also referred to as _existence_) or non-inclusion (_non-existence_) at a given commitment path.

It is up to the light client developer to add these methods to their light client implementation.

<HighlightBox type="reading">

Please refer to the [ICS-23 implementation](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/23-commitment/types/merkle.go#L131-L205) for a concrete example.

</HighlightBox>

### Add light client to Cosmos SDK chain

Suppose that you have managed to develop a light client implementation fulfiling the requirements described above. How do you now get the light client on chain?

This will depend on the chain environment you are in, so from here on the assumption will be made that you want to add the light client module to a Cosmos SDK chain, in order for the Cosmos SDK chain that you are interacting with to be able to verify proofs of the consensus state coming from your non-`07-tendermint` chain.

For example, if you are developing a light client which enables proof verification of ETH2 or Solana, you would need to deploy a light client that is able to verify proofs of ETH2 or Solana consensus state on Cosmos SDK chains which you want to interoperate with.

#### Configure light client module

You will be adding your light client as an SDK module which must implement the SDK's [`AppModuleBasic`](https://github.com/cosmos/cosmos-sdk/blob/main/types/module/module.go#L50) interface.

You must then register your light client module with `module.BasicManager` in the chain's `app.go` file.

More information can be found [here](https://ibc.cosmos.network/main/ibc/light-clients/setup.html#configuring-a-light-client-module).

#### Get support through governance

In order to successfully create an IBC client using a new client type, it [must be supported](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/02-client/keeper/client.go#L19-L25). Light client support in IBC is gated by on-chain governance. The allow list may be updated by submitting a new governance proposal to update the `02-client` parameter `AllowedClients`.

<HighlightBox type="info">

To add your light client `0x-new-client` to `AllowedClients`, submit a proposal:

```sh
$ ... tx gov submit-legacy-proposal \
  param-change <path/to/proposal.json> \
  --from=<key_or_address>
```

where `proposal.json` contains:

```json
{
  "title": "IBC Clients Param Change",
  "description": "Update allowed clients",
  "changes": [
    {
      "subspace": "ibc",
      "key": "AllowedClients",
      "value": ["06-solomachine", "07-tendermint", "0x-new-client"]
    }
  ],
  "deposit": "1000stake"
}
```

</HighlightBox>

#### Create client instances

When the governance proposal has passed, relayers can create client instances by submitting a `MsgCreateClient` as described in [the previous section on IBC light clients](./4-clients.md#creating-a-client).

And there you have it: you have contributed to the expansion of IBC to other ecosystems!

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How the development of IBC light clients is crucial to the expansion of IBC into other ecosystems, to connect them to the Interchain.
* Where to find the required documentation in the form of a _light client developer guide_ if you need to develop a light client.
* What the most important interfaces are: client and consensus state and client messages.
* How a client can get updates.
* How a client can verify packets against its trusted root using Merkle proofs.

</HighlightBox>
