# Blockchain Technology and Cosmos

Begin your journey with this brief review of blockchain technology, how Cosmos came into being, and what it brings to the world:

* An internet of blockchains
* A better dApp user experience
* A simplified specialized dAapp development experience
* Facilitated scalability
* Increased sovereignty to dApps
* Speed and fast finality

## The World of Blockchains — From Public General Purpose to Purpose-Built Chains

The building blocks of blockchain technology can be found in the 1980s and 1990s when breakthroughs in computer science and cryptography laid the necessary groundwork. Blockchain technology per se was invented in 2008.

The necessary breakthroughs included append-only, provably correct transaction logs using built-in error checking, strong authentication and encryption using public keys, mature theories of fault-tolerant systems, widespread understanding of peer-to-peer systems, and, of course, the advent of the internet and ubiquitous connectivity and powerful client-side computers.

On the fateful October 31, 2008, an individual, or group, calling itself Satoshi Nakamoto proposed a **P2P network for a digital currency**, calling it **Bitcoin**. It introduced a novel consensus mechanism, now referred to as Nakamoto Consensus, that uses Proof-of-Work (PoW) to enable nodes to reach agreement in a decentralized network. Suddenly, it became possible to send online payments directly between parties **independently of financial institutions and trusted third parties**. Bitcoin became the first public, decentralized application.

