---
title: "Technical Background of Blockchain Technology"
order: 3
description: From networks and protocols to consensus in decentralized networks
tag: fast-track
---

# Technical Background of Blockchain Technology

<HighlightBox type="learning">

You are going to dive deeper into the tech background making blockchain protocols possible by:

* Reviewing what networks and protocols are, as well as recapping the most central terms in networking - node, client, and server.
* Exploring in which way blockchains are distributed ledgers.
* Taking a closer look at public-key cryptography.
* Diving into how consensus is reached in a decentralized network.
* Revisiting the different conceptualizations of blockchains.

</HighlightBox>

In this section, you explore the technical background making blockchains possible. Starting with networks and protocols to then dive deepeer into blockchains as a ledger, as well as how consensus is established in blockchains, and cryptographic fundamentals of blockchain technology.

If you are thinking "this all sounds very familiar", do not worry: you can always go ahead to the [next section](./blockchain-in-detail.md) for a closer look at blockchain technology itself - the origins of blockchain technology, deployment patterns in blockchain, and smart contracts.

## Networks and protocols

It is time to learn about networks. You will not go into too much depth, but a few concepts are relevant to understand blockchain technology.

A **network** is _a group or system of interconnected computer systems and other computing hardware devices_. These are connected through communication channels between the different nodes or data links allowing them to exchange data and share resources, operating programs, and information.

![A network of computers](/onboarding/1-introduction-blockchain/images/network.png)

Begin with a few important terms in networking by clicking on the expansion box below.

<ExpansionPanel title="Some definitions of key terms in networking">

Start with some definitions to make this easier:

* **Data:** a series of one or more symbols given meaning by acts of interpretation.
* **Database:** an organized collection of data.
* **Data field:** holds a single attribute of an entity. For example, a date field "15th of October 2018" can be treated as a single data, the birthdate, or three separate fields, meaning day, month, and year.
* **Record:** a compilation of fields containing exactly one value. For instance, an employee record might contain fields like name, address, and birthdate;
* **File:** a collection of related records.
* **Network:** a group or system of interconnected computers and other hardware devices.
* **Node:** or members of a network, connected through communication channels that enable them to exchange data and share resources.
* **Protocol:** set of rules governing the exchange or transmission of data between devices.
* **Document:** a set of structured data that has a beginning and an end.
* **Client:** in a network, a client refers to a computer that is capable of obtaining information and applications from a server.
* **Server:** refers to a computer or computer program, which manages access to a centralized resource or service in a network.

</ExpansionPanel>

In the following, you get to revisit the concept of data transfers and how protocols in networking can solve problems in a hierarchy-free, fault-prone environment when it comes to network failures.

### Data transfer

The most basic attribute of a network is the ability to transfer data between computers. Let us briefly recall how that process works.

Imagine two computers that are connected and have access to two different databases:

1. Computer A sends a request for a set of information that is located on another computer.
2. Computer B accesses its database, querying for the data Computer A asked for.
3. Computer B retrieves the data and compiles a document.
4. Computer B sends the document to Computer A.
5. Computer A receives the document and interprets the data, perhaps storing it in its database or executing a series of actions.

In general, an encode-decode sequence happens on the two computers to **synchronize data between machines**. First, a sequence of characters is *encoded* in a specialized format, then send, and *decoded* by reversing the process.

The role of **documents** is important to highlight here. What does a document transfer look like?

As an example, picture an **API request**.

<ExpansionPanel title="What is an API and an API request?">

The term **application programming interface (API)** describes _a connection between computers (and their software)_. You have probably heard the word API, more specifically web API, quite often when it comes to communication between computers via the internet. You can find APIs for software libraries and programming languages.

What is an API request?

With APIs, developers can make calls or requests to send and receive information. Such type of communication is often done using JSON, a programming language, and called an API request. Each API request has:

* An API endpoint - you can often find a URL for the endpoint to allow software to communicate with each other;
* A header providing information for clients and servers, for example, authentication credentials;
* A method, which specifies the action necessary for the request - four basic and often used API methods are `GET`, `PUT`, `POST`, and `DELETE`;
* Data, or information, send by a server specifying the request.

</ExpansionPanel>

![API request](/onboarding/1-introduction-blockchain/images/apirequest.png)

1. A client sends a request to an API endpoint, along with attributes for the data requested - `GET https://example.com/inventory?id=2311`.
2. The server receives the request and queries its inventory database for the requested data - `SELECT * FROM inventory.products WHERE id=2311;`.
3. The server forms a JSON response from the data, the document  - `{"products": [2311: {"name": "Raw Linseed Oil"}]}`.
4. The server sends the document to the client, which is waiting for the response.
5. The client reads the document, attempts to parse it as JSON, and stores the information in a local database - `INSERT INTO favorites (ext_id, name)
VALUES (2311, "Raw Linseed Oil");`.

<ExpansionPanel title="JavaScript Object Notation (JSON)">

JSON is an open-standard, language-independent **data format**. Meaning it is a publicly-available standard for encoding information that is stored in a file and it is not limited to one programming language. It is used as a data format for browser-server communication. It uses human-readable text to transmit data objects.

JSON is based on JavaScript. It was developed as a response to the need for a protocol that could ensure server-to-browser communication without relying on browser plugins (like Java or Adobe Flash Player), i.e. software components which add new features to web browsers and are also referred to as "add-ons" or "extensions".

Other to JSON comparable formats are XML, CSV, and YAML.

</ExpansionPanel>

What are **potential failures** of an API request?

* The client could send a request that the server does not understand, or send a malformed request.
* The server could create a document that the client does not understand, for example, a server sends XML when the client expects JSON.
* The server could send a malformed document.
* Either party could send a malicious request, for example, SQL injection `GET https://example.com/inventory?id=2311%3BDROP%20TABLE%3B`.

In modern network systems and in fact, the web itself, a great deal of effort goes into mitigating these **translation and synchronization issues between clients and servers**. Traditionally, network synchronization issues were often mitigated by implementing some kind of hierarchy. Blockchain uses a **non-hierarchical approach** to mitigate synchronization issues by making sure that every participant always has access to enough data to verify the integrity of ALL the data in the network.

### Networking and protocols

Before diving into how these issues are approached with blockchain technology, revisit how protocols in networking solve problems inherent to a hierarchy-free, fault-prone environment.

The term **networking** covers both _the hardware side and the software protocols used to transmit data and let computers communicate_. The interaction between software and hardware becomes especially interesting in a blockchain context because of a networks' physical aspect.

Imagine a cable connection between two computers. Traditionally a coaxial cable was used to carry a signal. Cables can be subject to interference from many things, so there is no guarantee that the signal originating at point A will be received by point B. To mitigate this problem and ensure smooth communication, a whole stack of hardware and software protocols has been developed. Remember, **protocols** are like behavior guidelines for machines that help them cooperate and understand each other, as well as mitigate any translation and synchronization issues.

As an example, think about what happens in **the case of missing data**.

![TCP request](/onboarding/1-introduction-blockchain/images/tcp-request.png)

To facilitate data transfer, protocols like TCP split data into small packets and transmit each one individually. These bits of data are converted into an analog signal on the hardware level. On the receiving end, the signals are reconstructed and the software protocol re-assembles the original piece of data. If a packet is missing, the receiving computer can ask for the **re-transmission** of the missing bundle of data.

<ExpansionPanel title="Fault tolerance">

**Fault tolerance** is _the capability of a computer, electronic system, or network to keep operating even when components fail_.

A **fault-tolerant design** requires:

* **No single point of failure** as a fault-tolerant system should continue operating uninterrupted while it is repaired.
* **Fault isolation and containment** as failures should not affect the entire system by being isolated and contained.
* **Reversion modes** should be available.

When learning about blockchain, it is worth understanding these fundamentals because the technology operates in a similarly uncertain environment. Blockchain is designed to be fault-tolerant, thereby minimizing potential disruption and damage in adverse conditions.

</ExpansionPanel>

### Centralized, distributed, and decentralized networks

The function of a network is largely defined by its **degree of centralization**. Generally, networks can be centralized, decentralized, or distributed. Depending on the centrality of a network, translation and synchronization issues have a different impact on network functionality.

![Paul Baran networks with different degrees of centralization](/onboarding/1-introduction-blockchain/images/PaulBaran.png)

<ExpansionPanel title="Paul Baran's On Distributed Communications">

