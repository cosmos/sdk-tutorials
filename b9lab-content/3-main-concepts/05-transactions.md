---
title: "Transactions"
order: 5
description: Transactions in Cosmos.
---

# Transactions

Transactions are objects created by end-users to trigger state changes in the application. They are comprised of metadata that defines a context and one or more `sdk.Msg`s that trigger state changes within a module through the module’s Protobuf message service.

## Transaction Process, End-user

While there is much to explore as we journey through the stack, let us first describe the transaction process from a user perspective.

* **Decide** on the messages to put into the transaction. This is normally done with the assistance of a wallet or application and a user interface.
* **Generate** the transaction using the Cosmos SDK's `TxBuilder`. `TxBuilder` is the preferred way to generate a transaction.
* **Sign** the transaction. Transactions must be signed before the validators will include them in a block.
* **Broadcast** the signed transaction using one of the available interfaces.

From a user perspective, **decide** and **sign** are the main interactions, while **generate** and **broadcast** are attended by the user interface and other automations.

## Transaction Objects

Transaction objects are Cosmos SDK types that implement the `Tx` interface. They contain the following methods:

* `GetMsgs`: unwraps the transaction and returns a list of contained `sdk.Msg` - one transaction may have one or multiple messages.
* `ValidateBasic`: includes lightweight, stateless checks used by ABCI message’s `CheckTx` and `DeliverTx` to make sure transactions are not invalid. For example, the auth module's `StdTx` `ValidateBasic` function checks that its transactions are signed by the correct number of signers and that the fees do not exceed the user's maximum. Note that this function is to be distinct from the `ValidateBasic` functions for `sdk.Msg`, which perform basic validity checks on messages only. For example, when `runTx` is checking a transaction created from the auth module, it first runs `ValidateBasic` on each message, then runs the auth module's `AnteHandler`, which calls `ValidateBasic` for the transaction itself.

As a developer, you should rarely manipulate a Tx object directly. It is an intermediate type used for transaction generation. Instead, developers should prefer the `TxBuilder` interface.

## Signing Transactions

Every message in a transaction must be signed by the addresses specified by its `GetSigners`. The SDK currently allows signing transactions in two different ways:

* `SIGN_MODE_DIRECT` (preferred): the most used implementation of the Tx interface is the Protobuf `Tx` message, which is used in `SIGN_MODE_DIRECT`. Once signed by all signers, the `body_bytes`, `auth_info_bytes`, and signatures are gathered into `TxRaw`, whose serialized bytes are broadcast over the network.

* `SIGN_MODE_LEGACY_AMINO_JSON`: the legacy implementation of the `Tx` interface is the `StdTx` struct from the auth module. The document signed by all signers is `StdSignDoc`, which is encoded into bytes using Amino JSON. Once all signatures are gathered into `StdTx`, `StdTx` is serialized using Amino JSON, and these bytes are broadcast over the network.

## Messages

<HighlightBox type=”info”>

Transaction messages are not to be confused with ABCI messages, which define interactions between Tendermint and application layers.

</HighlightBox>

In this context, messages, or `sdk.Msg`, are module-specific objects that trigger state transitions within the scope of the module they belong to. Module developers define module messages by adding methods to the Protobuf `Msg` service and defining a `MsgServer`. Each `sdk.Msgs` is related to exactly one Protobuf `Msg` service RPC, defined inside each module's `tx.proto` file. A Cosmos SDK app router automatically maps every `sdk.Msg` to a corresponding RPC service which routes it to the appropriate method. Protobuf generates a `MsgServer` interface for each module's `Msg` service, and the module developer implements this interface.

This design puts more responsibility on module developers, allowing application developers to reuse common functionalities without having to implement state transition logic repetitively.
While messages contain the information for state transition logic, a transaction's other metadata and relevant information are stored in the `TxBuilder` and `Context`.

## Transaction Generation

The `TxBuilder` interface contains metadata closely related to the generation of transactions. The end-user can freely set these parameters for the transaction to be generated:

* `Msgs`: the array of messages included in the transaction.
* `GasLimit`: option chosen by the users for how to calculate how much gas they are willing to spend.
* `Memo`: a note or comment to send with the transaction.
* `FeeAmount`: the maximum amount the user is willing to pay in fees.
* `TimeoutHeight`: block height until which the transaction is valid.
* `Signatures`: the array of signatures from all signers of the transaction.

As there are currently two modes for signing transactions, there are also two implementations of `TxBuilder`. There is a wrapper for `SIGN_MODE_DIRECT` and the `StdTxBuilder` for `SIGN_MODE_LEGACY_AMINO_JSON`. However, the two possibilities should normally be hidden away because end-users should prefer the overarching `TxConfig` interface. `TxConfig` is an app-wide configuration for managing transactions. Most importantly, it holds the information about whether to sign each transaction with `SIGN_MODE_DIRECT` or `SIGN_MODE_LEGACY_AMINO_JSON`.

By calling `txBuilder := txConfig.NewTxBuilder()`, a new `TxBuilder` will be instantiated with the appropriate sign mode. Once `TxBuilder` is correctly populated with the setters of the fields described above, `TxConfig` will also take care of correctly encoding the bytes (again, either using `SIGN_MODE_DIRECT` or `SIGN_MODE_LEGACY_AMINO_JSON`).

Here's a pseudo-code snippet of how to generate and encode a transaction, using the `TxEncoder()` method:

```go
txBuilder := txConfig.NewTxBuilder()
txBuilder.SetMsgs(...) // and other setters on txBuilder
```

## Broadcast the Transaction

Once the transaction bytes are generated and signed there are currently three primary ways of broadcasting it.

Application developers create entrypoints to the application by creating a command-line interface, gRPC and/or REST interface, typically found in the application's `./cmd` folder. These interfaces allow users to interact with the application.

### CLI

For the command-line interface, module developers create subcommands to add as children to the application top-level transaction command, `TxCmd`.

CLI commands actually bundle all the steps of transaction processing into one simple command: creating messages, generating transactions, signing and broadcasting.

### gRPC
The principal usage of gRPC is in the context of module Query services.

The SDK also exposes a few other module-agnostic gRPC services, one of them being the Tx service
The Tx service exposes a handful of utility functions, such as simulating a transaction or querying a transaction, and also one method to broadcast transactions.

Example: [https://github.com/cosmos/cosmos-sdk/blob/master/docs/run-node/txs.md#programmatically-with-go](https://github.com/cosmos/cosmos-sdk/blob/master/docs/run-node/txs.md#programmatically-with-go)

### REST
Each gRPC method has its corresponding REST endpoint, generated using gRPC-gateway.
Rather than using gRPC, you can also use HTTP to broadcast the same transaction, on the `POST` `/cosmos/tx/v1beta1/txs` endpoint.

Example: [https://github.com/cosmos/cosmos-sdk/blob/master/docs/run-node/txs.md#using-rest](https://github.com/cosmos/cosmos-sdk/blob/master/docs/run-node/txs.md#using-rest)

Additionally:

### Tendermint RPC

The three methods presented above are actually higher abstractions over the Tendermint RPC `/broadcast_tx_{async,sync,commit}` endpoints.

Example: [https://docs.tendermint.com/master/rpc/#/Tx](https://docs.tendermint.com/master/rpc/#/Tx)
you can use the Tendermint RPC endpoints to directly broadcast the transaction through Tendermint, if you wish to.

## Next up

In the [next section](./07-messages), you can learn how transaction messages are generated and handled in the Cosmos SDK.

<ExpansionPanel title="Show me some code for my checkers blockchain">

Previously, the ABCI application knew of a single transaction type, that of a checkers move, with four `int`. With multiple games, this is no longer sufficient, nor viable. Additionally, because you are now on your way to using the Cosmos SDK, you need to conform to its `Tx` ways, which means that you have to create messages that are then placed into a transaction.

Let's have a look at the [Messages](./07-messages) section to learn how to do just that.

</ExpansionPanel>
