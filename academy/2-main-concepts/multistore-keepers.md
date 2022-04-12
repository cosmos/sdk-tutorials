---
title: "Multistore and Keepers"
order: 8
description: Store types, the AnteHandler, and keepers
tag: deep-dive
---

# Multistore and Keepers

<HighlightBox type="synopsis">

Keepers are responsible for managing access to states defined by modules. Accessing the state is done through a keeper. Therefore, keepers are an ideal place to ensure that invariants are enforced and security principles are always applied.

Take a look at the following sections before you begin:

* [Transactions](./transactions.md)
* [Messages](./messages.md)
* [Modules](./modules.md)
* [Protobuf](./protobuf.md)

You can find a code example for your checkers blockchain at the end of the section to explore dealing with storage elements, message handling, and gas costs.

</HighlightBox>

A Cosmos SDK application on an application-specific blockchain usually consists of several modules attending to separate concerns. Each module has a state that is a subset of the entire application state.

The Cosmos SDK adopts an object-capabilities-based approach to help developers better protect their application from unwanted inter-module interactions. Keepers are at the core of this approach.

A keeper is a Cosmos SDK abstraction that manages access to the subset of the state defined by a module. All access to the module's data must go through the module's keeper.

A keeper can be thought of quite literally as the gatekeeper of a module's store(s). Each store, typically an IAVL store, defined within a module comes with a `storeKey`. The `storeKey` grants unlimited access to it. The module's keeper holds this `storeKey`, which should otherwise remain unexposed, and defines methods for reading and writing to the store(s).

When a module needs to interact with the state defined in another module, it does so by interacting with the methods of the other module’s keeper. Developers control the interactions their module can have with other modules by defining methods and controlling access.

[Keepers in the Cosmos SDK](/keeper.png)

## Format

Keepers are generally defined in a `/keeper/keeper.go` file located in the module’s folder. The type keeper of a module is named simply `keeper.go` by convention. It usually follows the following structure:

```go
type Keeper struct {
    // Expected external keepers, if any

    // Store key(s)

    // codec
}
```

### Parameters

The following parameters are of importance concerning the type definitions of keepers in modules:

* An expected `keeper` is a keeper external to a module that is required by the internal keeper of said module. External keepers are listed in the internal keeper's type definition as interfaces. These interfaces are themselves defined in an `expected_keepers.go` file in the root of the module's folder. Interfaces are used to reduce the number of dependencies and to facilitate the maintenance of the module itself in this context.
* `storeKeys` grant access to the store(s) of the multistore managed by the module. They should always remain unexposed to external modules.
* `cdc` is the codec used to marshal and unmarshal structs to/from []byte. The `cdc` can be `codec.BinaryCodec`, `codec.JSONCodec`, or `codec.Codec` based on your requirements. Note that `code.Codec` includes the other interfaces. It can be either a proto or amino codec as long as they implement these interfaces.

Each keeper has its own constructor function, which is called from the application's constructor function. This is where keepers are instantiated and where developers make sure to pass correct instances of the module's keepers to other modules that require them.

### Scope and best practices

Keepers primarily expose getter and setter methods for the store(s) managed by their module. Methods should remain simple and strictly limited to getting or setting the requested value. Validity checks should already have been done with the `ValidateBasic()` method of the message and the `Msg` server before the keeper's methods are called.

The getter method will typically have the following signature:

```go
func (k Keeper) Get(ctx sdk.Context, key string) (value returnType, found bool)
```

The setter method will typically have the following signature:

```go
func (k Keeper) Set(ctx sdk.Context, key string, value valueType)
```

Keepers also should implement an iterator method with the following signature when appropriate:

```go
func (k Keeper) GetAll(ctx sdk.Context) (list []returnType)
```

<!-- Keepers also implement an iterator method: TODO: Iterator  method -->

## Store types

The Cosmos SDK offers different store types to work with. It is important to gain a good overview of different store types available for development.

### `KVStore` and `Multistore` in Cosmos

