---
title: "Context"
order: 12
description: Information on the state of the app, the block, and the transaction
tags:
  - concepts
  - cosmos-sdk
---

# Context

<HighlightBox type="prerequisite">

It is recommended to first read the following sections to better understand context:

* [Transactions](./3-transactions.md)
* [Messages](./4-messages.md)
* [Modules](./5-modules.md)
* [BaseApp](./8-base-app.md)
* [Queries](./9-queries.md)
* [Events](./10-events.md)

</HighlightBox>

<HighlightBox type="learning">

`Context` is the setting in which transactions execute, and is the sum of all pertinent information at runtime. Here you will find out what transaction context means in detail and learn more about the important elements that together form the execution context.

</HighlightBox>

Transactions execute in a context. The context includes information about the current state of the application, the block, and the transaction.

Context is represented as data structures that carry information about the current state of the application and are intended to be passed from function to function. Context provides access to branched storage, that is a safe branch of the entire state, as well as useful objects and information, like `gasMeter`, block height, and consensus parameters.

<HighlightBox type="info">

The Cosmos SDK context is a custom data structure that contains Go's stdlib context as its base. It has many additional types within its definition that are specific to the Cosmos SDK.

</HighlightBox>

Context is integral to transaction processing as it allows modules to easily access their respective store in the multistore and retrieve transactional context such as the block header and gas meter.

## Context properties

The context has the following properties:

* **Context:** the base type is a Go Context.
* **Multistore:** every application's `BaseApp` contains a `CommitMultiStore`, which is provided when a context is created. Calling the `KVStore()` and `TransientStore()` methods allows modules to fetch their respective `KVStore`s using their unique `StoreKey`s.
* **ABCI Header:** the header is an ABCI type. It carries important information about the state of the blockchain, such as block height and the proposer of the current block.
* **Chain ID:** the unique identification number of the blockchain a block pertains to.
* **Transaction bytes:** the []byte representation of a transaction is processed using the context.

<HighlightBox type="info">

Every transaction is processed by various parts of the Cosmos SDK and consensus engine (for example CometBFT) throughout its lifecycle, some of which do not have any understanding of transaction types. Thus, transactions are marshaled into a generic `[]byte` type using some kind of encoding format such as Amino.

</HighlightBox>

