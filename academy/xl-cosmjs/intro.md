---
title: "Introduction to CosmJS"
order: 1
description: What is CosmJS and what can it do for me?
tag: intro
---

# Introduction to CosmJS

**Distributed applications (dApps)** are _software applications that run on distributed networks_. Blockchains provide persistent data, or the state, as well as persistent processes and logic. The Cosmos SDK helps developers create such applications. A user interface will be important in most cases. Server interactions are important in many cases. This is where [CosmJS](https://github.com/cosmos/CosmJS) comes in handy.

As the name suggests, CosmJS is a Typescript/JavaScript library. It helps developers integrate frontend user interfaces and backend servers with Cosmos blockchains that implement distributed applications. To many users, the "dApp" **is** the user interface, even though it is often delivered to the browser in a centralized, traditional way - relying on the DNS infrastructure and centralized web servers.

This re-introduction of a degree of centralization is usually considered acceptable by most teams, provided that the important business logic of the system is enforced by a blockchain and it is not strictly necessary to use the provided user interface in order to use the dApp. As a general heuristic, offer a user interface as a convenience rather than a necessity.

In general, user interfaces help users interpret the blockchain state, compose and sign transactions, and send them - all things that can potentially be accomplished by other less convenient methods. A user interface can be supported by servers or micro-services that also interact with the blockchain.

## Some examples

Developers who are engaged in developing intuitive and coherent user interfaces need to accomplish certain things at the browser level:

* Help the user create unsigned Cosmos SDK transactions.
* Let the user sign an unsigned transaction with their wallet.
* Help the user submit a signed transaction to a Cosmos SDK endpoint.
* Query the state from the Cosmos Hub or a custom module using the legacy REST endpoint.
* Query the state from the Cosmos Hub or a custom module using the gRPC endpoint.
* Help the user submit multiple messages in a single transaction.

Backend systems are often useful components of the overall design:

* Cache a complex state for performance reasons.
* Minimize client requirements for basic, anonymous browsing.
* Monitor the blockchain for changes and inform clients.
* Present API endpoints and WebSockets.

Developers need a tool-kit to accomplish such things that addresses the following foundational concerns:

* Signing a transaction when a mnemonic phrase is known.
* Signing a transaction when a private key is known.
* Grouping multiple messages into a single transaction.
* Requesting a user signature with help from a wallet like Keplr.
* Querying the blockchain state.
* Listening for events emitted by Cosmos SDK modules.

CosmJS assists with these tasks and more.

CosmJS's modular structure lets developers import only the parts that are needed, which helps reduce download payloads. Since the library is unopinionated, it is compatible with popular JavaScript frameworks such as Vue, React, and Express.

Continue reading for a hands-on developer exercise. The tutorial starts with downloading dependencies and proceeds through the steps of creating a simple user interface.

<HighlightBox type="reading">

* [HackAtom HCMC Workshop - CosmWasm/CosmJS: from zero to hero](https://www.youtube.com/watch?v=VTjiC4wcd7k)
* [CosmJS GitHub repository](https://github.com/cosmos/CosmJS)

</HighlightBox>
