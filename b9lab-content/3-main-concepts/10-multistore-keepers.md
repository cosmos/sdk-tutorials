---
title: "Multistore and Keepers"
order: 8
description: Store types, the AnteHandler, and keepers
tag:
---

# Multistore and Keepers

A Cosmos SDK application on a purpose-built blockchain usually consists of several modules attending to separate concerns. Each module has a state that is a subset of the entire application state.

Cosmos SDK adopts an object-capabilities-based approach (only reveal what is necessary to get the work done) to help developers better protect their application from unwanted inter-module interactions, and keepers are at the core of this approach.

A keeper is a Cosmos SDK abstraction that manages access to the subset of the state defined by a module. All access to the module’s data must go through the module’s keeper.

A keeper can be thought of quite literally as the gatekeeper of a module's store(s). Each store (typically an IAVL Store) defined within a module comes with a storeKey, which grants unlimited access to it. The module's keeper holds this storeKey (which should otherwise remain unexposed), and defines methods for reading and writing to the store(s).

When a module needs to interact with the state defined in another module, it does so by interacting with methods of the other module’s keeper. Developers control the interactions their module can have with other modules by defining methods and controlling access.

## Format

Keepers are generally defined in a `/keeper/Keeper.go` file locating in the module’s folder.

By convention, the type keeper of a module is named simply `Keeper.go` and usually follows the following structure:

```go
type Keeper struct {
    // Expected external keepers, if any

    // Store key(s)

    // codec
}
```

### Parameters:

* An `expected` keeper is a keeper external to a module that is required by the internal keeper of said module. External keepers are listed in the internal keeper's type definition as interfaces. These interfaces are themselves defined in an `expected_keepers.go` file in the root of the module's folder. In this context, interfaces are used to reduce the number of dependencies, as well as to facilitate the maintenance of the module itself.
* `storeKeys` grant access to the store(s) of the multistore managed by the module. They should always remain unexposed to external modules.
* `cdc` is the codec used to marshall and unmarshall structs to/from `[]byte`. The cdc can be any of `codec.BinaryCodec`, `codec.JSONCodec` or `codec.Codec` based on your requirements. It can be either a proto or amino codec as long as they implement these interfaces.

Each keeper has its own constructor function, which is called from the application's constructor function. This is where keepers are instantiated and where developers make sure to pass correct instances of modules' keepers to other modules that require them.

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

