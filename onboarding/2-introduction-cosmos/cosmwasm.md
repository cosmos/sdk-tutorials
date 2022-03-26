---
title: "Cosmos Ecosystem VII"
order: 9
description: CosmWasm
tag: fast-track
---
https://docs.cosmwasm.com/docs/1.0/
## CosmWasm: Multi-chain smart contracts

[CosmWasm](https://cosmwasm.com/) is a multi-chain platform to build robust dApps for Cosmos using smart contracts. It builds on Tendermint and the Cosmos SDK. Its key features are:

* Mature tools for the development and testing of smart contracts
* Close integration with the Cosmos SDK and ecosystem
* A secure architecture to avoid attack vectors

With CosmWasm, smart contracts can run on multiple chains with the help of the IBC protocol. It adds further flexibility for developers and makes smart contract development faster. CosmWasm is written as a module to be plugged into the Cosmos SDK and leverages the speed of Wasm and the power of Rust.

<HighlightBox type="tip">

For a deeper dive, have a look at the [CosmWasm documentation](https://docs.cosmwasm.com/docs/1.0/).

</HighlightBox>



# CosmWasm

<HighlightBox type="synopsis">

Discover how multi-chain smart contracts become possible with CosmWasm. The following sections are recommended as a preparation:

* [Transactions](../2-main-concepts/transactions.md)
* [Messages](../2-main-concepts/messages.md)
* [Queries](../2-main-concepts/queries.md)

</HighlightBox>

[CosmWasm](https://cosmwasm.com/) offers multi-chain solutions for smart contracts through an actor-model design focused on providing a library.

<ExpansionPanel title="More on the actor model">

The actor model is a design pattern for reliable, distributed systems. It is the pattern underlying CosmWasm smart contracts.

Each actor has access to its own internal state and can only message other actors through a so-called dispatcher, which maintains the state and maps addresses to code and storage.

Want to read more on the actor model? Check out [the CosmWasm documentation on the Actor Model for Contract Calls](https://docs.cosmwasm.com/docs/0.16/architecture/actor).

</ExpansionPanel>

CosmWasm's design makes the code agnostic to the details of underlying chains. It only requires a Cosmos SDK application to embed the `Wasm` module.

CosmWasm is adaptable to different development environments by design and makes it possible to connect chains. It is a solid platform to develop on because:

* If you want to change chains, you can easily transfer smart contracts and decentralized applications (dApps).
* If your application grows, you can launch your chain for the next version of your smart contract. You do not need to compile and deploy the binaries again.

## Next up
