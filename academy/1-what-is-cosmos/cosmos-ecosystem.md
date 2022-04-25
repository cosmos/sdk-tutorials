---
title: "The Cosmos Ecosystem"
order: 3
description: A universe to discover
tag: fast-track
---

# The Cosmos Ecosystem

**Cosmos** is a network of independent blockchains, which are:

* All powered by consensus algorithms with Byzantine Fault-Tolerance (BFT).
* All connected through the Inter-Blockchain Communication Protocol (IBC), which enables value transfers/token transfers and other communication between chains, all without the need to involve exchanges or make compromises regarding the chains' sovereignties.

Cosmos is also **a blockchain ecosystem** complete with protocols, SDK, tokens, wallets, applications, repositories, services and tools.

## A whole universe to discover: tokens, wallets, apps, and services

Cosmos is an ever-expanding ecosystem of tokens, wallets, and tools, as well as interconnected applications and services, all built for the decentralized future.

In 2022 almost **$100 billion in digital assets** are under management and secured by Cosmos. Digital assets on Cosmos include fungible and non-fungible tokens (NFT). You can issue in-application tokens to conduct settlements, bespoke issuance, handle inflation/deflation, and much more.

Among the fungible tokens secured by Cosmos are the [Binance Coin](https://www.binance.com/en/bnb), [Terra](https://www.terra.money) and [ATOM](https://cosmos.network/learn/faq/what-is-the-atom). Remember that because the tokens are defined on application-specific blockchains their developers are free from the constraints of a hypothetical general-purpose blockchain.

<HighlightBox type="tip">

For an overview of the tokens Cosmos secures across applications and services, take a closer look at the [Cosmos market capitalization overview](https://cosmos.network/ecosystem/tokens/).

</HighlightBox>

In addition to the vast number of tokens, a variety of applications, services, wallets, and explorers are Cosmos-based.

**Hundreds of applications and services** build on Cosmos. At the time of writing, most applications and projects deal with finance, closely followed by infrastructure-related applications. Applications and projects in areas such as privacy, marketplace, and social impact are also emerging.

<HighlightBox type="tip">

Do you want an up-to-date list of all the applications and services built on Cosmos? Head to the [Cosmos ecosystem overview](https://cosmos.network/ecosystem/apps/?ref=cosmonautsworld).

</HighlightBox>

While most applications and projects are deployed on the mainnet, some are currently either in proof of concept, still in development, or have been deployed to a testnet only.

Moreover, [**35 wallets**](https://cosmos.network/ecosystem/wallets) and block explorers for Cosmos are part of the ecosystem. Most are for Android such as the [Atomic Wallet](https://atomicwallet.io/) and [Coinex](https://www.coinex.com/) or iOS like [AirGap](https://airgap.it/) and [Wallet.io](https://walletio.io/), but you can also find a number of web wallets like [Exodus](https://www.exodus.com) and [Keplr](https://wallet.keplr.app/).

<HighlightBox type="tip">

Do you want to find out more about the wide variety of wallets in the Cosmos ecosystem? We recommend checking out the [wallets and block explorers for Cosmos](https://cosmos.network/ecosystem/wallets).

</HighlightBox>

## The Cosmos SDK: Modular and Customizable

The Cosmos network focuses on an ecosystem for easy blockchain development that provides customizability and interoperability, establishing a stable universe determined by the same rules that apply to the whole ecosystem equally. _Click on the hotspots in the image to learn more about the main goals of the Cosmos network._

<H5PComponent :contents="['/h5p/M1-ecosystem-constellation-HS']"></H5PComponent>

<HighlightBox type="tip">

If you want to dive deeper into application-specific blockchains take a look at the section [A Blockchain App Architecture](../2-main-concepts/architecture.md).

</HighlightBox>

The Cosmos SDK is a generalized framework to build secure blockchain applications on the Tendermint BFT in Golang. It is a modular framework for application-specific blockchains. The design is based on **two major principles**: modularity and capability-based security. The Cosmos SDK was envisioned to be an npm-like framework for secure applications on top of Tendermint. Over time it has become an advanced framework for custom application-specific blockchains.

The ready-built modules of the Cosmos SDK are easy to import, adapt, and use. Developers can create their own modules to introduce specific functionalities. With the growth of the ecosystem, the number of modules will grow, facilitating the development of more complex applications.

<HighlightBox type="tip">

Building on modular components, many of which you did not write yourself - does this sound like an increased potential for attacks and faulty or malicious nodes operating undetected? No need to worry.

</HighlightBox>

The Cosmos SDK is built on the [object-capability model](https://docs.cosmos.network/master/core/ocap.html). It not only favors modularity but also encapsulates code implementation. An object-capability model ensures that:

* There is no way for objects in the memory to be discovered just by going through the composed objects of others.
* The only way to have references to objects or to access services is to have been passed the relevant object references.

<HighlightBox type="info">

The default consensus mechanism available when developing with the SDK is the [Tendermint Core](https://docs.tendermint.com/master/).

</HighlightBox>

## The Inter-Blockchain Communication Protocol

The [Inter-Blockchain Communication Protocol (IBC)](https://ibcprotocol.org/) is the basis for **interoperability** in Cosmos. It leverages Tendermint's instant finality to allow for the transfer of value (token transfers) and communication between heterogeneous chains. Blockchains with different applications and architecture specifications become interoperable whether or not they share a validator set.

Without IBC the interoperability of heterogeneous chains is difficult to achieve because they may implement the consensus, networking, and application layers in different ways. As soon as a blockchain is compatible with IBC, it becomes interoperable with other blockchains.

Cosmos implements a **modular architecture with two blockchain classes**: **hubs** and **zones**.

<H5PComponent :contents="['/h5p/M1_zones_hubs']"></H5PComponent>

**Zones** are heterogeneous blockchains carrying out the authentication of accounts and transactions, the creation and distribution of tokens, and the execution of changes to the chain. **Hubs** connect these so-called zones. Hubs are blockchains designed to connect zones. Once a zone connects to a hub through an IBC connection, it gets automatic access to the other zones connected to the hub. At this point, data and value can be sent and received between the zones without risk of, for example, double-spending tokens. This helps reduce the number of chain-to-chain connections that need to be established for interoperability.

There is no enforcement of an actual topology. A hub can be understood as a zone with many connections to other zones. Application zones can be expected to join the hubs in the ecosystem, but they are free to coalesce into any topology the developers find appropriate.

<HighlightBox type="tip">

If you want more detailed information on hubs and zones on the mainnet and in the testnet check out this [map of zones](https://mapofzones.com/).

</HighlightBox>

The **[Cosmos Hub](https://hub.cosmos.network/main/hub-overview/overview.html)** was the first hub created. It is a public Proof-of-Stake (PoS) blockchain with a native token, ATOM. The Cosmos Hub can be understood as a router facilitating transactions between the chains connected to it. The Cosmos Hub allows, for example, for transaction fees to be paid in different tokens as long as the zone trusts the Cosmos Hub and the other zones connected to it.

_How do we connect our chain to a non-Tendermint chain?_ The IBC connection is not limited to Tendermint-based chains. If the other, non-Tendermint chain is a blockchain using a fast-finality consensus algorithm, the connection can be established by adapting IBC to work with the non-Tendermint consensus mechanism.

If the other chain is a **probabilistic-finality chain**, a simple adaptation of IBC is not sufficient. A proxy chain called a **peg-zone** helps establish interoperability. Peg-zones are fast-finality blockchains tracking chain states to establish finality. The peg-zone chain itself is IBC-compatible and acts as the **bridge** between the rest of the IBC network's chains and the probabilistic-finality chain.

<HighlightBox type="info">

A peg-zone implementation exists for Ethereum and is named the **[Gravity Bridge](https://github.com/cosmos/gravity-bridge)**. For more information on bridges and the Gravity bridge, have a look at the section [Bridges](../2-main-concepts/bridges.md).

</HighlightBox>

<!-- Put back in later.

## Atlas: Cosmos SDK module registry and node explorer

<HighlightBox type="info">

Want to learn more about modules in the Cosmos SDK? Check out the [Modules section in the Main Concepts chapter](../2-main-concepts/modules.md).

</HighlightBox>

[Atlas](https://atlas.cosmos.network/) implements a registry for such modules. Developers can publish, update and download Cosmos SDK modules with Atlas. It is a helpful tool for developers who wish to get an overview of existing modules when developing their applications.

Atlas also offers a [node explorer](https://atlas.cosmos.network/nodes) that lets you crawl through nodes of a Tendermint-based network to discover its topology and the nodes' metadata.

<HighlightBox type="tip">

Take a look at the [node explorer documentation](https://github.com/cosmos/atlas/blob/main/docs/node-explorer.md) to dive deeper.

</HighlightBox>

-->

## Ignite CLI: building application-specific blockchains with one command

[Ignite CLI](https://ignite.com/cli) is a developer-friendly, command-line interface (CLI) tool for application-specific blockchains building on Tendermint and the Cosmos SDK. The CLI tool offers everything developers need to build, test, and launch a chain. It accelerates blockchain development by scaffolding and assembling all components needed for a production-ready blockchain. Ignite CLI makes the process from initial idea to production 95% faster. It lets you build a blockchain in minutes. This lets developers focus more strongly on the business logic of their application.

With Ignite CLI developers can:

* Create a modular blockchain written in Go with a single command.
* Start a development server to experiment with token creation and allocation, as well as module configuration.
* Allow for inter-chain token transfers by using its built-in IBC relayer to send value and data to different chains.
* Benefit from a fast-developed frontend with automatically generated APIs and web pages in JavaScript, TypeScript and Vue.

<HighlightBox type="tip">

Have a look at the official [Ignite CLI documentation](https://docs.ignite.com/) and the section on [Ignite CLI in the My Own Cosmos Chain chapter](../4-my-own-chain/ignitecli.md).

</HighlightBox>

When you scaffold with Ignite CLI, things like key management, creating validators, and transferring tokens can be done through the CLI.

## CosmWasm: Multi-chain smart contracts

[CosmWasm](https://cosmwasm.com/) is a multi-chain platform to build robust dApps for Cosmos using smart contracts. It builds on Tendermint and the Cosmos SDK. Its key features are:

* Mature tools for the development and testing of smart contracts
* Close integration with the Cosmos SDK and ecosystem
* A secure architecture to avoid attack vectors

With CosmWasm, smart contracts can run on multiple chains with the help of the IBC protocol. It adds further flexibility for developers and makes smart contract development faster. CosmWasm is written as a module to be plugged into the Cosmos SDK and leverages the speed of Wasm and the power of Rust.

<HighlightBox type="tip">

For a deeper dive, have a look at the [CosmWasm documentation](https://docs.cosmwasm.com/docs/1.0/).

</HighlightBox>

## The possibility of using alternative blockchain frameworks and SDKs

As the Cosmos SDK is modular, developers can port existing codebases in Go on top of the SDK. This allows developers to build on Cosmos without having to compromise too much on the toolset and environment used.

For example, with [Ethermint](https://github.com/tharsis/ethermint) developers can use the Ethereum Virtual Machine (EVM) from the main Go Ethereum client as a Cosmos SDK module, which is compatible and combinable with existing modules.

<HighlightBox type="info">

Ethermint is a software developed to port the EVM into a Cosmos module. It makes scalable, high-throughput, PoS blockchains possible. These are fully compatible with Ethereum and the Cosmos SDK.

Ethermint is Web3 compatible and achieves high throughput with Tendermint and horizontal scaling with IBC. It provides a Web3, JSON-RPC layer to interact with Ethereum clients and tooling.

For more on Ethermint consult the [Etheremint documentation](https://github.com/cosmos/ethermint).

</HighlightBox>

All Ethereum tools, such as Truffle and Metamask, are compatible with Ethermint. Developers can even port their Solidity smart contracts to interact with the Cosmos ecosystem. Building a chain is not necessary to develop Cosmos-compatible smart contracts. It can be all done with Ethermint. While Ethermint allows running vanilla Ethereum as a Cosmos application-specific blockchain, developers benefit from the Tendermint BFT.

## Next up

Are you ready to get some ATOM? Find out all about the Cosmos Hub's native token and how to stake ATOM in the [next section](./atom-staking.md).
