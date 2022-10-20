---
title: Simulate Production in Docker
order: 22
description: Run your checkers in a simulated production with Docker Compose
tags:
  - guided-coding
  - cosmos-sdk
  - dev-ops
---

# Simulate Production in Docker

Before you launch yourself fully into production, it would be interesting to simulate a set of independent nodes on your own computer. This can be prepared and orchestrated with [Docker Compose](https://docs.docker.com/get-started/08_using_compose).

## Target setup

In order to mimic a real setup, find an objective on which to focus:

* Three independent parties, Alice, Bob and Carol
* Two independent validator nodes, run by Alice and Bob, that can only communicate with their own sentries and do not expose RPC end points.
* One of the validator nodes, Alice's, uses Tendermint KMS.
* The two sentry nodes, run by Alice and Bob, expose end points.
* A regular node, run by Carol, that can communicate with only the sentries and exposes end points for use by clients.

In terms of Docker concepts, this means:

* Alice's validator and KMS are on the private user-defined network `alice-kms-net`.
* Alice's validator and sentry are on the private user-defined network `alice-net`.
* Bob's validator and sentry are on the private user-defined network `bob-net`.
* There is a public user-defined network on which sentries and Carol's node run: `public-net`.

## Docker elements

Before looking at the specific Compose elements, you need to define what the _regular_ Docker elements are.

### The images

The validators, sentries and regular nodes will run `checkersd`.

In the [previous section](./8-run-prod.md), you built executables, in particular `checkersd-linux-amd64` and `checkersd-linux-arm64`. They should be enough for the purpose. Create a new `Dockerfile-ubuntu-prod` with:

```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/Dockerfile-ubuntu-prod]
FROM --platform=linux ubuntu:22.04
ARG BUILDARCH

ENV LOCAL=/usr/local

EXPOSE 1317 26657

COPY build/checkersd-linux-${BUILDARCH} ${LOCAL}/bin/checkersd

ENTRYPOINT [ "checkersd" ]
```

And build the image with:

```sh
$ docker build -f Dockerfile-ubuntu-prod . -t checkersd_i
```

Now when you run it:

```sh
$ docker run --rm -it checkersd_i help
```

It prints a recognizable list of commands.

Each Docker container will run `checkersd` as `root` and it does not matter because it all happens in a container. So there is no need to create a specific additional user. For the same reason, there is also no need to create a service to launch it.

## Blockchain elements

Each container needs access to its own private information, such as keys and genesis. To facilitate data access and separation between containers, you create folders that will map as a volume to the default `/root/.checkers`.

```sh
$ mkdir -p docker/kms-alice
$ mkdir -p docker/node-carol
$ mkdir -p docker/sentry-alice
$ mkdir -p docker/sentry-bob
$ mkdir -p docker/val-alice
$ mkdir -p docker/val-bob
```

For instance, when running a container for `val-alice`, you will create the mapping with a command like:

```sh
$ docker run ... -v $(pwd)/docker/val-alice:/root/.checkers checkersd_i ...
```

### Keys

First, you need to create the two validators' operation keys. This key is not meant to reside on the node when it runs. It is meant to be used to stake on behalf of Alice. Nonetheless, you are going to create them by running containers. Because you want to move these keys around:

1. You use the `--keyring-backend file`.
2. You put it in the mapped volume with `--keyring-dir /root/.checkers/keys`.

Create it for `val-alice`:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    keys --keyring-backend file --keyring-dir /root/.checkers/keys add alice
```

Use a passphrase you can remember. It does not need to be exceptionally complex as this is all a local simulation. And because with this in-prod simulation you care less about safety, you laughably put the mnemonic in a new `docker/val-alice/keys/mnemonic-alice.txt` file.

Do the same for `val-bob`:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-bob:/root/.checkers \
    checkersd_i \
    keys --keyring-backend file --keyring-dir /root/.checkers/keys \
    add bob
```

For this exercise, the keyring was created with the passphrase `password`. You will note that `checkersd` has also created a `config` file with three TOML configuration files.

### Genesis

With the keys in, you can start creating the genesis. Have Alice create the first shot:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    init checkers
```

It has created the `config/genesis.json` but also two private key files. Alice will eventually use the Tendermint KMS so `priv_validator_key.json` will be replaced. Replace the default token from `"stake"` to `"upawn"`, which will be understood as 1 PAWN equals 1 million of `upawn`.

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    --entrypoint sed \
    checkersd_i \
    -i 's/"stake"/"upawn"/g' /root/.checkers/config/genesis.json
```

#### Initial balances

In this setup Alice and Bob both start with 1,000 PAWN, of which, they will stake 10 each. Get their respective addresses:

```sh
$ ALICE=$(echo password | docker run --rm -i \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    keys --keyring-backend file --keyring-dir /root/.checkers/keys \
    show alice --address)
```

Replace `password` by the passphrase you picked when creating the keys.

Have Alice add her initial balance in the genesis:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    add-genesis-account $ALICE 1000000000upawn
```

Now move the genesis file to `val-bob`:

```sh
$ mv docker/val-alice/config/genesis.json docker/val-bob/config/
```

And have Bob add his own initial balance:

```sh
$ BOB=$(echo password | docker run --rm -i \
    -v $(pwd)/docker/val-bob:/root/.checkers \
    checkersd_i \
    keys --keyring-backend file --keyring-dir /root/.checkers/keys \
    show bob --address)
$ docker run --rm -it \
    -v $(pwd)/docker/val-bob:/root/.checkers \
    checkersd_i \
    add-genesis-account $BOB 1000000000upawn
```

#### Initial stakes

Bob is not using the Tendermint KMS but instead uses the validator key on file. It is not created yet but will be created automatically. Bob appears in second position in `app_state.accounts`, so it has an `account_number` of `1`:

```sh
$ echo password | docker run --rm -i \
    -v $(pwd)/docker/val-bob:/root/.checkers \
    checkersd_i \
    gentx bob 10000000upawn \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    --account-number 1 --sequence 0 \
    --chain-id checkers
```

Again, put your correct passphrase.

TODO Have Alice add her staking transaction with KMS.

With the initial transactions created, you have Alice include them in the genesis:

```sh
$ mv docker/val-bob/config/gentx/* docker/val-alice/config/gentx
$ mv docker/val-bob/config/genesis.json docker/val-alice/config
$ docker run --rm -it \
    -v $(pwd)/docker/val-bob:/root/.checkers \
    checkersd_i collect-gentxs
```

#### Genesis distribution

All the nodes that will run the executable need the final version of the genesis:

```sh
$ cp docker/val-alice/config/genesis.json docker/sentry-alice/config
$ cp docker/val-alice/config/genesis.json docker/val-bob/config
$ cp docker/val-alice/config/genesis.json docker/sentry-bob/config
$ cp docker/val-alice/config/genesis.json docker/node-carol/config
```

## Network preparation

Because the the validators are on a private network and fronted by sentries, you need to set up the configuration of each nodes so they can find each other. And also that the sentries keep the validators addresses private. What are the nodes' public keys? For instance, for `val-alice`, it is:

```sh
$ docker run --rm -i -v $(pwd)/docker/val-alice:/root/.checkers checkersd_i tendermint show-node-id
```

It returns something like:

```txt
f2673103417334a839f5c20096909c3023ba4903
```

### Set up Alice's sentry

So the nodes that have access to `val-alice` should know it by this identifier:

```txt
f2673103417334a839f5c20096909c3023ba4903@val-alice:26656
```

Where:

* `val-alice` will be resolved via Docker's user-defined bridge.
* `26656` is the port as found in `docker/val-alice/config/config.toml`'s `laddr = "tcp://0.0.0.0:26656"` value.

In the case of `val-alice`, only `sentry-alice` has access to it. Moreover, this is a persistent node. So you add it in `docker/sentry-alice/config/config.toml`. If this file is missing, you can create it and other by doing a _fake_ `start`:

```sh
$ docker run --rm -i -v $(pwd)/docker/sentry-alice:/root/.checkers checkersd_i start
```

Then in `docker/sentry-alice/config/config.toml`:

```ini
persistent_peers = "f2673103417334a839f5c20096909c3023ba4903@val-alice:26656"
```

It so happens that `sentry-alice` also has access to `sentry-bob` and `node-carol`, although these nodes probably should not be considered persistent. You will add them under `"seeds"`. First collect the same information from these nodes:

```sh
$ docker run --rm -i -v $(pwd)/docker/sentry-bob:/root/.checkers checkersd_i start
$ docker run --rm -i -v $(pwd)/docker/sentry-bob:/root/.checkers checkersd_i tendermint show-node-id
$ docker run --rm -i -v $(pwd)/docker/node-carol:/root/.checkers checkersd_i start
$ docker run --rm -i -v $(pwd)/docker/node-carol:/root/.checkers checkersd_i tendermint show-node-id
```

Eventually, in `sentry-alice`, you should have:

```ini
seeds = "7009cc51174dce87c31f537fe8fed906349a27f4@sentry-bob:26656,8f1bafad62a4a1f8678214d96a8b2ae2ed140cf7@node-carol:26656"
persistent_peers = "f2673103417334a839f5c20096909c3023ba4903@val-alice:26656"
```

Before moving on to other nodes, remember that `sentry-alice` should keep `val-alice` secret. Set:

```ini
private_peer_ids = "f2673103417334a839f5c20096909c3023ba4903"
```

### Other nodes

Repeat the procedure for the other nodes taking into account their specific circumstances:

* `val-alice`'s:
  
    ```ini
    persistent_peers = "83144b58031953ad60eaccb0a790955450f1ddef@sentry-alice:26656"
    ```

* `val-bob`'s:

    ```ini
    persistent_peers = "7009cc51174dce87c31f537fe8fed906349a27f4@sentry-bob:26656"
    ```

* `sentry-bob`'s:

    ```ini
    seeds = "83144b58031953ad60eaccb0a790955450f1ddef@sentry-alice:26656,8f1bafad62a4a1f8678214d96a8b2ae2ed140cf7@node-carol:26656"
    persistent_peers = "1e0d99ccf83b49e7aca852e82074c8e7f0e99d73@val-bob:26656"
    private_peer_ids = "1e0d99ccf83b49e7aca852e82074c8e7f0e99d73"
    ```

* `node-carol`'s:

    ```ini
    seeds = "83144b58031953ad60eaccb0a790955450f1ddef@sentry-alice:26656,7009cc51174dce87c31f537fe8fed906349a27f4@sentry-bob:26656"
    ```

<HighlightBox type="note">

For the avoidance of doubt, `sentry-alice` has a different address depending on which node resolves the address.

* When it is resolved from `val-alice`, the resolution takes place in `alice-net`.
* When it is resolved from `sentry-bob`, the resolution takes place in `public-net`.

</HighlightBox>

## Compose elements

The user-defined networks need to mimic the desired separation of machines/containers and can be expressed as:

```yaml
networks:
  alice-kms-net:
  alice-net:
  bob-net:
  public-net:
```

The belonging of each computer to each network can be written as:

```yaml
services:

  kms-alice:
    networks:
      - alice-kms-net

  val-alice:
    networks:
      - alice-kms-net
      - alice-net

  sentry-alice:
    networks:
      - alice-net
      - public-net

  val-bob:
    networks:
      - bob-net
  
  sentry-bob:
    networks:
      - bob-net
      - public-net

  node-carol:
    networks:
      - public-net
```

<HighlightBox type="synopsis">

To summarize, this section has explored:

</HighlightBox>
