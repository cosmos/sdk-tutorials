---
title: "Self-assessment Quiz"
order: 12
description: 
tag: fast-track
---

<h1>Self-Assessment: Technical Fundamentals</h1>

<p>In this past module you have learned a lot about the foundations of blockchain technology. This self-assessment quiz is just for yourself to check your learning progress. It is not a part of your final exam.</p>

<p></p>

>>In the context of a distributed ledger, how do you define blockchain? Which of the following statements are correct?<<
[x] As the ordered list of all transactions since inception
[x] As a well-ordered set of blocks
[ ] As a block of transactions
[x] As a well-ordered set of data, on which all peers eventually agree
[ ] As a shared real-time transaction network

[explanation]
<p>The correct statements are “As the ordered list of all transactions since inception”, “As a well-ordered set of blocks” and “As a well-ordered set of data, on which all peers eventually agree”. “As a block of transactions” and “As a shared real-time transaction network” are both incorrect. Why?</p>
<p>A blockchain can be understood as a well-ordered list of transactions as all transactions are recorded beginning with the genesis block, the first block of the blockchain. Furthermore, a blockchain can be also seen as a well-ordered set of blocks because in a blockchain blocks are well-ordered and more than one block exists. It is also a well-ordered set of data, on which all peers eventually agree. In a blockchain network data is included by block creation and this is recorded in the order it was introduced. In addition, all peers agree on the order of the data because consensus is achieved in the end by all peers agreeing to the blocks containing the data. This is the case unless a fork occurs and even then there are mechanisms to in the end “agree” on one chain -most of the times the longest chain is the one that becomes the single true state. A blockchain is not a block of transaction as it is a chain of blocks which include transactions. It also is not a shared real-time transaction network. The impression can arise to understand it in this manner, but a blockchain is only near-real time (in Bitcoin for example the block creation time is about 10min.). There are many initatives currently focused on lowering the block creation time to make blockchains real-time.</p>
[explanation]

>>In Blockchain, what is the truth?<<
( ) The truth is what Satoshi Nakamoto says
( ) The truth is what the developer community agrees on
( ) The truth is what the biggest miner considers the truth
(x) The truth is the set of data that all participants eventually agree on

[explanation]
<p>The correct answer is “The truth is the set of data that all participants eventually agree on”. This is correct because the truth in a blockchain environment, i.e. state of the ledger, is a result of a consensus reached by all participants regarding the creation of blocks.</p>
[explanation]

>>What is the Byzantine Generals Problem?<<
( ) How to distribute data in a hierarchy-free, permission-less and failure-prone network
( ) How to transmit data in a hierarchy-free, permission-less and failure-prone network
(x) How to reach consensus in a hierarchy-free, permission-less and failure-prone network
( ) How to find peers in a hierarchy-free, permission-less and failure-prone network

[explanation]
<p>The Byzantine General’s Problem is a problem in distributed computing which applies to hierarchy-free, permission-less and failure-prone networks. It describes a situation in which consensus has to be reached with unsecure communication channels. Therefore, it does not address data distribution, data transmission or the search for peers.</p>
[explanation]

>>Which of the following statements, about the basic problem blockchain is attempting to solve, is true?<<
( ) Blockchain technology merges internet and network
(x) Blockchain technology merges database and network
( ) Blockchain technology merges smart contracts and network
( ) Blockchain technology merges future and network

[explanation]
<p>A blockchain can be seen as the merge of database and network because it includes elements typical for databases, like for example the storing and organising of data, as well as those of P2P networks, i.e. decentralised network structure.</p>
[explanation]

>>When cryptographically signing data in a public/private key system, what do you use your private key for?<<
( ) Encrypt data that others can then verify using your private key
( ) Generate a cryptographic signature that others can then verify using your private key
(x) Generate a cryptographic signature that others can then verify using your public key
( ) Encrypt a cryptographic signature to be shared along with your private key

[explanation]
<p>A private key can be used to generate a cryptographic signature to allow other participants of a system to verify the provenance of data (for example in form of a message) with the corresponding public key. This is used because it is not feasible to deduce the private key from the public one and at the same time, it allows for communication through unsecure channels without having to provide other security measures.</p>
[explanation]

>>In the context of blockchain, what is the most fundamental definition of a transaction?<<
( ) A transmission of a message between nodes
(x) An atomic event that is allowed by the underlying protocol
( ) Exchange of a hash table between two peers

[explanation]
<p>A transaction is not a message between nodes or the exchange of a hash table, but an atomic event allowed by the underlying protocol. It is atomic because its parts do not make sense in isolation.</p>
[explanation]

>>What does the CAP theorem stand for?<<
( ) Consistency, affirmability, partition
( ) Cristopher Antonopolous Programme
(x) Consistency, availability, partition tolerance

[explanation]
<p>The CAP theorem stands for <b>consistency</b>, <b>availability</b> and <b>partition tolerance</b>. It states that distributed systems can at most fulfil 2 out of the 3 named dimensions.</p>
[explanation]

