---
title: "Modules"
order: 6
description: Core Cosmos SDK modules and their components
tag: deep-dive
---

# Modules

## Overview

Each Cosmos chain is a purpose-built/application-specific blockchain and Cosmos SDK modules define the unique properties of each chain. Modules can be considered state machines within the larger state machine. They contain the storage layout, also known as the state, and the state transition functions which are the message methods.

In summary, modules define most of the logic of Cosmos SDK applications.

![Transaction message flow to modules](./images/message_progressing.png)

When a transaction is relayed from the underlying Tendermint consensus engine, `BaseApp` decomposes the `Messages` contained within the transaction. `BaseApp` routes messages to the appropriate module for processing. Interpretation and execution occur when the appropriate module message handler receives the message.

Developers compose modules together using the Cosmos SDK to build custom application-specific blockchains.

## Module scope

Modules include **core** functionality that provides the basic functionality every blockchain node needs:

* A boilerplate implementation of the Application Blockchain Interface (ABCI) that communicates with the underlying Tendermint consensus engine.
* A general-purpose data store that persists the module state called `multistore`.
* A server and interfaces to facilitate interactions with other modules.

Modules implement the majority of the application logic while the **core** attends to wiring and infrastructure concerns and enables modules to be composed into higher-order modules.

A module defines a subset of the overall state using one or more key/value stores, known as `KVStore`, and a subset of message types that are needed by the application and do not exist yet. Modules also define interactions with other modules that do already exist.

For developers, most of the work involved in building an SDK application revolves around building custom modules required by their application that do not exist yet and integrating them with modules that do already exist into one coherent application.

## Module components

It is a best practice to define a module in the `x/moduleName` folder, not to be confused with the SDK’s `x/` folder that already exists. For example, the module called Checkers would go in `x/checkers`.

Modules implement several concerns:

* **Interfaces:** facilitate communication between modules and composition of multiple modules into coherent applications.
* **Protobuf:** one `Msg` service to handle messages and one `gRPC` query service to handle queries.
* **Keeper:** defines the state and presents methods for updating and inspecting the state.

### Interfaces

Modules implement three application module interfaces:

* **AppModuleBasic:** implements non-dependant elements of the module.
* **AppModule:** interdependent, specialized elements of the module that are unique to the application.
* **AppModuleGenesis:** interdependent, genesis (initialization) elements of the module that establish the initial state of the blockchain at inception.

`AppModule` and `AppModuleBasic` are defined in `module.go`.

### Protobuf services

Each module defines two Protobuf services:

* **`Msg`:** a set of RPC methods related 1:1 to Protobuf request types to handle messages.
* **Query:** gRPC query service to handle queries.

<HighlightBox type="info">

