---
title: "Cosmos Ecosystem II"
order: 4
description: Cosmos SDK
tag: fast-track
---

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




# The possibility of using alternative blockchain frameworks and SDKs

As the Cosmos SDK is modular, developers can port existing codebases in Go on top of the SDK. This allows developers to build on Cosmos without having to compromise too much on the toolset and environment used.

For example, with [Ethermint](https://github.com/tharsis/ethermint) developers can use the Ethereum Virtual Machine (EVM) from the main Go Ethereum client as a Cosmos SDK module, which is compatible and combinable with existing modules.

<HighlightBox type="info">

Ethermint is a software developed to port the EVM into a Cosmos module. It makes scalable, high-throughput, PoS blockchains possible. These are fully compatible with Ethereum and the Cosmos SDK.

Ethermint is Web3 compatible and achieves high throughput with Tendermint and horizontal scaling with IBC. It provides a Web3, JSON-RPC layer to interact with Ethereum clients and tooling.

For more on Ethermint consult the [Etheremint documentation](https://github.com/cosmos/ethermint).

</HighlightBox>

All Ethereum tools, such as Truffle and Metamask, are compatible with Ethermint. Developers can even port their Solidity smart contracts to interact with the Cosmos ecosystem. Building a chain is not necessary to develop Cosmos-compatible smart contracts. It can be all done with Ethermint. While Ethermint allows running vanilla Ethereum as a Cosmos application-specific blockchain, developers benefit from the Tendermint BFT.



## The Cosmos SDK

Developers create the application layer using the **Cosmos SDK**. The Cosmos SDK provides:

<Accordion :items="
    [
        {
            title: 'A scaffold to get started',
            description: 'The Cosmos SDK provides a head start and a framework for getting started'
        },
        {
            title: 'A rich set of modules',
            description: 'The Cosmos SDK provides a rich set of modules that address common concerns such as governance, tokens, other standards, and interactions with other blockchains through the Inter-Blockchain Communication Protocol (IBC).'
        }
    ]
"/>

The creation of an application-specific blockchain with the Cosmos SDK is largely a process of selecting, configuring, and integrating well-solved modules also known as composing modules. This greatly reduces the scope of original development required as development is mostly focused on the truly novel aspects of the application.

<HighlightBox type="info">

The Inter-Blockchain Communication Protocol (IBC) is a common framework for exchanging information between blockchains. For now, it is enough to know that it exists and it enables seamless interaction between blockchains that want to transfer value (token transfers) and exchange information. It enables communication between applications that run on separate application-specific blockchains.

We will dive further into the Inter-Blockchain Communication Protocol (IBC) in a [later section of this chapter](./ibc.md).

</HighlightBox>

The application, consensus, and network layers are contained within the custom blockchain node that forms the foundation of the custom blockchain.

Tendermint passes confirmed transactions to the application layer through the **Application Blockchain Interface (ABCI)**. The application layer must implement ABCI, which is a socket protocol. Tendermint is unconcerned with the interpretation of transactions and the application layer can be unconcerned with propagation, broadcast, confirmation, network formation, and other lower-level concerns that Tendermint attends to unless it wants to inspect such properties.

Developers are free to create blockchains in any language that supports sockets since the ABCI is a socket protocol, provided their application implements ABCI. ABCI defines the boundary between replication concerns and the application, which is a state machine.

This is itself a considerable step forward that simplifies the creation of unique blockchains.

<HighlightBox type="info">

If you want to continue exploring ABCI, you can find more detailed information here:

* [ABCI GitHub repository: ABCI prose specification](https://github.com/tendermint/abci/blob/master/specification.md)
* [Tendermint GitHub repository: A Protobuf file on types](https://github.com/tendermint/abci/blob/master/types/types.proto)
* [Tendermint GitHub repository: A Go interface](https://github.com/tendermint/abci/blob/master/types/application.go)
* [The Tendermint Core documentation](https://docs.tendermint.com/)

</HighlightBox>

## Next up
