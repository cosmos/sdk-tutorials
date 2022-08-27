---
title: "Relayers in General"
order: 8
description: Relaying in IBC
tag: deep-dive
---

# Relayers in General

<HighlightBox type="learning">

In this section, you will learn how relayers fit in IBC.

</HighlightBox>

![IBC overview](/academy/4-ibc/images/ibcoverview.png)

It is useful to briefly recap what relaying is and why it is important. IBC aims to offer blockchains a protocol to enable reliable, secure, and permissionless transfer of packets of data. The protocol is agnostic with respect to the data, paving the way for application developers to develop a range of possible interchain services (fungible and non-fungible token transfers are an obvious candidate, but also arbitrary cross-chain messaging via [interchain accounts](https://interchain-io.medium.com/welcome-to-the-ibc-gang-lets-talk-f469883e0ffe)).

On a high level, this works as follows. A module on a source chain wants to send a packet to a destination chain. It submits a message to the source chain that stores a commitment proof on-chain and logs an event with the packet information. With this information and the proof, you can submit a message to the IBC client on the destination chain, which will verify the proof and (if successful) store a receipt on-chain and have the receiving module execute the required actions according to the packet data. The acknowledgement and timeout functionality has been discussed [previously](./channels.md).

There are two important considerations to make based on this flow. First, on the receiving chain, you need to verify the commitment proof on the source chain. This is why a light client is used to track the state of the counterparty chain (in an efficient way). Again, refer to a previous section to find out more. Second, blockchains cannot directly communicate with one another, so how do the proof and packet data arrive at the destination chain to continue the flow described above?

This is where the relayer operators come into the picture: they ensure the relaying of the packets over network infrastructure. **Relayers have access to full nodes of both source and destination chains, where they can query and submit messages.** They listen in on the chains they service for events that require an IBC packet to be sent. They run relayer software that enables them to rebuild the packet along with the proof and submit this to the destination chain. A similar process then happens upon storing the receipt on the destination chain, causing the acknowledgement message to be sent to the source.

The relayers are a crucial part of the IBC infrastructure. Remember that relaying is permissionless and trustless (the light client verification provides the trust).

## What is needed to relay?

Before moving on to look at specific implmentations of relayer software, understand the general set of requirements or functionality that relayer software needs to have.

1. **Information about the chains:** a relayer will relay packets between a pair of chains, so it requires some information about these chains.
2. **Information about the path:** once you know the chains you are relaying on, the next requirement is to know which path to relay on. Remember, the IBC protocol has three main layers of abstraction: the (light) clients, connections, and channels (and ports).
3. **A private key:** to a relayer operator address on all chains that we want to relay on. Remember that a relayer needs to submit IBC messages to the chains they are relaying between (Receive, Acknowledge, and Timeout), which typically require a fee. Therefore the relayer operator address needs to have funds.
4. **Ability to query and submit messages (or transactions):** as mentioned already, chains do not communicate directly between one another. It is the relayer's job to listen for events related to a packet commitment. They can do this by subscribing to these events via the Tendermint websocket, and query the proofs via the Tendermint RPC endpoint. You also have the ability to query and create through transactions: clients, connections, and channels. There are transactions to update and upgrade light clients, submit notice of misbehaviour, and which allow you to relay packets and acknowledgements or timeouts. For more detail, next you will look at the command lists for the Go and Hermes relayers.

<HighlightBox type="tip">

With the current architecture, relayers use the Tendermint RPC endpoint to query for the commitment proof, as the proofs that are required to submit IBC messages to the counterparty chain (more specifically the light client) for verification are not available via gRPC. Relayer calls can put significant pressure on the RPC endpoints of the nodes, which is one of the main bottlenecks currently in production. Because the Tendermint RPC is single-threaded, large amounts of relayer calls may cause the node to run out of sync, requiring regular resets.

</HighlightBox>

### Configuration file

The information and parameters about the chains, paths, and the name of the relayer private key to sign the messages can generally be found in a configuration file, or *config*. You will look at template configs for the Hermes and Go relayer later, but generally config files are the place to initialize, add, or edit information required for relaying.

### Chain registry

When you have the template for the config file of the relayer software you're using, where can you find the information that it needs? The [chain-registry Github repository](https://github.com/cosmos/chain-registry) provides detailed parmeters about chains and their assets, and recently a schema was added to submit IBC data. This new addition saves you from having to look up path information or canonical channels on [Mintscan](https://www.mintscan.io/cosmos/relayers) or [Map of Zones](https://mapofzones.com/?testnet=false&period=24&tableOrderBy=ibcVolume&tableOrderSort=desc).

The following is an example of the IBC data between Juno and Osmosis:

```json
{
    "$schema": "../ibc_data.schema.json",
    "chain-1": {
        "chain-name": "juno",
        "client-id": "07-tendermint-0",
        "connection-id": "connection-0"
    },
    "chain-2": {
        "chain-name": "osmosis",
        "client-id": "07-tendermint-1457",
        "connection-id": "connection-1142"
    },
    "channels": [
        {
            "chain-1": {
                "channel-id": "channel-0",
                "port-id": "transfer"
            },
            "chain-2": {
                "channel-id": "channel-42",
                "port-id": "transfer"
            },
            "ordering": "unordered",
            "version": "ics20-1",
            "tags": {
                "status": "live",
                "preferred": true,
                "dex": "osmosis"
            }
        }
    ]
}
```

The Go relayer has built-in functionality to fetch chain information (and soon path information) from the chain-registry. Hermes has this functionality on their roadmap. You will look at both relayers in more detail in the next sections.

## FAQ

Cosmos is developing fast, and minor changes can cause big problems for inexperienced users. Luckily you have the option to make direct contact with developers through the [Cosmos Developer Discord](https://discord.com/invite/cosmosnetwork). There you can find the channel **#ibc-relayer** dedicated to relayers in which you can ask for help.

## Next up

You now have a solid understanding of relaying in general. It is time to look a closer look at specific relayers for IBC: the Go and Hermes relayer. Start with the Go relayer in the [next section](./go-relayer.md).
