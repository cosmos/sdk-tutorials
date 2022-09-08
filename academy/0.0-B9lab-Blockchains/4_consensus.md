---
title: "Consensus in Distributed Networks"
order: 5
description: An introduction to distributed consensus
tags: 
  - concepts
---

# Consensus in Distributed Networks

A known challenge in distributed computing, which is provably unsolvable but can nonetheless be mitigated, is how to reach **consensus** in a hierarchy-free, permissionless, and failure-prone network. In a distributed network without authorities, we need a process to reach consensus about what is to be considered the **truth**. This is referred to as distributed consensus.

This problem is commonly known as the **Byzantine Generals Problem** and mitigation strategies for it are subsumed under the term **Byzantine Fault Tolerance (BFT)**.

An overview of well-known blockchain solutions provides perspective and insight into the options Cosmos offers, because Cosmos allows a network designer to choose the consensus algorithm that is best suited to the developer's purpose.

In the traditional description of the problem, generals, whose armies are spread around a target city, need to reach consensus on a time to attack. The generals can only rely on **unsecured communication channels** to achieve this. A lack of acknowledgment can either be caused by a failure to deliver a message, by a dead general, or by a failure to deliver the acknowledgment. While there are variations of the problem description to adapt to varying real-world fault-tolerance situations, most descriptions include an element of catastrophe if the generals fail to coordinate their actions.

![Byzantine Generals Problem](/academy/0.0-B9lab-Blockchains/images/00_06_byzantine_generals_dark_notitle-01.png)

Similar to the generals who must decide when to attack, the agreed transaction list in a distributed ledger has to be identified, and consensus on the correct order of transactions has to be reached.

<HighlightBox type="info">

Remember, individual transactions are sent to the network from individual nodes. Each node must pass (or fail to pass) transactions to other nodes. Because of the time delay required for data to physically travel across the network (i.e. physical latencies), not all nodes will see the same transactions at the same time. Each node must therefore build its own order of transactions. Since all nodes participate equally, there is **no authoritative order of transactions**. Nevertheless, the network must decide which node's version (or any version) of the truth will become the authoritative truth, also known as the canonical chain.

</HighlightBox>

In addition to the chain of blocks, one of the innovations introduced by Bitcoin was to use **proof-of-work (PoW)** to reach consensus. Since then, many other consensus algorithms have been proposed and employed. One should note that there were consensus algorithms presented in the academic community _before_ Bitcoin.

Many teams have experimented with distributed consensus using many algorithms deployed to different chains. The algorithms that exist can be compared in terms of the distribution of authority, expected performance, and transaction finality. Transaction finality can be categorized as:

* **Probabilistic:** it is exponentially more improbable that a seen transaction will be reversed.
* **Deterministic:** the protocol prevents alterations in a definite way.

Let us look at some of the most popular consensus algorithms to keep in mind when diving into consensus in Cosmos.

## Proof-of-Work (PoW)

A user completes a task of **arbitrary difficulty**. This is generally implemented as a search for a random number, which when combined with ordered transactions in a block yields a hash function result that matches certain criteria, such as a minimum number of leading zeroes. Finding such a solution is taken as evidence of considerable effort, meaning proof that considerable work **must** have been invested in the search.

<HighlightBox type="info">

The idea of substantiating a claim through an arbitrary amount of work was previously suggested as a way to combat denial-of-service (DoS) attacks and spam in other contexts. "Work" is understood as the amount of specific computational effort used.

</HighlightBox>

The network's **nodes**, also known as miners, conduct their searches independently. The successful node that announces a solution first receives an economic reward to encourage participation in the process.

If a node wishes to distort the ledger in a PoW system, it must first acquire an **authoritative position** or it will be unable to influence the ledger. Acquiring an authoritative position implies overcoming the *combined* problem-solving capacity of the network and maintaining that lead over time. This known attack vector is called the 51%-attack. As the name suggests, if a single party acquires more than 50% of the total problem-solving capacity of the network, that party is theoretically able to alter the consensus.