>>How does blockchain technology provide better ledger integrity?<<
( ) Blockchains can never be changed once data has been added
(x) In order to change a piece of data in the past, all following blocks have to be recalculated

[explanation]
<p>Blockchain technology provides better ledger integrity in comparison to traditional ledger systems as it has a very high degree of immutability, i.e. the unchangeability of objects over time and with it the inability to perform changes. This is one of the most attractive attributes of blockchain networks. Immutability is given as all changes in the state of a blockchain have to be introduced in a block, which would require solving the cryptographic puzzle for that block and all following blocks, i.e. recalculating all hashes. When a malicious attacker would like to modify data in an already existing block, the nonce and hash of all subsequent blocks would become invalid. Thus, all following blocks would have to be recalculated. The more a block lies in the past, the more blocks would have to be recalculated meaning the more hashes would have to be calculated again. Data can thus be changed but only with the consensus of all participants and/or immense computational performance making it nearly impossible.</p>
[explanation]

>>In a PoW network, for a malicious node to remove or insert transactions, it would need to update the root hash of the containing block's Merkle tree, update the nonce of the containing block, update the hash of the containing block and do the same for all subsequent blocks. Under what circumstances is that possible?<<
( ) If the attacker issues a high number of transactions
(x) If the attacker controls more than 50% of the mining power in a blockchain network

[explanation]
<p>For a malicious node to remove or insert transactions a number of steps is necessary and it can only occur if the node controls over 50% of the mining power, i.e. holds a simple majority of the network's mining power. This is known as a “51% attack” (i.e. more than 50%). The malicious node can only update the root hash, the nonce, the hash and all subsequent blocks by controlling the mining power as this would be the only possibility to recalculate all blocks starting from the one the node would like to change. In addition, the malicious node would need the mining power to produce an even longer chain so that it would become the "true" state in case of a fork.</p>
[explanation]

>>Select all answers that are true for proof-of-work<<
[x] Any node can propose new blocks
[ ] Potential miners must get approval by the network before they can propose blocks
[x] More than one miner can find a correct block in the same time

[explanation]
<p>Proof-of-work (PoW) is a consensus algorithm in which a cryptographic puzzle is solved by a miner. This task is of arbitrary difficulty. In systems relying on PoW any node is able to propose a new block and miners compete to find the correct block at the same time. The miner that solves the puzzle first gets an economic reward. Potential miners do not need the network’s approval to propose blocks.</p>
[explanation]

>>What is the difficulty in a blockchain network?<<
(x) The difficulty determines how likely it is for a miner to find a valid block
( ) The difficulty sets the fees a user has to pay for a transaction
( ) The difficulty sets how difficult it is for clients to connect to the network

[explanation]
<p>Difficulty in a blockchain network using PoW refers to the amount of work a miner needs to invest to solve the cryptographic puzzle. Thus, it determines how likely it is for a miner to find a valid block. It does not set the transaction fees or the degree of difficulty to connect to the network.</p>
[explanation]

>>Select all answers that are true for proof-of-stake<<
[ ] Anyone can propose new blocks, irrespective of the number of coins/tokens held
[x] Miners with a large stake in the network can propose blocks
[x] More than one miner can find a correct block in the same time
[x] The hypothesis for PoS suggests that participants with a large stake are more trustworthy

[explanation]
<p>Proof-of-stake (PoS) is also a consensus algorithm. In networks using PoS the underlying assumption is that depending on a participant’s stake in the network, i.e. how invest the participants is in the network, he/she is incentivised to safeguard the network (act in a beneficial manner) and with it more trustworthy than participants with small stakes. For this reason, validators are selected depending on their stake (i.e. funds at risk). As in PoW, more than one miner can find the correct block. Thus, proposing new blocks is not irrespective to the number of coins/tokens held.</p>
[explanation]

>>In Blockchain every transaction is signed using:<<
(x) the private key of the person who sends the transaction
( ) the public key of the person who sends the transaction
( ) the email address of the person who sends the transaction

[explanation]
<p>In blockchain, transactions are signed with the private key. Using the public key would be an illogical method as the public key is normally known by more participants than the key holder and signing with it would only proof that one knows the public key but not an individual identity. Thus, it would defy the purpose of signing. Blockchain transactions are also decoupled from any email addresses.</p>
[explanation]

>>What does it mean that a blockchain database is append-only?<<
(x) Data can practically not be changed or erased once it has been added to the database
( ) Previously added data can be changed later. New data can be added to the database

[explanation]
<p>In a blockchain database data is unchangeable and with it blockchains are immutable. But it can be amended. Thus, it is append-only and can be differentiated from databases with read/write capable data.</p>
[explanation]

>>Why does one talk about eventual consensus in context of blockchain networks?<<
(x) It might take time for all nodes to agree on the substance and order of data 
( ) It might take time until the approval authority verifies the consensus

[explanation]
<p>One talks about eventual consensus in blockchain technology because blocks are created as transactions are performed. The consensus depends on the operations being performed. Moreover, in a blockchain network there is always the possibility of the "truth" changing due to forks, i.e. the possibility of a changing consensus.</p>
[explanation]