Each Cosmos SDK application contains a state at its root, the multistore, that is subdivided into separate compartments that are managed by each module in the application.  The multistore is a store of key/value stores (KVStore) that follows the [`Multistore` interface](https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/types/store.go#L104-L133).

The base `KVStore` and `Multistore` implementations are wrapped in extensions that offer specialized behavior. A [`CommitMultistore`](https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/types/store.go#L141-L184) is a `Multistore` with a committer. This is the main type of multistore used in Cosmos SDK. The underlying KVStore is used primarily to restrict access to the committer.

The [`rootMulti.Store`](https://github.com/cosmos/cosmos-sdk/blob/v0.40.0-rc6/store/rootmulti/store.go#L43-L61) is the go-to implementation of the `CommitMultiStore` interface. It is a base-layer multistore built around a database on top of which multiple KVStores can be mounted, and is the default multistore store used in baseapp.

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

<ExpansionPanel title="Show me some code for my checkers blockchain">

In the [Accounts](./04-accounts) section, you were introduced to the elements of the stored game, but were left in the dark about where this game is stored. In light of what you learned above, let's remedy that.

## Game Object in Storage

You need to decide under what structure to store a game in storage. The Cosmos SDK partitions the global storage per module, with `checkers` being its own module. Therefore, you need to take care of how to store games in the checkers' module's own corner of the key / value pair storage.

The first idea would be to attribute a unique id to a game and to store the game value at that id. However, for the sake of clarity and so as to be able to differentiate with other stored elements in the future, you ought to add a prefix to that id. In pseudo-Go-code, the storage structure would therefore look like this:

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
* The Cosmos SDK prevents you from directly accessing any random module's store, such that `globalStore.getAtPrefix("checkers-")` is not allowed, and instead has to be accessed via a secret key.

Let's define the id of the `StoredGame`. In order to be able to return a single object, we include it in the object's value:

```go
type StoredGame struct {
    ...
    Index string
}
```
So, with most of the action handled by the Cosmos SDK, you are left with defining the required prefixes in your corner of storage:

```go
package types

const (
    StoredGameKey = "StoredGame-value-"
)
```
Which assists you with how to access a game:

```go
package keeper

import (
    "github.com/cosmos/cosmos-sdk/store/prefix"
    sdk "github.com/cosmos/cosmos-sdk/store/types"
    "github.com/xavierlepretre/checkers/x/checkers/types"
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
Similarly, if you want to save a game:

```go
func (k Keeper) SetStoredGame(ctx sdk.Context, storedGame types.StoredGame) {
    checkersStore := ctx.KVStore(k.storeKey)
    gamesStore := prefix.NewStore(checkersStore, []byte(types.StoredGameKey))
    gameBytes := k.cdc.MustMarshalBinaryBare(&storedGame)
    gamesStore.Set(byte[](storedGame.Index), gameBytes)
}
```
Now if you wanted to delete a stored game, you would call `gamesStore.Delete(byte[](storedGame.Index))`.

Interestingly, the `KVStore` allows you to obtain an iterator on a given prefix. In effect, because all stored games share the same prefix, this means you can list all stored games, which you would do like so:

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
Notice the `MustMarshalBinaryBare` and `MustUnmarshalBinaryBare` functions in the `codec` above. They need to be instructed as to how to proceed with the marshaling. Fortunately, Protobuf took care of this for us. See the [previous section](./09-protobuf) for that.

## Boilerplate Boilerplate Everywhere!

Also notice how the `Set`, `Get`, `Remove`, and `GetAll` functions above look like boilerplate too. Do you have to redo these functions for every type? **No**. In fact, it was all created with this Starport command:

```sh
$ starport scaffold map storedGame game turn red black wager:uint --module checkers --no-message
```
Where `map` is the command that tells Starport to add an `Index` and store all elements under a map-like structure.

<HighlightBox type="tip">

To create the above boilerplate in your own module, you can use Starport. For Starport, and if you want to go beyond these out-of-context code samples and instead see more in detail how to define all this, head to [how to build your own chain](../5-my-own-chain/01-index).

</HighlightBox>

## Other Storage Elements

How do we create this `storedGame.Index`? A viable idea is to keep a counter, in storage, for the next game. Unlike `StoredGame`s, which are saved as a map, this `NextGame` object has to be at a unique location in the whole storage.

Therefore, we define the object:

```go
package types

type NextGame struct {
    IdValue uint64
}
```
Plus the key where it resides:

```go
const (
    NextGameKey = "NextGame-value-"
)
```
Then the functions to get and set.

```go
func (k Keeper) SetNextGame(ctx sdk.Context, nextGame types.NextGame) {
    nextGameStore := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.NextGameKey))
    nextBytes := k.cdc.MustMarshalBinaryBare(&nextGame)
    nextGameStore.Set([]byte{0}, nextBytes)
}
```
Not to forget that it needs an initial value. That's the role of the genesis block definition:

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

## What About Message Handling

In an earlier section on [messages](./07-messages), you defined the `MsgCreateGame` among others. Left unsaid is how you go from the message to the game in storage. That's also the role of the keeper. Effectively, you should define a handling function such as:

```go
func (k Keeper) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    // TODO: Handle the message

    return &types.MsgCreateGameResponse{}, nil
}
```
It looks like you now have all the pieces to replace the `TODO`, which turns out to be straightforward:

* Get the next game id:
    ```go
    nextGame, found := k.GetNextGame(ctx)
    if !found {
        // Panic because this should never happen.
        panic("NextGame not found")
    }
    newIndex := strconv.FormatUint(nextGame.IdValue, 10)
    ```
* Extract and sanitize the message elements:
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
* Create the stored game object:
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
* Save it in storage:
    ```go
    k.SetStoredGame(ctx, storedGame)
    ```
* Prepare for the next created game:
    ```go
    nextGame.IdValue++
    k.SetNextGame(ctx, nextGame)
    ```
* Return the game id for reference:
    ```go
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

