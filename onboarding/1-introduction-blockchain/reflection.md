---
title: "Reflection Questions"
order: 11
description:
tag: fast-track
---

For deployment pattterns:
# Social Dimensions of Blockchains: Why is Change Management Important in the Blockchain Context?

Change management in public blockchain networks is quite different to how change management works in vendor driven, or even in open source environments.

Traditionally, a vendor or team develops and maintains a piece of software. 
They periodically release updates to their software and may even force those updates.
One way is to change server-side APIs so that old versions of the software become inoperable. 

Blockchain network clients, which are the implementations of the protocols, have evolved somewhat differently.

Because there is no authority that determines what version of the protocol is "correct", the truth is always what the network accepts as such.
This means that in order for the protocol to change, a large majority of miners have to accept the version that implements the change.

Different networks implement different voting mechanisms that miners use to signal their acceptance of a particular proposal.
Unlike in traditional software distribution, the effects of an unmanaged client update can be severe in blockchain networks. 
If a client software update that implements a protocol change is only downloaded and used by half the miners, the network can break into two different versions.



## The Bitcoin block size debate

The Bitcoin block size debate is a good example of the political complexities of change management in public networks. 
It revolves around a seemingly simple technical question.

In the early days of Bitcoin, the community decided to adopt a strict size limit for blocks; In 2010, a block size limit of 1 MB was added.

It is often argued that the limited block size was introduced to prevent spamming but also a chain split due to dissensus in accepting all kinds of block sixes. 

The question that has been debated hotly since 2015 revolves around whether and if yes, how to change the size limit of blocks.

Advocators for an increase of the block size limit explain the necessity of it with the increased transaction volume in Bitcoin. 
A bigger block size would make more transactions per seconds possible. 
Another argument in favour of bigger blocks is that smaller block sizes might lead to higher fees for faster verification. 
Higher fees reduce spamming and help incentivise miners. In the end, they secure the Bitcoin ecosystem.

At the same time, higher fees could slow the adoption and development of Bitcoin, as it would become less attractive for users. 
Increasing block size could also have negative effects on decentralisation. 
Full nodes would become more expensive to operate and thus the number of users running full nodes would decrease. 
The hash-rate of miners would increase and with it the degree of centralisation in Bitcoin. 
Decentralisation is core for the trust in Bitcoin. 
Thus, one would have to include possibilities to increase trust in the network to compensate for the effects of increased block size limit.

The block size debate has become an increasingly political debate with multiple sides and many agendas. 

<div class="b9-tip">
	<p>If you are interested to read how these questions are discussed, take a look at the <a href="https://www.reddit.com/r/Bitcoin/comments/5xg7f8/the_origins_of_the_blocksize_debate/">blocksize debate on Reddit</a>.</p>
</div>

### SegWit

As a reaction to the debate, **Segregated Witness (SegWit)** was introduced.

SegWit introduced as an implemented **soft fork change** will change the **transaction format** of Bitcoin. 
In addition, **malleability** and the **blockchain size limitation** are addressed with it. 

SegWit separates transaction, sender, and receiver data from the signature or “witness” data, scripts, and signatures. 
Signature data is attached to the transaction data but separated from the Merkle tree record. 
A byte of signature data is only counted as a quarter of its real size.

With this mechanism blocks larger than the block size limit of 1 MB can be created. 
The definition of a block is changed and therefore block size is increased while still formally adhering to the block size limit.

In regard to malleability, SegWit was designed to counter a problem linked to Bitcoin’s popularity. 
Transaction speed has decreased due to the vast amount of Bitcoins and the limit on block size because the limited size limits the number of transactions per block. 
Signature malleability is seen as being increased due to SegWit because signature data is no longer part of the transaction data. 
Thus, signatures will become impossible to change.

