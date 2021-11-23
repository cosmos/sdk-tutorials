# Modules

## Overview

Each Cosmos chain is a purpose-built blockchain and Cosmos SDK modules define the unique properties of each chain. Modules can be considered state machines within the larger state machine. They contain the storage layout, also known as the state, and the state transition functions, which are the message methods.

In summary, modules define most of the logic of Cosmos SDK applications.

![transaction message flow to modules](./images/module_overview.png)

When a transaction is relayed from the underlying Tendermint consensus engine, `BaseApp` decomposes the `Messages` contained within the transaction. `BaseApp` routes messages to the appropriate module for processing. Interpretation and execution occurs when the appropriate module message handler receives the message.

Developers compose modules together using the Cosmos SDK to build custom application-specific blockchains.

## Module Scope

Modules include **core** functionality that provides the basic functionality every blockchain node needs:

* A boilerplate implementation of the Application Blockchain Interface (ABCI) that communicates with the underlying Tendermint consensus engine.
* A general-purpose data store that persists the module state called `multistore`.
* A server and interfaces to facilitate interactions with the node.

Modules implement the majority of application logic while **core** attends to wiring and infrastructure concerns and enables modules to be composed into higher-order modules.

A module defines a subset of the overall state using one or more key/value stores, known as `KVStore`, and a subset of message types that are needed by the application and do not exist yet. Modules also define interactions with other modules that do already exist.

For developers, most of the work involved in building a Cosmos SDK application revolves around building custom modules required by their application that do not exist yet, and integrating them with modules that do already exist into one coherent application. Existing modules can come either from the Cosmos SDK itself or from **third-party developers** and can be downloaded from an online module repository.

## Module Components

It is a best practice to define a module in the `x/moduleName` folder. For example, the module called `Checkers` would go in `x/checkers`. In fact, if you head over to the Cosmos SDK's base code, you can see that it also [defines its modules](https://github.com/cosmos/cosmos-sdk/tree/master/x) in an `x/` folder.

Modules implement several elements:

* **Interfaces:** facilitate communication between modules and the composition of multiple modules into coherent applications.
* **Protobuf:** one `Msg` service to handle messages and one gRPC `Query` service to handle queries.
* **Keeper:** a controller that defines the state and presents methods for updating and inspecting the state.

### Interfaces

To be integrated with the rest of the application, a module must implement three application module interfaces:

* **`AppModuleBasic`:** implements non-dependent elements of the module.
* **`AppModule`:** interdependent, specialized elements of the module that are unique to the application.
* **`AppModuleGenesis`:** interdependent, genesis (initialization) elements of the module that establish the initial state of the blockchain at inception.

You define `AppModule` and `AppModuleBasic`, and their functions, in your module's `x/moduleName/module.go` file.

### Protobuf Services

Each module defines two Protobuf services:

* **`Msg`:** a set of RPC methods related 1:1 to Protobuf request types to handle messages.
* **`Query:`** gRPC query service to handle queries.

<HighlightBox type="info">