>>What is the problematic decision a distributed ledger needs to take?<<
( ) Identify the participants who can add to the ledger 
(x) Get everyone to agree on what goes into the ledger and in what order 
( ) Get everyone to agree on who can do what

[explanation]
<p>The most problematic decision a distributed ledger is faced with is consensus. All participants agreeing on the state of the ledger and the order of operations can be very problematic, as the Byzantine General’s Problem illustrates. Identifying which participants can add to the ledger and determining the rights and responsibilities of each participant are determined by the consensus algorithm and protocol, and overall not problematic decisions.</p>
[explanation]




<h1>Self-Assessment: Deployment Patterns</h1>

<p>In this past module you have learned a lot about the deployment patterns in blockchain. This self-assessment quiz is just for yourself to check your learning progress. It is not a part of your final exam.</p>

<p></p>

>>What is a nonce?<<
(x) Random number used in Bitcoin and Ethereum mining algorithms
( ) Concept used for faster block time

[explanation]
<p>A nonce is a random number used for example in both Bitcoin and Ethereum. It is a one-time-use word, which, when added to the block and then hashed, returns a small enough value. In effect it returns a hash that starts with enough 0s. The nonce is the number miners search to create a block and receive the reward. The degree of difficulty is controlled and adjusted by the nonce parameters set.</p>
[explanation]

>>Identify the core characteristics of public blockchain networks.<<
[x] Publicly accessible
[ ] Guaranteed Transaction Privacy
[x] Hierarchy-free
[x] Using crypto-economic incentives
[ ] Using a central clearing house for all transactions

[explanation]
<p>Core characteristics of blockchain networks are:</p>
<ul>
<li>public access (see the explanation above on decentralisation),</li>
<li>hierarchy-free: as the governance structure of public blockchains is decentralised, these type of networks do not have a hierarchy,</li>
<li>the use of crypto-economic incentives: public blockchain networks use crypto-economic, i.e. cryptographic and financial, incentives to foster behaviour benevolent to the network and deter malicious participants.</li>
</ul>
<p>Public blockchains do not use central clearing houses as these are not necessary in blockchain transactions. In addition, there is no guaranteed transaction privacy as all transactions are visible to all network users. This attribute makes public blockchains highly transparent.</p>
[explanation]

>>What does full decentralisation in public networks mean? Choose the right answer:<<
( ) It means that decentralised public networks provide access only to approved participants
(x) It means that decentralised public networks are fully accessible

[explanation]
<p>Contrary to private networks, public blockchain networks are decentralised as they are accessible by everyone, i.e. there is no access restriction. If one wants to participate, the only requirement is to set everything up and then one is good to go.</p>
[explanation]

>>How are changes in public blockchain protocols verified?<<
[ ] Changes are verified by a government entity
[x] Changes are validated by community members
[x] Changes are verified by core developers

[explanation]
<p>Changes in public blockchains are understood as a change in the state ledger of the blockchain. These can consist of a state in the ledger of an account but can also include changes to the protocol. Changes to the state ledger, as in the case of transactions, are included in a block by a miner and validated by the network. Changes in the public blockchain protocol are verified by the core developers, as they are the ones that know the protocol best. How do the community members validate a change in the protocol? The answer is quite simple, the protocol amended by the changes is validated by employing it. The community validates the change by implementing it. In more detail, miners show their support for a change by including it in their hashed block.</p>
[explanation]

>>How can public blockchain networks defend against malicious behaviour?<<
( ) Enforce revocable access rights 
(x) Introduce game theoretic elements 

[explanation]
<p>Public blockchains introduce game theoretic elements to defend against malicious behaviour. These are amended to promote benevolent behaviour, such as in the case of mining and mining rewards, and scare malicious participants from performing activities against the network, like for example in the case of Gas as a transaction fee. </p>
[explanation]

>>What is the difference between a public and a private blockchain network?<<
( ) Public networks always use a different consensus algorithm
( ) Public networks are controlled by the SEC unlike private networks
(x) Private networks restrict user access unlike public networks

[explanation]
<p>The main difference between public and private/managed blockchains, as their name already tells us, can be broken down to user access; private networks are not publicly accessible.</p>
[explanation]

>>Which of the following statements about permissioned blockchains are true:<<
[x] In permissioned blockchains an individual or group of participants holds the authority to validate blocks
[x] Permissioned blockchains restrict the actor's involvement regarding the consensus state
[ ] In permissioned blockchains smart contract creation is open to all network members

[explanation]
<p>In permissioned blockchains an individual or group of participants holds the authority to validate blocks of transaction or to participate in the consensus mechanism, as well as to create smart contracts and/or transactions. The actor’s involvement is therefore restricted. Permission-less blockchains are contrary to this: Block verification, smart contract creation, and transactions on permission-less blockchain networks are open to all members.</p>
[explanation]

>>Why do managed blockchains not have to mitigate the Byzantine Generals Problem?<<
( ) Because managed blockchains do not use any consensus algorithm 
(x) Because managed blockchains operate in a predictable environment with elements of authority and hierarchy
( ) Because managed blockchains do not use proof-of-work as a consensus algorithm

