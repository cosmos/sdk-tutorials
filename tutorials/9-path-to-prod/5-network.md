---
title: Prepare and Connect to Other Nodes
order: 6
description: Be part of a larger network
tags:
  - guided-coding
  - cosmos-sdk
  - dev-ops
---

# Prepare and Connect to Other Nodes

With the genesis created and received, a node operator needs to join the eventual network. In practice this means two things:

1. To open your node to connections from other nodes.
2. To know where the other nodes are, or at least a subset of them, so that your node can attempt to connect to them.

In this section, you concern yourself with Tendermint and the peer-to-peer network. Other niceties like incorporating gRPC and REST into your Cosmos application are different concerns.

## Set up 

As a node operator, from the time of genesis or at any time in the future, and on each machine, you first run an `init` command to at least set up the folders and pick an ASCII-only moniker:

```sh
$ ./myprojectd init stone-age-1
```

Overwrite the genesis created with the actual agreed one. While you are doing so, you can make it read-only:

```sh
$ curl http://example.com/genesis.json -o ~/.myprojectd/config/genesis.json
$ chmod a-wx ~/.myprojectd/config/genesis.json
```

The `init` command has also created a number of configuration files:

```sh
$ ls ~/.myprojectd/config
```

This should return:

```txt
addrbook.json
app.toml                <-- configuration for the app part of your blockchain
client.toml             <-- configuration for the CLI client of the app
config.toml             <-- configuration for Tendermint
genesis.json            <-- the genesis for your blockchain
gentx                   <-- folder that contains the genesis transactions before they are inserted
node_key.json           <-- private key that uniquely identifies your node on the network
priv_validator_key.json
```

## Open your node

