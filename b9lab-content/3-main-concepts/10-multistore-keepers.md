# Multistore & Keepers

A Cosmos SDK application on a purpose-built blockchain usually consists of several modules attending to separate concerns. Each module has a state that is a subset of the entire application state. 

Cosmos SDK adopts an object-capabilities-based approach (only reveal what is necessary to get the work done) to help developers better protect their application from unwanted inter-module interactions, and keepers are at the core of this approach.

A keeper is a Cosmos SDK abstraction that manages access to the subset of the state defined by a module. All access to the module’s data must go through the module’s keeper. 

A keeper can be thought of quite literally as the gatekeeper of a module's store(s). Each store (typically an IAVL Store) defined within a module comes with a storeKey, which grants unlimited access to it. The module's keeper holds this storeKey (which should otherwise remain unexposed), and defines methods for reading and writing to the store(s).

When a module needs to interact with the state defined in another module, it does so by interacting with methods of the other module’s keeper. Developers control the interactions their module can have with other modules by defining methods and controlling access. 

## Format

Keepers are generally defined in a `/keeper/keeper.go` file locating in the module’s folder.

By convention, the type keeper of a module is named simply `keeper.go` and usually follows the following structure:

```
type Keeper struct {
    // Expected external keepers, if any

    // Store key(s)

    // codec
}
```

### Parameters:

* An `expected` keeper is a keeper external to a module that is required by the internal keeper of said module. External keepers are listed in the internal keeper's type definition as interfaces. These interfaces are themselves defined in an `expected_keepers.go` file in the root of the module's folder. In this context, interfaces are used to reduce the number of dependencies, as well as to facilitate the maintenance of the module itself.
* `storeKeys` grant access to the store(s) of the multistore managed by the module. They should always remain unexposed to external modules.
* `cdc` is the codec used to marshall and unmarshall structs to/from []byte. The `cdc` can be any of `codec.BinaryCodec`, `codec.JSONCodec` or `codec.Codec` based on your requirements. Note that `code.Codec` includes the other interfaces. It can be either a proto or amino codec as long as they implement these interfaces.

Each keeper has its own constructor function which is called from the application's constructor function. This is where keepers are instantiated and where developers make sure to pass correct instances of modules' keepers to other modules that require them.

### Scope and Best Practices

Keepers primarily expose getter and setter methods for the store(s) managed by their module.  Methods should remain simple and strictly limited to getting or setting the requested value. Validity checks should already have been done with the `ValidateBasic()` method of the message and the Msg server before the keeper's methods are called.

The getter method will have the following signature:
` func (k Keeper) Get(ctx sdk.Context, key string) returnType`

The setter method will have the following signature:
`func (k Keeper) Set(ctx sdk.Context, key string, value valueType)`

Keepers also implement an iterator method:

<!-- TODO: Iterator  method -->

## Store Types

### KVStore and Multi-Store in Cosmos

Each Cosmos SDK application contains a state at its root, the Multistore, that is subdivided into separate compartments that are managed by each module in the application.  The Multistore is a store of KVStores that follows the `Multistore interface`: https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/types/store.go#L104-L133 

The base `KVStore` and `Multistore` implementations are wrapped in extensions that offer specialized behavior. A `CommitMultistore` is a Multistore with a committer. This is the main type of Multistore used in Cosmos SD: https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/types/store.go#L141-L184. The underlying KVStore is used primarily to restrict access to the committer. 

The `rootMulti.Store` is the go-to implementation of the CommitMultiStore interface. It is a base-layer multistore built around a database on top of which multiple KVStores can be mounted, and is the default multistore store used in baseapp: https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/rootmulti/store.go#L43-L61

### CacheMultistore

Whenever the rootMulti.Store needs to be branched, a `cachemulti.Store` is used:  https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/cachemulti/store.go#L17-L28. `cachemulti.Store` branches all substores (creates a virtual store for each substore) in its constructor and hold them in Store.stores. 

This is used primarily to create an isolated store, typically when it is necessary to mutate the state but it might be reverted later. 

CasheMultistore caches all read queries. Store.GetKVStore() returns the store from Store.stores, and Store.Write() recursively calls CacheWrap.Write() on all substores.

