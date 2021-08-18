# Blockchain Technology and Cosmos

Let's begin our journey with a brief review of blockchain technology and how Cosmos came into being.

## The World of Blockchains - From Public General-Purpose to Purpose-Built Chains

The building blocks of blockchain technology can be found in the 1980s and 1990s, when breakthroughs in computer science and cryptography laid the necessary groundwork. Eventually, it took until 2008 for the blockchain technology per se to be invented.

Necessary preliminary work included append-only, cryptographically secure logs using hashing, authentication and encryption keys, as well as the conceptual development of smart contracts and consensus mechanisms in peer-to-peer (P2P) networks with Byzantine fault-tolerance (BFT).

On a fateful October 31, 2008, an individual or group calling itself Satoshi Nakamoto proposed a **P2P network for a digital currency**, calling it **Bitcoin**. It introduced a novel consensus  mechanism called Proof-of-Work (PoW). Suddenly, it became possible to send online payments directly between parties **independently of financial institutions and trusted third parties**. Bitcoin, the first public, decentralized application.

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
* **Application layer:** In effect running a state machine, which defines the applications' state and updates it with the processing of transactions.

</ExpansionPanel>

After the introduction of Bitcoin, several so-called **public chains** came into being. Among them was **Ethereum** in 2014, a public blockchcain with smart contract functionality that allows for applications based on these self-executing, self-enforcing, and self-verifying account holding objects. Other general-purpose chains followed.

--> Include image with historic overview of blockchains

Ethereum can be seen as a response to the difficulties of developing on Bitcoin.

With Ethereum, the application layer of the chain became a virtual machine, the **Ethereum Virtual Machine (EVM)**. The EVM allowed processing smart contracts to provide a single chain on which to deploy programs (i.e. smart contracts).

Even though the launch of Ethereum with its EVM was a big step forward, some **issues of general-purpose, public blockchains remained**: low flexibility for developers, scalability, state finality, speed, and sovereignty.

Even with the EVM, the whole variety of possible use cases could not be implemented with Ethereum. As the EVM basically is a sandbox, it is tailored to use cases. Simplistic use cases can be implemented with it but are **limited in regard to design and efficiency by the limitations of the sandbox**. Additionally, developing on Ethereum also bears limitations when it comes to programming languages.

When it comes to **scalability** of public blockchains, all dApps are limited by their transaction processing speed. In PoW chains such as Bitcoin or Ethereum, developers have to compete for the chain's limited resources.

State **finality** is an additional concern. Whereas finality is given when committed blocks with transactions can no longer be reverted/revoked. It is of importance to differentiate between *probabilistic and absolute finality*.

**Probabilistic finality** means the finality of a transaction dependent on how probable reverting a block is, i.e. the probability of removing a transaction. The more blocks come after the block containing a specific transaction, the less probable a reverted transaction becomes, as the longest chain rule applies in the case of forks.

On the other hand, **absolute finality** is a trait of BFT-based protocols. Finality comes as soon as a transaction and block are verified. There is no scenario, which could result in a revoked transaction.

Talking about speed in blockchains means addressing the **transaction speed**, i.e the time it takes to confirm a transaction. The transaction speed also determines how scalable a blockchain is.

Developing on Ethereum translates to having **two layers of governance**: The chain's governance and the application's governance. The chain's governance limits the application's governance leading to the latter being a requirement for changes in the application.

As a reaction to the public character of previous blockchain projects and the necessities for privacy in certain industries, more and more **private/managed chains**, i.e. blockchains with access barriers and sophisticated permission management. Platforms for permissioned networks such as R3's Corda and the Hyperledger Project's Hyperledger Fabric from the Linux Foundation launched.

The development of further and more complex applications requiring a more flexible environment led to the launch of multiple **purpose-built chains**, specialized on providing a platform tailored to the necessities of certain applications (i.e. use cases). Still these blockchains remained environments limited by the use cases they were envisioned for.

