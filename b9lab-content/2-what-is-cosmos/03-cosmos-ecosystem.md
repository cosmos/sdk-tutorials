---
title: "The Cosmos Ecosystem"
order: 3
description: A universe to discover
tag: fast-track
---

# The Cosmos Ecosystem

**Cosmos** is a network of independent blockchains which are: 
* All powered by consensus algorithms with Byzantine Fault-Tolerance (BFT). 
* All connected through the Inter-Blockchain Communication protocol (IBC) enabling value transfers, such as token transfers, and other communication.
* All without the need to involve exchanges nor compromise the chains' sovereignty.

More than this, Cosmos is also **a blockchain ecosystem**, complete with protocols, SDK, tokens, wallets, applications, repositories, services, and tools.

Let's review them.

## A whole universe to discover: Tokens, wallets, apps, and services

Fittingly, Cosmos is an ever-expanding ecosystem of tokens, wallets, tools, as well as interconnected apps and services, all built for the decentralized future.

In 2021 almost **$100 billion in digital assets** are under management and secured by Cosmos. Digital assets on Cosmos include fungible and non-fungible tokens (NFT). You can issue in-application tokens to conduct settlements, bespoke issuance, handle inflation/deflation, and more.

Among the fungible tokens secured by Cosmos are the [Binance Coin](https://www.binance.com/en/bnb), [Terra](https://www.terra.money/), and of course, [ATOM](https://cosmos.network/learn/faq/what-is-the-atom). Remember that because the tokens are defined on application-specific blockchains, their developers are free from the constraints of a hypothetical general-purpose blockchain.

<HighlightBox type="tip">

For an overview of the tokens Cosmos secures across apps and services, take a closer look at the [Cosmos market capitalization overview](https://cosmos.network/ecosystem/tokens/).

</HighlightBox>

In addition to the vast number of tokens, a variety of applications and services, wallets, and explorers are Cosmos-based.

**Hundreds of applications and services** build on Cosmos. At the time of writing, most applications and projects deal with finance, closely followed by infrastructure. Applications and projects in areas such as privacy, marketplace, and social impact are also emerging.

<HighlightBox type="tip">

Do you want an up-to-date list of applications and services built on Cosmos? Head to the [Cosmos ecosystem overview](https://cosmos.network/ecosystem/apps/?ref=cosmonautsworld).

</HighlightBox>

As you might expect, not all applications are at the same stage of development. While most applications and projects are deployed on the mainnet, some are currently either in proof of concept, still in development, or have been deployed to a testnet only.

Moreover, [**35 wallets**](https://cosmos.network/ecosystem/wallets) and block explorers for Cosmos are part of the ecosystem. Most are for Android, such as the [Atomic Wallet](https://atomicwallet.io/) and [Coinex](https://www.coinex.com/), or iOS, like [AirGap](https://airgap.it/) and [Wallet.io](https://walletio.io/), but you can also find a number of web wallets, like [Exodus](https://www.exodus.com) and [Keplr](https://wallet.keplr.app/).

<HighlightBox type="tip">

Do you want to find out more about the wide variety of wallets in the Cosmos ecosystem? We recommend checking out the [wallets and block explorers for Cosmos](https://cosmos.network/ecosystem/wallets).

</HighlightBox>

## Main components
The Cosmos network focuses on an ecosystem for easy blockchain developement. *Click on the hotspots in the image to learn more about the main goals of the Cosmos network.*

<H5PComponent :contents="['/h5p/M1-ecosystem-constellation-HS']"></H5PComponent>

<HighlightBox type="tip">

If you want to explore more on application-specific blockchains, take a look at the section [A Blockchain App Architecture](../3-main-concepts/02-architecture.md).

</HighlightBox>

Focusing on customizability and interoperability leads to establishing a stable universe determined by the same rules that apply to the whole ecosystem equally.

## The Cosmos SDK: Modularity and customizing

The Cosmos SDK can be understood as a generalized framework to build secure blockchain applications on the Tendermint BFT in Golang. It is a modular framework for application-specific blockchains. The design bases itself on **two major principles**: modularity and capability-based security.

The SDK was envisioned to be an npm-like framework for secure applications on top of Tendermint. Over time, it has become an advanced framework for custom application-specific blockchains:

<H5PComponent :contents="['/h5p/M1-Ecosystem-SDK-AC']"></H5PComponent>

The ready-built modules of the Cosmos SDK can be easily used - It is as simple as importing modules into the application. Additionally, developers can create their own modules to introduce specific functionalities. One can expect that, with the growth of the ecosystem, the number of modules will grow, thereby facilitating the development of more complex applications.

<HighlightBox type="tip">

*Building on modular components, many of which you did not write yourself. Although it sounds like an increased potential for attacks, and faulty or malicious nodes operating undetected? One does not have to worry.*

</HighlightBox>

The Cosmos SDK is built on the [object-capability model](https://docs.cosmos.network/master/core/ocap.html). It not only favors modularity but also encapsulates code implementation. In a nutshell, an object-capability model ensures that:

* There is no way for objects in memory to be discovered just by going through the composed objects of others.
* The only way to have references to objects is to have been given their references.
* The only way to access a service is to have been given the relevant object references.

<HighlightBox type="info">

The default consensus mechanism available when developing with the SDK is the [Tendermint Core](https://docs.tendermint.com/master/).

</HighlightBox>
## The Inter-Blockchain Communication protocol

The [Inter-Blockchain Communication (IBC) protocol](https://ibcprotocol.org/) is the basis for **interoperability** in Cosmos. It leverages Tendermint's instant finality to allow for the transfer of value, for example tokens, and communication between heterogeneous chains. Blockchains with different applications and architecture specifications become interoperable whether or not they share a validator set.

Without IBC, the interoperability of heterogeneous chains is difficult to achieve because they may implement the consensus, networking, and application layers in different ways. As soon as a blockchain is compatible with IBC, it becomes interoperable with other blockchains.

*With these chain-to-chain connections now possible, how can we create a network of blockchains?*

The first naive idea would be to connect each blockchain with the other chains through direct IBC connections. Unfortunately, this would quickly lead to a very large, expensive, and ultimately unmanageable number of connections in the network. The number of connections in the network would increase quadratically with the number of blockchains.

A second idea, one that **reduces the number of connections necessary** back down to the number of chains, would be to introduce an intermediate entity that facilitates the transfer between chains, in a hub and spoke model. Unfortunately, this would bring back unwelcomed centralization.

*How can we uphold decentralization then?*

First, by keeping the capability of chain-to-chain connections made possible by **IBC**. Second, by creating a flexible multi-hub and spoke model, whereby a spoke gets automatic access to all the other spokes of the hub it is connected to. This is the road Cosmos took.

Cosmos implements a **modular architecture with two blockchain classes**: **hubs** and **zones**.

<H5PComponent :contents="['/h5p/M1_zones_hubs']"></H5PComponent>

There is no enforcement of an actual topology and a "hub" can be understood as a "zone" with many connections to other zones. Application zones can be expected to join the hubs in the ecosystem, but they are free to coalesce in any topology the developers find appropriate.

<HighlightBox type="tip">

You want more detailed information on the hubs and zones on the mainnet and in the testnet, check out this [map of zones](https://mapofzones.com/).

</HighlightBox>

The **[Cosmos Hub](https://hub.cosmos.network/main/hub-overview/overview.html)** was the first hub created. It is a public, Proof-of-Stake (PoS) blockchain with a native token, ATOM. The Cosmos Hub can be understood as a router facilitating, among other things, transactions between the chains connected to it. The Cosmos Hub allows, for example, for transaction fees to be paid in different tokens as long as the zone trusts the Cosmos Hub and the other zones connected to it.

*How do we connect our chain to a non-Tendermint chain?* In fact, the IBC connection is not limited to Tendermint-based chains. If the other non-Tendermint chain is a **fast-finality chain**, meaning a blockchain using a fast-finality consensus algorithm, the connection can be established by adapting IBC to work with the non-Tendermint consensus mechanism.

If the other chain is a **probabilistic-finality chain**, meaning a blockchain without fast finality like those relying on Proof-of-Work (PoW), a simple adaptation of IBC is not sufficient. Instead, a more elaborate setup is required. More precisely, a proxy chain, a so-called **peg-zone**, helps establish interoperability. Peg-zones are fast-finality blockchains tracking chain states to establish finality. The peg-zone chain itself is IBC-compatible and acts as the **bridge** between the rest of the IBC network (its blockchains) and the probabilistic-finality chain.

One such peg-zone implementation exists for Ethereum and is named the **[Gravity Bridge](https://github.com/cosmos/gravity-bridge)**.

## Atlas: Cosmos SDK module registry and node explorer

The Cosmos SDK draws its modularity from so-called modules, which define most of the application's logic.

<HighlightBox type="info">

Want to learn more about modules in the Cosmos SDK? Check out the [Modules section in the Main Concepts chapter](../3-main-concepts/08-modules.md)!

</HighlightBox>

[Atlas](https://atlas.cosmos.network/) implements a registry for such modules. With it, developers can publish, update, and download Cosmos SDK modules. It is a helpful tool for developers who wish to get an overview of existing modules when developing their applications.

Additionally, Atlas offers a [node explorer](https://atlas.cosmos.network/nodes) that lets you crawl through nodes of a Tendermint-based network to discover its topology and the nodes' metadata.

<HighlightBox type="tip">

If you want to dive deeper into the node explorer, take a look at its [documentation](https://github.com/cosmos/atlas/blob/main/docs/node-explorer.md).

</HighlightBox>

## Starport: Building application-specific blockchains with one command

[Starport](https://cosmos.network/starport/) is a developer-friendly command-line interface (CLI) tool for application-specific blockchains building on Tendermint and the Cosmos SDK. The CLI tool offers everything developers need to build, test, and launch a chain. It accelerates blockchain development by scaffolding and assembling all components needed for a production-ready blockchain. Starport makes the process from initial idea to production 95% faster; it lets you build a blockchain in minutes. This lets developers focus more strongly on the business logic of their application.

With Starport developers can:

* Create a modular blockchain written in Go with a single command.
* Start a development server to experiment with token creation and allocation, as well as module configuration.
* Allow for inter-chain token transfers by using its built-in IBC relayer to send value and data to different chains.
* Benefit from a fast-developed front-end with automatically generated APIs and web pages in JavaScript, TypeScript, and Vue.

<HighlightBox type="tip">

Already want to dive deep into Starport? Take a closer look at the official [Starport documentation](https://docs.starport.com/) and the section on [Starport in the My Own Cosmos Chain chapter](../5-my-own-chain/02-starport.md).

</HighlightBox>

When you scaffold with Starport, things like key management, creating validators, and transferring tokens can be done through the CLI.

## CosmWasm: Multi-Chain smart contracts

[CosmWasm](https://cosmwasm.com/) is a multi-chain platform for building robust dApps for Cosmos using smart contracts. It builds on Tendermint and the Cosmos SDK.

Its key features are:

* Mature tools for the development and testing of smart contracts
* Close integration with the Cosmos SDK and ecosystem
* A secure architecture to avoid attack vectors

With CosmWasm, smart contracts can run on multiple chains with the help of the IBC protocol. It adds further flexibility for developers and makes smart contract development faster.

CosmWasm is written as a module to be plugged into the Cosmos SDK and leverages the speed of Wasm and the power of Rust.

<HighlightBox type="tip">

For a deeper dive, why not dive into the [CosmWasm documentation](https://docs.cosmwasm.com/docs/1.0/)?

</HighlightBox>

## The possibility of using alternative blockchain frameworks and SDKs

As the Cosmos SDK is modular, developers can port existing codebases in Go on top of the SDK. This allows developers to build on Cosmos without having to compromise too much on the toolset and environment used.

For example, with [Ethermint](https://github.com/cosmos/ethermint) developers can use the Ethereum Virtual Machine (EVM) from the main Go Ethereum client as a Cosmos SDK module compatible and combinable with existing modules. Thus, Ethermint blockchains become compatible with Cosmos.

<HighlightBox type="info">

Ethermint is a software developed to port the EVM into a Cosmos module. It makes scalable, high-throughput, PoS blockchains possible. These are fully compatible with Ethereum and the Cosmos SDK at the same time.

Ethermint is Web3 compatible and achieves high throughput with Tendermint and horizontal scaling with IBC. It provides a Web3, JSON-RPC layer to interact with Ethereum clients and tooling.

For more on Ethermint, consult the [documentation](https://github.com/cosmos/ethermint).

</HighlightBox>

All Ethereum tools, such as Truffle and Metamask are compatible with Ethermint. Developers can even port their Solidity smart contracts to interact with the Cosmos ecosystem. Building a chain is not necessary to develop Cosmos-compatible smart contracts, it can be all done with Ethermint.

While Ethermint allows running Vanilla Ethereum as a Cosmos application-specific blockchain, developers benefit from the Tendermint BFT.
