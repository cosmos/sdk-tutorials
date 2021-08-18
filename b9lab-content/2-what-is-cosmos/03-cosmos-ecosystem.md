# The Cosmos Ecosystem

**Cosmos** is a **network of indpendent blockchains**. All powered by consensus algorithms with Byzantine Fault-Tolerance (BFT) and connected through an inter-blockchain communication protocol allowing for value exchanges (i.e. token transfers) between blockchains without the need of involving exchanges and changes to the chain's sovereignty. As such, Cosmos is not comparable to a blockchain product per se, but rather is an ecosystem of blockchains.

## A Whole Universe to Discover - Tokens, Wallets, Apps, and Services

Cosmos is an ever-expanding ecosystem of tokens, wallets, and interconnected apps and services, all built for a decentralized future.

Currently, almost $100 billion in digital assets are under management and secured by Cosmos. Digital assets building on Cosmos can be fungible and non-fungible tokens. To conduct settlements, bespoke issuance, and inflation/deflation in-application tokens can be issued.

Among the tokens secured by Cosmos is the [Binance Coin](https://www.binance.com/en/bnb), [Terra](https://www.terra.money/), and of course, ATOM.

Token issuance on Cosmos is attractive due to the flexibility developers have. Usually, building on a blockchain leads to inheriting its constraints. In Cosmos, as developers build an application-specific blockchai, they decide on the constraints. So to say, constraints are self-imposed instead of being external.

In addition to the vast number of tokens, a variety of applications and services, as well as wallets, and explorers are based on Cosmos.

Curently, 249 applications and services build on Cosmos. Most applications and projects deal with finance, closely followed by infrastructure. Privacy, marketplace, social impact, and social applications and projects are less common.

--> incude in tip box
Do you want to take a look at the current list of applications and services built on Cosmos? Take a look at the [Cosmos ecosystem overview](https://cosmos.network/ecosystem/apps/?ref=cosmonautsworld)!
--> end of tip box

Deployment on the mainnet has been conducted for the majority of applications and projects. The rest is currently either in proof of concept, development, or was just deployed to the testnet.

Moreover, 33 wallets and block explorers for Cosmos are part of the ecosystem. Most are Android (such as the [Atomic Walllet](https://atomicwallet.io/) and [Coinex]()) or iOS wallets (like [AirGap](https://airgap.it/) and [Wallet.io](https://walletio.io/)), but there are also a number of web wallets (like [EXODUS](https://www.exodus.com) and [Keplr](https://wallet.keplr.app/)).

## Main Components

The main aim of the Cosmos network is to provide an **ecosystem for easy blockchain development** based on the Tendermint BFT and the so-called [Cosmos SDK](https://v1.cosmos.network/sdk).

Each chain in the Cosmos ecosystem relies on **BFT consensus algorithms**, such as the [Tendermint](https://github.com/tendermint/tendermint) consensus. This ensures a common consensus mechanism at work in all chains build on the Cosmos SDK.

--> Include as info box
Tendermint is a BFT consensus algorithm and a consensus engine. It is a Replicated State Machine (RSM) that helps replicating an application on several machines. As such, it guarantees BFT properties for distributed systems and their applications.

It does this in:

* a **secure** manner - Tendermint continues working even if up to 1/3 of machines fail, and
* a **consistent** way - every machine computes the same state and accesses the same transaction log.

Tendermint is widely used across the industry and the most mature BFT consensus engine for Proof-of-Stake (PoS) blockchains. It is used in case of the [Cosmos Hub](https://hub.cosmos.network/main/hub-overview/overview.html), [IRIS Hub](https://www.irishub.rw/), [Binance Chain](https://www.binance.org/en), [Terra](https://www.terra.money/), and [Kava](https://www.kava.io/).

For more on Tendermint, a look into this [introduction](https://docs.tendermint.com/master/introduction/what-is-tendermint.html) can be very helpful.
--> End info box

Until Cosmos came along, developing a smart contract was much easier than building a whole new chain. With the Cosmos SDK, entire flexible, secure, high performance, and sovereign **application-specific blockchains** can be developed. To allow this, building modular, adaptable, and interchangeable open source development tools is at the center of Cosmos.

--> Include in a tip box
If you want to explore more on application-specific blockchains, take a look at the section on **[A Blockchain App Architecture]()**.
--> Include link to mod. 2, section 1
--> End of tip box

Focusing on customizability and interoperability leads to establishing a stable universe determined by the same rules that apply to the whole ecosystem equally.

## The Cosmos SDK - Modularity and Customizing

The Cosmos SDK can be understood as a generalized framework to build secure blockchain applications on the Tendermint BFT in Golang. It is a modular framework for application-specific blockchains. The design bases itself on **two major principles**: modularity and capability-based security.

The SDK was envisioned to be an npm-like framework for secure applications on top of Tendermint. It has become an advanced framework for custom application-specific blockchains.

The aim of the SDK is to create an ecosystem of components that not only help spin up a application-specific blockchain but also are customizable. With the SDK, developers do not longer have to code every part of the blockchain. The Cosmos SDK includes tools to build command-line interfaces (CLIs), REST servers, and utility libraries.

The ready-built modules of the Cosmos SDK can be easily used - It is as simple as importing modules into the application. Additionally, developers can create own modules to introduce specific functionalities. It is expected that with network development the number of modules will grow facilitating more complex application development.

*Building on modular components? Those it sounds like an increased potential for attacks, and faulty and malicious nodes undetectedly operating? One does not have to worry.*

The Cosmos SDK is the foundation of an [object-capability system](https://docs.cosmos.network/master/core/ocap.html). It not only favors modularity, it also encapsultaes code implementation. Thus, capabilities constrain security boundaries between modules.

The default consensus mechanism available to build with the SDK is [Tendermint Core](https://docs.tendermint.com/master/).

## The Inter-Blockchain Communication Protocol

The [Inter-Blockchain Communication (IBC) protocol](https://ibcprotocol.org/) is the basis for **interoperability** in Cosmos. It leverages Tendermint's instant finalty to allow for the transfer of value (i.e. tokens) and data between heterogenous chains. Blockchains with different applications and architecture specifications become interoperable through a shared validator set.

Interoperability of heterogenous chains is difficult to achieve as they can differently implement the consensus, networking, and application layers. As soon as a blockchain is compatible with IBC the chains are interoperable. IBC has few requirements to make a chain compatible: Mainly, the consensus layer must have fast and absolute finality.

*How can a network of blockchains be created?*

One could connect each blockchain with the other chains through direct IBC connections. This would lead to a very large number of connections in the network because the number of connections in the network increases quadratically with the number of blockchains.

To reduce the number of connections necessary, one could introduce an intermediate entity that facilitates the transfer between chains. This would bring back centralization.

*How could this function be decentralized then?* Why not connect the blockchains with eachother by using a blockchain to handle interoperability? This is the road Cosmos took.

Cosmos implements a **modular architecture with two blockchain classes**: **Hubs** and **Zones**.

**Zones** are heterogenous blockchains carrying out the authentication of accounts and transactions, the creation and distribution of tokens, and the execution of changes to the chain.

**Hubs** connecy these so-called Zones. Hubs are blockchains designed to connect the heterogenous blockchains, i.e. Zones. Once a Zone connects to a Hub through an IBC connection, automatic access between the Zones connected to the Hub becomes possible. Now, data and value can be send and received between the Zones without the risk of double-spending tokens. This limits the number of connections that need to be established for interoperability.

An example of such a specific chain is the **[Cosmos Hub](https://hub.cosmos.network/main/hub-overview/overview.html)**. It was the first Hub to be created. It is a public, Proof-of-Stake (PoS) blockchain with a native token, ATOM. The Cosmos Hub can be understood as a router facilitating, among others, transactions between the Cosmos' chains. For example, transction fees can be paid in different tokens as long as the Zone trusts the Cosmos Hub and the other Zones connected to it.

*How is the bridge established when we are dealing with a non-Tendermint chain?* The IBC connection is not limited to Tendermint-based chains.

When it comes to **fast-finality chains**, i.e. blockchains using fast-finality consensus algorithms, they connection can be established by adapting IBC to work with the consensus mechanism.

In case of **probabilistisic-finality chains**, blockchains without fast finality like those relying on PoW, a simple adaptation of IBC is not sufficient. Instead, a proxy-chain, a so-called **Peg-Zone**, helps establish interoperability. Peg-Zones are blockchains tracking chain states to establish finality. The Peg-Zone chain is IBC-compatble due to its fast-finality and establishes the bridge between the Cosmos network, its chains, and the probabilistic-finality chain.

One such Peg-Zone implementation for Ethereum is the **Gravity DEX bridge**.

## Atlas - Cosmos SDK Module Registry and Node Explorer

The Cosmos SDK draws its modularity from so-called modules, that define most of the applications logic.

--> add in info box
Want to learn more about modules in the Cosmos SDK? Check out the [corresponding section](includelinktosection)!
--> end of info box

[Atlas](https://atlas.cosmos.network/) implements a registry for such modules. In it, developers can publish and update Cosmos SDK modules. It is a very helpful tool for developers that wish to get an overview of all existing modules to develop their own application.

Additionally, Atlas offers a [node explorer](https://atlas.cosmos.network/nodes) and provides Tendermint node crawling functionality allowing to explore Tendermint-based networks in regard to the type of nodes in the networks.

--> include in tip box
If you want to dive deeper into the node explorer, take a look at the [documentation](https://github.com/cosmos/atlas/blob/main/docs/node-explorer.md).
--> end tip box

## Starport - Building Application-Specific Blockchains with one command

[Starport](https://cosmos.network/starport/) is a developer-friendly CLI tool for application-specific blockchains building on Tendermint and the Cosmos SDK. The CLI tool offers everything developers need to build, test, and launch a chain. It accelerates blockchain development by scaffolding and assembling all components needed for a production-ready blockchain - It makes the process from initial idea to production 95% faster as you can build a blockchain in minutes. This allows greater focus on the business logic of an application.

With Starport developers can:

* create a modular blockchain written in Go with a single command,
* start a development server to experiment with token creation and allocation, as well as module configuration,
* allow for inter-chain token transfers by using its built-in IBC relayer to send value and data to different chains, and
* benefit of a fast-developed Front-end with automatically generated APIs in JavaScript, TypeScript, and Vue.

--> Include in tip box
Already want to dive deep into Starport? Take a closer look into the [official documentation](https://docs.starport.network/).
--> end tip box

When you scaffold with Starport, key management, creating validators, and transferring tokens can be done through the CLI.

## CosmWasm - Multi-Chain Smart Contracts

[CosmWasm](https://cosmwasm.com/) is a multi-chain smart contracting platform to build rebust dApps for Cosmos. It builds on Tendermint and the Cosmos SDK.

It key features are:

* mature tools for the development and testing of smart contracts,
* close integration with the Cosmos SDK and ecosystem, and
* secure architecture to avoid attack vectors.

With CosmWasm, smart contracts can run on multiple chains with the help of the IBC protocol. It adds further flexibility for developers and makes smart contract development faster.

CosmWasm is written as a module to be plugged into the Cosmos SDK while leveraging the speed of Wasm and the power of Rust.

--> include as tip box
For a deeper dive, see the [CosmWasm documentation](https://docs.cosmwasm.com/docs/0.14/)
--> end tip box

## Alternative blockchain frameworks and SDKs - Overview: The ecosystem and alternative frameworks

As the Cosmos SDK is modular, developers can port existing codebases in Go on top of the SDK. This gives developers the opportunity to build on Cosmos without having to comprise too much on the tool set and environment used.

For example, with [Ethermint](https://github.com/cosmos/ethermint) developers can port the EVM to make it a Cosmos SDK module compatible and combinable with existing modules. Thus, Ethermint blockchains are compatible with Cosmos.

--> add in info box
Ethermint is a software developed to port the EVM into a Cosmos module. It makes scalable, high-throughput, PoS blockchains possible. These are fully compatible with Ethereum and the Cosmos SDK.

It is Web3 compatible, achieves a high throughput with Tendermint, and horizontal scaling with IBC. It provides a Web3, JSON-RPB layer to interact with Ethereum clients and tooling.

For more on Etheremint, consult the [documentation](https://github.com/cosmos/ethermint).
--> end info box

All Ethereum tools, such as Truffle and Metamask are compatible with Etheremint. Developers can even port their smart contracts to interact with the Cosmos ecosystem. Building a chain is not necessary to develop Cosmos-compatible smart contracts, it can be all done with Ethermint.

While Ethermint allows running Vanilla Ethereum as a Cosmos application-specific blockchain, developers benefit from the Tendermint BFT.
