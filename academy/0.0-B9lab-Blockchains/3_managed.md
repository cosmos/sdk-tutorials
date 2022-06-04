---
title: "Public and Managed Blockchains"
order: 4
description: Introduction to different deployment patterns
tag: fast-track
---

# Public and Managed Blockchains

The most obvious way of operating blockchain protocols comes in form of a public network. This is what blockchain technology was originally invented for and remains arguably its most powerful use.

![P2P network](/academy/0.0-B9lab-Blockchains/images/00_02_p2p_network_dark.png)

A public blockchain network has a few specific attributes:

* **Accessibility:** All you need to connect to Bitcoin or Ethereum is the client software and an internet connection. No AML, KYC, identity checks, or subscription payment is required.
* **No hierarchy:** All nodes are equal, meaning no individual node has more authority than another. All validators are also equal.
* **Crypto-economic incentives:** The lack of a central authority means there is no absolute defense against malicious behavior. Instead, the network usually incentivizes benevolent behavior and disincentivizes behavior that endangers the network functioning. It de facto implements prohibitive expenses to attack the network and others, and thus ensures security and proper function.
* **Full decentralization:** Many public networks are completely decentralized because they are non-hierarchical and fully accessible. The playing field for market participants is therefore relatively level, so traditional business models may not work as well.

The two most popular examples of functioning public networks are Bitcoin and Ethereum.

## Introduction to Bitcoin

Since 2009, the most successful and popular decentralized public blockchain network has been Bitcoin. Nowadays, Bitcoin is the cryptocurrency with the highest market capitalization.

<HighlightBox type="tip">