* **Logger:** a logger from the Tendermint libraries. [Learn more about logs here](https://github.com/tendermint/tendermint/blob/master/libs/log/logger.go). Modules call this method to create their unique module-specific logger.
* **`VoteInfo`:** a list of the ABCI type `VoteInfo`, which includes the name of a validator and a boolean indicating whether they have signed the block.
* **Gas meters:** specifically, a `gasMeter` for the transaction currently being processed, using the context and a `blockGasMeter` for the entire block it belongs to.

<HighlightBox type="info">

Users specify how much in fees they wish to pay for the execution of their transaction. These gas meters keep track of how much gas has been used in the transaction or block so far. If the gas meter runs out, execution halts.

</HighlightBox>

* **`CheckTx` mode:** a boolean value indicating whether a transaction should be processed in `CheckTx` or `DeliverTx` mode.
* **Min gas price:** the minimum gas price a node is willing to take to include a transaction in its block. This price is a local value configured by each node individually, and should therefore not be used in any functions in sequences leading to state transitions.
* **Consensus params:** the ABCI type `Consensus Parameters`, which specifies certain limits for the blockchain, such as maximum gas for a block.
* **Event manager:** allows any caller with access to a context to emit events. Modules may define module-specific events by defining various types and attributes, or by using the common definitions found in `types/`. Clients can subscribe or query for these events. These events are collected through `DeliverTx`, `BeginBlock`, and `EndBlock` and are returned to CometBFT for indexing.

## Golang Context Package

A context is an immutable data structure that carries request-scoped data across APIs and processes. Contexts are also designed to enable concurrency and to be used in Go routines.

<HighlightBox type="info">

A basic context is defined in the [Golang Context Package](https://pkg.go.dev/context).

</HighlightBox>

Contexts are intended to be immutable: they should never be edited. The convention is to instead create a child context from its parent using a `With` function. The Golang Context Package documentation instructs developers to [explicitly pass a context `ctx`](https://pkg.go.dev/context) as the first argument of a process.

## Store branching

The context contains a `MultiStore`, which allows for branching and caching functionality using `CacheMultiStore`. Queries in `CacheMultiStore` are cached to avoid future round trips.

Each `KVStore` is branched in a safe and isolated ephemeral storage. Processes are free to write changes to the `CacheMultiStore`. If a state-transition sequence is performed without issue, the store branch can be committed to the underlying store at the end of the sequence, or it can be disregarded if something goes wrong.

## The pattern of usage

The usage pattern for context is as follows:

1. Process receives a context `ctx` from its parent process, which provides information needed to perform the process.
2. The `ctx.ms` is a branched store, meaning that a branch of the multistore is made so that the process can make changes to the state as it executes without changing the original `ctx.ms`. This is useful to protect the underlying multistore in case the changes need to be reverted at some point in the execution.
3. The process may read and write from `ctx` as it is executing. It may call a subprocess and pass `ctx` to them as needed.
4. When a subprocess returns, it checks the result for success or failure. In case of a failure, nothing needs to be done - the branch `ctx` is simply discarded. If it is successful, the changes made to the `CacheMultiStore` can be committed to the original ctx.ms via `Write()`.

## Process

Prior to calling `runMsgs` on any messages in the transaction, `app.cacheTxContext()` is used to branch and cache the context and multistore:

* For `runMsgCtx`, the context with the branched store is used in `runMsgs` to return a result.
* If the process is running in `checkTxMode`, there is no need to write the changes. The result is returned immediately.
* If the process is running in `deliverTxMode` and the result indicates a successful run over all the messages, the branched multistore is written back to the original.

<ExpansionPanel title="Show me some code for my checkers blockchain">

**Game deadline**

When a game is created or a move is played, the game needs to set its deadline some time in the future. The time it takes as _now_ comes from the context.

To get this, you need a function that looks like:

```go
func GetNextDeadline(ctx sdk.Context) time.Time {
    return ctx.BlockTime().Add(MaxTurnDuration)
}
```

After that, it is a matter of serializing this data so it is stored alongside the other parameters of the game, and of deserializing it when checking whether it has reached the deadline.

**Gas costs**

Another point where the context is explicitly used is when you want to make your players pay with gas for operations you specify. This gas fee comes on top of the configured standard fee for transactions on your chain. Propose some ratios, which would have to be adjusted so they make sense compared to the base transaction costs:

* **Create a game:** costs **15_000**. This should also include the costs of *closing* a game. If that was not the case, a losing player would be incentivized to let the game hit its timeout to penalize the winner.
* **Play a move:** costs **1_000**. You could also make the final move cost zero when the player loses the game, to incentivize the player to conclude the game instead of letting it hit the timeout.
* **Reject a game:** could cost **zero**, because you want to incentivize cleaning up the state. This transaction would still cost what your chain is configured to charge for basic transactions. So you can in fact refund some gas to the player, for instance **14_000**.

So you define the cost:

```go
const (
    CreateGameGas = 15_000
    PlayMoveGas   = 1_000
    RejectGameRefundGas = 14_000
)
```

Next you add the line in your `MsgCreateGame` handler, which already has access to the context:

```go
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ...
    ctx.GasMeter().ConsumeGas(types.CreateGameGas, "Create game")
    ...
}
```

As for the refund when rejecting, you have to make sure that you are not trying to refund more than what was already consumed:

```go
func (k msgServer) RejectGame(goCtx context.Context, msg *types.MsgRejectGame) (*types.MsgRejectGameResponse, error) {
    ...
    refund := uint64(types.RejectGameRefundGas)
    if consumed := ctx.GasMeter().GasConsumed(); consumed < refund {
        refund = consumed
    }
    ctx.GasMeter().RefundGas(refund, "Reject game")
    ...
}
```

</ExpansionPanel>

<HighlightBox type="tip">

If you want to go beyond out-of-context code samples like the above and see in more detail how to define these features, go to [Run Your Own Cosmos Chain](/hands-on-exercise/1-ignite-cli/index.md).
<br/><br/>
More precisely, you can jump to:

* [Keep an Up-To-Date Game Deadline](/hands-on-exercise/2-ignite-cli-adv/1-game-deadline.md), where you add the deadline feature to your chain
* [Incentivize Players](/hands-on-exercise/2-ignite-cli-adv/8-gas-meter.md), to implement gas costs

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* The importance of transaction context, which is the sum of all pertinent information about the application, the block, and the transaction itself at runtime.
* The specific properties of the context, their functions, and the processes which make use of them.
* The pattern of usage for context.
* The process which precedes running any transaction messages to branch and cache both the context and multistore.

</HighlightBox>

<!--## Next up

Go to the [next section](./13-migrations.md) for an introduction to migrations in the Cosmos SDK.-->