If the topic is new to you, check out this [introduction to Protobuf services](https://www.ionos.com/digitalguide/websites/web-development/protocol-buffers-explained/).

</HighlightBox>

#### `Msg` service

For `Msg`, keep the following best practices in mind:

* Define the `Msg` Protobuf service in the `tx.proto` file.
* Each module should implement the `RegisterServices` method as part of the `AppModule` interface.
* Service methods should use a "Keeper" that defines the storage layout and presents methods for updating the state to implement state updates.

#### gRPC query service

A couple of general points on the gRPC query service:

* It allows users to query the state using gRPC.
* Each gRPC endpoint corresponds to a service method, starting with the rpc keyword, inside the gRPC query service.
* It can be configured under the `grpc.enable` and `grpc.address` fields in `app.toml`.
* It is defined in the module’s Protobuf definition files, specifically inside `query.proto`.

Protobuf generates a `QueryServer` interface for each module containing all the service methods. Modules implement this `QueryService` interface by providing the concrete implementation of each service method. These implementation methods are the handlers of the corresponding gRPC query endpoints.  

<HighlightBox type="info">

gRPC is a modern, open-source, high-performance framework that supports multiple languages and is the recommended technique for external clients such as wallets, browsers, and backend services to interact with a node.

</HighlightBox>

gRPC-gateway REST endpoints support external clients that may not wish to use gRPC. The Cosmos SDK provides a gRPC-gateway REST endpoint for each gRPC service.

<HighlightBox type=”info”>

For more on gRPC, take a look at the [gRPC-gateway documentation](https://grpc-ecosystem.github.io/grpc-gateway/).

</HighLightBox>

### Command-line commands

Each module defines commands for a command-line interface (CLI). Commands related to a module are defined in a folder called `client/cli`. The CLI divides commands into two categories, transactions and queries, defined in `tx.go` and `query.go` respectively.

### Keeper

Keepers are the gatekeepers to the module’s store(s). It is mandatory to go through a module’s keeper to access the store(s). A keeper contains the layout of the storage within the store, and methods to update and inspect it.

Other modules may need access to a store, but other modules are also potentially malicious. For this reason, developers need to consider who/what should have access to their module store(s). Only modules that hold the key to a store can access the store.

Keepers are defined in `keeper.go`. Keeper's type definition generally consists of keys to the module's store in the `multistore`, references to other modules' keepers, and a reference to the application's codec.

## Core modules

The Cosmos SDK includes a set of core modules that address common concerns with well-solved, standardized implementations. Core modules address application needs such as tokens, staking, and governance.

Core modules offer several advantages over ad-hoc solutions:

* Standardization is established early, which helps ensure good interoperability with wallets, analytics, other modules, and other Cosmos SDK applications.
* Duplication of effort is significantly reduced because application developers focus on what is unique about their application.
* Core modules are working examples of Cosmos SDK modules that provide strong hints about suggested structure, style, and best practices.

Developers create coherent applications by selecting and composing core modules first and then implementing the custom logic.

<HighlightBox type="tip">

Do you want to explore the core modules? Here you can find a [list of core modules and the application concerns they address](https://github.com/cosmos/cosmos-sdk/tree/master/x).

</HighlightBox>

## Long-running exercise: Use tokens

Let's use tokens to play for money.

## Design principles when building modules

You should keep the following design principles under consideration when building your modules:

* **Composability:** SDK applications are almost always composed of multiple modules. This means developers need to carefully consider the integration of their module not only with the core of the Cosmos SDK but also with other modules. The former is achieved by following standard design patterns outlined in the [Cosmos SDK documentation on modules](https://github.com/cosmos/cosmos-sdk/blob/master/docs/building-modules/intro.md#main-components-of-sdk-modules), while the latter is achieved by properly exposing the store(s) of the module via the keeper.
* **Specialization:** a direct consequence of the composability feature is that modules should be specialized. Developers should carefully establish the scope of their module and not batch multiple functionalities into the same module. This separation of concerns enables modules to be re-used in other projects and improves the upgradability of the application. Specialization also plays an important role in the object-capabilities model of the Cosmos SDK.
* **Capabilities:** Most modules need to read and/or write to the store(s) of other modules. However, in an open-source environment, some modules could be malicious. That is why module developers need to carefully think not only about how their module interacts with other modules but also about how to give access to the module's store(s). The Cosmos SDK takes a capabilities-oriented approach to inter-module security. This means that each store, defined by a module, is accessed by a key, which is held by the module's keeper. This keeper defines how to access the store(s) and under what conditions it is possible. The module's store(s) is accessed by passing a reference to the module's keeper.

## Recommended folder structure

These ideas are meant to be applied as suggestions. Application developers are encouraged to improve and contribute to the module structure and development design.

### Structure

A typical Cosmos SDK module can be structured as follows:

```shell
proto
└── {project_name}
    └── {module_name}
        └── {proto_version}
            ├── {module_name}.proto
            ├── event.proto
            ├── genesis.proto
            ├── query.proto
            └── tx.proto
```
Whereas:

* `{module_name}.proto`: the module's common message type definitions.
* `event.proto`: the module's message type definitions related to events.
* `genesis.proto`: the module's message type definitions related to the genesis state.
* `query.proto`: the module's query service and related message type definitions.
* `tx.proto`: the module's `Msg` service and related message type definitions.

<!-- Here an introductory clause to the code is missing --> 

```shell
x/{module_name}
├── client
│   ├── cli
│   │   ├── query.go
│   │   └── tx.go
│   └── testutil
│       ├── cli_test.go
│       └── suite.go
├── exported
│   └── exported.go
├── keeper
│   ├── genesis.go
│   ├── grpc_query.go
│   ├── hooks.go
│   ├── invariants.go
│   ├── keeper.go
│   ├── keys.go
│   ├── msg_server.go
│   └── querier.go
├── module
│   └── module.go
├── simulation
│   ├── decoder.go
│   ├── genesis.go
│   ├── operations.go
│   └── params.go
├── spec
│   ├── 01_concepts.md
│   ├── 02_state.md
│   ├── 03_messages.md
│   └── 04_events.md
├── {module_name}.pb.go
├── abci.go
├── codec.go
├── errors.go
├── events.go
├── events.pb.go
├── expected_keepers.go
├── genesis.go
├── genesis.pb.go
├── keys.go
├── msgs.go
├── params.go
├── query.pb.go
└── tx.pb.go
```

Whereby:

* `client/`: the module's CLI client functionality implementation and the module's integration testing suite.
* `exported/`: the module's exported types - typically interface types. If a module relies on keepers from another module, it is expected to receive the keepers as interface contracts through the `expected_keepers.go` file (see below) to avoid a direct dependency on the module implementing the keepers. However, these interface contracts can define methods that operate on and/or return types that are specific to the module implementing the keepers. This is where `exported/` comes into play. The interface types that are defined in `exported/` use canonical types, allowing for the module to receive the keepers as interface contracts through the `expected_keepers.go` file. This pattern allows for code to remain DRY and also alleviates import cycle chaos.
* `keeper/`: the module's `Keeper` and `MsgServer` implementation.
* `module/`: the module's `AppModule` and `AppModuleBasic` implementation.
* `simulation/`: the module's [simulation](./simulator.html) package defines functions used by the blockchain simulator application (`simapp`).
* `spec/`: the module's specification documents outlining important concepts, state storage structure, and message and event type definitions.
* The root directory includes type definitions for messages, events, and genesis state, including the type definitions generated by Protocol Buffers:
    * `abci.go`: the module's `BeginBlocker` and `EndBlocker` implementations - this file is only required if `BeginBlocker` and/or `EndBlocker` need to be defined.
    * `codec.go`: the module's registry methods for interface types.
    * `errors.go`: the module's sentinel errors.
    * `events.go`: the module's event types and constructors.
    * `expected_keepers.go`: the module's [expected keeper](./keeper.html#type-definition) interfaces.
    * `genesis.go`: the module's genesis state methods and helper functions.
    * `keys.go`: the module's store keys and associated helper functions.
    * `msgs.go`: the module's message type definitions and associated methods.
    * `params.go`: the module's parameter type definitions and associated methods.
    * `*.pb.go`: the module's type definitions generated by Protocol Buffers - as defined in the respective `*.proto` files above.

## Errors

Modules are encouraged to define and register their errors to provide better context on a failed message or handler execution. Errors should be common or general errors, which can be further wrapped to provide additional specific execution context.

### Registration

Modules should define and register their custom errors in `x/{module}/errors.go`. Registration of errors is handled via the `types/errors` package.

Each custom module error must provide a codespace, which is typically the module name (for example, "distribution") and a uint32 code. Together, the codespace and code provide a globally unique SDK error. Typically, the error code is monotonically increasing but it does not necessarily have to be.

The only restrictions on error codes are the following:

* It must be greater than one, as a code value of one is reserved for internal errors.
* It must be unique within the module.

<HighlightBox type="info">

The SDK provides a core set of common errors. These errors are defined in `types/errors/errors.go`.

</HighlightBox>

### Wrapping

The custom module errors can be returned as their concrete type, as they already fulfill the error interface. However, module errors can be wrapped to provide further context and meaning to failed execution.

Regardless of whether an error is wrapped or not, the SDK's errors package provides an API to determine if an error is of a particular kind via Is.

### ABCI

If a module error is registered, the SDK errors package allows ABCI information to be extracted through the ABCIInfo API. The package also provides `ResponseCheckTx` and `ResponseDeliverTx` as auxiliary APIs to automatically get `CheckTx` and `DeliverTx` responses from an error.

## Long-running exercise

Earlier we mentioned that we want to let players play with money. Here, with the introduction of modules like _Bank_, we can start handling that.

The initial ideas are:

* When creating a game, the wager amount is declared.
* When doing their first move, which is interpreted as "challenge accepted", each player will be billed the amount. If the other player rejects the game, the game times out. Then the first player gets refunded.
* Subsequent moves by a player do not cost anything.
* If a game ends in a win or times out on a forfeit, then the winning player gets double the wager amount.
* If a game ends in a draw, then both players get back their amount.

In terms of code, our `CreateGameMsg struct` needs a `wager: uint32` to be understood in the staking token currency.

We need to decide _where_ the money goes when a player is debited because we do not want the token's total supply to vary because of it. Perhaps we use the concept of _authz account_, or assign it "in the game" if this is possible.
