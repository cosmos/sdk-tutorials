---
title: "BaseApp"
order: 8
description: Working with BaseApp to implement apps
tag: deep-dive
---

# BaseApp

BaseApp is a boilerplate implementation of a Cosmos SDK application. This abstraction implements functionalities that every Cosmos application needs starting with an implementation of the Tendermint Application Blockchain Interface (ABCI). 

Tendermint consensus is application agnostic. It establishes the canonical transaction list and sends confirmed transactions to Cosmos SDK applications for interpretation, and the reverse - receives transactions from Cosmos SDK applications and submits them to the validators for confirmation. 

Applications that rely on Tendermint consensus, such as Cosmos applications, must implement concrete functions that support the ABCI interface. BaseApp includes an implementation of ABCI so developers aren’t required to construct one. 

ABCI itself includes methods such as `DeliverTx` that delivers a transaction. Interpretation of the transaction is an application-level responsibility. Since a typical application supports more than one type of transaction, interpretation implies the need for a service router that will send the transaction to different interpreters based on transaction type. BaseApp includes a service router implementation. .

As well as an ABCI implementation, BaseApp also provides a state machine implementation. Implementation of a state machine is an application-level concern because Tendermint consensus is application agnostic. The Cosmos SDK state machine implementation contains an overall state that is subdivided into various substates. Subdivisions include module states, persistent states and transient states. These are all implemented in BaseApp. 

BaseApp provides a secure interface between the application, the blockchain and the state machine while defining as little as possible about the state machine. 

## Defining an Application

Developers usually create a custom type for their application by referencing the `BaseApp` and declaring store keys, keepers and a module manager, like this:

```
type App struct {
  // reference to a BaseApp
  *baseapp.BaseApp

  // list of application store keys

  // list of application keepers

  // module manager
}
```

Extending the application with BaseApp gives the former access to all of BaseApp's methods. Developers compose their custom application with the modules they want, while not having to concern themselves with the hard work of implementing the ABCI, the service routers and state management logic.

### Type Definition