In 1964, before major discoveries and developments such as public-key cryptographic systems and P2P networking Paul Baran published a paper [On Distributed Communications](https://www.rand.org/content/dam/rand/pubs/research_memoranda/2006/RM3420.pdf). In it, Baran attempted to differentiate between diverse degrees of decentralization.

Centralization and decentralization were attributes introduced long before to describe political systems and power structures. In Baran’s conceptualization, a spectrum of network typologies exists. The main point of differentiation between the different typologies is the number of so-called **points of failure**. After Baran introduced his typology accompanied by developments in networks, databases, computing, and cryptography, a more detailed continuum of typologies was proposed. Among other aspects, the importance of resource and power control was emphasized.

</ExpansionPanel>

You will see the term _decentralized_ come up a lot in blockchain literature. What exactly constitutes a distributed vs. decentralized system is a hotly debated subject. Complicating things further is the fact that systems can be a mix of both. There were different network typologies proposed. Some view resource and power control as important aspects to differentiate networks. Still differentiating distributed and decentralized networks by the location and control of resources includes a linear spectrum notion of centralization in networks.

<HighlightBox type="tip">

Watch [Greg Slepak explain the concept of decentralization](https://www.youtube.com/watch?v=7S1IqaSLrq8) in 5 minutes. 

</HighlightBox>

For the purpose of our discussion, focus on the main difference between the different types: the number of **points of failure**.

A **point of failure** can be understood as _a single node or part of a network whose failure leads to the shutdown or dysfunction of the entire network and/or the system no longer being able to perform its intended operations_. Centralized networks only have **one** point of failure. Erasing a point of failure leads to less centralization and towards a distributed network.

Although the advantages and disadvantages of each type continue to be debated, to conclude: network design has implications on functionality and more general issues, for example, privacy and transparency. It is important to keep in mind, a network does not have to be centralized, decentralized, or distributed - it can be a mix of different components of each type. The network design should always match the envisioned functionality of the network.

<ExpansionPanel title="Peer-to-peer (P2P) networking - a distributed network">

A **peer-to-peer (P2P) network** has a **distributed architecture**, meaning that work is distributed among members of the network. P2P networks are usually composed of computer systems as peers and connect via the internet. Each participant, called a node, connects to a limited number of other nodes, which are commonly referred to as its **peers**. Peers make resources like computing power and network bandwidth available to all peers in the network.

All participants are equal in that they can all request information and answer requests. Understood as equality is that all participants are **equally privileged and equipotent**. For this reason, P2P networking has been seen as a means for an egalitarian social network.

P2P networks are highly different from client-server networks, in which the data supplier and consumer roles are ascribed to different entities and all communication happens through a central server. In a traditional client-server architecture, participants are either a client, which requests information, or a server, which answers those requests - remember the API request, that is a classic client-server example. Centralized security databases that restrict control to server assets help improve security. Client-server networks are suitable for large networks but can become expensive when handling large amounts of data, transfers, and clients.

![Client-server model](/onboarding/1-introduction-blockchain/images/client-server.png) 

In P2P networking there is no central server, storage, or authentication of users. Peers can be understood as file servers and clients at the same time. If a node cannot answer a request, it will forward it to some or all of its known peers.

![P2P network](/onboarding/1-introduction-blockchain/images/P2P-network.png)

P2P networks became popular in file-sharing applications like Napster and BitTorrent, which are typically associated with illegal music downloading and piracy. P2P networks are usually recommended for private households or small businesses - they are economically speaking **cheap to set up**, but **security issues** can create expensive problems.

Security is challenging in P2P networking for two reasons:

* P2P software has to be **downloaded** to become part of the network, making it especially vulnerable to remote exploits. 
* Every peer has an equal network connection because of **interconnectivity**, a malicious participant could send incorrect requests or returns, as well as malware and corrupted data through the entire network. Other security risks are denial of service (DDoS) attacks, routing attacks, and routing network partitions.

Hashing, chunk verification, and a higher degree of encryption are means to mitigate security risks in P2P networks.

Are P2P networks decentralized, distributed, or centralized networks?

P2P networks can be decentralized, distributed, centralized, or a mix. When a system has different components, which combine P2P elements with other networking concepts, it can at the same time have parts typically known as distributed and include centralized aspects.

Remember the two P2P services mentioned earlier, Napster and BitTorrent? They include aspects typically ascribed to distributed and centralized networks.

**Napster** is a music-focused file-sharing service. Its earliest version used **distributed data storage**, since music files were distributed through peers and not stored on a central database. However, a **central server** was used to manage the peers. Napster combined a distributed P2P data storage with a central managing authority, the Napster server. After the Recording Industry Association of America (RIAA) sued Napster for facilitating the sharing and transfer of copyrighted material, Napster shut down its original P2P network in July 2001.

**BitTorrent** is another P2P file-sharing service that is also used to share music. Like Napster, BitTorrent uses a **data storage among peers**. However, it has a **decentralized network structure** since there is no central server. BitTorrent also faced legal complaints due to allegedly facilitating copyright infringement through illegal downloading. But this time, the case was not so clear as with Napster. Why?

Because of BitTorrent’s decentralized coordination of peers: there was no central server that could be turned off to shut down the network.

These two examples show how **network design and structure** choices can have far-reaching impacts. Knowing how P2P networks work is essential in understanding blockchain technology. Just think about the similarities between P2P network architecture and the network structure of blockchain applications.

</ExpansionPanel>

### Blockchain as a merge of data storage and network

Historically, data storage and networks have been **treated separately**, mainly because the former was adopted long before the latter. Networks were built first, and data storage was connected afterward. Blockchain merges these two concepts by combining elements of a database with a P2P network. Blockchains store data in the same way as a **decentralized database**, and also use P2P networking.

As the name suggests, a blockchain can be thought of as a chain of blocks. The blocks are ordered in a sequence and back-linked, which means each block is linked to its preceding block. A blockchain can be understood as a **data structure** since it has a certain manner of storing and organizing data, but at the same time, it is also more than a database. Part of the reason is that a blockchain collects data values or attributes, but it also includes their relationships and enables a set of possible functions and operations.

![Blockchain as a data strcuture](/onboarding/1-introduction-blockchain/images/blockchain-data-structure.png)

If you imagine blockchain as a computer, it would have three layers: **database**, **network**, and **state**. The entire computer is a collection of blocks where every new block represents an update to the state layer. 

<!-- Include video: Title: How does Blockchain Actually Work?, URL:https://www.youtube.com/watch?v=Za5lPKNV_Mk&feature=youtu.be -->

All **data**, such as currency transfers or smart contract code or calls of function, is encoded in **transactions**, which are bundled into blocks and must be validated. Remember, data cannot be deleted or altered after being stored on a blockchain.

![Blockchain computer](/onboarding/1-introduction-blockchain/images/blockchain-computer.png)

The blockchain network layer is comprised of **nodes**. Each node has a copy of the chain of blocks. Nodes are usually given equal power, but power distribution depends on the deployment pattern of the blockchain.

Currency transfers and smart contract implementation is done by adding transactions to the blockchain, which will again be bundled into a block and verified. To interact with the state layer of the blockchain computer, a user can send transactions or view information by coupling an application with a node. Smart contracts can then be used to interact with transactions.

<HighlightBox type="reading">

**Further readings:**

* [Baran, Paul (1964): On Distributed Communications](https://www.rand.org/content/dam/rand/pubs/research_memoranda/2006/RM3420.pdf)
* [Slepak, Greg (2015): Deconfusing Decentralization - a very good introductory video on the concept pf decentralisation](https://www.youtube.com/watch?v=7S1IqaSLrq8)

</HighlightBox>

Now, take a closer look at ledgers and how blockchains can be understood as distributed ledgers.

## Ledgers

<HighlightBox type="note">

There are many different ways to look at blockchain technology. To give you a thorough understanding and a complete view, do not restrict yourself to one definition of blockchain but keep in mind the different conceptualizations of the technology.

</HighlightBox>

Let's dive into how blockchain and the concept of a distributed ledger are linked.

<ExpansionPanel title="Open Systems Interconnection (OSI) model">

The Open Systems Interconnection (OSI) model, developed by the International Organization for Standardization, is a generalized seven-layer architecture concept for communication in a telecommunication or computing system. Each layer represents a certain functionality:

* **Layer 1 - the physical layer:** responsible for the physical connection between devices.
* **Layer 2 - the data link layer:** responsible for the message delivery between nodes.
* **Layer 3 - the network layer:** responsible for data transmission between devices in different networks by dealing with packet routing to determine data routing paths and addressing to identify sender and receiver.
* **Layer 4 - the transport layer:** responsible for end-to-end delivery of messages, acknowledgments if successful data transmissions, and re-transmissions of data in case of errors by relying on services from the network layer and providing services to the application layer.
* **Layer 5 - the session layer:** responsible to establish a connection, maintain a session, and terminating it, as well as for ensuring synchronization with checkpoints.
* **Layer 6 - the presentation layer:** responsible for translation, encryption, decryption, and compression of data.
* **Layer 7 - the application layer:** implemented by the network's application and responsible for interacting directly with the application.

Whereas, layers 1 to 3 are hardware layers, the transport layer (layer 5) is the heart of the OSI, and layers 5 to 7 are software layers.

Want to take a look at the OSI model in more detail? Take a look at this [overview from GeeksforGeeks](https://www.geeksforgeeks.org/layers-of-osi-model/).

</ExpansionPanel>

In the OSI network model fashion, one can break down blockchain technology in the following manner:

![Blockchain layers](/onboarding/1-introduction-blockchain/images/blockchain-layers.png)

As you can see transactions are recorded on the _transaction ledger_. A **ledger** is _a book or file that records and totals economic transactions_.

First, take a look at transactions and then at ledgers to better understand ledgers and their relevance for blockchain technology.

### Transactions and ledgers

A **transaction** is _an **atomic event** which means its components make no sense in isolation_.

If the word transaction conjures up a financial transaction in your mind, this is indeed appropriate. A single transaction might look like this:

* Reduce account A by $10.
* Increase account B by $9.
* Increase account C by $1.

It is easy to understand that this transaction is a payment.

If you were told only "Reduce account A by $10", you would rightfully ask: "Where did those $10 go?". Here, you can see what is meant by transactions being atomic - comes from the Greek word for undividable. You need every component of the transaction to exist for it to make sense and therefore to take place. Otherwise, you are left with the question: "Where did those $10 go?".

Transactions contain an **arbitrary set of data** depending on the purpose and structure. For instance, financial ledgers usually contain the following data:

* Sender
* Recipient
* Amount
* Credit/debit
* Reference

Processing each transaction in the ledger enables us to derive all kinds of meta-information such as the number of transactions, activity per account, and individual account balances. An account balance like the balance of your bank account is an abstract representation of a list of transactions.

If the word transaction reminds you of database management systems, this too is appropriate. Transactions happen in databases too. For instance, technology permitting, a single transaction might look like:

* Charge customer $10.
* Ship one widget.
* Add one en-route shipment for the customer.
* Reduce widget stock by one.

In the context of blockchain, a **transaction** is _any atomic event that is allowed by the underlying **protocol**_. They are recorded as they are proposed by the "lottery winner". The order of transactions is extremely important here and is one of the reasons why blockchain protocols are designed the way they are.

To better understand the significance of the ledger order, imagine:

* You have an account balance of `3`.
* You transfer `3` to member A and `3` to member B in quick succession.

If the ledger is not **well-ordered**, both transactions could be issued even though your account balance would be insufficient. Well-order of execution prevents double-spending. To get a picture of the state of accounts at any point, all transactions until that point in time have to be added up. One by one, each transaction record alters the state of the ledger.

<ExpansionPanel title="Ledger keeper and trusted authority">

Traditionally ledgers are maintained by a trusted authority called a **ledger keeper**. Ledger keepers include insurance companies, banks, tax collectors, and many other entities.

![Trusted authority controls entries to the ledger](/onboarding/1-introduction-blockchain/images/authority.png)

Carrying out a transaction in a system with trusted authorities entails the following steps:

1. Identify yourself to the ledger keeper.
2. Request data, like your account balance, from the ledger keeper.
3. Request the recording of a new transaction.
4. The ledger keeper checks the validity of the transaction - Do you have sufficient balance? Is your account active or inactive/frozen?
5. The ledger keeper enters the transaction into the ledger and informs other ledger keepers of the transaction if necessary, for example, in the case the transaction's recipient has an account with another bank.
6. The recipient can now identify themselves with their ledger keeper and ascertain their updated balance.

This system works well as long as ledger keepers can be trusted or mechanisms are in place to ensure the ledger keeper's compliance.

</ExpansionPanel>

The advantages and disadvantages of traditional ledgers compared to decentralized ledgers like blockchains are highly dependent on the degree of centralization of authority.

![Ledger types - advantages and disadvantages between traditional/centralized ledgers and decentralized ledgers](/onboarding/1-introduction-blockchain/images/table-ledger-type.png)

In a highly centralized traditional ledger, data reliability, information control, execution of transactions, and consensus on transactions depend on the trustworthiness of the central authority. Participation and transaction execution are restricted by oversight and/or intermediation in centralized ledgers, usually requiring third-party involvement.

Further, power asymmetries favoring the central authority can lead to deviant behavior and/or unintended consequences. For example, an authority in charge of updating the ledger could alter it maliciously. Centralized, "traditional ledgers" are also more prone to be affected by malicious attacks due to their centralized point of failure and data storage compared to distributed ledgers.

On the other hand, distributed ledgers have a higher degree of transparency, security, lower transaction time, and lower transaction costs for participants.

<HighlightBox type="info">

There is reason to believe that the development of the Bitcoin protocol, the first successful implementation of blockchain technology, was in part motivated by the financial crisis in 2008. The financial crisis shook overall trust in traditional financial institutions and mechanisms, including central authorities' functioning and thus, raison d'être. Blockchain's decentralization can be seen as a way to avoid unintended results due to moral hazards and asymmetric information.

</HighlightBox>

### Blockchain as a distributed ledger

To understand blockchain as a distributed ledger, remember:

* A **transaction** is an atomic event.
* A **blockchain** is an ordered list of all transactions since inception.

Especially banks are prone to identify blockchain as a distributed ledger, as it indeed dovetails with their world models. Traditional financial institutions have realized the utility of distributed ledgers both as a threat to their centralized authority and as an opportunity to lower costs, decrease transaction times, facilitate settlement processes, and cryptocurrencies as a new investment opportunity.

Instead of each bank relying exclusively on their table of accounts in their siloed (SQL) databases, blockchain could enable them to consolidate their tables of accounts facilitating transactions between accounts. Without the shared nature of blockchain, inter-bank transactions are done through netting and settlement via a central bank or corresponding accounts. The non-blockchain process is more expensive and time-consuming, especially if the banks are located in different countries.

![Distributed Ledger](/onboarding/1-introduction-blockchain/images/blockchain-as-distributed-ledger.png)

In the elegant blockchain solution, a single transaction updates separate tables of accounts for the entire network (of all participating banks). For this reason, banks see blockchain as an opportunity to reduce operational costs by distributing a common ledger between their peers.

To better understand blockchain technology and how an immutable ledger is created, dive into the cryptographic fundamentals.

## Cryptographic fundamentals

In laymen's terms, **cryptography** is _the use of codes and ciphers to secure communication, messages, and information_. In this section, you are going to take a specific look at how blockchain uses cryptographic techniques: 

* Public-key or asymmetric cryptography
* The use of public and private keys
* Cryptographic hash functions
* Merkle trees

Until some decades ago, cryptography constituted a method of encryption mainly based on simple methods sometimes including mechanical aids. In case you want to do a historic recap of the developments in the field of cryptography, take a look at the following expandable box.

<ExpansionPanel title="A historic overview of cryptography - from ancient times to public-key cryptography systems">

**Ancient times - Caesar's cipher**

In ancient times **simple mechanisms for encryption** were used. One example of such a simple instrument is the so-called **Caesar's cipher**, also known as **shift cipher**. Named after Julius Caesar who used it for private correspondence, the shift cipher is a type of substitution cipher already used long before Caesar.

Caesar's cipher constitutes a substitution mechanism, in which each letter in a text/message is replaced by a certain letter according to a fixed number of positions in the alphabet later (shift value). It can easily be deciphered/broken because it is a single-alphabet substitution cipher. Breaking a Caesar's cipher is among others possible by using two rotating disks.

![Rotating disk](/onboarding/1-introduction-blockchain/images/caesars-cipher.png)

In more modern applications, the encryption step of Caesar's ciphers is often part of more complex schemes. An example of such an encryption scheme is the [ROT13 system](https://en.wikipedia.org/wiki/ROT13). Caesar's cipher was also still used in the early 20th century by the Russian army as a simple-to-understand option for communication.

A further example of the application of shift ciphers is the **Vigenère cipher**, which uses Caesar's cipher where the value of the shift is defined with a repeating keyword. This specific cipher is unbreakable if the following conditions are fulfilled:

* The length of the keyword is the same as of the message.
* The keyword is chosen randomly.
* The keyword is not entrusted to anyone else.
* The keyword cannot be reused.

<HighlightBox type="info">

These conditions are met by so-called [one-time pad](https://en.wikipedia.org/wiki/One-time_pad) ciphers, but very hard to maintain. In one-time pad encryption, a text is paired with a pre-shared, single-use key (the one-time pad). A segment or each character of the text is encrypted through a combination of the text and the key/pad.

</HighlightBox>

Simple substitution ciphers like Caesar's cipher are easily broken. This becomes clear when observing two different settings: 

* The cipher type (a simple substitution cipher) is known to the malicious party.
* The malicious party knows Caesar's cipher is being used and only needs to determine the shift value.

If the cipher type is known, the encrypted message can be decrypted by using frequency analysis or pattern words. If it is known that the Caesar cipher is used, the malicious party would only have to check for all the number of possible shifts in a brute force attack. For messages in English, this would require going through 26 different options as the number of possible shifts is determined by the number of characters in an alphabet.

Encrypting messages multiple times with a simple substitution cipher does not increase the security of encryption. Why is this? If you encrypt a message by a shift value X and then encrypt it by a shift value Y, it is as you would have encrypted it by the shift value X+Y. Thus, decrypting it is as difficult as it would be with a simple substation cipher.

**Medieval times - frequency analysis and homophonic substitution**

Around AD 800 an Arab mathematician named Al-Kindi introduced a technique nowadays known as **frequency analysis** to break mono-alphabetic substitution ciphers - this is often seen as the most significant development in cryptography until World War II. Among others, Al-Kindi analyzed methods of enciphering and conducted a statistical analysis of letters and letter combinations in Arabic. When knowing the frequency of letters in an encrypted text and correlating it with the frequency of letters common in the original language, the value shift becomes easy to determine.

Take a closer look at frequency analysis for the English language to better understand this method. 

![Frequency analysis for English](/onboarding/1-introduction-blockchain/images/frequency-analysis-english.png)

English has 26 characters in its alphabet, whereby E and T are the most frequent and Q and Z are the least frequent. Knowing the frequency of characters in a language makes it possible to probabilistically estimate the shift value. With computer availability, it is even easier to determine the shift value since one can measure the actual frequency distribution compared to the expected distribution by for example Chi-Squared statistics.

Another cryptographically interesting development of the Middle Ages is **homophonic substitution ciphers**. In the early 1400s, the Duke of Mantua already used homophonic substitution ciphers. It is a substitution cipher, in which each letter is replaced by multiple symbols depending on letter frequency. In doing so, it combines mono-alphabetic and poly-alphabetic features.

It is, therefore, more difficult to break than other techniques with substitution ciphers and its break difficulty depends on the number of homophones. To break them, one has to:

* Find out which letter is substituted with which character.
* Find out how many characters or symbols a letter can have.

Most cryptographic techniques remained important during the Middle Ages due to their relevance in political and religious conflicts to ensure the secrecy of messages.

**Modern times - from (electro-)mechanical machines to electronics and computing**

Until the **19th century** most cryptographic methods were rather of an ad-hoc nature and research was mainly concerned with encryption and/or methods focused on finding weaknesses in cryptographic techniques. In the **20th century**, **complex mechanical and electromechanical machines** were used to decipher. One of the most prominent examples of such a machine is the Enigma rotor machine - most prominently used by Nazi Germany for diplomatic and military communication, as well as to protect commercial information exchange.

During World War I, one of the most prominent cases when it comes to cryptography is the Zimmermann telegram: a cable sent from the German Foreign Office via Washington to the ambassador Heinrich von Eckardt in Mexico was decrypted. The content of the telegram is said to have contributed to the United States' decision to enter the war.

Gilbert Vernam proposed the idea of a teleprinter cipher in 1917, in which a key is kept on paper tape. The key is combined character by character with the text message and results in a ciphertext. This method established the benefit of electromechanical devices as cipher machines and led to the development of an unbreakable cipher, the **one-time pad**.

During World War II, **mechanical and electromechanical cipher machines** were often used as a more secure option to manual systems. Some examples of cipher machines are: 

* TypeX and Colossus used by Great Britain.
* The SIGABA used by the US.
* The Lacida used by the Polish.
* The Enigma machine used by Nazi Germany.
* The VIC cipher, the most complex hand cipher, used by the Soviets - at least until 1957.

**Symmetric key algorithms**

Until modern cryptography was developed in the 1970s, **encryption algorithms had always been symmetric key algorithms**. This type of algorithm can be found in the electromechanical machines of World War II, but also Caesar's cipher and all other past cipher systems.

Symmetric key algorithms use a **key**, usually, a codebook, to encrypt a message. Both sender and recipient of a message have to know the key and keep it secret to ensure the security of encryption. So that the algorithm could be useful, the key had to be exchanged through a "secure channel" before the start of communication and maintained secret. As the number of participants increases, the secret is harder to keep. Thus, this type of algorithm is not suitable for communication between large amounts of participants.

In 1945, Claude E. Shannon, while working for Bell Telephone Labs, applied information theory to cryptography and with it laid the foundation for mathematical cryptography. He published the paper *Mathematical Theory of Cryptography*, in which **two main cryptographic goals** were defined: **secrecy and authenticity**. Shannon focused on **secrecy** and concluded that there were two types of system design for it:

* Systems that are designed to protect against attackers with infinite resources - **theoretical secrecy**.
* Systems that are designed to protect against attackers with finite resources at their disposal - **practical secrecy**.

One can understand theoretical secrecy as a characteristic of a system based on algorithms, which mathematically cannot be resolved independently of the computing power available for decryption. Practical secrecy refers to systems, in which the underlying algorithms could be broken, but computational power is not sufficient to do so.

Shannon stated that the length of a key in binary digits had to be equal to or greater than the number of bits contained in the message encrypted to ensure secrecy.

Later G.J. Simmons addressed the issues related to **authenticity**. More elaborate schemes for encryption became possible as electronics and computers were developed.

Before the 1970s, secure cryptography was often limited to the governmental realm. Cryptography became part of the public realm mainly due to two events: the public encryption standard (DES) and public-key cryptography.

</ExpansionPanel>

### Asymmetric cryptography

Everybody can agree that assuring the integrity and authenticity of messages are fundamental to the working of a blockchain. Without a trusted third party, a cryptographic proof is needed to ensure a direct and safe transaction between two parties. Blockchain technology relies heavily on public-key cryptography.

<ExpansionPanel title="The second half of the 20th century - the development of asymmetric cryptography and other cryptographic achievements">

In 1970, British cryptographer James H. Ellis advocated the possibility of a **non-secret encryption** but was not sure about its implementation. A colleague of his, Clifford Cocks, developed the first scheme for the later called **Rivest–Shamir–Adleman (RSA) encryption algorithm** in 1973, which demonstrated implementation to be possible. Ron Rivest, Adi Shamir, and Leonard Adleman, all three at the Massachusetts Institute of Technology, created a generalization of Cocks' scheme, known as RSA. RSA is one of the first cryptographic systems, in which there is a public encryption key and a second private decryption key. It relies on the practical difficulty to factor large integers because it uses a module that operates with the product of two large prime numbers.

In 1974, Malcolm J. Williamson created a key exchange later named **Diffie-Hellman key exchange**. In 1976, Whitfield Diffie and Martin Hellman, influenced by Ralph Merkle's thinking on public-key distribution, published a method of **asymmetric key cryptography** nowadays known as **Diffie-Hellman key exchange**. This became the start of public-key cryptography since it was the first published practical technique for asymmetric cryptography.

<HighlightBox type="docs">

Want to take a look at the Diffie-Hellman paper introducing the key exchange? See [New Directions in Cryptography](https://www-ee.stanford.edu/~hellman/publications/24.pdf)).

</HighlightBox>

Sadly, all these developments in cryptography were not made public - but they did not remain secret for long.

Another important development in the beginning 1970s was the **Data Encryption Standard (DES)**. Developed by IBM, the algorithm was approved by the National Bureau of Standards (NBS) after consulting the NSA and amending the version to be stronger against cryptanalysis. In 1977, it became part of the official Federal Information Processing Standard (FIPS).

Neal Koblitz and Victor Miller both introduced **elliptic curve cryptography** in the mid-1980s. Their achievements led to the development of new public-key algorithms based on the discrete logarithm problem - discrete logarithms are quickly computable in a few special cases but there is no efficient method known to compute them in general. Elliptic curve cryptography is mathematically more complex, while at the same time allowing for smaller key sizes and faster operations.

Beginning the era of the internet, a standard for encryption became vital to ensure its commercial use, among others for commercial transactions. Until the introduction of the **Advanced Encryption Standard (AES)**, DES continued to be used for encryption. After a public competition hosted by the National Institute of Standards and Technology (NIST, the successor agency of NBS), AES was selected as encryption standard. In addition, the Secure Socket Layer (SSL) was developed and introduced as a standard, which found application in web browsing, email, etc. The necessity for encryption later became more evident with wireless internet and the expanded use of devices and applications that rely on secure communication.

The developments after World War II and especially in the 1970s led cryptography to become part of the public realm again as encryption became available for public use.

</ExpansionPanel>

In simple words, **public-key cryptography**, also known as asymmetric cryptography, is _a form of cryptography based on **key pairs**_. Every pair consists of a **public** and a **private key**. The public key, as its names suggests, can be shared publicly. Its counterpart, the private key, should not be publicly shared. As long as the private key stays private, the security of the system is not endangered. Compare the key pair to having your house address public but keeping the key to your house private. Assuming you do not want to have any strangers in your home, you will want to keep your private key safe.

The two keys work together to carry out the **two functions of asymmetric cryptography**:

* **Authentication:** the process of confirming the identity and/or verifying the source. The public key serves as a verification instrument for the private key. For example, a message can be signed with the sender's private key so that it confirms the message is in fact signed by the owner with their private key.
* **Encryption:** the process of encoding the message as it is meant for a specifically authorized party. The information is encrypted with a public key and only the private key can decrypt the information encrypted with the public key.

<HighlightBox type="tip">

How key pairs are used for authentication and encryption is discussed later. For now, just remember that asymmetric cryptography uses key pairs.

</HighlightBox>

How does a **cryptographic system** work?

Modern cryptographic systems leverage computer capabilities to make the power of certain mathematical functions accessible. Asymmetric algorithms rely on one-way functions like the multiplication of large prime numbers, discrete logarithm problems, and elliptic curve relationships. This type of algorithm needs to be based on computations that do not require much computational power to be executed but a large amount of computational power to be reversed.

What makes asymmetric systems more secure than symmetric systems?

Compared to symmetric key algorithms, asymmetric ones do not require parties to use a secure channel to exchange the keys for encryption and decryption. Asymmetric algorithms need to be able to output key pairs, encrypt and decrypt information. This requires a lot of computational power compared to symmetric algorithms. The need to invest large amounts of computational power into finding the keys, often referred to as work factor, makes asymmetrical cryptography practically secure.

Public-key cryptography ensures confidentiality, authenticity, and non-repudiation. Examples of applications are [S/MIME](https://en.wikipedia.org/wiki/S/MIME) and [GPG or GnuPG](https://en.wikipedia.org/wiki/GNU_Privacy_Guard), as well as the basis of several internet standards like [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security). Asymmetric key cryptography is normally applied to small data blocks due to its computational complexity.

<HighlightBox type="info">

Fun fact: Cryptographic systems are not exclusive of one another. In hybrid systems, symmetrical and asymmetrical cryptography is combined. For example, asymmetric encryption could be employed to transfer symmetric encryption, which would then be used as an encryption key for the message. Examples of these hybrid cryptosystems are [PGP](https://en.wikipedia.org/wiki/Pretty_Good_Privacy) and [SSL/TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security).

</HighlightBox>

Does the length of the key matter?

The length of the key matters. One would think the longer the key the more secure. However, funnily enough very long asymmetrical cryptographic keys provide at least the same degree of security a shorter symmetric key would provide because of the lower number of potential asymmetric keys for a given number of bits and the patterns within asymmetric keys. A general rule to still keep in mind: The longer the key, the more difficult it is to break the code. An attacker has to try out every possible key to break an asymmetric algorithm with a brute force attack. The longer the key is, the more difficult it is to "guess" the right key.

Maybe a simple example makes it clearer: every binary entity of information can have the value `0` or `1`. If one has an 8-bit key, 2^8 or 256 possible keys could be used. As the number of bits per unit of information increases, so does the number of possible keys.

Modern asymmetric ciphers have been established as a secure option but are not free of faults and possible problems. Faulty design and/or implementation have been points of insecurity. Furthermore, public-key cryptography is susceptible to brute force attacks, as well as "man-in-the-middle" attacks. The latter occur, when a third party intercepts, decrypts, and re-encrypts a message. A trusted entity installed as a certification authority can prevent such attacks.

Have a look at some examples to better understand how public-private key pairs are used and how they implement functionalities to make authentication and encryption possible.

#### Encrypt and decrypt with key pairs

While using an asymmetric key algorithm, each user needs to know their pair of keys, public and private, as well as the other participants' public key. 

Alice wants to send a message to Bob, which is intended for Bob's eyes only:

1. Bob gives Alice his public key.
2. Alice uses Bob's public key to encrypt the message.
3. Alice sends Bob the encrypted message.
4. Bob decrypts the message with his private key.

![Encrypt and decrypt](/onboarding/1-introduction-blockchain/images/encrypt-decrypt.png)

#### Sign and verify with key pairs

Private and public keys are used to **sign and verify** documents/files.

Alice wants to make sure that Bob's public announcement is indeed from Bob:

1. Bob gives Alice his public key.
2. Bob signs his announcement with his private key.
3. Bob sends Alice his announcement and its signature.
4. Alice verifies the signature with Bob's public key.

![Sign and verify](/onboarding/1-introduction-blockchain/images/sign-verify.png)

Signing a message with a private key lets the other participant verify who send a message by using the public key.

#### Encrypt, sign, verify, and decrypt

It is possible to mix both conceptual ideas. For example:

1. Alice encrypts her message with Bob's public key.
2. Alice signs the encrypted file with her private key.
3. Upon reception, Bob verifies the signature with Alice's public key to make sure the file came from Alice.
4. Bob decrypts the file with his private key.

![Encrypt, sign, verify, and decrypt](/onboarding/1-introduction-blockchain/images/mix.png)

<ExpansionPanel title="Key management and public key infrastructure">

If you look again at the Alice and Bob examples, you will notice that there is a vulnerability in "Bob gives Alice his public key". A malicious Charlie could intercept Bob's public key and pass on his public key to Alice.

![Intercepting a message](/onboarding/1-introduction-blockchain/images/attack.png)

Public key infrastructure (PKI) is used to prevent fraudulent keys and the tampering of messages through interception. Key management and PKI are an important part of cryptography to mitigate risks.

</ExpansionPanel>

### Cryptographic hash functions

After exploring how cryptography is used to make transactions secure with the use of key pairs, now it is time to look at how the **integrity of the blocks** and the logging of transactions in blocks is achieved.

A **hash function** is _a function used to map a group of characters (i.e. data) into values of a certain length called hash values or just hash_ - hash comes from the French "hacher" meaning to chop. Cryptographic hash functions are a special form of one-way hash functions that exhibit certain features to allow their implementation in cryptographic systems.

A hash function performs an operation on an input of data (i.e. the string) that results in an output of data of a fixed size called a hash value, a hash code, a digest, or sometimes just a hash. The fixed-length output remains the same no matter the size of the message. Remember, five main properties are of essence for a hash function:

* It is **deterministic**: the hash function produces the same output (hash value) for the same input (message).
* It is **fast**: the hash value for any given message is computed quickly.
* It is **resistant**: it is infeasible to work backward and thus impossible to generate the input (message) from the output (hash value) without trying **all** the possible inputs (this could be infinite).
* It exhibits an **avalanche effect**: any small change to the input, changing a "b" to "B" for example, results in a completely different hash value that has no resemblance to the old hash value.
* It is completely **unique**: it is infeasible to find two different inputs (messages) with the same hash value.

<HighlightBox type="warn">

Be careful with confusing hashing and encrypting, they are two different concepts. Hashing is an operation, which transforms data into a checksum or message digest. It is a one-way operation; it cannot be reversed. While encryption describes a two-way operation. This transforms a message into cipher-text and can also transform it back into its original state while ensuring the confidentiality of the message. Both terms should not be used analogously.

</HighlightBox>

With the described characteristics, what can you do with a hash function?

A cryptographic hash function:

* Converts an input, a.k.a. the message, into an output, a.k.a. the hash (or hash value);
* Converts the data in a reasonable amount of time;
* Operates one-way - it is practically impossible to re-generate the message out of the hash;
* Creates unique outputs - even the tiniest change in the message changes the hash beyond recognition so that it appears uncorrelated with the old hash value;
* Makes it practically impossible to find two different messages with the same hash value.

So with hash functions, you can:

* Prove that you have a message without disclosing the content of the message, for instance:
    * To prove you know your password;
    * To prove you previously wrote a message.
* Rest assured the message was not altered.
* Index your messages.

<HighlightBox type="tip">

You can see hashing in action to get the feel for it on the [OnlineMD5 website](http://onlinemd5.com/). As you type in the text box the hash updates automatically. Even a minuscule change to the input creates a completely different hash.

</HighlightBox>

Cryptographic hash functions are used for digital signature and file integrity verification and find application in areas such as credit card transactions and software updates. Their reliability is of the utmost importance as they are so central to our digital security and verification. Reassessing them is of importance to early detect if a cryptographic hash function can be re-generated.

Testing a hash function's robustness when creating unique hashes is done with **collision attacks**. In a collision attack, one tries to find two sets of inputs that produce the same hash function. In 2017, Google conducted a collision attack on [SHA-1](https://shattered.io/). It was considered a relatively insecure hash function but was still widely used and no one had actually proved it made duplicate hashes. Google managed to create a successful collision attack which cost roughly $110,000.

<HighlightBox type="info">

Bitcoin uses `SHA-256` and Ethereum uses `Keccak-256`and `Keccak-512` as hash functions.

</HighlightBox>

<ExpansionPanel title="Digital signatures and certificate authority">

The concept of **digital signatures** is simple: if a given message is first hashed and then encrypted by a private key, you can verify the signature by decrypting with the corresponding public key. Hashing the message avoids the creation of signatures by mixing the messages and corresponding signatures. This way, you know that the sender has the private key to the given public key. However, this is not truly an identification.

It is time for a **certificate authority (CA)**. The CA signs a certificate to prove the identity of the owner of a public key. Such certificates usually include the subject name, which must be verified by the CA. The identity is proven if you can verify the CA's signature and trust the CA.

**Digital certificates** are used among other things to prove identity. They are given by a recognized Certification Authority. A widespread procedure is a public-key certificate proving ownership of a public key.

</ExpansionPanel>

#### Merkle trees

A **Merkle tree** is _a tree with leaf nodes labeled with a hash of a data block and with non-leaf nodes labeled with a cryptographic hash of its child nodes_. Merkle or hash trees, named after Ralph Merkle who patented the concept in 1979, are useful because they allow the **efficient and secure verification of large amounts of data**.

<!--Title: What is a Merkle Tree?, URL:https://youtu.be/DeektoaH7vE--> 

The term Merkle tree describes a tree where:

* Each **"leaf" (node)** contains a hash of a data block.
* The hashes of the leaf nodes are then hashed by non-leaf nodes further up the tree.
* The nodes further up the tree, the **parent nodes**, always keep the computed hash of its child nodes.
* At the top of the tree is the **Merkle root**, or master hash, root hash, or top hash, which is the final, single hash of the series of hashes of the leaves below it, i.e. its child nodes.
* Comparing this single parent or Merkle root with another Merkle root will tell you if all the data in the entire tree is the same.
* Any change to any of the data will create a new hash, which will filter up the tree to the root.

![Merkle tree](/onboarding/1-introduction-blockchain/images/Merkle_Tree.png)

With this type of tree, you can verify the integrity of huge amounts of data very quickly:

* Download and verify the integrity of data pieces as they come in random order because each branch of a Merkle tree can be downloaded individually and verified immediately even though the whole tree is not yet available.
* Identify quickly which piece of data has been corrupted by following the trail of "incorrect" hashes. Then this small block can be re-downloaded quickly and order restored.

The ability to verify the integrity of huge amounts of data is what makes a Merkle tree attractive for blockchain networks: **in a blockchain, each block header keeps one or more hash(es) of the root, i.e. top leaf, of one or more Merkle tree(s).**

It is time to move on to how consensus is established in decentralized networks and more specifically blockchain protocols.

## Consensus and decentralized networks

A blockchain is a well-ordered set of data on which all peers *eventually* agree. What they agree on is considered as the single truth. Reached by consensus, the **single truth** is the **_single true state of the distributed ledger_**. **Consensus has to be reached to guarantee data consistency.**

![Blockchain as a consensus network](/onboarding/1-introduction-blockchain/images/blockchain-as-a-consensus-network.png)

This section presents a closer look at consensus in blockchain technology by starting with the Byzantine Generals problem and how it can be resolved, then providing an overview of consensus mechanisms in blockchain, addressing immutability and also eventual consensus.

### The Byzantine Generals Problem

The **Byzantine Generals Problem** is a consensus-reaching problem scenario, which can be applied to hierarchy-free, permission-less, and failure-prone networks, therefore also to distributed computing. Mitigation strategies for it are known as **Byzantine Fault Tolerance (BFT)**.

What is the Byzantine Generals Problem?

![Visualization Byzantine Generals Problem](/onboarding/1-introduction-blockchain/images/generals.png)

Imagine a trio of generals whose armies surround a target city. The generals are physically far away from each other and can only communicate via messengers, who could fail to deliver messages and/or acknowledgments, or even forge false ones; the generals can only use **unsecured communication channels**. Even the generals themselves have questionable loyalty and do not necessarily trust one another. The siege can only be won if the generals work together. But how can the generals reach consensus on whether they want to attack or retreat, and if they want to attack when to exactly do it?

#### How does the Byzantine Generals Problem relate to blockchain?

Similar to the generals who must decide when to attack, in a distributed ledger the agreed transaction list has to be identified and consensus on the correct order of transactions has to be reached.

As individual transactions are sent to the network from individual nodes, each node must pass, or fail to pass transactions to other nodes. Not all nodes will see the same transactions at the same time because of the time delay required for data to physically travel across the network (physical latencies). Each node must therefore build its order of transactions. Since all nodes participate equally, there is **no authoritative order of transactions**. Still, the network must decide which node's version, or any version, of the truth will be the authoritative truth.

![Blockchain as a consensus network](/onboarding/1-introduction-blockchain/images/blockchain-as-a-consensus-network.png)

### A solution - consensus mechanisms

**Consensus** can be understood as _a process in which the network, constituted by nodes, reaches an agreement regarding the order of transactions and validates the proposed blocks_. Consensus mechanisms generate:

* Consensus on the global **state of the blockchain**
* Consensus on a **set of transactions** in a block

The main functions of such mechanisms are to:

* **Order transactions**.
* **Validate transactions**.

<HighlightBox type="info">

Consensus algorithms establish **safety** and **liveness** by generating consensus, ordering transactions, and validating them. Whereas, safety requires the algorithm to behave like a single node system executing each transaction atomically one at a time would; the same set of transactions should lead to the same changes in the state on each node. Liveness refers to the upholding of network synchronization: all non-faulty nodes will eventually receive every submitted transaction.

</HighlightBox>

<ExpansionPanel title="General types of consensus algorithms">

Consensus algorithms can be differentiated into **lottery-based** such as PoW and **voting-based algorithms**, like for example in the case of Delegated-Proof-of-Stake.

In lottery-based algorithms, nodes creating blocks are randomly selected in a mechanism strongly resembling a lottery. These algorithms are said to have **high scalability** but at the same time a tendency of producing **forks** and with it a **high-latency finality**. With increased block creation time the probability of another peer creating a new block before receiving the just created one can result in numerous forks. This leads to an instance that has to be solved to achieve finality.

<HighlightBox type="info">

Have you heard the term fork or forking before? If not, please do not worry. A closer look at forks will follow in this section.

</HighlightBox>

Voting-based algorithms bring the advantage of **low-latency finality**; finality is faster than in lottery-based algorithms. This type of algorithm also brings a **scalability/speed trade-off**: as all nodes have to be kept in the loop, the larger the network so the more nodes in a network, the longer it takes for consensus.

To summarize, lottery-based algorithms have good speed and scalability but are slower in achieving finality. Voting-based algorithms are fast and achieve finality faster but are not as well-suited when it comes to scalability. The suitability of algorithms depends strongly on the network requirements and different fault-tolerance models.

</ExpansionPanel>

Using Proof-of-Work (PoW) to obtain consensus was one of the innovations introduced by Bitcoin in addition to the chain of blocks, but the academic community had introduced consensus algorithms even before Bitcoin. Since then, many other consensus algorithms have emerged. Have a look at some of the most popular consensus algorithms.

#### Practical Byzantine Fault Tolerance (pBFT)

pBFT was first introduced in 1999. This consensus algorithm is envisioned for asynchronous systems like the internet and was optimized to allow for high performance.

<HighlightBox type="docs">

If you are curious, take a look at the [paper by Miguel Castro and Barbara Liskov](http://pmg.csail.mit.edu/papers/osdi99.pdf), in which the Practical Byzantine Fault Tolerance algorithm was presented.

</HighlightBox>

pBFT focuses on providing a **practical Byzantine state machine replication**, which can tolerate malicious nodes by assuming independent node failures and manipulated messages. The main aim of the algorithm is to promote consensus of **all honest nodes**. This assumption translates into a **practical requirement** for the network: the number of malicious nodes cannot simultaneously equal or exceed 1/3 of all nodes. This can be ensured the more nodes there are in the system: the more nodes, the more unlikely it is that malicious nodes can reach 1/3.

pBFT is a three-phase protocol where the client sends a request to a so-called primary. In the first phase, the primary broadcasts the request with a sequence number to the replicas. Then the replicas agree on the sequence number and create a message. If a certain number of the same message is reached, the message is verified and replicas agree on the order for requests within a view. In the end, the replicas send the reply to the client.

What does a pBFT system look like?

All nodes in the network are **ordered in sequence**. The leader is the **primary node** and the followers, or remaining nodes, are called **backup nodes**. The primary/leader node is usually selected in a type of [round-robin tournament](https://en.wikipedia.org/wiki/Round-robin_tournament) - a competition in which a contestant meets all other contestants in turns. In addition, there are **validating and non-validating peers**. The communication between the nodes is very intensive as they have to communicate on which peer node sends the message and also verify the message to be intact (i.e. that it has not been changed in transmission).

How does the algorithm proceed?

1. The client sends the request to the primary/leader node to invoke a service operation.
2. The leader/primary multicasts the request to the backup nodes/replicas with a sequence number.
3. The replicas agree on the sequence number, execute the request, and send a reply to the client.
4. The client has to wait until the replies reach the maximum amount of the sum of faulty/malicious nodes plus 1. The message is verified when a certain amount of repetitive messages is sent and then the replicas agree on the order of requests. The result of the operation is verified by waiting to see a specific amount of the same message.
5. The backup nodes/replicas agree on the order of requests; consensus on the order of record is achieved.
6. The nodes accept/reject the consensus order of record.

What happens in case of a bad request?

Imagine, a client sends a bad request to the primary. Now assume that the primary does not identify it as a bad request and recasts it to the replicas. The system should detect it as a "bad" message as soon as nodes start sending different messages as a response. Thus, the message would not pass the condition mentioned above.

<HighlightBox type="tip">

For a more detailed look at pBFT, take a look at the article from Brian Curran [What is Pracictcal Byzantine Fault Tolerance? Complete Beginner's Guide](https://blockonomi.com/practical-byzantine-fault-tolerance/) (2018).

</HighlightBox>

#### Proof-of-Work (PoW)

Remember our generals? Byzantine Fault Tolerance can be achieved if the loyal (non-faulty) generals reach a majority agreement on their attack strategy (consensus). **Proof-of-Work (PoW)** is one way to achieve BFT.

PoW is a cryptographic puzzle first introduced with [Hashcash](http://www.hashcash.org/). This consensus algorithm was reused in Bitcoin and has been widely adopted since then.

<!-- Title: Proof-of-Work, URL: https://www.youtube.com/watch?v=iCYj6BfxxJE -->

A node, also known as a **miner**, completes a task of pre-defined, arbitrary **difficulty**. The task is usually a search for an unknown, random number, which is called a **nonce**. The version of the block accepted as the truth is the one that comes with a nonce - remember the winning lottery ticket? The nonce is a one-time-use unknown number/word and is arbitrary. It can only be used once.

When the miner combines this number with ordered transactions in a block, it results in a hash value that matches pre-defined criteria. A common criterion is a small enough value; a hash that starts with the right number of leading `0`s. In binary, for every nonce, you have:

* A `1/2` chance of getting a hash that starts with a `0`;
* A `1/4` chance of getting a hash that starts with `00`;
* A `1/1024` chance of getting a hash that starts with `0000000000`.

The only way to find a nonce that returns the desired value is to repeatedly try random values. The miner node that finds an answer has most probably tried a large number of times. Finding the number is considered as evidence of considerable effort, or proof that a lot of work must have been invested in the search. This is why the process is called *Proof-of-Work*.

<HighlightBox type="info">

The idea of substantiating a claim through an arbitrary amount of work was previously suggested as a way to combat spam in other contexts.

</HighlightBox>

Nodes conduct their searches independently. Each node or miner uses its computing power to be the first to solve the puzzle, thereby winning the right to be the latest block's authority. The node that announces a solution first also receives a reward, so there is an incentive to participate in the problem-solving process. This incentive structure baked into the consensus algorithm is essential since computing power is not free but consumes electrical power. The reward is determined in the protocol. In Bitcoin, the winning miner is rewarded with freshly minted Bitcoins.

<HighlightBox type="info">

Look up the current energy consumption of Bitcoin with the [Digiconomist's Bitcoin Energy Consumption Index](https://digiconomist.net/bitcoin-energy-consumption).

</HighlightBox>

In a PoW network, a node must acquire an authoritative position if it wants to distort the ledger. Acquiring an authoritative position means overcoming the **combined problem-solving capacity of the entire network** and maintaining that lead over time. This known attack vector is called a **51%-attack**. As the name suggests, if a single party acquires more than 51% of the total problem-solving capacity of the network (mining power), the party is theoretically able to alter the consensus.

Why is that?

If a party holds more than 51% of the total mining power, that party in the long run always holds a probabilistic advantage over other miners and with it can dictate the true state of the blockchain by in the end mining the longest chain.

Here **difficulty** comes into play. Difficulty is the term used for the mechanism controlling the amount of work involved in mining. The probabilistic number of times a miner has to try is a measure of difficulty. Difficulty guarantees a given average block creation time. PoW networks set a target average time for a solution to be found by **any** miner/node on the network. The difficulty of the task adjusts **according to the total problem-solving capacity of the network** to compensate for increasing/decreasing network capacity. That means PoW networks do not get faster even if more computing power is added. Rather they become more resilient by **increasing difficulty**, which raises the threshold a 51% attacker needs to overcome.

#### Proof-of-Stake (PoS)

**Proof-of-Stake (PoS)** is another method of selecting the authoritative node for a given block. PoS is based on the assumption that those with the most to lose are the most incentivized to safeguard network integrity. PoS solves the energy problem in PoW as "work", the use of energy through computational power, is not the proof requested to create a block.

Validators place funds at risk as **the stake**. For any given block, a validator is selected in pseudo-random fashion with preference to validators with the largest stakes. While PoS systems generally do not reward validators with new coins, validators receive **transaction fees** in return for generating blocks the rest of the network accepts.

Validators face **economic penalties** when they generate blocks that are rejected by sizable numbers of other nodes. A validator is thus incentivized to generate blocks that are likely to be accepted by the network and face economic punishment when it fails to do so. This is vital as a successful Proof-of-Stake system must address the **problem of "nothing at stake"**. That is, randomly-selected validators must face:

* A disincentive for bad behavior with, for example, extracting a penalty from validators for emitting opinions that are ultimately rejected by the network;
* A high probability that bad behavior is detected - the burden of detection usually falls on the rest of the network that can either accept or reject the validator's opinion.

#### Delegated-Proof-of-Stake (DPoS)

An extension of proof-of-stake algorithms is called **Delegated-Proof-of-Stake (DPoS)**. The algorithm is called DPoS because like in PoS the **value of a vote** is determined by the stake, the tokens held by a user.

<HighlightBox type="info">

Delegated-Proof-of-Stake (DPoS) is a consensus mechanism developed by Daniel Larimer as a reaction to Bitcoin's high energy consumption and potential centralization in mining. DPoS is much faster compared to other consensus algorithms like PoW.

</HighlightBox>

In this type of consensus mechanism, so-called **"witnesses"** are elected by the stakeholders of the network to secure the network. Afterward, several witnesses are chosen for the block creation to represent at least 50% of the stakeholders' votes.

![Delegated-Proof-of-Stake (DPoS)](./images/delegated-proof-of-stake.png)

Witnesses are paid fees for creating and validating blocks. This economic incentive and a limited number of witnesses lead to competition potentially increasing with each new member. In case a witness misbehaves, the network's community can withdraw their votes for a single witness - kind of like firing the witness. Witnesses that do no longer hold enough votes lose their income basis.

Alongside ascribing the role of witnesses to some participants, DPoS networks also elect **"delegates"**. Delegates are a group of participants that supervise network governance and performance, and propose changes that are then voted on by the entire network.

Many consider DPoS algorithms superior to PoW and PoS because of their fast block creation, high degree of security, energy efficiency, level of integrity, and democratic structure.

<ExpansionPanel title="More consensus algorithms">

**Proof-of-Burn (PoB)**

Burn in this context is very specific: miners must send coins to a **"burn" address**, a verifiably unspendable address. The coins on the "burn" address cannot then be spent due to the absence of a private key. To be considered for new block creation nodes can participate in a **lottery** and get rewarded when chosen.

Similar to how solving the guessing game with computing power in PoW establishes a necessary work input and with it the degree of difficulty, burning is how "difficulty" in the mining process is established in PoB. PoB is **expensive** from the miner's point of view because of the coins' worth. PoB uses the same underlying philosophy as in the case of PoW and PoS, but the energy consumption problem and the "nothing at stake problem" are solved. PoB networks often have depended on PoW coins, as the "burning" is often performed with them.

**Proof-of-Importance (PoI)**

The starting idea with **proof-of-importance (PoI)** is to solve the "rich man gets richer" problem that arises in PoS algorithms. PoI networks have a similar rationale like PoS but prevent hoarding as a means to increase prosperity and "nothing-at-stake" problems with the use of an "importance score".
The protocol rewards network activity based on an **"importance score"**.

Similar to PoS, nodes invest a stake in the network to be eligible for selection. In the case of PoI, the stake invested is calculated from a set of variables (amount of transactions to and from an address, whether a node is part of a cluster, etc.) included in the score. The probability to be chosen to build new blocks increases with the value of the importance score.

Proof-of-importance (PoI) is implemented in <a href="https://nem.io/">NEM</a>, a peer-to-peer cryptocurrency and blockchain platform. 

<HighlightBox type="info">

NEM is a blockchain platform that was launched in March 2015 and the name of the corresponding cryptocurrency. NEM has stood out as multiple ledgers can simultaneaosly coexist on one single blockchain, and faster transaction speed and scalability are promised. NEM offers a wide range of features and a commercial blockchain option called **Mijin**.

</HighlightBox>

**Proof-of-Activity (PoA)**

**Proof-of-activity (PoA)** is a combination of PoW and PoS. The miner creates a template with the nonce and deploys it to the network. Then the signers are chosen by the block hash of this template. If the template is signed by the signers, it becomes a block. In the end, the reward is shared between the miner and signers. The algorithm is called proof-of-activity because only participants with a **full online node** can get a reward.

The process split into its PoW and PoS components:

* Miners compete in a computer-power-driven guessing game to find the next block - just as in PoW.
* After a block is mined, it contains a header and the reward address of the miner - like in PoS.
* Nodes are selected as validators depending on the stake of coins they hold - second PoS component. The higher the stake, the more probable it is to be selected as a validator.
* The validated block becomes part of the blockchain, and the fees and rewards are transferred to the miners and validators.

As a combination of PoW and PoS, PoA networks can also suffer from high energy consumption, like PoW ones, and coin hoarding. PoA also inherits algorithms' benefits, like strong decentralization and security against 51%-attacks.

<HighlightBox type="tip">

For a more in-depth look at PoW, PoS, and PoA: [Proof of Activity: Extending Bitcoin's Proof of Work via Proof of Stake by Iddo Bentov et al.](https://eprint.iacr.org/2014/452.pdf).

</HighlightBox>

**Proof-of-Capacity (PoC)**

**Proof-of-capacity (PoC)** uses the memory or hard disk drive (HDD) of a user to reach consensus. It is often also referred to as Proof-of-Space (PoSpace). In PoC, the user signals its interest and stake by dedicating an amount of their HDDs to the mining process. First, it creates and stores hashes. Then it selects parts of the data considering the last block header in the blockchain. The selected data is hashed and must fulfill a given difficulty.

PoC is designed to be fairer because memory access times do not vary as much as the central processing unit's (CPU) power. PoC decentralizes mining even more than PoW algorithms. In addition, it has a lower energy consumption than PoW.

PoC has been applied in the case of [Burstcoin](https://www.burst-coin.org/), a cryptocurrency founded in 2014, and was proposed for [SpaceMint](https://dci.mit.edu/research/spacemint-cryptocurrency-mining), on which academic researchers have been working.

**Proof-of-Elapsed-Time (PoET)**

In **Proof-of-elapsed-time (PoET)** networks a leader is elected via a lottery algorithm. The key point is the lottery, which must be performed in a **trusted execution environment (TEE)**. For this purpose, Intel offers **Software Guard Extensions (SGX)** for applications developers.

<HighlightBox type="info">

A **trusted execution environment (TEE)** is a secure area of the processor that offers an isolated processing environment to load, execute, process, and store data and code in a way that maintains confidentiality and integrity by running applications in a safe space.

</HighlightBox>

![PoET](/onboarding/1-introduction-blockchain/images/poet.png)

The lottery provides every validator with a randomized wait time - **createWaitTimer** in the diagram. The fastest validator becomes the leader. The leader is eligible to create a block after the allotted time. The new block must be accepted by the rest of the network to ensure BFT. The leader is eligible to create a block after the allotted time. The new block must be accepted by the rest of the network.

<HighlightBox type="info">

Notice that there is a [Z-test](https://en.wikipedia.org/wiki/Z-test) to check if a node is generating blocks too fast.

</HighlightBox>

The underlying idea in PoET is the same as in Bitcoin in that the first node to announce a valid block wins. Rather than compute-intensive Proof-of-Work, SGX assumes the task of declaring a lottery winner. PoET is used in Intel's Hyperledger Project Sawtooth Lake.

<HighlightBox type="tip">

Looking for some general points on the advantages and disadvantages of different consensus algorithms?

* [Witherspoon, Z. (2013): A Hitchhiker’s Guide to Consensus Algorithms. A quick classification of cryptocurrency consensus types](https://hackernoon.com/a-hitchhikers-guide-to-consensus-algorithms-d81aae3eb0e3)
* []Vasa (2018): ConsensusPedia: An Encyclopedia of 30 Consensus Algorithms. A complete list of all consensus algorithms](https://hackernoon.com/consensuspedia-an-encyclopedia-of-29-consensus-algorithms-e9c4b4b7d08f)

</HighlightBox>

</ExpansionPanel>

### *Eventual* consensus

To understand consensus in blockchain technology, remember that the truth is the state all participants agree upon. Consensus is eventual in blockchain because blocks are created as transactions are performed. Thus, what is agreed upon depends on the operations taking place.

Take a look at why eventual consensus is important and how consensus is reached in case of competing claims.

#### The CAP Theorem

Remember that blockchain is a distributed system that keeps track of a shared ledger of transactions.

The **CAP Theorem**, also known as *Brewer's theorem* after Eric Brewer, states that in a distributed system you can at most pick two out of the following three:

* **Consistency:** each node sees the same data all the time.
* **Availability:** data is always available, so any data request is answered with a response.
* **Partition tolerance:** the distributive system is always operational, even when a subset of nodes fails to operate.

When for example partition tolerance is given, you have to decide whether you want to promote consistency or availability. When choosing availability over consistency when partition is given (the distributed system is operational and requests receive a response), data could be out of date and the response could thus include outdated data. Choosing consistency over availability when partition is given (the distributed system is operational and data is up to date) could lead to the system failing to be available for the network's participants.

Blockchain aims for perfect availability and reaches eventual consistency by making partitions (unintentional forks) economically uninteresting. Partition is a necessity in distributed networks, thus only the trade-off between consistency and availability needs to be considered when designing a network. **Partition tolerance** becomes a given as blockchains are decentralized and therefore, operational even when several nodes are no longer operational; blockchains have partition tolerance because of their decentralized nature. A key difference between a centralized system and a distributed one is that for the distributed *service* to be shut down, an attacker would need to take all its nodes down. **Availability** is essential for blockchains as the state has to be accessible to all nodes. Thus, blockchains offer availability as it is part of the foundations of the general architecture.

A blockchain node could be flooded in the same way, thereby forcing it off the network. A key difference between a centralized system and a distributed one is that for the distributed *service* to be shut down, an attacker would need to take all its nodes down. This is how blockchain ensures partition tolerance.

Just imagine a blockchain system would prioritize consistency over availability. In case of a connectivity issue and/or failing nodes, coins would no longer be transferred as there can be unanswered requests. For this reason, availability is chosen over consistency.

<HighlightBox type="tip">

For a good read on blockchain and the CAP Theorem, read [CryptoGraphics: CAP Theorem](https://cryptographics.info/cryptographics/blockchain/cap-theorem/). In case you want to read more about how Bitcoin solves the CAP Theorem take a look at [Kernfeld, P. (2016): How Bitcoin Loses to the CAP Theorem](https://paulkernfeld.com/2016/01/15/bitcoin-cap-theorem.html).

</HighlightBox>

Blockchain networks can reach all three properties of the CAP Theorem with time by focusing on availability and partition tolerance, and reaching **consistency** with the help of consensus algorithms. As is the case with consensus, consistency is eventual. It is reached over time by for example mining and block production in general.

#### Forking

<ExpansionPanel title="Remember block creation">

A valid block is **a well-ordered set of transactions**. Every block contains the **hash of the previous block** and the **nonce** (the "winning lottery ticket"). After a valid block with the hash of the previous one and the nonce is proposed, it is validated by the network participants and becomes part of the blockchain. As such, it is part of the eventual consensus of the chain, the "true" state of the ledger.

</ExpansionPanel>

Imagine you have a chain of blocks. Now, two blocks are suggested for the next free position in the chain. Remember the lottery analogy: what happens when more than one person has a winning ticket?

In this case, other nodes would receive competing claims about the winner. However, individual nodes are unlikely to receive both claims simultaneously. The protocol selects the block with the most transactions or with the most complex puzzle solved.

<HighlightBox type="info">

In software engineering, **forking** describes a process in which a developer works on a copy of a source code to create a new, independent piece of software. In blockchain, the term **forking** has an added significance. The mechanism is analogous, but it is applied and intended for different purposes.

</HighlightBox>

If still undecided, you then have a **fork**, or two competing truths. The order of blocks continues on **two different paths**; the chain of blocks splits up into two strands. As further blocks are added to each side of the fork, the two chains can both continue building their respective chain. Nodes re-evaluate each chain for length and complexity and potentially decide which side of the fork to keep working with. Each blockchain protocol provides a mechanism to eventually choose a single branch of the fork. Forks are introduced as a **_mean to reach consensus even when the community is not of the same opinion_**. In the end, eventual consensus is reached and with it also **consistency** across the states each node has.

![Example of a fork](/onboarding/1-introduction-blockchain/images/blockchain-forking.png)

Forks are often a result of changes made to the blockchain protocol: as a blockchain network evolves, so does the protocol. The changes made to the protocol can be minor but also major. When a block introduces a protocol change, which is not supported unanimously, a fork can result. The network separates into two different groups. Both groups use a different version of the blockchain protocol.

When talking about forks, it is important to note that they can be differentiated in:

* **Accidental forks**
* **Intentional forks**

**Accidental forks** occur when two or more miners find a block almost at the same time. Thus, both blocks have the same block height. This type of fork is a direct result of decentralization.

The fork is solved in many protocols with the rule: **the longest chain is the one selected**. The shorter chain, including **orphaned blocks**, is abandoned. When a chain of blocks contains an invalid transaction, it is also abandoned.

<ExpansionPanel title="Orphaned blocks - what is an uncle?">

An **uncle** is a block that was mined after someone found the correct block header. Uncles are called orphans in Bitcoin. It is a way to reward miners for almost being the first to solve the puzzle correctly. Mining an uncle does not lead to the same reward as mining a regular new block. In **Bitcoin** for example, mining an uncle/orphan does not lead to a reward at all.

![Uncles](/onboarding/1-introduction-blockchain/images/uncles.png)

Uncles fulfill an important **function**: they help **incentivize mining** and with it **decrease centralization** trends. On the Ethereum network, miners are incentivized to include uncles in the blocks they mine by rewarding such blocks. Uncle mining helps maintain a **larger number of miners**, preventing large mining pools by also incentivizing small mining pools and individual miners to continue participating in the consensus process. Uncles also help **compensate for network delays** since a miner can be rewarded even when a network delay made it come in second. In addition, uncles help **increase chain security**, as mining an uncle and mining the main chain block is conducted through the same mechanism.

Uncles can also create issues for a blockchain. Including uncles can bloat the network with blocks that have invalid or very little data - leading to **network distention**. Moreover, uncle rewards can incentivize miners to just **mine empty blocks**, as it is cheaper to include an uncle than create a valid-but-forgotten block. Empty uncle blocks do not fulfill any purpose, but they are still rewarded. This could become an issue in the future.

</ExpansionPanel>

An **intentional fork** is as the name suggests intentionally generated by either a developer or an attacker. Intentional forks are used to change the rules of a blockchain, the protocol.

**Intentional forks** are either:

* **Hard forks** or
* **Soft forks**

A **hard fork** represents _a change in the protocol of a blockchain that is not backward-compatible_. 
It is not backward-compatible because the *new rules* for validating are different to such an extent that the *old rules* would see *new-rule blocks* as invalid. Therefore, all nodes would have to accept the change and implement it by using the *new rules* to maintain a unified rule for validation. If a group of nodes objects to using the *new rules* and continue using the *old rules*, a fork occurs.

<ExpansionPanel title="A hard fork example - the story of the DAO">

**Hard forks** occurs when clients end up with different protocol implementations. When only part of the miners adopt an update to the client or when one of the protocol compliant clients introduces a change that makes the client incompatible with other types of clients a fork results.

An example of such a hard fork was the split into Ethereum and Ethereum Classic as a result of the DAO.

The DAO was described as the first instance of a **Decentralized Autonomous Organisation** (DAO). It was developed by the team around slock.it, an Ethereum hardware IoT startup. The DAO was designed to be a decentralized investment fund where investors voted on project proposals. It was a complex system of interlocking smart contracts deployed on the public Ethereum network.

The DAO started accepting deposits in exchange for so-called "DAO tokens" in April 2016 and raised $160 million worth of Ether in a very short time.

Unbeknown to the investors, the code contained a **vulnerability**: under certain circumstances, it was possible to re-enter a function in a smart contract and the function in question sends Ether to another address. This means that if a payout is made before the internal variable keeping track of the currency is updated, the smart contract can be drained.

The DAO was vulnerable to this sort of attack and in June 2016 an attacker exploited the vulnerability. Ether worth more than $60 million was drained from the faulty smart contract. It is important to note that this was not a vulnerability of the infrastructure but an exploit of an application operating on the Ethereum Virtual Machine (EVM).

The developer community, many of whom were investors in the DAO, responded to the attack by proposing an update to clients that would blacklist the addresses of the attacker. With it, the attacker would be unable to retrieve a bounty. It later turned out that this **soft-fork proposal** introduced vulnerabilities into the clients that allowed attackers to DDOS the clients.

A second fork was proposed, a **hard fork**. This fork introduced protocol changes and in practice re-wrote history. It established a state in which the attack never happened and allowed the investors to retrieve their funds. This update introduced a change that made the clients that adopted it incompatible with those that did not.

When the change was activated it turned out that a small group of miners had refused to install the update on purpose and the Ethereum network split into **Ethereum** and **Ethereum Classic**. The Ethereum Classic community called the changes a bailout and a compromise of the immutability of the network and refused to participate.

The story of the DAO evokes some questions to consider when assessing public blockchain networks:

* How will the community react to failures on the application layer? 
* Who is influential in the community and what are their interests? 
* What are the professed values of the community?

</ExpansionPanel>

If a hard fork is a change in the rules of a blockchain, what is a **soft fork**?

A **soft fork** is _a change of the protocol with which the rules enforced are restricted_. Thus, it is backward-compatible.

A soft fork can also result in the chain splitting up. This happens, when blocks are created under the *old rules* and then regarded invalid by the *new rules*. A valid block under the *old rules* can become invalid under the *new rules* by nodes that are implementing these rules. Soft forks are often used to update the blockchain's protocol.

#### Immutability 

**Immutability** refers to the _unchangeability of objects over time and/or the inability to perform changes_. In the case of blockchains, once data has been included in the blockchain editing or deleting it is nearly impossible. In blockchain technology, the use of hashes creating a chain of blocks ensure a high degree of immutability and easy tampering detection. If a participant tries to remove or edit data, the block’s hash and chain would fail. In addition, the changes could only be introduced by using the consensus mechanism of the network.

<HighlightBox type="info">

In private databases, most end-users get read-only access. Full access is usually limited to system administrators. The organizational structure of a system is designed to prevent malicious behavior. Often, other than the organizational design, no control system ensures data immutability.

</HighlightBox>

When a new node connects to the network, or returns after being offline, it needs to download the existing blockchain state. The other peers of the network help by sending the latest block, the previous blocks, plus the list of past transactions. Among the peers, there may be one or more malicious nodes. These malicious nodes may decide to withhold certain transactions and, conversely, send transactions that do not appear in the blockchain on which honest nodes agreed.

How does this new node eventually reach the same consensus as the honest nodes?

<HighlightBox type="info">

Each block of the blockchain is identified by:

* The hash of its predecessor
* The root hash of its transaction's Merkle tree
* A nonce that solves the mining puzzle
* A hash of the above

</HighlightBox>

For a malicious node to remove or insert transactions, it would need to:

* Update the root hash of the containing the block's Merkle tree.
* Update the nonce of the containing block.
* Update the hash of the containing block.
* Do the same for all subsequent blocks.

This is theoretically possible in a PoW network, but in practice requires the malicious nodes to harness more processing power than the honest nodes. A node will almost certainly end up connecting to an honest node during its life. This honest node would tell the new node a different truth from that of the malicious nodes, after which the new node would need to make a decision. It will always decide to go with the **longest or more difficult fork**.

It is said that the blockchain is **immutable** because of the practical difficulty to include new or change old data.

#### Block creation and finality

**Finality** in blockchain refers to the guarantee that transactions, blocks, and in the end, the state cannot be altered, reversed, or manipulated after a block is validated and becomes part of the chain. In practice, network latency influences finality. Therefore, finality is used to measure the amount of time you have to wait to consider a transaction final and then part of the immutable blockchain ledger.

Finality is an essential feature of blockchains. Without finality, a blockchain network cannot serve properly as a network for assets with value, payment, or immutable ledger. In blockchain, transactions are termed immutable due to blockchain's finality nature. However, most blockchain protocols only have **probabilistic (transaction) finality** — transactions are not automatically or instantly final but become more final over time as more blocks are confirmed.

The amount of time it takes a blockchain network to confirm a transaction (latency) determines the nature of the chain's finality rate.

There are different **types of finality** in blockchains, depending on the underlying consensus mechanism a protocol relies on:

* **Probabilistic finality:** describes the finality of a transaction dependent on how probable reverting a block is - the probability of removing a transaction. The more blocks come after the block containing a specific transaction, the less probable a transaction may be reverted, as _longest_ or _heaviest chain rules_ apply in the case of forks.
* **Absolute finality:** or deterministic finality, is a trait of protocols based on PoS. Finality comes as soon as a transaction and block are verified. There are no scenarios in which a transaction could be revoked after it has been finalized.

<ExpansionPanel title="The CAP Theorem and finality">

The CAP Theorem states that when partition is given as in blockchain networks, you can choose between consistency and availability. Whereas, a network with consistency rather halts inaccurate transactions than letting them through. A network preferring availability continues even with inaccurate transactions. Consistency-favoring systems provide BFT finality and availability-favoring systems provide probabilistic finality.

</ExpansionPanel>

While absolute finality can be more desirable than probabilistic finality, there are some **trade-offs** to consider: users making payments will most probably favor absolute finality, but decentralized applications (dApps) might require availability over consistency.

When it comes to payments, probabilistic finality opens up a network to transactions only being less or more probably final but not "final final". Blocks changing could lead to the loss of millions of dollars. dApps might require transactions to always go through even when they include minor mistakes. Finality largely affects the user experience. Thinking about finality is essential to develop robust blockchain platforms and choose which platform to develop applications for.

<ExpansionPanel title="Finality in PoS consensus">

How does the consensus mechanism affect finality? Take a look at an example for PoS consensus and the finality it establishes: Tendermint.

Tendermint provides absolute finality. It relies on Proof-of-Stake (PoS) with delegation and [Practical Byzantine Fault Tolerance (BFT)](https://github.com/tendermint/tendermint). Participants signal support for well-behaved, reliable nodes that create and confirm blocks, and users signal support by staking the native token of a chain. Staking bears the possibility of acquiring a share of the network transaction fees, but also the risk of reduced returns or even losses should the node become unreliable.

Network participants are incentivized to provide/withdraw support for validators reflecting how dependable a node is. The number of tokens staked by a validator translates into its voting power, which is the basis to be awarded the right to create a block. Validators confirm candidate blocks. Blocks can then be considered **final**. 

Tendermint aims at high performance and is based on dedicated validators with good network connectivity. This is quite different from PoW, which favors inclusion and must accommodate slower nodes with greater latency and less reliability, resulting in probabilistic finality. Tendermint prefers consistency over availability.

</ExpansionPanel>

<HighlightBox type="reading">

**Further readings:**

* [Bentov, I. et al.: Proof-of-Activity: Extending Bitcoin’s Proof of Work via Proof of Stake](https://eprint.iacr.org/2014/452.pdf)
* [Castro, M. & Liskov, B. (1999): Practical Byzantine Fault Tolerance](http://pmg.csail.mit.edu/papers/osdi99.pdf)
* [CryptoGraphics: CAP Theorem](https://cryptographics.info/cryptographics/blockchain/cap-theorem/)
* [Digiconomist: Bitcoin Energy Consumption Index](https://digiconomist.net/bitcoin-energy-consumption)
* [Ether supply and uncle rewards](http://etherscan.io/stat/supply)
* [Kernfeld, P. (2016): How Bitcoin Loses to the CAP Theorem](https://paulkernfeld.com/2016/01/15/bitcoin-cap-theorem.html)
* [Kwon, J. (2014): Tendermint: Consensus without Mining](http://tendermint.com/docs/tendermint.pdf)
* [Leussink, K. (2018): CAP Theorem](https://cryptographics.info/cryptographics/blockchain/cap-theorem/)
* [Practical Byzantine Fault Tolerance](https://www.comp.nus.edu.sg/~rahul/allfiles/cs6234-16-pbft.pdf)
* [Proof of Authority: consensus model with Identity at Stake](https://medium.com/oracles-network/proof-of-authority-consensus-model-with-identity-at-stake-d5bd15463256)
* [Uncle rate analysis](https://blog.ethereum.org/2016/10/31/uncle-rate-transaction-fee-analysis/)
* [Vasa (2018): ConsensusPedia: An Encyclopedia of 30 Consensus Algorithms. A complete list of all consensus algorithms](https://hackernoon.com/consensuspedia-an-encyclopedia-of-29-consensus-algorithms-e9c4b4b7d08f)
[Witherspoon, Z. (2013): A Hitchhiker’s Guide to Consensus Algorithms. A quick classification of cryptocurrency consensus types](https://hackernoon.com/a-hitchhikers-guide-to-consensus-algorithms-d81aae3eb0e3)

</HighlightBox>

## Quick recap



## Next up

