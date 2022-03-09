---
title: "Consensus Mechanisms"
order: 3
description: Overview of Consensus Mechanisms
tag: fast-track
---

<!-- Title: Proof-of-Work, URL: https://www.youtube.com/watch?v=iCYj6BfxxJE -->

**Nodes**, also known as miners, in the network conduct their searches independently. The successful node that announces a solution first receives an economic reward that encourages participation in the process. The idea of substantiating a claim through an arbitrary amount of work was previously suggested as a way to combat spam in other contexts.

If a node wishes to distort the ledger in a PoW system, it must first acquire an **authoritative position**, otherwise it will be unable to influence the ledger. Acquiring an authoritative position implies overcoming the *combined* problem-solving capacity of the network and maintaining that lead over time. This known attack vector is called the 51%-attack. As the name suggests: if a single party acquires more than 50% of the total problem-solving capacity of the network, that party is theoretically able to alter the consensus. 

The control mechanism for the amount of work is called **difficulty** and it guarantees a given average block creation time. PoW networks set a target average time for a solution to be found by *any* node on the network. Difficulty adjusts to compensate for increasing/decreasing total network problem-solving capacity. Thus, PoW networks do not get faster as more compute capacity is added. They become more resilient by increasing difficulty, which raises the threshold a 51% attacker will need to overcome.

## Proof-of-Stake (PoS)

<!-- TODO ![PoS](images/pos.png) -->

**Proof-of-stake (PoS)** is another method of selecting the authoritative node for a given block. PoS is based on the assumption that those with the most to lose are the most incentivised to safeguard network integrity.

A successful proof-of-stake system must address the problem of "nothing at stake". That is, randomly-selected validators must face a disincentive for bad behaviour as well as a high probability that bad behaviour will be detected. The burden of detection usually falls on the rest of the network that can either accept or reject the validator's opinion. A solution to the disincentive aspect is to extract a penalty for emitting opinions that are ultimately rejected by the network; validators face economic penalties when they generate blocks that are rejected by sizable numbers of other nodes. A validator is thus incentivised to generate blocks that are likely to be accepted by the network and faces economic punishment when it fails to do so.

Validators place funds at risk (i.e. **the stake**). For any given block, a validator is selected in pseudo-random fashion with a validator with more stake having a higher probability of being selected to generate a block. While PoS systems generally reward validators with new coins for honest behavior (i.e. block rewards), validators also receive transaction fees in return for generating blocks the rest of the network accepts. 

Tezos was the first large-scale, pure PoS system to launch when it did so in June 2018. An earlier and smaller PoS implementation is used in Nxt (cryptocurrency and payment network launched in 2013). PoS solves the energy problem in PoW as "work" (i.e. use of energy through computational power) is not the proof requested.

<div class="b9-info">
  <p>At the time of writing (August 2019), there are <a href="https://tzscan.io/rolls-distribution">over 460 participants in Tezos PoS</a>. MyTezosBaker, a popular curation site for Tezos validators (referred to as “bakers” in Tezos), currently lists more than 100 public delegation services from over 30 countries across 6 continents. Check out this site <a href="https://mytezosbaker.com/">here</a>.</p>
</div>

## Delegated-Proof-of-Stake (DPoS)

An extension of proof-of-stake algorithms is called delegated-proof-of-stake (DPoS). It is used for example in BitShares, EOS, Steem, Lisk and Tron.

<div class="b9-info">
	<p><a href="https://bitshares.org/">BitShares</a> is an open-source, blockchain-based financial platform launched in 2014 and the name of the corresponding cryptocurrency. It provides a decentralised asset exchange – comparable to a stock exchange like the New York Stock Exchange (NYSE) but focused on cryptocurrencies.</p>
</div>

The algorithm is called DPoS because as in PoS the value of a vote is determined by the stake, i.e. tokens held by a user. However, in DPoS systems, there is a fixed validator set. For example, in EOS, there are only 21 validators that participate in consensus. In pure PoS systems like Tezos, there is not a fixed validator set and the number of potential validators that can participate in consensus is dependent on the total supply of tokens in circulation.

In this type of consensus mechanism, so-called **"witnesses"** are elected by the stakeholders of the network. Witnesses secure the network. Afterwards, several witnesses are chosen for the block creation so that they represent at least 50% of the stakeholders' votes.

![DPoS](images/00_07_delegated_pos_dark.png)

Witnesses are paid for their services: They are paid fees for creating and validating blocks. This economic incentive to become a witness also leads to competition potentially increasing with each new member because the number of witnesses is limited.

In case a witness misbehaves, the network's community is able to withdraw their votes for a single witness, i.e. fire the witness. Witnesses that no longer hold enough votes lose their income basis.

Alongside ascribing the role of witnesses to some participants, DPoS networks also elect **"delegates"**. Delegates are a group of participants that supervise network governance and performance, and propose changes that are then voted on by the entire network.

Many consider DPoS algorithms superior to PoW and PoS because of their fast block creation, a high degree of security, energy efficiency, level of integrity, and democratic structure. However, DPoS systems are less decentralized than PoW and PoS systems because they have fixed validator sets and higher barriers to entry.


## Proof-of-Burn (PoB)

Burn in this context is very specific: Miners must send coins to a **"burn" address**, of which it is believed nobody owns the private key (i.e. a verifiably un-spendable address). The coins on the “burn” address cannot then be spent due to the absence of a private key. This is how "difficulty" in the mining process is established, similar to how solving the guessing game with computing power in PoW establishes a necessary work input and with it the degree of difficulty.

<!-- TODO ![](images/pob.png) -->

To be considered for new block creation nodes can participate in a **lottery** and will get rewarded when chosen. 

