---
title: "Hermes Relayer"
order: 10
description: Relayer implementation in Rust
tag: deep-dive
---

# Hermes Relayer

<HighlightBox type="prerequisite">

Before you dive into Go relayers, make sure to:

* Install Go.
* Install Docker.
* Install Rust.

For all installations, please see the [setup page](../3-my-own-chain/setup.md).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will learn:

* How to get started with the Hermes relayer
* Basic Hermes relayer commands

</HighlightBox>

[Hermes](https://hermes.informal.systems/) is a an open-source Rust implementation of a relayer for the Inter-Blockchain Communication Protocol (IBC). Hermes is most widely used in production by relayer operators. It offers great logging and debugging options, but compared to the Go relayer may require some more detailed knowledge of IBC to use it properly.

<HighlightBox type="docs">

Installation instructions can be found [in the Hermes documentation from Informal Systems](https://hermes.informal.systems/installation.html). Check the CLI commands with `hermes -h`. Alternatively, check out the [commands reference](https://hermes.informal.systems/commands/index.html) on the Hermes website.

</HighlightBox>

If you type:

```sh
$ hermes help
```

You get:

```
hermes 0.14.0+460eb0c
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
    health-check    Performs a health check of all chains in the the config
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

The config is not added automatically. The first time you run Hermes, you will have to copy a template and paste it in the aforementioned folder.

</HighlightBox>

See the [config info](https://hermes.informal.systems/config.html) and the [a sample configuration](https://hermes.informal.systems/example-config.html) for a detailed explanation on all aspects of the config. We will take a closer look at the `[[chains]]` section:

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
gas_adjustment = 0.1
max_msg_num = 30
max_tx_size = 2097152
clock_drift = '5s'
max_block_time = '30s'
trusting_period = '14days'
trust_threshold = { numerator = '1', denominator = '3' }
address_type = { derivation = 'cosmos' }
```

Pay particular attention to the `RPC`, `gRPC`, and `websocket` endpoints and make sure they correspond with the node you are running. Remember that it is recommended to run your own full node instead of using publicly available endpoints when relaying outside of testing purposes. Also make sure the `key_name` corresponds to the funded address from which you intend to pay relayer fees. The other parameters can be found in the [chain-registry](https://github.com/cosmos/chain-registry) for deployed chains, or set by yourself when creating a new chain (either in production or for testing).

<HighlightBox type="note">

Hermes does not require path information in the config. By default it will relay over all possible paths over all channels that are active on the configured chains. However, it is possible to change this by filtering. Add the following to the chain config:

```toml
[chains.packet_filter]
policy = 'allow'
list = [
   ['transfer', 'channel-141'], # osmosis-1
]
```

This filters only the `transfer` channel for the Hub to Osmosis in this example.

</HighlightBox>

### Hermes Start

When the chains have been configured, you can start the relayer with the start command:

```sh
$ hermes start
```

This powerful command bundles a lot of functionality where Hermes will be listening or events signaling IBC packet send requests, submitting `ReceivePacket` and `AcknowledgePacket` messages, and periodically checking if the clients on serviced chains need updating. However, during the tutorials it makes sense to look at the commands in a more granular way to understand what is going on.

<HighlightBox type="note">

When starting the Hermes relayer, it will assume that the channels you wish to relay over are set up. This will be the case if you want to start relaying on an existing *canonical* channel, meaning the offical and agreed-upon channel (for example, used for fungible token transfers).
<br></br>
This is perfectly possible and the right approach, given that creating a new channel would make assets relayed over it non-fungible with assets relayed over the canonical channel. Most tutorials will create new channels (and possibly clients and connections) as this provides more insight into the software. However, it is **important to note that you only need to create new channels if no canonical channel is present** (for example, for a newly deployed chain).

</HighlightBox>

## E2E Testing

The Hermes documentation provides a [guided tutorial](https://hermes.informal.systems/tutorials/local-chains/index.html) to start relaying between two local `gaia` chains. Furthermore, demos are available that spin up a Hermes relayer between two [Ignite CLI](https://docs.ignite.com/) chains, like [this one](https://github.com/informalsystems/hermes-hackatom-demo). Be sure to check those out.

Here you will take a somewhat different approach, and set up a flow for end-to-end (E2E) testing where you set up Docker containers for 2 chain instances and a relayer instance. You will refer to the automated testing file and also do some manual testing on the Docker images.

### Installation & Building Docker Images

Clone the [Hermes repository](https://github.com/informalsystems/ibc-rs) in a new folder. It contains a folder for [end-to-end (E2E) testing](https://github.com/informalsystems/ibc-rs/tree/master/ci). This helps you deploy two chains and test the relayer. It also contains a Docker Compose file, which spins up two blockchain nodes and a relayer.

<HighlightBox type="info">

Make sure that you have installed [Docker Compose](https://docs.docker.com/compose/install/) and [Docker](https://docs.docker.com/get-docker/) before continuing.

</HighlightBox>

The test needs you to build the Docker images from the Docker files. The Docker images run a Linux on **x86_64**. You can build Hermes with [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) from the repository for the target `x86_64-unknown-linux-gnu`, or you can [download](https://github.com/informalsystems/ibc-rs/releases) a release version into the repository folder (make sure the binary is present in the repository folder).

After you clone the repository and download a release version of Hermes for **x86_64**, go into the folder and run:

```sh
$ docker-compose -f ci/docker-compose-gaia-current.yml build relayer
```

This builds the relayer docker image. Start the Docker Compose network with two chains and a relayer:

```sh
$ docker-compose -f ci/docker-compose-gaia-current.yml up -d ibc-0 ibc-1 relayer
```

Check that everything is working as expected:

```sh
$ docker exec relayer /bin/sh -c /relayer/e2e.sh
```

The [`e2e.sh`](https://github.com/informalsystems/ibc-rs/blob/master/ci/e2e.sh) uses [`run.py`](https://github.com/informalsystems/ibc-rs/blob/master/e2e/run.py) to automatically run a couple of tests.

### Hermes CLI Manual Testing

Go into the relayer container and run a bash:

```sh
$ docker exec -it relayer bash
```

First, check the Hermes version with:

```sh
$ hermes version
```

Which returns:

```
hermes 0.14.0+460eb0c
```

<HighlightBox type="note">

In this section you have to run commands both inside the Docker container and on your local terminal. By default, coding examples will indicate the Docker terminal; a comment will inform you when you have to use the local terminal.

</HighlightBox>

<HighlightBox type="remember">

You can check the CLI commands with `hermes -h`. The Hermes CLI offers help for each CLI command you can use when trying `hermes <command> -h`.

</HighlightBox>

Check the default configuration:

```sh
$ cat simple_config.toml
```

In the `[[chains]]` section of the `simple_config.toml`, you can find the configuration for two chains, **ibc-0** and **ibc-1**. In it, the chain IDs need to be specified, as well as the RPC, GRPC, and WebSocket addresses.

Do a validation check on the configuration file:

```sh
$ hermes -c simple_config.toml config validate
```

Next do a health check:

```sh
$ hermes -c simple_config.toml health-check
```

You should see that both chains are healthy. The E2E test will create clients, connections, and a channel.

To query the clients for the chain **ibc-0**, run:

```sh
$ hermes -c simple_config.toml query clients ibc-0
```

There should be one Tendermint client for the chain **ibc-1**.

Query the connections for **ibc-0**:

```sh
$ hermes -c simple_config.toml query connections ibc-0
```

There should be two connections, both established between **ibc-0** and **ibc-1**.

Query the channels for **ibc-0**:

```sh
$ hermes -c simple_config.toml query channels ibc-0
```

You should see two channels and the port binding transfer. All this is part of the E2E testing. You can redo some steps to better understand the CLI.

Create another connection for the both chains:

```sh
$ hermes -c simple_config.toml create connection ibc-0 ibc-1
```

In the output of this command you receive the `connection_id`s for both chains. Use the `connection_id` for the **ibc-0** chain and create a channel:

```sh
$ hermes -c simple_config.toml create channel --port-a transfer --port-b transfer ibc-0 connection-2
```

This repeats the port binding `transfer`. Check that the channel is created again with:

```sh
$ hermes -c simple_config.toml query channels ibc-0
```

The E2E testing already created some accounts (via `keys add testkey --output json`) for the tests and added them to the Hermes relayer via:

```sh
$ hermes keys add ibc-0 -f user_seed_ibc-0.json
$ hermes keys add ibc-1 -f user_seed_ibc-1.json
$ hermes keys add ibc-0 -f user2_seed_ibc-0.json
$ hermes keys add ibc-1 -f user2_seed_ibc-1.json
```

Get the user addresses for the **ibc-0** chain:

```sh
$ hermes -c simple_config.toml keys list ibc-0
```

Now get the user addresses for the **ibc-1** chain:

```sh
$ hermes -c simple_config.toml keys list ibc-1
```

In the `simple_confing.toml` the default user key is set to `testkey`, so you do not need to specify a user if you want to sign a transaction with `testkey`.

Now check the balance of those accounts on the chain **ibc-0**. Replace the `$testkey` with the addresses you get in your test:

```sh
# use your local terminal
$ docker exec ibc-0 gaiad query bank balances $testkey
```

Repeat this check for **ibc-1** with the corresponding address.

These accounts keep some **samoleans**. You will also see another denom because of the E2E test.

<HighlightBox type="tip">

Please see the [fungible token transfers](./token-transfer.md) section for more information on the IBC denom.

</HighlightBox>

Do a transfer and use the channel that was created:

```sh
$ hermes -c simple_config.toml tx raw ft-transfer ibc-1 ibc-0 transfer channel-2 100 --timeout-height-offset 1000
```

In case you do not want to test with the default user, you can specify the sender with a `-k` flag and the receiver on the other chain with a `-r` flag.

<HighlightBox type="note">

Usually the Hermes relayer automatically relays packets between the chains if it runs via:

```sh
$ hermes -c simple_config.toml start
```

In this case, we want to relay the transfer transaction by hand.

</HighlightBox>

First, query packet commitments on **ibc-0**:

```sh
$ hermes -c simple_config.toml query packet commitments ibc-0 transfer channel-2
```

You can see that there is one packet.

You can also query for unreceived packets:

```sh
$ hermes -c simple_config.toml query packet unreceived-packets ibc-1 transfer channel-5
```

<HighlightBox type="note">

You can get the `connection_id` and `channel_id` for **ibc-1** in the output of the `hermes create connection` and `hermes create channel` commands.

</HighlightBox>

If you check the balances again, you should only see a change for **ibc-0**. You should see no change in the balance of `testkey` on **ibc-1** because the transfer is initiated but it is not relayed yet.

Now submit the `RecvPacket` message to **ibc-1**:

```sh
$ hermes -c simple_config.toml tx raw packet-recv ibc-1 ibc-0 transfer channel-2
```

Send an acknowledgement to **ibc-0**:

```sh
$ hermes -c simple_config.toml tx raw packet-ack ibc-0 ibc-1 transfer channel-5
```

Check the balances again. A new denom should appear because of our recent channel. As an exercise, transfer the tokens back to ibc-0.

## Next up

With this introduction to the Hermes relayer, you are all set for relaying. In the [next section](./ibc-tooling.md), you can find an overview of helpful tools for IBC.
