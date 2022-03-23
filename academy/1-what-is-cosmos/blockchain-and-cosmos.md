---
title: "Blockchain Technology and Cosmos"
order: 2
description: Cosmos as part of blockchain technology
tag: fast-track
---

# Blockchain Technology and Cosmos

Begin your journey with this brief review of blockchain technology, how Cosmos came into being, and what it brings to the world of blockchain technology:

* An internet of blockchains
* A better decentralized application (dApp) user experience
* A simplified, specialized dApp development experience
* Facilitated scalability
* Increased sovereignty
* Speed and fast finality

<ExpansionPanel title="What is a Blockchain?">

Blockchain protocols define programs that hold a state and describe how to modify the state according to the received inputs. The inputs are called transactions.

The consensus mechanism ensures that a blockchain has a canonical transaction history. Blockchain transactions must be deterministic, meaning there is only one correct interpretation. The blockchain state is deterministic. If you begin with the same genesis state and replicate all changes, you always achieve the same state.

A blockchain architecture can be **split into three layers**:

* The network layer: tasked with discovering nodes and propagating transactions and consensus-related messages between single nodes.
* The consensus layer: runs the consensus protocol between the single nodes of a peer-to-peer (P2P) network.
* The application layer: running a state machine that defines the application's state and updates it with the processing of transactions implementing the network's consensus.

This layered model can be applied to blockchains generally.

</ExpansionPanel>

## The world of blockchains — From public general-purpose chains to application-specific chains

You can find the building blocks of blockchain technology in the 1980s and 1990s when breakthroughs in computer science and cryptography laid the necessary groundwork.

The necessary breakthroughs included append-only, provably correct transaction logs using built-in error checking, strong authentication and encryption using public keys, mature theories of fault-tolerant systems, a widespread understanding of peer-to-peer (P2P) systems, the advent of the internet and ubiquitous connectivity, and powerful client-side computers.

On October 31, 2008, an individual or group calling itself Satoshi Nakamoto proposed a **P2P network for a digital currency**, calling it **Bitcoin**. Bitcoin introduced a novel consensus mechanism, now referred to as Nakamoto Consensus, that uses Proof-of-Work (PoW) to enable nodes to reach agreement in a decentralized network. It became possible to send online payments directly between parties **independent of financial institutions and trusted third parties**. Bitcoin became the first public, decentralized payment application.

<HighlightBox type="info">