For an estimate of the Bitcoin network size, take a look at [Bitnodes](https://bitnodes.earn.com/). If you are more of a visual and statistics person, these [Bitcoin charts](https://www.blockchain.com/en/charts) are interesting.

</HighlightBox>

Bitcoin was first introduced with the publication of the original paper [*Bitcoin: A peer-to-peer electronic cash system*](https://bitcoin.org/bitcoin.pdf) by Satoshi Nakamoto in 2008. In this paper, Nakamoto describes Bitcoin as a **peer-to-peer (P2P)** version of electronic cash. **Proof-of-work (PoW)** is proposed to establish the truth in a partially synchronous system without involving trusted parties. Using this method, the set of participants controlling the majority of the computing power determines the truth.

Let us look at this in more detail.

Nakamoto does not use the term "blockchain" in his paper, but describes the concept by explaining transactions in Bitcoin. The transaction process requires the signing of the transaction with the hash of the previous transaction and the public key of the receiver. This is called the chain of ownership. Transactions can contain several inputs and outputs.

![Chain of blocks with previous hash](/academy/0.0-B9lab-Blockchains/images/00_16_bitcoin_block_headers_literal.png)

Each block includes the previous hash and a nonce, a random set of `1`s and `0`s. The protocol calls for a hash beginning with a specific number of binary `0`s when hashing the block. Bitcoin uses a timestamp server to prevent double-spending. The block creator, called a **miner**, looks for a nonce which results in a block hash beginning with the right number of binary `0`s. It is difficult to find a nonce that fulfills this condition, but it is easy to verify when one does.

The longest valid chain of blocks on the network is deemed the truth, because users recognise it contains proof of the most work, and it becomes exponentially more difficult to alter history as more blocks are appended. To promote an alternative version of history, an attacker must find a new nonce for the block they want to change **and** new nonces for _every subsequent block thereafter_ to create a rival valid chain which is at least as long as that used by the consensus. This pits the attacker against the combined brute force (i.e. computing power) of the rest of the network.

There is a residual possibility that a slower attacker can catch up, since discovering a nonce works by evaluating random numbers and it is possible to make a fast lucky guess. However, this probability decreases exponentially as the number of blocks (a.k.a. confirmations) increases, so making changes to the "distant" past becomes progressively less practical.

The process of creating a valid block is called **mining** in PoW networks. The protocol includes a reward for mining, which is the first special transaction in the block. It can be expected that the majority of nodes use their CPU power honestly because this is the most financially feasible course of action. Signed transactions are announced publicly, so the public keys of the parties are not private.

![Mining](/academy/0.0-B9lab-Blockchains/images/00_17_mining-01.png)

## Introduction to Ethereum

Ethereum is a public, blockchain-based, distributed computing platform and operating system with smart contract features. Ethereum emerged from a range of proposals rejected by the Bitcoin community.

The most important difference compared to Bitcoin is the implementation of distributed code execution through the **Ethereum Virtual Machine (EVM)**. The Ethereum network is a virtual state machine which enables the deployment of so-called **smart contracts** as part of the data of a transaction. The implementation of such a state machine with blockchain is revolutionary in itself.

The code execution platform is [Turing-complete](https://en.wikipedia.org/wiki/Turing_completeness). As part of Turing-completeness, frameworks must overcome the [halting problem](https://www.scientificamerican.com/article/why-is-turings-halting-pr/), which is especially difficult in distributed, hierarchy-free computing platforms.

In simple terms, the halting problem describes a scenario in which a program loops forever. Ethereum's solution is to introduce **Gas** as a fee for each computational step. Every block has a maximum Gas limit which limits the number of computational steps that can be executed per block - just like a combustion engine, if the Gas runs out then the program stops. Gas only exists during the execution of a transaction and the user is free to specify any **Gas price** in terms of **Ether**, a value which Ethereum requires to convert **Ether to Gas**.

<HighlightBox type="info">

**Ether** is the **native cryptocurrency** of the Ethereum platform, as Bitcoin is the native cryptocurrency of the Bitcoin blockchain.

</HighlightBox>

The protocol defines the **Gas cost** for each operation in the EVM. The halting problem is resolved by attaching financial costs to every step in a program and by limiting the funds available. Transactions that do not compute successfully and are not on budget are rejected.

In Ethereum, **smart contracts** are stored on every single node - they are public. In practice, a smart contract in the EVM is an autonomous agent with an internal account. The most popular language for writing such a contract is **Solidity**.

<ExpansionPanel title="Faster block time">

Ethereum has a much faster block time than Bitcoin - currently it is around 15 seconds.

Ethereum implements a variation of Bitcoin's PoW consensus algorithm called Ethash, which is intended to be [ASIC-resistant and GPU friendly](https://github.com/ethereum/wiki/wiki/Ethash-Design-Rationale). ASIC-resistance is meant to discourage unwanted concentrations of mining power; in other words, to encourage decentralization. Core developers of the Ethereum project plan to switch to the **proof-of-stake (PoS)** consensus algorithm in the future.

However, these useful innovations are not the key innovation that allows Ethereum to operate with faster block times.

A well-understood challenge related to reduced block time stems from network latency. Since nodes do not learn about newly discovered blocks simultaneously, at any given time a portion of the miners will be working on already solved/old blocks. If these miners find a solution, they might not be rewarded and a "fork" of the chain results. This can lead to rival chains with a common true history spreading through the network. The rate at which such transient forks occur increases predictably with shorter block times.

Another way of understanding this is to consider that at any point in time, a predictable percentage of the total mining hardware in the network could be working on the wrong chain because of latency, and this percentage increases with shorter block times. It is not beneficial to the network or the miners to waste hardware resources that are intended to secure the network.

While Bitcoin addresses this efficiency issue with a relatively long block time of 10 minutes, Ethereum addresses this concern with a partial reward strategy: valid blocks that are not ultimately included in the canonical chain, because another chain becomes longer, can still be included on the side. They are known as **uncles**. Miners of uncles receive a smaller reward than regular block miners.

![Uncles in Ethereum](/academy/0.0-B9lab-Blockchains/images/00_18_block_uncles-01.png)

This is made possible thanks to Ethereum's implementation of the [GHOST protocol](http://www.cs.huji.ac.il/~yoni_sompo/pubs/15/inclusive_full.pdf). GHOST includes so-called uncles that are propagated into the network too late to rise to the level of network consensus. This increases the total difficulty of the chain (by capturing the "work" that would otherwise be wasted), makes smaller block times possible, and rewards miners of uncles for contributing to the overall strength of the network.

Ethereum's solution to achieve faster block times draws attention to the universal challenges of blockchain technology: performance, and throughput. Cosmos solves for performance in two ways: with a faster consensus process, and by introducing parallelism.

</ExpansionPanel>

That Ethereum's virtual machine runs arbitrary programs hints at the potential of blockchain technology to disintermediate and decentralize processes which include network participants that would benefit from a shared set of facts and reliable interactions. The field of possibilities is expansive. It includes virtually all cases where trading partners need to reconcile their respective records, trade assets, and considerations in an atomic way, or to execute remedial actions such as penalties if a counterparty fails to deliver as agreed.

As promising as this sounds, the technology is **not without limitations**. Chief among these limitations is capacity, not only in terms of transactions per second but also in terms of the complexity of transactions that can be handled by the network. Ethereum's virtual machine paradigm places limits on transaction complexity to ensure that a single contract or a single transaction does not overload the shared, distributed computer. This constraint is inherent to the design choice of using a virtual machine model.

The Cosmos SDK enables the creation of application-specific blockchains. That is to say that Cosmos blockchains do not need smart contracts because application-level concerns are defined at the protocol level. This offers developers the possibility of enabling transactions with complexity far above what is possible on general-purpose blockchains. Because Cosmos chains can interact with other public networks like Ethereum through the Inter-Blockchain Communication (IBC) Protocol, Cosmos blockchains can also be used to offload processes that are either too complex or too expensive to run on other networks.

<YoutubePlayer videoId="Za5lPKNV_Mk"/>

## Managed blockchain networks

Managed networks, just like public networks, rely on blockchain data structures. Unlike public blockchain networks, they do not necessarily need to mitigate the Byzantine Generals Problem because they operate in a predictable environment with elements of authority, hierarchy, and accountability.

Managed networks can be used in cases where elements of trust already exist between the participants. For example, consider a network of financial institutions. They could use blockchain technology to settle inter-bank transactions. In that case, there would be no need for public access; indeed, public access would be undesirable. Instead, they might consider a private network with each institution operating exactly one validator. All participants would understand that no operator in a single institution would be able to corrupt the network overall; however, it would be much easier for them _as a group_ to alter a history if they found it detrimental, since it would only require the coordinated action of a small number of known validators.

Managed networks are typically governed through traditional governance processes that are appropriate for the shared goals of the participants.

<HighlightBox type="info">

Dive into the specifics of the Byzantine Generals Problem in the next section on [consensus in blockchain](./4_consensus.md).

</HighlightBox>

![Public and Managed Network Comparison](/academy/0.0-B9lab-Blockchains/images/00_08_public_vs_private_comparison-01.png)

Public networks are based on game theory and economic incentives, which means that every action is probabilistic. There is no guarantee that a transaction will be picked up and even the integrity of the network is merely very likely, not 100% guaranteed.

This is often unacceptable, for example with traditional financial institutions. One of the biggest expenses financial and other institutions face is the operation and maintenance of infrastructure and the costs resulting from leaks, hacks, reconciliation with trading partners, errors, and data incompatibility. Blockchain seems like a promising solution.

Unlike public networks, where the interaction between participants is governed by the protocol and crypto-economic incentives, in managed networks the blockchain protocol is often a technical enforcement of pre-existing relationships and legally enforceable agreements.

![Public vs Private](/academy/0.0-B9lab-Blockchains/images/00_10_public_vs_private_comparison_table.png)

**Private blockchains** can be:

* **Designed for a limited number of vetted and approved participants:** performance challenges and poorly connected nodes are of lesser importance.
* **Designed for optimized performance:** most participants in an enterprise network are capable of running well-connected, high-performance, and high-availability nodes. A group of participants can agree to raise the bar defining minimum system requirements significantly.
* **Governed by a well-defined agreement between the participants:** such an agreement may codify the decision-making processes used to decide matters such as protocol upgrades, admission requirements, and remedial action. In a private or consortium setting, "who decides?" can (or likely _must_) be determined well in advance of any incident.

In summary, managed networks enable high-performance blockchain networks that can use consensus processes which are not suited for an environment with anonymous users. A group of trading partners can create a small network for their purposes and agree on equitable participation in the block-generation process (e.g. that each participant runs one validator), minimum performance metrics for acceptable validators, and governance, all of which enable fast confirmation and even deterministic transaction finality within their small group. The principal trade-off for this performance improvement is the shunning of permissionless, public access.

Cosmos can be applied to both public and private settings and, importantly, supports communication between networks following different consensus rules, a seemingly intractable challenge for the predecessors of Cosmos.

<HighlightBox type="reading">

**Further readings**

* [Buterin, Vitalik (2014): A Next-Generation Smart Contract and Decentralized Application Platform - The Ethereum White Paper](https://github.com/ethereum/wiki/wiki/White-Paper)
* [Nakamoto, S. (2008): Bitcoin: A Peer-to-Peer Electronic Cash System](https://bitcoin.org/bitcoin.pdf)
* [Vitalik Buterin on private chains](https://www.multichain.com/blog/2017/11/three-non-pointless-blockchains-production/)
* [Permissioned blockchains in production](https://www.multichain.com/blog/2017/11/three-non-pointless-blockchains-production/)

</HighlightBox>