As for `MsgPlayMoveResponse` and `MsgRejectGame`, you would do the same and is left as an exercise.

## More on Game Theory

When you introduced the [messages](./07-messages), there remained the question of what to do when a player does not play ball.

Time to introduce the game deadline:

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

## How To Expire Games

Ok, but when do you verify that the game has expired? An interesting feature of an ABCI application is that you can do some action at the end of each block. Should you load all games and filter for those that have expired? No. That would be extremely expensive. Better keep a FIFO where fresh games are pushed back to the tail and therefore the head contains the next games to expire.

In the context of the Cosmos SDK, you need to keep track of where the FIFO starts and stops by saving the corresponding game ids:

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
And to have each game know its relative position, and also the number of moves done, to assist the refunding logic on games with 0, 1 or 2+ moves:

```go
type StoredGame struct {
    ...
    MoveCount uint64
    BeforeId  string
    AfterId   string
}
```
Next, and this is left as an exercise, you need to code a regular FIFO whereby:

* Games are sent to the back when created or played on.
* Games are removed from the FIFO when they are finished or time out.

## When To Expire Games

Since you want to expire the games that have timed out at the end of a block, you need to hook your keeper to the right call. When building the whole application, the Cosmos SDK will call at various points into each module. The function it calls at each block's end looks like this:

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
Those among you with a well-placed paranoia must be asking whether you can ensure that the execution of this `EndBlock` does not become prohibitively expensive. After all, the number of games to potentially expire is unbounded, which is a recipe for disaster in the blockchain world. Is there a situation or an attack vector that would make this is a possibility?

Fortunately, the timeout duration is fixed and the same for all games. This means that those `n` games that all expire in a given block have all been created or updated at roughly the same time. Or in effect, at roughly the same block height `h` give or take a margin of error `h-1` and `h+1`. These created and updated games are in limited number, as per the validators rules. So if by any chance, all games in blocks `h-1`, `h` and `h+1` expire now, then the `EndBlock` function would have to expire 3 times as many games as a block can handle. This is the worst case scenario, and still sounds manageable.

As a corollary, you should be careful about letting the game creator pick a timeout duration. That would open an avenue for a malicious actor to, for instance, stagger game creations over a large number of blocks, with decreasing timeouts, so that they all expire at the same time.

## Gas costs

The keeper also makes it easy for you to charge gas to the players as you see fit. Let's propose some ratios, which would have to be adjusted so it makes sense compared to the base transaction costs:

* Create game: costs 10. Conceptually, it should include the costs of closing a game. If that was not the case, the losing player would be incentivized to let the game hit its timeout.
* Play move: costs 1. You could make it cost 0 when the player loses the game, in order to incentivize the player to conclude the game instead of letting it hit the time out.
* Reject: costs 0 because you want to incentivize cleaning up the state. This transaction would still cost what Cosmos SDK bills for transactions.

So you define the cost:

```go
const (
    CreateGameGas = 10
    PlayMoveGas   = 1
    RejectGameGas = 0
)
```
Then, in your `MsgCreateGame` handler, you add the line:

```go
func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
    ...
    ctx.GasMeter().ConsumeGas(types.CreateGameGas, "Create game")
    ...
}
```
Where and how much to charge for gas is an economics as well as a game theoretic concern. So you should think about what you want to incentivize or disincentivize, at which junctures, and charge accordingly.

</ExpansionPanel>
