---
title: "CosmJs Intro"
order: 2
description: What is CosmJs and what can it do for me? 
tag: intro
---

# The DApp stack

Distributed applications, or DApps, are software applications that run on distributed networks. Blockchains provide persistent data, or state, as well as persistent processes and logic. Cosmos SDK helps developers create such applications. A user interface will be important in most cases. Server interactions are important in many cases. This is where [CosmJs](https://github.com/cosmos/cosmjs) can help. 

As the name suggests, CosmJs is a Javascript library. It helps developers integrate front-end user interfaces and back-end servers with Cosmos blockchains that implement distributed applications. To many users, the "DApp" _is_ the user interface, even though it's often delivered to the browser in a centralised, traditional way - relying on the DNS infrastructure and centralised web servers. 

This re-introduction of a degree of centralization is usually considered acceptable by most teams, provided that the important business logic of the system is enforced by a blockchain and provided it is not strictly necessary to actually use the provided user interface in order to use the DApp. As a general heuristic, offer a user interface as a convenience rather that a necessity. 

# What can CosmJs do? 

In general, user interfaces help users interpret the blockchain state, compose and sign transactions and send them - all things that can potentially be accomplished by other less convenient methods. And, a user interface can be supported by servers or micro-services that also interact with the blockchain. 

## Some examples

Developers who are engaged in developing intuitive and coherent user interfaces need to accomplish certain things at the browser level:

* Help the user create unsigned Cosmos SDK transactions
* Let the user sign an unsigned transaction with their wallet
* Help the user submit a signed transaction to a Cosmos SDK endpoint
* Query the state from a Cosmos Hub or custom module using the legacy REST endpoint
* Query the state from a Cosmos Hub or custom module using the gRPC endpoint
* Query the state from a custom module using the legacy REST endpoint
* Help the user submit multiple messages in a single transaction

Back-end systems are often useful components of the overall design:

* Cache a complex state for performance reasons
* Minimise client requirements for basic, anonymous browsing
* Monitor the blockchain for changes and inform clients
* Present API endpoints and websockets

In order to accomplish such things, developers need a tool-kit that addresses foundational concerns:

* Signing a transaction when a mnemonic phrase is known
* Signing a transaction when a private key is known
* Grouping multiple messages into a single transaction
* Requesting a user signature with help from a wallet like Keplr
* Querying the blockchain state
* Listening for events emitted by Cosmos SDK modules

CosmJs assists with these tasks and more. 

CosmJs's modular structure lets developers import only the parts that are actually needed which helps reduce download payloads. And, since the library is unopinionated, it is compatible with popular Javascript frameworks such as Vue, React and Express.

Continue reading for a hands-on developer exercise. The tutorial starts with downloading dependencies and proceeds through the steps of creating a simple user-interface. 

<HighlightBox type="reading">
* Developer demonstration of CosmJS: [HackAtom HCMC Workshop](https://www.youtube.com/watch?v=VTjiC4wcd7k)
* Github repo: [CosmJS](https://github.com/cosmos/cosmjs)
</HighlightBox>