Each Cosmos SDK application contains a state at its root, the `Multistore`. It is subdivided into separate compartments managed by each module in the application. The `Multistore` is a store of `KVStore`s that follows the [`Multistore interface`](https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/types/store.go#L104-L133).

The base `KVStore` and `Multistore` implementations are wrapped in extensions that offer specialized behavior. A [`CommitMultistore`](https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/types/store.go#L141-L184) is a `Multistore` with a committer. This is the main type of multistore used in the Cosmos SDK. The underlying `KVStore` is used primarily to restrict access to the committer.

The [`rootMulti.Store`](https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/rootmulti/store.go#L43-L61) is the go-to implementation of the `CommitMultiStore` interface. It is a base-layer multistore built around a database on top of which multiple `KVStore`s can be mounted. It is the default multistore store used in `BaseApp`.

### `CacheMultistore`

A [`cachemulti.Store`](https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/cachemulti/store.go#L17-L28) is used whenever the `rootMulti.Store` needs to be branched. `cachemulti.Store` branches all substores, creates a virtual store for each substore, in its constructor and holds them in `Store.stores`. This is used primarily to create an isolated store, typically when it is necessary to mutate the state but it might be reverted later.

`CasheMultistore` caches all read queries. `Store.GetKVStore()` returns the store from `Store.stores`, and `Store.Write()` recursively calls `CacheWrap.Write()` on all substores.

### Transient store

As the name suggests, `Transient.Store` is a `KVStore` that is discarded automatically at the end of each block. `Transient.Store` is a `dbadapter.Store` with a `dbm.NewMemDB()`. All `KVStore` methods are reused. A new `dbadapter.Store` is assigned when `Store.Commit()` is called, discarding the previous reference. Garbage collection is attended to automatically.

<HighlightBox type="tip">

Why not take a closer look at the [IAVL spec](https://github.com/cosmos/iavl/blob/v0.15.0-rc5/docs/overview.md) when working with the IAVL store?

The default implementation of `KVStore` and `CommitKVStore` is the `IAVL.Store`. The `IAVL.Store` is a self-balancing binary search tree that ensures get and set operations are `O(log n)`, where `n` is the number of elements in the tree.

</HighlightBox>

## Additional KVStore wrappers

Beside the above store types, there are a few others with more specific usage.

### GasKv store

Cosmos SDK applications use gas to track resources usage and prevent spam. The `GasKv.Store` is a `KVStore` wrapper that enables automatic gas consumption each time a read or write to the store is made. It is the solution of choice to track storage usage in Cosmos SDK applications.

`GasKv.Store` automatically consumes the appropriate amount of gas depending on the `Store.gasConfig` when methods of the parent `KVStore` are called. All `KVStores` are wrapped in `GasKv.Stores` by default when retrieved. This is done in the `KVStore()` method of the context. The default gas configuration is used in this case.

### TraceKv store

`tracekv.Store` is a wrapper `KVStore`, which provides operation tracing functionalities over the underlying `KVStore`. It is applied automatically by the Cosmos SDK on all `KVStore`s if tracing is enabled on the parent `MultiStore`.
When each of the `KVStore` methods are called, `tracekv.Store` automatically logs `traceOperation` to the `Store.writer`. `traceOperation.Metadata` is filled with `Store.context` when it is not nil. `TraceContext` is a `map[string]interface{}`.

### Prefix store

`prefix.Store` is a wrapper `KVStore` which provides automatic key-prefixing functionalities over the underlying `KVStore`:

* When `Store.{Get, Set}()` is called, the store forwards the call to its parent with the key prefixed with the `Store.prefix`.
* When `Store.Iterator()` is called, it does not simply prefix the `Store.prefix` since it does not work as intended. Some of the elements are traversed even when they are not starting with the prefix in this case.

## `AnteHandler`

The `AnteHandler` is a special handler that implements the `AnteHandler` interface. It is used to authenticate the transaction before the transaction's internal messages are processed.

The `AnteHandler` is theoretically optional but still a very important component of public blockchain networks. It serves three primary purposes:

* It is a primary line of defense against spam and the second line of defense - the first one being the mempool - against transaction replay with fees deduction and sequence checking.
* Perform preliminary stateful validity checks like ensuring signatures are valid or that a sender has enough funds to pay for fees.
* Play a role in the incentivization of stakeholders via the collection of transaction fees.

`BaseApp` holds an `AnteHandler` as a parameter that is initialized in the application's constructor. The most widely used `AnteHandler` is the auth module.

<HighlightBox type="info">

For more information on the subject, a closer look at the following resources could prove worth it:

* [Cosmos SDK documentation: Gas and Fees](https://github.com/cosmos/cosmos-sdk/blob/master/docs/basics/gas-fees.md)
* [Cosmos SDK documentation: AnteHandler](https://github.com/cosmos/cosmos-sdk/blob/master/docs/basics/gas-fees.md#antehandler)

</HighlightBox>

## Next up

In the [next section](./base-app.md), you will find more information on `BaseApp` and its role in the Cosmos SDK.

<ExpansionPanel title="Show me some code for my checkers blockchain">

In the [Accounts section](./accounts.md), you were introduced to the elements of the stored game but were left in the dark about where this game is stored. In light of what you learned above, fix that.

## Game object in storage

You need to decide under what structure you want to store a game in the storage. The Cosmos SDK partitions the global storage per module with `checkers` being its own module. You need to take care of how to store games in the checkers module's corner of the key/value pair storage.

The first idea would be to attribute a unique ID to a game and to store the game value at that ID. For the sake of clarity and to be able to differentiate with other stored elements in the future, you ought to add a prefix to that ID. The storage structure would look like this:

```go
// Pseudo-code
var globalStore sdk.KVStore
checkersStore := globalStore.getAtPrefix("checkers-")
gamesStore := checkersStore.getAtPrefix("games-")
storedGame := gamesStore.getAtPrefix(gameId)
// Or again in a different way
storedGame := globalStore.getAtPrefix("checkers-games-" + gameId)
```

It is pseudo-code because:

* Prefixes have to be `byte[]` instead of `string`. This is easily handled with a cast such as `[]byte("games-")`.
* The Cosmos SDK prevents you from directly accessing any random module's store, such that `globalStore.getAtPrefix("checkers-")` is not allowed and instead has to be accessed via a secret key.

Define the ID of the `StoredGame`. To return a single object, we include `StoredGame` in the object's value:

```go
type StoredGame struct {
    ...
    Index string
}
```

With most of the action handled by the Cosmos SDK, you are left with defining the required prefixes in your corner of the storage:

```go
package types

const (
    StoredGameKey = "StoredGame-value-"
)
```

Which assists you with accessing a game:

```go
package keeper

import (
    "github.com/cosmos/cosmos-sdk/store/prefix"
    sdk "github.com/cosmos/cosmos-sdk/store/types"
    "github.com/alice/checkers/x/checkers/types"
)

func (k Keeper) GetStoredGame(ctx sdk.Context, gameId string) (storedGame types.StoredGame, found bool) {
    checkersStore := ctx.KVStore(k.storeKey)
    gamesStore := prefix.NewStore(checkersStore, []byte(types.StoredGameKey))
    gameBytes := gamesStore.Get([]byte(gameId))
    if gameBytes == nil {
        return nil, false
    }
    k.cdc.MustUnmarshalBinaryBare(gameBytes, &storedGame)
    return storedGame, true
}
```

If you want to save a game:

```go
func (k Keeper) SetStoredGame(ctx sdk.Context, storedGame types.StoredGame) {
    checkersStore := ctx.KVStore(k.storeKey)
    gamesStore := prefix.NewStore(checkersStore, []byte(types.StoredGameKey))
    gameBytes := k.cdc.MustMarshalBinaryBare(&storedGame)
    gamesStore.Set(byte[](storedGame.Index), gameBytes)
}
```

If you want to delete a stored game, you would call `gamesStore.Delete(byte[](storedGame.Index))`.

The `KVStore` allows you to obtain an iterator on a given prefix. You can list all stored games because all stored games share the same prefix, which you would do with:

```go
func (k Keeper) GetAllStoredGame(ctx sdk.Context) (list []types.StoredGame) {
    checkersStore := ctx.KVStore(k.storeKey)
    gamesStore := prefix.NewStore(checkersStore, []byte(types.StoredGameKey))
    iterator := sdk.KVStorePrefixIterator(gamesStore, []byte{}) // []byte{} is an empty array

    defer iterator.Close() // Think of it as: try { everything below } finally { iterator.Close() }

    for ; iterator.Valid(); iterator.Next() {
        var storedGame types.StoredGame
        k.cdc.MustUnmarshalBinaryBare(iterator.Value(), &storedGame)
        list = append(list, storedGame)
    }

    return
}
```

Notice the `MustMarshalBinaryBare` and `MustUnmarshalBinaryBare` functions in the `codec` above. They need to be instructed on how to proceed with the marshaling. Protobuf took care of this for you.

<HighlightBox type="tip">

See the [previous section on Protobuf](./protobuf.md) to explore how Protobuf deals with the marshaling.

</HighlightBox>

## Boilerplate, boilerplate everywhere!

Also notice how the `Set`, `Get`, `Remove`, and `GetAll` functions above look like boilerplate too. Do you have to redo these functions for every type? You do not. It was all created with this Ignite CLI command:

```sh
$ ignite scaffold map storedGame game turn red black wager:uint --module checkers --no-message
```

Where `map` is the command that tells Ignite CLI to add an `Index` and store all elements under a map-like structure.

<HighlightBox type="tip">

To create the above boilerplate in your module, you can use Ignite CLI. For Ignite CLI and if you want to go beyond these out-of-context code samples to see more in detail how to define all this, head to [My Own Chain](../4-my-own-chain/index.md).

</HighlightBox>

## Other storage elements

How do we create this `storedGame.Index`? A viable idea is to keep a counter in storage for the next game. Unlike `StoredGame`, which is saved as a map, this `NextGame` object has to be at a unique location in the storage.

We define the object:

```go
package types

type NextGame struct {
    IdValue uint64
}
```

Plus, the key where it resides:

```go
const (
    NextGameKey = "NextGame-value-"
)
```

Then the functions to get and set:

```go
func (k Keeper) SetNextGame(ctx sdk.Context, nextGame types.NextGame) {
    nextGameStore := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.NextGameKey))
    nextBytes := k.cdc.MustMarshalBinaryBare(&nextGame)
    nextGameStore.Set([]byte{0}, nextBytes)
}
```

Not to forget that it needs an initial value, which is the role of the genesis block definition:

```go
type GenesisState struct {
    StoredGameList []*StoredGame
    NextGame *NextGame
}
```

And its initialization:

```go
func DefaultGenesis() *GenesisState {
    return &GenesisState{
        StoredGameList: []*StoredGame{}, // Starts empty
        NextGame: &NextGame{
            IdValue:  uint64(0), // Starts at 0
        },
    }
}
```

## What about message handling

You defined the `MsgCreateGame` in an earlier [section on messages](./messages.md).
You go from the message to the game in storage with the `MsgCreateGame`. That is also the role of the keeper. You should define a handling function such as:

```go
func (k Keeper) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handle the message

    return &types.MsgCreateGameResponse{}, nil
}
```

It looks like you now have all the pieces to replace the `TODO`, which turns out to be straightforward.

Get the next game ID:

```go
    nextGame, found := k.GetNextGame(ctx)
    if !found {
        // Panic because this should never happen.
        panic("NextGame not found")
    }
    newIndex := strconv.FormatUint(nextGame.IdValue, 10)
```

Extract and sanitize the message elements:

```go
    creator, err := sdk.AccAddressFromBech32(msg.Creator)
    if err != nil {
        return nil, errors.New("Creator address invalid")
    }
    red, err := sdk.AccAddressFromBech32(msg.Red)
    if err != nil {
        // Standard error because users can make mistakes.
        return nil, errors.New("Red address invalid")
    }
    black, err := sdk.AccAddressFromBech32(msg.Black)
    if err != nil {
        return nil, errors.New("Black address invalid")
    }
```

Create the stored game object:

```go
    storedGame := types.StoredGame{
        Creator: msg.Creator,
        Index:   newIndex,
        Game:    rules.New().String(),
        Red:     msg.Red,
        Black:   msg.Black,
        Wager:   msg.Wager,
    }
```

Save it in storage:

```go
    k.SetStoredGame(ctx, storedGame)
```

Prepare for the next created game:

```go
    nextGame.IdValue++
    k.SetNextGame(ctx, nextGame)
```

Return the game ID for reference:

```go
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
```

You would do the same for `MsgPlayMoveResponse` and `MsgRejectGame`. Why not try it out as an exercise?

## More on game theory

Time to introduce a game deadline:

```go
const (
    MaxTurnDurationInSeconds = time.Duration(24 * 3_600 * 1000_000_000) // 1 day
    DeadlineLayout           = "2006-01-02 15:04:05.999999999 +0000 UTC"
)
type StoredGame struct {
    ...
    Deadline string
}
```

Set its initial value on creation:

```go
storedGame := types.StoredGame{
    ...
    Deadline: ctx.BlockTime().Add(types.MaxTurnDurationInSeconds).UTC().Format(types.DeadlineLayout),
}
```

Update its value after a move:

```go
storedGame.Deadline = ctx.BlockTime().Add(types.MaxTurnDurationInSeconds).UTC().Format(types.DeadlineLayout)
```

Extract and verify its value when necessary:

```go
deadline, err = time.Parse(DeadlineLayout, storedGame.Deadline)
if err != nil {
    panic(err)
}
if deadline.Before(ctx.BlockTime()) {
    // TODO
}
```

## How to expire games

When do you verify that a game has expired? An interesting feature of an ABCI application is that you can have it perform some actions at the end of each block. Should you load all games and filter for those that have expired? That would be extremely expensive. Better keep a First-In-First-Out (FIFO) where fresh games are pushed back to the tail so that the head contains the next games to expire.

In the context of the Cosmos SDK, you need to keep track of where the FIFO starts and stops by saving the corresponding game IDs:

```go
const (
    NoFifoIdKey = "-1"
)
type NextGame struct {
    ...
    FifoHead string
    FifoTail string
}
```

And to have each game know its relative position and the number of moves done to assist the refunding logic on games with zero, one, or more than two moves:

```go
type StoredGame struct {
    ...
    MoveCount uint64
    BeforeId  string
    AfterId   string
}
```

Next, you need to code a regular FIFO, whereby:

* Games are sent to the back when created or played on.
* Games are removed from the FIFO when they are finished or time out.

## When to expire games

Since you want to expire the games that have timed out at the end of a block, you need to hook your keeper to the right call. The Cosmos SDK will call at various points into each module when building the whole application. The function it calls at each block's end looks like this:

```go
func (am AppModule) EndBlock(ctx sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
    // TODO
    return []abci.ValidatorUpdate{}
}
```

This is where you write the necessary code, preferably in the keeper. For instance with:

```go
am.keeper.ForfeitExpiredGames(sdk.WrapSDKContext(ctx))
```

Those among you with a well-placed paranoia must be asking whether you can ensure that the execution of this `EndBlock` does not become prohibitively expensive. The number of games to potentially expire is unbounded after all, which is a recipe for disaster in the blockchain world. Is there a situation or an attack vector that would make this a possibility? And what can you do to prevent it?

The timeout duration is fixed and is the same for all games. This means that the `n` games that expire in a given block have all been created or updated at roughly the same time or roughly the same block height `h`, give or take a margin of error `h-1` and `h+1`. These created and updated games are limited in number because as per one of the chain consensus parameters every block has a maximum size and a limited number of transactions it can include. If by any chance all games in blocks `h-1`, `h`, and `h+1` expire now, then the `EndBlock` function would have to expire three times as many games as a block can handle. This is the worst-case scenario but it still sounds manageable.

You should be careful about letting the game creator pick a timeout duration. It could open an avenue for a malicious actor to stagger game creations over a large number of blocks with decreasing timeouts so that they all expire at the same time.

## Gas costs

The keeper also makes it easy for you to charge the gas to the players as you see fit. This gas fee comes on top of the configured standard fee for transactions on your chain. Propose some ratios, which would have to be adjusted so it makes sense compared to the base transaction costs:

* Create a game: costs 10. It should include the costs of closing a game. If that was not the case, the losing player would be incentivized to let the game hit its timeout.
* Play move: costs one. You could make it cost zero when the player loses the game to incentivize the player to conclude the game instead of letting it hit the timeout.
* Reject: costs zero, because you want to incentivize cleaning up the state. This transaction would still cost what your chain is configured to charge for basic transactions.

So you define the cost:

```go
const (
    CreateGameGas = 10
    PlayMoveGas   = 1
    RejectGameGas = 0
)
```

Then, you add the line in your `MsgCreateGame` handler:

```go
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ...
    ctx.GasMeter().ConsumeGas(types.CreateGameGas, "Create game")
    ...
}
```

</ExpansionPanel>
