---
title: "Network and Protocols"
order: 3
description: 
tag: fast-track
---

--> Curtail content

# Networks & Protocols

After thinking about databases, it’s time to learn about networks.

We will not go into too much depth, but a few concepts are relevant in understanding the development of blockchain technology.

## Important terms in networking

A network is a group or system of interconnected computer systems and other computing hardware devices. 
These are connected through communication channels between the different nodes or data links allowing them to exchange data/communicate and share resources, as well as operating programs and information. 

![network](images/network.png)

In the following, we will discuss the concept of data transfers and revisit how protocols in networking can solve problems in a hierarchy-free, fault-prone environment.
To make this easier, let us start with some definitions:

* **network**: a group or system of interconnected computers and other hardware devices;
* **node** (or members of the network): connected through communication channels that enable them to exchange data and share resources;
* **protocol**: set of rules governing the exchange or transmission of data between devices;
* **document**: a set of structured data that has a beginning and an end;
* **client**: In a network, a client refers to a computer that is capable of obtaining information and applications from a server;
* **server**: refers to a computer or computer program which manages access to a centralised resource or service in a network.

## Data transfer

The most basic attribute of networks is the ability to transfer data between computers. 

Let us briefly recall how that process works in the context of databases.

Imagine two machines that are connected to each other and have access to two different databases.

1. Computer A sends a discrete request for a set of information that is located on another machine.
2. Computer B accesses its database, querying for the data Computer A asked for.
3. Computer B retrieves the data and compiles a document.
4. Computer B sends the document to Computer A.
5. Computer A receives the document and interprets the data, perhaps storing it in its own database or executing a series of actions.

The role of **documents** is important to highlight here.

To **synchronise data between machines**, an encode-decode sequence happens on the two computers.
First, a sequence of characters is *encoded* in a specialised format, send, and then *decoded* by reversing the process. 

Common codes include the American Standard Code for Information (ASCII) for text files, Unicode, MIME, BinHex, and Uuencode and in the context of data communications among others Manchester encoding. 

What does a document transfer look like? 
Let us use the example of an **API request**:

![API request](images/apirequest.png)

1. A client sends a request to an API endpoint, along with attributes for the data requested, e.g. `GET https://example.com/inventory?id=2311`.
2. The server receives the request and queries its inventory database for the requested data, e.g. `SELECT * FROM inventory.products WHERE id=2311;`.
3. The server forms a JSON response, the document, from the data, e.g. `{"products": [2311: {"name": "Raw Linseed Oil"}]}`.
4. The server sends the document to the client, which is waiting for the response.
5. The client reads the document, attempts to parse it as JSON, and stores the product information in a local SQLite database, e.g. `INSERT INTO favourites (ext_id, name)
VALUES (2311, "Raw Linseed Oil");`.

<div class="b9-expandable-box">
	<div class="b9-expandable-title">
		JavaScript Object Notation - JSON
	</div>
	<div class="b9-expandable-text">
		<p>JSON is an open-standard, language-independent <b>data format</b>. Meaning it is a publicly-available standard for encoding information that is stored in a file and it is not limited to one programming language. It is used as a data format for browser-server communication. It uses human-readable text to transmit data objects.<p>
		<p>JSON is based on JavaScript. It was developed as a response to the need for a protocol that could ensure server-to-browser communication without relying on browser plugins (like Java or Adobe Flash Player), i.e. software components which add new features to web browsers and are also referred to as "add-ons" or "extensions".</p>
		<p>Other to JSON comparable formats are XML, CSV, and YAML.</p>
	</div>
</div>

What are potential failures?

* The client could send a request that the server does not understand, or send a malformed request;
* The server could create a document that the client does not understand, e.g. server sends XML when client expects JSON;
* The server could send a malformed document;
* Either party could send a malicious request, e.g. SQL injection `GET https://example.com/inventory?id=2311%3BDROP%20TABLE%3B`.

In modern network systems and in fact the web itself, a great deal of effort goes into mitigating these translation and synchronisation issues between clients and servers. 
Traditionally, network synchronisation issues were often mitigated by implementing some kind of hierarchy. 
Blockchain uses a **non-hierarchical approach** to mitigate synchronisation issues by making sure that every participant always has access to enough data to verify the integrity of ALL the data in the network.

## Protocols & fault tolerance

Before we dive into how these issues are approached with blockchain technology, let us revisit how protocols in networking solve problems inherent to a hierarchy-free, fault-prone environment.

The term **networking** covers both the hardware side and the software protocols used to transmit data and let computers communicate. 
Because networks have a physical aspect, the interaction between software and hardware becomes especially interesting in a blockchain context.

Imagine a cable connection between two computers. Traditionally a coaxial cable was used to carry a signal. 
Cables can be subject to interference from many things, so there is no guarantee that the signal originating at point A will be received by point B.

