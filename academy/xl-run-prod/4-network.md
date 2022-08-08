---
title: Prepare and connect to other nodes
order: 4
description: Be part of a larger network
tag: deep-dive
---

# Prepare and connect to other nodes

With the genesis created and received, a node operator needs to join the eventual network. In practice this means two things:

1. To open your node to connections from other.
2. To know where are the other nodes, or at least a subset of them so that your node can attempt to connect to them.

In this section, you concern yourself with Tendermint and the peer-to-peer network. Other niceties like gRPC and REST into your Cosmos application are different concerns.

## Set up 

As a node operator, from the time of genesis or at any time in the future, and on each machine, you first run an `init` command to at least set up the folders and pick an ASCII-only moniker:

```sh
$ ./myprojectd init lascaux
```

Overwrite the genesis created again with the real agreed one. While you are at it, you can make it read-only:

```sh
$ curl http://example.com/genesis.json -o ~/.myprojectd/config/genesis.json
$ chmod a-wx ~/.myprojectd/config/genesis.json
```

The `init` command has also created a number of configuration files:

```sh
$ ls ~/.myprojectd/config
```

Should return:

```txt
addrbook.json
app.toml
client.toml
config.toml <-- configuration for Tendermint
genesis.json
gentx
node_key.json
priv_validator_key.json
```

## Open your node

In the [`config.toml` file](https://docs.tendermint.com/master/nodes/configuration.html), you can configure the open ports. The important piece is:

```toml
# Address to listen for incoming connections
laddr = "tcp://0.0.0.0:26656"
```

Here it listens on port `26656` of all IP addresses. Define or find out your publicly accessible IP address, for instance `74.6.231.20`.

If you use a DNS-resolvable name like `lascaux.myproject.example.com`, you can use that as well instead of the IP address. Keep in mind that a name is subject to the DNS being well configured and working well.

Add it too so that, whenever your node contacts a new node, yours can tell it which address is preferred:

```toml
external_address = "74.6.231.20:26656"
```

The other piece of information that uniquely identifies your node is your node key. Its private key is stored in `~/.myprojectd/config/node_key.json`. The public key is that by which your peers will know your node. You can compute the public key with the Tendermint command:

```sh
$ ./myprojectd tendermint show-node-id
```

This should return something like:

```txt
ce1c54ea7a2c50b4b9f2f869faf8fa4d1a1cf43a
```

If you lose `node_key.json`, or have it stolen, it is not as serious as if you lost your token's private key. Your node can always recreate it and let your peers know about the new key, no hard feelings. Its location is mentioned in `config.toml` on the line `node_key_file = "config/node_key.json"`.

The node key also exists so that your own node can identify itself if it tried to connect to itself via a circuitous peer-to-peer route, and therefore ought to cut the useless connection.

In short here is the information you need to share with other early participants in the network:

* Listen address, for instance: `"tcp://74.6.231.20:26656"`.
* Node key, for instance: `ce1c54ea7a2c50b4b9f2f869faf8fa4d1a1cf43a`.

The shorthand for this information is written and exchanged as such:

```txt
ce1c54ea7a2c50b4b9f2f869faf8fa4d1a1cf43a@74.6.231.20:26656
```

If you create a node for a network that is already running, you need to do the same above steps but you do not need to inform others of your parameters, because when you connect, your node will do anyway.

As a side-note, your computer or local network may not allow other nodes to initiate a connection to your node on port `26656`. So it is a good idea to open this port in the firewall(s).

## Connection to others

You collected your node's information. You shared it with the early network participants. In return you got theirs. You can put those in `config.toml` separated by commas:

```toml
persistent_peers = "432d816d0a1648c5bc3f060bd28dea6ff13cb413@216.58.206.174:26656,
5735836cbaa747e013e47b11839db2c2990b918a@121.37.49.12:26656"
```

If one of the operators informs you that they node behaves as a seed node, then you add it under:

<CodeGroup>

<CodeGroupItem title="Up to v0.34" active>

```toml
seeds = "432d816d0a1648c5bc3f060bd28dea6ff13cb413@216.58.206.174:26656"
```

</CodeGroupItem>

<CodeGroupItem title="From v0.35">

```toml
bootstrap_peers = "432d816d0a1648c5bc3f060bd28dea6ff13cb413@216.58.206.174:26656"
```

</CodeGroupItem>

</CodeGroup>

You can also take this opportunity to document the list of peers on your _production_ repository (the same that hosts the genesis file).

Note that you are not obliged to put all the known peers in your `persistent_peers`. You may well choose to put them only those you trust.

## Further network configuration

Setting up your peer and identifying other peers is important. However this is not the only network configuration available. Look into `~/.myprojectd/config/config.toml` for tweaks.

If you change parameters in this file, you are not going to affect the ability of the network to reach consensus on blocks. Parameters that are necessary for consensus are all in the genesis file.

[Parameters in `config.toml`](https://docs.tendermint.com/master/nodes/configuration.html) can be divided into two broad categories:

1. Network scoped. By changing them you change the posture of your node at the risk of disrupting the ability of other nodes to communicate with yours. Examples include `max_num_inbound_peers` (up to v0.34), `max_connections` (from v0.35), and `handshake_timeout`.
2. Single node scoped. Which only matter to your node. Examples include `db_backend` and `log_level`.

Among the network-scoped ones, a number of them, such as `timeout_prevote` and `timeout_precommit_delta`, deal with the intricacies of BFT. If you want to tweak them away from their defaults, you can search for more information. [Here](https://forum.cosmos.network/t/consensus-timeouts-explained/1421) is as good a start as another.

Tangent to these parameters, you can find others in `~/.myprojectd/config/app.toml` that also relate to the network. For instance `minimum-gas-prices`, which you could set at `1nstone` for instance.

Also to avoid surprises when looking at the configuration, keep in mind your Tendermint version:

```sh
$ ./myprojectd tendermint version
```

Which returns something like:

```txt
ABCI: 0.17.0
BlockProtocol: 11
P2PProtocol: 8
Tendermint: v0.34.20-rc1 <-- The part that should inform you about the content of config.toml
```

## DDoS

Being part of a network, with a known IP address can be a security or service risk. Distributed denial-of-service (DDoS) is a classic kind. There are ways to mitigate the risks. First note that regular nodes and validator nodes are different:

1. If your regular node is DoS'd, you are at risk of dropping out of the network, and preventing you or your customers from calling an RPC end point for network activity.
2. If your validator node is DoS'd, you are at risk of consensus penalties.

It is common practice to expose your regular nodes, and to hide your validator ones. Your validator nodes hide behind a [_sentry_ node](https://hub.cosmos.network/main/validators/security.html#sentry-nodes-ddos-protection) such that:

1. Your sentry nodes are located in a cloud infrastructure, where the database (or filesystem) and the software part of the node are separated. With this the same sentry node can release its old IP address and receive a new one within a few seconds. Or a new sentry node can be sprung up at a different IP address by using the same database (or fileystem), as in a game of whack-a-mole.
2. Your validator nodes are located anywhere, with persistent addresses, but connect only to the sentry nodes, with the use of `persistent_peers` in `config.toml`. The content of this field has to change when a sentry node has been whacked, unless the validator node can connect to the sentry node over the same private IP address.
3. Your sentry nodes never gossip your validators addresses over the peer-to-peer network, with the use of `private_peer_ids` in `config.toml`.
