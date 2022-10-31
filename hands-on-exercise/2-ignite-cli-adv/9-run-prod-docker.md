---
title: Simulate Production in Docker
order: 12
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

* Alice's validator and KMS are on the private user-defined network `net-alice-kms`.
* Alice's validator and sentry are on the private user-defined network `net-alice`.
* Bob's validator and sentry are on the private user-defined network `net-bob`.
* There is a public user-defined network on which sentries and Carol's node run: `net-public`.

## Docker elements

Before looking at the specific Compose elements, you need to define what the _regular_ Docker elements are.

### The node images

The validators, sentries and regular nodes will run `checkersd`.

In the [previous section](./8-run-prod.md), you built executables, in particular `checkersd-linux-amd64` and `checkersd-linux-arm64`. They should be enough for the purpose. Create a new `Dockerfile-ubuntu-prod` with:

```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/Dockerfile-ubuntu-prod]
FROM --platform=linux ubuntu:22.04
ARG BUILDARCH

ENV LOCAL=/usr/local

EXPOSE 1317 26656 26657

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

### The key manager image

Alice runs a [Tendermint Key Management System](https://github.com/iqlusioninc/tmkms) on a separate machine. You need to prepare its image. This involves a compilation of the Rust code. This is a good opportunity to use a [multi-stage Docker build](https://docs.docker.com/build/building/multi-stage/). With this technique:

1. You define a disposable image (the first stage) that clones the code and compiles it, which involves the download of Rust crates. It is large and then disposed of.
2. You define a slim new image (the second stage) in which you only copy the compiled file. This is the image you keep for production. It is small.

The disposable image needs to have Rust of at least version 1.56. Fortunately, there are ready-made images. Pick [`rust:1.64.0`](https://hub.docker.com/layers/library/rust/1.64.0/images/sha256-44ba8b8d8a2993694926cc847e1cce27937550c2e9eade4d9887ba90b2a2063f).

In what device will your key be stored? You do not use hardware keys in this setup. So, when building, you use the [`softsign` extension](https://github.com/iqlusioninc/tmkms/blob/c56b496e1bb1187482d7a6fad23c4566329c951e/src/keyring/providers/softsign.rs) with the syntax `--features=softsign`.

What version of the KMS should you compile to? Find the Tendermint version of your Checkers code:

```sh
$ grep tendermint/tendermint go.mod
```

It should return something like:

```txt
github.com/tendermint/tendermint v0.34.19
```

Because here it is version 0.34, it is a good idea to use the KMS from [version 0.10.0](https://github.com/iqlusioninc/tmkms/blob/main/CHANGELOG.md). At the time of writing, **version 0.12.2** still seems to support Tendermint v0.34. Pick this one.

With these requisites, you can create the staged Docker image:

```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/Dockerfile-ubuntu-tmkms]
FROM --platform=linux rust:1.64.0 AS builder
ARG BUILDARCH

ENV LOCAL=/usr/local
ENV RUSTFLAGS=-Ctarget-feature=+aes,+ssse3
ENV TMKMS_VERSION=v0.12.2

RUN apt-get update
RUN apt-get install libusb-1.0-0-dev --yes

WORKDIR /root
RUN git clone https://github.com/iqlusioninc/tmkms.git
WORKDIR /root/tmkms
RUN git checkout ${TMKMS_VERSION}
RUN cargo build --release --features=softsign

FROM --platform=linux ubuntu:22.04

COPY --from=builder /root/tmkms/target/release/tmkms ${LOCAL}/bin

ENTRYPOINT [ "tmkms" ]
```

Note how the production stage is only three lines. Build the image as usual with:

```sh
$ docker build -f Dockerfile-ubuntu-tmkms . -t tmkms_i
```

Now when you run it:

```sh
$ docker run --rm -it tmkms_i
```

It returns you information about usage. You built Tendermint Key Management System.

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

And for the KMS:

```sh
$ docker run ... -v $(pwd)/docker/kms-alice:/root/tmkms tmkms_i ...
```

### Keys

Some keys are created automatically, like the node key. For others, you have to create them by hand. The keys for the validators and Alice's KMS Tendermint key.

### Validator operation keys

First, you need to create the two validators' operation keys. This key is not meant to reside on the node when it runs. It is meant to be used to stake on behalf of Alice (or Bob). Nonetheless, you are going to create them by running containers. Because you want to keep these keys inside and outside of containers:

1. You use the `--keyring-backend file`.
2. You keep them in the mapped volume with `--keyring-dir /root/.checkers/keys`.

Create the key for `val-alice`:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    keys \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    add alice
```