[explanation]
<p>Remember, the Byzantine General’s Problem. It describes a situation in a hierarchy-free, permission-less and failure-prone network. Thus, it solves communication and agreement difficulties in unpredictable environments with unsecured communication channels. Private blockchain networks do not have to mitigate this problem because their environment is predictable and includes dimensions of authority and hierarchy.</p> 
[explanation]

>>Compared to public blockchains, which are open to everyone and do not have entry barriers, in managed blockchains accessibility can be decided by:<<
[x] A central authority
[x] All participants which belong to the network
[ ] Everyone in- and outside of the network

[explanation]
<p>Accessibility in managed blockchains is restricted. It can be decided by a central authority, often the network owner, or all users that have already been granted access.</p> 
[explanation]

>>Identify advantages of managed blockchain networks<<
[ ] Public accessibility
[x] Better scalability
[x] Limited participation
[ ] Decentralised governance

[explanation]
<p>One main advantage that makes private blockchain networks attractive is the limited participation, i.e. user access has to be granted. This limited participation also allows for better scalability.</p>
[explanation]

>>What are the key reasons for managed/private networks to exist?<<
[ ] To open the door to complex calculations 
[x] To protect confidential data 
[x] To increase network performance and reduce transaction times

[explanation]
<p>Private blockchain networks are a viable option to implement blockchain solutions and have especially caught the eye of private companies due to their restricted access. As the network is not public, it is easier to protect data privacy and network performance is higher than in public networks. The mere number of participants, compared to public networks, makes the network performance higher and transaction time higher than in private blockchains with a manageable user size.</p>
[explanation]

>>What does "tagging" in tagged private blockchain networks mean?<<
(x) Tagging means that the signature that uniquely identifies a certain block, is pushed to a public network or other legally immutable place.
( ) Tagging means that the signature is pushed to another private network.

[explanation]
<p>The term tagged private blockchain network describes a private network with no external node access. After a few blocks the block hash, i.e. the unique signature of a block, is pushed to a public network. This is understood by “tagging”.</p>
[explanation]

>>What are managed consortium blockchain networks most often deployed for?<<
( ) Supporting legacy infrastructure
(x) Enforcing an existing legal relationship
( ) Replacing legal contracts

[explanation]
<p>Managed consortium blockchain networks are an opportunity for organizations to collaborate in a common managed blockchain. They are mostly used to enforce existing legal relationships between organisations.</p>
[explanation]

>>How could an audit process be facilitated by using blockchain technology within a company?<<
[x] The auditor could have access to all information stored on the managed network
[x] All transactions issued could be checked within an audit process
[ ] The auditor would be able to verify if and which data has been changed in a managed blockchain

[explanation]
<p>An often discussed possible advantage of a blockchain-based solution is the inclusion of auditors and/or supervisory agencies. All relevant information could be stored on a managed network, sheltered by the privacy of the network. If an auditor then receives access to this network, he/she could access all information and verify the correctness of all transactions and their recordings as reported by the auditable entity.</p>
[explanation]

>>Why can ledger integrity in financial infrastructures be improved with blockchain technology?<<
( ) Because managed networks have integrated alert systems in case of inconsistencies
(x) Because each function execution is signed with a private key and every addition to the ledger constitutes a state change

[explanation]
<p>Ledger integrity is a very important aspects of databases and networks, especially in the context of financial infrastructures and companies. Being able to verify the exact record, and to proof it was not unknowingly amended or changed is of essence in financial infrastructures as the processes they deal with have to rely on data accuracy. Ledger integrity can be improved by using a blockchain implantation as blockchains provide immutable records: Each function execution is signed with a private key and every addition to the ledger is recorded as a state change.</p>
[explanation]

>>Why is change management so important for private blockchains?<<
[x] Because there is no central authority in blockchains
[x] Because an unmanaged client update can have disastrous implications
[x] Because a majority of miners has to approve of the change for it to be implemented

[explanation]
<p>Change management is very important in the context of blockchains due to several reasons. No central authority means that to implement a change one has to reach agreement with a majority of the community and also of the miners. Moreover, an unmanaged client update in a blockchain network can have severe implications with potential catastrophic effects, if not done with due diligence.</p>
[explanation]

>>What if a Bitcoin user loses his private key?<<
( ) The user can request a new key from miners
(x) Losing the private key means losing all Bitcoins because there is no other way to proof ownership.
( ) The user can use the public key for computing the corresponding address

[explanation]
<p>If a user loses his private key, all Bitcoins are lost. There is no way to regain the private key and ownership can only be proofed with the private key.</p>
[explanation]

>>What is the biggest difference between Bitcoin and Ethereum?<<
( ) Bitcoin has a bigger market cap 
(x) Only Ethereum is Turing-complete 
( ) Only Bitcoin has transaction fees

[explanation]
<p>Bitcoin and Ethereum are both public blockchain networks. Their main difference is that Ethereum is Turing-complete, meaning it can be used to simulate any Turing machine.</p>
[explanation]

