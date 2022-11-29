---
title: "A Blockchain App Architecture"
order: 2
description: ABCI, Tendermint, and state machines
tags: 
  - concepts
  - cosmos-sdk
---

# A Blockchain App Architecture

<HighlightBox type="learning">

In this section, you will look closer at the application architecture underlying blockchains built with the Cosmos SDK.

In this section, you will deepen your understanding of the application architecture underlying blockchains built with the Cosmos SDK. You will explore:

* What Tendermint is
* Consensus in Cosmos
* The Application Blockchain Interface
* The Cosmos SDK
* State machines

</HighlightBox>

## What is Tendermint?

Created in 2014, [Tendermint](https://tendermint.com/) accelerates the development of distinct blockchains with a ready-made networking and consensus solution, so developers do not have to recreate these features for each new case. You may already use Tendermint without being aware of it, as other blockchains like [Hyperledger Burrow](https://hyperledger.github.io/burrow/#/) and the [Binance Chain](https://www.binance.org/en/smartChain) use Tendermint.

Tendermint modules **attend to consensus and networking**, which are important components of any blockchain. This frees developers to focus on the application level without descending into lower-level blockchain concerns such as peer discovery, block propagation, consensus, and transaction finalization. Without Tendermint, developers would be forced to build software to address these concerns, which would add additional time, complexity, and cost to the development of their applications.

![Blockchain application architecture overview](/academy/2-cosmos-concepts/images/architecture_overview.png)

A blockchain node for an application-focused Cosmos blockchain consists of a state-machine, built with the Cosmos SDK, and the consensus and networking layer, which are handled by the [Tendermint Core](https://tendermint.com/core/).

<ExpansionPanel title="What is the Tendermint Core?">

The Tendermint Core is a blockchain application platform which supports state machines in any language. The language-agnostic Tendermint Core helps developers securely and consistently replicate deterministic, finite state machines.
<br/><br/>
Tendermint BFT is maintained even when 1/3rd of all machines fail, by providing two components:

* A blockchain consensus engine.
* A generic application interface.

<HighlightBox type="tip">

Want to continue exploring this useful component of the Cosmos SDK? Find further information beneath under _Consensus in Tendermint Core and Cosmos_, or in the [Tendermint Core documentation](https://docs.tendermint.com/v0.34/tendermint-core/#).

</HighlightBox>

</ExpansionPanel>

## Consensus in Tendermint Core and Cosmos

The Tendermint Core is a high-performance, consistent, flexible, and secure **consensus** module with strict fork accountability. It relies on Proof-of-Stake (PoS) with delegation and [Practical Byzantine Fault Tolerance](https://arxiv.org/abs/1807.04938). Participants signal support for well-behaved, reliable nodes that create and confirm blocks. Users signal support by staking ATOM, or the native token of the respective chain. Staking bears the possibility of acquiring a share of the network transaction fees, but also the risk of reduced returns or even losses should the supported node become unreliable.

Network participants are incentivized to stake their ATOM with nodes which are the most likely to provide dependable service, and to withdraw their support should those conditions change. A Cosmos blockchain is expected to adjust the validator configuration and continue even in adverse conditions.

Only the top 150 nodes (as ranked by staked ATOM) participate in the transaction finalization process as **validators**. The privilege of creating a block is awarded in proportion to the voting power a validator has. **Voting power** is calculated as all ATOM tokens staked by a validator and its delegates. For example, if a given validator's voting power is 15% of the total voting power of all validators, then the validator can expect to receive the block creation privilege 15% of the time.

The created block is broadcast to the other validators, who are expected to respond promptly and correctly:

* Validators confirm candidate blocks.
* Validators absorb penalties for failing to do so.
* Validators can and must reject invalid blocks.
* Validators accept the block by returning their signature.

When sufficient signatures have been collected by the block creator, the block is finalized and broadcast to the wider network. There is no ambiguity in this process: either a block has the necessary signatures or it does not. If it does, insufficient signatories exist to overturn the block and so the block can be understood as **finalized** - there is no process in which the blockchain would be reorganized. This provides a level of certainty when it comes to transaction finality that a probabilistic system like Proof-of-Work (PoW) cannot match.

Aggressive block times are feasible because the process aims for high performance and is based on dedicated validators with good network connectivity. This is quite different from PoW, which favors inclusion and must accommodate slower nodes with greater latency and less reliability. A Cosmos blockchain can handle thousands of transactions per second, with confirmations taking seven seconds.

Even though validation is delegated to a subset of all network nodes, the process avoids concentration of power. The community of users elects validators by staking ATOM and participating in both the rewards and the risks of committing, to provide a reliable, responsible block validation service.

## Upgradeability of chains

In any known blockchain, a change in the implementation requires an upgrade to the node software running on each node. In a disorderly process with voluntary participation, this can result in a hard fork: a situation in which one constituency forges ahead with the old rules while another adopts new rules. While this arrangement has positive aspects and proponents, it also has clear disadvantages in settings where **certainty** is a strict requirement. For example, uncertainty about transaction finality (regardless of the degree of uncertainty) may be unacceptable in settings that are concerned with authoritative registries and large assets.

In a Tendermint blockchain, transactions are irreversibly finalized upon block creation, and upgrades are themselves governed by the block creation and validation process. This leaves no room for uncertainty: either the nodes agree to simultaneously upgrade their protocol, or the upgrade proposal fails.

Validators and delegators are the parties who vote on proposals, with weights proportional to their respective stakes. If a delegator does not vote on a proposal, the delegator's vote is taken as that of its delegated validator. This means that delegators should be very demanding when they act, as they also lend their default vote to the validator.

## Application Blockchain Interface (ABCI)

[Tendermint BFT](https://tendermint.com/core/) packages the networking and consensus layers of a blockchain and presents an interface to the application layer, the **Application Blockchain Interface (ABCI)**. Developers can focus on higher-order concerns and delegate peer-discovery, validator selection, staking, upgrades, and consensus to the Tendermint BFT. The consensus engine runs in one process and controls the state machine, while the application runs in another process. The architecture is equally appropriate for **private or public blockchains**.

The Tendermint BFT engine is connected to the application by a socket protocol. ABCI provides a socket for applications written in other languages. If the application is written in the same language as the Tendermint implementation, the socket is not used.

![The application, ABCI, and Tendermint](/academy/2-cosmos-concepts/images/ABCI_3.png)

The Tendermint BFT provides security guarantees, including the following:

* **Forks** are never created, provided that at least half the validators are honest.
* **Strict accountability** for fork creation allows determination of liability.
* Transactions are **finalized** as soon as a block is created.

The Tendermint BFT is not concerned with the interpretation of transactions. That occurs at the application layer. Tendermint presents confirmed, well-formed transactions and blocks of transactions agnostically. Tendermint is un-opinionated about the meaning any transactions have.

The _block time_ is approximately seven seconds, and blocks may contain thousands of transactions. Transactions are finalized and cannot be overturned as soon as they appear in a block.

<HighlightBox type="reading">

For a deeper dive on consensus and Tendermint visit:

* This [podcast on consensus systems](https://softwareengineeringdaily.com/2018/03/26/consensus-systems-with-ethan-buchman/) with Ethan Buchman
* The [Tendermint Core documentation on consensus](https://docs.tendermint.com/v0.34/introduction/what-is-tendermint.html#consensus-overview)

</HighlightBox>

There are at least two broad approaches to **application-level concerns** using blockchains:

1. Create an application-specific blockchain where everything that can be done is defined in the protocol.
2. Create a programmable state machine and push application concerns to a higher level, such as bytecode created by compilers interpreting higher-level languages.

Ethereum-like blockchains are part of the second category: only the state machine is defined in the on-chain protocol, which defines the rules of contract creation, interaction, execution, and little else.

This method is not without its limitations:

* Very little is universally defined: standards for basic concerns such as tokens emerge organically through voluntary participation.
* Contracts can and do contain repetitive code that may or may not correctly implement the developer's intentions.
* This inherent flexibility makes it challenging to reason about what is correct, or even what is friendly.
* There are practical limits to the complexity of operations, which are very low compared to what is possible in other settings.

These limitations make it especially difficult to perform analysis or reorganize data, and developers are forced to adapt to the constraints.

A **purpose-built or application-specific blockchain** is different. There is no need to present a "Turing-complete" language or a general-purpose, programmable state machine because application concerns are addressed by the protocol the developers create.

Developers who have worked with blockchains based on the Ethereum Virtual Machine (EVM) will recognize a shift in the way concerns are addressed. Authorization and access control, the layout of storage and the state, and application governance are not implemented as contracts on a state machine. They instead become properties of a unique blockchain that is built for a singular purpose.

## The Cosmos SDK

Developers create the application layer using the **Cosmos SDK**. The Cosmos SDK provides:

<Accordion :items="
    [
        {
            title: 'A scaffold to get started',
            description: 'The Cosmos SDK provides a development head start and a pre-established framework for new applications.'
        },
        {
            title: 'A rich set of modules',
            description: 'The Cosmos SDK provides a rich set of modules that address common concerns such as governance, tokens, other standards, and interactions with other blockchains through the Inter-Blockchain Communication Protocol (IBC).'
        }
    ]
"/>

The creation of an application-specific blockchain with the Cosmos SDK is largely a process of selecting, configuring, and integrating well-solved modules, also known as "composing modules". This greatly reduces the scope of original development required, as development becomes mostly focused on the truly novel aspects of the application.

<HighlightBox type="info">

The Inter-Blockchain Communication Protocol (IBC) is a common framework for exchanging information between blockchains. For now, it is enough to know that it exists and it enables seamless interaction between blockchains that want to transfer value (token transfers) and exchange information. It enables communication between applications that run on separate application-specific blockchains.

</HighlightBox>

The application, consensus, and network layers are contained within the custom blockchain node that forms the foundation of the custom blockchain.

Tendermint passes confirmed transactions to the application layer through the **Application Blockchain Interface (ABCI)**. The application layer must implement ABCI, which is a socket protocol. Tendermint is unconcerned with the interpretation of transactions, and the application layer can be unconcerned with propagation, broadcast, confirmation, network formation, and other lower-level concerns that Tendermint attends to (unless it wants to inspect such properties).

Developers are free to create blockchains in any language that supports sockets since the ABCI is a socket protocol, provided their application implements ABCI. ABCI defines the boundary between replication concerns and the application, which is a state machine.

This is itself a considerable step forward that simplifies the creation of unique blockchains.

<HighlightBox type="docs">

If you want to continue exploring ABCI, you can find more detailed information here:

* [ABCI GitHub repository: ABCI prose specification](https://github.com/tendermint/abci/blob/master/specification.md)
* [Tendermint GitHub repository: A Protobuf file on types](https://github.com/tendermint/abci/blob/master/types/types.proto)
* [Tendermint GitHub repository: A Go interface](https://github.com/tendermint/abci/blob/master/types/application.go)
* [The Tendermint Core documentation](https://docs.tendermint.com/)

</HighlightBox>

## State machines

A blockchain is a replicated state machine at its core. A **state machine** is a computer science concept, in which a machine can have multiple states but only one state at a time. It follows a state transition process (or a set of defined processes), which is the only way the state changes from the old or **initial state (`S`) to a new state (`S'`)**.

![State change](/academy/2-cosmos-concepts/images/state_machine_1.png)

The **state transition function** in a blockchain is synonymous with a transaction. Given an initial state, a confirmed transaction, and a set of rules for interpreting that transaction, the machine transitions to a new state. The rules of interpretation are defined at the application layer.

Blockchains are deterministic. The only correct interpretation of the transaction is the new state, shown as S-prime (`S'`) in the previous image.

Blockchains are distributed, and transactions arrive in batches called blocks. The machine state subsists after the correct interpretation of each transaction in a block. Each transaction executes in the context of the state machine that resulted from every preceding transaction. The machine state after all transactions are executed is a useful checkpoint, especially for historic states.

The state of the initialized blockchain, in which "nothing has happened yet", is called **Genesis state** (`S`). The current state of the blockchain (`S'`) can always be achieved by appliying all the transactions performed to the Genesis state.

![State change](/academy/2-cosmos-concepts/images/state_machine_2.png)

Developers can create the state machine using the Cosmos SDK. This includes:

* Storage organization: also known as _the state_.
* State transition functions: these determine what is permissible and if adjustments to the state result from a transaction.

In this context, the "consensus" establishes a canonical set of well-ordered blocks containing well-ordered transactions. All nodes agree that the canonical set is the only relevant set of all finalized transactions. There is only one correct interpretation of the canonical transaction set at any given transaction execution or any block height due to the state machine's determinism.

This state machine definition is silent on the processes that confirm and propagate transactions. Tendermint is agnostic to the interpretation of the blocks it organizes. The Tendermint consensus establishes the ordered set of transactions. The nodes then reach consensus about the state of the application.

## Additional details

Transactions and blocks utilize several key methods and message types:

### `CheckTx`

Many transactions that could be broadcast should not be broadcast. Examples include malformed transactions and spam-like artifacts. However, Tendermint cannot determine the transaction interpretation because it is agnostic to it. To address this, the Application Blockchain Interface includes a `CheckTx` method. Tendermint uses this method to ask the application layer if a transaction is valid. Applications implement this function.

### `DeliverTx`

Tendermint calls the `DeliverTx` method to pass block information to the application layer for interpretation and possible state machine transition.

### `BeginBlock` and `EndBlock`

`BeginBlock` and `EndBlock` messages are sent through the ABCI even if blocks contain no transactions. This provides positive confirmation of basic connectivity and helps identify time periods with no operations. These methods facilitate the execution of scheduled processes that should always run because they call methods at the application level, where developers define processes.

<HighlightBox type="tip">

It is wise to be cautious about adding too much computational weight at the start or completion of each block, as blocks arrive at approximately seven-second intervals. Too much work could slow down your blockchain.

</HighlightBox>

Any application that uses Tendermint for consensus must implement ABCI. You do not have to do this manually, because the Cosmos SDK provides a boilerplate known as **BaseApp** to get you started.

In the following suggested exercise, you will create a minimal distributed state machine with the Cosmos SDK and see code samples implementing concepts progressively. Your state machine will rely on Tendermint for consensus.

## Test yourself - a coding exercise

With all you have learned about Tendermint, can you **design** a minimal distributed state machine? A blockchain that allows people to play the game of checkers? Open the following section, **Creating a checkers blockchain**, to start this reflection and reinforce your understanding of Tendermint.

You will continue to apply what you learn in later sections to your checkers game, and design a blockchain by using elements of the Cosmos SDK. Alternatively, you can continue directly to learn about [accounts in the Cosmos SDK](./2-accounts.md).

<ExpansionPanel title="Creating a checkers blockchain">

*Why develop a game of checkers?*
<br/><br/>
This **design project** will evolve in stages as you learn more about the Cosmos SDK. You will better understand and experience how the Cosmos SDK improves your productivity by handling the boilerplate as you progress through the sections and explore what the boilerplate does.

<HighlightBox type="tip">

This is meant as a design exercise. If you want to go from the design phase to the **implementation** phase, head to [Run Your Own Cosmos Chain](/hands-on-exercise/1-ignite-cli/index.md).

</HighlightBox>

### The setup

You are going to design a blockchain that lets people play checkers against each other. There are many versions of checkers, so choose [these simple rules](https://www.ducksters.com/games/checkers_rules.php) for this exercise. The object of the exercise is to understand ABCI and learn more about working with the Cosmos SDK, not to get lost in the proper implementation of the board state or the rules of the game.
<br/><br/>
Use and adapt [this ready-made implementation](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go), including the additional rule that the board is 8x8 and played on black cells. The code will likely require adaptations as you progress. Do not worry about implementing a marketable GUI, that is a separate design project in itself. You must first create the foundation that will ensure a GUI is _possible_.

<HighlightBox type="info">

When you revisit this design exercise in later chapters, the goal will be to improve it with the Cosmos SDK as you learn about its different components. If you are not interested in learning more about ABCI, it is safe omit *this* exercise and move directly to the other learning elements.

</HighlightBox>

There is a lot you need to do beyond implementing the rules of the game, so simplify as much as possible. Examine these [ABCI specs](https://github.com/tendermint/tendermint/blob/master/spec/abci/abci.md) to see what the application needs to comply with ABCI. Try to identify which basic resources you would use to make a first, *imperfect*, checkers game blockchain.

### "Make" the state machine

You want to have a minimum viable ABCI state machine. Tendermint does not concern itself with whether proposed transactions are valid or how the state changes after each transaction. It delegates this to the state machine, which _interprets_ transactions as game moves and states.
<br/><br/>
The following are the important junctures at which the application must act:

#### Start the application

This state machine is an application that must start before it can receive any requests from Tendermint. It must load into the memory static elements representing the acceptable general moves.
<br/><br/>
This code exists already and is run automatically when the module is loaded:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L75]
func init()
```

#### `Query` - _the_ game state

To simplify, begin with only a single game and a single board. You can decide immediately how to serialize the board without any effort by using this function:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L303]
func (game *Game) String() string
```

Store the board at `/store/board` and return it in the response's `Value` when requested via the [`Query`](https://github.com/tendermint/tendermint/blob/master/spec/abci/abci.md#query-1) command at `path = "/store/board"`. If and when you need to re-instantiate the board state out of its serialized form, call:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L331]
func Parse(s string) (*Game, error)
```

The `String()` function does not save the `.Turn` field. You must store whose turn it is to play on your own. Choose a `string` at `/store/turn` for the color of the player.
<br/><br/>
Your application needs its own database to store the state. The application must store a state at a certain Merkle root value to be able to recall past states at a later date. This is another implementation _detail_ that you must address when creating your application.

#### `InitChain` - the initial chain state

[This is where](https://github.com/tendermint/tendermint/blob/master/spec/abci/abci.md#initchain) your only game is initialized. Tendermint sends `app_state_bytes: bytes` to your application with the initial (genesis) state of the blockchain. You already know what it would look like to represent a single game.
<br/><br/>
Your application:

* Takes in the initial state.
* Saves it in its database, along with the need for [black](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L124) to play next.
* Returns the Merkle root hash corresponding to the genesis state in `app_hash: bytes`.

Your application must also handle the list of validators sent by Tendermint. The Cosmos SDK's **BaseApp** will do this.

#### A serialized transaction

Next you must decide how to represent a move. In the ready-made implementation, a position `Pos` is represented by [two `int`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L42-L45), and a move by [two `Pos`](https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L168). You can decide to represent a serialized move as four `int`: the first two for the original position (`src`), and the next two for the destination position (`dst`).

#### `BeginBlock` - a new block is about to be created

[`BeginBlock`](https://github.com/tendermint/tendermint/blob/master/spec/abci/abci.md#beginblock) instructs the application to load its state in the right location. Inside `header: Header` (as per its [detailed definition](https://github.com/tendermint/spec/blob/master/spec/core/data_structures.md#header)) you find:

> `AppHash: []byte`: an arbitrary byte array returned by the application after executing and committing the previous block. This serves as the basis to validate any Merkle proofs that come from the ABCI application, and represents the state of the actual application rather than the state of the blockchain itself. The first block's `block.Header.AppHash` is given by `ResponseInitChain.app_hash`.

This _implementation detail_ was skipped before instructing the application to load the right state of the application from its database, which includes the correct `/store/board`. It is important that the application is able to load a known state at **any** point in time. There could have been a crash or a restore of some sort that de-synchronized Tendermint and the application.
<br/><br/>
The application should work off the last state it has arrived at, in case the header has omitted the `AppHash` (which should never happen).
<br/><br/>
The application is now ready to respond to the upcoming `CheckTx` and `DeliverTx` with the state loaded.

#### `CheckTx` - a new transaction appears in the transaction pool

Tendermint [asks](https://github.com/tendermint/tendermint/blob/master/spec/abci/abci.md#checktx-1) your application whether the transaction is worth keeping at all. For maximum simplification, you are only concerned with whether there is a valid move in the transaction. You check whether there are four `int` in the serialized information for this. You can also check that the `int` themselves are within the boundaries of the board, for example between `0` and `7`.
<br/><br/>
It is better **not** to check if the move is valid according to the rules of the application.

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L168]
func (game *Game) ValidMove(src, dst Pos) bool
```

Checking whether a move is valid with regards to the board requires knowledge of the board state *when the transaction is included in a block*. The board is updated only up to the point where the transactions have been delivered. You may have a situation where two transactions are sent, one after the other, and both are valid. If you tested the move in the second transaction against the board state before the first unconfirmed move, it would appear that the second move is invalid. Testing a move on the board at `CheckTx` time should be avoided.
<br/><br/>
Check the _possibility_ of validity of the transaction in `CheckTx`: reject the transaction if it is malformed, contains invalid inputs, etc., and therefor cannot _possibly_ be acceptable; but refrain from confirming that it will be successful according to concerns that depend on context.

#### `DeliverTx` - a transaction is added and needs to be processed

When a pre-checked transaction [is delivered](https://github.com/tendermint/tendermint/blob/master/spec/abci/abci.md#delivertx-1), it must be applied to the latest board state. You call:

```go [https://github.com/batkinson/checkers-go/blob/a09daeb/checkers/checkers.go#L274]
func (game *Game) Move(src, dst Pos) (captured Pos, err error)
```

Resolve any error if necessary.
<br/><br/>
You need to see whether it makes sense to send the transaction back through ABCI. If the transaction succeeded, you keep the new board state in memory ready for the next delivered transaction. You do not save to the storage at this point.
<br/><br/>
You can also choose to define which information should be indexed via `events: repeated Event` in the response. The returned values are intended to return information that could be tedious to collect otherwise. This allows fast searches across blocks for values of relevance if indexed.

<HighlightBox type="docs">

See [Tendermint's ABCI event spec documentation](https://github.com/tendermint/tendermint/blob/master/spec/abci/abci.md#events) for what goes into an `Event`.

</HighlightBox>

For the sake of the exercise imagine that you emit some information in two events: one about the move itself, and the other about the resulting board state. In pseudo-code form this looks like:

```
[
    { key: "name", value: "moveMetadata", index: true },
    { key: "who-player", value: bool, index: true },
    { key: "is-jump", value: bool, index: false},
    { key: "made-king", value: bool, index: false},
    { key: "has-captured", value: bool, index: false},
    { key: "has-captured-king", value: bool, index: false},
    { key: "is-winning", value: bool, index: true}
],
[
    { key: "name", value: "boardState", index: true },
    { key: "black-count", value: uint32, index: false },
    { key: "black-king-count", value: uint32, index: false },
    { key: "red-count", value: uint32, index: false },
    { key: "red-king-count", value: uint32, index: false }
]
```

If you come from the Ethereum world, you will recognize these as Solidity _events_ with indexed fields that are _topics_ in the transaction receipt logs. Unlike Ethereum, though, events are not part of the consensus (the block) but instead are handled purely on the node.
<br/><br/>
It would be judicious to inform Tendermint about the `GasUsed (int64)`. Each move costs the same, so you can return `1`.

#### `EndBlock` - the block is being finished

Ignoring the issue of validators for now, [this is used](https://github.com/tendermint/tendermint/blob/master/spec/abci/abci.md#endblock) to let Tendermint know what events should be emitted (similarly to how `DeliverTx` was handled). You have only checkers moves, so it is not very clear what could be interesting at a later date.
<br/><br/>
Assume that you want to tally what happened in the block. You return this aggregate event:

```
[
    { key: "name", value: "aggregateAction", index: true },
    { key: "black-captured-count", value: uint32, index: false },
    { key: "black-king-captured-count", value: uint32, index: false },
    { key: "red-captured-count", value: uint32, index: false },
    { key: "red-king-captured-count", value: uint32, index: false }
]
```

#### `Commit` - your work here is done

The block is now [confirmed](https://github.com/tendermint/tendermint/blob/master/spec/abci/abci.md#commit). The application needs to save its state to storage, i.e. to its database. The state, which includes `/store/board`, is uniquely identified by its Merkle root hash. As per the ABCI, this hash has to be returned in a `[]byte` form. For a consensus to be able to emerge, the hash needs to be deterministic after the sequence of the same `BeginBlock`, the same `DeliverTx` methods in the same order and the same `EndBlock` as mentioned in [the documentation](https://github.com/tendermint/tendermint/blob/master/spec/abci/abci.md#determinism).
<br/><br/>
The application may also keep a pointer in its database regarding which state is the latest, so it can purge the board from its memory after having returned and saved. The next `BeginBlock` will inform the application about which state to load. The application should keep the state in memory to quickly build on it if the next `BeginBlock` fails to mention `AppHash` or mentions the same `AppHash` previously calculated.

### What if you like extreme serialization?

This `data` does not strictly need to be a Merkle root hash. It could well be any bytes, as long as:

* The result is deterministic and collision-resistant.
* The application can recover the state out of it.

If you took your single board and serialized it differently, you could return the board state as such.
<br/><br/>
You have 64 cells out of which only 32 are being used. Each cell is occupied by either nothing, a black pawn, a black king, a red pawn, or a red king. There are five possibilities, which can easily fit in a byte, so you need 32 bytes to describe the board. Perhaps you can use the very first bit to indicate whose turn it is to play, as the first bit of a byte is never used when counting to five.
<br/><br/>
You now have:

* A deterministic blockchain state.
* Collision-resistance, since the same value indicates an identical state.
* No external database to handle.
* The full state always stored in the block header.

</ExpansionPanel>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* Tendermint, which provides modules that attend to consensus and networking, removing the need for developers to "reinvent the wheel" of lower-level blockchain concerns and freeing them to focus on the application level of their projects.
* The Tendermint Core, a DPoS consensus module with pBFT, through which the top 150 nodes (as ranked by total stake) serve as validators for the blockchain. These duties are divided between validators in proportion to their voting power, and delegating users can assign or withdraw staked ATOM to share in the risks and rewards, and to influence validators in favor of good behavior.
* How Tendermint ensures the upgradeability of chains without the possibility of forking, since (like blocks) any proposed upgrades must be validated by a majority of nodes, and there is no process for reversing validation after the fact.
* The Application Blockchain Interface (ABCI), through which developers are able to work on the higher-order aspects of their projects. The ABCI connects to the Tendermint BFT engine through a socket protocol, and also provides a socket for applications written in other languages, providing additional flexibility to developers.
* The Cosmos SDK, an array of well-solved modular components that developers can rapidly configure and integrate to create the foundations for unique, custom-designed applications.
* The Inter-Blockchain Communication Protocol (IBC), a common framework within Cosmos which allows information exchange between blockchains both inside and outside the Cosmos Ecosystem.

</HighlightBox>

## Overview of upcoming content

The following sections will extend your comprehension of the Cosmos SDK and the usefulness of its features. If you completed the previous exercise, you may have already spotted several shortcomings in your game blockchain as it is presently designed:

* Anyone, including the opponent, can post an anonymous transaction and play instead of the intended player. This makes it impossible to know who did what. You need to identify the right player. The Cosmos SDK comes to the rescue with [accounts and signatures](./2-accounts.md).
* You currently have a single game. Multiple games running in parallel would be better, but this would require a well-defined store. Why not explore the Cosmos SDK's [key store](./7-multistore-keepers.md)?
* It would be good to have an elegant way to serialize data objects of interest and your transactions. [Protobuf](./6-protobuf.md) can help with this.
* How can you penalize spam and bad transactions, and also to be able to play for money? Incorporate tokens defined in another [existing Cosmos SDK module](./5-modules.md).
* There is a new transaction type: to _create a game_. The Cosmos SDK [context object](./11-context.md) allows you to tailor gas costs according to transaction type.
* If you need to handle validator lists during communication, Cosmos does this out of the box with [BaseApp](./8-base-app.md).
* Do you want the player's GUI to easily reload any pending games, or let them know whether a move is valid or not? These are good uses of Cosmos SDK [queries](./9-queries.md).
* If you want to use Tendermint to notify players when it's their turn, Cosmos SDK provides that option with [events](./10-events.md).
* What if you want to add changes to your system in the future after production? You can easily handle this with Cosmos SDK [migrations](./13-migrations.md).
