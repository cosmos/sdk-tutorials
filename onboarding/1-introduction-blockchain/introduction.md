---
title: "Introduction to Blockchain"
order: 2
description: What is blockchain?
tag: fast-track
---

--> Curtail content and rewrite last part completely

# Introduction: What is Blockchain?

This online course aims to give you a comprehensive understanding of blockchain technology and deployment patterns, as well as technology-related concepts, different blockchain frameworks, and protocols to provide the fundamentals needed to **understand blockchain technology, how it came into being, and on what technologies it builds**.

In the next modules, you will learn about blockchain theory as well as different protocols for both public and private networks, including Ethereum, Bitcoin, and Hyperledger.

During this course we are aiming to answer the following questions:

* What does the term *blockchain* cover? What does it mean?
* What are the technical fundamentals that allowed for the development of blockchain technology?
* How do different approaches and protocols work?
* What are the characteristics of each?
* How does the blockchain protocol landscape look like?

There are many different ways to understand blockchain technology. In order to give you a thorough understanding and a complete view, we will not restrict ourselves to one single definition and understanding. Instead, we will present you with a vast spectrum of conceptualisations throughout this module. 

Let us start with an overall introduction to this exciting and sometimes intangible technology everybody is talking about.

## What is blockchain?

Blockchain is a complex and rapidly evolving technology. It took up many bright minds many years of development, plus a combination of advances in cryptography, distributed computing, and economics to create the current technology. Expect grasping blockchain to require serious effort.

The blockchain journey begins with a problem...the **double-spending problem**.

The double-spending problem refers to a potential flaw in a cryptocurrency or other digital cash scheme: The same single digital token can be spent more than once regardless of the available account balance.

