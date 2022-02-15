---
title: "Inter-Blockchain Communication"
order: 14
description: Connecting chains with the IBC Protocol
tag: deep-dive
---

# Inter-Blockchain Communication

<HighlightBox type="synopsis">

Cross-chain communication in Cosmos enables parallelism and scaleability with transaction finality. This transaction finality solves well-known problems that plague other platforms: transaction costs, network capacity, and transaction confirmation finality. Learn about the Inter-Blockchain Communication protocol (IBC) that makes cross-chain communication possible.

Before you begin, make sure you understand:

* [Accounts](./accounts.md)
* [Transactions](./transactions.md)
* [Messages](./messages.md)
* [Modules](./modules.md)

</HighlightBox>

The Inter-Blockchain Communication Protocol (IBC) allows sending data from one blockchain to another. Most Cosmos applications execute on their own purpose-built blockchain running their own validator set. These are the application-specific blockchains built with the Cosmos SDK.

Applications on one chain may need to communicate with applications on another blockchain. For example, an application could accept tokens from another blockchain as a form of payment. Interoperability at this level calls for a method of exchanging data about the state or the transactions on another blockchain.

While such bridges between blockchains can be built and do exist, they are generally constructed ad-hoc. IBC provides all Cosmos SDK applications with a common protocol and framework for implementing standardized inter-blockchain communication.

## Modular design and application requirements

IBC allows building a wide range of cross-chain applications including token transfers, atomic swaps, multi-chain smart contracts with or without mutually comprehensible VMs, and data and code sharding of various kinds. It is an end-to-end, connection-oriented, stateful protocol for reliable, ordered, and authenticated communication between heterogeneous blockchains arranged in an unknown and dynamic topology. It is possible by specifying a set of data structures, abstractions, and semantics that can be implemented by any distributed ledger provided they satisfy a small set of requirements. Using IBC does not require in-depth knowledge of the low-level details of clients, connections, and proof verification.

Let's take a closer look at the requirements for using IBC. Applications that use the IBC protocol for cross-chain communication must meet the following requirements:

* Bind to one or more ports.
* Define the packet data.
* Define optional acknowledgment structures and methods to encode and decode them.
* Implement the `IBCModule` interface.

This is accomplished by specifying a set of data structures, abstractions, and semantics that can be implemented by any distributed ledger provided they satisfy a small set of requirements.

IBC can be used to build a wide range of cross-chain applications, which include token transfers, atomic swaps, multi-chain smart contracts with or without mutually comprehensible virtual machines, and data and code sharding of various kinds.

Modules do not require in-depth knowledge of the low-level details of clients, connections, and proof verification.

<HighlightBox type="info">