<HighlightBox type="info">

  Want to take a look at the [Bitcoin White Paper](https://bitcoin.org/bitcoin.pdf)?

</HighlightBox>

<ExpansionPanel title="I heard about PoW, tell me more">

Proof-of-Work (PoW), used to achieve BFT, is best described as a cryptographic puzzle solved by a network's node, called miner. The puzzle is a task of pre-defined, arbitrary difficulty. At the current scale of the network, the outcome is akin to a lottery with a single winning node.

In most PoW systems, the task consists of a search for an unknown, random number (in the jargon, a nonce). For it to be a winning nonce, when combined with ordered transactions in a block, the result ought to be a hash value matching a pre-defined criteria. Finding the nonce is evidence of considerable effort, or work, invested in the search. Each node uses its computing power to be the first to solve the puzzle, winning the right to author the latest block.

Here, economic incentives come into play: The node that announces a solution first receives a reward. This incentivizes participation, investing computing power into solving the task, and helps maintain the network's functioning.

</ExpansionPanel>

With the introduction of Bitcoin, the development of applications built on a decentralized network (dApps) began. In the early days, developing dApps could be done only by forking or building on the Bitcoin codebase. However, Bitcoin's monolithic codebase and limited, not-user-friendly scripting language made dApp development a tedious and complex process for developers.

<ExpansionPanel title="What's a Blockchain, really?">

Blockchain protocols define programs that hold a state and describe how to modify the state according to the received inputs. Those inputs are called transactions.

The consensus ensures that a blockchain has a canonical transaction history. So it follows that the state is deterministic, meaning if you begin with the same genesis state and replicate all conducted changes, you always achieve the same state.

Although Bitcoin's codebase is monolithic, its blockchain architecture can be split into three layers:

* Network layer: Tasked with discovering nodes and propagating transactions and consensus-related messages between single nodes;
* Consensus layer: Runs the consensus protocol between the single nodes of a P2P network;
* Application layer: In effect, running a state machine that defines the application's state and updates it with the processing of transactions, in accordance with the result of the consensus.

</ExpansionPanel>

After the introduction of Bitcoin, several so-called public chains came into being. Among them was Ethereum in 2014, a public blockchain with smart-contract functionality. This functionality enables applications based on self-executing, self-enforcing, and self-verifying account holding objects. Other general-purpose chains followed.

--> Include image with historic overview of blockchains

Ethereum can be seen as a response to the difficulties of developing smart contracts on Bitcoin.

With Ethereum, the application layer of the chain took the form of a virtual machine, the **Ethereum Virtual Machine (EVM)**. The EVM runs smart contracts thereby providing a single chain on which to deploy all sorts of programs (i.e. smart contracts).

Even though the launch of Ethereum with its EVM was a big step forward, some **issues of general-purpose, public blockchains remained**: low flexibility for developers, speed, throughput, scalability, state finality, and sovereignty.

Despite its many benefits, the EVM is a sandbox that delineates the range of implementable use cases. Simplistic and some complex use cases can be implemented with it but are nonetheless **limited in regard to design and efficiency by the limitations of the sandbox**. Additionally, developers are limited to programming languages that are tailor-made for the EVM.

Talking about speed in blockchains means addressing the **transaction speed**, i.e the time it takes to confirm a transaction. Speed is naturally impacted by the target delay between blocks, e.g. 10 minutes in Bitcoin and 15 seconds in Ethereum. Speed is also impacted by the backlog of equally worthy pending transactions all competing to be included in the same blocks.

**Throughput** describes how many transactions the network can handle per unit of time. It can be limited for reasons of physical network bandwidth, computer resources, or even by decisions embedded in the protocol. Not all DApps have the same throughput requirements, though, but if they are implemented on a general-purpose blockchain, they all have to make do with the _average_ resulting throughput. This impacts the **scalability** of a given DApp.

**State finality** is an additional concern. Finality describes whether and when committed blocks with transactions can no longer be reverted/revoked. It is important to differentiate between *probabilistic* and *absolute finality*.

**Probabilistic finality** describes the finality of a transaction dependent on how probable reverting a block is, i.e. the probability of removing a transaction. The more blocks come after the block containing a specific transaction, the less probable a transaction may be reverted, as _longest_ or _heaviest chain rules_ apply in the case of forks.

On the other hand, **absolute finality** is a trait of protocols based on Proof-of-Stake (PoS). Finality comes as soon as a transaction and block are verified. There are no scenarios in which a transaction could be revoked after it has been finalized.

<ExpansionPanel title="What kind of sorcery is this?">

PoS can have absolute finality because the totally staked amount is known at all times. Indeed, it takes a _public_ transaction to stake and another to unstake. You quickly figure out that if some majority of the stakers agree on one block, then that's it, that's the block.

This is different from PoW, where the total hashing capacity is unknown and can only be estimated by a combination of the difficulty of the puzzle and the speed at which new blocks are issued. To add or remove hashing capacity, all it takes is to surreptitiously turn on or off machines.

Incidentally, when hashing capacity is removed too abruptly, it results in a drop in the network transaction throughput as blocks suddenly fail to be issued around the target interval.

</ExpansionPanel>

Finally, when developing on Ethereum, the developer needs to contend with **two layers of governance**: The chain's governance and the application's governance. Whatever the DApp developers wish for their application's governance, they must contend with the underlying chain's governance.

Given the features of existing public blockchain projects and the requirements for privacy in certain industries, a push started in favor of **private, or managed, chains**, and more generally _private distributed ledgers_, i.e. blockchains with access barriers and sophisticated permission management. Platforms for permissioned networks such as R3's Corda and the Hyperledger Project's Hyperledger Fabric from the Linux Foundation are such examples.

The eventual development of further and more complex applications required a more flexible environment. This led to the launch of multiple **purpose-built chains**, each providing a platform tailored to the necessities of its application, i.e. use case. Still, each of these blockchains acted as self-contained environments, limited by the use cases they were envisioned for.

**General-purpose chains are limited to simplistic use case applications, while purpose-built chains only fit certain use cases.** The question arises: *Is it possible to build a platform for all use cases that does away with the limitations of general-purpose chains?*

## How does Cosmos fit into the general development of blockchain technology?

In 2016, Jae Kwon and Ethan Buchman founded the Cosmos network with its consensus algorithm, [Tendermint](https://tendermint.com/).

<HighlightBox type="tip">

Take a look at the 2016 [Cosmos White Paper](https://v1.cosmos.network/resources/whitepaper) to find out more about the origins of Cosmos!

</HighlightBox>

Already in 2014, Kwon invented the original Tendermint mechanism. Later in 2015, Buchman and Kwon began working together, and jointly founded Tendermint Inc by the end of the year.

<ExpansionPanel title="The skinny on Tendermint">

Tendermint is a BFT consensus algorithm and a consensus engine. It enables applications to be replicated, in sync, on many machines. The result is known as a Replicated State Machine with Byzantine Fault Tolerance. It guarantees BFT properties for distributed systems and their applications.

It does this in:

* A **secure** manner - Tendermint continues working even if up to 1/3 of machines fail or misbehave, and
* A **consistent** way - every machine computes the same state and accesses the same transaction log.

Tendermint is widely used across the industry and the most mature BFT consensus engine for Proof-of-Stake (PoS) blockchains.

For more on Tendermint, have a look at this helpful [introduction](https://docs.tendermint.com/master/introduction/what-is-tendermint.html).

</ExpansionPanel>

Initially, Cosmos was an open-source community project built by the Tendermint team. Since then, the **Interchain Foundation** (ICF) has assisted with the development and launch of the network. The ICF is a Swiss non-profit that after an initial fundraising event in 2017 raised funds to finance the development of open-source projects building on the Cosmos network.

Cosmos' founding **vision** is that of an easy development environment for blockchain technology, by addressing the main issues of previous blockchain projects and providing interoperability between chains. To foster, so to say, an **internet of blockchains**.

*How is Cosmos an internet of blockchains?* Cosmos is a **network of interoperable blockchains**, each implemented with different properties suitable for their individual use cases. Cosmos lets developers create blockchains that maintain sovereignty, free from any "main chain" governance, that allow for fast transaction processing, and that are interoperable. With this, a great variety of use cases become possible.

To achieve this vision and type of network, the ecosystem relies on an **open source toolkit**, including the [Inter-Blockchain Communication (IBC)](https://ibcprotocol.org/) protocol, its implementation in the [Cosmos SDK](https://v1.cosmos.network/sdk), and [Tendermint](https://tendermint.com/) as the base layer with state finality. The toolkit, a set of modular, adaptable, and interchangeable tools, helps not only to quickly spin up a blockchain, but also facilitates the customization of secure and scalable chains.

As a brief introduction to this terminolody, Cosmos is a network of interoperable application blockchains. Cosmos application blockchains are built with the Cosmos SDK, which enables developers to quickly create a unique blockchain for their specific use-case. The Cosmos SDK includes the pre-requisites that enable created blockchains to participate in inter-chain communications using the Inter-Blockchain Communication protocol (IBC). Cosmos application blockchains built with the Cosmos SDK use the Tendermint consensus. Each of these topics is unfolded in more detail in the sections that follow.

Let's now look at the problems Cosmos solves.

### How Does Cosmos Solve the Scalability Issue?

As mentioned previously, scalability is a big issue area when it comes to blockchain technology. Cosmos allows applications to scale to millions of users.

Cosmos addresses **two types of scalability**:

* **Horizontal scalability**: Scaling by adding similar machines to the network. When scaling out, horizontally, the network can accept more nodes to participate in the state replication, consensus observation, and any activity that queries the state.
* **Vertical scalability**: Scaling by improving the network's components so as to increase its computational power. When scaling up, vertically, the network can accept more transactions, and any activity that modifies the state.

In a blockchain context, vertical scalability is typically achieved through the optimization of the consensus mechanism and applications running on the chain. On the consensus side, Cosmos achieves vertical scalability with the help of the Tendermint BFT. For instance, the Cosmos Hub currently conducts transactions in seven seconds. In a single blockchain context, the only remaining bottleneck is then the application.

Consensus mechanism and application optimization of one's blockchain can only take one so far. To overcome the limits of vertical scalability, Cosmos' multi-chain architecture allows for **one application to run in parallel** on different chains, all the while being operated by the same validator set. This inter-chain horizontal scalability theoretically allows for infinite vertical-like scalability.

<HighlightBox type="info">

A **validator** is one or more cooperating computers that participate in the consensus by, among other things, creating blocks.

</HighlightBox>

### How Does Cosmos Promote Sovereignty?

Applications deployed on general-purpose blockchains all share the same underlying environment. When a change in the application needs to be made, it not only depends on the governance structures of the application but also on that of the environment, i.e. the governance mechanisms set by the protocol on which the application builds. Thus, the chain's governance limits the application's sovereignty. For this reason, it is often called a **two-layer governance**.

For example, an application on a typical blockchain can have its own governance structure but it exists a blockchain governance on top, and, in most cases, the blockchain itself can upgrade in ways that potentially break applications. Application sovereignty is therefore diminished in two-layer governance settings.

Cosmos resolves this issue as one can build a blockchain tailored to the application. There are no limits to the application's governance when every chain is maintained by its own set of validators. Cosmos follows a design of a **one-layer governance**.

### How Does Cosmos Improve User Experience?

In the world of traditional general-purpose blockchains, application design and efficiency are limited for blockchain developers. 

In the Cosmos universe, the standardization of architecture components, while still providing customization opportunities, frees up the possibility of unconstrained, seamless, and intuitive user experiences.

Further, as the same ground rules apply, i.e. standardization of components, it becomes easier for users to navigate between different blockchains and applications. At the same time, it makes blockchain development easier.

In the end, Cosmos makes the world easier for developers while making dApps easier to use. Cosmos enables sovereignty, with interoperability!
