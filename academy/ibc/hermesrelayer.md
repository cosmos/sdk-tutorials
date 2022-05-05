---
title: "Hermes Relayer"
order: 
description: 
tag: deep-dive
---

# Hermes Relayer

[Hermes](https://hermes.informal.systems/) is a an open-source Rust implementation of a relayer for the Inter-Blockchain Communication Protocol (IBC). 

Clone the [Hermes repository](https://github.com/informalsystems/ibc-rs) in a new folder. It contains a folder for [end-to-end (E2E) testing](https://github.com/informalsystems/ibc-rs/tree/master/ci). This helps you deploy two chains and test the relayer. It also contains a Docker Compose file, which spins up two blockchain nodes and a relayer. 

Make sure that you have installed [Docker Compose](https://docs.docker.com/compose/install/) and [Docker](https://docs.docker.com/get-docker/) before continuing.

## E2E Testing

The test needs you to build the Docker images from the Docker files. The Docker images run a Linux on **x86_64**. You can build Hermes with [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) from the repository for the target `x86_64-unknown-linux-gnu`, or you can [download](https://github.com/informalsystems/ibc-rs/releases) a release version into the repository folder.

After you clone the repository and download a release version of Hermes for **x86_64**, go into the folder and run:

```bash
$ docker-compose -f ci/docker-compose-gaia-current.yml build relayer
```

This builds the relayer docker image. Start the Docker Compose network with two chains and a relayer:

```bash
$ docker-compose -f ci/docker-compose-gaia-current.yml up -d ibc-0 ibc-1 relayer
```

Check that everything is working as expected with:

```bash
$ docker exec relayer /bin/sh -c /relayer/e2e.sh
```

The [`e2e.sh`](https://github.com/informalsystems/ibc-rs/blob/master/ci/e2e.sh) uses [`run.py`](https://github.com/informalsystems/ibc-rs/blob/master/e2e/run.py) to automatically run a couple of tests.

## Hermes CLI

Go into the relayer container and run a bash:

```bash
$ docker exec -it relayer bash
```

First, check the Hermes version:

```bash
# hermes version
hermes 0.14.0+460eb0c
```

**Note:** this section indicates bash in your terminal with a `$` and bash in the Docker Container with a `#`.

Check the CLI with:

```bash
# hermes help
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

As you can see, the Hermes CLI offers help for each CLI command you can use. 

Check the default configuration:

```bash
# cat simple_config.toml 
```

In the `[[chains]]` section of the `simple_config.toml`, you can find the configuration for two chains, **ibc-0** and **ibc-1**. In it, the chain IDs need to be specified, as well as the RPC, GRPC, and WebSocket addresses.

<Highlight type="tip">

See the [Hermes documantion](https://hermes.informal.systems/config.html) and the [sample configuration](https://hermes.informal.systems/example-config.html) for more information on configuration.

</Highlight>

Do a validation check on the configuration file:

```bash
# hermes -c simple_config.toml config validate
```

Next do a health check:

```bash
# hermes -c simple_config.toml health-check 
```

You should see that both chains are healthy. The E2E test will create clients, connections, and a channel.

To query the clients for the chain **ibc-0**, run:

```bash
# hermes -c simple_config.toml query clients ibc-0
```

There should be one Tendermint client for the chain **ibc-1**.

Query the connections for **ibc-0**:

```bash
# hermes -c simple_config.toml query connections ibc-0
```

There should be two connections, both established between **ibc-0** and **ibc-1**.

Query the channels for **ibc-0**:

```bash
# hermes -c simple_config.toml query connections ibc-0
```

You should see two channels and the port binding transfer. All this is part of the E2E testing. You can redo some steps to better understand the CLI.

Just create another connection for the both chains:

```bash
# hermes -c simple_config.toml create connection ibc-0 ibc-1
```

In the output of this command you receive the `connection_id`s for both chains. Use the `connection_id` for the **ibc-0** chain and create a channel:

```bash
# hermes -c simple_config.toml create channel --port-a transfer --port-b transfer ibc-0 connection-2
```

This repeats the port binding `transfer`. Check that the channel is created again with:

```bash
# hermes -c simple_config.toml query channels ibc-0
```

The E2E testing already created some accounts (via `keys add testkey --output json`) for the tests and added them to the Hermes relayer via:

```bash
# hermes keys add ibc-0 -f user_seed_ibc-0.json
# hermes keys add ibc-1 -f user_seed_ibc-1.json
# hermes keys add ibc-0 -f user2_seed_ibc-0.json
# hermes keys add ibc-1 -f user2_seed_ibc-1.json
```

Get the user addresses for the **ibc-0** chain with:

```bash
# hermes -c simple_config.toml keys list ibc-0
```

And for the **ibc-1** chain with:

```bash
# hermes -c simple_config.toml keys list ibc-1
```

In the `simple_confing.toml`, the default user key is set to `testkey`, so you do not need to specify a user if you want to sign a transaction with `testkey`.

Now check the balance of those accounts on the chain **ibc-0**. Replace the `$testkey` with the addresses you get in your test:

```bash
$ docker exec ibc-0 gaiad query bank balances $testkey
```

Repeat this check for **ibc-1** with the corresponding address. 

You will see that these accounts keep some **samoleans** and you will also see another denom because of the E2E test.

<HighlightBox type="tip">

Please see the [fungible token transfers](add_url_after_merge) section for more information on the other denom.

</HighlightBox>

Do a transfer and use the channel that was created:

```bash
# hermes -c simple_config.toml tx raw ft-transfer ibc-1 ibc-0 transfer channel-2 100 --timeout-height-offset 1000
```

In case you do not want to test with the default user, you can specify the sender with a `-k` flag and the receiver on the other chain with a `-r` flag.

Usually the Hermes relayer automatically relays packets between the chains if it runs via:

```bash
# hermes -c simple_config.toml start
```

But here we want to relay the transfer transaction by hand.

First, query packet commitments on **ibc-0**:

```bash
# hermes -c simple_config.toml query packet commitments ibc-0 transfer channel-2
```

You can see that there is one packet.

We can also query for unreceived packets:

```bash
# hermes -c simple_config.toml query packet unreceived-packets ibc-1 transfer channel-5
```

**Note:** you can get the `connection_id` and `channel_id` for **ibc-1** in the output of the `hermes create connection` and `hermes create channel` commands. 

So if you check the balances again, you should only see a change for **ibc-0**. You should see no change in the balance of `testkey` on **ibc-1** because the transfer is initiated but it is not relayed yet.

Now you can send the packet to **ibc-1**:

```bash
# hermes -c simple_config.toml tx raw packet-recv ibc-1 ibc-0 transfer channel-2
```

and send an acknowledgement to **ibc-0**:

```bash
# hermes -c simple_config.toml tx raw packet-ack ibc-0 ibc-1 transfer channel-5
```

Check the balances again. There a new denom should appear because of our recent channel. As an exercise, transfer the tokens back to ibc-0.