The control mechanism for the amount of work is called **difficulty** and it guarantees a given average block creation time. PoW networks set a target average time for a solution to be found by *any* node on the network. The difficulty adjusts to compensate for increasing/decreasing total network problem-solving capacity. Thus, PoW networks do not get faster as more computing capacity is added. They become more resilient by increasing difficulty, which raises the threshold a 51%-attacker needs to overcome.

## Proof-of-Authority (PoA)

**Proof-of-Authority (PoA)** is a simple mechanism that solves for faster block times by relying on validators that are pre-selected based on the belief that they are trustworthy. In other words, validators are allowed to produce blocks based solely on their pre-existing authority. A frequently cited criticism of PoA networks is that everyone needs to trust the validators in order to trust the overall network and blockchain.

## Proof-of-Stake (PoS)

**Proof-of-stake (PoS)** is another method of selecting the authoritative node for a given block. PoS is based on the assumption that those with the most to lose are the most incentivized to safeguard network integrity. Thus, block validators are selected based on their stake (i.e. the amount of cryptocurrency held).

A successful PoS system must address the problem of "nothing at stake". That is, randomly-selected validators must face a disincentive for bad behavior as well as a high probability that bad behavior will be detected. The burden of detection usually falls on the rest of the network, which can either accept or reject the validator's opinion. A solution to mitigate the "nothing at stake" problem is to extract a penalty for emitting opinions that are ultimately rejected by the network: validators face economic penalties when they generate blocks that are rejected by sizable numbers of other nodes. A validator is thus incentivized to generate blocks that are likely to be accepted by the network and faces economic punishment when it fails to do so. Validators place funds (i.e. **the stake**) at risk.

For any given block, a validator is selected in a pseudo-random fashion. The validator with a larger stake has a higher probability of being selected to generate a block. While PoS systems generally reward validators with new coins for honest behavior, so-called **block rewards**, validators also receive transaction fees in return for generating blocks that the rest of the network accepts.

## Delegated-Proof-of-Stake (DPoS)

An extension of Proof-of-Stake algorithms is called Delegated-Proof-of-Stake (DPoS). It is used for example in BitShares, EOS, Steem, Lisk, and Tron.

The algorithm is called DPoS because, as in PoS, the value of a vote is determined by the stake (i.e. tokens held by a user). However, there is a fixed validator set in DPoS systems. For example, in EOS, there are only 21 validators that participate in consensus. In pure PoS systems, there is no fixed validator set and the number of potential validators that can participate in the consensus mechanism is dependent on the total supply of tokens in circulation.

In this type of consensus mechanism, so-called **witnesses** are elected by the stakeholders of the network to secure the network. Afterward, several witnesses are chosen for the block creation so that they represent at least 50% of the stakeholders' votes.

![Delegated-Proof-of-Stake](/academy/0.0-B9lab-Blockchains/images/00_07_delegated_pos-01.png)

Witnesses are paid for their services, receiving fees for creating and validating blocks. This economic incentivization to become a witness also leads to competition potentially increasing with each new member, because the number of witnesses is limited.

In case a witness misbehaves, the network's community can withdraw their votes for a single witness (i.e. they fire the witness). Witnesses that no longer hold enough votes lose their income basis.

Alongside ascribing the role of witnesses to some participants, DPoS networks also elect **delegates**. Delegates are a group of participants that supervise network governance and performance, and propose changes that are then voted on by the entire network.

Many consider DPoS algorithms superior to PoW and PoS because of their fast block creation, high degree of security, energy efficiency, level of integrity, and democratic structure. However, DPoS systems are less decentralized than PoW and PoS systems because they have fixed validator sets and higher barriers to entry.

## Practical Byzantine Fault Tolerance (pBFT) and Tendermint

<ExpansionPanel title="What is Byzantine Fault Tolerance?">