>>What is the EVM for?<<
(x) It is used to execute a smart contract 
( ) It is used to sign transactions 
( ) It is used to mine 

[explanation]
<p>The Ethereum Virtual Machine (EVM) is a Turing complete 256bit Virtual Machine. It is part of the Ethereum Protocol and allows executing code, such as a Smart contract, in a trust-less environment.</p>
[explanation]

>>What is Gas in Ethereum?<<
[ ] Gas is a synonym of a smart contract
[x] Gas is the unit used in Ethereum to measure how much work is needed to perform an action. 
[x] Gas is Ethereum’s fee for each computational step

[explanation]
<p>Gas in Ethereum is a fee for computational steps. Gas measures the extent of computational power needed to execute an operation. You can best understand it as the “gas” you need for your car to travel a distance from point A to point B (i.e. the operation in this case). Gas ensures that operations are only performed when necessary, as well as that token price and price of computation are not linked to avoid token volatility influencing the computation price, and incentivise miners with an economic reward. In addition, Gas assists in prioritising transactions, i.e. the miner is going to choose the transaction with the highest Gas price over those with lower Gas prices. Thus, even when the network receives an immense amount of transactions, miners have the possibility of prioritising transactions.</p>
[explanation]

>>Why does Ethereum use uncles?<<
( ) To be family-friendly 
( ) To reduce block times 
(x) To mitigate the downsides of a reduced block time 
( ) To eliminate the downsides of a reduced block time

[explanation]
<p>Uncles in Ethereum help incentivise mining and with it to maintain mining decentralisation and help compensate for network delays and reduced block time. Uncles do so by making it possible for miners to receive a reward even if another miner was faster, which could be easily caused by a network delay or reduced block time.</p>
[explanation]

>>What is Ethereum’s solution to overcome the halting problem?<<
( ) Smart contracts have a limited number of instructions 
( ) Transactions have a limited number of instructions 
( ) Transactions must complete within a time window 
(x) Each computational step has a cost 

[explanation]
<p>The halting problem in theoretical computer science is the problem of determining if a computer program will at one point finish running, i.e. halt, or if it will continue running without halt. In Ethereum, to resolve the halting problem, i.e. have computer programs that do not halt, every computational steps has a cost.</p>
[explanation]

>>Why did Ethereum split in to Ethereum and Ethereum Classic?<<
( ) Because some miners understood the changes proposed as irrelevant
(x) Because some miners understood the changes as a bailout and immutability compromise
( ) Because some miners found vulnerabilities in the change

[explanation]
<p>Ethereum split into Ethereum and Ethereum Classic as a consequence of the DAO attack in 2016, in which a vulnerability of the infrastructure was exploited through an application operating on the EVM. A soft and a hard fork were introduced to mitigate the problems caused by the attack. The hard fork introduced protocol changes and established a state in which the attack never took place. A small group of miners refused to install the update on the protocol changes because they understood it as a bailout for investors and an immutability compromise. For this reason, the network split into <b>Ethereum</b> and <b>Ethereum Classic</b>.</p>
[explanation]

>>What is sharding?<<
( ) A technique to allocate Gas
(x) A technique to scale out relational databases
( ) A technique to reduce CPU and energy costs for mining

[explanation]
<p>Sharding is a technique in which data from one database is taken and split into multiple databases to scale out relational databases.</p>
[explanation]

>>The Tendermint consensus protocol used in Monax is a proof-of-stake (PoS) based byzantine fault tolerance (BFT) algorithm. Which one of the following statements is true?<<
(x) The proposition must at least get a 2/3-majority of the validator's pre-vote and pre-commit
( ) The proposition must at least get a 51%-majority of the validator's pre-vote and pre-commit.

[explanation]
<p>In Monax, the Tendermint consensus protocol is used. It is a proof-of-stake based byzantine fault tolerance algorithm. A block is committed, if a round is successful. In each round, a random node is picked to propose a block. The proposition must at least get a 2/3-majority of the validator's pre-vote and pre-commit. Proof-of-stake results when the voting power is bound by the amount of currency hold.</p>
[explanation]

>>How is a new block created in Hyperledger?<<
(x) Transaction is broadcast to endorsing peers -> peers endorse transaction -> transaction is sent to ordering service -> ordering service broadcasts new block
( ) Transaction is broadcast to ordering service -> peers endorse transaction -> transaction is sent to ordering service -> peers broadcasts new block
( ) Transaction is broadcast to new block -> peers endorse block -> block is sent to ordering service -> ordering service broadcasts new transaction

[explanation]
<p>In Hyperledger Fabric, a block is created by the transaction being broadcasted to endorsing peers. The endorsing peers simulate the effectuation of the transaction and send the result to the client. The client then makes a decision regarding the transaction. If the client decides to go forward, the transaction is then sent to the ordering services, which orders the transactions received and creates new blocks.</p>
[explanation]



<h1>Self-Assessment: Smart Contracts</h1>

<p>In this past module you have deepened your knowledge regarding smart contracts. This self-assessment quiz is just for yourself to check your learning progress. It is not a part of your final exam.</p>

