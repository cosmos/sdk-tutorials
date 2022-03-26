---
title: "Introduction to Cosmos"
order: 2
description: How does Cosmos fit in the overall development of blockchain tech?
tag: fast-track
---

---
title: "Blockchain Technology and Cosmos"
order: 2
description: Cosmos as part of blockchain technology
tag: fast-track
---

# Blockchain Technology and Cosmos

Begin your journey with this brief review of blockchain technology, how Cosmos came into being, and what it brings to the world of blockchain technology:

* An internet of blockchains
* A better decentralized application (dApp) user experience
* A simplified, specialized dApp development experience
* Facilitated scalability
* Increased sovereignty
* Speed and fast finality

<ExpansionPanel title="What is a Blockchain?">

Blockchain protocols define programs that hold a state and describe how to modify the state according to the received inputs. The inputs are called transactions.

The consensus mechanism ensures that a blockchain has a canonical transaction history. Blockchain transactions must be deterministic, meaning there is only one correct interpretation. The blockchain state is deterministic. If you begin with the same genesis state and replicate all changes, you always achieve the same state.

A blockchain architecture can be **split into three layers**:

* The network layer: tasked with discovering nodes and propagating transactions and consensus-related messages between single nodes.
* The consensus layer: runs the consensus protocol between the single nodes of a peer-to-peer (P2P) network.
* The application layer: running a state machine that defines the application's state and updates it with the processing of transactions implementing the network's consensus.

This layered model can be applied to blockchains generally.

</ExpansionPanel>

## The world of blockchains — From public general-purpose chains to application-specific chains

You can find the building blocks of blockchain technology in the 1980s and 1990s when breakthroughs in computer science and cryptography laid the necessary groundwork.

The necessary breakthroughs included append-only, provably correct transaction logs using built-in error checking, strong authentication and encryption using public keys, mature theories of fault-tolerant systems, a widespread understanding of peer-to-peer (P2P) systems, the advent of the internet and ubiquitous connectivity, and powerful client-side computers.

On October 31, 2008, an individual or group calling itself Satoshi Nakamoto proposed a **P2P network for a digital currency**, calling it **Bitcoin**. Bitcoin introduced a novel consensus mechanism, now referred to as Nakamoto Consensus, that uses Proof-of-Work (PoW) to enable nodes to reach agreement in a decentralized network. It became possible to send online payments directly between parties **independent of financial institutions and trusted third parties**. Bitcoin became the first public, decentralized payment application.

<HighlightBox type="info">

