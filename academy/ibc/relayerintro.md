---
title: "Relaying in General"
order: 
description: 
tag: deep-dive
---

# Relaying in General

![IBC overview](images/ibcoverview.png)

Let’s briefly recap what relaying is and why it is important. IBC aims to offer blockchains a protocol to enable reliable, secure and permissionless transfer of packets of data. The protocol is agnostic with respect to the data, paving the way for application developers to develop a range of possible interchain services (fungible and non-fungible token transfers are an obvious candidate, but also arbitrary cross-chain messaging via [Interchain accounts](https://interchain-io.medium.com/welcome-to-the-ibc-gang-lets-talk-f469883e0ffe)). 

On a high level, the way this works is as follows. A module on a source chain wants to send a packet to a destination chain. It submits a message to the source chain that stores a commitment proof on-chain and logs an event with the packet information. With this information and the proof we can submit a message to the IBC client on the destination chain, who will verify the proof and if successful, store a receipt on-chain and have the receiving module execute the required actions according to the packet data. For simplicity, we will leave out the acknowledgement and timeout functionality here, which has been discussed [before](https://TODO:insert-link-to-previous-section). 

There are two important considerations to make based on this flow. First, on the receiving chain, we need to verify the commitment proof on the source chain. This is why we need a light client to track the state of the counterparty chain (in an efficient way). Again we refer to a previous section to find out more. Second, blockchains cannot directly communicate with one another, so how do the proof and packet data arrive at the destination chain to continue the flow described above? 

This is where the relayer operators come into the picture, they ensure the relaying of the packets over network infrastructure. **Relayers have access to full nodes of both source and destination chains where they can query and submit messages.** They are listening in on the chains they service for events that require an IBC packet to be sent. They run relayer software that enables them to rebuild the packet along with the proof and submit this to the destination chain. A similar process then happens upon storing the receipt on the destination chain, spurring the acknowledgement message to be sent to the source.

We can see that the relayers are a crucial part of the IBC infrastructure.  Remember that relaying is permissionless and trustless (the light client verification provides the trust).

## What is needed to relay?

Before moving on to look at specific implmentations of relayer software, we will first introduce the general set of requirements or functionality relayer software needs to have. 

1. **Information about the chains**. A relayer will relay packets between a pair of chains, so it requires some information about these chains.
2. **Information about the path**. Once we know the chains we are relaying on, the next requirement is to know which path to relay on. Remember, the IBC protocol has three main layers of abstraction, the (light) clients, connections and channels (and ports).
3. **A private key** to an relayar operator address on all chains that we want to relay on. Remember that a relayer needs to submit IBC messages to the chains they are relaying between (Receive, Acknowledge and Timeout), which mostly requires a fee. Therefore the relayer operator address needs to have funds.
4. **Ability to query and submit messages (or transactions)**. As mentioned already, chains do not communicate directly between one another. It is the relayer's job to listen for events related to a packet commitment. They can do this by subscribing to these events via the Tendermint websocket and query the proofs via the Tendermint RPC endpoint. We also have the ability to query and create through transactions: clients, connections, channels. We have transactions to update and upgrade light clients, submit misbehaviour. And of course, we have the transactions that allow to relay packets and acknowledgements or timeouts. For a more detailed look, we will look at the command lists for the Go and Hermes relayers.

<HighlightBox type="tip">

With the current architecture, relayers use the Tendermint RPC endpoint to query for the commitment proof as the proofs that are required to submit IBC messages to the counterparty chain (more specifically the light client) for verification are not available via gRPC. Relayer calls can put significant pressure on the RPC endpoints of the nodes, which is one of the main bottlenecks currently in production. Because the Tendermint RPC is single-threaded, large amounts of relayer calls may cause the node to run out of sync, requiring regular resets.

</HighlightBox>

### Configuration file
The information and parameters about the chains, paths and the name of the relayer private key to sign the messages, can generally be found in a configuration file, or *config*. We will look at template configs for the Hermes and Go relayer later, but generally config files are the place to initialize, add or edit information required for relaying.

### Chain registry
When you have the template for the config file of the relayer software you're using, where can you find the information that it needs? This is where the [chain-registry Github repo](https://github.com/cosmos/chain-registry) comes to the rescue. In there you will find detailed parmeters about chains, their assets and as of recently, a schema was added to submit IBC data. This new addition saves you from having to look up path information or canonical channels on [Mintscan](https://www.mintscan.io/cosmos/relayers) or [Map of Zones](https://mapofzones.com/?testnet=false&period=24&tableOrderBy=ibcVolume&tableOrderSort=desc).

An example of the IBC data between Juno and Osmosis:

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
The Go relayer has built-in functionality to fetch chain information and soon path information from the chain-registry. Hermes has this functionality on their roadmap. We'll be looking at both relayers in more detail in the next sections.


# FAQ

Cosmos is developing fast and minor changes can cause big problems for unexprienced users. Luckily you have the option to get in direct contact with developers through the [Cosmos Developer Discord](https://discord.com/invite/cosmosnetwork). There you can find a channel dedicated to relayers and called **#ibc-relayer** in which you can ask for help.