<p></p>

>>What is a contract commonly known as?<<
[ ] A formalisation of a state
[x] A formalisation of a relationship
[x] A formalisation of a transaction

[explanation]
A contract is commonly known as a formalisation of a relationship and/or transaction.
[explanation]

>>Observability is:<<
( ) the ability of contractors to observe contract performance
(x) the ability of principals to observe contract performance
( ) the ability of principals to observe contract drafting

[explanation]
Observability is is the ability of contract parties to observe the contract performance and therefore in the end prove performance vis-à-vis other parties and/or intermediaries, such as accountants and auditors.
[explanation]

>>Verifiability is:<<
(x) the ability of a principal to demonstrate to other principals and adjudicators the contract performance
( ) the ability of a principal to demonstrate to contractors the contract performance
( ) the ability of an adjudicator to evaluate contract drafting

[explanation]
Verifiability is can be understood as the ability to demonstrate to other contract parties and adjudicators that the actions specified in the contract have been performed.
[explanation]

>>Privity is:<<
( ) the distribution of rights, responsibilities, and resources by defining and delimiting principal's roles
(x) the distribution of rights, responsibilities, and knowledge by defining and delimiting principal's roles
( ) the distribution of roles, responsibilities, and knowledge by defining and delimiting principal's roles

[explanation]
Privity is given when defining and delimiting the roles of the contract parties and detailing the rights and responsibilities of those involved. 
[explanation]

>>What is a smart contract?<<
( ) A written contract, which is applied for developers
(x) An automated, digital agreement and interaction framework
( ) A contract regulating the blockchain

[explanation]
The term smart contract describes an automated, digital agreement and interaction framework. 
[explanation]

>>What are smart contracts in the context of the Ethereum protocol?<<
( ) The Terms of Service of Ethereum 
( ) A self-enforcing legal contract 
(x) A piece of code deployed to the blockchain database that can be executed 

[explanation]
In the context of the Ethereum protocol a smart contract is a piece of code deployed to the Ethereum network that can be stored and executed on the network.
[explanation]

>>What are smart contract attributes?<<
[x] self-enforcing
[ ] self-drafting
[x] self-executing
[x] self-verifying

[explanation]
Smart contracts are self-enforcing, as contract parties are forced to comply with the rules and specifications of their contract by including the stipulated actions in the underlying code. They are self-executing, as they automate the established contractual terms. In addition, they are self-verifying, as the smart contracts exist on the blockchain, as soon as the contract terms are met, transactions are automatically carried out and data is recorded securely as it cannot be altered nor deleted.
[explanation]

>>What are advantages of smart contracts?<<
[x] reduced transaction cost
[ ] easy transferable to common law
[x] lower litigation potential
[ ] good legal semantics incorporation
[x] less-prominent role of 3rd parties
[x] efficient performance evaluation
[ ] monitoring and enforcement more difficult

[explanation]
Smart contracts come with many advantages: reduced transaction costs, lower litigation potential because of their self-enforcing nature, a reduced role of 3rd parties due to automatization, a more efficient performance evaluation based on a higher transparency, as well as improved monitoring and enforcement.
[explanation]

>>Proactive measures are:<<
( ) focused on targeting security issues after the performance phase of a contract
(x) focused on the prevention of contract breach-specific actions

[explanation]
Proactive security measures are focused on preventing actions, which would breach a contract, before a contract is performed. Proactive measures deter malicious behaviour. 
[explanation]

>>What are key legal issues in regard to smart contracts?<<
(x) notice
(x) force majeure
(x) consent
(x) consumer protection
(x) fraud potential

[explanation]
All of them are accurate. Smart contracts face the legal system and its practitioners with new challenges as adaptation is crucial to better embed smart contracts in existing legal structures and establish a legal framework in which to operate them. Without such an embedment smart contracts could pose divergent  to existing legal principles.
[explanation]

>>Which are protocol types?<<
[x] self-enforcing protocols
[x] mediated protocols
[ ] self-verifying protocols
[x] adjudicated protocols

<!-- Include explanation at one point when section in course is also amended -->

>>What are components of a Ricardian contract?<<
[x] contract holder
[ ] contract issuer
[x] readability
[x] digitally signed
[ ] digitally enforced
[ ] digitally drafted
[x] key and server information
[x] secure identifier

[explanation]
A Ricardian contract has a contract holder which as the name suggests holds a contract offered by an issuer. It is readable for contract holders and legal professionals at the same time as for computational programs. In addition, it has several digital components: a digital signature, a key, a secure identifier and server information.
[explanation]

>>Combining a Ricardian contract with a smart contracts allows for:<<
( ) an inclusion of semantic depth and smart operation
(x) an inclusion of legal semantics and operational performance

[explanation]
A combination of a Ricardian contract and a smart contract is envisioned to allow for an inclusion of legal semantics, the Ricardian contract part, and operational performance, the smart contract aspect.
[explanation]



<h1>Self-Assessment: the Crypto Economy</h1>

>>The term crypto economy isused to describe:<<