To mitigate this problem and ensure smooth communication, a whole stack of hardware and software protocols has been developed. 
Remember, **protocols** are like behaviour guidelines for machines that help them cooperate and understand each other, as well as mitigate any translation and synchronisation issues.

What happens in the case of missing data? 

To facilitate data transfer, protocols like TCP split data into small packets and transmit each one individually. 
These bits of data are converted into an analogue signal on the hardware level. On the receiving end, the signals are reconstructed and the software protocol re-assembles the original piece of data. 
If a packet is missing, the receiving computer can ask for the **re-transmission** of the missing bundle of data.

![TCP request](images/document.png)

### Fault tolerance

**Fault tolerance** is the capability of a computer, electronic system, or network to keep operating even when components fail.

A **fault-tolerant design** requires:

* **no single point of failure** - a fault-tolerant system should continue operating uninterrupted while it is repaired;
* **fault isolation and containment** - failures should not affect the entire system by being isolated and contained;
* **reversion modes** should be available.

When learning about blockchain, it is worth understanding these fundamentals because the technology operates in a similarly uncertain environment. 
Blockchain is designed to be fault-tolerant, thereby minimising potential disruption and damage in adverse conditions.

## Centralised, distributed or decentralised

The function of a network is largely defined by its **degree of centralisation**. Generally, networks can be centralised, decentralised or distributed.

![Paul Baran Networks](images/PaulBaran.png)

You will see the term "decentralised" come up a lot in blockchain literature. What exactly constitutes a distributed vs. decentralised system is a hotly debated subject. Complicating things further is the fact that systems can be a mix of both.

<div class="b9-expandable-box">
	<div class="b9-expandable-title">
		Paul Baran's <i>On Distributed Communications</i>
	</div>
	<div class="b9-expandable-text">
		<p>In 1964, before major discoveries and developments such as public key crypto systems and P2P networking Paul Baran published a paper <a href="https://www.rand.org/content/dam/rand/pubs/research_memoranda/2006/RM3420.pdf"><i>On Distributed Communications</i></a>. In it, he attempted to differentiate between diverse degrees of decentralisation.</p>
		<p>Centralisation and decentralisation were attributes introduced long before to describe political systems and power structures.</p>
		<p>In Baran’s conceptualisation, a spectrum of network typologies were identified. The main point of differentiation between the different typologies was the number of so-called <b>points of failure</b>.</p>
		<p>After Baran introduced his typology accompanied by developments in networks, databases, computing, and cryptography, a more detailed continuum of typologies was proposed. Among other aspects, the importance of resource and power control was emphasised.</p>
	</div>
</div>

For the purpose of our discussion, we will focus on the main difference between the different types: the number of **points of failure**.

A **point of failure** can be understood as a single node or part of a network whose failure leads to the shutdown or dysfunction of the entire network and/or the system no longer being able to perform its intended operations. 

Centralised networks only have **one** point of failure. 
Erasing a point of failure leads to less centralisation and towards a distributed network.

