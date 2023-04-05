---
title: "Light Client Development"
order: 0
description: Develop light clients
tags:
  - concepts
  - ibc
  - dev-ops
---

# Light Client Development

<!-- A short intro to the topic of light client development, further info will be found in ibc-go docs.
    Pre-requisites are the IBC intro + Clients section before
 -->

<HighlightBox type="learning">

In this section, you will learn:

* Why we need extra light clients being developed
* What light client developers need to do and where to find documentation
* How to get a new light client on your chain

</HighlightBox>

## IBC ecosystem expansion

IBC was envisioned from the original Cosmos whitepaper to be a crucial component of the appchain thesis for the Cosmos network on the one hand, but more importantly also remain as universal as possible to enable it to become a universal standard with respect to blockchain interoperability.

Whereas the protocol always envisioned the wider adoption of IBC, the ibc-go implementation initially was focused on its use within Cosmos SDK chains connecting to similar chains. The [ibc-go v7 release](https://github.com/cosmos/ibc-go/releases/tag/v7.0.0) included a refactor to the `02-client` submodule, which should streamline the development of light clients to connect to chains with other consensus than `07-tendermint`, to ibc-go.

<HighlightBox type="docs">

In this section, it's assumed that the version of ibc-go is >v7. For more information about the changes and the motivation, please refer to this [blog post](https://medium.com/the-interchain-foundation/client-refactor-laying-the-groundwork-for-ibc-to-expand-across-ecosystems-61ec5a1b63bc) or [ADR-006](https://github.com/cosmos/ibc-go/blob/main/docs/architecture/adr-006-02-client-refactor.md) on the topic of the client refactor.

</HighlightBox>

## Light client development high-level overview

<HighlightBox type="reading">

The development of a light client for heterogeneous chains is a complex topic and outside of the scope presented here. Light client developers are urged to instead refer to [the light client developer guide](https://ibc.cosmos.network/main/ibc/light-clients/overview.html) in the ibc-go documentation.

</HighlightBox>

### Recap: what does a light client do?

A short and succinct **summary of a light client's functionality** is the following: a light client stores a trusted consensus state and provides functionality to verify updates to the consensus state or verify packet commitments against the trusted root by using Merkle proofs.

### Interfaces

Access to IBC light clients are gated by the core IBC `MsgServer` which utilizes the abstractions set by the `02-client` submodule to call into a light client module. A light client module developer is only required to implement a set interfaces as defined in the `modules/core/exported` package of ibc-go.

A light client module developer should be concerned with three main interfaces:

* [`ClientState`](https://github.com/cosmos/ibc-go/blob/02-client-refactor-beta1/modules/core/exported/client.go#L36) contains all the information needed to verify a `ClientMessage` and perform membership and non-membership proof verification of counterparty state. This includes properties that refer to the remote state machine, the light client type and the specific light client instance.
* [`ConsensusState`](https://github.com/cosmos/ibc-go/blob/02-client-refactor-beta1/modules/core/exported/client.go#L134) tracks consensus data used for verification of client updates, misbehaviour detection and proof verification of counterparty state.
* [`ClientMessage`](https://github.com/cosmos/ibc-go/blob/02-client-refactor-beta1/modules/core/exported/client.go#L148) used for submitting block headers (single or batch) for client updates and submission of misbehaviour evidence using conflicting headers.

### Handling client messages

The light client can be updated by handling the aforementioned `ClientMessage`. This will either be an update to the `ConsensusState` through verification of a single or multiple batched header(s) on one hand. On the other hand it could be evidence of misbehaviour which if it is confirmed, will result in the client getting frozen for security reasons. 

The `ClientMessage` will be passed onto the client through a `MsgUpdateClient` submitted (generally by a relayer). The `02-client`'s [`UpdateClient`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/02-client/keeper/client.go#L48) method will then handle the client message by using [these 4 methods on the `ClientState` interface](https://github.com/cosmos/ibc-go/blob/02-client-refactor-beta1/modules/core/exported/client.go#L98-L109):

* VerifyClientMessage
* CheckForMisbehaviour
* UpdateStateOnMisbehaviour
* UpdateState

For the full explanation, please refer to [the docs](https://ibc.cosmos.network/main/ibc/light-clients/updates-and-misbehaviour.html).

<HighlightBox type="info">

You'll note that the `ClientState` interface also contains the following methods:

* VerifyUpgradeAndUpdateState
* CheckSubstituteAndUpdateState

These similarly provide functionality to update the client based on handling message but they cover the less frequent case of, respectively:

* upgrading the light client when the remote chain it's representing upgrades (read the docs [here](https://ibc.cosmos.network/main/ibc/light-clients/upgrades.html)) 
* updating the client with the state of a substitute client (following a client being expired) through a governance proposal, read the docs [here](https://ibc.cosmos.network/main/ibc/light-clients/proposals.html)

</HighlightBox>

### Packet commitment verification

