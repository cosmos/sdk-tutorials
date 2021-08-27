# A Blockchain App Architecture


## Long-running exercise

Here, we introduce an exercise, a project, that you will bring forward as you learn more. In so doing, you will see how the Cosmos SDK improves your productivity by taking care of the boilerplate. It is still interesting to know about what the boilerplate is, in order to get a better overall picture.

### The setup

We are going to create a blockchain that lets interested people play checkers against each other. There are many versions of the rules. We choose [those](https://www.ducksters.com/games/checkers_rules.php). Also, the object of the exercise is to learn ABCI and Cosmos SDK, not to get lost in the proper implementation of the board state or of the rules of checkers. So we are going to use, and adapt, [this ready-made implementation](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go), with the additional rule that the board is 8x8 and played on black cells. The code will likely require adaptations as we go along. Also, we are not going to be overly concerned with a marketable GUI since, again, that would be a separate project in itself. Of course, we still need to concern ourselves with creating the groundwork for a GUI to be possible in the first place.

When we return to this long running exercise, in the next chapters, the goal is to improve it and use the Cosmos SDK as we learn elements.

As you can imagine, beyond the rules of the game, there is a lot we need to take care of. Therefore, as a start we ought to simplify to the maximum. Have a look at these [specs](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md) to see what the application needs to do to comply with ABCI, and try to figure out how barebones you would make your first, imperfect, checkers game blockchain.

### “Make” the state machine

Here is how we would do it. We _would_ do it, because we are here to learn the Cosmos SDK primarily, not to become proficient at implementing ABCI.

We want to show the minimum viable ABCI state machine. Tendermint does not concern itself with whether proposed transactions are valid, and about how the state changes after such a transaction. It delegates those to the state machine, which will _transform_ transactions into game moves and states.

#### Start the application

This state machine is an application that needs to start before it can receive any requests from Tendermint. We take this opportunity to load in memory the acceptable general moves. Fortunately, this code [exists already](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L75):

> `func init()`

#### `Query`: _the_ game state

Yes, there will be a single game, a single board, in the whole blockchain. This is our way of simplifying. We can decide right away how to serialize the board without effort because we have [this function](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L303):

> `func (game *Game) String() string`

And we store the board at `/store/board`, and return it in the response's `Value`, when requested via the [`Query`](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#query) command at `path = "/store/board"`. If and when we need to reinstantiate the board state out of its serialized form, we [can call](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L331):

> `func Parse(s string) (*Game, error)`

We also need to store whose turn it is to play. We choose to have a `bool` at `/store/turn`.

To store this state, our application needs its own database. It needs to store a state at a certain Merkle root value, too, so that it can be recalled at a later date. This is another implementation _detail_ that we need to address when creating our application.

#### `InitChain`: the initial chain state

[That's](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#initchain) where our only game is initialized. Tendermint sends `app_state_bytes: bytes` to our application, with the initial (genesis) state of the blockchain. In our case, we already know what it would look like, i.e. represent a single game. But our application is a good sport and:

* Take this initial state in;
* Saves it in its database;
* Returns, in `app_hash: bytes`, the Merkle root hash corresponding to this genesis state.

Notice how our application also has to handle the list of validators sent by Tendermint. Let's gloss over this _detail_.

#### A serialized transaction.

We need to decide how to represent a move. In our ready-made implementation, a position `Pos` is represented by [2 `int`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L42-L45), and a move by [2 `Pos`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L168). We can decide to represent a serialized move as 4 `int`, the first 2 for the original position `src`, and the next 2 for the destination position `dst`.

#### `BeginBlock`: a new block is about to be created

[This command](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#beginblock) instructs the application to load its state at the right place. More precisely, inside `header: Header`, as per its [detailed definition](https://github.com/tendermint/spec/blob/c939e15/spec/core/data_structures.md#header), we find:

> `AppHash: []byte`: Arbitrary byte array returned by the application after executing and commiting the previous block. It serves as the basis for validating any merkle proofs that comes from the ABCI application and represents the state of the actual application rather than the state of the blockchain itself. The first block's `block.Header.AppHash` is given by `ResponseInitChain.app_hash`.

This instructs the application to load, from its database, the right state of the blockchain, which includes the correct `/store/board`. It is important to insist on the fact that the application needs to be able to load a known state at any _point in time_. Indeed, there could have been a crash or a restore of some sort that has desynchronized Tendermint and the application.

In case the header has omitted the `AppHash`, which should never happen, the application should work off the last state it has arrived at.

With this state loaded, the application is ready to respond to the upcoming `CheckTx` and `DeliverTx`.

#### `CheckTx`: a new transaction appears in the transaction pool

That's where Tendermint [asks](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#checktx) our application whether the transaction is worth keeping at all. Because we want to simplify to the maximum, we only concern ourselves with whether there is a valid move in the transaction.

For that, we check whether there are 4 `int` in the serialized information. We can also check that the `int` themselves are within the boundaries of the board, i.e. between `0` and `7`.

It is better _not_ to check whether we have a [valid move](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L168):

> `func (game *Game) ValidMove(src, dst Pos) bool`

As a transaction may contain a move that is valid only when actually delivered, for instance if it needs another move to take place before it.

#### `DeliverTx`: a transaction is added and needs to be processed

Now, a pre-checked transaction [is delivered](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#delivertx). It is a matter of applying it to the latest board state. Conveniently, we can [call](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L274):

> `func (game *Game) Move(src, dst Pos) (captured Pos, err error)`

And handle the error if necessary. If it went ok, then we keep the new board state in memory, ready for the next delivered transaction. We do not save to storage at this point.

We can also choose to let it know what interesting information should be indexed via `events: repeated Event` in the response. The intent of these returned values is to return information that could be tedious to collect otherwise, and, if indexed, to allow a fast search across blocks for values of relevance. See [here](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#events) for what goes into an `Event`.

For the sake of the exercise, let's imagine that we emit some information in two events, one about the move itself, the other about the resulting board state. In pseudo-code form it looks like:

```
[
    { key: "name", value: "moveMetadata", index: true },
    { key: "whoPlayer", value: bool, index: true },
    { key: "isJump", value: bool, index: false},
    { key: "madeKing", value: bool, index: false},
    { key: "hasCaptured", value: bool, index: false},
    { key: "hasCapturedKing", value: bool, index: false},
    { key: "isWinning", value: bool, index: true}
],
[
    { key: "name", value: "boardState", index: true },
    { key: "whiteCount", value: uint32, index: false },
    { key: "whiteKingCount", value: uint32, index: false },
    { key: "redCount", value: uint32, index: false },
    { key: "redKingCount", value: uint32, index: false }
]
```

If you come from the Ethereum world, you will recognize these as _events_, a.k.a. indexed Solidity events, where the indexed fields are _topics_ in the transaction receipt logs.

Finally, it would be judicious to inform Tendermint about the `GasUsed (int64)`. Presumably each move costs the same so we can return `1`.

#### `EndBlock`: the block is being wrapped up

Now is [the time](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#endblock) to let Tendermint know about some things. Setting aside once more the validator thing, we need to let it know what events should be emitted, similarly to what happened on `DeliverTx`. In our case, we have only checkers moves, so it is not very clear what could be interesting to be searched at a later date.

For the sake of the argument, let's assume that we want to tally what happened in the block. So we return this aggregate event, in pseudo-code:

```
[
    { key: "name", value: "aggregateAction", index: true },
    { key: "whiteCapturedCount", value: uint32, index: false },
    { key: "whiteKingCapturedCount", value: uint32, index: false },
    { key: "redCapturedCount", value: uint32, index: false },
    { key: "redKingCapturedCount", value: uint32, index: false }
]
```

#### `Commit`: our work here is done

The block that has previously ended has now been [confirmed](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#commit), and the application needs to save its state to storage, to its database. And return, as `data: []byte`, the Merkle root hash of the blockchain's state, which, as you recall, includes `/store/board`. As mentioned in [the docs](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#determinism), this hash needs to be deterministic after the sequence of the same `BeginBlock`, the same `DeliverTx`'s in the same order, and the same `EndBlock`.

After having returned and saved, the application may also keep a pointer in its database as to which state is the latest, so it can purge the board from its memory. Indeed, the next `BeginBlock` will inform it which state to load; probably the same. In practice, the application ought to keep the state in memory so as to quickly build on it if the next `BeginBlock` fails to mention `AppHash`, or mentions the same.

<ExpansionPanel title="What if I like extreme serialization?">

As a hacky side-note, this `data` need not be strictly a Merkle root hash. It could well be any bytes as long as the result is deterministic, as mentioned earlier, and collision-resistant, and that the application can recover the state out of it. For instance, if we took our only board and serialized it differently, we could return the board state as such.

Namely, we have 64 cells, out of which only 32 are being used. Each cell has either nothing, a white pawn, a white king, a red pawn, or a red king. That's 5 possibilities, which can easily fit in a byte. So we need 32 bytes to describe the board. Since the first bit of a byte is never used when counting to 5, perhaps we can use the very first bit to indicate whose turn it is to play.

So here we go, we have a deterministic blockchain state, collision-resistant since the same value indicates an identical state, no external database to handle, and the full state is always stored in the block header.

</ExpansionPanel>

### Closing remarks:

We have waved our hands as to how we would create a state machine for the checkers game. You surely have already spotted a good number of shortcomings of our game blockchain. Let's see:

* Anyone, including the opponent, can post an anonymous transaction and play, instead of the intended player. This makes it impossible to know who did what. We need to find a way to identify the right player. Cosmos -> Accounts and signatures.
* Instead of a single game, we would prefer multiple games running in parallel, all in a store with an elaborate data model. We need a well-defined store. Cosmos -> Key store.
* It would be good if we had an elegant way to serialize our data objects of interest and our transactions. -> Protobuf.
* We want to penalize spam and bad transactions, and also to be able to play for money. Cosmos -> tokens.
* We want to tailor gas costs according to the transaction type. After all, there is a new transaction type of _create a game_. Cosmos -> tokens and gas.
* We need to handle the validators lists in the communication. Cosmos can do this for us.
* We want the player's GUI to easily reload its pending game(s). Cosmos -> Queries.
* We want to have an elegant facility to notify players when it’s their turn. Cosmos -> Events.
* We want to be able to easily add changes to our system in the future. Cosmos -> Migrations.
* We want to open up so that players can decide to play for money with different tokens. Cosmos -> IBC.

The Cosmos SDK will assist us in attending all these concerns without having to reinvent the wheel.