There were different network typologies proposed. Some view resource and power control as important aspects to differentiate networks. 
As [Greg Slepak](https://www.youtube.com/watch?v=7S1IqaSLrq8) points out, differentiating distributed and decentralised networks by the location and control of resources still includes a linear spectrum notion of centralisation in networks.

<div class="b9-tip">
	<p>Watch <a href="https://www.youtube.com/watch?v=7S1IqaSLrq8"> Greg Slepak explain the concept of decentralisation</a> in 5 minutes.</p> 
</div>

Although the advantages and disadvantages of each type continue to be debated, one can conclude that the network design has implications on functionality and more general issues, for example privacy, transparency, etc. 
It is important to keep in mind, a network does not have to be centralised, decentralised or distributed -it can be a mix of different components of each. 
Network design should always match the envisioned functions of the network.  

## Peer-to-peer (P2P) networking

A **peer-to-peer (P2P) network** has a **distributed architecture**, meaning that work is distributed among members of the network. 
P2P networks are usually composed of computer systems as peers and connect via the Internet. 
All participants, called nodes, are equal in that they can all request information and answer requests. 
Understood as equality is that all participants are **equally privileged and equipotent**. 
For this reason, P2P networking has been seen as a mean for an egalitarian social network. 

Each node connects to a limited number of other nodes, which are commonly referred to as its **peers**. 
Peers make resources like computing power and network bandwidth available to all peers in the network.

P2P networks are highly different from client-server networks, in which the data supplier and consumer roles are ascribed to different entities and all communication happens through a central server. 
In a traditional client-server architecture, participants are either a client, which requests information, or a server, which answers those requests. 
Centralised security databases that restrict control to server assets help improve security. 
Client-server networks are suitable for large networks but can become expensive when handling large amounts of data, transfers, and clients.

![Client-server model](images/clientserver.png) 

In P2P networking there is no central server, storage, or authentication of users. 
Peers can be understood as file servers and clients at the same time. 
If a node cannot answer a request, it will forward it to some or all of its known peers.

![P2P Network](images/P2PNetwork.png)

P2P networks became popular in file-sharing applications like Napster and BitTorrent, which are typically associated with illegal music downloading and piracy. 
P2P networks are usually recommended for private households or small businesses. -They are economically speaking **cheap to set up**, but **security issues** can create expensive problems.

### Security in P2P networks

Security is challenging in P2P networking for two reasons.

* P2P software has to be **downloaded** to become part of the network, making it especially vulnerable to remote exploits. 
* Because of **interconnectivity**, every peer has an equal network connection, a malicious participant could send incorrect requests or returns, as well as malware and corrupted data through the entire network. Other security risks are denial of service (DDoS) attacks, routing attacks, and routing network partitions. 

Hashing, chunk verification, and a higher degree of encryption are means to mitigate security risks in P2P networks. 

### P2P networking & decentralisation

P2P networks can be decentralised, distributed, centralised or a mix. 
When a system has different components, which combine P2P elements with other networking concepts, it can at the same time have parts typically known as distributed and include centralised aspects.

Remember the two P2P services we mentioned earlier, Napster and BitTorrent? They include parts typically known as distributed and include centralised aspects.

**Napster** is a music-focused file sharing service. 
Its earliest version used **distributed data storage**, since music files were distributed through peers and not stored on a central database. However, a **central server** was used to manage the peers. Napster combined a distributed P2P data storage with a central managing authority, the Napster server. 
After the Recording Industry Association of America (RIAA) sued Napster for facilitating the sharing and transfer of copyrighted material, Napster shut down its original P2P network in July 2001. 

**BitTorrent** is another P2P file-sharing service that is also used to share music. Like Napster, BitTorrent uses a **data storage among peers**. However, it has a **decentralised network structure** since there is no central server. BitTorrent also faced legal complaints due to allegedly facilitating copyright infringement through illegal downloading. But this time, the case was not so clear as with Napster. Why?

Because of BitTorrent’s decentralised coordination of peers. There was no central server that could be turned off to shut down the network.

These two examples show how **network design and structure** choices can have far-reaching impacts. Knowing how P2P networks work is essential in understanding blockchain technology. Just think about the similarities between P2P network architecture and the network structure of blockchain applications.

## Blockchain as a merge of data storage and network

Historically, data storage and networks have been **treated separately**, mainly because the former was adopted long before the latter. Networks were built first, and data storage was connected afterwards.

Blockchain merges these two concepts by combining elements of a database with a P2P network. 
Blockchains store data in the same way as a **decentralised database**, and also use P2P networking.

This has immense implications for the social systems being built on top of this new technological layer.

<div class="b9-tip">
	<p>Watch Vinay Gupta elaborate on the <a href="https://vimeo.com/161183966">significance of blockchains</a>.</p>
</div>

### A blockchain computer?

<!-- Title: How does Blockchain Actually Work?, URL:https://www.youtube.com/watch?v=Za5lPKNV_Mk&feature=youtu.be -->

If we imagine blockchain as a computer, it would have three layers: **database**, **network**, and **state**. 
The entire computer is a collection of blocks where every new block represents an update to the state layer. 

![blockchain computer](images/blockchain-computer.png)

Remember, data cannot be deleted or altered after being stored on a blockchain.

All **data**, such as currency transfers or smart contract code or calls of function, is encoded in **transactions**, which are bundled into blocks and must be validated. 

The blockchain network layer is comprised of **nodes**. 
Each node has a copy of the chain of blocks. 
Nodes are usually given equal power, but power distribution depends on the deployment pattern of the blockchain.

Currency transfers and smart contract implementation is done by adding transactions to the blockchain, which will again be bundled into a block and verified. To interact with the state layer of the blockchain computer, a user can send transactions or view information by coupling an application with a node. Smart contracts can then be used to interact with transactions.

<div class="b9-reading">
<ul>
	<li><a href="https://www.rand.org/content/dam/rand/pubs/research_memoranda/2006/RM3420.pdf">Baran, P. (1964): <i>On Distributed Communications</i></a></li>
	<li><a href="https://www.youtube.com/watch?v=7S1IqaSLrq8">Slepak, G. (2015): <i>Deconfusing Decentralization</i> -A very good introductory video on the concept pf decentralisation</a></li>
	<li><a href="https://vimeo.com/161183966">Gupta, V. (2016): <i>Vinay Gupta at Michel Bauwens & the Promise of the Blockchain</i></a> -Vinay Gupta explains the significance of blockchains</li>
</ul>
</div>
