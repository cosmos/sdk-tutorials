---
title: "IBC Token Lifecycle"
order: 99
description: Inter-chain token transfers
tag: fast-track
---

# IBC Token Lifecycle

A topic that tends to confuse newcomers to blockchain technology and crypto assets is the exact nature of coins and tokens. The terminology implies the existence of physical or logical objects. Newcomers may wonder where their objects are in the physical space.

In reality, there are only ledgers and they are non-local, which is to say they are everywhere and nowhere in particular. Protocols enforce strict rules about the state of the ledgers - rules such as only spending funds one has, strictly controlling or fixing the total supply, and so on.

The *experience* of receiving and sending updates to these ledgers is so similar to that of working with cash-like instruments, and the intricacies of blockchain mechanics are sufficiently complex that these simplified terms are sufficient for most users. A user-friendly, cognitively-light experience is essential to adoption.

So, while cross-chain transfers of tokens may be described as a "token" crossing a "bridge" to arrive on another chain, deep down every cross-chain token transfer boils down to coordinating ledger updates between both chains involved.

## Design challenge

Blockchains are internally, mathematically consistent. Recall that a blockchain is an ordered set of transactions, each signed by the originator. The state of blockchain is determined by applying that set of transactions to a strict set of protocol rules. A blockchain cannot include an external reference to an external data source such as an API. If it did, then it would not be possible to *guarantee* that all properly functioning nodes will always be able to eventually agree on the state.

The first challenge is that of binding two ledgers on two blockchains that do not and cannot communicate with each other.

Many applications *need* external signals. "Oracles" are a generalized solution to this problem. Oracles take many forms. In general, an oracle is a regular account that is trusted to observe an external source, on its own, and then *sign a transaction* that injects the observation into the blockchain system. Blockchain nodes will never be able to verify that the oracle provided accurate information, but they will be able to verify that an oracle provided a specific piece of information and signed it.

Therefore, in systems where oracles are relied upon for critical input, the trustworthiness of the overall system is no greater than trust in the oracle. Consequently, such systems tend to focus on designs that encourage strong trust in the oracle. Generally speaking, bridges are in part oracles that can observe both chains, as well as sign transactions, and inject information about observations into chains.

Another challenge arises from differences in the way two chains operate. They may have differing block times. Even more importantly, one chain may be *probabilistic* while the other is *deterministic*. Consider the following: if chain A releases tokens based on something that happened on chain B and then chain B reverted the original transaction because chain B is probabilistic and this possibility can never be completely eliminated, then a double-spend vulnerability emerges.

## Design constraints

There are obvious usability requirements for a successful bridge:

1. Easy to use
2. Inexpensive
3. Reasonably fast settlement time

There are economic constraints that must not be violated: does not alter the total supply or circulating supply of any token.

## Solution components

In summary, tokens that traverse the bridge are locked on the origin chain, and then wrapped tokens are minted and emitted on the destination chain. A wrapped token on chain B is a collateralized claim on an actual token on chain A. In reverse, wrapped tokens are redeemed and destroyed, which causes the bridge to send a signal to the other chain that causes an equal amount of collateral to be released.

<!-- TODO: insert flow diagram --->

* On-chain logic: can be a Cosmos SDK module or a smart contract depending on which chain the component runs on. Each chain needs a component that can lock tokens in an escrow-like container and send a message to the bridge. In the reverse, it needs to receive instructions and release collateral.
* The oracle: an oracle is a highly-available logical singleton. High availability implies that the *implementation* usually consists of many redundant components. An oracle must follow a strict protocol that strongly discourages misbehavior. After all, an oracle malfunction could dilute the supply of a token with serious, deleterious effects on projects exposed to this risk.

Together, the two sides of the on-chain logic and the oracle form a bridge. Before the Inter-Blockchain Communication (IBC) Protocol, it was not possible to generalize a bridge solution that would connect any chain to any other chain or allow assets to flow freely between them. While non-Cosmos chains do indeed require customized implementation to become compatible, Cosmos' bridge solution presents the architecture to make this possible. The Gravity bridge is one such implementation that connects Ethereum ERC-20 tokens with Cosmos blockchains.

## Cosmos' oracle solution

Cosmos introduces the concept of a peg-zone to reduce the uncertainty that arises from probabilistic blockchains that rely on Proof-of-Work such as Ethereum. In summary, a peg-zone *deems* a transaction to be *final* after a certain number of confirmations.

The oracle service is implemented as a network of independent validators. These validators place funds at risk and are incentivized to report, and slash funds staked by other validators if those other validators are observed signing incorrect information.

Validator networks control the on-chain components with strong multi-signature protocols. That is to say, the on-chain components take action when an instruction is signed by a majority of the validators. This arrangement helps ensure that a malicious validator cannot exploit the privileges that are entrusted to it.