Use a passphrase you can remember. It does not need to be exceptionally complex as this is all a local simulation. And because with this in-prod simulation you care less about safety, so much less that you put the mnemonic in a new `docker/val-alice/keys/mnemonic-alice.txt` file.

Do the same for `val-bob`:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-bob:/root/.checkers \
    checkersd_i \
    keys \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    add bob
```

For this exercise, the keyring was created with the passphrase `password`. You will note that `checkersd` has also created a `config` folder with three TOML configuration files.

### Alice's KMS Tendermint key

As per [the documentation](https://github.com/iqlusioninc/tmkms/tree/v0.12.2#configuration-tmkms-init), initialize the KMS folder:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/kms-alice:/root/tmkms \
    tmkms_i \
    init /root/tmkms
```

In the `kms-alice/tmkms.toml` file replace `cosmoshub-3` with `checkers`, the name of your blockchain, wherever the former appears.

Under `[[validator]]`'s `addr` you need to positively identify the validator node when connecting to it, i.e. Alice's validator. Otherwise you could be signing transactions submitted by a malicious actor. You may know the right id value only after you have initialized Alice's validator too. So go ahead and do it now:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    init checkers
```

Accessorily, this has also created the `config/genesis.json` first shot. Now you can extract Alice's validator node key:

```sh
$ docker run --rm -i \
  -v $(pwd)/docker/val-alice:/root/.checkers \
  checkersd_i \
  tendermint show-node-id
```

It returns something like:

```txt
f2673103417334a839f5c20096909c3023ba4903
```

So update `kms-alice/tmkms.toml` with:

```toml
[[validator]]
...
addr = "tcp://f2673103417334a839f5c20096909c3023ba4903@val-alice:26658"
```

`val-alice` is the future network name of Alice's validator, and it will be resolved to an IP address via Docker.

While you are at it, you should inform Alice's validator that it should indeed listen on port 26658. In `val-alice/config/config.toml`:

* Make it listen on its IP address that is within the KMS private network:

  ```toml
  priv_validator_laddr = "tcp://0.0.0.0:26658"
  ```

* Make it not look for the consensus key on file:

  ```toml
  priv_validator_key_file = ""
  ```

With `init checkers` Alice has also created a new `val-alice/config/priv_validator_key.json` file. This would be the key her validator uses if it kept its Tendermint key on disk. However, the KMS is here to take care of this key. Remember that you picked `--features=softsign` when building it.

Taking inspiration from [this guide](https://docs.desmos.network/mainnet/kms/kms_softsign), you prepare a new `softsign` key.

<!-- First get Alice's validator operator key:

```sh
$ ALICE_VALOPER=$(echo password | docker run --rm -i \
  -v $(pwd)/docker/val-alice:/root/.checkers \
  checkersd_i \
  keys \
  --keyring-backend file --keyring-dir /root/.checkers/keys \
  show alice --bech val --address)
```

It should save an address like `cosmosvaloper10y9el7wa4gynqkr9x0ds35knhjzj9whsmgjnnu`.

```sh
$ docker run --rm -i \
  -v $(pwd)/docker/val-alice:/root/.checkers \
  checkersd_i \
  query staking validator $ALICE_VALOPER
``` -->

At some point, Alice is going to generate her genesis staking transaction. For that, she will need the public key from her KMS. As it turns out, that is the one found in `priv_validator_key.json`. So save this information:

```sh
$ docker run --rm -t \
  -v $(pwd)/docker/val-alice:/root/.checkers \
  checkersd_i \
  tendermint show-validator \
  | docker run --rm -i \
  checkers_i \
  jq -jc "." \
  > docker/val-alice/config/pub_validator_key.json
