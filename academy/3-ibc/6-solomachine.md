---
title: "IBC Solo Machine"
order: 7
description: Solo machine client
tags:
  - concepts
  - ibc
  - dev-ops
---

# Solo Machine Client

<HighlightBox type="learning">

In this section, you will:

* Get a high-level overview of the solo machine client and the specification for solo machines.
* Dive into how the solo machine client works.
* Learn about the benefits of using the client.
* Explore a solo machine implementation.

</HighlightBox>

IBC is the Inter-Blockchain Communication protocol, so its scope must be limited for use within blockchains right? Well, not quite. IBC was indeed conceived as a solution for interoperability between blockchains, or more generally between distributed ledgers. However, at the same time the design of the protocol aimed to be as universal and extensible as possible. It aims to **set a minimal set of requirements or interfaces a state machine must satisfy to communicate with remote counterparties**. This includes replicated state machines (i.e. blockchains), but the interfaces can also be satisfied by other data systems, such as _solo machines_.

A solo machine is a standalone process that can interact with blockchains through IBC. It can store key information, like signed messages and private keys, but has no consensus algorithm of its own. The _solo machine client_ can be seen as a verification algorithm capable of authenticating messages sent from a solo machine. With solo machines, one can access the IBC transport layer and blockchains (including features built on them) within the Interchain without developing one's own blockchain.

Anything from a web application hosted on a server, to a browser, to the mobile in your pocket is a solo machine. And these systems are capable of speaking IBC!

This is made possible using the IBC solo machine client.

<HighlightBox type="note">

Note that we are discussing two different things here. On the one hand is the solo machine, the actual standalone machine used to sign messages to interact with IBC-enabled chains (see the examples above).
<br/><br/>
On the other hand is the _solo machine client_, which is the on-chain client allowing us to verify messages _sent by_ the solo machine on a remote counterparty chain.
<br/><br/>
The solo machine itself still stores a light client representing the chain it wants to communicate with through IBC.
<br/><br/>
Make sure not to mix these up when talking about solo machines!

</HighlightBox>

## How does it work?

Unlike a typical [IBC light client](4-clients.md), which uses Merkle proofs to verify the validity of messages sent from a counterparty, a solo machine client keeps track of state by simply checking the authenticity of digital signatures.

Even though solo machines don’t have a provable consensus algorithm, they are still capable of **storing a public/private key pair and can also support multi-signature keys**.

![solomachine-overview](/academy/3-ibc/images/solomachine.png)

As an example, when blockchain A communicates with a solo machine over IBC, it registers the solo machine’s public key(s) in its (blockchain A’s) state machine through the _solo machine client_. Verifying the validity of a message sent from the solo machine is as simple as ensuring that the message was signed by its private key (as shown in Figure 1 above).

This is a significantly simpler and more cost-efficient mechanism of state verification compared to the full-fledged light client-based model.

<HighlightBox type="info">

A solo machine with a single key pair can be suitable for a PoA-like/trusted setup — applicable for various enterprise solutions. The client is also capable of updating keys, so a single key pair can be rotated on a regular basis for security. Using a threshold signature or multi-signature design offers the same security guarantees as an externally-verified bridging solution, but with the additional capability of interacting and communicating over IBC.

</HighlightBox>

## Why use a solo machine client?

There are three key benefits to using an IBC solo machine client:

1. It provides access to the IBC transport layer — and as a result, all the chains and ecosystems connected to it (as well as the features and applications built on top).
2. It removes the economic and operational overhead that comes with developing an entire blockchain in order to use IBC.
3. It is suitable to directly interoperate with chains where implementing a regular IBC light client can be complex (for example, on Ethereum due to its probabilistic finality).

The transport layer of IBC — responsible for the transport, authentication, and ordering of data packets — is a powerful standard for blockchain interoperability. It offers access to a variety of IBC applications such as token transfers, cross-chain oracle data feeds, cross-chain governance, and fee middleware, as well as features like Interchain Accounts, Interchain Queries, and more. The use of a solo machine not only grants access to this trust-minimized, general-purpose, and ever growing interoperability framework, but one can do so without even having to develop a blockchain.

Another exciting feature of using a solo machine is that it can leverage Interchain Accounts (ICA). In short, ICA allows a (controller) chain/solo machine to control an account on another (host) chain/solo machine. This opens up a plethora of interesting use-cases. For example, a solo machine acting as the controller can delegate funds to be staked on a host chain. The benefit here is that the private keys associated with the controller account (on the solo machine in this example) can be rotated without having to undelegate on the host side; instead, you update the private key on the controller and then redelegate.

