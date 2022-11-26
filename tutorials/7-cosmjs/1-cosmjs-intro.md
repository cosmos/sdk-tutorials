---
title: "What is CosmJS?"
order: 2
description: CosmJS and what it can do for me
tags: 
  - tutorial
  - concepts
  - cosm-js
---

# What is CosmJS?

<HighlightBox type="learning">

Build applications that interact with Cosmos blockchains with CosmJS.
<br/><br/>
In this section, you will learn:
  
* What CosmJS is.
* What you can use it for.
* More details regarding the modular design of CosmJS.

</HighlightBox>

**Distributed applications (dApps)** are _software applications that run on distributed networks_. Blockchains provide persistent data, or the state, as well as persistent processes and logic. The Cosmos SDK helps developers create such applications. A user interface is important in most cases, and server interactions are important in many cases. This is where [CosmJS](https://github.com/cosmos/CosmJS) comes in handy.

As the name suggests, CosmJS is a TypeScript/JavaScript library. It helps developers integrate frontend user interfaces and backend servers with Cosmos blockchains that implement distributed applications. To many users, the "dApp" **is** the user interface, even though it is often delivered to the browser in a centralized, traditional way - relying on the DNS infrastructure and centralized web servers.

This re-introduction of a degree of centralization is usually considered acceptable by most teams, provided that the important business logic of the system is enforced by a blockchain and provided it is not strictly necessary to use the provided user interface in order to use the dApp. As a general heuristic, offer a user interface as a convenience rather than a necessity.

In general, user interfaces help users interpret the blockchain state, compose and sign transactions, and send them - all things that are potentially accomplished by other less convenient methods. A user interface is supported by servers or micro-services that also interact with the blockchain.

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

Developers need a tool-kit to accomplish things that address these foundational concerns:

* Signing a transaction when a mnemonic phrase is known.
* Signing a transaction when a private key is known.
* Grouping multiple messages into a single transaction.
* Requesting a user signature with help from a wallet like Keplr.
* Querying the blockchain state.
* Listening for events emitted by Cosmos SDK modules.

CosmJS assists with these tasks and more.

The modular structure of CosmJS lets developers import only the parts that are needed, which helps reduce download payloads. Since the library is unopinionated, it is compatible with popular JavaScript frameworks such as Vue, React, and Express.

## Packages

CosmJS is a library that consists of many smaller npm packages within the [@cosmjs namespace](https://www.npmjs.com/org/cosmjs), a so-called "monorepo".

Generally people only need the `stargate` and `encoding` packages as they contain the main functionality to interact with Cosmos SDK chains version 0.40 and higher.

Among many more, here are some example packages:

| Package                                                 | Description                                                                                                                                                                                                                              | Latest                                                                                                                                |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [@cosmjs/stargate](https://www.npmjs.com/package/@cosmjs/stargate)                   | A client library for the Cosmos SDK 0.40+ (Stargate)                                                                                                                                                                                     | [![npm version](https://img.shields.io/npm/v/@cosmjs/stargate.svg)](https://www.npmjs.com/package/@cosmjs/stargate)                   |
| [@cosmjs/faucet](https://www.npmjs.com/package/@cosmjs/faucet)                       | A faucet application for Node.js                                                                                                                                                                                                         | [![npm version](https://img.shields.io/npm/v/@cosmjs/faucet.svg)](https://www.npmjs.com/package/@cosmjs/faucet)                       |
| [@cosmjs/cosmwasm-stargate](https://www.npmjs.com/package/@cosmjs/cosmwasm-stargate) | Client for Stargate chains with the CosmWasm module enabled                                                                                                                                                                              | [![npm version](https://img.shields.io/npm/v/@cosmjs/cosmwasm-stargate.svg)](https://www.npmjs.com/package/@cosmjs/cosmwasm-stargate) |
| [@cosmjs/crypto](https://www.npmjs.com/package/@cosmjs/crypto)                       | Cryptography for blockchain projects, e.g. hashing (SHA-2, Keccak256, Ripemd160), signing (secp256k1, ed25519), HD key derivation (BIP-39, SLIP-0010), KDFs and symmetric encryption for key storage (PBKDF2, Argon2, XChaCha20Poly1305) | [![npm version](https://img.shields.io/npm/v/@cosmjs/crypto.svg)](https://www.npmjs.com/package/@cosmjs/crypto)                       |
| [@cosmjs/encoding](https://www.npmjs.com/package/@cosmjs/encoding)                   | Encoding helpers for blockchain projects                                                                                                                                                                                                 | [![npm version](https://img.shields.io/npm/v/@cosmjs/encoding.svg)](https://www.npmjs.com/package/@cosmjs/encoding)                   |
| [@cosmjs/math](https://www.npmjs.com/package/@cosmjs/math)                           | Safe integers; decimals for handling financial amounts                                                                                                                                                                                   | [![npm version](https://img.shields.io/npm/v/@cosmjs/math.svg)](https://www.npmjs.com/package/@cosmjs/math)                           |

## Modularity

We're proud of the modularity and clean dependency tree in this monorepo. This ensures software quality on our side, and lets users pick exactly what they need and only what they need. The following diagram shows how everything fits together (every item is a npm package; right depends on left):

![CosmJS dependency tree](/tutorials/7-cosmjs/images/cosmjs-tree.png)

Continue reading for a [hands-on developer exercise](./2-first-steps.md). The tutorial starts with downloading dependencies and proceeds through the steps of creating a simple user interface.

<HighlightBox type="reading">

Some additional reading or video material is available as well:

* [HackAtom HCMC Workshop - CosmWasm/CosmJS: from zero to hero](https://www.youtube.com/watch?v=VTjiC4wcd7k)
* [CosmJS GitHub repository](https://github.com/cosmos/CosmJS)

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* **CosmJS**, a TypeScript/JavaScript library supplied with the Cosmos SDK providing many small npm packages that help developers integrate frontend user interfaces and backend servers with Cosmos blockchains that implement distributed applications (dApps).
* How to think about the objectives a coherent and intuitive user interface needs to accomplish, how backend systems can be useful components of the overall design, and the foundational concerns that need to be addressed through the developer's tool-kit.
* How the modularity of CosmJS delivers clean paths of software design, allowing developers to pick exactly (and only) what they need to achieve their project goals.

</HighlightBox>

<!--## Next up

Take your first steps with CosmJS in the [next section](./2-first-steps.md).-->
