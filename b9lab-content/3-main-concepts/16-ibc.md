# IBC

## The Inter-Blockchain Protocol

The Inter-Blockchain Protocol, IBC, is used to send data from one blockchain to another. In Cosmos, most applications execute on their own purpose-built blockchain running their own validator set. These are the application-specific blockchains built with Cosmos SDK. 

Applications on one chain may have a need to communicate with applications on another blockchain. For example, an application could accept tokens from another blockchain as a form of payment. Interoperability at this level calls for a method of exchanging data about the state or the transactions on another blockchain. 

While such bridges between blockchains can be built and do exist, they are generally constructed in an ad hoc manner. In contracts, IBC provides all Cosmos SDK applications with a common protocol and framework for implementing standardized inter-blockchain communication. 

## Requirements

Applications that use IBC must meet the following requirements:

* Bind to one or more ports
* Define the packet data
* Define optional acknowledgement structures and methods to encode and decode them
* Implement the IBCModule interface

## Modular design

IBC is an end-to-end, connection-oriented, stateful protocol for reliable, ordered, and authenticated communication between heterogeneous blockchains arranged in an unknown and dynamic topology.

This is accomplished by specifying a set of data structures, abstractions, and semantics that can be implemented by any distributed ledger provided they satisfy a small set of requirements.

