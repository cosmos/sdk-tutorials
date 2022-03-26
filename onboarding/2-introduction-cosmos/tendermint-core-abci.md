---
title: "Cosmos Ecosystem I"
order: 3
description: Tendermint Core and ABCI
tag: fast-track
---

# The Cosmos Ecosystem

**Cosmos** is a network of independent blockchains, which are:

* All powered by consensus algorithms with Byzantine Fault-Tolerance (BFT).
* All connected through the Inter-Blockchain Communication Protocol (IBC), which enables value transfers/token transfers and other communication between chains, all without the need to involve exchanges or make compromises regarding the chains' sovereignties.

Cosmos is also **a blockchain ecosystem** complete with protocols, SDK, tokens, wallets, applications, repositories, services and tools.



## What is Tendermint?

Created in 2014, [Tendermint](https://tendermint.com/) accelerates the development of distinct blockchains by providing a ready-made networking and consensus solution. Networking and consensus do not have to be recreated by developers for each case. You may already be using Tendermint without being aware of it as other blockchains like [Hyperledger Burrow](https://hyperledger.github.io/burrow/#/) and the [Binance Chain](https://www.binance.org/en/smartChain) use Tendermint.

Tendermint modules **attend to consensus and networking**. These are two important components of any blockchain. This frees developers to focus on the application level without descending into lower-level blockchain concerns such as peer discovery, block propagation, consensus, and transaction finalization. Without Tendermint, developers would be forced to build software to address these concerns which would add additional time, complexity, and cost to the development of their applications.

![Blockchain application architecture overview](/architecture_overview.png)

A blockchain node for an application-focused Cosmos blockchain consists of a state-machine, built with the Cosmos SDK, and the consensus and networking layer, which are handled by the [Tendermint Core](https://tendermint.com/core/).

<ExpansionPanel title="What is the Tendermint Core?">

The Tendermint Core is a blockchain application platform. Tendermint Core supports state machines in any language. The language-agnostic Tendermint Core helps developers securely and consistently replicate deterministic, finite state machines.

Tendermint BFT is maintained even when 1/3 of all machines fail by providing two components:

* A blockchain consensus engine
* A generic application interface

Want to continue exploring this useful component of the Cosmos SDK? You can find further information beneath under _Consensus in Tendermint Core and Cosmos_ or in the [Tendermint Core documentation](https://docs.tendermint.com/master/#).

</ExpansionPanel>

## Consensus in Tendermint Core and Cosmos

The Tendermint Core is a high-performance, consistent, flexible, and secure **consensus** module with strict fork accountability. It relies on Proof-of-Stake (PoS) with delegation and [Practical Byzantine Fault Tolerance](https://github.com/tendermint/tendermint). Participants signal support for well-behaved, reliable nodes that create and confirm blocks. Users signal support by staking ATOM or the native token of the respective chain. Staking bears the possibility of acquiring a share of the network transaction fees, but also the risk of reduced returns or even losses should the node become unreliable.

Network participants are incentivized to stake their ATOM with nodes, which are the most likely to provide dependable service, and to withdraw their support should conditions change. A Cosmos blockchain is expected to adjust the validator configuration and continue even in adverse conditions.

Only the top 150 nodes by staked ATOM participate in the transaction finalization process as **validators**. The privilege of creating a block is awarded in proportion to the voting power a validator has. **Voting power** is calculated as all ATOM tokens staked by a validator and its delegates. For example, if a given validator's voting power is 15% of the total voting power of all validators, then the validator can expect to receive the block creation privilege 15% of the time.

The block is broadcast to the other validators, who are expected to respond promptly and correctly:

* Validators confirm candidate blocks.
* Validators absorb penalties for failing to do so.
* Validators can and must reject invalid blocks.
* Validators accept the block by returning their signature.

When sufficient signatures have been collected by the block creator the block is finalized and broadcast to the wider network. There is no ambiguity in this process: either a block has the necessary signatures or it does not. If it does, insufficient signatories exist to overturn the block and the block can be understood as **finalized** - there is no process in which the blockchain would be reorganized. This provides a level of certainty when it comes to transaction finality that a probabilistic system like Proof-of-Work (PoW) cannot match.

Aggressive block times are feasible because the process is aimed at high performance and is based on dedicated validators with good network connectivity. This is quite different from PoW, which favors inclusion and must accommodate slower nodes with greater latency and less reliability. A Cosmos blockchain can handle thousands of transactions per second with confirmations taking seven seconds.

Even though validation is delegated to a subset of all network nodes, the process avoids the concentration of power. The community of users elects the validators by staking ATOM and participating in both the rewards and the risks of committing to providing a reliable, responsible block validation service.

## Upgradeability of chains

In any known blockchain, a change in the implementation requires an upgrade to the node software running on each node. In a disorderly process with voluntary participation, this can result in a hard fork - a situation in which one constituency forges ahead with the old rules and another adopts new rules. While this arrangement has positive aspects and proponents, it also has clear disadvantages in settings where **certainty** is a strict requirement. For example, uncertainty about transaction finality regardless of the degree of uncertainty may be unacceptable in settings that are concerned with authoritative registries and large assets.

In a Tendermint blockchain transactions are irreversibly finalized upon block creation and upgrades are themselves governed by the block creation and validation process. This leaves no room for uncertainty. Either the nodes agree to simultaneously upgrade their protocol, or the upgrade proposal fails.

Validators are the ones who vote. This means that delegators should be demanding when delegating as they also lend their vote to the validator.

## Application Blockchain Interface (ABCI)

[Tendermint BFT](https://tendermint.com/core/) packages the networking and consensus layers of a blockchain and presents an interface to the application layer, the **Application Blockchain Interface (ABCI)**. Developers can focus on higher-order concerns while delegating peer-discovery, validator selection, staking, upgrades, and consensus to the Tendermint BFT. The consensus engine running in one process controls the state machine, the application runs in another process. The architecture is equally appropriate for **private or public blockchains**.

The Tendermint BFT engine is connected to the application by a socket protocol. ABCI provides a socket for applications written in other languages. When the application is written in the same language as the Tendermint implementation, the socket is not used.

![The application, ABCI, and Tendermint](/ABCI_3.png)

The Tendermint BFT provides security guarantees, including:

* **Forks** are never created, provided that half or more validators are honest.
* **Strict accountability** for fork creation allows determining liability.
* Transactions are **finalized** as soon as a block is created.

The Tendermint BFT is not concerned with the interpretation of transactions. That would be the application layer. Tendermint presents confirmed, well-formed transactions and blocks of transactions agnostically. Tendermint is un-opinionated about the meaning transactions have.

The _block time_ is approximately seven seconds and blocks may contain thousands of transactions. Transactions are finalized and cannot be overturned as soon as they appear in a block.

<HighlightBox type="info">

For a deeper dive on consensus and Tendermint visit:

* the [podcast on consensus systems](https://softwareengineeringdaily.com/2018/03/26/consensus-systems-with-ethan-buchman/) with Ethan Buchman
* the [Tendermint Core documentation on consensus](https://docs.tendermint.com/master/introduction/what-is-tendermint.html#consensus-overview)

</HighlightBox>

There are at least two broad **approaches to application-level concerns** using blockchains:

1. Create an application-specific blockchain where everything that can be done is defined in the protocol.
2. Create a programmable state machine and push application concerns to a higher level, such as bytecode created by compilers interpreting higher-level languages.

Ethereum-like blockchains are part of the second category. Only the state machine is defined in the on-chain protocol, which defines the rules of contract creation, interaction, execution, and little else.

This method is not without its limitations:

* Very little is universally defined: standards for basic concerns such as tokens emerge organically through voluntary participation.
* Contracts can and do contain repetitive code that may or may not correctly implement the developer's intentions.
* The inherent flexibility makes it challenging to reason about what is correct or even what is friendly.
* There are practical limits to the complexity of operations, which are very low compared to what is possible in other settings.

These limitations make it especially difficult to perform analysis or reorganize data, and developers are forced to adapt to the constraints.

A **purpose-built or application-specific blockchain** is different. There is no need to present a "Turing-complete" language or a general-purpose, programmable state machine because application concerns are addressed by the protocol the developers create.

Developers who have worked with blockchains based on the Ethereum Virtual Machine (EVM) will recognize a shift in the way concerns are addressed. Authorization and access control, the layout of storage/ the state, and application governance are not implemented as contracts on a state machine. They instead become properties of a unique blockchain that is built for a singular purpose.

## Next up