Want to look closer at the initial proposition of Bitcoin? Take a look at the [Bitcoin Whitepaper](https://bitcoin.org/bitcoin.pdf)

</HighlightBox>

<ExpansionPanel title="More on PoW">

Bitcoin uses PoW to achieve Byzantine Fault-Tolerance (BFT) which enables decentralized, trustless networks to function even with malfunctioning or malicious nodes present. It is best described as a cryptographic puzzle solved by a network's node called a miner. The puzzle is a task of pre-defined, arbitrary difficulty. At the current scale of the networks using PoW, the outcome is akin to a lottery with a single winning node.

In most PoW systems the task consists of a search for an unknown, random number - a nonce. For it to be a winning nonce, the result combined with ordered transactions in a block ought to be a hash value matching pre-defined criteria. Finding the nonce is evidence of considerable effort or work invested in the search. Each node uses its computing power in a race to solve the puzzle first and win the right to author the latest block.

Financial incentives are in play: The node that first announces a solution receives a reward. Through the rewards, the network's native currency is issued, and nodes are encouraged to invest computing power into solving the task. Network security scales with computing power; more investment leads to a more secure PoW network.

</ExpansionPanel>

The development of decentralized applications built on blockchain networks began shortly after Bitcoin's debut. In the early days developing dApps could be done only by forking or building on the Bitcoin codebase. However, Bitcoin's monolithic codebase and limited scripting language made dApp development a tedious and complex process for developers.

After the introduction of Bitcoin, several so-called public chains came into being, the first being Ethereum in 2013. These general-purpose blockchains are aimed at providing a decentralized network that allows the implementation of a variety of use cases.

![Timeline of blockchain technology](/timeline.png)

Ethereum is a public blockchain with smart contract functionality enabling applications based on self-executing, self-enforcing, and self-verifying account holding objects. It can be seen as a response to the difficulties of developing applications on Bitcoin.

With Ethereum the application layer of the chain took the form of a virtual machine called the **Ethereum Virtual Machine (EVM)**. The EVM runs smart contracts, thereby providing a single chain on which to deploy all sorts of programs. Despite its many benefits, the EVM is a sandbox that delineates the range of implementable use cases. Simplistic and some complex use cases can be implemented with it but are nonetheless **limited regarding design and efficiency by the limitations of the sandbox**. Additionally, developers are limited to programming languages that are tailored to the EVM.

Even though the launch of Ethereum with its EVM was a big step forward, **some issues of public, general-purpose blockchains remained**: low flexibility for developers and difficulties with speed, throughput, scalability, state finality, and sovereignty.

In the world of blockchains "speed" means **transaction speed**. You can understand transaction speed as the time it takes to confirm a transaction. Speed is naturally impacted by the target delay between blocks, which is 10 minutes in Bitcoin and 15 seconds in Ethereum. Speed is also impacted by the backlog of equally worthy pending transactions all competing to be included in new blocks.

**Throughput** describes how many transactions the network can handle per unit of time. Throughput can be limited for reasons of physical network bandwidth, computer resources, or even by decisions embedded in the protocol. Not all dApps have the same throughput requirements, but they all have to make do with the _average_ resulting throughput of the platform itself if they are implemented on a general-purpose blockchain. This impacts the **scalability** of dApps.

**State finality** is an additional concern. Finality describes whether and when committed blocks with transactions can no longer be reverted/revoked. It is important to differentiate between *probabilistic* and *absolute finality*.


<Accordion :items="
    [
        {
            title: 'Probabilistic finality',
            description: '**Probabilistic finality** describes the finality of a transaction dependent on how probable reverting a block is, i.e. the probability of removing a transaction. The more blocks come after the block containing a specific transaction, the less probable a transaction may be reverted, as *longest* or *heaviest chain rules* apply in the case of forks.'
        },
        {
            title: 'Absolute finality',
            description: '**Absolute finality** is a trait of protocols based on Proof-of-Stake (PoS). Finality comes as soon as a transaction and block are verified. There are no scenarios in which a transaction could be revoked after it has been finalized.'
        }
    ]
"/>


<ExpansionPanel title="Finality in PoW and PoS networks">

Proof-of-Stake (PoS) networks can have absolute finality because the total staked amount is known at all times. It takes a _public_ transaction to stake and another to unstake. If some majority of the stakers agree on a block, then the block can be considered "final" because there is no process that could overturn the consensus.

This is different from PoW networks, where the total hashing capacity is unknown and can only be estimated by a combination of the puzzle's difficulty and the speed at which new blocks are issued. To add or remove hashing capacity all it takes is to turn on or off machines. When hashing capacity is removed too abruptly, it results in a drop in the network transaction throughput as blocks suddenly fail to be issued around the target interval.

</ExpansionPanel>

When developing on Ethereum, the developer needs to contend with **two layers of governance**: The chain's governance and the application's governance. Independently of the dApp's governance needs, developers must come to terms with the underlying chain's governance.

Given the features of existing public blockchain projects and the requirements for privacy in certain industries, a push towards **private, or managed, chains** followed. Private distributed ledgers are blockchains with access barriers and sophisticated permission management. Platforms for permissioned networks such as R3's Corda and the Hyperledger Project's Hyperledger Fabric from the Linux Foundation are examples.

The eventual development of further and more complex applications required a more flexible environment. This led to the launch of multiple **purpose-built/application-specific blockchains**, each providing a platform tailored to the necessities of use cases and applications. Each of these blockchains acted as self-contained environments limited by the use cases they were envisioned for.

**General-purpose chains are limited to simplistic use case applications, while application-specific chains only fit certain use cases.** _Is it possible to build a platform for all use cases that does away with the limitations of general-purpose chains?_

## How does Cosmos fit into the general development of blockchain technology?

In 2016 Jae Kwon and Ethan Buchman founded the Cosmos network with its consensus algorithm, [Tendermint](https://tendermint.com/).

<HighlightBox type="tip">

Take a look at the 2016 [Cosmos Whitepaper](https://v1.cosmos.network/resources/whitepaper) to find out more about the origins of Cosmos.

</HighlightBox>

In 2014 Kwon invented the original Tendermint mechanism. Later in 2015, Buchman and Kwon began working together and jointly founded Tendermint Inc by the end of the year.

<ExpansionPanel title="The skinny on Tendermint">

Tendermint is a consensus algorithm with Byzantine Fault-Tolerance (BFT) and a consensus engine. It enables applications to be replicated in sync on many machines. Blockchain networks require BFT to ensure functioning even with malfunctioning or malicious nodes present. The result is known as a Replicated State Machine with Byzantine Fault Tolerance. It guarantees BFT properties for distributed systems and their applications.

It does this:

* **Securely** - Tendermint continues working even if up to 1/3 of machines fail or misbehave.
* **Consistently** - every machine computes the same state and accesses the same transaction log.

Tendermint is widely used across the industry and is the most mature BFT consensus engine for Proof-of-Stake (PoS) blockchains.

For more on Tendermint, have a look at this helpful [introduction](https://docs.tendermint.com/master/introduction/what-is-tendermint.html).

</ExpansionPanel>

Initially Cosmos was an open-source community project built by the Tendermint team. Since then the **Interchain Foundation (ICF)** has assisted with the development and launch of the network. The ICF is a Swiss non-profit that raised funds in 2017 to finance the development of open-source projects building on the Cosmos network.

Cosmos' founding **vision** is that of an easy development environment for blockchain technology. Cosmos wants to address the main issues of previous blockchain projects and provide interoperability between chains to foster an **internet of blockchains**.

*How is Cosmos an internet of blockchains?* Cosmos is a **network of interoperable blockchains**, each implemented with different properties suitable for their individual use cases. Cosmos lets developers create blockchains that maintain sovereignty free from any "main chain" governance, have fast transaction processing, and are interoperable. With Cosmos a multitude of use cases becomes feasible.

To achieve this vision and type of network, the ecosystem relies on an **open-source toolkit**, including the [Inter-Blockchain Communication (IBC)](https://ibcprotocol.org/) protocol, its implementation in the [Cosmos SDK](https://v1.cosmos.network/sdk), and [Tendermint](https://tendermint.com/) as the base layer providing distributed state finality. A set of modular, adaptable, and interchangeable tools helps not only to quickly spin up a blockchain but also facilitates the customization of secure and scalable chains.

Cosmos is a network of interoperable application blockchains. Cosmos' application blockchains are built with the Cosmos SDK. The Cosmos SDK includes the prerequisites that make it possible for created blockchains to participate in inter-chain communications using the Inter-Blockchain Communication Protocol (IBC). Chains built with the Cosmos SDK use the Tendermint consensus. Each of these topics is unfolded in more detail in the sections that follow.

### How does Cosmos solve the scalability issue?

Scalability is a challenge of blockchain technology. Cosmos allows applications to scale to millions of users. This degree of scalability is possible as Cosmos addresses **two types of scalability**:

* **Horizontal scalability:** scaling by adding similar machines to the network. When scaling out, the network can accept more nodes to participate in the state replication, consensus observation, and any activity that queries the state.
* **Vertical scalability:** scaling by improving the network's components to increase its computational power. Scaling up, the network can accept more transactions and any activity that modifies the state.

In a blockchain context, vertical scalability is typically achieved through the optimization of the consensus mechanism and applications running on the chain. On the consensus side, Cosmos achieves vertical scalability with the help of the Tendermint BFT. The Cosmos Hub currently conducts transactions in seven seconds. The only remaining bottleneck is then the application.

The consensus mechanism and application optimization of your blockchain can only take you so far. To overcome the limits of vertical scalability, Cosmos' multi-chain architecture allows for **one application to run in parallel** on different but IBC-coordinated chains, whether operated by the same validator set or not. This inter-chain, horizontal scalability theoretically allows for infinite vertical-like scalability minus the coordination overhead.

<HighlightBox type="info">

In blockchain, a **validator** is one or more cooperating computers that participate in the consensus by, among other things, creating blocks.

</HighlightBox>

### How does Cosmos promote sovereignty?

Applications deployed on general-purpose blockchains all share the same underlying environment. When a change in the application needs to be made, it not only depends on the governance structures of the application but also on that of the environment. The feasibility of implementing changes depends on the governance mechanisms set by the protocol on which the application builds. The chain's governance limits the application's sovereignty. For this reason it is often called a **two-layer governance**.

For example, an application on a typical blockchain can have its governance structure, but it exists atop blockchain governance, and chain upgrades can potentially break applications. Application sovereignty is therefore diminished in two-layer governance settings.

Cosmos resolves this issue as developers can build a blockchain tailored to the application. There are no limits to the application's governance when every chain is maintained by its own set of validators. Cosmos follows a **one-layer governance design**.

### How does Cosmos improve user experience?

In the world of traditional general-purpose blockchains, application design and efficiency are limited for blockchain developers. In the Cosmos universe the standardization of architecture components combined with the provided customization opportunities frees up the possibility for an unconstrained, seamless, and intuitive user experience.

It becomes easier for users to navigate between different blockchains and applications as the same ground rules apply because of the standardization of components. Cosmos makes the world easier for developers while making dApps more user-friendly. Cosmos enables sovereignty with interoperability!

## Next up

In the [next section](./cosmos-ecosystem.md) you can find an introduction to all that the Cosmos ecosystem has to offer.