(x) New and sometimes different business models
( ) New and sometimes different financial models
( ) New and sometimes different crypto institutions

>>An internal business model in a crypto economy is:<<

[x] A pure crypto economic business model
[ ] A business model that relies on off-chain data
[x] A business model in which all activity happens within one blockchain network
[x] A business model that is suited in the blockchain realm

>>A mixed blockchain business model in a crypto economy is:<<

[ ] A business model in which all economic activity occurs within one blockchain
[ ] A pure crypto economic business model
[x] A business model which is based on on- and off-chain data and information
[x] A business model with activity outside and inside of a blockchain
[ ] A business model with activity outside of a blockchain

>>An external business model in a crypto economy is:<<

[x] A traditional business model as already existent and/or possible before the emergence of blockchain technology
[ ] A business model based on on-chain activities
[x] A business model in which all activity occurs outside of a blockchain
[ ] A business model with activities happening in and outside of a blockchain network

>>Mining can be understood as an internal blockchain business models as:<<

( ) Miners can sell their computing power
(x) Miners get awarded rewards and/or transaction fees
( ) Miners get fiat money for each validated transaction

>>A block header has to include which of the following?<<

[ ] Transactions
[ ] Transaction pools
[x] Merkle root
[x] Nonce
[x] Hash of the previous block
[ ] Candidate block
[ ] Coinbase transaction

>>Mining pools are a result of:<<

[x] Rising difficulty
[x] Increase overall network computational power
[x] Underlying security mechanisms of PoW networks
[x] Increasing mining costs
[x] Increasing number of miners

>>External data can be introduced in a blockchain network with the help of:<<

[x] Oracles
[ ] Validator nodes

>>What are the main issue with including external data in a blockchain<<

( ) Data is reliable
(x) Data cannot be verified
( ) Data from 3rd parties cannot be introduced

>>What is a digital identity<<

( ) An avatar in a computer game
( ) A social media profile
(x) An entity with attributed information

>>Identity can be seperated into:<<

(x) Core identity and attributes
( ) Core identity and attractivity
( ) Core attributes and multiple entities

>>What are the main challenges in post-trade processing?<<
[ ] Compartmentalisation
[x] "Golden record" keeping
[x] Data integrity

[explanation]
The main challenges in post-trade processing is maintaining a “golden record”, a master source for information and a high degree of data integrity, i.e. accurate and consistent data.
[explanation]

>>What are the two types of trade compression?<<
( ) Internal and external
( ) One-step and multi-step
(x) Bilateral and multilateral

[explanation]
There are two types of trade compression: bilateral and multilateral. Bilateral trade compression refers to situations in which firms cancel contracts in their respective portfolios bilaterally. Multilateral trade compression describes a situation in which a group of market participants cancels the offsetting trades with other members of the group based on their agreement.
[explanation]

>>A blockchain solution for post-trade processes in settlement obligations could allow for:<<
[x] Real-time monitoring
[x] Automation
[x] Processing of external events
[ ] More third-party involvement
[x] Minimisation of human error
[x] Speed of trade

[explanation]
A blockchain-based solution for post-trade processes to settle obligations can be expected to not lead to more third-party involvement as blockchain implementations do not really on central entities of authority.
[explanation]

>>A blockchain solution for letter of credits compared to traditional letter of credits could be:<<
[x] Faster due to automation
[ ] Simpler due to manual compliance and monitoring activities
[ ] Increased availability of letter of credits
[x] More efficient

[explanation]
A blockchain solution for letters of credits can be expected to be more efficient and faster due to automation in addition to a better availability of relevant data.
[explanation]

>>A common bond blockchain market would connect the following actors:<<
[ ] Brokers
[x] Bond sellers
[ ] Clearing banks
[ ] Registrars
[x] Bond issuers
[ ] Custodians
[x] Bond buyers
[x] Regulators

[explanation]
In traditional bond markets, a vast number of actors is engaged in a very complicated process. High transaction, issuance, asset servicing, and regulatory costs make the process very expensive. A blockchain market for bond trades could connect the bond issuers, sellers, and buyers, and allow for regulator oversee. Thus, it would reduce the number of actors required to participate in the process.
[explanation]

>>What are critical points in regard to ICOs?<<
[x] Highly speculative
[x] Difficult to interpret and inform investors
[x] Unregulated
[x] Misuse and criminal purpose

[explanation]
ICOs as a new type of mechanism are highly debated. They are said to be speculative, difficult to interpret for investors and susceptible to misuse and criminal purpose as they are unregulated and there are no formal mechanisms to protect and inform investors. 
[explanation]

>>Digital identities can be:<<
[x] Government-based
[ ] Business-based
[x] Consortia-based
[x] Self-sovereign

[explanation]
Digital identities can be government-based in case the government is the main identity provider, consortia-based when commercial entities provide identities in cooperation with governmental institutions, and self-sovereign when the identity holders themselves control the link between their identity and information.
[explanation]

>>Implementing a blockchain-based solution for VAT tax automation, can lead to:<<
( ) Decrease the amount of VAT
(x) Closing the VAT Gap
( ) Increase administrative tasks for tax authorities