When a distributed network reaches consensus even with nodes failing to respond or responding with wrong information (i.e. faulty nodes), it has Byzantine Fault Tolerance (BFT). BFT ensures that a distributed network can continue to work even with faulty nodes, as the consensus is a result of collective decision-making.

Failures in a Byzantine sense are:

* **Fail-stop failures:** the node fails and stops operating.
* **Arbitrary node failures:** the node fails to return a result, responds with an incorrect result deliberately or not, or responds with a result different from other results in the network.

The term BFT is derived from the Byzantine Generals Problem.

</ExpansionPanel>

Practical Byzantine Fault Tolerance (pBFT) was first introduced in 1999 and arose from academia.

<HighlightBox type="tip">

You can access the 1999 paper by Miguel Castro and Barbara Liskov on pBFT [here](http://pmg.csail.mit.edu/papers/osdi99.pdf). There is also an intuitive [presentation](http://www.comp.nus.edu.sg/~rahul/allfiles/cs6234-16-pbft.pdf) you can look at.

</HighlightBox>

In pBFT, a replica is a network node that maintains a full copy of the ledger state. pBFT is a three-phase protocol, in which the client sends a request to a so-called primary. In the first phase, the primary broadcasts the request with a sequence number to the replicas. Then the replicas agree on the sequence number and create a message.

When a threshold of agreement is reached by the replicas, which is akin to sufficient co-signers, the message is verified. The replicas agree on the overall order of transactions within a view. The broader network is informed about transaction blocks when they are finalized. That is to say, they are signed by sufficient replicas.

pBFT brings two main advantages to consensus on blockchains:

* **Energy efficiency:** consensus is achieved without having to conduct expensive computations such as in PoW algorithms.
* **Transaction finality:** once a block is finalized, it is immutable and with it all included transactions.

This of course is a very simplified presentation.

While most consensus implementations are tightly coupled with a particular blockchain project, **Tendermint** is a toolkit that focuses on simplifying the process of creating blockchains (among others) by offering a decentralized consensus mechanism called Tendermint Core. Tendermint's decentralized consensus engine runs its own public blockchain. It differs from Ethereum on its consensus protocol, as it uses the concept of validators who need to bind funds to validate, and who then validate blocks over the course of a certain number of rounds.

As the reader might guess, Cosmos relies on Tendermint Core. It offers the most mature Byzantine Fault Tolerance, transaction finality, and a great deal of flexibility - flexibility that is passed to the developers of custom blockchains built with the Cosmos SDK.

<HighlightBox type="info">

Tendermint will be explored in detail in the [Main Concepts](../2-main-concepts/index.md) section.

</HighlightBox>

<HighlightBox type="reading">

**Further readings**

* [Castro, M. & Liskov, B. (1999): Practical Byzantine Fault Tolerance](http://pmg.csail.mit.edu/papers/osdi99.pdf)
* [Castro, M. & Liskov, B.: Practical Byzantine Fault Tolerance presentation](https://www.comp.nus.edu.sg/~rahul/allfiles/cs6234-16-pbft.pdf)
* [Curran, B. (2018): What is Pracictcal Byzantine Fault Tolerance? Complete Beginner's Guide](https://blockonomi.com/practical-byzantine-fault-tolerance/)
* [Kwon, Jae (2014): Tendermint: Consensus without Mining](http://tendermint.com/docs/tendermint.pdf)
* [Vasa (2018): ConsensusPedia: An Encyclopedia of 30 Consensus Algorithms. A complete list of all consensus algorithms](https://hackernoon.com/consensuspedia-an-encyclopedia-of-29-consensus-algorithms-e9c4b4b7d08f)
* [Vitalik Buterin (2016): On Settlement Finality](https://blog.ethereum.org/2016/05/09/on-settlement-finality/)
* [Witherspoon, Z. (2013): A Hitchhiker’s Guide to Consensus Algorithms. A quick classification of cryptocurrency consensus types](https://hackernoon.com/a-hitchhikers-guide-to-consensus-algorithms-d81aae3eb0e3)

</HighlightBox>
