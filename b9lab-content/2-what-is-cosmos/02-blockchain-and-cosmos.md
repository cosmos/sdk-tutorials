# Blockchain Technology and Cosmos

Let's begin our journey with a brief review of blockchain technology, how Cosmos came into being, and what it brings to the world:

* An internet of blockchains.
* A better DApp user experience.
* A simplified specialised DApp development experience.
* Facilitated scalability.
* Increased sovereignty to DApps.
* Speed and fast finality.

## The World of Blockchains - From Public General-Purpose to Purpose-Built Chains

The building blocks of blockchain technology can be found in the 1980s and 1990s, when breakthroughs in computer science and cryptography laid the necessary groundwork. Eventually, it took until 2008 for blockchain technology per se to be invented.

Necessary preliminary work included append-only, cryptographically secure logs using hashing, authentication and encryption keys, as well as the conceptual development of smart contracts and consensus mechanisms in peer-to-peer (P2P) networks with Byzantine fault-tolerance (BFT).

On a fateful October 31, 2008, an individual or group calling itself Satoshi Nakamoto proposed a **P2P network for a digital currency**, calling it **Bitcoin**. It introduced a novel consensus  mechanism called Proof-of-Work (PoW). Suddenly, it became possible to send online payments directly between parties **independently of financial institutions and trusted third parties**. Bitcoin became the first public, decentralized application.

<HighlightBox type="info">

Proof-of-Work (PoW), used to achieve BFT, is best described as a cryptographic puzzle solved by a network's node, called miner. The puzzle is a task of pre-defined, arbitrary difficulty. At the scale of the network, the outcome is akin to a lottery with a single winning node.

In most cases, the task consists of a search for an unknown, random number (in the jargon, a nonce). For it to be a winning nonce, when combined with ordered transactions in a block, the result ought to be a hash value matching a pre-defined criteria. Finding the nonce is evidence of considerable effort, or work, invested in the search. Each node uses its computing power to be the first to solve the puzzle, winning the right to author the latest block.

Here, economic incentives come into play: The node that announces a solution first receives a reward. This incentivizes participation, investing computing power into solving the task, and helps maintain the network's functioning.

</HighlightBox>

With the introduction of Bitcoin, the **development of decentralized applications (DApps)** - applications built on a decentralized network - began. In the early days, developing DApps could only be done by **forking the Bitcoin codebase** or **building on it**. However, Bitcoin's monolithic codebase and limited, not user-friendly scripting language made DApp development a tedious and complex process for developers.

<ExpansionPanel title="The Basics of Blockchain">

**Blockchain protocols** define programs that **hold a state** and how to modify it according to the received inputs. Those inputs are transactions. The consensus ensures that a blockchain has a **canonical transaction history**. It follows that the **state is deterministic**, meaning if you begin with the same genesis state and replicate all conducted changes, you always achieve the same state.

Blockchain architectures can be split into **three layers**:

* **Network layer:** Tasked with propagating transactions and consensus-related messages;
* **Consensus layer:** Runs the consensus protocol between the single nodes of a P2P network;
* **Application layer:** In effect, running a state machine, which defines the applications' state and updates it with the processing of transactions.

</ExpansionPanel>

After the introduction of Bitcoin, several so-called **public chains** came into being. Among them was **Ethereum** in 2014, a public blockchain with smart contract functionality. That enables applications based on these self-executing, self-enforcing, and self-verifying account holding objects. Other general-purpose chains followed.

--> Include image with historic overview of blockchains

Ethereum can be seen as a response to the difficulties of developing smart contracts on Bitcoin.

With Ethereum, the application layer of the chain took the form of a virtual machine, the **Ethereum Virtual Machine (EVM)**. The EVM runs smart contracts thereby providing a single chain on which to deploy programs (i.e. smart contracts).

Even though the launch of Ethereum with its EVM was a big step forward, some **issues of general-purpose, public blockchains remained**: low flexibility for developers,  speed, throughput, scalability, state finality, and sovereignty.

Despite its many benefits, the EVM is a sandbox that delineates the range of implementable use cases. Simplistic and some complex use cases can be implemented with it but are nonetheless **limited in regard to design and efficiency by the limitations of the sandbox**. Additionally, developers are limited to those programming languages that are tailor-made for the EVM.

Talking about speed in blockchains means addressing the **transaction speed**, i.e the time it takes to confirm a transaction. Speed is naturally impacted by the target delay between blocks, e.g. 10 minutes in Bitcoin and 15 seconds in Ethereum. Speed is also impacted by the backlog of equally worthy pending transactions all competing to be included in the same blocks.

**Throughput** describes how many transactions can the network handle per unit of time. It can be limited for reasons of physical network bandwidth, computer resources, or even by decisions embedded in the protocol. Not all DApps have the same throughput requirements, though, but if they are implemented on a general-purpose blockchains, they all have to make do with the _average_ resulting throughput. This impacts the **scalability** of a given DApp.

**State finality** is an additional concern. Finality describes whether and when committed blocks with transactions can no longer be reverted/revoked. It is important to differentiate between *probabilistic* and *absolute finality*.

**Probabilistic finality** describes the finality of a transaction dependent on how probable reverting a block is, i.e. the probability of removing a transaction. The more blocks come after the block containing a specific transaction, the less probable a transaction may be reverted, as the longest chain rule applies in the case of forks.

