---
title: "Transactions"
order: 4
description: Generating, signing, and broadcasting transactions
tag: deep-dive
---

# Transactions

Transactions are objects created by end-users to trigger state changes in applications. They are comprised of metadata that defines a context and one or more [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L11-L33) that trigger state changes within a module through the module’s Protobuf message service.

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
            description: '**Sign** the transaction. Transactions must be signed before a validators includes them in a block.'
        },
        {
            title: 'Broadcast',
            description: '**Broadcast** the signed transaction using one of the available interfaces.'
        }
    ]
"/>

<!-- TODO add link to TxBuilder: https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L36-L46 -->

**Decide** and **sign** are the main interactions of a user. **Generate** and **broadcast** are attended to by the user interface and other automation.

## Transaction objects

Transaction objects are Cosmos SDK types that implement the [`Tx`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L50-L57) interface. They contain the following methods:

* [`GetMsgs`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L52). Unwraps the transaction and returns a list of contained [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L11-L33). One transaction may have one or multiple messages.
* [`ValidateBasic`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L56). Includes lightweight, stateless checks used by ABCI message’s `CheckTx` and `DeliverTx` to make sure transactions are not invalid. For example, the auth module's [`StdTx`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/x/auth/legacy/legacytx/stdtx.go#L77-L83) [`ValidateBasic`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/x/auth/legacy/legacytx/stdtx.go#L100-L126) function checks that its transactions are signed by the correct number of signers and that the fees do not exceed the user's maximum. Note that this function is different from the [`ValidateBasic`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L24) functions for `sdk.Msg`, which perform basic validity checks on messages only. For example, `runTX` first runs `ValidateBasic` on each message when it checks a transaction created from the auth module. Then it runs the auth module's [`AnteHandler`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/handler.go#L8), which calls `ValidateBasic` for the transaction itself.

You should rarely manipulate a `Tx` object directly. It is an intermediate type used for transaction generation. Developers usually use the [`TxBuilder`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L36-L46) interface.

## Messages

<HighlightBox type="info">

Transaction messages are not to be confused with ABCI messages, which define interactions between Tendermint and application layers.

</HighlightBox>

Messages or [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L11-L33) are module-specific objects that trigger state transitions within the scope of the module they belong to. Module developers define module messages by adding methods to the Protobuf `Msg` service and defining a `MsgServer`. Each `sdk.Msg` is related to exactly one Protobuf `Msg` service RPC defined inside each module's `tx.proto` file. A Cosmos SDK app router automatically maps every `sdk.Msg` to a corresponding RPC service, which routes it to the appropriate method. Protobuf generates a `MsgServer` interface for each module's `Msg` service and the module developer implements this interface.

This design puts more responsibility on module developers. This allows application developers to reuse common functionalities without having to repetitively implement state transition logic. While messages contain the information for the state transition logic, a transaction's other metadata and relevant information are stored in the `TxBuilder` and `Context`.

## Signing Transactions

Every message in a transaction must be signed by the addresses specified by its [`GetSigners`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L32). The Cosmos SDK currently allows signing transactions in two different ways:

