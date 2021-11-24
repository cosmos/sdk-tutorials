---
title: "A Blockchain App Architecture"
order: 2
description: ABCI, Tendermint, and state machines
tag: fast-track
---

# Blockchain App Architecture

## What is Tendermint?

Created in 2014, [Tendermint](https://tendermint.com/) accelerates the development of distinct blockchains by providing a ready-made networking and consensus solution so that these do not have to be recreated by developers for each case. You may already be using Tendermint without being aware of it since other blockchains, including [Hyperledger Burrow](https://hyperledger.github.io/burrow/#/) and the [Binance Chain](https://www.binance.org/en/smartChain), use Tendermint.

More specifically, Tendermint modules **attend to consensus and networking**, two important components of any blockchain. This frees developers to consider what the blockchain should do at an application level without descending into lower-level blockchain concerns such as peer discovery, block propagation, consensus, and transaction finalization. Without Tendermint, developers would be forced to build software to address those concerns, which would add additional time, complexity, and cost to the development of the blockchain applications they have in mind.

![Blockchain application architecture overview](./images/architecture_overview.png)

A blockchain node for an application-focused Cosmos blockchain consists of a state-machine, built with the Cosmos SDK, and consensus and networking, which are handled by the Tendermint Core

As you might expect, Tendermint itself is modular and flexible. In the following, you will concentrate on the Tendermint Core used in Cosmos.

## Consensus in Tendermint Core and Cosmos

In summary, the Tendermint Core is a high-performance, consistent, and secure **consensus** module with strict fork accountability. It relies on Proof-of-Stake (PoS) with delegation and [Practical Byzantine Fault Tolerance](https://github.com/tendermint/tendermint). Participants signal support for well-behaved, reliable nodes that create and confirm blocks. Users signal support by staking ATOM (or whatever your token is named), with the possibility of acquiring a share of the network transaction fees, but also sharing the risk of reduced returns or even losses should the node become unreliable.

Network participants are incentivized to stake ATOM in the fittest nodes that they deem most likely to provide a dependable service, and to withdraw their support should conditions change. In this way, a Cosmos blockchain is expected to adjust the validator configuration and continue even in adverse conditions.

In more detail, only the top 150 nodes by staked ATOM, the **validators**, participate in the transaction finalization process. The privilege of creating a block is awarded in proportion to the voting power a validator has. **Voting power** is calculated as all ATOM tokens staked by a validator and its delegates. For example, if a given validator's voting power would be 15% of the total voting power of all validators, then it can expect to receive the block creation privilege 15% of the time.

The block is broadcast to the other validators, who are expected to respond promptly and correctly. They will absorb penalties for failing to do so. Validators confirm candidate blocks. They can and must, of course, reject invalid blocks. They accept the block by returning their signature. When sufficient signatures have been collected by the block creator then the block is finalized and broadcast to the wider network.

Interestingly, there is no ambiguity in this process. Either a block has the necessary signatures or it does not. If it does, insufficient signatories exist to overturn the block and the block can be understood as **finalized** because there is no process in which the blockchain would be reorganized. This provides a level of certainty when it comes to transaction finality that a probabilistic system like Proof-of-Work (PoW) cannot match.

Aggressive block times are feasible because the process is aimed at high performance, so to say dedicated validators with good network connectivity. This is quite different from PoW, which favors inclusion and must accommodate slower nodes with greater latency and less reliability. A Cosmos blockchain can handle thousands of transactions per second with confirmations taking seven seconds.

Even though validation is delegated to a subset of all network nodes, the validators, the process avoids concentration of power. The community of users elects the validators, in a manner of speaking, by staking ATOM and thus, participating in both the rewards and the risks of committing to provide a reliable, responsible block validation service.

## Upgradeability

In any known blockchain, a change in the implementation requires an upgrade to the node software running on each node. In a disorderly process with voluntary participation, this can result in a hard fork - a situation in which one constituency forges ahead with the old rules and another adopts new rules. While this arrangement has positive aspects and proponents, it also has clear disadvantages in settings where **certainty** is a strict requirement. For example, uncertainty about transaction finality, regardless of how minuscule the uncertainty might be, may be unacceptable in settings that are concerned with registries and large assets.

In a Tendermint blockchain, transactions are irreversibly finalized upon block creation and upgrades are themselves governed by the block creation and validation process, which leaves no room for uncertainty. Either the nodes agree to simultaneously upgrade their protocol, or the upgrade proposal fails.

Validators are the ones who vote. This means that delegators ought to be discerning when delegating, as this also lends their vote.

## Application Blockchain Interface (ABCI)

[Tendermint BFT](https://tendermint.com/core/) packages the **networking and consensus layers** of a blockchain and presents an interface to the application layer, the **Application Blockchain Interface (ABCI)**. Developers focus on higher-order concerns while delegating peer-discovery, validator selection, staking, upgrades, and consensus to the Tendermint BFT. The consensus engine running in one process controls the state machine, the application runs in another process. The architecture is equally appropriate for **private or public blockchains**.

Tendermint BFT engine is connected to the application by a socket protocol, the ABCI. ABCI presents a socket for use by applications written in other languages. When the application is written in the same language as the Tendermint implementation, the socket is not used.

![The application, ABCI, and Tendermint](./images/ABCI_2.png)

The Tendermint BFT provides security guarantees, including:

* **Forks** are never created provided that half or more validators are honest.
* There is **strict accountability** for fork creation. Liability can be determined.
* Transactions are finalized as soon as a block is created.

The Tendermint BFT is not concerned with the interpretation of transactions. That would be the application layer. Tendermint presents confirmed, well-formed transactions and blocks of transactions agnostically and facilitates the reverse - sending a transaction. Tendermint is un-opinionated about the meaning transactions have.

The *block time* is approximately seven seconds and blocks may contain thousands of transactions. Transactions are finalized and cannot be overturned as soon as they appear in a block.

<HighlightBox type="info">

For a deeper dive on consensus and Tendermint, visit:

* [Podcast on consensus systems with Ethan Buchman](https://softwareengineeringdaily.com/2018/03/26/consensus-systems-with-ethan-buchman/)
* [Tendermint: Ecosystem](https://tendermint.com/core/#ecosystem)

</HighlightBox>

There are at least two broad **approaches to application-level concerns** using blockchains. One way is to create a purpose-built blockchain where everything that can be done is defined in the protocol. The other method is to create a programmable state machine and push application concerns to a higher level, such as bytecode created by compilers interpreting higher-level languages. Ethereum-like blockchains are part of the second category. Only the state machine is defined in the on-chain protocol, which defines the rules of contract creation, interaction, execution, and little else.

This method is not without its limitations. First, very little is universally defined. Standards for basic concerns such as tokens emerge organically through voluntary participation. Second, contracts can and do contain repetitive code that may or may not correctly implement the developer's intentions. Third, the inherent flexibility of it makes it challenging to reason about what is correct or even what is friendly. Finally, there are practical limits to the complexity of operations that are very low as compared to what is possible in other settings. These limits make it especially difficult to perform analysis or reorganize data, and developers are forced to adapt to the constraints.

A **purpose-built or application-specific blockchain** is different. There are no hard limits the application developers themselves do not believe are reasonable and necessary. There is no need to present a "Turing-complete" language or a general-purpose, programmable state machine because application concerns are addressed by the protocol the developers create.

Developers who have worked with blockchains based on the Ethereum Virtual Machine (EVM) will recognize a shift in the way concerns are addressed. Authorization and access control, the layout of storage (also known as the state), and application governance - application logic, generally - are not implemented as contracts on a state machine. They become properties of a unique blockchain that is built for a singular purpose.

## Cosmos SDK

Developers create the application layer using the **Cosmos SDK**. The Cosmos SDK provides both a scaffold to get started and a rich set of modules that address common concerns. It provides a head start and a framework for getting started, as well as a rich set of modules that address common concerns such as governance, tokens, other standards, and interactions with other blockchains through the Inter-Blockchain Communication protocol (IBC). The creation of a purpose-built blockchain with the Cosmos SDK is largely a process of selecting, configuring, and integrating well-solved modules, also known as composing modules. This greatly reduces the scope of original development required since development is mostly focused on the truly novel aspects of the application.

<HighlightBox type="info">

Later, we will dive further into the IBC protocol. **IBC** is a common framework for exchanging information between blockchains. For now, it is enough to know that it exists and it enables seamless interaction between blockchains that want to transfer value (token transfers) and exchange information. In summary, it enables the communication between applications that run on separate purpose-built/application-specific blockchains.

</HighlightBox>

Importantly, the application, consensus, and network layers are contained within the custom blockchain node that forms the foundation of the custom blockchain.

![Node, blockchain layers, and ABCI](./images/ABCI.png)

Tendermint passes confirmed transactions to the application layer through the **Application Blockchain Interface (ABCI)**. The application layer must implement the ABCI, which is a socket protocol. In this way, Tendermint is unconcerned with the interpretation of transactions and the application layer can be unconcerned with propagation, broadcast, confirmation, network formation, and other lower-level concerns that Tendermint attends to unless it wants to inspect such properties.

Since the ABCI is a sockets protocol, developers are free to create blockchains in any language that supports sockets, provided their application implements the ABCI. The ABCI defines the boundary between replication concerns and the application, which is a state machine.

This is itself a considerable step forward that simplifies the creation of unique blockchains.

<HighlightBox type="info">

More detailed information on the ABCI can be found here:

* [ABCI GitHub repository: ABCI prose specification](https://github.com/tendermint/abci/blob/master/specification.md)
* [Tendermint GitHub repository: A Protobuf file on types](https://github.com/tendermint/abci/blob/master/types/types.proto)
* [Tendermint GitHub repository: A Go interface](https://github.com/tendermint/abci/blob/master/types/application.go)
* [The Tendermint Core documentation](https://docs.tendermint.com/)

</HighlightBox>

## State machines

At its core, a blockchain is a replicated state machine. A **state machine** is a computer science concept, in which a machine can have multiple states but only one state at a time. And there is a state transition process or a set of defined processes, which are the only way the state changes from the old state (`S`) to a new state (`S'`).

![State machine](./images/state_machine_1.png)

The **state transition function** in a blockchain is virtually synonymous with a transaction. Given an initial state, a confirmed transaction, and a set of rules for interpreting that transaction, the machine transitions to a new state. The rules of interpretation are defined at the application layer.

Blockchains are deterministic, so the only correct interpretation of the transaction is the new state, shown as S-prime in the illustration above (`S'`).

Blockchains are distributed and, in practice, transactions arrive in batches called blocks. There is a machine state that exists after the correct interpretation of each transaction in the block. Each transaction executes in the context of the state machine that resulted from every transaction that preceded it. The machine state that exists after all transactions in the block have been executed is a useful checkpoint, especially when one is interested in historic states.

![State machine](./images/state_machine_2.png)

Developers can create the state machine using the Cosmos SDK. This includes storage organization, also known as the state, and the state transition functions, which determine what is permissible and what, if any, adjustments to the state result from each kind of transaction.

In this context, the "consensus" establishes a canonical set of well-ordered blocks that contain well-ordered transactions. The chain of blocks is therefore a well-ordered set of all finalized transactions, and all nodes agree that the canonical set is the only relevant set. Since the state machine defined by the developers is deterministic, there is only one correct interpretation of the canonical transaction set and, by extension, only one correct determination of the state machine when any given transaction is executed or at any block height.

This state machine definition is silent on the processes that confirm and propagate transactions, and Tendermint is agnostic about the meaning of the blocks it organizes. The Tendermint consensus establishes the ordered set of transactions. By extension, the nodes reach consensus about the state of the application.

## Additional details

Many transactions that could be broadcast should not be broadcast. Examples include malformed transactions and spam-like artifacts. Since Tendermint is agnostic when it comes to transaction interpretation, it cannot make this determination on its own. Therefore, the Application Blockchain Interface includes a `CheckTx` method, which Tendermint uses to ask the application layer if the transaction meets the minimum acceptability criteria. Applications implement this function.

When blocks are received, Tendermint calls the `DeliverTx` method to pass the information to the application layer for interpretation and possible state machine transition.

Additionally, `BeginBlock` and `EndBlock` messages are sent through the ABCI even if blocks contain no transactions. This provides positive confirmation of basic connectivity and of time periods with no operations. More to the point, these methods facilitate the execution of scheduled processes that should run in any case because they call methods at the application level, where developers can define processes. It is wise to be cautious about adding too much computational weight at the start or completion of each block since the blocks arrive at approximately seven-second intervals and too much work could slow down your blockchain.

Any application that uses Tendermint for consensus must implement the ABCI. Fortunately, you do not have to do this manually because the Cosmos SDK provides a boilerplate known as BaseApp to get you started.

In the following suggested exercise, you will create a minimal distributed state machine with the Cosmos SDK, and see code samples implementing concepts progressively. Your state machine will rely on Tendermint for consensus.

## Some code perhaps?

With your learnings about Tendermint, could you **design** a minimal distributed state machine/blockchain that allows people to play the game of checkers? In the collapsed box below, you are invited to start this reflection and reinforce your understanding of Tendermint. Later, in other pages, you will continue to apply the learnings of the sections to your checkers game and design such a blockchain by using elements of the Cosmos SDK. Feel free to skip it if this is not your thing.

<ExpansionPanel title="Let's make a checkers blockchain">

*What is this game of checkers all about?*

This is the introduction to a **design project** that you can continue to grow and develop as you learn more. In doing so, you will see how the Cosmos SDK improves your productivity by handling the boilerplate. It is still interesting to know what the boilerplate does to get a better overall picture.

<HighlightBox type="tip">

This is meant as a mental exercise. If you want to go from the design phase to the **implementation** phase, head to [My Own Cosmos Chain](../5-my-own-chain/01-index.md).

</HighlightBox>

### The setup

You are going to design a blockchain that lets people play checkers against each other. There are many versions of the rules. Let's choose [these simple rules](https://www.ducksters.com/games/checkers_rules.php) for the purpose of this exercise. The object of the exercise is to understand ABCI and learn more about working with the Cosmos SDK, not to get lost in the proper implementation of the board state or the rules of checkers. So you are going to use, and adapt, [this ready-made implementation](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go), with the additional rule that the board is 8x8 and played on black cells. The code will likely require adaptations as you go along. Also, you are not going to be overly concerned with a marketable GUI since, again, that would be a separate design project in itself. Of course, you still need to concern yourself with creating the groundwork for a GUI for it to be possible in the first place.

<HighlightBox type="info">

In the next chapters, when you revisit this design exercise, the goal is to improve it and use the Cosmos SDK as you learn about the different components. If you are not interested in learning more about ABCI, it is safe to skip what comes below and head straight to the rest of the learning elements.

</HighlightBox>

As you can imagine, beyond the rules of the game, there is a lot you need to take care of. Therefore, as a start, you ought to simplify to the maximum. Have a look at these [ABCI specs](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md) to see what the application needs to do to comply with ABCI, and try to figure out which barebones you would use to make your first, imperfect, checkers game blockchain.

### "Make" the state machine

Here is how you _would_ do it to learn the Cosmos SDK primarily, not to become proficient at implementing ABCI.

You want to show the minimum viable ABCI state machine. Tendermint does not concern itself with whether proposed transactions are valid, and about how the state changes after such a transaction. It delegates these to the state machine, which will _interpret_ transactions as game moves and states.

Let's go through the important junctures at which the application has to act.

#### Start the application

This state machine is an application that needs to start before it can receive any requests from Tendermint. Take this opportunity to load in memory static elements, here, the acceptable general moves. Fortunately, this code exists already and is run automatically when the module is loaded:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L75]
func init()
```

#### `Query`: _The_ game state

For now, there will be a single game, a single board, in the whole blockchain. This is a way of simplifying. You can decide right away how to serialize the board without effort because you have this function:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L303]
func (game *Game) String() string
```

And, you store the board at `/store/board`, and return it in the response's `Value`, when requested via the [`Query`](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#query) command at `path = "/store/board"`. Conversely, if and when you need to re-instantiate the board state out of its serialized form, you can call:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L331]
func Parse(s string) (*Game, error)
```

Sadly, the `String()` function does not save the `.Turn` field, so you need to store whose turn it is to play on your own. You choose to have a `string` at `/store/turn` with the color of the player.

To store this state, your application needs its own database. It needs to store a state at a certain Merkle root value, too, so that it can be recalled at a later date. This is another implementation _detail_ that you need to address when creating your application. Unless the Cosmos SDK does this for you.

#### `InitChain`: The initial chain state

[That's](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#initchain) where your only game is initialized. Tendermint sends `app_state_bytes: bytes` to your application, with the initial (genesis) state of the blockchain. In your case, you already know what it would look like, i.e. represent a single game. But your application is a good sport and:

* Takes this initial state in.
* Saves it in its database. Along with [black](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L124) having to play next.
* Returns, in `app_hash: bytes`, the Merkle root hash corresponding to this genesis state.

Notice how your application also has to handle the list of validators sent by Tendermint. Let's gloss over this _detail_. Yes, Cosmos SDK's BaseApp will take care of that.

#### A serialized transaction

You need to decide how to represent a move. In your ready-made implementation, a position `Pos` is represented by [two `int`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L42-L45), and a move by [two `Pos`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L168). You can decide to represent a serialized move as four `int`, the first two for the original position `src`, and the next two for the destination position `dst`.

#### `BeginBlock`: A new block is about to be created

[This command](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#beginblock) instructs the application to load its state at the right place. More precisely, inside `header: Header`, as per its [detailed definition](https://github.com/tendermint/spec/blob/c939e15/spec/core/data_structures.md#header), you find:

> `AppHash: []byte`: Arbitrary byte array returned by the application after executing and committing the previous block. It serves as the basis for validating any Merkle proofs that come from the ABCI application and represents the state of the actual application rather than the state of the blockchain itself. The first block's `block.Header.AppHash` is given by `ResponseInitChain.app_hash`.

This instructs the application to load from its database - the implementation _detail_ you skipped - the right state of the application, which includes the correct `/store/board`. It is important to insist on the fact that the application needs to be able to load a known state at any _point in time_. Indeed, there could have been a crash or a restore of some sort that has desynchronized Tendermint and the application.

In case the header has omitted the `AppHash`, which should never happen, the application should work off the last state it has arrived at.

With this state loaded, the application is ready to respond to the upcoming `CheckTx` and `DeliverTx`.

#### `CheckTx`: A new transaction appears in the transaction pool

That's where Tendermint [asks](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#checktx) your application whether the transaction is worth keeping at all. Because you want to simplify to the maximum, you only concern yourself with whether there is a valid move in the transaction.

For that, you check whether there are four `int` in the serialized information. You can also check that the `int` themselves are within the boundaries of the board, i.e. between `0` and `7`.

It is better **not** to check whether you have a valid move:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L168]
func (game *Game) ValidMove(src, dst Pos) bool
```

Checking whether a move is valid with regards to the board, needs the board to have been updated beforehand. Alas, the board is updated only up to the point where the transactions have been delivered. And you may have a situation where two transactions have been sent one after the other, both in fact valid. In this rare situation, if you tested the move in the second transaction against the board, it would appear invalid because the first transaction had been checked but not delivered yet. Therefore, testing a move on the board at CheckTx time is better avoided.

#### `DeliverTx`: A transaction is added and needs to be processed

Now, a pre-checked transaction [is delivered](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#delivertx). It is a matter of applying it to the latest board state. Conveniently, you can call:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L274]
func (game *Game) Move(src, dst Pos) (captured Pos, err error)
```

And handle the error if necessary, in particular, you need to see whether it makes sense to send it back through the ABCI, or to swallow it. If it went ok, then you keep the new board state in memory, ready for the next delivered transaction. You do not save to storage at this point.

You can also choose to let it know what interesting information should be indexed via `events: repeated Event` in the response. The intent of these returned values is to return information that could be tedious to collect otherwise, and, if indexed, to allow a fast search across blocks for values of relevance. See [here](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#events) for what goes into an `Event`.

For the sake of the exercise, let's imagine that you emit some information in two events, one about the move itself, the other about the resulting board state. In pseudo-code form it looks like:

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
    { key: "blackCount", value: uint32, index: false },
    { key: "blackKingCount", value: uint32, index: false },
    { key: "redCount", value: uint32, index: false },
    { key: "redKingCount", value: uint32, index: false }
]
```

If you come from the Ethereum world, you will recognize these as _events_, a.k.a. Solidity events, where the indexed fields are _topics_ in the transaction receipt logs.

Finally, it would be judicious to inform Tendermint about the `GasUsed (int64)`. Presumably, each move costs the same so you can return `1`.

#### `EndBlock`: The block is being wrapped up

Now is [the time](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#endblock) to let Tendermint know about some things. Setting aside once more the validator thing, you need to let it know what events should be emitted, similarly to what happened on `DeliverTx`. In your case, you have only checkers moves, so it is not very clear what could be interesting to be searched at a later date.

For the sake of the argument, let's assume that you want to tally what happened in the block. So, you return this aggregate event, in pseudo-code:

```
[
    { key: "name", value: "aggregateAction", index: true },
    { key: "blackCapturedCount", value: uint32, index: false },
    { key: "blackKingCapturedCount", value: uint32, index: false },
    { key: "redCapturedCount", value: uint32, index: false },
    { key: "redKingCapturedCount", value: uint32, index: false }
]
```

#### `Commit`: Your work here is done

The block, which has previously ended, has now been [confirmed](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#commit). The application needs to save its state to storage, to its database, and return, as `data: []byte`, the Merkle root hash of the blockchain's state, which, as you recall, includes `/store/board`. As mentioned in [the documentation](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#determinism), this hash needs to be deterministic after the sequence of the same `BeginBlock`, the same `DeliverTx`'s in the same order, and the same `EndBlock`.

After having returned and saved, the application may also keep a pointer in its database as to which state is the latest, so it can purge the board from its memory. Indeed, the next `BeginBlock` will inform it about which state to load; probably the same. In practice, the application ought to keep the state in memory to quickly build on it if the next `BeginBlock` fails to mention `AppHash`, or mentions the same.

### What if I like extreme serialization?

As a hacky side-note, this `data` need not be strictly a Merkle root hash. It could well be any bytes as long as the result is deterministic, as mentioned earlier, and collision-resistant, and that the application can recover the state out of it. For instance, if you took your only board and serialized it differently, you could return the board state as such.

Namely, you have 64 cells, out of which only 32 are being used. Each cell has either nothing, a black pawn, a black king, a red pawn, or a red king. That's 5 possibilities, which can easily fit in a byte. So you need 32 bytes to describe the board. Since the first bit of a byte is never used when counting to five, perhaps you can use the very first bit to indicate whose turn it is to play.

So here you go, you have a deterministic blockchain state, collision-resistant since the same value indicates an identical state, no external database to handle, and the full state is always stored in the block header.

</ExpansionPanel>

### Closing remarks

You have waved your hands as to how you would create a state machine for the checkers game. You surely have already spotted a good number of shortcomings in your game blockchain. Let's see:

* Anyone, including the opponent, can post an anonymous transaction and play, instead of the intended player. This makes it impossible to know who did what. You need to find a way to identify the right player. Cosmos SDK to the rescue with [accounts and signatures](./04-accounts).
* Instead of a single game, you would prefer multiple games running in parallel, all in a performant store with an elaborate data model. You need a well-defined store. See Cosmos SDK's [key store](./10-multistore-keepers).
* It would be good if you had an elegant way to serialize your data objects of interest and your transactions. See [Protobuf](./09-protobuf).
* You want to penalize spam and bad transactions, and also to be able to play for money. Enter tokens defined in another [existing Cosmos SDK module](./08-modules).
* You want to tailor gas costs according to the transaction type. After all, there is a new transaction type of _create a game_. You can account for that in Cosmos SDK's [context object](./14-context).
* You need to handle the validators lists in the communication. Cosmos can do this for you out of the box with the [BaseApp](./11-base-app).
* You want the player's GUI to easily reload their pending game(s) and let them know whether a move is valid or not. That's a good use of Cosmos SDK's [queries](./12-queries).
* You want to have an elegant facility to use Tendermint's events and to notify players when it’s their turn. Cosmos SDK provides that with [events](./13-events).
* You want to be able to easily add changes to your system in the future, after it has been in production. You can handle that with Cosmos SDK [migrations](./15-migrations).
* You want to open up so that players can decide to play for money with different tokens. Good thing Cosmos SDK already integrates [IBC](./16-ibc) for tokens coming from other blockchains.

In short, the Cosmos SDK will assist you in attending to all these concerns without you having to reinvent the wheel.
