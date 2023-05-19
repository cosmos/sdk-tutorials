---
title: "Transactions"
order: 4
description: Generating, signing, and broadcasting transactions
tags: 
  - concepts
  - cosmos-sdk
---

# Transactions

<HighlightBox type="learning">

In this section you will dive into the various functions and features of making transactions in the Interchain:

* Transactions and Messages
* Signing Transactions
* Generating Transactions
* Broadcasting Transactions
* Introducing the CLI, the gRPC service, the REST API, and the CometBFT RPC service

</HighlightBox>

Transactions are objects created by end-users to trigger state changes in applications. They are comprised of metadata that defines a context, and one or more [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx_msg.go#L11-L22) that trigger state changes within a module through the module’s Protobuf message service.

## Transaction process from an end-user perspective

While there is much to explore as you journey through the stack, begin by understanding the transaction process from a user perspective:

<Accordion :items="
    [
        {
            title: 'Decide',
            description: '**Decide** on the messages to put into the transaction. This is normally done with the assistance of a wallet or application and a user interface.'
        },
        {
            title: 'Generate',
            description: '**Generate** the transaction using the Cosmos SDK\'s `TxBuilder`. `TxBuilder` is the preferred way to generate a transaction.'
        },
        {
            title: 'Sign',
            description: '**Sign** the transaction. Transactions must be signed before a validator includes them in a block.'
        },
        {
            title: 'Broadcast',
            description: '**Broadcast** the signed transaction using one of the available interfaces.'
        }
    ]
"/>

<!-- TODO add link to TxBuilder: https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L36-L46 -->

**Deciding** and **signing** are the main interactions of a user. **Generating** and **broadcasting** are attended to by the user interface and other automation.

## Transaction objects

Transaction objects are Cosmos SDK types that implement the [`Tx`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx_msg.go#L39-L46) interface. They contain the following methods:

* [`GetMsgs`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx_msg.go#L41): unwraps the transaction and returns a list of contained [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx_msg.go#L11-L22). One transaction may have one or multiple messages.
* [`ValidateBasic`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx_msg.go#L45): includes lightweight, stateless checks used by the ABCI messages' `CheckTx` and `DeliverTx` to make sure transactions are not invalid. For example, the [`Tx`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx/tx.pb.go#L32-L42) [`ValidateBasic`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx/types.go#L38) function checks that its transactions are signed by the correct number of signers and that the fees do not exceed the user's maximum.

<HighlightBox type="tip">

This function is different from the [`ValidateBasic`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx_msg.go#L16) functions for `sdk.Msg`, which perform basic validity checks on messages only. For example, `runTX` first runs `ValidateBasic` on each message when it checks a transaction created from the auth module. Then it runs the auth module's [`AnteHandler`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/handler.go#L8), which calls `ValidateBasic` for the transaction itself.

</HighlightBox>

You should rarely manipulate a `Tx` object directly. It is an intermediate type used for transaction generation. Developers usually use the [`TxBuilder`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/client/tx_config.go#L36-L46) interface.

## Messages

<HighlightBox type="info">

Transaction messages are not to be confused with ABCI messages, which define interactions between CometBFT and application layers.

</HighlightBox>

Messages or [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx_msg.go#L11-L22) are module-specific objects that trigger state transitions within the scope of the module they belong to. Module developers define module messages by adding methods to the Protobuf `Msg` service and defining a `MsgServer`. Each `sdk.Msg` is related to exactly one Protobuf `Msg` service RPC defined inside each module's `tx.proto` file. A Cosmos SDK app router automatically maps every `sdk.Msg` to a corresponding RPC service, which routes it to the appropriate method. Protobuf generates a `MsgServer` interface for each module's `Msg` service and the module developer implements this interface.

This design puts more responsibility on module developers. It allows application developers to reuse common functionalities without having to repetitively implement state transition logic. While messages contain the information for the state transition logic, a transaction's other metadata and relevant information are stored in the `TxBuilder` and `Context`.

## Signing Transactions

Every message in a transaction must be signed by the addresses specified by its [`GetSigners`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx_msg.go#L21). The Cosmos SDK currently allows signing transactions in two different ways:

* [`SIGN_MODE_DIRECT`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx/signing/signing.pb.go#L36) (preferred): the most used implementation of the `Tx` interface is the [Protobuf `Tx`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx/tx.pb.go#L32-L42) message, which is used in `SIGN_MODE_DIRECT`. Once signed by all signers, the `BodyBytes`, `AuthInfoBytes`, and [`Signatures`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx/tx.pb.go#L113) are gathered into [`TxRaw`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx/tx.pb.go#L103-L114), whose [serialized bytes](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx/tx.pb.go#L125-L136) are broadcast over the network.
* [`SIGN_MODE_LEGACY_AMINO_JSON`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/tx/signing/signing.pb.go#L43): the legacy implementation of the `Tx` interface is the [`StdTx`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/auth/legacy/legacytx/stdtx.go#L77-L83) struct from `x/auth`. The document signed by all signers is [`StdSignDoc`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/auth/legacy/legacytx/stdsign.go#L42-L50), which is encoded into [bytes](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/auth/legacy/legacytx/stdsign.go#L53-L78) using Amino JSON. Once all signatures are gathered into `StdTx`, `StdTx` is serialized using Amino JSON and these bytes are broadcast over the network. **This method is being deprecated**.

## Generating transactions

The `TxBuilder` interface contains metadata closely related to the generation of transactions. The end-user can freely set these parameters for the transaction to be generated:

* [`Msgs`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/client/tx_config.go#L39): the array of messages included in the transaction.
* [`GasLimit`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/client/tx_config.go#L43): an option chosen by the users for how to calculate the gas amount they are willing to spend.
* [`Memo`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/client/tx_config.go#L41): a note or comment to send with the transaction.
* [`FeeAmount`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/client/tx_config.go#L42): the maximum amount the user is willing to pay in fees.
* [`TimeoutHeight`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/client/tx_config.go#L44): the block height until which the transaction is valid.
* [`Signatures`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/client/tx_config.go#L40): the array of signatures from all signers of the transaction.

As there are currently two modes for signing transactions, there are also two implementations of `TxBuilder`. There is a wrapper for `SIGN_MODE_DIRECT` and the [`StdTxBuilder`](https://github.com/cosmos/cosmos-sdk/blob/8fc9f76329dd2433d9b258a867500de419522619/x/auth/migrations/legacytx/stdtx_builder.go#L18-L21) for `SIGN_MODE_LEGACY_AMINO_JSON`. The two possibilities should normally be hidden because end-users should prefer the overarching [`TxConfig`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/client/tx_config.go#L24-L30) interface. `TxConfig` is an [app-wide](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/client/context.go#L50) configuration for managing transactions accessible from the context. Most importantly, it holds the information about whether to sign each transaction with `SIGN_MODE_DIRECT` or `SIGN_MODE_LEGACY_AMINO_JSON`.

A new `TxBuilder` will be instantiated with the appropriate sign mode by calling `txBuilder := txConfig.NewTxBuilder()`. `TxConfig` will correctly encode the bytes either using `SIGN_MODE_DIRECT` or `SIGN_MODE_LEGACY_AMINO_JSON` once `TxBuilder` is correctly populated with the setters of the fields described previously.

This is a pseudo-code snippet of how to generate and encode a transaction using the `TxEncoder()` method:

```go
txBuilder := txConfig.NewTxBuilder()
txBuilder.SetMsgs(...) // and other setters on txBuilder
```

## Broadcasting the transaction

Once the transaction bytes are generated and signed, there are **three primary ways of broadcasting** the transaction:

* Using the command-line interface (CLI).
* Using gRPC.
* Using REST endpoints.

Application developers create entrypoints to the application by creating a command-line interface typically found in the application's `./cmd` folder, gRPC, and/or REST interface. These interfaces allow users to interact with the application.

### CLI

For the command-line interface (CLI) module developers create subcommands to add as children to the application top-level transaction command [`TxCmd`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/bank/client/cli/tx.go#L29-L60).

CLI commands bundle all the steps of transaction processing into one simple command:

* Creating messages.
* Generating transactions.
* Signing.
* Broadcasting.

### gRPC

The principal usage of gRPC is in the context of module query services. The Cosmos SDK also exposes other module-agnostic gRPC services. One of these is the `Tx` service, which exposes a handful of utility functions such as simulating a transaction or querying a transaction, and also one method to [broadcast transactions](https://github.com/cosmos/cosmos-sdk/blob/master/docs/docs/run-node/03-txs.md#broadcasting-a-transaction-1).

<HighlightBox type="tip">

See this [code example](https://github.com/cosmos/cosmos-sdk/blob/master/docs/docs/run-node/03-txs.md#programmatically-with-go) for more insight.

</HighlightBox>

### REST

Each gRPC method has its corresponding REST endpoint generated using gRPC-gateway. Rather than using gRPC, you can also use HTTP to broadcast the same transaction on the `POST` `/cosmos/tx/v1beta1/txs` endpoint.

<HighlightBox type="tip">

See this [code example](https://github.com/cosmos/cosmos-sdk/blob/master/docs/docs/run-node/03-txs.md#using-rest) for more details.

</HighlightBox>

### CometBFT RPC

The three methods presented previously are higher abstractions on the CometBFT RPC `/broadcast_tx_{async,sync,commit}` endpoints. You can use the [Tendermint RPC endpoints](https://docs.tendermint.com/v0.34/tendermint-core/rpc.html) to directly broadcast the transaction through CometBFT if you wish to.

<HighlightBox type="info">

CometBFT supports the following RPC protocols:

* URI over HTTP.
* JSONRPC over HTTP.
* JSONRPC over WebSockets.

For more information on broadcasting with CometBFT RPC, see the documentation on [Tendermint RPC transactions broadcast APIs](https://docs.tendermint.com/v0.34/tendermint-core/rpc.html).

</HighlightBox>

## Code example

<ExpansionPanel title="Show me some code for my checkers blockchain">

[Previously](./1-architecture.md), the ABCI application knew of a single transaction type: a checkers move with four `int`. This is no longer sufficient with multiple games. You need to conform to its `Tx` expectations, which means that you must create messages which are then placed into a transaction.
<br/><br/>
See the [section on messages](./4-messages.md) to learn how to do that.

</ExpansionPanel>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How transactions are objects created by end-users to trigger state changes in an application module through that module's Protobuf message service.
* How transaction messages are not to be confused with ABCI messages, which define interactions between CometBFT and application layers.
* How *deciding* and *signing* transactions are the main interactions of a user, whereas *generating* and *broadcasting* transactions are attended to by the user interface and other automation.
* How the modular nature of the Cosmos SDK places more responsibility on *module* developers to effectively code transaction processes, so *application* developers can reuse common functionalities without having to repetitively implement state transition logic.

</HighlightBox>

<!--## Next up

In the [next section](./4-messages.md), you can learn how transaction messages are generated and handled in the Cosmos SDK.-->