On the other hand, **absolute finality** is a trait of BFT-based protocols. Finality comes as soon as a transaction and block are verified. There are no scenarios in which a transaction could be revoked after it has been finalized.

When developing on Ethereum, the developer needs to contend with **two layers of governance**: The chain's governance and the application's governance. Whatever the DApp developers wish for their application's governance, they must contend with the underlying chain's governance.

Given the features of existing public blockchain projects and the requirements for privacy in certain industries, a push started in favor of **private/managed chains**, i.e. blockchains with access barriers and sophisticated permission management. Platforms for permissioned networks such as R3's Corda and the Hyperledger Project's Hyperledger Fabric from the Linux Foundation are such examples.

The eventual development of further and more complex applications required a more flexible environment. This led to the launch of multiple **purpose-built chains**, each providing a platform tailored to the necessities of its application, i.e. use case. Still, each of these blockchains acted as environments limited by the use cases they were envisioned for.

**General-purpose chains are limited to simplistic use case applications, while purpose-built chains only fit certain use cases.** The question arises: *Is it possible to build a platform for all use cases that does away with the limitations of general-purpose chains?*

## Why Cosmos?

*How does Cosmos fit into the general developments of blockchain technology?*

In 2014, Jae Kwon and Ethan Buchman founded the Cosmos network with its consensus algorithm, [Tendermint](https://tendermint.com/). Initially, Cosmos was an open-source community project built by the Tendermint team. Since then, the **Interchain Foundation** (ICF) has assisted with the development and launch of the network. The ICF is a Swiss non-profit that after an initial coin offering (ICO) in 2017 raised funds to finance the development of open-source projects building on the Cosmos network.

<HighlightBox type="tip">

Take a look at the 2019 [Cosmos White Paper](https://v1.cosmos.network/resources/whitepaper) to find out more about the origins of Cosmos!

</HighlightBox>

Cosmos' founding **vision** is that of an easy development environment for blockchain technology, by addressing the main issues of previous blockchain projects and providing interoperability between chains. To foster, so to say, an **internet of blockchains**.

*How is Cosmos an internet of blockchains?* Cosmos is a **network of interoperable blockchains**, each implemented with different properties suitable for their individual use cases. Cosmos lets developers create blockchains that maintain sovereignty, free from any "main chain" governance, that allow for fast transaction processing, and that are interoperable. With this, a great variety of use cases become possible.

To achieve this vision and type of network, the ecosystem relies on an **open source toolkit**, including the [Inter-Blockchain Communication (IBC)](https://ibcprotocol.org/) protocol, its implementation in [Cosmos SDK](https://v1.cosmos.network/sdk), and [Tendermint](https://tendermint.com/) as the base layer with state finality. The toolkit, a set of modular, adaptable, and interchangeable tools, helps not only to quickly spin up a blockchain, but also facilitates the customization of secure and scalable chains.

Let's now look at the problems Cosmos solves.

### How Does Cosmos Solve the Scalability Issue?

As mentioned previously, scalability is a big issue area when it comes to blockchain technology. Cosmos allows applications to scale to millions of users.

Cosmos addresses **two types of scalability**:

* **Horizontal scalability**: Scaling by adding similar machines to the network. When scaling out, horizontally, the network can accept more nodes to participate in the state replication, consensus observation, and any activity that queries the state.
* **Vertical scalability**: Scaling by improving the network's components so as to increase its computational power. When scaling up, vertically, the network can accept more transactions, and any activity that modifies the state.

In a blockchain context, vertical scalability is typically achieved through optimization of the consensus mechanism and applications running on the chain. On the consensus side, Cosmos achieves vertical scalability with the help of the Tendermint BFT. For instance, the Cosmos Hub currently conducts transactions in seven seconds. In a single blockchain context, the only remaining bottleneck is then the application.

Consensus mechanism and application optimization of one blockchain can only take one so far. To overcome the limits of vertical scalability, Cosmos' multi-chain architecture allows for **one application to run in parallel** on different chains, all the while being operated by the same validator set. This inter-chain horizontal scalability theoretically allows for infinite vertical-like scalability.

<HighlightBox type="info">

A **validator** is one or more cooperating computers that participate in the consensus by, among other things, creating blocks.

</HighlightBox>

### How Does Cosmos Promote Sovereignty?

Applications deployed on general purpose blockchains all share the same underlying environment. When a change in the application needs to be made, it not only depends on the governance structures of the application but also that of the environment, i.e. the governance mechanisms set by the protocol on which the application builds. Thus, the chain's governance limits the application's sovereignty. For this reason, it is often called a **two-layer governance**.

Cosmos resolves this issue as one can build a blockchain tailored to the application. There are no limits to the application's governance if every chain is maintained by its own set of validators. Cosmos follows a design of a **one-layer governance**.

### How Does Cosmos Improve User Experience?

In the world of traditional general purpose blockchains, application design and efficiency are limited for blockchain developers. They have to find the simplistic use case the blockchain is designed for.

In the Cosmos universe, the standardization of architecture components, while still providing customization opportunities, frees up the possibility of unconstrained, seamless, and intuitive user experiences.

Further, as the same ground rules apply, i.e. standardization of components, it becomes easier for users to navigate between different blockchains and applications. At the same time, it makes blockchain development easier.

In the end, Cosmos makes the world easier for developers while making DApps easier to use.