* [`SIGN_MODE_DIRECT`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/signing/signing.pb.go#L36) (preferred). The most used implementation of the `Tx` interface is the [Protobuf `Tx`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/tx.pb.go#L32-L42) message, which is used in `SIGN_MODE_DIRECT`. Once signed by all signers, the `BodyBytes`, `AuthInfoBytes`, and [`Signatures`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/tx.pb.go#L113) are gathered into [`TxRaw`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/tx.pb.go#L103-L114), whose [serialized bytes](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/tx.pb.go#L125-L136) are broadcast over the network.
* [`SIGN_MODE_LEGACY_AMINO_JSON`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/signing/signing.pb.go#L43). The legacy implementation of the `Tx` interface is the [`StdTx`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/x/auth/legacy/legacytx/stdtx.go#L77-L83) struct from `x/auth`. The document signed by all signers is [`StdSignDoc`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/x/auth/legacy/legacytx/stdsign.go#L24-L32), which is encoded into [bytes](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/x/auth/legacy/legacytx/stdsign.go#L35-L58) using Amino JSON. Once all signatures are gathered into `StdTx`, `StdTx` is serialized using Amino JSON and these bytes are broadcast over the network. This method is being deprecated.

## Generating transactions

The `TxBuilder` interface contains metadata closely related to the generation of transactions. The end-user can freely set these parameters for the transaction to be generated:

* [`Msgs`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L39). The array of messages included in the transaction.
* [`GasLimit`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L43). Option chosen by the users for how to calculate the gas amount they are willing to spend.
* [`Memo`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L41). A note or comment to send with the transaction.
* [`FeeAmount`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L42). The maximum amount the user is willing to pay in fees.
* [`TimeoutHeight`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L44). Block height until which the transaction is valid.
* [`Signatures`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L40). The array of signatures from all signers of the transaction.

As there are currently two modes for signing transactions, there are also two implementations of `TxBuilder`. There is a wrapper for `SIGN_MODE_DIRECT` and the [`StdTxBuilder`](https://github.com/cosmos/cosmos-sdk/blob/8fc9f76329dd2433d9b258a867500de419522619/x/auth/migrations/legacytx/stdtx_builder.go#L18-L21) for `SIGN_MODE_LEGACY_AMINO_JSON`. The two possibilities should normally be hidden away because end-users should prefer the overarching [`TxConfig`](https://github.com/cosmos/cosmos-sdk/blob/a72f6a8d4fcb1328ead8f14e212c95c1c0c6d64d/client/tx_config.go#L25-L31) interface. `TxConfig` is an [app-wide](https://github.com/cosmos/cosmos-sdk/blob/a72f6a8d4fcb1328ead8f14e212c95c1c0c6d64d/client/context.go#L46) configuration for managing transactions accessible from the context. Most importantly, it holds the information about whether to sign each transaction with `SIGN_MODE_DIRECT` or `SIGN_MODE_LEGACY_AMINO_JSON`.

A new `TxBuilder` will be instantiated with the appropriate sign mode by calling `txBuilder := txConfig.NewTxBuilder()`. `TxConfig` will also take care of correctly encoding the bytes either using `SIGN_MODE_DIRECT` or `SIGN_MODE_LEGACY_AMINO_JSON` once `TxBuilder` is correctly populated with the setters of the fields described above.

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

For the command-line interface (CLI) module developers create subcommands to add as children to the application top-level transaction command [`TxCmd`](https://github.com/cosmos/cosmos-sdk/blob/56ab4e4c934365662162a91bcf35108a0bd78fef/x/bank/client/cli/tx.go#L29-L60).

CLI commands bundle all the steps of transaction processing into one simple command: 

* Creating messages
* Generating transactions
* Signing
* Broadcasting

### gRPC

The principal usage of gRPC is in the context of module query services. The Cosmos SDK also exposes a few other module-agnostic gRPC services. One of them is the `Tx` service. The `Tx` service exposes a handful of utility functions such as simulating a transaction or querying a transaction and also one method to [broadcast transactions](https://github.com/cosmos/cosmos-sdk/blob/master/docs/run-node/txs.md#broadcasting-a-transaction-1).

<HighlightBox type="tip">

Sometimes looking at an example can be helpful. Take a closer look at this [code example](https://github.com/cosmos/cosmos-sdk/blob/master/docs/run-node/txs.md#programmatically-with-go).

</HighlightBox>

### REST

Each gRPC method has its corresponding REST endpoint generated using gRPC-gateway. Rather than using gRPC, you can also use HTTP to broadcast the same transaction on the `POST` `/cosmos/tx/v1beta1/txs` endpoint.

<HighlightBox type="tip">

Need an example? Check out this [code example](https://github.com/cosmos/cosmos-sdk/blob/master/docs/run-node/txs.md#using-rest).

</HighlightBox>

### Tendermint RPC

The three methods presented above are higher abstractions on the Tendermint RPC `/broadcast_tx_{async,sync,commit}` endpoints. You can use the [Tendermint RPC endpoints](https://docs.tendermint.com/master/rpc/#/Tx) to directly broadcast the transaction through Tendermint if you wish to.

<HighlightBox type="tip">

Tendermint supports the following RPC protocols:

* URI over HTTP
* JSONRPC over HTTP
* JSONRPC over WebSockets

Want more information on broadcasting with Tendermint RPC? Why not take a closer look at the documentation on [Tendermint RPC transactions broadcast APIs](https://docs.tendermint.com/master/rpc/#/Tx)?

</HighlightBox>

## Next up

In the [next section](./messages.md), you can learn how transaction messages are generated and handled in the Cosmos SDK.

<ExpansionPanel title="Show me some code for my checkers blockchain">

[Previously](./architecture.md), the ABCI application knew of a single transaction type: a checkers move with four `int`. This is no longer sufficient with multiple games. You need to conform to its `Tx` ways, which means that you have to create messages then placed in to a transaction.

Head to the [section on messages](./messages.md)) to learn how to do just that.

</ExpansionPanel>