[explanation]
Using a blockchain solution to automate VAT taxes, could reduce administrative tasks for tax authorities by increasing automation and transparency, increase the amount of VAT taxes collected, and help close the VAT Gap.
[explanation]

>>How does blockchain enable new marketplaces?<<
[x] Lowering transaction cost
[ ] Avoiding KYC
[x] Lowering transaction risk

[explanation]
Blockchains enable new marketplaces as they lower transaction costs, mainly due to automatization, and lower the risk of transactions. As all transactions are recorded in a blockchain network, they become much less risky.
[explanation]

>>What is an ICO?<<
(x) Initial Coin Offering, a funding mechanism
( ) Inter-Chain-Operation, a side chain protocol
( ) Intergalactic Calculation Option, a distributed computation market

[explanation]
An ICO is an Initial Coin Offering, which generally speaking can be understood as a new funding mechanism designed to raise capital especially in the context of crypto projects.
[explanation]

>>What makes blockchain technology uniquely suited for keeping track of shares and equity allocation?<<
(x) Cryptographically secured data chains provide a good protection against record tampering
( ) Blockchain projects are often funded through ICOs

[explanation]
Blockchain technology is suited to keep track of shares and equity as its record immutability is very high, i.e. the data chains are cryptographically secured. Thus, it is very securing against record tampering.
[explanation]

>>Why is a blockchain approach so interesting for fixed income instruments?<<
( ) Smart contracts are always fixed income
( ) Fixed income instruments require a high transaction throughput which smart contracts provide
(x) Regular payment logic and tracking ownership of instruments can be implemented using smart contracts

[explanation]
Fixed incomes could prove to be a future area of blockchain applications as regular payments and tracking of ownership could be implemented by self-executing and -enforcing smart contracts. Automation could help reduce costs and complexities in fixed income processes.
[explanation]



<h1>Self-Assessment: Cryptocurrencies</h1>

>>What is a cryptocurrency?<<

(x) A digital asset, which functions as a medium of value exchange, bound to the cryptographic protocol of a decentralised network, and its programmed rules
( ) A  digital money type, which functions as a medium of value exchange, bound to the cryptographic fundamentals of a decentralised technology

>>What is understood as tokenisation?<<

( ) The including of digital assets (stocks, gold, bonds, real estate) onto a blockchain
( ) The including of asset rights (stocks, gold, bonds, real estate) onto a computer network
(x) The including of asset rights (stocks, gold, bonds, real estate) onto a blockchain

>>What is fiat money?<<

[x] A currency that does not hold an intrinsic value
[x] A currency that does not have a "use value"
[ ] A currency that holds an intrinsic value

>>What are types of wallets:<<

[ ] Imaginary wallets
[x] Paper wallets
[x] Mind wallets
[x] Soft-wallets
[ ] Cold wallets
[x] Hard wallets

>>What does gold-pegged mean?<<

( ) A currency that is linked to other currencies
(x) A currency that is linked to gold
( ) A currency that is combined with values for precious metals

>>What are functions of currencies?<<

[ ] Store of accounts
[x] Store of value
[ ] Representation of account balances
[x] Method of transfer
[x] Unit of account

>>What different types of trust do gold, fiat and cryptocurrencies rely on?<<

[x] Trust in a central authority
[ ] Trust in rules and regulations
[x] Trust in the value
[x] Trust in the protocol
[ ] Trust in government guarantees

>>What does "pre-mined" mean?<<

(x) Tokens are mined before a cryptocurrency begins its official existence
( ) Tokens are mined following the PoW consensus algorithm

>>How are Bitcoins mined?<<

( ) Bitcoins are mined using PoS
(x) Bitcoins are mined using PoW
( ) Bitcoins are mined before ICOs
( ) Bitcoins are mined by selected investors

>>What is a "deflationary cryptocurrency"? A currency that:<<

(x) The amount of currency in circulation decreases and with it the value of the currency increases
( ) The amount of currency in circulation increases and with it the value of the currency increases too

>>Do all cryptocurrencies have a capped supply?<<

(x) No
( ) Yes

>>What is a wallet?<<

[x] A store of private keys
[x] A store of keys to access coins owned
[ ] A store of coins

>>How do you create a paper wallet?<<

[x] Generate a random code
[x] Write the key down on paper
[ ] Take a screen shot of the random code
[ ] Store the key in a file called paper.png

>>What is cold storage?<<

( ) A storage of keys that is accessible via the internet
(x) An offline storage of keys
( ) An online storage of keys
( ) A storage of keys for blockchains

>>What is hot storage?<<

( ) A key storage without access to the internet
( ) A key storage on an external device
(x) A key storage with access to the internet

>>What is a seed?<<

[x] The initial instruction to generate a key
[x] The initial instruction to generate deterministic key
[ ] The initial instruction to generate a blockchain key

>>What are altcoins?<<

[ ] Coins based on the Bitcoin blockchain
[x] Coins that are ERC20 tokens
[ ] Coins that represent real-world assets
[x] Coins based on protocols that are not Bitcoin
