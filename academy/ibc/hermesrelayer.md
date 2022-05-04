---
title: "Hermes Relayer"
order: 
description: 
tag: deep-dive
---

# Hermes Relayer

[Hermes](https://hermes.informal.systems/) is a an open-source Rust implementation of a relayer for the Inter-Blockchain Communication Protocol (IBC). 

Clone the [Hermes repository](https://github.com/informalsystems/ibc-rs) in a new folder. It contains a folder for [end-to-end (E2E) testing](https://github.com/informalsystems/ibc-rs/tree/master/ci). It helps you deploy two chains and test the relayer. It also contains a Docker Compose file, which spins up two blockchain nodes and a relayer. 

Make sure that you installed [Docker Compose](https://docs.docker.com/compose/install/) and [Docker](https://docs.docker.com/get-docker/) before continuing.

## E2E Testing

The test needs you to build the Docker images from the Docker files. The Docker images run a Linux on **x86_64**. You can build Hermes with [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) from the repository for the target `x86_64-unknown-linux-gnu` or you can [download](https://github.com/informalsystems/ibc-rs/releases) a release version into the repository folder.

After you cloned the repository and downloaded a release version of Hermes for x86_64, go into the folder and run:

```bash
$ docker-compose -f ci/docker-compose-gaia-current.yml build relayer
```

to build the relayer docker image. Start the Docker Compose network with two chains and a relayer:

```bash
$ docker-compose -f ci/docker-compose-gaia-current.yml up -d ibc-0 ibc-1 relayer
```

Check with:

```bash
$ docker exec relayer /bin/sh -c /relayer/e2e.sh
```

if everything went right. The [`e2e.sh`](https://github.com/informalsystems/ibc-rs/blob/master/ci/e2e.sh) uses [`run.py`](https://github.com/informalsystems/ibc-rs/blob/master/e2e/run.py) to automatically run a couple of tests.

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

**Note:** you indicate bash in your terminal with `$` and bash in the Docker container with `#`.

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

In the `simple_config.toml`, you can find the configuration for two chains, **ibc-0** and **ibc-1**.

<Highlight type="tip">
Check the [Hermes documantion](https://hermes.informal.systems/config.html) and the [sample configuration](https://hermes.informal.systems/example-config.html) for more information on configuration.

</Highlight>

Do a validation check on the configuration file:

```bash
# hermes -c simple_config.toml config validate
```

And do a health check:

```bash
# hermes -c simple_config.toml health-check 
```

You should see that both chains are healthy. The E2E test will create clients, connections, and a channel.

To query the clients for the chain **ibc-0**, run:

```bash
# hermes -c simple_config.toml query clients ibc-0
```

You can see that there is one Tendermint client for the chain **ibc-1**.

Query the connections for **ibc-0**:

```bash
# hermes -c simple_config.toml query connections ibc-0
```

You can see two connections, both are established between **ibc-0** and **ibc-1**.

Query the channels for **ibc-0**:

```bash
# hermes -c simple_config.toml query connections ibc-0
```

You can see two channels and the port binding transfer. All this is part of the E2E testing and you can redo some steps in attempt to better understand the CLI.

Just create another connection for the both chains:

```bash
# hermes -c simple_config.toml create connection ibc-0 ibc-1
```

In the output of this command, you receive the `connection_id`s for both chains. Use the `connection_id` for the **ibc-0** chain and create a channel:

```bash
# hermes -c simple_config.toml create channel --port-a transfer --port-b transfer ibc-0 connection-2
```

Above you go again with the port binding `transfer`. Check again with:

```bash
# hermes -c simple_config.toml query channels ibc-0
```

that the channel is created. 

The E2E testing will allready create some accounts for the tests. Get the user addresses for both chains with:

```bash
# hermes -c simple_config.toml keys list ibc-0
```

and

```bash
# hermes -c simple_config.toml keys list ibc-1
```

You can see in the `simple_confing.toml`, that the default user key is set to `testkey`.

Now check the balance of those accounts on the chain **ibc-0** with:

```bash
$ docker exec ibc-0 gaiad query bank balances $testkey
```

where you will replace the `$testkey` with the addresses you get in your test. 
Do the same check again for **ibc-1** with the corresponding address. 

You will see that those accounts keep some **samoleans**. Do a transfer and use the channel that was created:

```bash
# hermes -c simple_config.toml tx raw ft-transfer ibc-1 ibc-0 transfer channel-2 1 --timeout-height-offset 1000
```

You can specify the sender with a `-k` flag and the receiver on the other chain with a `-r` flag, by default `testkey` is used. 
