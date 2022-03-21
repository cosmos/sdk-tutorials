---
title: "Consensus"
order: 6
description: Consensus and decentralized networks
tag: fast-track
---

--> Curtail content

# Consensus

A blockchain is a well-ordered set of data on which all peers *eventually* agree, i.e. achieve **consensus**. What they agree on is considered as the single truth. 
Reached by consensus, the **single truth** is the <b><i>single true state of the distributed ledger</i></b>. To guarantee data consistency consensus has to be reached. 

In this section, we will take a closer look at consensus in blockchain technology by starting with the Byzantine General's problem and how it can be resolved. We will also address immutability, incentives to avoid denial-of-service (DoS) attacks, and the meaning of block time.

## The problem

The **Byzantine General's Problem** is a consensus-reaching problem which can be applied to hierarchy-free, permission-less, and failure-prone networks, i.e. distributed computing. Mitigation strategies for it are known as **Byzantine Fault Tolerance (BFT)**. 

What is the Byzantine General's Problem?

![Visualisation Byzantine General's Problem](images/generals.png)

Imagine a trio of generals whose armies surround a target city. The generals are physically far away from each other and can only communicate via messengers who could fail to deliver messages and/or acknowledgements, or even forge false ones, i.e. the generals can only use **unsecured communication channels**. Even the generals themselves have questionable loyalty and do not necessarily trust one another. The siege can only be won if the generals work together. But how can the generals reach consensus on whether they want to attack or retreat, and if they want to attack on when to exactly do it?

## How does the Byzantine General's Problem relate to blockchain?

Similar to the generals who must decide when to attack, in a distributed ledger the agreed transaction list has to be identified and consensus on the correct order of transactions has to be reached.

Remember, individual transactions are sent to the network from individual nodes (distributed technology). Each node must pass (or fail to pass) transactions to other nodes. Because of the time delay required for data to physically travel across the network (i.e. physical latencies), not all nodes will see the same transactions at the same time. Each node must therefore build its own order of transactions.

Since all nodes participate equally, there is no authoritative order of transactions. Still, the network must decide which node's version, or any version, of the truth will be the authoritative truth.

## A solution: Proof-of-Work (PoW)

Remember our three generals? Byzantine Fault Tolerance can be achieved if the loyal (non-faulty) generals reach a majority agreement, i.e. consensus, on their attack strategy.

**Proof-of-Work (PoW)** is one way to achieve Byzantine Fault Tolerance. PoW is a cryptographic puzzle first introduced with Hashcash. It was reused in Bitcoin and has been widely adopted since then. 

Here is how it works: 

<!-- Title: Proof-of-Work, URL: https://www.youtube.com/watch?v=iCYj6BfxxJE -->

A node, also known as a **miner**, completes a task of pre-defined, arbitrary difficulty. The task is usually a search for an unknown, random number (a **nonce**). When the miner combines this number with ordered transactions in a block, it results in a hash value that matches pre-defined criteria. A common criterion is a minimum number of zeros at the beginning of the hash.

Only when the hash value is produced does the unknown number become the known number -because of the nature of hash values. That means the miner has to try many different numbers to find the right number. Finding the number is considered as evidence of considerable effort, or proof that a lot of work must have been invested in the search.

Nodes conduct their searches independently. Each node or miner uses its computing power in order to be the first to solve the puzzle, thereby winning the right to be the latest block's authority.

The node that announces a solution first also receives a reward, so there is an incentive to participate in the problem-solving process. Since computing power is not free but consumes electrical power, an economic reward structure is baked into the PoW process. The winning miner is rewarded with freshly minted Bitcoins for example. The idea of substantiating a claim through an arbitrary amount of work was previously suggested as a way to combat spam in other contexts.

<div class="b9-info">
	<p>According to the <a href="https://digiconomist.net/bitcoin-energy-consumption">Digiconomist's Bitcoin Energy Consumption Index</a>, Bitcoin currently consumes 65 TWh of electricity every year -about the same as Switzerland. In early <a href="http://motherboard.vice.com/read/bitcoin-could-consume-as-much-electricity-as-denmark-by-2020">estimates in 2016</a>, it was assumed the Bitcoin network would consume as much electricity as Denmark by 2020. Some assessments go even as far as 1 GW.</p>
</div>

In a PoW network, a node must acquire an authoritative position if it wants to distort the ledger or it will be unable to influence the ledger. Acquiring an authoritative position means overcoming the **combined problem-solving capacity of the entire network** and maintaining that lead over time. This known attack vector is called the 51%-attack.

As the name suggests, if a single party acquires more than 51% of the total problem-solving capacity of the network, i.e. mining power, that party is theoretically able to alter the consensus.

Why is that?

If a party holds more than 51% of the total mining power, that party in the long-run always holds a probabilistic advantage over other miners and with it can dictate the true state of the blockchain by in the end mining the longest chain.

There must be **difficulty**, the control mechanism for the amount of work, involved in minning. It guarantees a given average block creation time. PoW networks set a target average time for a solution to be found by **any** miner/node on the network. The difficulty of the task adjusts **according to the total problem-solving capacity of the network** to compensate for increasing/decreasing network capacity. That means PoW networks do not get faster even if more computing power is added. PoW networks become more resilient by **increasing difficulty**, which raises the threshold a 51% attacker will need to overcome.

The version of the block accepted as the truth is the one that comes with a nonce - remember the winning lottery ticket? The nonce is a one-time-use unknown number/word and is arbitrary. It can only be used once. When added to the block and hashed, the nonce returns a small enough value, i.e. a hash that starts with the right number of leading `0`s.

In binary, for every nonce, you have:

* a `1/2` chance of getting a hash that starts with a `0`,
* a `1/4` chance of getting a hash that starts with `00`,
* a `1/1024` chance of getting a hash that starts with `0000000000`.

The only way to find a nonce that returns the desired value is to repeatedly try random values. The miner node that finds an answer has most probably tried a large number of times, which is why the process is called *proof-of-work*. In effect, miners harness their computing power in order to be the first to solve the puzzle and thereby winning the right to be the latest block's authority. Since computing power is not free but consumes electrical power, a reward structure is baked in. In Bitcoin, the winning miner is rewarded with freshly mined bitcoins.

<div class="b9-info">
	<p>According to the <a href="https://digiconomist.net/bitcoin-energy-consumption">Digiconomist's Bitcoin Energy Consumption Index</a>, Bitcoin currently consumes 65 TWh of electricity every year -about the same as Switzerland. In early estimates in 2016, it was assumed the Bitcoin network would consume as much electricity as Denmark by 2020. Some assessments go even as far as 1 GW.</p>
</div>

The probabilistic number of times a miner has to try is a measure of difficulty. At the time of writing, the difficulty is such that miners have to find a nonce with **69 leading `0`s**.

## *Eventual* consensus

In colloquial understanding, consensus refers to a general agreement in a group. 
To understand consensus in blockchain technology, remember that the truth is the state all participants agree upon. 
We say that consensus is eventual because blocks are created as transactions are performed, i.e. what is agreed upon depends on the operations taking place.

The following section will cover why eventual consensus is important and how consensus is reached in case of competing claims.

### The CAP theorem

Remember that blockchain is a distributed system that keeps track of a shared ledger of transactions.

The **CAP theorem**, also known as *Brewer's theorem* after Eric Brewer, states that in a distributed system you can at most pick 2 out of the following 3:

* **consistency**: each node sees the same data all the time;
* **availability**: any request for some data is always available and answered with a response;
* **partition tolerance**: the distribute system is always operational, even when a subset of nodes fails to operate.

When for example partition tolerance is given, it has to be decided whether one wants to promote consistency or availability.

Choosing availability over consistency when partition is given, i.e. the distributed system is operational and requests receive response, data could be out of date and the response could thus include outdated data.

Choosing consistency over availability when partition is given, i.e. the distributed system is operational and data is up to date, the system could fail to be available for the network participants.

Blockchain aims for perfect availability and reaches eventual consistency by making partitions (unintentional forks) economically uninteresting (See: [CryptoGraphics: CAP Theorem](https://cryptographics.info/cryptographics/blockchain/cap-theorem/)). Partition is a necessity in distributed networks, thus only the trade-off between consistency and availability has to be considered when designing a network.

**Partition tolerance** becomes a given as blockchains are decentralised and therefore operational even when a number of nodes is no longer operational. Blockchains need to have partition tolerance because of their nature.

**Availability** is essential for blockchains as the state has to be accessible to all nodes. Thus, blockchains offer availability as it is part of the foundations of the general architecture.

Just imagine a blockchain system would prioritise consistency over availability. In case of a connectivity issue and/or failing nodes, coins would no longer be transferable as their can be unanswared requests. For this reason, availability is chosen over consistency.

What happens if two or more nodes win the mining puzzle at the same time?

In this case, other nodes would receive competing claims about the winner. However, individual nodes are unlikely to receive both claims simultaneously. The protocol selects the block with the most transactions or with the most complex puzzle solved.

If still undecided, we then have a **fork**, i.e. two competing truths. As further blocks are added to each side of the fork, nodes will re-evaluate each for length and complexity, and potentially decide which side of the fork to keep working with. With time, it becomes less and less likely that both sides of the fork will have identical lengths and complexities. This is how eventual consensus is reached and with it after time also **consistency** across the states each node has.

Blockchain networks are able to reach all 3 properties of the CAP theorem with time by focusing on availability and partition tolerance, and reaching consistency with the help of consensus algorthms. As is the case with the consensus, consistency is eventual. It is reached over time by for example mining and block production in general.

<div class="b9-tip">
	<p>In case you want to read more about how Bitcoin solves the CAP Theorem take a look at: <a href="https://paulkernfeld.com/2016/01/15/bitcoin-cap-theorem.html">Kernfeld, P. (2016): <i>How Bitcoin Loses to the CAP Theorem</i></a>.</p>
</div>

## Forking

In software engineering, **forking** describes a process in which a developer works on a copy of a source code to create a new, independent piece of software. 
In the blockchain context, the term **forking** has an added significance.
The mechanism is analogous, but it is applied and intended for different purposes. 

<div class="b9-expandable-box">
	<div class="b9-expandable-title">
		Block creation!
	</div>
	<div class="b9-expandable-text">
		<p>A valid block is a <b>well-ordered set of transactions</b>. Every block contains the <b>hash of the previous block</b> and the <b>nonce</b> (i.e. the "winning lottery ticket"). After a valid block with the hash of the previous one and the nonce is proposed, it is validated by the network participants and becomes part of the blockchain. As such, it is part of the eventual consensus of the chain, i.e. the "true" state of the ledger.</p>
	</div>
</div>

A more recent block points to the block that came right before it. 
It does this by storing the hash of the immediately preceding block. 
It is possible for 2 different blocks to claim to be the successor of a given block.

In this case, we say that there is a **fork**. 
The order of blocks continues on **two different paths** in its transaction history or regulation on transaction validation. 
The chain of blocks splits up so to say. 
Each blockchain protocol provides a mechanism to eventually choose a single branch of the fork automatically, unless the user explicitly instructs its client (hardware or software that accesses the remote service on another computer) to follow a specific fork. 
Forks are introduced as a <b><i>mean to reach consensus even when the community is not of the same opinion</i></b>.

![Fork Example](images/blockchain_forking.png)

Remember the lottery analogy: What happens when more than one person has a winning ticket?

Imagine you have a chain of blocks. 
Now, two blocks are suggested for the next free position in the chain. 

In this instance the chain breaks up in two strands. 
The two chains can both continue building their respective chain.

Forks are often a result of changes made to the blockchain protocol. 
As a blockchain network evolves, so does the protocol. 
The changes made to the protocol can be minor but also major.

When a block introduces a protocol change, which is not supported unanimously, a fork can result. 
The network separates into two different groups. 
Both groups use a different version of the blockchain.

When talking about forks, it is important to note that they can be differentiated in:

* **accidental forks**, and 
* **intentional forks**.

**Accidental forks** occur when two or more miners find a block almost at the same time. 
Thus, both blocks have the same block height. 
This type of fork is a result of blockchain's decentralisation.

The fork is solved with the rule: **the longest chain is the one selected**. 
The shorter chain, **orphaned block**, is abandoned.
When a chain of blocks contains an invalid transaction, it is also abandoned.

An **intentional fork** is as the name suggests intentionally generated by either a developer or an attacker. 
Intentional forks are used to change the rules of a blockchain, the protocol. 

**Intentional forks** are either:

* **hard forks**, or
* **soft forks**.

What is a **hard fork**?

A **hard fork** represents a change in the protocol of a blockchain that is not backward-compatible. 
It is not backward-compatible because the *new rules* for validating are different in such an extent that the *old rules* would see *new-rule blocks* as invalid. 
Therefore, all nodes would have to accept the change and implement it by using the *new rules* to maintain a unified rule for validation.

If a group of nodes objects to using the *new rules* and continue using the *old rules*, a fork occurs.

An example of such a hard fork was the split into Ethereum and Ethereum Classic as a result of the DAO.

<div class="b9-info">
	<p>For more on the DAO see the Module on <b>Deployment Patterns</b>, the section on <i>Social Dimensions: Why is Change Management Important in the Blockchain Context?</i>.</p>
</div>

If a hard fork is a change in the rules of a blockchain, what is a **soft fork**?

A **soft fork** is a change of the protocol with which the rules enforced are restricted. 
Thus, it is backward-compatible.

A soft fork can also result in the chain splitting up. 
This happens, when blocks are created under the *old rules* and then regarded invalid by the *new rules*. 
A valid block under the *old rules* can become invalid under the *new rules* by nodes that are implementing these rules.

Soft forks are often used to update the blockchain's protocol.

## Immutability

Immutability refers to the unchangeability of objects over time and/or the inability to perform changes. In the case of blockchains, once data has been included into the blockchain editing or deleting it is nearly impossible. Hence, immutability is one of the most attractive characteristics of blockchain technology. 

In private databases, most end-users get read-only access. Full access is usually limited to system administrators. The organisational structure of a system is designed to prevent malicious behaviour. Often, other than organisational design, no control system ensures data immutability. In blockchain technology, the use of hashes and blocks ensure a high degree of immutability and an easy tampering detection.

If a participant tries to remove or edit data, the block’s hash and chain would fail. In addition, the changes could only be introduced by using the consensus mechanism of the network.

Let us take a closer look at the problem of immutability and the solution blockchain technology provides. 

### The problem

When a new node connects to the network, or returns after being offline, it needs to download the existing blockchain. For this, it relies on the peers it connects to. The peers help by sending the latest block, the previous blocks plus the list of past transactions.

Among the peers, there may be one or more malicious nodes. These malicious nodes may decide to withhold certain transactions and, conversely, to send transactions that do not appear in the blockchain on which honest nodes agreed.

How does this new node eventually reach the same consensus as the honest nodes?

### A solution

Each block of the blockchain is identified by:

* the hash of its predecessor,
* the root hash of its transaction's Merkle tree,
* a nonce that solves the mining puzzle,
* a hash of the above.

For a malicious node to remove or insert transactions, it would need to:

* update the root hash of the containing the block's Merkle tree,
* update the nonce of the containing block,
* update the hash of the containing block,
* do the same for all subsequent blocks.

This is theoretically possible, but in practice would require the malicious nodes to harness more processing power than the honest nodes in practice. Hence the term 51%-attack is used.

A node will almost certainly end up connecting to an honest node during its life. This honest node would tell the new node a different truth from that of the malicious nodes, after which the new node would need to make a decision. 

It will always decide to go with the **longest or more difficult fork**.

We say the blockchain is **immutable** because of the practical difficulty to include new or change old data.

## Uniqueness

You are well aware that duplicating a digital asset is easy. For instance, you can easily copy or send a song encoded as an MP3 file. There is no notion of uniqueness here.

![Spent Outputs](images/Spent_Outputs.png)

Bitcoin introduced the notion of uniqueness through the concept of spent and unspent outputs (UTXO). Every transaction takes unspent outputs as inputs and creates other unspent outputs as outputs. The previously unspent outputs are then considered spent. An output is considered unspent unless proven otherwise. That is the reason why nodes need to download the entire blockchain in order to determine ownership of unspent outputs -or in other words, to compute an address's balance.

## Economic (dis)incentives

Like any online service, a blockchain is vulnerable to a DoS attack, which when performed on a centralised system is basically a flood of bogus requests that overwhelm the central servers. As the server can no longer process legitimate requests, the whole service is taken down by the attack.

A blockchain node could be flooded in the same way, thereby forcing it off the network. A key difference between a centralised system and a distributed one is that for the distributed *service* to be shut down, an attacker would need to take all its nodes down. This is how blockchain ensures partition tolerance (See *CAP Theorem* section above).

### Transaction fee

If the attacker manages to send valid transactions and if those manage to be sent to the rest of the network, they would be mined too. 
As a further disincentive to attack, every transaction comes with a fee and needs to pass other parameters. This fee increases when traffic is high and is collected by the winning miner. 

So, if an attacker wants to flood the network beyond the attacked node, it needs to pay in the currency of the blockchain. A good example for this is the Bitcoin protocol. 

All this takes place automatically, even before the human managers of the nodes can decide to drop transactions from suspiciously active public keys.

## Fast blocks, slow blocks

In an effort to dissuade attackers, block creation is computationally expensive, meaning it requires a high amount of computer processing power. It is not only computationally expensive but also financially expensive. There are costs for running and maintaining a participating computer system, as well as for mining and conducting transactions.

There is a third layer that is especially important to prevent attacks against the network: the **pace of block creation**. Block time is crucial for keeping blockchains **decentralised**, **secure** (i.e. by disincentivising an attack), and with equal mining opportunities (**mining equality**).

In networks relying on **PoW**, the pace of block creation is related to the **time** it takes to "guess well" (i.e. find the nonce) as well as to **mining power** and the **difficulty of block creation**. The pace of block creation is essential for the overall network security as its consistency makes network security independent from the miner's computational power. Miners can increase computational power, but the protocol can regulate through difficulty the block time and with it maintain security.

Take the example of Bitcoin, it has a block time of **10 minutes**. However, the time it takes to find the nonce is not always going to be 10 minutes. Sometimes a miner might get lucky and guess quickly, other times the miner does not find the nonce for quite a while.

<div class="b9-info">
	<p>The block time in <b>Bitcoin</b> is about <b>10 minutes</b>, i.e. it takes 10 minutes to mine a block. In <b>Ethereum</b> the block time is on average <b>10 to 19 seconds</b>. Depending on the protocol blockchain networks can have different block times.</p>
</div>

How is block time regulated by the Bitcoin protocol?

This problem is solved pretty simply. The Bitcoin protocol actually expects to process **2,016 blocks every two weeks** -at 600 seconds per block, 2,016 blocks should last exactly 14 days on average. But since proof-of-work is **not deterministic**, it is impossible to ensure that each block equals precisely 600 seconds of transactions. For this reason, the protocol provides for an **increase or decrease in difficulty every 2,016 blocks**, i.e. a re-evaluation of the degree of difficulty.

![Block Creation and Pace](images/Fastslowblocks_new.png)

In the case that these 2,016 blocks should take longer than two weeks to be mined, the protocol dictates that difficulty should be decreased. 
Conversely difficulty should be increased, should they take less time. Meaning, if too few (or too many) blocks were mined in that time, the protocol increases (or decreases) the difficulty of finding the nonce. This is done by changing the requirements of the "winning" hash value (increasing or decreasing the number of zeros needed at the front of the hash).

<div class="b9-info">
	<p>If you want to dive deeper into block time and difficulty, we recommend <a href="https://medium.facilelogin.com/the-mystery-behind-block-time-63351e35603a"><i>The Mystery Behind Block Time</i></a>.</p>
</div>

### Why slow blocks?

Because of the 10-minute block time in the Bitcoin protocol, your transaction may not be confirmed for a sizeable amount of time, especially if you expect it to be safely tucked away 6 blocks in the past. However, the reason for this relatively "long" block time is three-fold and based on assumed values of network latency, i.e. delays in data communication in a network.

Let us assume the block time target is 10 seconds -*seconds, not minutes*. Also assume we have, among many other nodes, 2 mining ones:

* **Node A** is a well-connected node with low latency to the majority of the network;
* **Node B** has a 2-second delay compared to the rest of the network. 

Since B is most likely informed of mined blocks 2 seconds later, B is still mining for 20% of the time it takes the whole network to mine a block. This creates a lot of wasted resources. If the target block time was 10 minutes, the *waste* would be 0.3%.

The situation is as if:

* B's mined blocks are always too late,
* B's mined blocks are just forks,
* B does not participate in mining,
* B's mining does not increase the hash rate of the entire network,
* B's work does not participate in the blockchain's immutability,
* A reaps disproportionate rewards.

So, aiming for a **longer block time**:

* levels the playing field for miners,
* prevents a well-connected clique from reaping most of the rewards and from defeating decentralisation,
* raises the cost of a 51% attack because it will take longer, and therefore cost more.

### Fast block solution

All things being equal, a short block time target is a desirable feature by itself. In order to achieve it while mitigating the drawbacks discussed above, **Greedy Heaviest Observed Subtree (GHOST) protocol** was proposed.

Basically, the GHOST protocol can be broken down to:

* a subsequent block can mention the hash of one, or more, earlier (within limits) forked block; a forked block is called an **uncle** in Ethereum (comparable to orphanes in Bitcoin), i.e. a block that was mined after another node found the correct block header;
* a given uncle can only be mentioned **once** per chain;
* the **uncle's miner** is rewarded a large portion of the regular mining reward in Ethereum;
* the **nephew block miner** is additionally rewarded a smaller fraction of the regular mining reward;
* nodes include uncles in the length and complexity calculation when deciding which fork is the main ledger.

A fast block creation, i.e. **shorter block time**, has several implications:

* the **confirmation time** is faster -the confirmation time secures the network against double-spending;
* the **payout variance**, i.e. difference of the rewards miners get, is lower;
* the **number of forks** increases; 
* the **bandwidth**, i.e. communication between nodes, has to be increased.

Overall, shorter block time is often desired, but also comes with its burdens.

### What is an uncle?

An **uncle** is the child of the parent of the parents. Basically, in blockchain technology an uncle makes it possible for miners to be rewarded even though they create "incorrect" blocks. Uncles are called orphans in Bitcoin.

The term describes a block that was mined after someone found the correct block header. It is a way to reward miners for almost being the first to solve the puzzle correctly. Mining an uncle does not lead to the same reward as mining a regular new block. In **Bitcoin** for example, mining an uncle/orphan does not lead to a reward at all.

![GHOST - Uncles](images/GHOST_uncles.png)

Uncles fulfil an important **function**: they help **incentivise mining** and with it **decrease centralisation** impulses in Ethereum. On the Ethereum network, miners are incentivised to include uncles in the blocks they mine by rewarding such blocks. Uncle mining helps maintain a **larger number of miners**, preventing large mining pools by also incentivising small mining pools and individual mining. Uncles also help **compensate for network delays**, since a miner can be rewarded even when a network delay made it come in second. In addition, uncles help **increase chain security**, as mining an uncle and mining a main chain block are conducted through the same mechanism. 

Uncles can also create issues for a blockchain. Including uncles can bloat the network with blocks that have invalid data and blocks with little data at all - leading to **network distention**. Moreover, uncle rewards can incentivise miners to just **mine empty blocks**, as it is cheaper to include an uncle instead of creating a valid-but-forgotten block. Empty uncle blocks do not fulfil any purpose, but they are still rewarded. This could become an issue in the future.

## Other consensus algorithms

Consensus can be understood as a process in which the network, constituted by nodes, reaches an agreement regarding the order of transactions and validates the proposed blocks, which include the transactions, by doing so consensus mechanisms generate:

* consensus on the global **state of the blockchain**,
* consensus on a **set of transactions** included in one block.

Their main functions are to:

* **order transactions**, and
* **validate transactions**.

Consensus algorithms establish **safety** and **liveness** by generating consensus, ordering transactions, and validating them. Whereas, safety requires that the "algorithm must behave identical to a single node system that executes each transaction atomically one at a time" (Hyperledger (2017): *Hyperledger Architecture, Volume 1*](https://www.hyperledger.org/wp-content/uploads/2017/08/Hyperledger_Arch_WG_Paper_1_Consensus.pdf)). Meaning that the same set of transactions should lead to the same changes in the state on each individual node. Liveness refers to the upholding of network synchronisation: All non-faulty nodes will "eventually receive every submitted transaction, assuming that communication does not fail" (Hyperledger (2017): *Hyperledger Architecture, Volume 1*](https://www.hyperledger.org/wp-content/uploads/2017/08/Hyperledger_Arch_WG_Paper_1_Consensus.pdf)).

Consensus algorithms can be differentiated into **lottery-based**, such as PoW, and **voting-based algorithms**, like for example in the case of delgated-proof-of-stake (See: [Hyperledger (2017): *Hyperledger Architecture, Volume 1*](https://www.hyperledger.org/wp-content/uploads/2017/08/Hyperledger_Arch_WG_Paper_1_Consensus.pdf)).

Lottery-based algorithms, i.e. where nodes creating blocks are randomly selected in a mechanism strongly resembling a lottery, are said to have **high scalability** but at the same time a tendency of producing **forks** and with it a **high-latency finality**. With increased block creation time, which is an attractive feature of a network, the probability of another peer creating a new block before receiving the just created one can result in numerous forks. This leads to an instance that has to be solved to achieve finality.

Voting-based algorithms, i.e. algorithms including elections, bring the advantage of **low-latency finality**, i.e. finality is faster than in lottery-based algorithms. This type of algorithms also brings a **scalability/speed trade-off**: As all nodes have to be kept in the loop, the larger the network (i.e. higher number of nodes), the longer it takes for consensus.

To summarize, lottery-based algorithms have a good speed and scalability but are slower in achieving finality. Voting-based algorithms are fast and achieve finality faster but are not as well-suited in regard to scalability. The suitability of algorithms depends strongly on the network requirements and different fault tolerance models.

Using proof-of-work to obtain consensus was one of the innovations introduced by Bitcoin in addition to the chain of blocks. Since then, many other consensus algorithms for new blocks have emerged. The academic community had introduced consensus algorithms even before Bitcoin.

Let us have a look at some of the most popular consensus algorithms.

### Practical Byzantine Fault Tolerance (pBFT)

pBFT was first introduced in 1999. It is a three-phase protocol where the client sends a request to a so-called primary. 

<div class="b9-info">
	<p>You can access the paper by Miguel Castro and Barbara Liskov <a href="http://pmg.csail.mit.edu/papers/osdi99.pdf">here</a>, in which the Practical Byzantine Fault Tolerance algorithm was presented.</p>
	<p>There is also a very understandble <a href="http://www.comp.nus.edu.sg/~rahul/allfiles/cs6234-16-pbft.pdf">presentation</a>.</p>
</div>

pBFT focuses on providing a **practical Byzantine state machine replication**, which is able to tolerate malicious nodes by assuming independent node failures and manipulated messages. Thus, the main aim of the algorithm is to promote consensus of **all honest nodes**.

This assumption translate into a **practical requirement** for the network: The amount of malicious nodes cannot simultaneously equal or exceed 1/3 of all nodes. This can be ensured especially the more nodes there are in the system; the more nodes, the more unlikely it is that malicious nodes can reach 1/3. This consensus algorithm is envisioned for asynchronous systems like the internet and was optimised to allow for high-performance.

In the first phase, the primary broadcasts the request with a sequence number to the replicas. Then the replicas agree on the sequence number and create a message. If a certain number of the same message is reached, the message is verified and replicas agree on the total order for requests within a view. At the end, the replicas send the reply to the client.

How does a pBFT system look like?

All nodes in the network are **ordered in sequence**. The leader is the **primary node**. The followers, i.e. the remaining nodes, are called **backup nodes**. The primary/leader node is usually selected in a type of <a href="https://en.wikipedia.org/wiki/Round-robin_tournament"><i>round-robin tournament</i></a> - which is a competition in which a contestant meets all other contestants in turns. In addition, we have **validating and non-validating peers**. The communication between the nodes is very intensive as they have to communicate regarding which peer node sends the message and also to verify the message to be intact, i.e. that it has not been changed in transmission.

How does the algorithm proceed?

1. The client sends the request to the primary/leader node to invoke a service operation;
2. The leader/primary multicasts the request to the backup nodes/replicas with a sequence number;
3. These agree on the sequence number, execute the request and send a reply to the client. The client has to wait until the replies reach the maximum amount of the sum of faulty/malicious nodes plus 1;
. The message is verified when a certain amount of repetitive messages is send and then the replicas agree on the total order of requests. By waiting to see a specific amount of the same message, the result of the operation is verified;
5. The backup nodes/replicas agree on a total order of requests, i.e. consensus on the order of record is achieved;
6. The nodes accept/reject the consensus order of record.

What happens in case of a **bad request**?

The client sends the bad request to the primary. Let us assume the primary does not identify it as a bad request and recasts it to the replicas. The system should detect it as a "bad" message as soon as nodes start sending different messages as a response. The message would not pass the condition mentioned above.

<div class="b9-tip">
	<p>We can definitely suggest the following article on pBFT: <a href="https://blockonomi.com/practical-byzantine-fault-tolerance/">Curran, B. (2018): <i>What is Pracictcal Byzantine Fault Tolerance? Complete Beginner's Guide</i></a>.</p>
</div>

This of course is a very simplified description. 

### Proof-of-Stake (PoS)

**Proof-of-stake (PoS)** is another method of selecting the authoritative node for a given block. PoS is based on the assumption that those with the most to lose are the most incentivised to safeguard network integrity.

A successful proof-of-stake system must address the **problem of "nothing at stake"**. That is, randomly-selected validators must face a disincentive for bad behaviour as well as a high probability that bad behaviour will be detected. The burden of detection usually falls on the rest of the network that can either accept or reject the validator's opinion. A solution to the disincentive aspect is to extract a penalty for emitting opinions that are ultimately rejected by the network.


Validators place funds at risk (i.e. **the stake**). For any given block, a validator is selected in pseudo-random fashion with preference to validators with the largest stake. While PoS systems generally do not reward validators with new coins, validators receive **transaction fees** in return for generating blocks the rest of the network accepts. 

Validators face **economic penalties** when they generate blocks that are rejected by sizable numbers of other nodes. A validator is thus incentivised to generate blocks that are likely to be accepted by the network and faces economic punishment when it fails to do so.

The planned **PoS protocol for Ethereum** is called **CASPER**. PoS is already used in **Nxt** (cryptocurrency and payment network launched in 2013). PoS solves the energy problem in PoW as "work" (i.e. use of energy through computational power) is not the proof requested. 

### Delegated-Proof-of-Stake (DPoS)

An extension of proof-of-stake algorithms is called **delegated-proof-of-stake (DPoS)**. It is used for example in BitShares. Other blockchains that use DPoS as their consensus mechanism are EOS, Steem, and Lisk.

<div class="b9-info">
	<p><a href="https://bitshares.org/">BitShares</a> is an open-source, blockchain-based financial platform launched in 2014 and the name of the corresponding cryptocurrency. It provides a decentralized asset exchange – comparable to a stock exchange like the New York Stock Exchange (NYSE) but focused on cryptocurrencies.</p>
</div>

The algorithm is called DPoS because like in PoS the **value of a vote** is determined by the stake, i.e. tokens held by a user.

<div class="b9-info">
	<p>Delegated-proof-of-stake (DPoS) is a consensus mechanism developed by Daniel Larimer as a reaction to Bitcoin's high energy consumption and potential centralisation in mining.</p>
	<p>DPOS is much faster compared to other consensus algorithms like PoW.</p>
</div>

In this type of consensus mechanism, so-called **"witnesses"** are elected by the stakeholders of the network. Witnesses secure the network. Afterwards, several witnesses are chosen for the block creation so that they represent at least 50% of the stakeholders' votes.

![DPoS](images/delegated-proof-of-stake.png)

Witnesses are paid for their services: They are paid fees for creating and validating blocks. This economic incentive to become a witness also leads to competition potentially increasing with each new member because the number of witnesses is limited.

In case a witness misbehaves, the network's community is able to withdraw their votes for a single witness, i.e. fire the witness. Witnesses that do no longer hold enough votes lose their income basis.

Alongside ascribing the role of witnesses to some participants, DPoS networks also elect **"delegates"**. Delegates are a group of participants that supervise network governance and performance, and propose changes that are then voted on by the entire network.

Many consider DPoS algorithms superior to PoW and PoS because of their fast block creation, a high degree of security, energy efficiency, level of integrity, and democratic structure.

### Proof-of-Burn (PoB)

Burn in this context is very specific: Miners must send coins to a **"burn" address**, of which it is believed nobody owns the private key (i.e. a verifiably un-spendable address). The coins on the “burn” address cannot then be spent due to the absence of a private key. This is how "difficulty" in the mining process is established, similar to how solving the guessing game with computing power in PoW establishes a necessary work input and with it the degree of difficulty.

To be considered for new block creation nodes can participate in a **lottery** and will get rewarded when chosen. 

This is **expensive** from the miner's point of view because of the coins' worth. PoB uses the same underlying philosophy as in the case of PoW, but furthermore the energy consumption problem and the "nothing at stake problem" are solved. 

PoB networks often have depended on PoW coins, as the "burning" is performed with them.



### Proof-of-Importance (PoI)

The starting idea with **proof-of-importance (PoI)** is to solve the "rich man gets richer" problem that arises in PoS algorithms. Therefore, the protocol rewards network activity based on the so-called **"importance score"**, which is calculated by graph theory. 

Similar to PoS nodes invest a stake in the network to be eligible for selection. In the case of PoI, the stake invested is calculated from a set of variables (amount of transactions to and from an address, whether a node is part of a cluster, etc.) that are included in the score. The probability to be chosen to build new blocks increases with the value of the importance score.

PoI networks have a similar rationale like PoS but prevent hording as a mean to increase prosperity and "nothing-at-stake" problems with the use of the importance score.

Proof-of-importance (PoI) is implemented in <a href="https://nem.io/">NEM</a>, a peer-to-peer cryptocurrency and blockchain platform. 

<div class="b9-info">
	<p>NEM is a blockchain platform that was launched in March 2015 and the name of the corresponding cryptocurrency.</p> 
	<p>NEM has stood out as multiple ledgers can simultaneausly coexist on one single blockchain, and faster transaction speed and scalability are promised.</p>
	<p>NEM offers a wide range of features and a commercial blockchain option called <b>Mijin</b>.</p>
</div>

### Proof-of-Activity (PoA)

**Proof-of-activity (PoA)** is a combination of PoW and PoS. The miner creates a template with the nonce and deploys it to the network. Then the signers are chosen by the block hash of this template. If the template is signed by the signers, it becomes a block. In the end, the reward is shared between the miner and signers.

The algorithm is called proof-of-activity because only participants with a **full online node** can get a reward.

Let us split this process into its PoW and PoS components:

1. Miners compete in a computer-power-driven guessing game to find the next block, just as in PoW.
2. After a block is mined, it contains a header and the reward address of the miner -like in PoS.
3. Nodes are selected as validators depending on the stake of coins they hold (second PoS component). The higher the stake, the more probable it is to be selected as a validator.
4. The validated block becomes part of the blockchain, and the fees and rewards are transferred to the miners and validators.

As a combination of PoW and PoS, PoA networks can also suffer from a high energy consumption, like PoW ones, and coin hording. But it also inherits the algorithms' benefits, like its strong decentralisation and its security against 51% attacks.

<div class="b9-tip">
	<p>For a more in-depth look at PoW, PoS, and PoA, we recommend <a href="https://eprint.iacr.org/2014/452.pdf"><i>Proof of Activity: Extending Bitcoin's Proof of Work via Proof of Stake</i> by Iddo Bentov et al.</a>.</p>
</div>

### Proof-of-Capacity (PoC)

**Proof-of-capacity (PoC)** uses the memory or hard disk drive (HDD) of a user to reach consensus. It is often also referred to as proof-of-space (PoSpace). In PoC, the user signals its interest and stake by dedicating an amount of their HDDs to the mining process.

First, it creates and stores hashes. Then it selects parts of the data considering the last block header in the blockchain. The selected data is hashed and must fulfil a given difficulty.

PoC is designed to be fairer, because memory access times do not vary as much as the central processing units (CPU) power. PoC decentralises mining even more than PoW algorithms. In addition, it has a lower energy consumption than PoW.

PoC has been applied in the case of [Burstcoin](https://www.burst-coin.org/), a cryptocurrency founded in 2014, and was proposed for [SpaceMint](https://dci.mit.edu/research/spacemint-cryptocurrency-mining), on which academic researchers have been working.

### Proof-of-Elapsed-Time (PoET)

**Proof-of-elapsed-time (PoET)** elects a leader via a lottery algorithm. The key point is the lottery, which must be performed in a **trusted execution environment (TEE)**. For this purpose, Intel offers **Software Guard Extensions (SGX)** for applications developers.

<div class="b9-info">
	<p>A <b>trusted execution environment (TEE)</b> is a secure area of the processor that offers an isolated processing environment.</p>
	<p>It offers the possibility to load, execute, process, and store data and code in a way that maintains confidentiality and integrity by running applications in a safe space.</p>
</div>

The lottery provides every validator with a randomised wait time (See: the **createWaitTimer** in the figure below). The fastest validator becomes the leader. The leader is eligible to create a block after the allotted time. The new block must be accepted by the rest of the network (i.e. BFT). Notice that there is a [Z-test](https://en.wikipedia.org/wiki/Z-test) to check if a node is generating blocks too fast. The leader is eligible to create a block after the allotted time. The new block must be accepted (Byzantine Fault Tolerance) by the rest of the network.

![PoET image](images/poet.png)

The underlying idea in PoET is the same as Bitcoin in that the first node to announce a valid block wins. Rather than compute-intensive proof-of-work, SGX assumes the task of declaring a lottery winner. PoET is used in Intel's Hyperledger Project Sawtooth Lake.

<div class="b9-info">
	<p>For some general point on advantages and dis-advantages of different consensus algorithms, we can recommend the following overviews:</p>
		<ul>
			<li><a href="https://hackernoon.com/a-hitchhikers-guide-to-consensus-algorithms-d81aae3eb0e3">Witherspoon, Z. (2013): <i>A Hitchhiker’s Guide to Consensus Algorithms. A quick classification of cryptocurrency consensus types</i></a>,</li>
			<li><a href="https://hackernoon.com/consensuspedia-an-encyclopedia-of-29-consensus-algorithms-e9c4b4b7d08f">Vasa (2018): <i>ConsensusPedia: An Encyclopedia of 30 Consensus Algorithms. A complete list of all consensus algorithms</i></a>.</li>
		</ul>
</div>

## Blockchain as a decentralised consensus network

Blockchain can also be understood as a decentralised consensus network. A blockchain is a well-ordered set of data, on which all peers *eventually* agree.
What all participants agree upon is construed as the single truth. This single truth is the single true state of the distributed ledger. 
Therefore, the state of the distributed ledger is the result of consensus.

![Blockchain as a Consensus Network](images/blockchain_as_a_consensus_network.png)

<div class="b9-reading">
<ul>
	<li><a href="https://eprint.iacr.org/2014/452.pdf">Bentov, I. et al.: <i>Proof of Activity: Extending Bitcoin’s Proof of Work via Proof of Stake</i></a></li>
	<li><a href="https://bitshares.org/">BitShares</a></li>
	<li><a href="https://www.burst-coin.org/">Burstcoin</a></li>
	<li><a href="http://pmg.csail.mit.edu/papers/osdi99.pdf">Castro, M. & Liskov, B. (1999): <i>Practical Byzantine Fault Tolerance</i></a></li>
	<li> <a href="https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed">CAP "theorem"</a></li>
	<li> <a href="http://counterparty.io/platform/">Counterparty</a> aims to extend the Bitcoin blockchain and allows for a limited degree of smart contract execution. They also created their initial coins in an innovative way, by <a href="http://counterparty.io/news/why-proof-of-burn/">proof-of-burn</a> of Bitcoins.</li>
	<li><a href="https://cryptographics.info/cryptographics/blockchain/cap-theorem/">CryptoGraphics: <i>CAP Theorem</i></a></li>
	<li><a href="http://motherboard.vice.com/read/bitcoin-could-consume-as-much-electricity-as-denmark-by-2020">Deetman, S. (2016): <i>Bitcoin Could Consume as Much Electricity as Denmark by 2020</i></a></li>
	<li><a href="https://digiconomist.net/bitcoin-energy-consumption">Digiconomist: <i>Bitcoin Energy Consumption Index</i></a></li>
	<li> <a href="http://etherscan.io/stat/supply">Ether supply and uncle rewards</a></li>
	<li> <a href="https://www.cryptocompare.com/coins/guides/what-is-the-ghost-protocol-for-ethereum/">GHOST in Ethereum</a></li>
	<li><a href="https://www.hyperledger.org/wp-content/uploads/2017/08/Hyperledger_Arch_WG_Paper_1_Consensus.pdf">Hyperledger (2017): <i>Hyperledger Architecture, Volume 1</i></a></li>
	<li><a href="https://paulkernfeld.com/2016/01/15/bitcoin-cap-theorem.html">Kernfeld, P. (2016): <i>How Bitcoin Loses to the CAP Theorem</i></a></li>
	<li><a href="https://cryptographics.info/cryptographics/blockchain/cap-theorem/">Leussink, K. (2018): <i>CAP Theorem</i></a></li>
	<li><a href="https://nem.io/">NEM</a></li>
	<li><a href="https://www.comp.nus.edu.sg/~rahul/allfiles/cs6234-16-pbft.pdf"><i>Practical Byzantine Fault Tolerance</i></a></li>
	<li> <a href="https://medium.com/oracles-network/proof-of-authority-consensus-model-with-identity-at-stake-d5bd15463256">Proof of Authority: consensus model with Identity at Stake</a></li>
	<li><a href="https://medium.facilelogin.com/the-mystery-behind-block-time-63351e35603a">Siriwardena, P. (2017): <i>The Mystery Behind Block Time</i></a></li>
	<li><a href="https://dci.mit.edu/research/spacemint-cryptocurrency-mining">Park, S. et al.: <i>SpaceMint: A Cryptocurrency Based on Proofs of Space</i></a></li>
	<li> <a href="https://www.stellar.org/">Stellar</a> was originally forked from Ripple, has now completely diverged from it, and introduced what they called a "Federated Byzantine Agreement", whereby consensus is reached by quorum slices.</li>
	<li> <a href="http://tendermint.com/docs/tendermint.pdf">Tendermint</a> is a decentralized consensus engine that runs its own public blockchain and also supports decentralised computing. It differs from Ethereum on its consensus protocol, which uses the concept of validators who need to bind funds to validate and who validate blocks over the course of a certain number of rounds.</li>
	<li> <a href="https://blog.ethereum.org/2016/10/31/uncle-rate-transaction-fee-analysis/">Uncle rate analysis</a></li>
	<li><a href="https://hackernoon.com/consensuspedia-an-encyclopedia-of-29-consensus-algorithms-e9c4b4b7d08f">Vasa (2018): <i>ConsensusPedia: An Encyclopedia of 30 Consensus Algorithms. A complete list of all consensus algorithms</i></a></li>
	<li> <a href="https://blog.ethereum.org/2014/07/11/toward-a-12-second-block-time/">Vitalik on 12 second block time</a></li>
	<li><a href="https://hackernoon.com/a-hitchhikers-guide-to-consensus-algorithms-d81aae3eb0e3">Witherspoon, Z. (2013): <i>A Hitchhiker’s Guide to Consensus Algorithms. A quick classification of cryptocurrency consensus types</i></a></li>
</ul>
</div>