If the topic is new to you, here you can find an introduction to [Protocol Buffers](https://www.ionos.com/digitalguide/websites/web-development/protocol-buffers-explained/).

</HighlightBox>

### `Msg` service

* A best practice is to define the `Msg` Protobuf service in the `tx.proto` file.
* Each module should implement the `RegisterServices` method as part of the `AppModule` interface. This lets the application know which messages and queries the module can handle.
* Service methods should use a _keeper_, which encapsulates knowledge about the storage layout and presents methods for updating the state.

### gRPC `Query` Service

* A best practice is to define the `Query` Protobuf service in the `query.proto` file.
* Allows users to query the state using gRPC.
* Each gRPC endpoint corresponds to a service method, named with the `rpc` prefix, inside the gRPC `Query` service.
* Can be configured under the `grpc.enable` and `grpc.address` fields in `app.toml`.

For each module, Protobuf generates a `QueryServer` interface containing all the service methods. Modules implement this `QueryServer` interface by providing the concrete implementation of each service method in separate files. These implementation methods are the handlers of the corresponding gRPC query endpoints. This division of concerns across different files makes the setup safe from a re-generation of files by Protobuf.

gRPC is a modern, open-source, high-performance framework that supports multiple languages and is the recommended technique for external clients such as wallets, browsers and backend services to interact with a node.

gRPC-Gateway REST endpoints support external clients that may not wish to use gRPC. The Cosmos SDK provides a gRPC-gateway REST endpoint for each gRPC service.

<HighlightBox type="tip">

Have a look at the [gRPC-Gateway](https://grpc-ecosystem.github.io/grpc-gateway/) documentation.

</HighLightBox>

### Command-Line Commands

Each module defines commands for a command-line interface (CLI). Commands related to a module are defined in a folder called `client/cli`. The CLI divides commands into two categories, transactions and queries, the same as those you defined in `tx.go` and `query.go` respectively.

### Keeper

Keepers are the gatekeepers to the module’s store(s). It is mandatory to go through a module’s keeper in order to access the store(s). A keeper encapsulates the knowledge about the layout of storage within the store and contains methods to update and inspect it. If you come from a module-view-controller (MVC) world, then it helps to think of the keeper as the controller.

Other modules may need access to a store, but other modules are also potentially malicious or poorly written. For this reason, developers need to consider who/what should have access to their module store(s). Additionally, to prevent a module from randomly accessing another module at runtime, a module that needs access to another module needs to declare its intent to use another module at construction. At this point, such a module is granted a runtime key that lets it access the other module. Only modules that hold this key to a store can access the store. This is part of what is called an object-capability model.

Keepers are defined in `keeper.go`. Keeper's type definition generally consists of keys to the module's own store in the `multistore`, references to other modules' keepers and a reference to the application's codec.

## Core Modules

Cosmos SDK includes core modules that address common concerns with well-solved, standardized implementations.

Core modules address application needs such as tokens, staking and governance. Core modules offer several advantages over ad hoc solutions:

* Standardization is established early, which helps ensure good interoperability with wallets, analytics, other modules and other Cosmos SDK applications.
* Duplication of effort is significantly reduced because application developers focus on what is unique about their application.
* Core modules are working examples of Cosmos SDK modules that provide strong hints about suggested structure, style and best practices.

Developers create coherent applications by selecting and composing core modules first, then implementing custom logic.

<HighlightBox type="tip">

Why not explore the [list of core modules and the application concerns they address](https://github.com/cosmos/cosmos-sdk/tree/master/x)?

</HighlightBox>

## Design Principles for Building Modules

* **Composability**: SDK applications are almost always composed of multiple modules. This means developers need to carefully consider the integration of their module not only with the core of the Cosmos SDK, but also with other modules. The former is achieved by following standard design patterns outlined [here](https://github.com/cosmos/cosmos-sdk/blob/master/docs/building-modules/intro.md#main-components-of-sdk-modules), while the latter is achieved by properly exposing the store(s) of the module via the keeper.
* **Specialization**: A direct consequence of the composability feature is that modules should be specialized. Developers should carefully establish the scope of their module and not batch multiple functionalities into the same module. This separation of concerns enables modules to be re-used in other projects and improves the upgradability of the application. Specialization also plays an important role in the object-capability model of the Cosmos SDK.
* **Capabilities**: Most modules need to read and/or write to the store(s) of other modules. However, in an open-source environment, it is possible for some modules to be malicious. That is why module developers need to carefully think not only about how their module interacts with other modules, but also about how to give access to the module's store(s). The Cosmos SDK takes a capabilities-oriented approach to inter-module security. This means that each store defined by a module is accessed by a runtime key, which is held by the module's keeper. This keeper defines how to access the store(s) and under what conditions. Access to the module's store(s) is done by passing a reference to the module's keeper.

## Recommended Folder Structure

These ideas are meant to be applied as suggestions. Application developers are encouraged to improve upon and contribute to module structure and development design.

### Structure

A typical Cosmos SDK module can be structured as follows. First, the serializable data types and Protobuf interfaces:

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

* `{module_name}.proto`: the module's common message type definitions.
* `event.proto`: the module's message type definitions related to events.
* `genesis.proto`: the module's message type definitions related to genesis state.
* `query.proto`: the module's _Query_ service and related message type definitions.
* `tx.proto`: the module's _Msg_ service and related message type definitions.

Then the rest of the code elements:

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

- `client/`: The module's CLI client functionality implementation and the module's integration testing suite.
- `exported/`: The module's exported types - typically interface types. If a module relies on keepers from another module, it is expected to receive the keepers as interface contracts through the `expected_keepers.go` file (see below) in order to avoid a direct dependency on the module implementing the keepers. However, these interface contracts can define methods that operate on and/or return types that are specific to the module that is implementing the keepers and this is where `exported/` comes into play. The interface types that are defined in `exported/` use canonical types, allowing for the module to receive the keepers as interface contracts through the `expected_keepers.go` file. This pattern allows for code to remain [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) and also alleviates import cycle chaos.
- `keeper/`: The module's `Keeper` and `MsgServer` implementations.
- `module/`: The module's `AppModule` and `AppModuleBasic` implementations.
- `simulation/`: The module's [simulation](./simulator.html) package defines functions used by the blockchain simulator application (`simapp`).
- `spec/`: The module's specification documents outlining important concepts, state storage structure, and message and event type definitions.
- The root directory includes type definitions for messages, events, and genesis state, including the type definitions generated by Protocol Buffers.
    - `abci.go`: The module's `BeginBlocker` and `EndBlocker` implementations (this file is only required if `BeginBlocker` and/or `EndBlocker` need to be defined).
    - `codec.go`: The module's registry methods for interface types.
    - `errors.go`: The module's sentinel errors.
    - `events.go`: The module's event types and constructors.
    - `expected_keepers.go`: The module's [expected keeper](./keeper.html#type-definition) interfaces.
    - `genesis.go`: The module's genesis state methods and helper functions.
    - `keys.go`: The module's store keys and associated helper functions.
    - `msgs.go`: The module's message type definitions and associated methods.
    - `params.go`: The module's parameter type definitions and associated methods.
    - `*.pb.go`: The module's type definitions generated by Protocol Buffers (as defined in the respective `*.proto` files above).

## Errors

Modules are encouraged to define and register their own errors to provide better context on failed message or handler execution. Errors should be common or general errors which can be further wrapped to provide additional specific execution context.

<HighlightBox type="tip">

For more details, take a look at the [Cosmos SDK documentation on errors when building modules](https://docs.cosmos.network/master/building-modules/errors.html).

</HighlightBox>

### Registration

Modules should define and register their custom errors in `x/{module}/errors.go`. Registration of errors is handled via the `types/errors` package.

Each custom module error must provide the codespace, which is typically the module name (for example, "distribution") and is unique per module, and a `uint32` code. Together, the codespace and code provide a globally unique Cosmos SDK error. Typically, the error code is monotonically increasing but does not necessarily have to be.

The only restrictions on error codes are the following:

* Must be greater than one, as a code value of one is reserved for internal errors.
* Must be unique within the module.

<HighlightBox type="info">

The Cosmos SDK provides a core set of common errors. These errors are defined in [`types/errors/errors.go`](https://github.com/cosmos/cosmos-sdk/blob/master/types/errors/errors.go).

</HighlightBox>

### Wrapping

The custom module errors can be returned as their concrete type as they already fulfill the error interface. However, module errors can be wrapped to provide further context and meaning to failed execution.

Regardless if an error is wrapped or not, the Cosmos SDK's errors package provides an API to determine if an error is of a particular kind via `Is`.

### ABCI

If a module error is registered, the Cosmos SDK errors package allows ABCI information to be extracted through the `ABCIInfo` API. The package also provides `ResponseCheckTx` and `ResponseDeliverTx` as auxiliary APIs to automatically get `CheckTx` and `DeliverTx` responses from an error.

## Next up

Have a look at the code example below or head straight to the [next section](./09-protobuf) to learn more about Protobuf.

<ExpansionPanel title="Show me some code for my checkers' blockchain">

Now your application is starting to take shape. Let's take a closer look at some further expansions for your project.

## The `checkers` module

When you create your checkers' blockchain application, you can, and ought to, include a majority of the standard modules like `auth`, `bank`, and so on. With the Cosmos SDK boilerplate in place, the _checkers part_ of your checkers application will most likely reside in a single `checkers` module. This is the module that you author.

## Game wager

Earlier the goal was to let players play with _money_. Here, with the introduction of modules like `bank`, you can start handling that.

The initial ideas are:

* When creating a game, the wager amount is declared.
* When doing their first move, which is interpreted as "challenge accepted", each player is billed the amount. The amount should not be deducted on the game creation, as it is good business to first ask for acceptance from the player. If the opponent rejects the game, or the game times out, at this point, then the first player gets refunded.
* Subsequent moves by a player do not cost anything.
* If a game ends in a win or times out on a forfeit, the winning player gets the total wager amount.
* If a game ends in a draw, then both players get back their amount.

How would this look like in terms of code? You need to add the wager to:

* The game:

    ```go
    type StoredGame struct {
        ...
        Wager uint64
    }
    ```

* The message to create a game:

    ```go
    type MsgCreateGame struct {
        ...
        Wager uint64
    }
    ```

## Wager payment

Now, you need to decide how the tokens are being moved. When a player accepts a challenge, the amount is deducted from the player's balance. But where does it go? You could decide to burn the tokens and re-mint them at a later date, but this would make the total supply fluctuate wildly for no apparent benefit.

Fortunately, it is possible to transfer from a player to a module. The module, therefore, acts as the escrow account for all games. So, when playing for the first time, a player would:

```go
import (
    sdk "github.com/cosmos/cosmos-sdk/types"
    bankKeeper "github.com/cosmos/cosmos-sdk/x/bank/keeper"
)

wager := sdk.NewCoin("stake", sdk.NewInt(storedGame.Wager))
payment := sdk.NewCoins(wager)
var bank bankKeeper.Keeper
var ctx sdk.Context
var playerAddress sdk.AccAddress
err := bank.SendCoinsFromAccountToModule(ctx, playerAddress, "checkers", payment)
if err != nil {
    return errors.New("Player cannot pay the wager")
}
```

Notice how `"stake"` identifies the likely name of the base token of your application, the token that is used with the consensus. Conversely, when paying a winner, you would have:

```go
amount := sdk.NewInt(storedGame.Wager).Mul(sdk.NewInt(2))
winnings := sdk.NewCoin("stake", amount)
payment := sdk.NewCoins(winnings)
var winnerAddress sdk.AccAddress
err := bank.SendCoinsFromModuleToAccount(ctx, "checkers", winnerAddress, payment)
if err != nil {
    panic("Cannot pay the winnings to winner")
}
```
As a matter of best practice, notice how:

* When the player cannot pay, it is a _standard_ error, which is _easily_ fixed by the player.
* When the escrow account cannot pay, it is a panic (an internal error) because if the escrow cannot pay it means there is a logic problem somewhere.

Here again, if you want to go beyond these out-of-context code samples and instead see more in detail how to define all this, head to [My Own Chain](../5-my-own-chain/01-index).

</ExpansionPanel>