IBC can be used to build a wide range of cross-chain applications, which include token transfers, atomic swaps, multi-chain smart contracts (with or without mutually comprehensible virtual machines, and data & code sharding of various kinds.

Modules do not require in-depth knowledge of the low-level details of clients, connections, and proof verification.

## Components

<HighlightBox type=”info”>
Components https://github.com/cosmos/cosmos-sdk/blob/master/docs/ibc/overview.md 
</HighlightBox>

### Clients

IBC clients are light clients that are identified by a unique client ID. IBC clients track the consensus states of other blockchains and the proof specs of those blockchains that are required to properly verify proofs against the client's consensus state.

A client can be associated with any number of connections to multiple chains

Supported IBC clients::

* **Solo Machine light client**: devices such as phones, browsers, or laptops - https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/06-solomachine 
* **Tendermint light client**: The default for Cosmos SDK-based chains - https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/07-tendermint 
* **Localhost (loopback) client**: Useful for testing, simulation, and relaying packets to modules on the same application - https://github.com/cosmos/ibc-go/blob/main/modules/light-clients/09-localhost 

### Connections

A connection encapsulates two `ConnectionEnd` objects on two separate blockchains. Each ConnectionEnd is associated with a client of the counterparty blockchain. The connection handshake is responsible for verifying that the light clients on each chain are correct for their respective counterparties. Connections are responsible for facilitating all cross-chain verification of the IBC state. A connection can be associated with any number of channels

### Proofs & paths

In IBC, blockchains do not directly pass messages to each other over the network.To communicat, blockchains commit state to a precisely defined path reserved for a specific message type and a specific counterparty. Relayers monitor for updates to these paths and relay messages by submitting the data stored under the path along with a proof of that data to the counterparty chain. The paths that all IBC implementations must support for committing IBC messages are defined in ICS-24 host requirements: https://github.com/cosmos/ics/tree/master/spec/core/ics-024-host-requirements. The proof format that all implementations must produce and verify is defined in ICS-23 implementation - https://github.com/confio/ics23 

### Capabilities

IBC is intended to work in execution environments where modules do not necessarily trust each other. IBC needs to authenticate module actions on ports and channels. Only modules with the appropriate permissions can use the channels. (https://github.com/cosmos/cosmos-sdk/blob/master/docs/architecture/adr-003-dynamic-capability-store.md)

Upon binding to a port or creating a channel for a module, IBC returns a dynamic capability that the module must claim to use that port or channel. This binding strategy prevents other modules from using that port or channel since those modules do not own the appropriate capability. 

IBC modules do not need to interact at all with these lower-level abstractions. The relevant abstraction layer for IBC application developers is that of channels and ports.
As self-contained modules, module on one blockchain can communicate with other modules on other blockchains by sending, receiving, and acknowledging packets through channels that are uniquely identified by the (channelID, portID) tuple

An analogy to consider is IBC modules as internet apps on a computer. A channel can then be conceptualized as an IP connection, with the IBC portID like an IP port, and the IBC channelID is like an IP address

### Ports

IBC moduled can bind to any number of ports. Each port is identified by a unique portID. IBC is designed to be secure with mutually-distrusted modules that operate on the same ledger. Binding a port returns the dynamic object capability

To take action on a particular port, for example to open a channel with its portID, a module must provide the dynamic object capability to the IBC handler. This prevents a malicious module from opening channels with ports it does not own. IBC modules are responsible for claiming the capability that is returned on `BindPort`.

### Channels

Channels can be established between two IBC ports. Each port is  exclusively owned by single module. IBC packets are sent over channels. IBC packets contain the destination portID, channelID, the source portID, and channelID which allows IBC to correctly route the packets to the destination module, while also allowing modules receiving packets to know the sender module.

Modules may choose which channels they wish to communicate over. IBC expects modules to implement callbacks that are called during the channel handshake:

4-step handshake

1. Chain A sends a ChanOpenInit message to signal a channel initialization attempt with chain B.
2. Chain B sends a ChanOpenTry message to try opening the channel on chain A.
3. Chain A sends a ChanOpenAck message to mark its channel end status as open.
4. Chain B sends a ChanOpenConfirm message to mark its channel end status as open.
5. Channel is open on both sides

Just as ports came with dynamic capabilities, channel initialization returns a dynamic capability that the module must claim so that they can pass in a capability to authenticate channel actions like sending packets. Cannel capability is passed into the callback in the first part of the handshake.

### Packets

Modules communicate with each other by sending packets over IBC channels. All IBC packets contain:

* Destination portID
* Destination channelID
* Source portID
* Source channelID

These port and channels allow the modules to know the sender module of a given packet. Additionally:

* A sequence to optionally enforce ordering
* TimeoutTimestamp and TimeoutHeight

Modules send custom application data to each other inside the Data []byte field of the IBC packet. Packet data is completely opaque to IBC handlers.

### Receipts & timeouts

IBC works over a distributed network + relies on potentially faulty relayers to relay messages between ledgers. IBC must handle the case where a packet does not get sent to its destination in a timely manner or at all. Packets must specify a timeout height or timeout timestamp after which a packet can no longer be successfully received on the destination chain:
**timeout is reached**: proof-of-packet timeout can be submitted to the original chain which can then perform application-specific logic to timeout the packet, perhaps by rolling back the packet send changes (refunding senders any locked funds, and so on.

In ORDERED channels, a timeout of a single packet in the channel closes the channel. In the UNORDERED case, packets can be received in any order. IBC writes a packet receipt for each sequence it has received in the UNORDERED channel. 

### Acknowledgement

Modules also write application-specific acknowledgements when processing a packet Acknowledgements can be done:

- Synchronously on `OnRecvPacket` if the module processes packets as soon as they are received from IBC module
* Asynchronously if the module processes packets at some later point after receiving the packet

This acknowledgement data is opaque to IBC much like the packet Data and is treated by IBC as a simple byte string `[]byte`.

Receiver modules must encode their acknowledgement so that the sender module can decode it correctly. How the acknowledgement is encoded should be decided through version negotiation during the channel handshake.

After the acknowledgement has been written by the receiving chain, a relayer relays the acknowledgement back to the original sender module which then executes application-specific acknowledgment logic using the contents of the acknowledgement.

When the acknowledgement is received successfully on the original sender chain, the IBC module deletes the corresponding packet commitment as it is no longer needed

## Types of chain

Chains using the Tendermint consensus algorithm can bridge using IBC, but also non-Tendermint chains can use IBC. Two types of non-Tendermint chains are supported:

* **Fast-Finality chains**: Any fast-finality consensus algorithms can connect with Cosmos by adapting IBC
* **Probabilistic**: Things get a bit more complicated for blockchains that do not have fast finality, like Proof-of-Work chains. In this case, IBC uses a special kind of proxy-chain called a Peg-Zone. 

### Ethereum peg zone:

<HighlightBox type=”info”> https://blog.cosmos.network/the-internet-of-blockchains-how-cosmos-does-interoperability-starting-with-the-ethereum-peg-zone-8744d4d2bc3f
</HighlightBox>

A Peg-Zone is a blockchain that tracks the state of another blockchain. The Peg-Zone itself has fast-finality and is therefore compatible with IBC. Its role is to establish finality for the blockchain it bridges.

<HighlightBox info=”info”>
The Tendermint team is working on a Peg-Zone implementation for the Ethereum chain called the [Gravity bridge](./17-bridges.html).
</HighlightBox>

<!-- TODO -->
Paradigms and implications
Interchain accounts
https://medium.com/chainapsis/why-interchain-accounts-change-everything-for-cosmos-interoperability-59c19032bf11


Relayers - What is a relayer? How are relayers used in Cosmos? How can one manage and deploy relayers? Hermes as an example
https://github.com/cosmos/cosmos-sdk/blob/master/docs/ibc/relayer.md 


Token transfers with IBC


## Long-running exercise

Now we want to let players choose to play with foreign tokens. So:

* The `CreateGameTx` transaction needs to be able to specify the token to use, on top of the amount.
* The _billing_ needs to be updated.
* The leaderboard does not need to be adjusted because it is already per token type. We don't want to do another migration example, that's why we had to be clever about the leaderboard structure.

TODO decide how it looks like. 