Want to look closer at the initial proposition of Bitcoin? Take a look at the [Bitcoin Whitepaper](https://bitcoin.org/bitcoin.pdf)

</HighlightBox>

<ExpansionPanel title="More on PoW">

Bitcoin uses PoW to achieve Byzantine Fault-Tolerance (BFT) which enables decentralized, trustless networks to function even with malfunctioning or malicious nodes present. It is best described as a cryptographic puzzle solved by a network's node called a miner. The puzzle is a task of pre-defined, arbitrary difficulty. At the current scale of the networks using PoW, the outcome is akin to a lottery with a single winning node.

In most PoW systems the task consists of a search for an unknown, random number - a nonce. For it to be a winning nonce, the result combined with ordered transactions in a block ought to be a hash value matching pre-defined criteria. Finding the nonce is evidence of considerable effort or work invested in the search. Each node uses its computing power in a race to solve the puzzle first and win the right to author the latest block.

Financial incentives are in play: The node that first announces a solution receives a reward. Through the rewards, the network's native currency is issued, and nodes are encouraged to invest computing power into solving the task. Network security scales with computing power; more investment leads to a more secure PoW network.

</ExpansionPanel>

The development of decentralized applications built on blockchain networks began shortly after Bitcoin's debut. In the early days developing dApps could be done only by forking or building on the Bitcoin codebase. However, Bitcoin's monolithic codebase and limited scripting language made dApp development a tedious and complex process for developers.

After the introduction of Bitcoin, several so-called public chains came into being, the first being Ethereum in 2013. These general-purpose blockchains are aimed at providing a decentralized network that allows the implementation of a variety of use cases.

![Timeline of blockchain technology](/timeline.png)

Ethereum is a public blockchain with smart contract functionality enabling applications based on self-executing, self-enforcing, and self-verifying account holding objects. It can be seen as a response to the difficulties of developing applications on Bitcoin.

With Ethereum the application layer of the chain took the form of a virtual machine called the **Ethereum Virtual Machine (EVM)**. The EVM runs smart contracts, thereby providing a single chain on which to deploy all sorts of programs. Despite its many benefits, the EVM is a sandbox that delineates the range of implementable use cases. Simplistic and some complex use cases can be implemented with it but are nonetheless **limited regarding design and efficiency by the limitations of the sandbox**. Additionally, developers are limited to programming languages that are tailored to the EVM.

Even though the launch of Ethereum with its EVM was a big step forward, **some issues of public, general-purpose blockchains remained**: low flexibility for developers and difficulties with speed, throughput, scalability, state finality, and sovereignty.

In the world of blockchains "speed" means **transaction speed**. You can understand transaction speed as the time it takes to confirm a transaction. Speed is naturally impacted by the target delay between blocks, which is 10 minutes in Bitcoin and 15 seconds in Ethereum. Speed is also impacted by the backlog of equally worthy pending transactions all competing to be included in new blocks.

**Throughput** describes how many transactions the network can handle per unit of time. Throughput can be limited for reasons of physical network bandwidth, computer resources, or even by decisions embedded in the protocol. Not all dApps have the same throughput requirements, but they all have to make do with the _average_ resulting throughput of the platform itself if they are implemented on a general-purpose blockchain. This impacts the **scalability** of dApps.

**State finality** is an additional concern. Finality describes whether and when committed blocks with transactions can no longer be reverted/revoked. It is important to differentiate between *probabilistic* and *absolute finality*.


<Accordion :items="
    [
        {
            title: 'Probabilistic finality',
            description: '**Probabilistic finality** describes the finality of a transaction dependent on how probable reverting a block is, i.e. the probability of removing a transaction. The more blocks come after the block containing a specific transaction, the less probable a transaction may be reverted, as *longest* or *heaviest chain rules* apply in the case of forks.'
        },
        {
            title: 'Absolute finality',
            description: '**Absolute finality** is a trait of protocols based on Proof-of-Stake (PoS). Finality comes as soon as a transaction and block are verified. There are no scenarios in which a transaction could be revoked after it has been finalized.'
        }
    ]
"/>


<ExpansionPanel title="Finality in PoW and PoS networks">

Proof-of-Stake (PoS) networks can have absolute finality because the total staked amount is known at all times. It takes a _public_ transaction to stake and another to unstake. If some majority of the stakers agree on a block, then the block can be considered "final" because there is no process that could overturn the consensus.

This is different from PoW networks, where the total hashing capacity is unknown and can only be estimated by a combination of the puzzle's difficulty and the speed at which new blocks are issued. To add or remove hashing capacity all it takes is to turn on or off machines. When hashing capacity is removed too abruptly, it results in a drop in the network transaction throughput as blocks suddenly fail to be issued around the target interval.

</ExpansionPanel>

When developing on Ethereum, the developer needs to contend with **two layers of governance**: The chain's governance and the application's governance. Independently of the dApp's governance needs, developers must come to terms with the underlying chain's governance.

Given the features of existing public blockchain projects and the requirements for privacy in certain industries, a push towards **private, or managed, chains** followed. Private distributed ledgers are blockchains with access barriers and sophisticated permission management. Platforms for permissioned networks such as R3's Corda and the Hyperledger Project's Hyperledger Fabric from the Linux Foundation are examples.

The eventual development of further and more complex applications required a more flexible environment. This led to the launch of multiple **purpose-built/application-specific blockchains**, each providing a platform tailored to the necessities of use cases and applications. Each of these blockchains acted as self-contained environments limited by the use cases they were envisioned for.

**General-purpose chains are limited to simplistic use case applications, while application-specific chains only fit certain use cases.** _Is it possible to build a platform for all use cases that does away with the limitations of general-purpose chains?_

## How does Cosmos fit into the general development of blockchain technology?

In 2016 Jae Kwon and Ethan Buchman founded the Cosmos network with its consensus algorithm, [Tendermint](https://tendermint.com/).

<HighlightBox type="tip">

Take a look at the 2016 [Cosmos Whitepaper](https://v1.cosmos.network/resources/whitepaper) to find out more about the origins of Cosmos.

</HighlightBox>

In 2014 Kwon invented the original Tendermint mechanism. Later in 2015, Buchman and Kwon began working together and jointly founded Tendermint Inc by the end of the year.

<ExpansionPanel title="The skinny on Tendermint">

Tendermint is a consensus algorithm with Byzantine Fault-Tolerance (BFT) and a consensus engine. It enables applications to be replicated in sync on many machines. Blockchain networks require BFT to ensure functioning even with malfunctioning or malicious nodes present. The result is known as a Replicated State Machine with Byzantine Fault Tolerance. It guarantees BFT properties for distributed systems and their applications.

It does this:

* **Securely** - Tendermint continues working even if up to 1/3 of machines fail or misbehave.
* **Consistently** - every machine computes the same state and accesses the same transaction log.

Tendermint is widely used across the industry and is the most mature BFT consensus engine for Proof-of-Stake (PoS) blockchains.

For more on Tendermint, have a look at this helpful [introduction](https://docs.tendermint.com/master/introduction/what-is-tendermint.html).

</ExpansionPanel>

Initially Cosmos was an open-source community project built by the Tendermint team. Since then the **Interchain Foundation (ICF)** has assisted with the development and launch of the network. The ICF is a Swiss non-profit that raised funds in 2017 to finance the development of open-source projects building on the Cosmos network.

Cosmos' founding **vision** is that of an easy development environment for blockchain technology. Cosmos wants to address the main issues of previous blockchain projects and provide interoperability between chains to foster an **internet of blockchains**.

*How is Cosmos an internet of blockchains?* Cosmos is a **network of interoperable blockchains**, each implemented with different properties suitable for their individual use cases. Cosmos lets developers create blockchains that maintain sovereignty free from any "main chain" governance, have fast transaction processing, and are interoperable. With Cosmos a multitude of use cases becomes feasible.

To achieve this vision and type of network, the ecosystem relies on an **open-source toolkit**, including the [Inter-Blockchain Communication (IBC)](https://ibcprotocol.org/) protocol, its implementation in the [Cosmos SDK](https://v1.cosmos.network/sdk), and [Tendermint](https://tendermint.com/) as the base layer providing distributed state finality. A set of modular, adaptable, and interchangeable tools helps not only to quickly spin up a blockchain but also facilitates the customization of secure and scalable chains.

Cosmos is a network of interoperable application blockchains. Cosmos' application blockchains are built with the Cosmos SDK. The Cosmos SDK includes the prerequisites that make it possible for created blockchains to participate in inter-chain communications using the Inter-Blockchain Communication Protocol (IBC). Chains built with the Cosmos SDK use the Tendermint consensus. Each of these topics is unfolded in more detail in the sections that follow.

### How does Cosmos solve the scalability issue?

Scalability is a challenge of blockchain technology. Cosmos allows applications to scale to millions of users. This degree of scalability is possible as Cosmos addresses **two types of scalability**:

* **Horizontal scalability:** scaling by adding similar machines to the network. When scaling out, the network can accept more nodes to participate in the state replication, consensus observation, and any activity that queries the state.
* **Vertical scalability:** scaling by improving the network's components to increase its computational power. Scaling up, the network can accept more transactions and any activity that modifies the state.

In a blockchain context, vertical scalability is typically achieved through the optimization of the consensus mechanism and applications running on the chain. On the consensus side, Cosmos achieves vertical scalability with the help of the Tendermint BFT. The Cosmos Hub currently conducts transactions in seven seconds. The only remaining bottleneck is then the application.

The consensus mechanism and application optimization of your blockchain can only take you so far. To overcome the limits of vertical scalability, Cosmos' multi-chain architecture allows for **one application to run in parallel** on different but IBC-coordinated chains, whether operated by the same validator set or not. This inter-chain, horizontal scalability theoretically allows for infinite vertical-like scalability minus the coordination overhead.

<HighlightBox type="info">

In blockchain, a **validator** is one or more cooperating computers that participate in the consensus by, among other things, creating blocks.

</HighlightBox>

### How does Cosmos promote sovereignty?

Applications deployed on general-purpose blockchains all share the same underlying environment. When a change in the application needs to be made, it not only depends on the governance structures of the application but also on that of the environment. The feasibility of implementing changes depends on the governance mechanisms set by the protocol on which the application builds. The chain's governance limits the application's sovereignty. For this reason it is often called a **two-layer governance**.

For example, an application on a typical blockchain can have its governance structure, but it exists atop blockchain governance, and chain upgrades can potentially break applications. Application sovereignty is therefore diminished in two-layer governance settings.

Cosmos resolves this issue as developers can build a blockchain tailored to the application. There are no limits to the application's governance when every chain is maintained by its own set of validators. Cosmos follows a **one-layer governance design**.

### How does Cosmos improve user experience?

In the world of traditional general-purpose blockchains, application design and efficiency are limited for blockchain developers. In the Cosmos universe the standardization of architecture components combined with the provided customization opportunities frees up the possibility for an unconstrained, seamless, and intuitive user experience.

It becomes easier for users to navigate between different blockchains and applications as the same ground rules apply because of the standardization of components. Cosmos makes the world easier for developers while making dApps more user-friendly. Cosmos enables sovereignty with interoperability!

## Next up

In the [next section](./cosmos-ecosystem.md) you can find an introduction to all that the Cosmos ecosystem has to offer.


--> Core concepts: modularity, sending transactions or messages to a chain, querying data from a chain


# Messages

<HighlightBox type="synopsis">

In this section, you will take a closer look at messages, `Msg`. It is recommended to take a look at the following previous sections to better understand messages:

* [A Blockchain App Architecture](./architecture.md)
* [Accounts](./accounts.md)
* [Transactions](./transactions.md)

At the end of the section, you can find a code example illustrating message creation and the inclusion of messages in transactions for your checkers blockchain.

Understanding `Msg` will help you prepare for the [next section on modules in the Cosmos SDK](./modules.md)) as messages are a primary object handled by modules.

</HighlightBox>

Messages are one of two primary objects handled by a module in the Cosmos SDK. The other primary object handled by modules is queries. While messages inform the state and have the potential to alter it, queries inspect the module state and are always read-only.

In the Cosmos SDK, a **transaction** contains **one or more messages**. The module processes the messages after the transaction is included in a block by the consensus layer.

<ExpansionPanel title="Signing a message">

Remember from the [last section on transactions](./transactions.md) that transactions must be signed before a validator includes them in a block. Every message in a transaction must be signed by the addresses as specified by `GetSigners`.

The Cosmos SDK currently allows signing transactions with either `SIGN_MODE_DIRECT` or `SIGN_MODE_LEGACY_AMINO_JSON` methods.

When an account signs a message it signs an array of bytes. This array of bytes is the outcome of serializing the message. For the signature to be verifiable at a later date, this conversion needs to be deterministic. For this reason, you define a canonical bytes representation of the message, typically with the parameters ordered alphabetically.

</ExpansionPanel>

## Messages and the transaction lifecycle

Transactions containing one or more valid messages are serialized and confirmed by the Tendermint consensus engine. As you might recall, Tendermint is agnostic to the transaction interpretation and has absolute finality. When a transaction is included in a block, it is confirmed and finalized with no possibility of chain re-organization or cancellation.

The confirmed transaction is relayed to the Cosmos SDK application for interpretation. Each message is routed to the appropriate module via `BaseApp`’s `MsgServiceRouter`. `BaseApp` decodes each message contained in the transaction. Each module has its own `MsgService` that processes each received message.

## `MsgService`

Although it is technically feasible to proceed to create a novel `MsgService`, the recommended approach is to define a Protobuf `Msg` service. Each module has exactly one Protobuf `Msg` service defined in `tx.proto` and there is an RPC service method for each message type in the module. The Protobuf message service implicitly defines the interface layer of the state mutating processes contained within the module.

How does all of this translate into code? Here's an example `MsgService` from the [`bank` module](https://docs.cosmos.network/master/modules/bank/):

Example MsgService:

```protobuf
// Msg defines the bank Msg service.
service Msg {
  // Send defines a method for sending coins from one account to another account.
  rpc Send(MsgSend) returns (MsgSendResponse);

  // MultiSend defines a method for sending coins from some accounts to other accounts.
  rpc MultiSend(MsgMultiSend) returns (MsgMultiSendResponse);
}
```

In the above example, we can see that:

* Each `Msg` service method has exactly **one argument**, such as `MsgSend`, which must implement the `sdk.Msg` interface and a Protobuf response.
* The **standard naming convention** is to call the RPC argument `Msg<service-rpc-name>` and the RPC response `Msg<service-rpc-name>Response`.

## Client and server code generation

The Cosmos SDK uses Protobuf definitions to generate client and server code:

* The `MsgServer` interface defines the server API for the `Msg` service. Its implementation is described in the [`Msg` services documentation](https://docs.cosmos.network/master/building-modules/msg-services.html).
* Structures are generated for all RPC requests and response types.

<HighlightBox type="tip">

If you want to dive deeper when it comes to messages, the `Msg` service and modules take a look at:

* The Cosmos SDK documentation on [`Msg` service](https://docs.cosmos.network/master/building-modules/msg-services.html).
* The Cosmos SDK documentation on messages and queries addressing how to define messages using `Msg` services - [Amino `LegacyMsg`](https://docs.cosmos.network/master/building-modules/messages-and-queries.html#legacy-amino-legacymsgs).

</HighlightBox>

## Next up

Have a look at the code example below to get a better sense of how the above translates in development. If you feel ready to dive into the next main concept of the Cosmos SDK, you can head straight to the [next section](./modules.md)) to learn more about modules.

<ExpansionPanel title="Show me some code for my checkers blockchain - Including messages">

In the [previous](./architecture.md) code examples, the ABCI application was aware of a single transaction type: that of a checkers move with four `int` values. With multiple games, this is no longer sufficient. Additionally, you will need to conform to the SDK's way of handling `Tx`, which means **creating messages that are then included in a transaction**.

## What you need

Begin by describing the messages you need for your checkers application to have a solid starting point before diving into the code:

1. In the former _Play_ transaction, your four integers need to move from the transaction to an `sdk.Msg`, wrapped in said transaction. Four flat `int` values are no longer sufficient as you need to follow the `sdk.Msg` interface, identify the game for which a move is meant, and distinguish a move message from other message types.
2. You need to add a message type for creating a new game. When this is done, a player can create a new game and this new game will mention the other players. A generated ID identifies this newly created game and is returned to the message creator.
3. It would be a welcomed idea for the other person to be able to reject the challenge. That would have the added benefit of clearing the state of stale un-started games.

## How to proceed

Now, let's have a closer look at the messages around the **game creation**.

1. The message itself is structured like this:

    ```go
    type MsgCreateGame struct {
        Creator string
        Red     string
        Black   string
    }
    ```

    Where `Creator` contains the address of the message signer.

2. The corresponding response message would then be:

    ```go
    type MsgCreateGameResponse struct {
        IdValue string
    }
    ```

With the messages defined, you need to declare how the message should be handled. This involves:

1. Describing how the messages are serialized.
2. Writing the code that handles the message and places the new game in the storage.
3. Putting hooks and callbacks at the right places in the general message handling.

Starport can help you create all that plus the `MsgCreateGame` and `MsgCreateGameResponse` objects with this command:

```sh
$ starport scaffold message createGame red black --module checkers --response idValue
```

<HighlightBox type="info">

Starport creates a whole lot of other files, see [My Own Chain](../4-my-own-chain/index.md) for details and make additions to existing files.

</HighlightBox>

### A sample of things Starport did for you

Starport significantly reduces the amount of work a developer has to do to build an application with the Cosmos SDK. Among others, it assists with:

1. Getting the signer, the `Creator`, of your message:

    ```go
    func (msg *MsgCreateGame) GetSigners() []sdk.AccAddress {
        creator, err := sdk.AccAddressFromBech32(msg.Creator)
        if err != nil {
           panic(err)
       }
       return []sdk.AccAddress{creator}
    }
    ```

    Where `GetSigners` is [a requirement of `sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/1dba673/types/tx_msg.go#L21).

2. Making sure the message's bytes to sign are deterministic:

    ```go
    func (msg *MsgCreateGame) GetSignBytes() []byte {
        bz := ModuleCdc.MustMarshalJSON(msg)
        return sdk.MustSortJSON(bz)
    }
    ```

3. Adding a callback for your new message type in your module's message handler `x/checkers/handler.go`:

    ```go
    ...
    switch msg := msg.(type) {
        ...
        case *types.MsgCreateGame:
            res, err := msgServer.CreateGame(sdk.WrapSDKContext(ctx), msg)
            return sdk.WrapServiceResult(ctx, res, err)
        ...
    }
    ```

4. Creating an empty shell of a file (`x/checkers/keeper/msg_server_create_game.go`) for you to include your code, and the response message:

    ```go
    func (k msgServer) CreateGame(goCtx context.Context, msg *types.MsgCreateGame) (*types.MsgCreateGameResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgCreateGameResponse{}, nil
    }
    ```

## What is left to do?

Your work is mostly done. You will want to create the specific game creation code to replace `// TODO: Handling the message`. For this, you will need to:

1. Decide on how to create a new and unique game ID: `newIndex`.

    <HighlightBox type="tip">

    For more details and to avoid diving too deep in this section, see [My Own Chain](../4-my-own-chain/index.md).

    </HighlightBox>

2. Extract and verify addresses, such as:

    ```go
    red, err := sdk.AccAddressFromBech32(msg.Red)
    if err != nil {
        return nil, errors.New("invalid address for red")
    }
    ```

3. Create a game object with all required parameters - see the [modules section](./modules.md)) for the declaration of this object:

    ```go
    storedGame := {
        Creator:   creator,
        Index:     newIndex,
        Game:      rules.New().String(),
        Red:       red,
        Black:     black,
    }
    ```

4. Send it to storage - see the [modules section](./modules.md)) for the declaration of this function:

    ```go
    k.Keeper.SetStoredGame(ctx, storedGame)
    ```

5. And finally, return the expected message:

    ```go
    return &types.MsgCreateGameResponse{
        IdValue: newIndex,
    }, nil
    ```

Not to forget:

* If you encounter an internal error, you should `panic("This situation should not happen")`.
* If you encounter a user or _regular_ error, like not having enough funds, you should return a regular `error`.

## The other messages

You can also implement other messages.

1. The **play message**, which means implicitly accepting the challenge when playing for the first time. If you create it with Starport, use:
    ```sh
    $ starport scaffold message playMove idValue fromX:uint fromY:uint toX:uint toY:uint --module checkers --response idValue
    ```

    Which generates, among others, the object files, callbacks, and a new file for you to write your code:

    ```go
    func (k msgServer) PlayMove(goCtx context.Context, msg *types.MsgPlayMove) (*types.MsgPlayMoveResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgPlayMoveResponse{}, nil
    }
    ```

2. The **reject message**, which should be valid only if the player never played any moves in this game.

    ```sh
    $ starport scaffold message rejectGame idValue --module checkers
    ```

    It generates, among others:

    ```go
    func (k msgServer) RejectGame(goCtx context.Context, msg *types.MsgRejectGame) (*types.MsgRejectGameResponse, error) {
        ctx := sdk.UnwrapSDKContext(goCtx)

        // TODO: Handling the message
        _ = ctx

        return &types.MsgRejectGameResponse{}, nil
    }
    ```

## Other considerations

What would happen if one of the two players has accepted the game by playing, but the other player has neither accepted nor rejected the game? You can address this scenario by:

* Having a timeout after which the game is canceled. This cancelation could be handled automatically in ABCI's `EndBlock`, or rather its equivalent in the Cosmos SDK, without any of the players having to trigger the cancelation.
* Keeping an index as a First-In-First-Out (FIFO) list or a list of un-started games ordered by their cancelation time, so that this automatic trigger does not consume too many resources.

What would happen if a player stops taking turns? To ensure functionality for your checkers application you can consider:

* Having a timeout after which the game is forfeited. You could also automatically charge the forgetful player, if and when you implement a wager system.
* Keeping an index of games that could be forfeited. If both timeouts are the same, you can keep a single FIFO list of games, so you can clear them from the top of the list as necessary.

In general terms, you could add `timeout: Timestamp` to your `StoredGame` and update it every time something changes in the game. You can decide on a maximum delay: what about one day?

Of note is that there are no _open_ challenges, meaning a player cannot create a game where the second player is unknown until someone steps in. So player matching is left outside of the blockchain. It is left to the enterprising student to incorporate it inside the blockchain by changing the necessary models.

If you would like to get started on building your own checkers game, you can head straight to the main exercise in [My Own Chain](../4-my-own-chain/index.md).

</ExpansionPanel>







# Queries

<HighlightBox type="synopsis">

In this section, you will discover queries. They are one of two primary objects handled by modules. Make sure to be all set up by reading the previous sections:

* [A Blockchain App Architecture](./architecture.md)
* [Accounts](./accounts.md)
* [Transactions](./transactions.md)
* [Modules](./modules.md)

</HighlightBox>

A query is a request for information made by end-users of an application through an interface and processed by a full node. Available information includes:

* Information about the network
* Information about the application itself
* Information about the application state

Queries do not require consensus to be processed as they do not trigger state transitions. Therefore, queries can be fully handled independently by a full node.

<HighlightBox type="info">

Visit the [detailed Cosmos SDK documentation](https://docs.cosmos.network/master/basics/query-lifecycle.html) to get a clear overview of the query lifecycle and learn how a query is created, handled, and responded to.

</HighlightBox>

## Next up

You can now continue with the [next section](./events.md) if you want to skip ahead to read up on events.

If you prefer to see some code in action and continue with the checkers blockchain, take a look at the expandable box beneath.

<ExpansionPanel title="Show me some code for my checkers blockchain">

If you have used Starport so far, it has already created queries for you to get one stored game or a list of them. You still do not have a way to check whether a move works/is valid. It would be wasteful to send a transaction with an invalid move. It is better to catch such a mistake before submitting a transaction. So you are going to create a query to know whether a move is valid.

Starport can again help you with a simple command:

```sh
$ starport scaffold query canPlayMove idValue player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool
```

This creates the query objects:

```go
type QueryCanPlayMoveRequest struct {
    IdValue string
    Player  string
    FromX   uint64
    FromY   uint64
    ToX     uint64
    ToY     uint64
}

type QueryCanPlayMoveResponse struct {
    Possible bool
    Reason   string // Actually, you have to add this one by hand.
}
```

It also creates a function that should looks familiar:

```go
func (k Keeper) CanPlayMove(goCtx context.Context, req *types.QueryCanPlayMoveRequest) (*types.QueryCanPlayMoveResponse, error) {
    ...
    // TODO: Process the query

    return &types.QueryCanPlayMoveResponse{}, nil
}
```

So now you are left with filling in the gaps under `TODO`. Simply put:

1. Is the game finished? You should add a `Winner` to your `StoredGame` first.
2. Is it an expected player?

    ```go
    var player rules.Player
    if strings.Compare(rules.RED_PLAYER.Color, req.Player) == 0 {
        player = rules.RED_PLAYER
    } else if strings.Compare(rules.BLACK_PLAYER.Color, req.Player) == 0 {
        player = rules.BLACK_PLAYER
    } else {
        return &types.QueryCanPlayMoveResponse{
                Possible: false,
                Reason:   "message creator is not a player",
            }, nil
    }
    ```

3. Is it the player's turn?

    ```go
    fullGame := storedGame.ToFullGame()
        if !fullGame.Game.TurnIs(player) {
            return &types.QueryCanPlayMoveResponse{
                Possible: false,
                Reason:   "player tried to play out of turn",
            }, nil
        }
    ```

4. Attempt the move in memory without committing any new state:

    ```go
    _, moveErr := fullGame.Game.Move(
        rules.Pos{
            X: int(req.FromX),
            Y: int(req.FromY),
        },
        rules.Pos{
            X: int(req.ToX),
            Y: int(req.ToY),
        },
    )
    if moveErr != nil {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf("wrong move", moveErr.Error()),
        }, nil
    }
    ```

5. If all checks passed, return the OK status:

    ```go
    return &types.QueryCanPlayMoveResponse{
        Possible: true,
        Reason:   "ok",
    }, nil
    ```

Note that the player's move will be tested against the latest validated state of the blockchain. It does not test against the intermediate state being calculated as transactions are delivered, nor does it test against the potential state that would result from delivering the transactions still in the transaction pool.

A player can test their move only once the opponent's move is included in a previous block. These types of edge-case scenarios are not common in your checkers game and you can expect little to no effect on the user experience.

This is not an exhaustive list of potential queries. Some examples of other possible queries would be to get a player's open games or to get a list of games that are timing out soon. It depends on the needs of your application and how much functionality you willingly provide.

</ExpansionPanel>






# Transactions

Transactions are objects created by end-users to trigger state changes in applications. They are comprised of metadata that defines a context and one or more [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L11-L33) that trigger state changes within a module through the module’s Protobuf message service.

## Transaction process from an end-user perspective

While there is much to explore as you journey through the stack, begin by understanding the transaction process from a user perspective:

<Accordion :items="
    [
        {
            title: 'Decide',
            description: '**Decide** on the messages to put into the transaction. This is normally done with the assistance of a wallet or application and a user interface.'
        },
        {
            title: 'Generate',
            description: '**Generate** the transaction using the Cosmos SDK\'s `TxBuilder`. `TxBuilder` is the preferred way to generate a transaction.'
        },
        {
            title: 'Sign',
            description: '**Sign** the transaction. Transactions must be signed before a validators includes them in a block.'
        },
        {
            title: 'Broadcast',
            description: '**Broadcast** the signed transaction using one of the available interfaces.'
        }
    ]
"/>

<!-- TODO add link to TxBuilder: https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L36-L46 -->

**Decide** and **sign** are the main interactions of a user. **Generate** and **broadcast** are attended to by the user interface and other automation.

## Transaction objects

Transaction objects are Cosmos SDK types that implement the [`Tx`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L50-L57) interface. They contain the following methods:

* [`GetMsgs`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L52). Unwraps the transaction and returns a list of contained [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L11-L33). One transaction may have one or multiple messages.
* [`ValidateBasic`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L56). Includes lightweight, stateless checks used by ABCI message’s `CheckTx` and `DeliverTx` to make sure transactions are not invalid. For example, the auth module's [`StdTx`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/x/auth/legacy/legacytx/stdtx.go#L77-L83) [`ValidateBasic`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/x/auth/legacy/legacytx/stdtx.go#L100-L126) function checks that its transactions are signed by the correct number of signers and that the fees do not exceed the user's maximum. Note that this function is different from the [`ValidateBasic`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L24) functions for `sdk.Msg`, which perform basic validity checks on messages only. For example, `runTX` first runs `ValidateBasic` on each message when it checks a transaction created from the auth module. Then it runs the auth module's [`AnteHandler`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/handler.go#L8), which calls `ValidateBasic` for the transaction itself.

You should rarely manipulate a `Tx` object directly. It is an intermediate type used for transaction generation. Developers usually use the [`TxBuilder`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L36-L46) interface.

## Messages

<HighlightBox type="info">

Transaction messages are not to be confused with ABCI messages, which define interactions between Tendermint and application layers.

</HighlightBox>

Messages or [`sdk.Msg`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L11-L33) are module-specific objects that trigger state transitions within the scope of the module they belong to. Module developers define module messages by adding methods to the Protobuf `Msg` service and defining a `MsgServer`. Each `sdk.Msg` is related to exactly one Protobuf `Msg` service RPC defined inside each module's `tx.proto` file. A Cosmos SDK app router automatically maps every `sdk.Msg` to a corresponding RPC service, which routes it to the appropriate method. Protobuf generates a `MsgServer` interface for each module's `Msg` service and the module developer implements this interface.

This design puts more responsibility on module developers. This allows application developers to reuse common functionalities without having to repetitively implement state transition logic. While messages contain the information for the state transition logic, a transaction's other metadata and relevant information are stored in the `TxBuilder` and `Context`.

## Signing Transactions

Every message in a transaction must be signed by the addresses specified by its [`GetSigners`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx_msg.go#L32). The Cosmos SDK currently allows signing transactions in two different ways:

* [`SIGN_MODE_DIRECT`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/signing/signing.pb.go#L36) (preferred). The most used implementation of the `Tx` interface is the [Protobuf `Tx`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/tx.pb.go#L32-L42) message, which is used in `SIGN_MODE_DIRECT`. Once signed by all signers, the `BodyBytes`, `AuthInfoBytes`, and [`Signatures`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/tx.pb.go#L113) are gathered into [`TxRaw`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/tx.pb.go#L103-L114), whose [serialized bytes](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/tx.pb.go#L125-L136) are broadcast over the network.
* [`SIGN_MODE_LEGACY_AMINO_JSON`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/tx/signing/signing.pb.go#L43). The legacy implementation of the `Tx` interface is the [`StdTx`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/x/auth/legacy/legacytx/stdtx.go#L77-L83) struct from `x/auth`. The document signed by all signers is [`StdSignDoc`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/x/auth/legacy/legacytx/stdsign.go#L24-L32), which is encoded into [bytes](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/x/auth/legacy/legacytx/stdsign.go#L35-L58) using Amino JSON. Once all signatures are gathered into `StdTx`, `StdTx` is serialized using Amino JSON and these bytes are broadcast over the network. This method is being deprecated.

## Generating transactions

The `TxBuilder` interface contains metadata closely related to the generation of transactions. The end-user can freely set these parameters for the transaction to be generated:

* [`Msgs`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L39). The array of messages included in the transaction.
* [`GasLimit`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L43). Option chosen by the users for how to calculate the gas amount they are willing to spend.
* [`Memo`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L41). A note or comment to send with the transaction.
* [`FeeAmount`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L42). The maximum amount the user is willing to pay in fees.
* [`TimeoutHeight`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L44). Block height until which the transaction is valid.
* [`Signatures`](https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/client/tx_config.go#L40). The array of signatures from all signers of the transaction.

As there are currently two modes for signing transactions, there are also two implementations of `TxBuilder`. There is a wrapper for `SIGN_MODE_DIRECT` and the [`StdTxBuilder`](https://github.com/cosmos/cosmos-sdk/blob/8fc9f76329dd2433d9b258a867500de419522619/x/auth/migrations/legacytx/stdtx_builder.go#L18-L21) for `SIGN_MODE_LEGACY_AMINO_JSON`. The two possibilities should normally be hidden away because end-users should prefer the overarching [`TxConfig`](https://github.com/cosmos/cosmos-sdk/blob/a72f6a8d4fcb1328ead8f14e212c95c1c0c6d64d/client/tx_config.go#L25-L31) interface. `TxConfig` is an [app-wide](https://github.com/cosmos/cosmos-sdk/blob/a72f6a8d4fcb1328ead8f14e212c95c1c0c6d64d/client/context.go#L46) configuration for managing transactions accessible from the context. Most importantly, it holds the information about whether to sign each transaction with `SIGN_MODE_DIRECT` or `SIGN_MODE_LEGACY_AMINO_JSON`.

A new `TxBuilder` will be instantiated with the appropriate sign mode by calling `txBuilder := txConfig.NewTxBuilder()`. `TxConfig` will also take care of correctly encoding the bytes either using `SIGN_MODE_DIRECT` or `SIGN_MODE_LEGACY_AMINO_JSON` once `TxBuilder` is correctly populated with the setters of the fields described above.

This is a pseudo-code snippet of how to generate and encode a transaction using the `TxEncoder()` method:

```go
txBuilder := txConfig.NewTxBuilder()
txBuilder.SetMsgs(...) // and other setters on txBuilder
```

## Broadcasting the transaction

Once the transaction bytes are generated and signed, there are **three primary ways of broadcasting** the transaction:

* Using the command-line interface (CLI).
* Using gRPC.
* Using REST endpoints.

Application developers create entrypoints to the application by creating a command-line interface typically found in the application's `./cmd` folder, gRPC, and/or REST interface. These interfaces allow users to interact with the application.

### CLI

For the command-line interface (CLI) module developers create subcommands to add as children to the application top-level transaction command [`TxCmd`](https://github.com/cosmos/cosmos-sdk/blob/56ab4e4c934365662162a91bcf35108a0bd78fef/x/bank/client/cli/tx.go#L29-L60).

CLI commands bundle all the steps of transaction processing into one simple command: 

* Creating messages
* Generating transactions
* Signing
* Broadcasting

### gRPC

The principal usage of gRPC is in the context of module query services. The Cosmos SDK also exposes a few other module-agnostic gRPC services. One of them is the `Tx` service. The `Tx` service exposes a handful of utility functions such as simulating a transaction or querying a transaction and also one method to [broadcast transactions](https://github.com/cosmos/cosmos-sdk/blob/master/docs/run-node/txs.md#broadcasting-a-transaction-1).

<HighlightBox type="tip">

Sometimes looking at an example can be helpful. Take a closer look at this [code example](https://github.com/cosmos/cosmos-sdk/blob/master/docs/run-node/txs.md#programmatically-with-go).

</HighlightBox>

### REST

Each gRPC method has its corresponding REST endpoint generated using gRPC-gateway. Rather than using gRPC, you can also use HTTP to broadcast the same transaction on the `POST` `/cosmos/tx/v1beta1/txs` endpoint.

<HighlightBox type="tip">

Need an example? Check out this [code example](https://github.com/cosmos/cosmos-sdk/blob/master/docs/run-node/txs.md#using-rest).

</HighlightBox>

### Tendermint RPC

The three methods presented above are higher abstractions on the Tendermint RPC `/broadcast_tx_{async,sync,commit}` endpoints. You can use the [Tendermint RPC endpoints](https://docs.tendermint.com/master/rpc/#/Tx) to directly broadcast the transaction through Tendermint if you wish to.

<HighlightBox type="tip">

Tendermint supports the following RPC protocols:

* URI over HTTP
* JSONRPC over HTTP
* JSONRPC over WebSockets

Want more information on broadcasting with Tendermint RPC? Why not take a closer look at the documentation on [Tendermint RPC transactions broadcast APIs](https://docs.tendermint.com/master/rpc/#/Tx)?

</HighlightBox>

## About the introduction to Cosmos chapter

## Next up


