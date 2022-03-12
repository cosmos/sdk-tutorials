---
title: "IBC Token Lifecyle"
order: 99
description: Inter-chain token transfers
tag: fast-track
---

# Lifecycle of an Inter-chain token transfer

One of topics that tends to confuse newcomers to blockchain technology and crypto assets is exact nature of coins and tokens. The terminology implies the existence of physical or logical objects. Newcomers may wonder where there objects are in physical space. 

In reality, there are only ledgers and they are non-local, which is to say they are everywhere and nowhere in particular. Protocols enforce strict rules about the state of the ledgers - rules such as only spending funds one actually has, strictly controlling or fixing the total supply, and so on. 

The *experience* of receiving and sending updates to these ledgers is so similar to that of working with cashlike instruments, and the intricacies of blockchain mechanics are sufficiently complex that these simplified terms are sufficient for most users. A user-friendly, cognitively light experience is essential to adoption. 

So, while inter-chain transfers of tokens may be described as a "token" crossing a "bridge" to arrive on another chain, deep down we know that what *must* be unfolding is a coordination of updates between two chains. 

## Design challenge

Blockchains are internally, mathematically consistent. Recall that a blockchain is an ordered set of transactions, each signed by the originator. The state of blockchain is determined by applying that set of transactions to a strict set of protocol rules. A blockchain cannot include an external reference to an external data source such as an API. If it did, then it would not be possible to *guarantee* that all properly functions nodes will always be able to eventually agree on the state.

The first challenge is that of binding two ledgers on two blockchains that and do not and cannot communicate with each other. 

Many applications *need* external signals. "Oracles" are a generalized solution to this problem. Oracles take many forms. In general, an "Oracle" is a regular account that is trusted to observe the external source, on its own, and then *sign a transaction* that injects the observation into the blockchain system. Blockchain nodes will never be able to verify that the Oracle provided accurate information, but they will be able to verify that Oracle provided a specific piece of information and signed it. 

Therefore, in systems where Oracles are relied upon for a critical input, the trustworthiness of the overall system is no greater than trust in the Oracle. Consequently, such systems tend to focus on designs that encourage strong trust in the Oracle. Generally speaking, bridges are, in part, Oracles that can observe both chains as well in sign transactions and inject information about observations into the other chain. 

Another challenge arises from differences in the way two chains operate. They may have differring block times. Even more importantly, one chain may be *probablistic* while the other is *deterministic*. Consider the following. If chain A releases tokens based on something that happened on chain B and then chain B reverted the original transaction (because chain B is probalistic and this possibility can never be completely eliminated), then a double-spend vulnerability emerges.

## Design constraints

There are obvious usabililty requirements for a successful bridge:

1. Easy to use
2. Innexpensive
3. Reasonably fast settlement time

There are economic constraints that must not be violated:

1. Does not alter the total supply or circulating supply of any token.

## Solution components

In summary, tokens that traverse the bridge are locked on the origin chain and then wrapped tokens are minted and emitted on the destination chain. A wrapped token on chain B is collateralized claim on an actual token on chain A. In reverse, wrapped tokens are redeemed and destroyed, which causes the bridge to send a signal to the other chain that causes an equal amount of collateral to be released. 

<!-- TODO: insert flow diagram --->

1. On-chain logic: Can be a Cosmos SDK Module or a smart contract (depending on which chain the component runs on). Each chain needs a component that can lock tokens in an escrow-like container and send a message to the bridge. In the reverse, it needs to receive instructions and release collateral. 
2. The Oracle: An Oracle is a highly-awailable logical singleton. High-availability implies that the *implementation* usually consists of many redundant components. An Oracle must follow a strict protocol that strongly discourages misbehaviour. After all, an Oracle malfunction could dilute the supply of a token with serious, deleterious effects on projects exposed to this risk. 

## Cosmos' Oracle solution

Cosmos introduces the concept of a Peg-Zone to reduce the uncertainty that arises from probabistic blockchains that rely on Proof-of-Work such as Ethereum. In summary, a Peg-Zone *deems* a transaction to be *final* after a certain number of confirmations.

The Oracle service is implemented as a network of independent validators. These validators place funds at risk and are incentivized to report, and slash funds staked by other validators if those other validators are observed signing incorrect information. 

Validator networks control the onchain components with strong multisignature protocols. That is to say, the on-chain components take action when an instruction is signed by a majority of the validators. This arrangement helps ensure that a maliceous validator cannot exploit the privileges that are entrusted to it. 