**General-purpose chains are limited to simplistic use case applications, while purpose-built chains only fit certain use cases.** The question arises: *Is it possible to build a platform for all use cases that does not bring the limitations of general-purpose chains?*

## Why Cosmos?

*How does Cosmos fit into the general developments of blockchain technology?*

In 2014, Jae Kwon and Ethan Buchman founded the Cosmos network with its consensus algorithm, [Tendermint](https://tendermint.com/). Initially, Cosmos was an open-source community project built by the Tendermint team. Since then, the organization assisting with the development and launch of the network is called the **Interchain Foundation** (ICF). It is a Swiss non-profit that after an initial coin offering (ICO) in 2017 raised funds to finance the development of open-source projects building on the Cosmos network.

<HighlightBox type="tip">

Take a look at the 2019 [Cosmos White Paper](https://v1.cosmos.network/resources/whitepaper) to find out more about the origins of Cosmos!

</HighlightBox>

Cosmos' founding **vision** is that of an easy development environment for blockchain technology addressing the main issues of previous blockchain projects and providing interoperability between chains. So to say, an **internet of blockchains**.

*Why is Cosmos an internet of blockchains?* Cosmos is a **network of interoperable blockchains**, each implemented with different properties suitable for their individual use cases. It allows developing blockchains that maintain sovereignty as the chain does not build on the governance of a main chain, allow for fast transaction processing, and are interoperable. With this a great variance of use cases becomes possible.

To achieve this type of network, the ecosystem relies on an **open source toolkit**, including the [Cosmos SDK](https://v1.cosmos.network/sdk), [Inter-Blockchain Communication (IBC)](https://ibcprotocol.org/) protocol, and [Tendermint](https://tendermint.com/). The toolkit helps to not only quickly spin up a blockchain, but also allows for customized, secure, and scalable chains as it is built on a set of modular, adaptable, and interchangeable tools.

Let's now look at the problems Cosmos solves.

### How Does Cosmos Solve the Scalability Issue?

As mentioned previously, scalability is a big issue area when it comes to blockchain technology. Cosmos allows applications to scale to millions of users.

Cosmos addresses **two types of scalability**:

* **horizontal scalability** - scaling by adding more machines to a network, and
* **vertical scalability** - scaling by adding more computational power to a network, i.e. improving the components.

In a blockchain context, vertical scalability is achieved through optimization of, for example, the consensus mechanism and applications running on the chain. One scales the blockchain itself by increasing the number of transactions being processed. Cosmos achieves vertical scalability with the help of the Tendermint BFT, as it increases the number of transactions per second. Cosmos currently conducts transactions in seven seconds. The only remaining bottleneck is then the application.

Consensus mechanism and application optimization can only take one so far. To surpass the limits of vertical scalability, Cosmos' multi-chain architecture allows for an application to run parallel on different chains while being operated by the same validator set. This horizontal scalability theoretically allows for infinite scalability.

<HighlightBox type="info">

A **validator** is one or more cooperating computers that participate in the consensus by, among other things, creating blocks.

</HighlightBox>

### How Does Cosmos Promote Sovereignty?

Usually, blockchain applications share the same underlying environment. When a change needs to be processed, it will depend on the governance structures of the application but also the environment, i.e. the governance mechanisms set by the protocol on which the application builds on. Thus, the chain's governance limits the applications sovereignty. For this reason, it is often called a **two-layer governance**.

Cosmos resolves this issue as one can build a blockchain tailored to the application. There are no limits to the application's governance if every chain is maintained by its own set of validators. Cosmos follows a design of a **one-layer governance**.

### How Does Cosmos Improve User Experience?

Traditionally, application design and efficiency are limited for blockchain developers. It comes down to the simplistic use case the blockchain is designed for.

In the Cosmos universe, the standardization of architecture components while also providing customization opportunities frees up the possibility of unconstrained, seamless, and intuitive user experiences.

As the same ground rules apply, i.e. standardization of components, it becomes easier for users to navigate different blockchains and applications. At the same time, it makes blockchain development easier.

In the end, Cosmos makes the world easier for developers while making dApps easier to use.