In the [`config.toml` file](https://docs.tendermint.com/v0.34/tendermint-core/using-tendermint.html#configuration) you can configure the open ports. The important piece is your **listen address**:

```toml
[p2p]

# Address to listen for incoming connections
laddr = "tcp://0.0.0.0:26656"
```

Here it listens on port `26656` of all IP addresses. Define or find out your publicly accessible IP address, for instance `172.217.22.14`. If you use a DNS-resolvable name, like `lascaux.myproject.example.com`, you can use that as well instead of the IP address. 

Keep in mind that a name is subject to the DNS being well configured and working well. Add this too so that, whenever your node contacts a new node, yours can tell the other node which address is preferred:

```toml
external_address = "172.217.22.14:26656" # replace by your own
```

The other piece of information that uniquely identifies your node is your **node ID**. Its private key is stored in `~/.myprojectd/config/node_key.json`. The public ID is that by which your peers will know your node. You can compute the public ID with the Tendermint command:

```sh
$ ./myprojectd tendermint show-node-id
```

This should return something like:

```txt
ce1c54ea7a2c50b4b9f2f869faf8fa4d1a1cf43a
```

If you lose `node_key.json` or have it stolen, it is not as serious as if you lost your token's private key. Your node can always recreate a new one and let your peers know about the new ID, with no problems. The file location is mentioned in `config.toml` on the line `node_key_file = "config/node_key.json"`.

The node key also exists so that your own node can identify itself, in the event that it tried to connect to itself via a circuitous peer-to-peer route and therefore ought to cut the useless connection.

In short, here is the information you need to share with other early participants in the network:

* Listen address, for instance: `"tcp://172.217.22.14:26656"`.
* Node ID, for instance: `ce1c54ea7a2c50b4b9f2f869faf8fa4d1a1cf43a`.

The shorthand for this information is written and exchanged in the format _node-id@listen-address_, like this:

```txt
ce1c54ea7a2c50b4b9f2f869faf8fa4d1a1cf43a@172.217.22.14:26656
```

If you create a node for a network that is already running you need to follow these same steps, but you do not need to inform others of your parameters, because when you connect your node will do this anyway.

<HighlightBox type="note">

As a side note, your computer or local network may not allow other nodes to initiate a connection to your node on port `26656`. Therefore, it is a good idea to open this port in the firewall(s).

</HighlightBox>

## Connection to others

You have collected your node's information, and have shared it with the early network participants. In return you received theirs. You can put this information in `config.toml`, separated by commas:

```toml
persistent_peers = "432d816d0a1648c5bc3f060bd28dea6ff13cb413@216.58.206.174:26656,
5735836cbaa747e013e47b11839db2c2990b918a@121.37.49.12:26656"
```

If one of the operators informs you that their node behaves as a seed node, then you add it under:

```toml
seeds = "432d816d0a1648c5bc3f060bd28dea6ff13cb413@216.58.206.174:26656"
```

You can also take this opportunity to document the list of peers on your _production_ repository (the same that hosts the genesis file). Only list the addresses that are meant to be public, to mitigate the risks of DoS attacks.

<HighlightBox type="note">

You are not obliged to put all the known peers in your `persistent_peers`. You may well choose to put there only those you trust.

</HighlightBox>

## Further network configuration

Setting up your node and identifying other peers is important. However, this is not the only network configuration available. Look into `~/.myprojectd/config/config.toml` for tweaks.

If you change the parameters in this file, you are not going to affect the ability of the network to reach consensus on blocks. Parameters that are necessary for consensus are all in the genesis file.

[Parameters in `config.toml`](https://docs.tendermint.com/v0.34/tendermint-core/configuration.html) can be divided into two broad categories:

1. **Network scoped:** by changing these, you change the posture of your node at the risk of disrupting the ability of other nodes to communicate with yours. Examples include `max_num_inbound_peers` and `handshake_timeout`.
2. **Single node scoped:** these only matter to your node. Examples include `db_backend` and `log_level`.

Among the network-scoped parameters, some deal with the intricacies of BFT, such as `timeout_prevote` and `timeout_precommit_delta`. If you want to tweak them away from their defaults, you can search for more information. [Here](https://forum.cosmos.network/t/consensus-timeouts-explained/1421) is as good a place to start as any other.

Tangential to these parameters, you can find others in `~/.myprojectd/config/app.toml` that also relate to the network. For instance `minimum-gas-prices`, which you could set at `1nstone` for instance.

To avoid surprises when looking at the configuration, keep in mind your Tendermint version:

```sh
$ ./myprojectd tendermint version
```

This returns something like:

```txt
ABCI: 0.17.0
BlockProtocol: 11
P2PProtocol: 8
Tendermint: v0.34.20-rc1 <-- The part that should inform you about the content of config.toml
```

## DDoS

Being part of a network with a known IP address can be a security or service risk. Distributed denial-of-service (DDoS) is a classic kind of network attack, but there are ways to mitigate the risks.

First, be aware that regular nodes and validator nodes face different risks:

1. If your regular node is DoS'd, you are at risk of dropping out of the network, and preventing you or your customers from calling an RPC endpoint for network activity.
2. If your validator node is DoS'd, you are at risk of consensus penalties.

It is common practice to expose your regular nodes and to hide your validator nodes. The latter hide behind a [_sentry_ node](https://hub.cosmos.network/main/validators/security.html#sentry-nodes-ddos-protection), such that:

1. Your [sentry nodes](https://forum.cosmos.network/t/sentry-node-architecture-overview/454) are located in a cloud infrastructure, where the database (or filesystem) and the software part of the node are separated. With this, the same sentry node can release its old public IP address and receive a new one within a few seconds; or a new sentry node can spring up at a different IP address by using the same database (or filesystem), as in a game of whack-a-mole.
2. Your validator nodes are located anywhere, with persistent addresses, but connect only to the sentry nodes, with the use of `persistent_peers` in `config.toml`. The content of this field has to change when a sentry node has been whacked unless the validator node can connect to the sentry node over the same private IP address.
3. Your sentry nodes never gossip your validators' addresses over the peer-to-peer network, thanks to the use of `private_peer_ids` in `config.toml`.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to make your node accessible to connections from other nodes.
* How to locate some subset of other nodes in order to make a connection to them.
* The use of a publicly accessible IP address or DNS-resolvable name, along with the public half of your public-private node key, to uniquely identify your node to others.
* How the node key can also prevent inadvertent attempts by the node to connect to itself via an unforeseen peer-to-peer route.
* The option of further configuring your network via **network scoped** and **single node scoped** parameters.
* How to mitigate the risks of distributed denial-of-service (DDoS) attacks through the use of sentry nodes.

</HighlightBox>
