# The Cosmos Ecosystem

**Cosmos** is a network of independent blockchains. All powered by consensus algorithms with Byzantine Fault-Tolerance (BFT). All connected through the Inter-Blockchain Communication protocol (IBC) enabling value transfers (e.g. token transfers) and other communication. All this without the need to involve exchanges nor compromise the chains' sovereignty.

More than this, Cosmos is also **a blockchain ecosystem**, complete with protocols, SDK, tokens, wallets, applications, repositories, services, and tools.

Let's review them.

## A Whole Universe to Discover - Tokens, Wallets, Apps, and Services

Fittingly, Cosmos is an ever-expanding ecosystem of tokens, wallets, tools, and interconnected apps and services, all built for the decentralized future.

At the time of writing, almost **$100 billion in digital assets** are under management and secured by Cosmos. Digital assets on Cosmos include fungible and non-fungible tokens (NFT). You can issue in-application tokens to conduct settlements, bespoke issuance, inflation/deflation, and more.

Among the fungible tokens secured by Cosmos are the [Binance Coin](https://www.binance.com/en/bnb), [Terra](https://www.terra.money/), and of course, ATOM. Remember that because they are defined on application-specific blockchains, their developers are free from the constraints of a hypothetical general-purpose blockchain.

In addition to the vast number of tokens, a variety of applications and services, as well as wallets, and explorers are based on Cosmos.

Currently, **hundreds of applications and services** build on Cosmos. At the time of writing, most applications and projects deal with finance, closely followed by infrastructure. Privacy, marketplace, social impact, and social applications and projects are less common.

<HighlightBox type="tip">

Do you want an up-to-date list of applications and services built on Cosmos? Head to the [Cosmos ecosystem overview](https://cosmos.network/ecosystem/apps/?ref=cosmonautsworld)!

</HighlightBox>

As you might expect, not all applications are at the same stage of development. While most applications and projects are deployed on the mainnet, some are currently either in proof of concept, development, or have been deployed to a testnet only.

Moreover, [**33 wallets**](https://cosmos.network/ecosystem/wallets) and block explorers for Cosmos are part of the ecosystem. Most are for Android, such as the [Atomic Wallet](https://atomicwallet.io/) and [Coinex](https://www.coinex.com/), or iOS, like [AirGap](https://airgap.it/) and [Wallet.io](https://walletio.io/), but you can also find a number of web wallets, like [Exodus](https://www.exodus.com) and [Keplr](https://wallet.keplr.app/).

## Main Components

The main aim of the Cosmos network is to provide an **ecosystem for easy blockchain development** based on the Tendermint BFT and the Inter-Blockchain Communication protocol (IBC) thanks to the so-called [Cosmos SDK](https://v1.cosmos.network/sdk).

Each chain in the Cosmos ecosystem relies on the Tendermint **fast-finality BFT consensus algorithm**. This ensures a common consensus mechanism at work in all chains of the network. As well as Cosmos, Tendermint is also used in [IRIS Hub](https://www.irishub.rw/), [Binance Chain](https://www.binance.org/en), [Terra](https://www.terra.money/), [Kava](https://www.kava.io/) and more.

Before Cosmos came along, developing a whole new chain was much more difficult and expensive than building a smart contract. Now, with the Cosmos SDK, entire flexible, secure, high performance, and sovereign **application-specific blockchains** can be developed. To allow this, building modular, adaptable, and interchangeable open-source development tools is at the center of Cosmos' mission.

<HighlightBox type="tip">

If you want to explore more on application-specific blockchains, take a look at the section on **[A Blockchain App Architecture]()**.
--> Include link to mod. 2, section 1

</HighlightBox>

Focusing on customizability and interoperability leads to establishing a stable universe determined by the same rules that apply to the whole ecosystem equally.

--> Include hotspot image of ecosystem

## The Cosmos SDK - Modularity and Customizing

The Cosmos SDK can be understood as a generalized framework to build secure blockchain applications on the Tendermint BFT in Golang. It is a modular framework for application-specific blockchains. The design bases itself on **two major principles**: modularity and capability-based security.

The SDK was envisioned to be an npm-like framework for secure applications on top of Tendermint. It has become an advanced framework for custom application-specific blockchains.

The aim of the SDK is to create an ecosystem of components that not only help spin up an application-specific blockchain but that also are customizable. With the SDK, developers no longer have to code every part of the blockchain. The Cosmos SDK includes tools to build command-line interfaces (CLIs), REST servers, and utility libraries.

The ready-built modules of the Cosmos SDK can be easily used - It is as simple as importing modules into the application. Additionally, developers can create their own modules to introduce specific functionalities. It is expected that, with the growth of the ecosystem, the number of modules will grow, thereby facilitating the development of more complex applications.

*Building on modular components, many of those you did not write yourself? Although it sounds like an increased potential for attacks, and faulty or malicious nodes operating undetected? One does not have to worry.*

The Cosmos SDK is built on a foundation of the [object-capability model](https://docs.cosmos.network/master/core/ocap.html). It not only favors modularity, it also encapsulates code implementation. Thus, capabilities constrain security boundaries between modules.

The default consensus mechanism available to build with the SDK is [Tendermint Core](https://docs.tendermint.com/master/).

## The Inter-Blockchain Communication Protocol

The [Inter-Blockchain Communication (IBC) protocol](https://ibcprotocol.org/) is the basis for **interoperability** in Cosmos. It leverages Tendermint's instant finality to allow for the transfer of value (i.e. tokens) and data communication between heterogenous chains. Blockchains with different applications and architecture specifications become interoperable whether or not they share a validator set.

Without IBC, the interoperability of heterogenous chains is difficult to achieve because they may implement the consensus, networking, and application layers in various ways. As soon as a blockchain is compatible with IBC, it becomes interoperable with others. 

*With these chain-to-chain connections now possible, how can we create a network of blockchains?*

The first naive idea would be to connect each blockchain with the other chains through direct IBC connections. Unfortunately, this would quickly lead to a very large, expensive, and ultimately unmanageable number of connections in the network. In fact, the number of connections in the network would increase quadratically with the number of blockchains.

A second idea, one that **reduces the number of connections necessary** back down to the number of chains, would be to introduce an intermediate entity that facilitates the transfer between chains, in a hub and spoke model. Unfortunately, this would bring back unwelcome centralization.

*How could we uphold decentralization then?*

First, by keeping the capability of chain-to-chain connections made possible by **IBC**. Second, by creating a flexible multi-hub and spoke model whereby a spoke gets automatic access to all the other spokes of the hub it connected to. This is the road **Cosmos** took.

Cosmos implements a **modular architecture with two blockchain classes**: **hubs** and **zones**.

**Zones** are heterogenous blockchains carrying out the authentication of accounts and transactions, the creation and distribution of tokens, and the execution of changes to the chain.

**Hubs** connect these so-called zones. Hubs are blockchains designed to connect heterogenous blockchains, i.e. zones. Once a zone connects to a hub through an IBC connection, it gets automatic access to the other zones connected to the hub. At this point, data and value can be sent and received between the zones without risk, for instance of double-spending tokens. This helps reduce the number of chain-to-chain connections that need to be established for interoperability.

There is no enforcement of an actual topology and a "Hub" is a "zone" with many connections to other zones. The zone referred to as the "Cosmos Hub" is the first instance of a zone and application zones can be expected to join it, but application zones are free to coalesce in any topology the developers find appropriate.

Hubs and zones in testnet: [https://mapofzones.com/](https://mapofzones.com/)

An example of such a specific chain is the **[Cosmos Hub](https://hub.cosmos.network/main/hub-overview/overview.html)**, the first hub to be created. It is a public, Proof-of-Stake (PoS) blockchain with a native token, ATOM. The Cosmos Hub can be understood as a router facilitating, among other things, transactions between the chains connected to it. For example, transaction fees can be paid in different tokens as long as the zone trusts the Cosmos Hub and the other zones connected to it.

*How do we connect our chain to a non-Tendermint chain?* In fact, the IBC connection is not limited to Tendermint-based chains.

If the other non-Tendermint chain is a **fast-finality chain**, i.e. a blockchain using a fast-finality consensus algorithm, the connection can be established by adapting IBC to work with the non-Tendermint consensus mechanism.

If the other chain is a **probabilistic-finality chain**, i.e. a blockchain without fast finality like those relying on Proof-of-Work (PoW), a simple adaptation of IBC is not sufficient. Instead, a more elaborate setup is required. More precisely, a proxy-chain, a so-called **peg-zone**, helps establish interoperability. Peg-zones are fast-finality blockchains tracking chain states to establish finality. The peg-zone chain itself is IBC-compatible and acts as the **bridge** between the rest of the IBC network, i.e. its blockchains, and the probabilistic-finality chain.

One such peg-zone implementation exists for Ethereum and is named the **Gravity Bridge**.

## Atlas - Cosmos SDK Module Registry and Node Explorer

The Cosmos SDK draws its modularity from so-called modules, which define most of the application's logic.

<HighlightBox type="info">

Want to learn more about modules in the Cosmos SDK? Check out the [corresponding section](includelinktosection)!

</HighlightBox>

[Atlas](https://atlas.cosmos.network/) implements a registry for such modules. With it, developers can publish, update, and download Cosmos SDK modules. It is a helpful tool for developers who wish to get an overview of existing modules when developing their own application.

Additionally, Atlas offers a [node explorer](https://atlas.cosmos.network/nodes) that lets you crawl through nodes of a Tendermint-based network so as to discover its topology and the nodes' metadata.

<HighlightBox type="tip">

If you want to dive deeper into the node explorer, take a look at its [documentation](https://github.com/cosmos/atlas/blob/main/docs/node-explorer.md).

</HighlightBox>

## Starport - Building Application-Specific Blockchains with one command

[Starport](https://cosmos.network/starport/) is a developer-friendly command-line interface (CLI) tool for application-specific blockchains building on Tendermint and the Cosmos SDK. The CLI tool offers everything developers need to build, test, and launch a chain. It accelerates blockchain development by scaffolding and assembling all components needed for a production-ready blockchain. Starport makes the process from initial idea to production 95% faster, i.e. lets you build a blockchain in minutes. This lets developers focus more strongly on the business logic of their application.

With Starport developers can:

* Create a modular blockchain written in Go with a single command;
* Start a development server to experiment with token creation and allocation, as well as module configuration;
* Allow for inter-chain token transfers by using its built-in IBC relayer to send value and data to different chains;
* Benefit from a fast-developed front-end with automatically generated APIs and web pages in JavaScript, TypeScript, and Vue.

<HighlightBox type="tip">

Already want to dive deep into Starport? Take a closer look into the official [Starport documentation](https://docs.starport.com/).

</HighlightBox>

When you scaffold with Starport, things like key management, creating validators and transferring tokens can be done through the CLI.

## CosmWasm - Multi-Chain Smart Contracts

[CosmWasm](https://cosmwasm.com/) is a multi-chain platform for building robust DApps for Cosmos using smart contracts. It builds on Tendermint and the Cosmos SDK.

Its key features are:

* Mature tools for the development and testing of smart contracts,
* Close integration with the Cosmos SDK and ecosystem, and
* A secure architecture to avoid attack vectors.

With CosmWasm, smart contracts can run on multiple chains with the help of the IBC protocol. It adds further flexibility for developers and makes smart contract development faster.

CosmWasm is written as a module to be plugged into the Cosmos SDK, and leverages the speed of Wasm and the power of Rust.

<HighlightBox type="tip">

For a deeper dive, see the [CosmWasm documentation](https://docs.cosmwasm.com/docs/)

</HighlightBox>

## The Possibility of Using Alternative Blockchain Frameworks and SDKs

As the Cosmos SDK is modular, developers can port existing codebases in Go on top of the SDK. This gives developers the opportunity to build on Cosmos without having to comprise too much on the tool set and environment used.

For example, with [Ethermint](https://github.com/cosmos/ethermint) developers can use the Ethereum Virtual Machine (EVM) from the main Go Ethereum client as a Cosmos SDK module compatible and combinable with existing modules. Thus, Ethermint blockchains are compatible with Cosmos.

<HighlightBox type="info">

Ethermint is a software developed to port the EVM into a Cosmos module. It makes scalable, high-throughput, PoS blockchains possible. These are fully compatible with Ethereum and the Cosmos SDK.

It is Web3 compatible, achieves a high throughput with Tendermint, and horizontal scaling with IBC. It provides a Web3, JSON-RPC layer to interact with Ethereum clients and tooling.

For more on Ethermint, consult the [documentation](https://github.com/cosmos/ethermint).

</HighlightBox>

All Ethereum tools, such as Truffle and Metamask are compatible with Ethermint. Developers can even port their Solidity smart contracts to interact with the Cosmos ecosystem. Building a chain is not necessary to develop Cosmos-compatible smart contracts, it can be all done with Ethermint.

While Ethermint allows running Vanilla Ethereum as a Cosmos application-specific blockchain, developers benefit from the Tendermint BFT.
