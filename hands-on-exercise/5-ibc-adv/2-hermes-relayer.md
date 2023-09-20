---
title: "Hermes Relayer"
order: 2
description: Relayer implementation in Rust
tags:
  - guided-coding
  - ibc
  - dev-ops
---

# Hermes Relayer

<HighlightBox type="prerequisite">

Before you dive into Go relayers, make sure to:

* Install Go.
* Install Docker.
* Install Rust.

For all installations, please see the [setup page](/tutorials/2-setup/index.md).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will learn:

* How to get started with the Hermes relayer.
* Basic Hermes relayer commands.

</HighlightBox>

[Hermes](https://hermes.informal.systems/) is an open-source Rust implementation of a relayer for the Inter-Blockchain Communication Protocol (IBC). Hermes is most widely used in production by relayer operators. It offers great logging and debugging options, but compared to the Go relayer may require some more detailed knowledge of IBC to use properly.

<HighlightBox type="docs">

Installation instructions can be found [in the Hermes documentation from Informal Systems](https://hermes.informal.systems/quick-start/installation.html). Check the CLI commands with `hermes -h`. Alternatively, check out the [commands reference](https://hermes.informal.systems/documentation/commands/index.html) on the Hermes website.
<br/><br/>
Recently the Hermes relayer upgraded the major version to v1. This is the first stable release and contains loads of improvements which you can check out in the [changelog](https://github.com/informalsystems/ibc-rs/blob/master/CHANGELOG.md#v100). It is recommended to use v1 or higher from this point forward, and the commands below assume you are using v1.x.y.

</HighlightBox>

If you type:

```sh
$ hermes help
```

You get:

```txt
hermes <version>
Informal Systems <hello@informal.systems>
  Hermes is an IBC Relayer written in Rust

USAGE:
    hermes [OPTIONS] [SUBCOMMAND]

OPTIONS:
    -c, --config <CONFIG>    path to configuration file
    -h, --help               Print help information
    -j, --json               enable JSON output
    -V, --version            Print version information

SUBCOMMANDS:
    clear           Clear objects, such as outstanding packets on a channel
    config          Validate Hermes configuration file
    create          Create objects (client, connection, or channel) on chains
    health-check    Performs a health check of all chains in the config
    help            Print this message or the help of the given subcommand(s)
    keys            Manage keys in the relayer for each chain
    listen          Listen to and display IBC events emitted by a chain
    misbehaviour    Listen to client update IBC events and handles misbehaviour
    query           Query objects from the chain
    start           Start the relayer in multi-chain mode
    tx              Create and send IBC transactions
    update          Update objects (clients) on chains
    upgrade         Upgrade objects (clients) after chain upgrade
    completions     Generate auto-complete scripts for different shells
```

When comparing the list of commands with the requirements from the introduction, recognize the ability to query and submit a transaction (tx), keys management, and a config command. However, no immediate commands are available to add chains and path information. The Hermes relayer does not support fetching data from the [chain-registry](https://github.com/cosmos/chain-registry) automatically yet, but this is on the roadmap.

For now, you need to manually add the data to the config file `config.toml`, which is by default stored at `$HOME/.hermes/config.toml`.

<HighlightBox type="note">

The config is not added automatically. The first time you run Hermes, you will have to copy a template and paste it into the aforementioned folder.

</HighlightBox>

See the [config info](https://hermes.informal.systems/documentation/configuration/configure-hermes.html) and [a sample configuration](https://hermes.informal.systems/documentation/configuration/description.html) for a detailed explanation on all aspects of the config. Take a closer look at the `[[chains]]` section:

```toml
[[chains]]
id = 'ibc-1'
rpc_addr = 'http://127.0.0.1:26557'
grpc_addr = 'http://127.0.0.1:9091'
websocket_addr = 'ws://127.0.0.1:26557/websocket'
rpc_timeout = '10s'
account_prefix = 'cosmos'
key_name = 'testkey'
store_prefix = 'ibc'
default_gas = 100000
max_gas = 400000
gas_price = { price = 0.001, denom = 'stake' }
gas_multiplier = 1.1
max_msg_num = 30
max_tx_size = 2097152
clock_drift = '5s'
max_block_time = '30s'
trusting_period = '14days'
trust_threshold = { numerator = '1', denominator = '3' }
address_type = { derivation = 'cosmos' }
```

Pay particular attention to the `RPC`, `gRPC`, and `websocket` endpoints and make sure they correspond with the node you are running. Remember that it is recommended to run your own full node instead of using publicly available endpoints when relaying outside of testing purposes. Also, make sure the `key_name` corresponds to the funded address from which you intend to pay relayer fees. The other parameters can be found in the [chain-registry](https://github.com/cosmos/chain-registry) for deployed chains or set by yourself when creating a new chain (either in production or for testing).

<HighlightBox type="note">

Hermes does not require path information in the config. By default, it will relay over all possible paths over all channels that are active on the configured chains. However, it is possible to change this by filtering. Add the following to the chain config:

```toml
[chains.packet_filter]
policy = 'allow'
list = [
   ['transfer', 'channel-141'], # osmosis-1
]
```

This filters only the `transfer` channel for the Hub to Osmosis in this example.

</HighlightBox>

### Hermes start

When the chains have been configured, you can start the relayer with the start command:

```sh
$ hermes start
```

This powerful command bundles a lot of functionality where Hermes will be listening for events signaling IBC packet send requests, submitting `ReceivePacket` and `AcknowledgePacket` messages, and periodically checking if the clients on serviced chains need updating. However, during the tutorials, it makes sense to look at the commands in a more granular way to understand what is going on.

<HighlightBox type="note">

When starting the Hermes relayer, it will assume that the channels you wish to relay over are set up. This will be the case if you want to start relaying on an existing _canonical_ channel, meaning the official and agreed-upon channel (for example, used for fungible token transfers).
<br/><br/>
This is perfectly possible and the right approach, given that creating a new channel would make assets relayed over it non-fungible with assets relayed over the canonical channel. Most tutorials will create new channels (and possibly clients and connections) as this provides more insight into the software. However, it is **important to note that you only need to create new channels if no canonical channel is present** (for example, for a newly deployed chain).

</HighlightBox>

## Testing locally

The Hermes documentation provides a [guided tutorial](https://hermes.informal.systems/tutorials/local-chains/index.html) to start relaying between two local `gaia` chains. Furthermore, demos are available that spin up a Hermes relayer between two [Ignite CLI](https://docs.ignite.com/) chains, like [this one](https://github.com/informalsystems/hermes-hackatom-demo). Be sure to check those out.

Here you will use a `docker-compose` network with two local `checkers` chains and a relayer between them.

<HighlightBox type="note">

The example presented is based on the demo in the [b9lab/cosmos-ibc-docker](https://github.com/b9lab/cosmos-ibc-docker/tree/main/tokentransfer) repository.

</HighlightBox>

Start by cloning the repository:

```sh
$ git clone https://github.com/b9lab/cosmos-ibc-docker.git
```

Then build the **images for the checkers blockchain** if you did not already do so in the [Go Relayer](./1-go-relayer.md) section:

```sh
$ cd cosmos-ibc-docker/tokentransfer/checkers
$ ./build-images.sh
```

You can build the relayer image manually, or just start the network via `docker-compose` and let it build the missing image for the `hermes` relayer:

```sh
$ cd cosmos-ibc-docker/tokentransfer
$ docker-compose -f tokentransfer.yml --profile hermes up
```

Observe the output of `docker-compose` until the chains are ready - the chains will take some time.

When the chains are ready, go into the relayer container and run a bash:

```sh
$ docker exec -it relayer bash
```

First, check the Hermes version with:

```sh
$ hermes version
```

<HighlightBox type="note">

In this section, you have to run commands both inside the Docker container and on your local terminal. By default, coding examples will indicate the Docker terminal; a comment will inform you when you have to use the local terminal.

</HighlightBox>

<HighlightBox type="remember">

You can check the CLI commands with `hermes -h`. The Hermes CLI offers help for each CLI command you can use when trying `hermes <command> -h`.

</HighlightBox>

You can find the configuration in `cosmos-ibc-docker/tokentransfer/relayer_hermes/config.toml`.

<HighlightBox type="note">

You will see two `[[chains]]` sections in the `config.toml`. The first one includes comments about configuration.
<br/><br/>
Chain IDs need to be specified, as well as the RPC, GRPC, and WebSocket addresses.

</HighlightBox>

Do a validation check on the configuration file:

```sh
$ hermes config validate
```

Next, do a health check:

```sh
$ hermes health-check
```

You should see that both chains are healthy. The demo includes a script to start the relayer, but do the steps manually to practice a bit.

### Manual testing - setting up relayer keys

You need some keys to sign a transaction. Populate the aliases:

```sh
$ hermes keys add --chain checkersa --mnemonic-file "alice.json"
$ hermes keys add --chain checkersb --mnemonic-file "bob.json"
```

Get the user addresses for the **checkersa** chain:

```sh
$ hermes keys list --chain checkersa
```

Now get the user addresses for the **checkersb** chain:

```sh
$ hermes keys list --chain checkersb
```

In the `config.toml` the default user key is set to `alice` for `checkersa` and `bob` for `checkersb`, so you do not need to specify a user if you want to sign a transaction with those.

Now check the balance of those accounts in another terminal:

```sh
# use your local terminal
$ docker exec checkersa checkersd query bank balances cosmos14y0kdvznkssdtal2r60a8us266n0mm97r2xju8
$ docker exec checkersb checkersd query bank balances cosmos173czeq76k0lh0m6zcz72yu6zj8c6d0tf294w5k
```

### Manual testing - create a channel

It is time to create a channel in order to send some tokens from `checkersa` to `checkersb`. In the relayer container, run:

```sh
$ hermes create channel --a-chain checkersa --b-chain checkersb --a-port transfer --b-port transfer --new-client-connection
```

To query the clients for the chain **checkersa**, run:

```sh
$ hermes query clients --host-chain checkersa
```

There should be one CometBFT client for the chain **checkersb**.

Query the connections for **checkersa**:

```sh
$ hermes query connections --chain checkersa
```

There should be one connection established between **checkersa** and **checkersb**.

Query the channels for **checkersa**:

```sh
$ hermes query channels --chain checkersa
```

You should see one channel and the port binding transfer. All this is part of the `create channel` command. It will create a client, a connection, and a channel as well as a binding to a port. You can redo some steps to better understand the CLI.

Create another connection for both chains:

```sh
$ hermes create connection --a-chain checkersa --b-chain checkersb
```

In the output of this command, you receive the `connection_id`s for both chains. Use the `connection_id` for the **checkersa** chain and create a channel:

```sh
$ hermes create channel --a-port transfer --b-port transfer --a-chain checkersa --a-connection connection-1
```

This repeats the port binding `transfer`. Check that the channel is created again with:

```sh
$ hermes query channels --chain checkersa
```

### Manual testing - send an IBC transfer

Next up, send an IBC transfer using the second channel that was created:

```sh
$ hermes tx ft-transfer --src-chain checkersa --dst-chain checkersb --src-port transfer --src-channel channel-1 --amount 100 --denom token --timeout-height-offset 1000
```

In case you do not want to test with the default user, you can specify the sender with a `-k` flag and the receiver on the other chain with a `-r` flag.

<HighlightBox type="note">

Usually, the Hermes relayer automatically relays packets between the chains if it runs via:

```sh
$ hermes start
```

In this case, you want to relay the transfer transaction by hand.

</HighlightBox>

First, query packet commitments on **checkersa**:

```sh
$ hermes query packet commitments --chain checkersa --port transfer --channel channel-1
```

You can see that there is one packet:

```txt
SUCCESS PacketSeqs {
    height: Height {
        revision: 0,
        height: 2382,
    },
    seqs: [
        Sequence(
            1,
        ),
    ],
}
```

You can also query for unreceived packets:

```sh
$ hermes query packet pending --chain checkersb --port transfer --channel channel-1
```

The output should be similar to:

```txt
SUCCESS Summary {
    src: PendingPackets {
        unreceived_packets: [],
        unreceived_acks: [],
    },
    dst: PendingPackets {
        unreceived_packets: [
            Sequence(
                1,
            ),
        ],
        unreceived_acks: [],
    },
}
```

There you can observe an unreceived packet.

<HighlightBox type="note">

You can get the `connection_id` and `channel_id` for **checkersb** in the output of the `hermes create connection` and `hermes create channel` commands.

</HighlightBox>

If you check the balances again, you should only see a change for **checkersa**. You should see no change in the balance of `bob` on **checkersb** because the transfer is initiated but it is not relayed yet.

Now submit the `RecvPacket` message to **checkersb**:

```sh
$ hermes tx packet-recv --dst-chain checkersb --src-chain checkersa --src-port transfer --src-channel channel-1
```

In case of success, you will see an output like:

```txt
SUCCESS [
    SendPacket(
        SendPacket - seq:1, path:channel-1/transfer->channel-1/transfer, toh:0-3368, tos:Timestamp(NoTimestamp)),
    ),
]
```

Send an acknowledgement to **checkersa**:

```sh
$ hermes tx packet-ack --dst-chain checkersa --src-chain checkersb --src-port transfer --src-channel channel-1
```

Check the balances again. A new denom should appear because of the recent transfer. As an exercise, transfer the tokens back to **checkersa**.

If you are finished with the tests, make sure to shut down your network with:

```sh
$ docker-compose -f tokentransfer.yml --profile hermes down
```

<HighlightBox type="synopsis">

To summarize, this section has explored:

* Hermes, an open-source Rust implementation of an IBC relayer, which is widely used in production by relayer operators due to its great logging and debugging options, but may require more detailed knowledge of IBC for effective use.
* How to install and configure Hermes, and then perform automated and manual end-to-end testing of Docker containers for two-chain instances and a relayer instance.

</HighlightBox>

<!--## Next up

With this introduction to the Hermes relayer, you are all set for relaying. In the [next section](/academy/3-ibc/7-ibc-tooling.md), you can find an overview of helpful tools for IBC.-->