### Transient Store

As the name suggests, `Transient.Store` is a KVStore that is discarded automatically at the end of each block. Transient.Store is a `dbadapter.Store` with a `dbm.NewMemDB()`. All KVStore methods are reused. When Store.Commit() is called, a new dbadapter.Store is assigned, discarding the previous reference. Garbage collection is attended to automatically.

### IAVL Store

The default implementation of KVStore and CommitKVStore is the `iavl.Store`. The IAVL.Store is a self-balancing binary search tree that ensures get and set operations are O(log n) when n is the number of elements in the tree. 

Each tree version is immutable nd can be retrieved even after a commit, depending on the pruning settings: https://github.com/cosmos/iavl/blob/v0.15.0-rc5/docs/overview.md 

## Additional KVStore Wrappers

### GasKv Store:

Cosmos SDK applications use gas to track resources usage and prevent spam. GasKv.Store is a KVStore wrapper that enables automatic gas consumption each time a read or write to the store is made. It is the solution of choice to track storage usage in Cosmos SDK applications.
When methods of the parent KVStore are called, GasKv.Store automatically consumes appropriate amount of gas depending on the Store.gasConfig
By default, all KVStores are wrapped in GasKv.Stores when retrieved. This is done in the KVStore() method of the context
In this case, the default gas configuration is used

### TraceKv Store

tracekv.Store is a wrapper KVStore which provides operation tracing functionalities over the underlying KVStore. It is applied automatically by the Cosmos SDK on all KVStore if tracing is enabled on the parent MultiStore.
When each KVStore methods are called, tracekv.Store automatically logs traceOperation to the Store.writer. traceOperation.Metadata is filled with Store.context when it is not nil. TraceContext is a map[string]interface{}.

### Prefix Store

prefix.Store is a wrapper KVStore which provides automatic key-prefixing functionalities over the underlying KVStore.
When Store.{Get, Set}() is called, the store forwards the call to its parent, with the key prefixed with the Store.prefix.
When Store.Iterator() is called, it does not simply prefix the Store.prefix, since it does not work as intended. In that case, some of the elements are traversed even they are not starting with the prefix.

## AnteHandler

The AnteHandler is a special handler that implements the AnteHandler interface and is used to authenticate the transaction before the transaction's internal messages are processed.

The AnteHandler is theoretically optional, but still a very important component of public blockchain networks. It serves 3 primary purposes:

* Be a primary line of defense against spam and second line of defense (the first one being the mempool) against transaction replay with fees deduction and sequence checking.
* Perform preliminary stateful validity checks like ensuring signatures are valid or that the sender has enough funds to pay for fees.
* Play a role in the incentivisation of stakeholders via the collection of transaction fees.

BaseApp holds an anteHandler as a parameter that is initialized in the application's constructor. The most widely used anteHandler is the auth module.

More info: https://github.com/cosmos/cosmos-sdk/blob/master/docs/basics/gas-fees.md#antehandler + https://github.com/cosmos/cosmos-sdk/blob/master/docs/basics/gas-fees.md 

## Long-running exercise

So far we have described what we wanted to do:

* Define a game id. How is defined? Probably incrementally.
* Save many `FullGame`s in storage for retrieval by id.
* Save `FullGame` ids in an ordered list of their timeouts, for use in `EndBlock`.
* Handle `CreateGameTx`, `MoveTx`, and `RejectTx`.

We need to add the other functions:

* Remove all traces of the game when it is finished.

Because of these requirements, we think about an appropriate storage structure.

Here we also introduce the idea of gas costs. Ratios proposal are to be adjusted so it makes sense compared to the base transaction costs:

* `CreateGameTx`: costs 10. Conceptually, it should include the costs of closing a game. If that was not the case, the losing player would be incentivized to let the game hit its timeout.
* `MoveTx`: costs 1. Perhaps make it cost 0 when the player loses the game, in order to incentivize the player to conclude the game instead of letting it hit the time out.
* `RejectTx`: costs 0 because we want to incentivize cleaning up the state. This transaction would still cost what Cosmos SDK bills for transactions.

TODO. This is where we start coding these ideas inside the keeper.
