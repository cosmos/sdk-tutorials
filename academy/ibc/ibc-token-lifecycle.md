---
title: "IBC Token Lifecycle"
order: 99
description: IBC token transfers
tag: fast-track
---

# IBC Token Lifecycle

IBC enables the transfer of tokens from one Cosmos chain to another, or even to and from other blockchains that are not based on Cosmos SDK. Let us clarify what this means. 

Recall that a blockchain is an ordered set of transactions, each signed by the originator. The state of that blockchain is determined by applying a strict set of protocol rules to an ordered set of transactions. Blockchains are internally consistent but their protocols never include external observations. If a blockchain protocol accomodated external observations, such as an API response, then it would not be possible to *guarantee* that all properly functioning nodes will always be able to eventually agree on the state.

Since separate chains don't communicate naturally, moving tokens between chains calls for a special protocol that coordinates the states of separate ledgers. Such a protocol must be secure. In particular, it must not re-introduce the possibility of double-spending.

Inter-Blockchain protocol, or IBC, is such a protocol. 

## Design challenge

To help unfold how IBC works, let us consider the challenges it addresses. 

The first challenge is that of binding two ledgers on two blockchains that do not and cannot communicate with each other. 

Another challenge arises from differences in the way two chains operate. They may have differing block times. Even more importantly, one chain may be *probabilistic* while the other is *deterministic*. Consider the following: Chain A releases tokens based on something that happened on chain B and then chain B reverted the original transaction because chain B is probabilistic. A double-spend vulnerability would emerge.

<!--
## Design constraints

There are usability requirements for a successful cross-chain protocol:

1. Easy to use
2. Inexpensive
3. Reasonably fast settlement time

There are economic constraints that must not be violated:

1. Does not alter the total supply or circulating supply of any token.
2. No double-spending

Protocols that aim to address these requirements are commonly referred to as bridges because they allow tokens and value to cross over from one blockchain to another. Bridges have multiple components that include on-chain logic and an oracle. Oracles are capable of listening to one chain and injecting signed transactions about those observations into another chain. 
-->

## Solution components

In summary, tokens that traverse a bridge are locked on the origin chain, and then wrapped tokens are minted and emitted on the destination chain. A wrapped token on chain B is a collateralized claim on an actual token on chain A. In reverse, wrapped tokens are redeemed and destroyed, which causes the bridge's oracle component to send a signal to the other chain that causes an equal amount of collateral to be released.

<!-- TODO: insert flow diagram --->

<HighlightBox type="info">
In blockchain terminology, an oracle is a regular account that can send transactions to commit information to a blockchain. Oracles are usually granted special permission in blockchain systems. For example, they may be the only entity that can inject a price quote from an external source. Oracles are usually rely on automated processes. They are a solution to the challenge of working with external information in blockchain applications. 

Token bridges and IBC relays are oracle-like in nature. They inform blockchains about important development on other chains. 
</HighlightBox>

* On-chain logic: can be a Cosmos SDK module or a smart contract depending on which chain the component runs on. Each chain needs a component that can lock tokens in an escrow-like container and send a message to the bridge. In the reverse, it needs to receive instructions and release collateral.
* The oracle: an oracle is a highly-available logical singleton. High availability implies that the *implementation* usually consists of many redundant components. IBC implements oracle functions as a network of validators called relay nodes. Validator networks control the on-chain components with strong multi-signature protocols, incentives and financial penalties for erroneous actions, all of which help ensure correct operation of individual relays and the protocol generally.

<HighlightBox type="info">
An oracle acting as a token relay must follow a strict protocol that strongly discourages misbehavior. After all, an oracle malfunction (or malfeasance) could dilute the supply of a token with serious, deleterious effects on projects exposed to this risk. Therefore, the IBC design emphasizes strict security. 
<HighlightBox>

Together, the two sides of the on-chain logic and the relays form a bridge. Before the Inter-Blockchain Communication (IBC) Protocol, it was not possible to generalize a bridge solution that would connect any chain to any other chain or allow assets to flow freely between them. While non-Cosmos chains do indeed require customized implementations to achieve compatibility with IBC, Cosmos' bridge solution presents the architecture to make this possible. The Gravity bridge is one such implementation that connects Ethereum ERC-20 tokens with Cosmos blockchains.

## Bridging Cosmos chains

If both chains are based on Cosmos SDK, then tokens flow freely between the chains provided the chains are connected by one or more relay nodes. This enables Cosmos SDK applications to work with tokens that were created elsewhere. This is particularly important in the case of Cosmos SDK applications because each token is likely to originate from a separate, purpose-built blockchain. 

## Cosmos' oracle solution

<HighlightBox type="info">
* **Deterministic:** Transactions proceed through a finalization process, afterwhich they are irreversible. Deterministic consensus mechanisms provide strong transaction finality because there is no way to reverse or revise a previously finalized transaction. 
* **Probalistic:** Confidence in observed transactions increases over time. Absolute finality is never achieved but the probability of a reversal decreases exponentially to near zero.
</HighlightBox>

Cosmos SDK applications can also work with tokens that originate on other chains such as Ethereum. Onchain components are deployed on the other chain, and if the other chain is probalistic (e.g. relies on Proof-of-Work consensus), the creation of a so-called peg-zone. 

Peg-zones reduce the uncertainty that arises from probabilistic blockchains that rely on Proof-of-Work. In summary, a peg-zone *deems* a transaction to be *final* after a certain number of confirmations.

IBC defines a standard interface. Both deterministic and probalistic (using peg-zones) non-Cosmos chains can be made compatible with IBC by implementing the interface. The Gravity bridge for Ethereum, for example, implements the IBC compatibility using the smart contract. 

Read on to discover how this works in more detail and to practice incorporating IBC into Cosmos SDK applications. 