This is **expensive** from the miner's point of view because of the coins' value. PoB uses the same underlying philosophy as in the case of PoW, but furthermore the energy consumption problem and the "nothing at stake problem" are solved. 

PoB networks often have depended on PoW coins, as the "burning" is performed with them.

<div class="b9-info">
	<p>The PoB algorithm is used for example in <a href="http://slimco.in/">Slimcoin</a>. It is a cryptocurrency that can be mined with PoW, PoS, or PoB mining.</p>
</div>

## Proof-of-Importance (PoI)

The inspiration behind **proof-of-importance (PoI)** is to solve the "rich man gets richer" problem that arises in PoS algorithms. Therefore, the protocol rewards network activity based on the so-called **"importance score"**, which is calculated by graph theory. 

Similar to PoS, nodes invest a stake in the network to be eligible for selection. In the case of PoI, the stake invested is calculated from a set of variables (amount of transactions to and from an address, whether a node is part of a cluster, etc.) that are included in the score. The probability to be chosen to build new blocks increases with the value of the importance score.

<!-- TODO ![](images/poi.png) -->

PoI networks have a rationale similar to PoS but prevent hoarding as a means to increase prosperity and "nothing-at-stake" problems with the use of the importance score.

<div class="b9-info">
	<p>Proof-of-importance (PoI) is implemented in <a href="https://nem.io/">NEM</a>, a peer-to-peer cryptocurrency and blockchain platform.</p>
</div>

## Practical Byzantine Fault Tolerance (PBFT)

PBFT was published in 1999 and arose from academia. It is a three-phase protocol, in which the client sends a request to a so-called primary. 

In the first phase, the primary broadcasts the request with a sequence number to the replicas. Then the replicas agree on the sequence number and create a message. 

When a threshold of agreement is reached by the replicas, which is akin to sufficient co-signers, the message is verified. The replicas agree on the overall order of transactions within a view. The broader network is informed about transaction blocks when they are finalized. That is to say, signed by sufficient replicas to be sure that the block is finalized. 

This of course is a very simplified presentation.

<div class="b9-info"><p>
You can access the paper by Miguel Castro and Barabara Liskov <a href="http://pmg.csail.mit.edu/papers/osdi99.pdf">here</a>. But there is also a very understandble <a href="http://www.comp.nus.edu.sg/~rahul/allfiles/cs6234-16-pbft.pdf">presentation</a>. 
</p>
</div>

## Proof-of-Activity (PoA)

PoA is a combination of PoW and PoS. The miner creates a template with the nonce and deploys it to the network.

Then the signers are chosen by the block hash of this template.

If the template is signed by the signers, it becomes a block. In the end, the reward is shared between the miner and signers.

<div class="b9-tip">
	<p>For a more in-depth look at PoW, PoS, and PoA, we recommend <a href="https://eprint.iacr.org/2014/452.pdf"><i>Proof of Activity: Extending Bitcoin's Proof of Work via Proof of Stake</i></a> by Iddo Bentov et al.</p>
</div>

## Proof-of-Capacity (PoC)

<!-- TODO ![](images/poc.png) -->

PoC uses the memory or HDD of a user to reach consensus. It creates hashes and stores these. Then it selects parts of the data, taking into account the last block header in the blockchain. The selected data is hashed and must fulfill a given difficulty. PoC is utilised in order to be fairer, because memory access times do not vary as much as CPU power. 

## Proof-of-elapsed-time (PoET)

<!-- TODO ![](images/poet.png) -->

Proof-of-elapsed-time (PoET) elects a leader via a lottery algorithm. The key point is the lottery, which must be performed in a **trusted execution environment (TEE)**. For this purpose, Intel offers **Software Guard Extensions (SGX)** for applications developers.

<div class="b9-info">
	<p>A <b>trusted execution environment (TEE)</b> is a secure area of the processor that offers an isolated processing environment.</p>
	<p>It offers the possibility to load, execute, process, and store data and code in a way that maintains confidentiality and integrity by running applications in a safe space.</p>
</div>

The lottery provides every validator with a randomised wait time. The fastest validator, i.e. the one with the shortest time, becomes the leader. The leader is eligible to create a block after the allotted time. The new block must be accepted by the rest of the network.

The underlying idea in PoET is the same as Bitcoin in that the first node to announce a valid block wins. Rather than compute-intensive proof-of-work, SGX assumes the task of declaring a lottery winner. PoET is used in Intel’s Hyperledger Project Sawtooth Lake.

<div class="b9-reading">
	<ul>
	<li><a href="https://medium.com/oracles-network/proof-of-authority-consensus-model-with-identity-at-stake-d5bd15463256">Proof of Authority: <i>consensus model with Identity at Stake</i></a></li>
	<li><a href="http://tendermint.com/docs/tendermint.pdf">Tendermint</a> is a decentralised consensus engine that runs its own public blockchain and also supports decentralised computing. It differs from Ethereum on its consensus protocol, which uses the concept of validators who need to bind funds to validate and who validate blocks over the course of a certain number of rounds.</li>
	<li><a href="http://counterparty.io/platform/">Counterparty</a> aims to extend the Bitcoin blockchain and allows for a limited degree of smart contract execution. They also created their initial coins in an innovative way, by <a href="http://counterparty.io/news/why-proof-of-burn/"><i>proof-of-burn</i></a> of Bitcoins.</li>
	<li><a href="https://www.stellar.org/developers/learn/get-started">Stellar</a> was originally forked from Ripple, has now completely diverged from it, and introduced what they called a "Federated Byzantine Agreement", whereby consensus is reached by quorum slices.</li>
	</ul>
</div>
