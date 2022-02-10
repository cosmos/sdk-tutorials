---
title: "A Blockchain App Architecture"
order: 2
description: ABCI, Tendermint, and state machines
tag: fast-track
---

# A Blockchain App Architecture

In this section, let's take a closer look at the application architecture underlying blockchains built with the Cosmos SDK. You will look into Tendermint, consensus in Cosmos, the Application Blockchain Interface, the Cosmos SDK, and state machines. This section will give you a better feeling for the application architecture in Cosmos.

## What is Tendermint?

Created in 2014, [Tendermint](https://tendermint.com/) accelerates the development of distinct blockchains by providing a ready-made networking and consensus solution. Networking and consensus do not have to be recreated by developers for each case. You may already be using Tendermint without being aware of it as other blockchains like [Hyperledger Burrow](https://hyperledger.github.io/burrow/#/) and the [Binance Chain](https://www.binance.org/en/smartChain) use Tendermint.

Tendermint modules **attend to consensus and networking**. These are two important components of any blockchain. This frees developers to focus on the application level without descending into lower-level blockchain concerns such as peer discovery, block propagation, consensus, and transaction finalization. Without Tendermint, developers would be forced to build software to address these concerns which would add additional time, complexity, and cost to the development of their applications.

![Blockchain application architecture overview](/architecture_overview.png)

A blockchain node for an application-focused Cosmos blockchain consists of a state-machine, built with the Cosmos SDK, and the consensus and networking layer, which are handled by the [Tendermint Core](https://tendermint.com/core/).

<ExpansionPanel title="What is the Tendermint Core?">

The Tendermint Core is a blockchain application platform. Tendermint Core supports state machines in any language. The language-agnostic Tendermint Core helps developers securely and consistently replicate deterministic, finite state machines.

Tendermint BFT is maintained even when 1/3 of all machines fail by providing two components:

* A blockchain consensus engine
* A generic application interface

Want to continue exploring this useful component of the Cosmos SDK? You can find further information beneath under _Consensus in Tendermint Core and Cosmos_ or in the [Tendermint Core documentation](https://docs.tendermint.com/master/#).

</ExpansionPanel>

## Consensus in Tendermint Core and Cosmos

The Tendermint Core is a high-performance, consistent, flexible, and secure **consensus** module with strict fork accountability. It relies on Proof-of-Stake (PoS) with delegation and [Practical Byzantine Fault Tolerance](https://github.com/tendermint/tendermint). Participants signal support for well-behaved, reliable nodes that create and confirm blocks. Users signal support by staking ATOM or the native token of the respective chain. Staking bears the possibility of acquiring a share of the network transaction fees, but also the risk of reduced returns or even losses should the node become unreliable.

Network participants are incentivized to stake their ATOM with nodes, which are the most likely to provide dependable service, and to withdraw their support should conditions change. A Cosmos blockchain is expected to adjust the validator configuration and continue even in adverse conditions.

Only the top 150 nodes by staked ATOM participate in the transaction finalization process as **validators**. The privilege of creating a block is awarded in proportion to the voting power a validator has. **Voting power** is calculated as all ATOM tokens staked by a validator and its delegates. For example, if a given validator's voting power is 15% of the total voting power of all validators, then the validator can expect to receive the block creation privilege 15% of the time.

The block is broadcast to the other validators, who are expected to respond promptly and correctly:

* Validators confirm candidate blocks.
* Validators absorb penalties for failing to do so.
* Validators can and must reject invalid blocks.
* Validators accept the block by returning their signature.

When sufficient signatures have been collected by the block creator the block is finalized and broadcast to the wider network. There is no ambiguity in this process: either a block has the necessary signatures or it does not. If it does, insufficient signatories exist to overturn the block and the block can be understood as **finalized** - there is no process in which the blockchain would be reorganized. This provides a level of certainty when it comes to transaction finality that a probabilistic system like Proof-of-Work (PoW) cannot match.

Aggressive block times are feasible because the process is aimed at high performance and is based on dedicated validators with good network connectivity. This is quite different from PoW, which favors inclusion and must accommodate slower nodes with greater latency and less reliability. A Cosmos blockchain can handle thousands of transactions per second with confirmations taking seven seconds.

Even though validation is delegated to a subset of all network nodes, the process avoids the concentration of power. The community of users elects the validators by staking ATOM and participating in both the rewards and the risks of committing to providing a reliable, responsible block validation service.

## Upgradeability of chains

In any known blockchain, a change in the implementation requires an upgrade to the node software running on each node. In a disorderly process with voluntary participation, this can result in a hard fork - a situation in which one constituency forges ahead with the old rules and another adopts new rules. While this arrangement has positive aspects and proponents, it also has clear disadvantages in settings where **certainty** is a strict requirement. For example, uncertainty about transaction finality regardless of the degree of uncertainty may be unacceptable in settings that are concerned with authoritative registries and large assets.

In a Tendermint blockchain transactions are irreversibly finalized upon block creation and upgrades are themselves governed by the block creation and validation process. This leaves no room for uncertainty. Either the nodes agree to simultaneously upgrade their protocol, or the upgrade proposal fails.

Validators are the ones who vote. This means that delegators should be demanding when delegating as they also lend their vote to the validator.

## Application Blockchain Interface (ABCI)

[Tendermint BFT](https://tendermint.com/core/) packages the networking and consensus layers of a blockchain and presents an interface to the application layer, the **Application Blockchain Interface (ABCI)**. Developers can focus on higher-order concerns while delegating peer-discovery, validator selection, staking, upgrades, and consensus to the Tendermint BFT. The consensus engine running in one process controls the state machine, the application runs in another process. The architecture is equally appropriate for **private or public blockchains**.

The Tendermint BFT engine is connected to the application by a socket protocol. ABCI provides a socket for applications written in other languages. When the application is written in the same language as the Tendermint implementation, the socket is not used.

![The application, ABCI, and Tendermint](/ABCI_3.png)

The Tendermint BFT provides security guarantees, including:

* **Forks** are never created, provided that half or more validators are honest.
* **Strict accountability** for fork creation allows determining liability.
* Transactions are **finalized** as soon as a block is created.

The Tendermint BFT is not concerned with the interpretation of transactions. That would be the application layer. Tendermint presents confirmed, well-formed transactions and blocks of transactions agnostically. Tendermint is un-opinionated about the meaning transactions have.

The _block time_ is approximately seven seconds and blocks may contain thousands of transactions. Transactions are finalized and cannot be overturned as soon as they appear in a block.

<HighlightBox type="info">

For a deeper dive on consensus and Tendermint visit:

* the [podcast on consensus systems](https://softwareengineeringdaily.com/2018/03/26/consensus-systems-with-ethan-buchman/) with Ethan Buchman
* the [Tendermint Core documentation on consensus](https://docs.tendermint.com/master/introduction/what-is-tendermint.html#consensus-overview)

</HighlightBox>

There are at least two broad **approaches to application-level concerns** using blockchains:

1. Create an application-specific blockchain where everything that can be done is defined in the protocol.
2. Create a programmable state machine and push application concerns to a higher level, such as bytecode created by compilers interpreting higher-level languages.

Ethereum-like blockchains are part of the second category. Only the state machine is defined in the on-chain protocol, which defines the rules of contract creation, interaction, execution, and little else.

This method is not without its limitations:

* Very little is universally defined: standards for basic concerns such as tokens emerge organically through voluntary participation.
* Contracts can and do contain repetitive code that may or may not correctly implement the developer's intentions.
* The inherent flexibility makes it challenging to reason about what is correct or even what is friendly.
* There are practical limits to the complexity of operations, which are very low compared to what is possible in other settings.

These limitations make it especially difficult to perform analysis or reorganize data, and developers are forced to adapt to the constraints.

A **purpose-built or application-specific blockchain** is different. There is no need to present a "Turing-complete" language or a general-purpose, programmable state machine because application concerns are addressed by the protocol the developers create.

Developers who have worked with blockchains based on the Ethereum Virtual Machine (EVM) will recognize a shift in the way concerns are addressed. Authorization and access control, the layout of storage/ the state, and application governance are not implemented as contracts on a state machine. They instead become properties of a unique blockchain that is built for a singular purpose.

## The Cosmos SDK

Developers create the application layer using the **Cosmos SDK**. The Cosmos SDK provides:

<Accordion :items="
    [
        {
            title: 'A scaffold to get started',
            description: 'The Cosmos SDK provides a head start and a framework for getting started'
        },
        {
            title: 'A rich set of modules',
            description: 'The Cosmos SDK provides a rich set of modules that address common concerns such as governance, tokens, other standards, and interactions with other blockchains through the Inter-Blockchain Communication Protocol (IBC).'
        }
    ]
"/>

The creation of an application-specific blockchain with the Cosmos SDK is largely a process of selecting, configuring, and integrating well-solved modules also known as composing modules. This greatly reduces the scope of original development required as development is mostly focused on the truly novel aspects of the application.

<HighlightBox type="info">

The Inter-Blockchain Communication Protocol (IBC) is a common framework for exchanging information between blockchains. For now, it is enough to know that it exists and it enables seamless interaction between blockchains that want to transfer value (token transfers) and exchange information. It enables communication between applications that run on separate application-specific blockchains.

We will dive further into the Inter-Blockchain Communication Protocol (IBC) in a [later section of this chapter](./ibc.md).

</HighlightBox>

The application, consensus, and network layers are contained within the custom blockchain node that forms the foundation of the custom blockchain.

Tendermint passes confirmed transactions to the application layer through the **Application Blockchain Interface (ABCI)**. The application layer must implement ABCI, which is a socket protocol. Tendermint is unconcerned with the interpretation of transactions and the application layer can be unconcerned with propagation, broadcast, confirmation, network formation, and other lower-level concerns that Tendermint attends to unless it wants to inspect such properties.

Developers are free to create blockchains in any language that supports sockets since the ABCI is a socket protocol, provided their application implements ABCI. ABCI defines the boundary between replication concerns and the application, which is a state machine.

This is itself a considerable step forward that simplifies the creation of unique blockchains.

<HighlightBox type="info">

If you want to continue exploring ABCI, you can find more detailed information here:

* [ABCI GitHub repository: ABCI prose specification](https://github.com/tendermint/abci/blob/master/specification.md)
* [Tendermint GitHub repository: A Protobuf file on types](https://github.com/tendermint/abci/blob/master/types/types.proto)
* [Tendermint GitHub repository: A Go interface](https://github.com/tendermint/abci/blob/master/types/application.go)
* [The Tendermint Core documentation](https://docs.tendermint.com/)

</HighlightBox>

## State machines

A blockchain is a replicated state machine at its core. A **state machine** is a computer science concept, in which a machine can have multiple states but only one state at a time. And there is a state transition process or a set of defined processes, which are the only way the state changes from the old state (`S`) to a new state (`S'`).

<H5PComponent :contents="['/h5p/M2-architecture-statemachines-HS']"></H5PComponent>

The **state transition function** in a blockchain is synonymous with a transaction. Given an initial state, a confirmed transaction, and a set of rules for interpreting that transaction the machine transitions to a new state. The rules of interpretation are defined at the application layer.

Blockchains are deterministic. The only correct interpretation of the transaction is the new state, shown as S-prime in the illustration above (`S'`).

Blockchains are distributed and transactions arrive in batches called blocks. The machine state
subsists after the correct interpretation of each transaction in a block. Each transaction executes in the context of the state machine that resulted from every preceding transaction. The machine state after all transactions are executed is a useful checkpoint especially for historic states.

<H5PComponent :contents="['/h5p/M2-architecture-statemachines2-HS']"></H5PComponent>

Developers can create the state machine using the Cosmos SDK. This includes:

* Storage organization: also known as the state.
* State transition functions: determine what is permissible and if adjustments to the state result from a transaction.

In this context, the "consensus" establishes a canonical set of well-ordered blocks containing well-ordered transactions. All nodes agree that the canonical set is the only relevant set of all finalized transactions. There is only one correct interpretation of the canonical transaction set at any given transaction execution or any block height due to the state machine's determinism.

This state machine definition is silent on the processes that confirm and propagate transactions. Tendermint is agnostic to the interpretation of the blocks it organizes. The Tendermint consensus establishes the ordered set of transactions. The nodes then reach consensus about the state of the application.

## Additional details

It is time to look at some details when it comes to transactions and blocks.

### `CheckTx`

Many transactions that could be broadcast should not be broadcast. Examples include malformed transactions and spam-like artifacts. Tendermint cannot determine the transaction interpretation on its own because it is agnostic to it. To address this the Application Blockchain Interface includes a `CheckTx` method. Tendermint uses the method to ask the application layer if a transaction is valid. Applications implement this function.

### `DeliverTx`

Tendermint calls the `DeliverTx` method to pass block information to the application layer for interpretation and possible state machine transition.

### `BeginBlock` and `EndBlock`

`BeginBlock` and `EndBlock` messages are sent through the ABCI even if blocks contain no transactions. This provides positive confirmation of basic connectivity and helps identify time periods with no operations. These methods facilitate the execution of scheduled processes that should always run because they call methods at the application level, where developers can define processes.

<HighlightBox type="tip">

It is wise to be cautious about adding too much computational weight at the start or completion of each block as the blocks arrive at approximately seven-second intervals. Too much work could slow down your blockchain.

</HighlightBox>

Any application that uses Tendermint for consensus must implement ABCI. You do not have to do this manually because the Cosmos SDK provides a boilerplate known as BaseApp to get you started.

You will create a minimal distributed state machine with the Cosmos SDK and see code samples implementing concepts progressively in the following suggested exercise. Your state machine will rely on Tendermint for consensus.

## Some code perhaps?

With all you learned about Tendermint: can you **design** a minimal distributed state machine? A blockchain that allows people to play the game of checkers? In the collapsed box below, you are invited to start this reflection and reinforce your understanding of Tendermint.

You will continue to apply the learnings of the later sections to your checkers game and design a blockchain by using elements of the Cosmos SDK. Feel free to skip it if you prefer to continue with [accounts in the Cosmos SDK](./accounts.md).

<ExpansionPanel title="Let's make a checkers blockchain">

*Why develop a game of checkers?*

This **design project** will evolve in stages as you learn more about the Cosmos SDK. You will better understand and experience how the Cosmos SDK improves your productivity by handling the boilerplate as you progress through the sections and take a look at what the boilerplate does.

<HighlightBox type="tip">

This is meant as a design exercise. If you want to go from the design phase to the **implementation** phase, head to the [My Own Cosmos Chain](../4-my-own-chain/index.md) section.

</HighlightBox>

### The setup

You are going to design a blockchain that lets people play checkers against each other. There are many versions of the rules. Choose [these simple rules](https://www.ducksters.com/games/checkers_rules.php) for this exercise. The object of the exercise is to understand ABCI and learn more about working with the Cosmos SDK, not to get lost in the proper implementation of the board state or the rules of checkers.

Use and adapt [this ready-made implementation](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go) including the additional rule that the board is 8x8 and played on black cells. The code will likely require adaptations as you go along. You are not going to be overly concerned with a marketable GUI. That is a separate design project in itself. You still need to create the groundwork for the GUI to make sure the GUI is _possible_.

<HighlightBox type="info">

When you revisit this design exercise in the next chapters, the goal is to improve it and use the Cosmos SDK as you learn about the different components. It is safe to skip what comes below and head straight to the rest of the learning elements if you are not interested in learning more about ABCI.

</HighlightBox>

There is a lot you need to take care of beyond the rules of the game. Simplify as much as possible. Have a look at these [ABCI specs](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md) to see what the application needs to comply with ABCI. Try to figure out which barebones you would use to make your first, imperfect checkers game blockchain.

### "Make" the state machine

You want to have a minimum viable ABCI state machine. Tendermint does not concern itself with whether proposed transactions are valid or how the state changes after each transaction. It delegates this to the state machine, which _interprets_ transactions as game moves and states.

Now it is time for the important junctures at which the application has to act.

#### Start the application

This state machine is an application that needs to start before it can receive any requests from Tendermint. Take this opportunity to load in the memory static elements representing the acceptable general moves.

This code exists already and is run automatically when the module is loaded:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L75]
func init()
```

#### `Query`: _The_ game state

Begin by only having a single game and a single board. This helps simplify. You can decide right away how to serialize the board without any effort with this function:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L303]
func (game *Game) String() string
```

Store the board at `/store/board` and return it in the response's `Value` when requested via the [`Query`](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#query) command at `path = "/store/board"`. If and when you need to re-instantiate the board state out of its serialized form call:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L331]
func Parse(s string) (*Game, error)
```

The `String()` function does not save the `.Turn` field. You need to store whose turn it is to play on your own. Choose a `string` at `/store/turn` for the color of the player.

Your application needs its own database to store the state. The application needs to store a state at a certain Merkle root value to be able to recall past states at a later date. This is another implementation _detail_ that you need to address when creating your application.

#### `InitChain`: The initial chain state

[That's](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#initchain) where your only game is initialized. Tendermint sends `app_state_bytes: bytes` to your application with the initial (genesis) state of the blockchain. You already know what it would look like to represent a single game.

Your application:

* Takes the initial state in.
* Saves it in its database along with [black](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L124) having to play next.
* Returns in `app_hash: bytes` the Merkle root hash corresponding to the genesis state.

Your application also has to handle the list of validators sent by Tendermint. The Cosmos SDK's BaseApp will take care of the list.

#### A serialized transaction

You need to decide how to represent a move. In the ready-made implementation a position `Pos` is represented by [two `int`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L42-L45) and a move by [two `Pos`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L168). You can decide to represent a serialized move as four `int`. The first two are for the original position `src` and the next two for the destination position `dst`.

#### `BeginBlock`: A new block is about to be created

[This command](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#beginblock) instructs the application to load its state at the right place. Inside `header: Header` as per its [detailed definition](https://github.com/tendermint/spec/blob/c939e15/spec/core/data_structures.md#header) you find:

> `AppHash: []byte`: arbitrary byte array returned by the application after executing and committing the previous block. It serves as the basis to validate any Merkle proofs that come from the ABCI application and represents the state of the actual application rather than the state of the blockchain itself. The first block's `block.Header.AppHash` is given by `ResponseInitChain.app_hash`.

This _implementation detail_ skipped before instructing the application to load from its database the right state of the application, which includes the correct `/store/board`. It is important to insist on the fact that the application needs to be able to load a known state at any _point in time_. There could have been a crash or a restore of some sort that has desynchronized Tendermint and the application.

The application should work off the last state it has arrived at in case the header has omitted the `AppHash`, which should never happen.

The application is ready to respond to the upcoming `CheckTx` and `DeliverTx` with the state loaded.

#### `CheckTx`: A new transaction appears in the transaction pool

Tendermint [asks](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#checktx) your application whether the transaction is worth keeping at all. You only concern yourself with whether there is a valid move in the transaction because you want to simplify to the maximum. You check whether there are four `int` in the serialized information for this. You can also check that the `int` themselves are within the boundaries of the board, for example between `0` and `7`.

It is better **not** to check if the move is valid according to the rules of the application.

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L168]
func (game *Game) ValidMove(src, dst Pos) bool
```

Checking whether a move is valid with regards to the board requires knowledge of the board state when the transaction is included in a block. The board is updated only up to the point where the transactions have been delivered. You may have a situation where two transactions are sent one after the other and both are valid. If you tested the move in the second transaction against the board state before the first unconfirmed move, it would appear that the second move is invalid. Testing a move on the board at `CheckTx` time should be avoided.

Check the _possibility_ of validity of the transaction in `CheckTx` and reject the transaction if it is malformed, contains invalid inputs, etc., and cannot _possibly_ be acceptable, but refrain from confirming that it will be successful according to concerns that depend on context.

#### `DeliverTx`: A transaction is added and needs to be processed

Now a pre-checked transaction [is delivered](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#delivertx). It is a matter of applying it to the latest board state. You can call:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L274]
func (game *Game) Move(src, dst Pos) (captured Pos, err error)
```

And handle the error if necessary.

You need to see whether it makes sense to send the transaction back through ABCI. If the transaction succeeded, you keep the new board state in memory ready for the next delivered transaction. You do not save to the storage at this point.

You can also choose to define which information should be indexed via `events: repeated Event` in the response. The returned values intend is to return information that could be tedious to collect otherwise. To allow a fast search across blocks for values of relevance if indexed.

<HighlightBox type="info">

See [Tendermint's ABCI event spec documentation](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#events) for what goes into an `Event`.

</HighlightBox>

For the sake of the exercise imagine that you emit some information in two events: one about the move itself and the other about the resulting board state. In pseudo-code form it looks like:

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

If you come from the Ethereum world, you will recognize these as Solidity _events_ with indexed fields that are _topics_ in the transaction receipt logs.

It would be judicious to inform Tendermint about the `GasUsed (int64)`. Each move costs the same so you can return `1`.

#### `EndBlock`: The block is being wrapped up

Now is [the time](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#endblock) to let Tendermint know some things. Setting aside once more the validator thing: you need to let Tendermint know what events should be emitted similarly to how `DeliverTx` was handled. You have only checkers moves, so it is not very clear what could be interesting at a later date.

Assume that you want to tally what happened in the block. You return this aggregate event:

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

The block is now [confirmed](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#commit). The application needs to save its state to storage, its database, and return as `data: []byte` the Merkle root hash of the blockchain's state, which includes `/store/board`. This hash needs to be deterministic after the sequence of the same `BeginBlock`, the same `DeliverTx`'s in the same order and the same `EndBlock` as mentioned in [the documentation](https://github.com/tendermint/spec/blob/c939e15/spec/abci/abci.md#determinism).

The application may also keep a pointer in its database as to which state is the latest so it can purge the board from its memory after having returned and saved. The next `BeginBlock` will inform the application about which state to load. The application should keep the state in memory to quickly build on it if the next `BeginBlock` fails to mention `AppHash` or mentions the same.

### What if I like extreme serialization?

This `data` does not strictly need to be a Merkle root hash. It could well be any bytes as long as:

* The result is deterministic and collision-resistant.
* The application can recover the state out of it.

If you took your only board and serialized it differently, you could return the board state as such.

You have 64 cells out of which only 32 are being used. Each cell has either nothing, a black pawn, a black king, a red pawn, or a red king. There are five possibilities, which can easily fit in a byte. So you need 32 bytes to describe the board. Perhaps you can use the very first bit to indicate whose turn it is to play as the first bit of a byte is never used when counting to five.

You have:

* A deterministic blockchain state
* Collision-resistance since the same value indicates an identical state
* No external database to handle
* The full state always stored in the block header

</ExpansionPanel>

## Next up

You probably have already spotted a good number of shortcomings in your game blockchain as it is presently designed:

* Anyone, including the opponent, can post an anonymous transaction and play instead of the intended player. This makes it impossible to know who did what. You need to find a way to identify the right player. The Cosmos SDK comes to the rescue with [accounts and signatures](./accounts.md).
* You currently have a single game. Multiple games running in parallel would be better. You need a well-defined store. Why not take a look at the Cosmos SDK's [key store](./multistore-keepers.md)?
* It would be good if you had an elegant way to serialize your data objects of interest and your transactions? [Protobuf](./protobuf.md) can help with this.
* You want to penalize spam and bad transactions and also to be able to play for money? Enter tokens defined in another [existing Cosmos SDK module](./modules.md)).
* There is a new transaction type to _create a game_. You can count on Cosmos SDK's [context object](./context.md) to tailor gas costs according to the transaction type.
* You need to handle the validators lists in the communication? Cosmos can do this for you out of the box with [BaseApp](./base-app.md).
* You want the player's GUI to easily reload their pending game(s) and let them know whether a move is valid or not? That's a good use of Cosmos SDK [queries](./queries.md).
* You want to use Tendermint's events and notify players when it’s their turn? Cosmos SDK provides that with [events](./events.md).
* You want to easily add changes to your system in the future after production? You can handle it with Cosmos SDK [migrations](./migrations.md).
* You want to allow players to play for money with different tokens? Good thing the Cosmos SDK already integrates [IBC](./ibc.md) for tokens coming from other blockchains.