Moreover, SegWit will make the use of the [**Lightning Network**](http://dev.lightning.community/) possible and enable fast, instant transactions. 
The Lightning Network is a protocol for payment transactions, in which a P2P system for micro-payments is included. 
If payments are done with the Lightning Network, transactions are bundled and only the start and end of a transaction is on-chain. 

Before SegWit, the use of the Lightning Network would have not been secure due to the malleability problem. 
Enabling micro-payments of cryptocurrencies off-chain would continue to make small transactions possible without having to pay increased transaction fees and they would profit from increased transaction speed. 
Thus, it counters scalability issues.

SegWit was activated in August 2017. Still most transactions on the network have not used the upgrade. 
This might also be because it was deployed as an optional protocol upgrade to prevent a hard fork. 

<div class="b9-reading">
	<ul>
	<li><a href="https://www.cryptocompare.com/coins/guides/the-dao-the-hack-the-soft-fork-and-the-hard-fork/">Madeira, A. (2016): <i>The DAO, The Hack, The Soft Fork and The Hard Fork</i></a></li>
	<li><a href="http://www.coindesk.com/understanding-dao-hack-journalists/">Siegel, D. (2016): Understanding The DAO Attack</a></li>
	<li><a href="http://dev.lightning.community/">The Lightning Network</a></li>
	<li><a href="https://coincenter.org/entry/what-is-the-lightning-network">Stark, E. (2016): <i>What is the Lightning Network and how can it help Bitcoin scale?</i></a></li>
	</ul>
</div>


--> Reflection gen

Let us now reflect on the most crucial topics in this module! The following questions invite you to repeat the most important concepts of this module.

* In which way can a blockchain be understood as a data structure? How does it store and organise data?
* Some argue that blockchains can be viewed as a merge of data storage and networks. Why?
* In what way is a distributed ledger different from a traditional one? How does distributed ledger technology solve the double-spending problem with digital currencies?
* Why was asymmetric cryptography revolutionary? And how can public-private key pairs be used?
* What is the role of cryptographic hash functions in blockchains?
* What is the function of consensus mechanisms and how can they be differentiated?



--> Reflection from deployment patters
# Reflection

Let us reflect on the most important aspects of deployment patters presented in this module.

* Why is it so essential to ponder whether to utilise a public or private network for a blockchain project? 
* Remember the differences between public and private blockchains: What are the main differences and what are general advantages and disadvantages of public and private blockchains? What do you have to consider when planning projects based on blockchain technology?
* Why and how can public blockchains be permissioned?
* What are the advantages of managed blockchains applied in regard to governance?
* Thinking on the original purposes/ambitions of blockchain technology: What is the status today? How secure is the technology actually?
* Traditional money distribution vs. mining - what are the big differences and which issues still have to be solved in mining?
* One of the big differences between Ethereum and Bitcoin protocol is the block time. Why is it much shorter in Ethereum? In which sense was the consensus mechanism modified in order to achieve shorter block time?
* When keeping in mind the DAO and block-size debate: Why is change management so important in blockchain?
* If you recall the Tendermint consensus protocol, the consensus mechanism used by MONAX, can you describe how it works?
* Remember, Chaincode is Hyperledger Fabric's implementation of smart contracts. What are characteristics of a chaincode?
* What are “channels” in Hyperledger Fabric and how do they work?



--> Reflection from smart contracts
# Reflection

Let us reflect on some crucial topics of this module. 
This questions are just for you to repeat the content and if you like to start some discussions on Slack. :)

* Smart contracts are self-executing, self-enforcing and self-verifying contracts which means that contractual processes are different to traditional contracting. What are the main benefits of smart contracts? And on the other hand: Where are its limits?
* Let us repeat the main principles of contracting - observability by contract principals, verifiability by third parties and privity. What are the challenges and difficulties one is faced with when thinking about smart contract implementation?
* The implementation of smart contracts will have impact on legal professionals. What would it mean for legal professional and how could their role change due to smart contract utilisation?
* Ledger technology is still in an early adoption stage. Some characteristics of common contracts are difficult to implement with smart contracts. What are the challenges of smart contracts to be solved?
* What are the components of a Ricardian Contract and what are they able to do in comparison to common law contracts?

--> Reflection economics
* Think about game theory. How do blockchain protocols like Bitcoin use game theoretical foundations?


--> Reflection cryptoeconomy
# Reflection

In this module we took a look at the crypto economy. We started with the conceptualisation of the term and then proceeded to take a closer look at existing and possible internal and mixed business models. The following questions can serve to start thinking about the crypto economy beyond the presented course content:

* Do we need the concept of a crypto economy? Recap what is meant by this term and reevaluate whether a new concept is needed or whether there are already fitting concepts in existence.
* Crypto economy as a concept of business strategy in blockchain technology describes basically two business models: Internal Business Models and Mixed Business Models. What are the characteristics of each model? How can they be differentiated? Where are they found and/or could they be used?
* With Blockchain technology new marketplaces are arising. What are the circumstances and advantages of decentralised infrastructures that would allow the development of new marketplaces?
* The creation of new payment systems is one of the most advanced application areas of blockchain technology in traditional economies. Cryptocurrencies are becoming more and more accepted. What are the fundamental attributes of payment systems build on blockchain technology?


--> reflection cryptos
# Reflection

In this module we took a look at cryptocurrencies. We started with the fundamentals, some historical developments, and a general conceptualisation of currencies and their role. Afterwards we took a closer look at cryptocurrency business models, and potentials and barriers for cryptocurrency adoption. The questions beneath are intended to further let you think about the topic of this module and the course content:

* How are the terms blockchain and cryptocurrency connected?
* How did centralisation change from gold, fiat money, digital money, and cryptocurrencies?
* How does the risk-return trade-off relate to ICOs?
* Why is high volatility worrisome and how can it be explained?
* In which way can mining be understood as a business model?