If you want to begin using IBC, your first step should be to take a closer look at the [Cosmos SDK documentation on IBC components](https://github.com/cosmos/ibc-go/blob/main/docs/ibc/overview.md#components-overview).

</HighlightBox>

### Clients

IBC clients are **light clients** that are identified by a unique client ID. IBC clients track the consensus state of other blockchains and the proof specs of those blockchains required to properly verify proofs against the client's consensus state. A client can be associated with any number of connections to the counterparty chain.

Supported IBC clients are:

* **`solomachine` light client.** Devices such as phones, browsers, or laptops.
* **Tendermint light client.** The default for Cosmos SDK-based chains.
* **Localhost (loopback) client.** Useful for testing, simulation, and relaying packets to modules on the same application.

<HighlightBox type="tip">

You can find documentation on the supported IBC clients here:

* [Cosmos SDK documentation: `solomachine` light client](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/06-solomachine)
* [Cosmos SDK documentation: Tendermint light client](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint)
* [Cosmos SDK documentation: Localhost client](https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/09-localhost)

</HighlightBox>

### Connections

Connections are responsible for facilitating all cross-chain verification of the IBC state. A connection can be associated with any number of channels.

A connection encapsulates two `ConnectionEnd` objects on two separate blockchains. Each `ConnectionEnd` is associated with a client of the counterparty blockchain. The connection handshake is responsible for verifying that the light clients on each chain are the correct ones for their respective counterparties.

### Proofs and paths

In IBC, blockchains do not directly pass messages to each other over the network. To communicate, blockchains commit the state to a precisely defined path reserved for a specific message type and a specific counterparty. Relayers monitor for updates on these paths and relay messages by submitting the data stored under the path along with proof of that data to the counterparty chain.

The paths that all IBC implementations must support for committing IBC messages are defined in the [ICS-24 host state machine requirements](https://github.com/cosmos/ics/tree/master/spec/core/ics-024-host-requirements). The proof format that all implementations must produce and verify is defined in the [ICS-23 implementation documentation from Confio](https://github.com/confio/ics23).

### Capabilities

IBC is intended to work in execution environments where modules do not necessarily trust each other. IBC needs to authenticate module actions on ports and channels. Only modules with the appropriate permissions can use the channels. This is ensured with [dynamic capabilities](https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-003-dynamic-capability-store.md).

Upon binding to a port or creating a channel for a module, IBC returns a dynamic capability that the module must claim to use that port or channel. This binding strategy prevents other modules from using that port or channel since those modules do not own the appropriate capability.

IBC modules do not need to interact at all with these lower-level abstractions. The relevant abstraction layer for IBC application developers is that of channels and ports.

As self-contained modules a module on one blockchain can communicate with other modules on other blockchains by sending, receiving, and acknowledging packets through channels that are uniquely identified by the `(channelID, portID)` tuple. IBC modules can bind to any number of ports. Each port is identified by a unique `portID`. IBC is designed to be secure with mutually-distrusted modules that operate on the same ledger. Binding a port returns the dynamic object capability.

A module must provide the dynamic object capability to the IBC handler to take action on a particular port, for example to open a channel with its `portID`. This prevents a malicious module from opening channels with ports it does not own. IBC modules are responsible for claiming the capability that is returned on `BindPort`.

An analogy to consider: IBC modules as internet apps on a computer. A channel can then be conceptualized as an IP connection with the IBC `portID` as an IP port and the IBC `channelID` as an IP address.

### Channels between IBC ports: transferring data with packets

Channels can be established between two IBC ports. Each port is exclusively owned by a single module. IBC packets are sent over channels to allow modules to communicate with one another. All IBC packets contain to maintain interoperability:

* The source `portID`
* The source `channelID`
* The destination `portID`
* The destination `channelID`
* A sequence to optionally enforce ordering
* `TimeoutTimestamp`
* `TimeoutHeight`

The port channels allow IBC to correctly route the packets to the destination module, while also allowing modules receiving packets to know from which module the packet has come. Modules send custom application data to each other inside the Data []byte field of the IBC packet - packet data is completely opaque to IBC handlers. The sender module encodes the application-specific packet information in the data field and the destination module decodes the data to get the original application data.

Modules may choose which channels they wish to communicate over. IBC expects modules to implement callbacks called during the channel handshake.

_How does a four-step handshake look like?_ A four-step handshake takes place in the following way:

1. Chain A sends a `ChanOpenInit` message to signal a channel initialization attempt with chain B.
2. Chain B sends a `ChanOpenTry` message to try opening the channel on chain A.
3. Chain A sends a `ChanOpenAck` message to mark chain A's channel end status as open.
4. Chain B sends a `ChanOpenConfirm` message to mark chain B's channel end status as open.
5. Channel is open on both sides.

Just as ports came with dynamic capabilities, channel initialization returns a dynamic capability the module must claim so that modules can pass in a capability to authenticate channel actions, for example, to send packets. Channel capability is passed into the callback in the first part of the handshake.

### Receipts and timeouts

IBC works over a distributed network. It might be that IBC needs to rely on potentially faulty relayers to relay messages between ledgers. Cross-chain communication also requires handling instances where a packet does not get sent to its destination on time or at all.

A proof-of-packet timeout can be submitted to the original chain when a timeout is reached, which can then perform the application-specific logic to timeout the packet by rolling back the packet send changes refunding senders any locked funds.

A timeout of a single packet in the channel closes the channel in ORDERED channels. Packets can be received in any order in UNORDERED channels. IBC writes a packet receipt for each sequence it has received in the UNORDERED channel.

### Acknowledgment

Modules also write application-specific acknowledgments when processing a packet. Acknowledgments can be performed in two ways:

* **Synchronously** on `OnRecvPacket`, if the module processes packets as soon as they are received from an IBC module.
* **Asynchronously**, if the module processes packets at some later point after receiving them.

This acknowledgment data is opaque to IBC similar to the packet data. The acknowledgment data is treated by IBC as a simple byte string `[]byte`. Receiver modules have to encode acknowledgments, so that sender modules can decode them correctly. How the acknowledgment is encoded should be decided through version negotiation during the channel handshake.

After the acknowledgment has been written by the receiving chain, a relayer relays the acknowledgment back to the original sender module, which then executes the application-specific acknowledgment logic using the acknowledgment.

When the acknowledgment is received successfully on the original sender chain, the IBC module deletes the corresponding packet commitment as it is no longer needed.

## Non-Tendermint chains and IBC

IBC can bridge Tendermint chains but also non-Tendermint chains. Two types of non-Tendermint chains are supported:

* **Fast-finality chains.** Any fast-finality consensus algorithms can connect with Cosmos by adapting IBC.
* **Probabilistic-finality chains.** For blockchains that do not have fast-finality like Proof-of-Work (PoW) chains things get a bit trickier. IBC uses a special kind of proxy-chain called a peg-zone in this case.

### Ethereum peg-zone

<HighlightBox type="info">

A great example of one of these peg-zones is the [Gravity Bridge](https://github.com/cosmos/gravity-bridge). Take a look at the [section on bridges](./bridges.md) for more information on it.

</HighlightBox>

A peg-zone is a blockchain that tracks the state of another blockchain. The peg-zone itself has fast-finality and is therefore compatible with IBC. Its role is to establish finality for the blockchain it bridges.

<HighlightBox info="info">

For more on IBC, its paradigms, and Interchain accounts, a looks into Josh Lee's post from 2020 [Why Interchain Accounts Change Everything for Cosmos Interoperability](https://medium.com/chainapsis/why-interchain-accounts-change-everything-for-cosmos-interoperability-59c19032bf11) is recommended.

Relayers are an essential part of the IBC infrastructure and there are several implementations. To learn more about relaying please visit the [IBC website](https://ibcprotocol.org/relayers/).

</HighlightBox>

## Next up

You can now skip ahead to the [next section](./bridges.md) to discover bridges in the Cosmos SDK, or you can dive into the code samples below.

<ExpansionPanel title="Show me some code for my checkers blockchain">

You now want to allow players to play with tokens from a different chain. To do that:

* The game information must state the token in which the wager will be denominated upon creation.
* The different payments have to be updated so that they do not use the default token.

Denominating the wager into another token is just a matter of allowing another string that uniquely identifies the token:

```go
type StoredGame struct {
    ...
    Token string
}

type MsgCreateGame struct {
    ...
    Token string
}
```

You can add a helper function to `StoredGame` such that:

```go
func (storedGame *StoredGame) GetWagerCoin() (wager sdk.Coin) {
    return sdk.NewCoin(storedGame.Token, sdk.NewInt(int64(storedGame.Wager)))
}
```

With that the payments are updated with:

```go
err = k.bank.SendCoinsFromAccountToModule(ctx, black, "checkers", sdk.NewCoins(storedGame.GetWagerCoin()))
// or
err = k.bank.SendCoinsFromModuleToAccount(ctx, "checkers", winnerAddress, sdk.NewCoins(winnings))
```

There is nothing more to it in this simple use of _foreign_ tokens.

</ExpansionPanel>