The BaseApp type holds many important parameters for any Cosmos SDK based application:  [https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc3/baseapp/baseapp.go#L46-L131](https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc3/baseapp/baseapp.go#L46-L131)

**Bootstrapping**

Important parameters that are initialized during the bootstrapping of the application:

* **CommitMultiStore**:  This is the main store of the application, which holds the canonical state that is committed at the end of each block. This store is not cached, meaning it is not used to update the application's volatile (un-committed) states. The CommitMultiStore is a multi-store, meaning a store of stores. Each module of the application uses one or multiple KVStores in the multi-store to persist their subset of the state.
* **Database**: The database is used by the CommitMultiStore to handle data persistence.
* **Msg Service Router**: The msgServiceRouter facilitates the routing of sdk.Msg requests to the appropriate module Msg service for processing. Here a sdk.Msg refers to the transaction component that needs to be processed by a service in order to update the application state, and not to the ABCI message which implements the interface between the application and the underlying consensus engine.
**gRPC Query Router*: The grpcQueryRouter facilitates the routing of gRPC queries to the appropriate module that will process it. These queries are not ABCI messages themselves, but they are relayed to the relevant module's gRPC Query service.
* **TxDecoder**: It is used to decode raw transaction bytes relayed by the underlying Tendermint engine.
* **ParamStore**: The parameter store used to get and set application consensus parameters.
* **AnteHandler**: This handler is used to handle signature verification, fee payment, and other pre-message execution checks when a transaction is received. It's executed during CheckTx/RecheckTx and DeliverTx.
* **InitChainer**, BeginBlocker and EndBlocker: These are the functions executed when the application receives the InitChain, BeginBlock and EndBlock ABCI messages from the underlying Tendermint engine.

**Volatile State**

Parameters that define volatile states (i.e. cached states) include:

* **checkState**: This state is updated during CheckTx, and reset on Commit.
* **deliverState**: This state is updated during DeliverTx, and set to nil on Commit and gets re-initialized on BeginBlock.

**Consensus Parameters**

Consensus parameters define the overall consensus state:

* **voteInfos**: This parameter carries the list of validators whose precommit is missing, either because they did not vote or because the proposer did not include their vote. This information is carried by the Context and can be used by the application for various things like punishing absent validators.
* **minGasPrices**: This parameter defines the minimum gas prices accepted by the node. This is a local parameter, meaning each full-node can set a different minGasPrices. It is used in the AnteHandler during CheckTx, mainly as a spam protection mechanism. The transaction enters the mempool only if the gas prices of the transaction are greater than one of the minimum gas price in minGasPrices (e.g. if minGasPrices == 1uatom,1photon, the gas-price of the transaction must be greater than 1uatom OR 1photon).
* **appVersion**: Version of the application. It is set in the application's constructor function.

### Constructor

Consider the following simple constructor:

```
func NewBaseApp(
  name string, logger log.Logger, db dbm.DB, txDecoder sdk.TxDecoder, options ...func(*BaseApp),
) *BaseApp {

  // ...
}
```

The BaseApp constructor function is pretty straightforward. Notice the possibility of providing additional `options` to the BaseApp, which will execute them in order. The options are generally setter functions for important parameters, like `SetPruning()` to set pruning options or `SetMinGasPrices()` to set the node's min-gas-prices.

Naturally, developers can add additional options based on their application's needs.

## States

BaseApp provides three primary states. Two are volatile and one is persistent. 

* The **main** state is the canonical state of the application.
* The volatile states, `checkState` and `deliverState` are used to handle transitions between main states during commits. 

Internally, there is one single  `CommitMultiStore` referred to as the main state or root state. From this main state, `BaseApp` derives the two volatile states using a mechanism called branching, performed by the `CacheWrap` function. 

### InitChain State Updates

During **InitChain**, the two volatile states, checkState and deliverState are set by branching the root CommitMultiStore. 
Any subsequent reads and writes happen on branched versions of the CommitMultiStore. 
To avoid unnecessary roundtrips to the main state, all reads to the branched store are cached.

### CheckTx State Updates

During **CheckTx**, the checkState, which is based off of the last committed state from the root store, is used for any reads and writes. Here we only execute the AnteHandler and verify a service router exists for every message in the transaction. 
Note, when we execute the AnteHandler, we branch the already branched checkState. This has the side effect that if the AnteHandler fails, the state transitions won't be reflected in the checkState, meaning checkState is only updated on success.

### BeginBlock State Updates

During **BeginBlock**, the deliverState is set for use in subsequent DeliverTx ABCI messages. The deliverState is based off of the last committed state from the root store and is branched. Note, the deliverState is set to nil on Commit.

### DeliverTx State Updates

The state flow for DeliverTx is nearly identical to CheckTx except state transitions occur on the deliverState and messages in a transaction are executed. Similarly to CheckTx, state transitions occur on a doubly branched state -- deliverState. Successful message execution results in writes being committed to deliverState. Note, if message execution fails, state transitions from the AnteHandler are persisted.

### Commit State Updates

During Commit, all the state transitions that occurred in the deliverState are finally written to the root CommitMultiStore which in turn is committed to disk and results in a new application root hash. These state transitions are now considered final. Finally, the checkState is set to the newly committed state and deliverState is set to nil to be reset on BeginBlock.

### ParamStore

During InitChain, the `RequestInitChain` provides ConsensusParams which contains parameters related to block execution such as maximum gas and size in addition to evidence parameters. If these parameters are non-nil, they are set in the BaseApp's ParamStore. Behind the scenes, the ParamStore is actually managed by an `x/params` module Subspace. This allows the parameters to be tweaked via on-chain governance.

## Service Routers

When messages and queries are received by the application, they must be routed to the appropriate module in order to be processed. Routing is done via `BaseApp`, which holds a `msgServiceRouter` for messages, and a `grpcQueryRouter` for queries.

### Msg Service Router 

<HighlightBox type=”info”>

[https://github.com/cosmos/cosmos-sdk/blob/master/docs/core/baseapp.md](https://github.com/cosmos/cosmos-sdk/blob/master/docs/core/baseapp.md)

</HighlightBox>

The main ABCI messages that BaseApp implements are `CheckTx` and `DeliverTx`.

Other ABCI message handlers are implemented:

* InitChain
* BeginBlock
* EndBlock
* Commit
* Info
* Query

See: [CheckTx](https://github.com/cosmos/cosmos-sdk/blob/master/docs/core/baseapp.md#checktx)