```

Note how the second command after `|` is calling the `checkers_i` image, not `checkersd_i`, to get access to `jq`. Of course, if you have `jq` on your host, you can simply use it.

Because the consensus private key should not be on the validator, you can remove it. Actually, because this is a test setup, move it from the validator to the KMS so that you can import it:

```sh
$ mv docker/val-alice/config/priv_validator_key.json docker/kms-alice/secrets
```

Before moving on, make sure that the validator still has a `priv_validator_key.json` because the code may complain if the file cannot be found. You can copy the key from `sentry-alice`, which does not present any risk:

```sh
$ cp docker/sentry-alice/config/priv_validator_key.json docker/val-alice/config
```

Now import the consensus key into the _`softsign`_ file that the KMS uses:

```sh
$ docker run --rm -i \
  -v $(pwd)/docker/kms-alice:/root/tmkms \
  -w /root/tmkms \
  tmkms_i \
  softsign import secrets/priv_validator_key.json \
  secrets/checkers-consensus.key
```

Confirm that you extracted the key in the right file name `kms-alice/secrets/checkers-consensus.key` as specified in `tmkms.toml` here:

```toml
[[providers.softsign]]
...
path = "/root/tmkms/secrets/checkers-consensus.key"
```

### Genesis

With the keys in, you can start creating the genesis. Alice has already created the first shot

`checkersd` has created the `config/genesis.json` and two private key files. Alice will eventually use the Tendermint KMS so `priv_validator_key.json` will be replaced. Replace the default token from `"stake"` to `"upawn"`, which will be understood as 1 PAWN equals 1 million of `upawn`.

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    --entrypoint sed \
    checkersd_i \
    -i 's/"stake"/"upawn"/g' /root/.checkers/config/genesis.json
```

Note how the command overrides the default `checkersd` entry point and replaces it with `--entrypoint sed`.

#### Initial balances

In this setup Alice starts with 1,000 PAWN and Bob  500 PAWN, of which, they will stake 100 each. Get their respective addresses:

```sh
$ ALICE=$(echo password | docker run --rm -i \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    keys \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
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
    keys \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    show bob --address)
$ docker run --rm -it \
    -v $(pwd)/docker/val-bob:/root/.checkers \
    checkersd_i \
    add-genesis-account $BOB 500000000upawn
```

#### Initial stakes

Alice and Bob both have initial stakes that they define via genesis transactions. You create them.

##### Bob's stake

Bob is not using the Tendermint KMS but instead uses the validator key on file. It is not created yet but will be created automatically. Bob appears in second position in `app_state.accounts`, so it has an `account_number` of `1`:

```sh
$ echo password | docker run --rm -i \
    -v $(pwd)/docker/val-bob:/root/.checkers \
    checkersd_i \
    gentx bob 100000000upawn \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    --account-number 1 --sequence 0 \
    --chain-id checkers \
    --gas 1000000 \
    --gas-prices 0.1upawn
```

Again, put your correct passphrase. Return the genesis to Alice:

```sh
$ mv docker/val-bob/config/genesis.json docker/val-alice/config/
```

It is Alice's turn to add her staking transaction.

##### Alice's stake

Create Alice's genesis transaction using the specific validator public key that you saved on file, and not the key that would be taken from `priv_validator_key.json` by default:

```sh
$ echo password | docker run --rm -i \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    gentx alice 100000000upawn \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    --account-number 0 --sequence 0 \
    --pubkey $(cat docker/val-alice/config/pub_validator_key.json) \
    --chain-id checkers \
    --gas 1000000 \
    --gas-prices 0.1upawn
```

It is useful to know this `--pubkey` method. Indeed, if you were using a hardware key located on the KMS, that would be the canonical way of generating your genesis transaction.

#### Genesis assembly

With the two initial staking transactions created, have Alice include both of them in the genesis:

```sh
$ cp docker/val-bob/config/gentx/gentx-* docker/val-alice/config/gentx
$ docker run --rm -it \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i collect-gentxs
```

As an added precaution, confirm that it is a valid genesis:

```sh
$ docker run --rm -it \
  -v $(pwd)/docker/val-alice:/root/.checkers \
  checkersd_i \
  validate-genesis
```

It should return:

```txt
File at /root/.checkers/config/genesis.json is a valid genesis file
```

#### Genesis distribution

All the nodes that will run the executable need the final version of the genesis. Copy it across:

```sh
$ cp docker/val-alice/config/genesis.json docker/sentry-alice/config
$ cp docker/val-alice/config/genesis.json docker/val-bob/config
$ cp docker/val-alice/config/genesis.json docker/sentry-bob/config
$ cp docker/val-alice/config/genesis.json docker/node-carol/config
```

## Network preparation

