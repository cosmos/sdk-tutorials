---
title: "Context"
order: 12
description: Information on the state of the app, the block, and the transaction
tag: deep-dive
---

# Context

Transactions execute in a context. The context includes information about the current state of the application, the block, and the transaction.

Context is represented as data structures that carry information about the current state of the application and are intended to be passed from function to function. Context provides access to branched storage, a safe branch of the entire state, as well as useful objects, and information like gasMeter, block height, consensus parameters, and more.

The Cosmos SDK context is a custom data structure that contains Go's stdlib context as its base. It has many additional types within its definition that are specific to the Cosmos SDK.

Context is integral to transaction processing in that it allows modules to easily access their respective store in the multi-store and retrieve transactional context such as the block header and gas meter.

## Properties of context

The context has the following properties:

* **Context:** the base type is a Go Context.
* **Multistore:** every application's BaseApp contains a `CommitMultiStore`, which is provided when a context is created. Calling the `KVStore()` and `TransientStore()` methods allows modules to fetch their respective `KVStore` using their unique `StoreKey`.
* **ABCI Header:** the header is an ABCI type. It carries important information about the state of the blockchain, such as block height and proposer of the current block.
* **Chain ID:** the unique identification number of the blockchain a block pertains to.
* **Transaction bytes:** The []byte representation of a transaction is processed using the context. Every transaction is processed by various parts of the Cosmos SDK and consensus engine (for example, Tendermint) throughout its lifecycle, some of which do not have any understanding of transaction types. Thus, transactions are marshaled into a generic `[]byte` type using some kind of encoding format such as Amino.
* **Logger:** a logger from the Tendermint libraries. Learn more about logs here. Modules call this method to create their unique module-specific logger.
* **`VoteInfo`:** a list of the ABCI type `VoteInfo`, which includes the name of a validator and a boolean indicating whether they have signed the block.
* **Gas meters:** specifically, a `gasMeter` for the transaction currently being processed using the context and a `blockGasMeter` for the entire block it belongs to. Users specify how much in fees they wish to pay for the execution of their transaction. These gas meters keep track of how much gas has been used in the transaction or block so far. If the gas meter runs out, execution halts.
* **`CheckTx` mode:** a boolean value indicating whether a transaction should be processed in `CheckTx` or `DeliverTx` mode.
* **Min gas price:** the minimum gas price a node is willing to take to include a transaction in its block. This price is a local value configured by each node individually, and should therefore not be used in any functions in sequences leading to state transitions.
* **Consensus params:** the ABCI type `Consensus Parameters`, which specifies certain limits for the blockchain, such as maximum gas for a block.
* **Event manager:** the event manager allows any caller with access to a context to emit events. Modules may define module-specific events by defining various types and attributes or using the common definitions found in `types/`. Clients can subscribe or query for these events. These events are collected through `DeliverTx`, `BeginBlock`, and `EndBlock`, and are returned to Tendermint for indexing.

## Golang Context Package

A basic context is defined in the Golang Context Package. A context is an immutable data structure that carries request-scoped data across APIs and processes. Contexts are also designed to enable concurrency and to be used in go routines. Contexts are intended to be immutable; they should never be edited. Instead, the convention is to create a child context from its parent using a `With` function. The Golang Context Package documentation instructs developers to explicitly pass a context `ctx` as the first argument of a process.

<!-- Add link to Go Context Package -->

## Store branching

The context contains a `MultiStore`, which allows for branching and caching functionality using `CacheMultiStore` - queries in `CacheMultiStore` are cached to avoid future round trips.

Each `KVStore` is branched in a safe and isolated ephemeral storage. Processes are free to write changes to the `CacheMultiStore`. If a state-transition sequence is performed without issue, the store branch can be committed to the underlying store at the end of the sequence or disregarded if something goes wrong.

## The pattern of usage

The usage pattern for context is as follows:

1. Process receives a context `ctx` from its parent process, which provides information needed to perform the process.
2. The `ctx.ms` is a branched store, meaning that a branch of the multi-store is made so that the process can make changes to the state as it executes, without changing the original `ctx.ms`. This is useful to protect the underlying multi-store in case the changes need to be reverted at some point in the execution.
3. The process may read and write from `ctx` as it is executing. It may call a subprocess and pass `ctx` to them as needed.
4. When a subprocess returns, it checks the result for success or failure. In case of a failure, nothing needs to be done - the branch `ctx` is simply discarded. If successful, the changes made to the `CacheMultiStore` can be committed to the original ctx.ms via `Write()`.

## Process

Prior to calling `runMsgs` on the message(s) in the transaction, it uses `app.cacheTxContext()` to branch and cache the context and multi-store:

* `runMsgCtx` - the context with branched store is used in `runMsgs` to return a result.
* If the process is running in `checkTxMode`, there is no need to write the changes - the result is returned immediately.
* If the process is running in `deliverTxMode` and the result indicates a successful run over all the messages, the branched multi-store is written back to the original.