Satoshi Nakamoto, whose identity remains shrouded in mystery, published his seminal White Paper [*Bitcoin: A Peer-to-Peer Electronic Cash System*](https://bitcoin.org/bitcoin.pdf) in October 2008. 

<div class="b9-tip">
	<p><a href="https://bitcoin.org/bitcoin.pdf"> Satoshi Nakamoto: Bitcoin: A Peer-to-Peer Electronic Cash System</a> - It is a fairly straightforward paper, having a look at it is recommended.</p>
</div>

To solve this problem, Satoshi Nakamoto presented a solution to the **double-spending problem** for digital currencies by giving the first working example of a blockchain application in the form of a simple implementation called **Bitcoin**. In doing so, he revealed the underlying technology known as blockchain.

Bitcoin has gained widespread attention since then. The world has discovered the underlying technology of Bitcoin, blockchain, and its usefulness across many contexts and implementations.

### What does blockchain solve?

We're all familiar with digital artefacts and the ease with which they can be copied. This presents obvious problems if we want digital artefacts to represent assets with value. 
But a more pressing issue is the possibility of spending a digital token more than once. What prevents someone from making copies and spending the same money twice? 

In the **current economic system**, double-spending is avoided by the involvement of the financial sector, i.e. **third parties that manage and control financial transactions**. A third party such as a bank, credit card company, or payment service is used as a **trusted ledger keeper**. They all keep digital ledgers to avoid double-spending. 

Consequently, it is generally not possible for two parties to exchange value online without involving a trusted third party to handle the settlement process. 

At a high level, Bitcoin solves the problem by replacing the trusted **central ledger-keeper** with a **network of ledger-keepers**. Each member of the network has an exact replica of the ledger. No one can append the ledger without achieving network consensus about it first.

It is as though each transaction is observed by a *large crowd of witnesses* who reach consensus about proposed changes. They also prohibit events that should not occur, such as spending non-existent funds twice, i.e. double-spending. 

Bitcoin and its underlying technology convincingly demonstrate that a network of participants, that don't necessarily trust each other, can form a consensus about the validity of a transaction, its history, and the resulting state of the ledger. 
This is interesting because simple ledgers of account balances and simple protocols for moving funds are far from the only use cases for shared data consensus.

### How does blockchain work?

Imagine one wants to **retain and monitor changes** to a file, for example a logfile. Now, imagine one also wants to verify an unbroken history of all changes ever made to the file. How can one proceed? 

A well-understood solution uses cryptographic [hash functions](https://en.wikipedia.org/wiki/Cryptographic_hash_function). 

Let us briefly introduce the concept of cryptographic hash functions in case you are unfamiliar with it.

The ideal cryptographic hash function has **five main properties**:

* **Deterministic**: the same message always results in the same hash;
* **Fast**: the hash value for any given message is computed quickly;
* **Resistant**: it is infeasible to generate a message from its hash value except by trying all possible messages;
* **Avalanche effect**: a small change to a message should change the hash value so extensively that the new hash value appears uncorrelated with the old hash value;
* **Unique**: it is infeasible to find two different messages with the same hash value.

<div class="b9-tip">
	<p>You can see hashing in action to get the feel for it here: <a href="http://onlinemd5.com/">http://onlinemd5.com/</a>. As you type in the text box the hash updates automatically. Even a minuscule change to the input creates a completely different hash.</p>
</div>

Notice that there are many different hashing algorithms that aim for similar results as described above. Each algorithm consistently produces hashes of the same size regardless of the size of the input.

A hash can be used to prove an input exactly matches the original, but the original cannot be reconstructed from a hash. 

<div class="b9-tip">
	<p>For a more detailed explanation of hash functions see <i><b>cryptographic hash functions</b></i> in the <i>Cryptographic Fundamentals</i> section of this Module.</p>
</div>

But what about subsequent changes to the file?

Let us suppose that we will only append new entries to the end of the file. 

We can make a rule that states that in addition to the new content, the previous hash will also be an input of the next hash. 

The (pseudo-)code would look like this: 

```javascript
version2Hash = hash(version2Changes + version1Hash)
```

The above allows to examine proposed changes and confirm the previous file, while making sure subsequent changes are accurately disclosed. 

With the method presented, it is possible to create a chain of hashes and with it a cryptographic secure history.

This process repeats for all subsequent versions. Any version of the file contents can be shown to be part of an **unbroken chain of changes** all the way back to the file's inception. 

This is pure mathematics. Any deviance from the system, e.g. a hash that does not compute as expected, proves a break in the history and is therefore invalid. 

![the blockchain](images/blockchainintro.png)

Since knowing the current hash of the latest valid version is a required input to the next version's hash function, it is impossible to generate a new valid version that precedes it. 
This means changes must be appended to a previous valid version.

Blockchain functions in a similar way. **Blocks of transactions** are appended using hashes of previous blocks as inputs into hashes of subsequent blocks. Any participant can quickly verify an unbroken chain of blocks, i.e. the correct order.

In blockchain, cryptographic hash functions are instrumental to empower all participants. In addition, they assure participants that they possess an undistorted history of everything. 

### Why order is so important in blockchain

Transaction blocks are logical units that wrap up **a set of transactions in a specific order**. While the implementation details are somewhat more subtle, for now, we can think of this as the set of transactions that occurred during a set time interval and in a specific order.

Transaction ordering is surprisingly challenging in a distributed system due to design goals and constraints.

We will use the example of Bitcoin and its novel solution to understand how this can be addressed.

* As it is a distributed network, **everyone** has a little bit of authority. For example, all nodes can propose transactions and then announce that information to other nodes. 
* In a truly distributed network, no one's clock is considered more authoritative than anyone else's clock. Therefore, blockchain is a distributed **timestamp** server **without a central network time**. 
* Theoretically, anyone can listen to transaction proposals and organise a valid block containing an *opinion* about the correct order of events. 
* Because of **physics and network latency**, everyone in the network will learn about transaction proposals in a slightly different order.
 
So how is the **order of transactions** determined?

Even if we assume that all members of the network mean well and participate honestly, each node will arrive at a slightly different opinion about the ordering of transactions. This is simply a result of network latencies.

Although there is no obvious way to settle it, **transaction order must be resolved** because processing transactions out of order would produce non-trivial differences in outcomes. Such a non-trivial difference would be for example an instance of double-spending. Without agreement about the transaction order, there can be no agreement about the balances of accounts. 

### Blockchain as a lottery

The state with a disambiguated transaction order is called **consensus**. The consensus process happens independent of an authoritative time source. 

Bitcoin uses a process, i.e. consensus algorithm, called **proof-of-work** (PoW) which can be (simplistically) thought of as a lottery. The lucky winner gets the privilege of being authoritative for one block of transactions.

The winning lottery ticket, called the **nonce**, is used as the next input for the hash function. This is easily verified by other participants.

The lottery winner can generate a valid block about the order of transactions. The block is then valid.

It is important to note that a valid block does not mean this block represents some form of absolute "truth"; **The "truth" in blockchain is the longest chain of valid blocks**.

In case the foregoing is not clear: 

* a valid block is a well-ordered **set of transactions**, 
* the block contains the **hash** of the previous block, and
* the block includes a "winning lottery ticket", the **nonce**.

Other participants recognise this unlikely combination -Unlikely because of the winning lottery ticket. They accept the block as a de facto correct opinion about the order of transactions. Respective, only for so long there is no fork in the chain with more validated blocks.

A well-ordered set of blocks of well-ordered transactions is in the end a well-ordered set of all transactions.

Since all nodes can verify the chain independently, they can proceed on the assumption that all other nodes will eventually come into agreement about the history of everything.

## Quick recap

<!-- Title: Introduction to Blockchain, URL: https://www.youtube.com/watch?v=-KKMoBpHQSI -->

A blockchain starts with the **genesis block**. This is a simple matter of an initialised universe in which nothing has happened yet. Think of it as a pre-Big Bang universe. As soon as the first block of transactions is generated, i.e. the Big Bang, the universe starts expanding.

The blockchain proceeds by constructing a verifiable and widely agreed history of every transaction that has ever occurred.

Nodes have a copy of the present state (ledger) with the ordered history of every single change, i.e. the transactions.

The history of everything that has ever occurred moves forward in time as "lottery winners" announce new transaction blocks. In order to achieve network consensus each new block must be verified.

## About the Technical Fundamentals Module

We find ourselves in a phase of Cambrian explosion: The diversity of ideas and approaches for the utilisation of blockchain technology increases on a daily basis. One is confronted with disparate assessments in regard to the strengths and weaknesses of the different protocols and software. Thus, decision makers, researchers, and blockchain interested individuals are facing the challenge to acquire a general overview in this vast field and connect it to their existing expertise and knowledge to be able to make substantial analysis, research, and assessments.

This module is a general introduction to the concept of blockchain. It is not very technical and it will reiterate concepts that you might already know. Existing terminology and technologies are repeated because they feed into blockchain technology. Thus, it makes sense from a structural perspective to revisit certain important aspects and understand how they apply to the technology.

In this module, we will:

* revisit the development of computing over the past decades and how blockchain fits into it, 
* briefly describe different types of databases and network functioning to introduce the concept of a ledger and consensus, which are central in blockchain technology,
* explore the differences between private and public keys, as well as other cryptographic essentials,
* give you an idea of the more recent history of blockchain and introduce taxonomy, attributes, and concepts related to blockchain technology,
* offer you the opportunity to play around with MetaMask.

Have fun!