Because the the validators are on a private network and fronted by sentries, you need to set up the configuration of each nodes so they can find each other. And also that the sentries keep the validators addresses private. What are the nodes' public keys? For instance, for `val-alice`, it is:

```sh
$ docker run --rm -i \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    tendermint show-node-id
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
$ docker run --rm -i \
    -v $(pwd)/docker/sentry-alice:/root/.checkers \
    checkersd_i start
```

Then in `docker/sentry-alice/config/config.toml`:

```ini
persistent_peers = "f2673103417334a839f5c20096909c3023ba4903@val-alice:26656"
```

It so happens that `sentry-alice` also has access to `sentry-bob` and `node-carol`, although these nodes probably should not be considered persistent. You will add them under `"seeds"`. First collect the same information from these nodes:

```sh
$ docker run --rm -i \
    -v $(pwd)/docker/sentry-bob:/root/.checkers \
    checkersd_i start
$ docker run --rm -i -v $(pwd)/docker/sentry-bob:/root/.checkers \
    checkersd_i \
    tendermint show-node-id
$ docker run --rm -i -v $(pwd)/docker/node-carol:/root/.checkers \
    checkersd_i \
    start
$ docker run --rm -i -v $(pwd)/docker/node-carol:/root/.checkers \
    checkersd_i \
    tendermint show-node-id
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

* When it is resolved from `val-alice`, the resolution takes place in `net-alice`.
* When it is resolved from `sentry-bob`, the resolution takes place in `net-public`.

</HighlightBox>

## Compose elements

You have defined the basic Docker elements, the blockchain and network elements. Time to assemble all those into Compose.

### The executables that run

You define the different machines as `services`. To start with:

* In `container_name`, you use names that make them intelligible and match the names you used in the network preparation.
* In `image`, you associate the Docker image to use.
* In `command`, you define the command to use when launching the image.

```yaml
version: "3.7"

services:

  kms-alice:
    command: start --config /root/tmkms/tmkms.toml
    container_name: kms-alice
    image: tmkms_i

  val-alice:
    command: start
    container_name: val-alice
    image: checkersd_i

  sentry-alice:
    command: start
    container_name: sentry-alice
    image: checkersd_i

  val-bob:
    command: start
    container_name: val-bob
    image: checkersd_i
  
  sentry-bob:
    command: start
    container_name: sentry-bob
    image: checkersd_i

  node-carol:
    command: start
    container_name: node-carol
    image: checkersd_i
```

You are going to further refine the services definitions, starting with the disk volumes.

### The data each needs

You want each machine to access its own private folder prepared earlier. So you declare the mappings:

```yaml
services:

  kms-alice:
    ...
    volumes:
      - ./docker/kms-alice:/root/tmkms

  val-alice:
    ...
    volumes:
      - ./docker/val-alice:/root/.checkers

  sentry-alice:
    ...
    volumes:
      - ./docker/sentry-alice:/root/.checkers

  val-bob:
    ...
    volumes:
      - ./docker/val-bob:/root/.checkers
  
  sentry-bob:
    ...
    volumes:
      - ./docker/sentry-bob:/root/.checkers

  node-carol:
    ...
    volumes:
      - ./docker/node-carol:/root/.checkers
```

### The networks they run in

The user-defined networks need to mimic the desired separation of machines/containers and can be declared as:

```yaml
networks:
  net-alice-kms:
  net-alice:
  net-bob:
  net-public:
```

With the network declaration done, the belonging of each computer to each network can be written as:

```yaml
services:

  kms-alice:
    ...
    networks:
      - net-alice-kms

  val-alice:
    ...
    networks:
      - net-alice-kms
      - net-alice

  sentry-alice:
    ...
    networks:
      - net-alice
      - net-public

  val-bob:
    ...
    networks:
      - net-bob
  
  sentry-bob:
    ...
    networks:
      - net-bob
      - net-public

  node-carol:
    ...
    networks:
      - net-public
```

With all these computers on their own Docker networks, you may still want to access one of them to query the blockchain, or to play games. Make it on Carol's node:

```yaml
services:

  node-carol:
    ...
    ports:
      - 9090:9090
```

### Launching it

You are now ready to start your setup:

```sh
$ docker compose --project-name checkers-prod up --detach
```

To stop your whole setup:

```sh
$ docker compose --project-name checkers-prod down
```

<HighlightBox type="synopsis">

To summarize, this section has explored:

</HighlightBox>