The solo machine can also be used to mint/burn tokens, request and receive oracle data (by using BandChain for example), use ICA for cross-chain/machine composability, and more. Given that any IBC-level application can be leveraged by a solo machine, the possibilities are virtually endless, and up to the imagination of developers making use of this client.

<HighlightBox type="reading">

Crypto.com is the quintessential example of a centralized exchange bringing the IBC solo machine to production by issuing tokens on their public blockchain, Crypto.org. This allows Crypto.com to issue pegged DOT and XLM (Polkadot and Stellar’s native tokens respectively) which are of the ICS-20 (fungible token transfer) level. Hence the tokens can be sent to any chain that’s IBC-enabled and used within DeFi protocols.
<br/><br/>
As mentioned in [Crypto.org’s blog post](https://medium.com/crypto-org-chain/crypto-org-chain-issues-dot-token-via-ibc-solo-machine-b0f58e605b0e), _without_ an IBC solo machine an entity looking to issue tokens would be required to develop a standalone blockchain, connect it to IBC, and maintain/procure the relayer infrastructure required for system liveness. This naturally demands greater resources relative to deploying a solo machine.
<br/><br/>
Read more about Crypto.org's use of solo machines in [their docs](https://crypto.org/docs/resources/solo-machine.html).

</HighlightBox>

## Solo machine client

The ibc-go implementation contains a solo machine client, `06-solomachine`, which enables Cosmos SDK chains to interact with solo machines over IBC. In this section, a high-level overview is provided into the [specification for solo machines](https://github.com/cosmos/ibc/tree/main/spec/client/ics-006-solo-machine-client).

<HighlightBox type="docs">

The content provided here will remain high level and focused at the specification. If you wish to take a more in-depth look at the ibc-go `06-solomachine` implementation, you can refer to either [the docs](https://ibc.cosmos.network/main/ibc/light-clients/solomachine/solomachine.html) or [the code](https://github.com/cosmos/ibc-go/tree/v7.0.0/modules/light-clients/06-solomachine).

</HighlightBox>

### Solo machine client state and consensus state

If you paid close attention to the previous section on light client development and the introduction on solo machine (clients), you may already have an idea of how a solo machine implementation might look.

From the light client development section, you know that light client developers should be mainly concerned with these interfaces:

* `ClientState`
* `ConsensusState`
* `ClientMessage`

Furthermore, from the introduction you can derive that:

* The solo machine client will need access to the public key of the solo machine to verify signatures, so you would expect this to be stored in state.
* To verify the signature that a packet or client message is signed with, the client will need functionality to handle this.

<HighlightBox type="remember">

The solo machine client is a reminder of the power of the generalized client interfaces for IBC light clients. Because of it, significantly different data systems like solo machines and blockchains can still be represented through a unified interface, and therefore can communicate.
<br/><br/>
However, because a solo machine is a lot less complex than a full-fledged blockchain, you will notice that a lot of the development work for the solo machine client is simplified.

</HighlightBox>

#### `ClientState`

The `ClientSate` is rather simple. It will contain the `ConsensusState` and a field to indicate whether the client is frozen:

``` typescript
interface ClientState {
  frozen: boolean
  consensusState: ConsensusState
}
```

It must of course also implement the `ClientState` methods defined in [the spec](https://github.com/cosmos/ibc/tree/main/spec/core/ics-002-client-semantics#clientstate).

#### `ConsensusState`

Next to the public key, the `ConsensusSate` also contains a timestamp and diversifier. The diversifier is an arbitrary string, chosen when the client is created, designed to allow the same public key to be re-used across different solo machine clients (potentially on different chains) without this being considered misbehavior.

```typescript
interface ConsensusState {
  sequence: uint64 // deprecated
  publicKey: PublicKey
  diversifier: string
  timestamp: uint64
}
```

It must of course also implement the `ConsensusState` methods defined in [the spec](https://github.com/cosmos/ibc/tree/main/spec/core/ics-002-client-semantics#consensusstate).

### Verifying signatures

The essence of the solo machine/solo machine client pair is that we can verify signatures based on public/private key cryptography. The public key is stored in the `ConsensusState` of the solo machine client, and can be used to verify signatures signed with the solo machine private key corresponding to the available public key. This signature verification is used in the following situations:

* When updating the `ConsensusState` with a new public key or diversifier through submitting a `Header`.
* When submitting evidence of `Misbehaviour` to freeze a malicious client.
* When verifying packet commitments.

#### Signing data

The solo machine will sign over some data, `SignBytes`:

``` typescript
interface SignBytes {
  sequence: uint64
  timestamp: uint64
  diversifier: string
  path: []byte
  data: []byte
}
```

It also stores a `Signature` including the data bytes and a timestamp:

``` typescript
interface Signature {
  data: []byte
  timestamp: uint64
}
```

This signature is then added to a message, e.g. the `Header`:

```typescript
interface Header {
  sequence: uint64 // deprecated
  timestamp: uint64
  signature: Signature
  newPublicKey: PublicKey
  newDiversifier: string
}
```

#### Client message signature verification

Remember from the section on light client development that the client can be updated (with new state or evidence of misbehavior) by submitting a `ClientMessage`.

The `ClientMessage` will be passed onto the client by submitting a `MsgUpdateClient`. Although IBC messages are typically submitted by relayers, it can be advantageous to integrate a relayer directly into the solo machine's server in certain cases, such as with crypto.com's implementation. The `02-client`'s [`UpdateClient`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/core/02-client/keeper/client.go#L48) method will then handle the client message by using [these four methods on the `ClientState` interface](https://github.com/cosmos/ibc-go/blob/02-client-refactor-beta1/modules/core/exported/client.go#L98-L109):

* `VerifyClientMessage`
* `CheckForMisbehaviour`
* `UpdateStateOnMisbehaviour`
* `UpdateState`

You can inspect the [solo machine specification](https://github.com/cosmos/ibc/tree/main/spec/client/ics-006-solo-machine-client) for more details, but take a look at the [`verifyClientMessage`](https://github.com/cosmos/ibc/tree/main/spec/client/ics-006-solo-machine-client#validity-predicate) where a `switch` statement is used to differentiate betweeen submitting a header or evidence of misbehavior.

You will notice in both cases some pseudo code that requires to perform the signature checks:

```typescript
assert(checkSignature(cs.consensusState.publicKey, signBytes, {msgType}.signature))
```

The stored public key is used to check if the signature used to sign the `signBytes` was in fact the private key corresponding to it.

In ibc-go this is performed in the [solo machine's `proof.go` file](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/light-clients/06-solomachine/proof.go) by the `VerifySignature` function.

<ExpansionPanel title="Body of client message verification functions">

```typescript
function verifyClientMessage(clientMsg: ClientMessage) {
  switch typeof(ClientMessage) {
    case Header:
      verifyHeader(clientMessage)
    // misbehaviour only suppported for current public key and diversifier on solo machine
    case Misbehaviour:
      verifyMisbehaviour(clientMessage)
  }
}

function verifyHeader(header: header) {
  clientState = provableStore.get("clients/{clientMsg.identifier}/clientState")
  assert(header.timestamp >= clientstate.consensusState.timestamp)
  headerData = {
    newPubKey: header.newPubKey,
    newDiversifier: header.newDiversifier,
  }
  signBytes = SignBytes(
    sequence: clientState.consensusState.sequence,
    timestamp: header.timestamp,
    diversifier: clientState.consensusState.diversifier,
    path: []byte{"solomachine:header"},
    value: marshal(headerData)
  )
  assert(checkSignature(cs.consensusState.publicKey, signBytes, header.signature))
}

function verifyMisbehaviour(misbehaviour: Misbehaviour) {
  clientState = provableStore.get("clients/{clientMsg.identifier}/clientState")
  s1 = misbehaviour.signatureOne
  s2 = misbehaviour.signatureTwo
  pubkey = clientState.consensusState.publicKey
  diversifier = clientState.consensusState.diversifier
  timestamp = clientState.consensusState.timestamp
  // assert that the signatures validate and that they are different
  sigBytes1 = SignBytes(
    sequence: misbehaviour.sequence,
    timestamp: s1.timestamp,
    diversifier: diversifier,
    path: s1.path,
    data: s1.data
  )
  sigBytes2 = SignBytes(
    sequence: misbehaviour.sequence,
    timestamp: s2.timestamp,
    diversifier: diversifier,
    path: s2.path,
    data: s2.data
  )
  // either the path or data must be different in order for the misbehaviour to be valid
  assert(s1.path != s2.path || s1.data != s2.data)
  assert(checkSignature(pubkey, sigBytes1, misbehaviour.signatureOne.signature))
  assert(checkSignature(pubkey, sigBytes2, misbehaviour.signatureTwo.signature))
}
```

</ExpansionPanel>

#### State signature verification

Similarly, to verify if the signature that signed a state transition is valid, remember that a light client has to implement `VerifyMembership` and `VerifyNonMembership` methods.

There you will find similar pseudo code relating to signature verification:

```typescript
proven = checkSignature(clientState.consensusState.publicKey, signBytes, proof.sig)
```

In ibc-go this is performed in the [solo machine's `proof.go` file](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/light-clients/06-solomachine/proof.go) by the `VerifySignature` function.

<ExpansionPanel title="Body of state verification functions">

```typescript
function verifyMembership(
  clientState: ClientState,
  // provided height is unnecessary for solo machine
  // since clientState maintains the expected sequence
  height: uint64,
  // delayPeriod is unsupported on solo machines
  // thus these fields are ignored
  delayTimePeriod: uint64,
  delayBlockPeriod: uint64,
  proof: CommitmentProof,
  path: CommitmentPath,
  value: []byte
): Error {
  // the expected sequence used in the signature
  abortTransactionUnless(!clientState.frozen)
  abortTransactionUnless(proof.timestamp >= clientState.consensusState.timestamp)
  signBytes = SignBytes(
    sequence: clientState.consensusState.sequence,
    timestamp: proof.timestamp,
    diversifier: clientState.consensusState.diversifier,
    path: path.String(),
    data: value,
  )
  proven = checkSignature(clientState.consensusState.publicKey, signBytes, proof.sig)
  if !proven {
    return error
  }

  // increment sequence on each verification to provide
  // replay protection
  clientState.consensusState.sequence++
  clientState.consensusState.timestamp = proof.timestamp
  // unlike other clients, we must set the client state here because we
  // mutate the clientState (increment sequence and set timestamp)
  // thus the verification methods are stateful for the solo machine
  // in order to prevent replay attacks
  provableStore.set("clients/{identifier}/clientState", clientState)
  return nil
}

function verifyNonMembership(
  clientState: ClientState,
  // provided height is unnecessary for solo machine
  // since clientState maintains the expected sequence
  height: uint64,
  // delayPeriod is unsupported on solo machines
  // thus these fields are ignored
  delayTimePeriod: uint64,
  delayBlockPeriod: uint64,
  proof: CommitmentProof,
  path: CommitmentPath
): Error {
  abortTransactionUnless(!clientState.frozen)
  abortTransactionUnless(proof.timestamp >= clientState.consensusState.timestamp)
  signBytes = SignBytes(
    sequence: clientState.consensusState.sequence,
    timestamp: proof.timestamp,
    diversifier: clientState.consensusState.diversifier,
    path: path.String(),
    data: nil,
  )
  proven = checkSignature(clientState.consensusState.publicKey, signBytes, proof.sig)
  if !proven {
    return error
  }

  // increment sequence on each verification to provide
  // replay protection
  clientState.consensusState.sequence++
  clientState.consensusState.timestamp = proof.timestamp
  // unlike other clients, we must set the client state here because we
  // mutate the clientState (increment sequence and set timestamp)
  // thus the verification methods are stateful for the solo machine
  // in order to prevent replay attacks
  provableStore.set("clients/{identifier}/clientState", clientState)
  return nil
}
```

</ExpansionPanel>

## Practical example

Ready to experiment?

Crypto.org is the main user of solo machines up to this point and has an implementation in their [stag repo](https://github.com/devashishdxt/stag) which you can check out for yourself.

<HighlightBox type="docs">

There is also a tutorial that runs both a solo machine (based on the stag repo from above) and a simple Cosmos SDK chain that shows a solo machine walkthrough. You can follow along [here](https://github.com/cosmos/ibc-go/wiki/IBC-solo-machine).

</HighlightBox>

## Conclusion

IBC offers a unique and powerful framework for trust-minimized interoperability, and the impressive growth since its genesis is a testament to its security, composability, and extensibility.

While implementing light clients has been the standard design to plug into IBC, the options are not limited to this one method, and the solo machine (and client) offers an alternative to implementing IBC light clients. Given its simple proof verification method, the solo machine client is considerably easier to deploy from an engineering standpoint, and an effective solution in deployment scenarios where other potential concerns (eg. security) are mitigated by design.

In conclusion, having access to IBC offers a host of benefits, but it is equally important to facilitate ease of access to IBC as much as possible. On this latter point, the solo machine client offers one of the best solutions available today.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* A solo machine is a standalone process that can interact with blockchains through IBC.
* It can store key information but has no consensus algorithm of its own.
* The ibc-go implementation contains a solo machine client enabling Cosmos SDK chains to interact with solo machines over IBC.
* The benefits of using the solo machine client.
* The implementation of solo machines.

</HighlightBox>
