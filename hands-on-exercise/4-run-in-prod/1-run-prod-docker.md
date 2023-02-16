---
title: "Simulate Production in Docker"
order: 2
description: Run your checkers in a simulated production with Docker Compose
tags:
  - guided-coding
  - cosmos-sdk
  - dev-ops
---

# Simulate Production in Docker

<HighlightBox type="prerequisite">

Make sure you have everything you need before proceeding:

* You understand the concepts of [production](/hands-on-exercise/5-run-in-prod/index.md).
* Docker is installed.
* You have the checkers blockchain codebase with the CosmJS elements. If not, follow the [previous steps](/hands-on-exercise/3-cosmjs-adv/5-server-side.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/cosmjs-elements).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Prepare Docker elements.
* Handle keys.
* Prepare blockchain nodes.
* Prepare a blockchain genesis.
* Compose the lot in one orchestrated ensemble.

</HighlightBox>

Before you launch yourself fully into production, it would be interesting to simulate a set of independent nodes on your computer. This can be prepared and orchestrated with [Docker Compose](https://docs.docker.com/get-started/08_using_compose).

## Target setup

In order to mimic a real setup, find an objective on which to focus. Here the objective is:

* Three independent parties - Alice, Bob, and Carol.
* Two independent validator nodes, run by Alice and Bob respectively, that can only communicate with their own sentries and do not expose RPC endpoints.
* Additionally, Alice's validator node uses Tendermint Key Management System (TMKMS) on a separate machine.
* The two sentry nodes, run by Alice and Bob, expose endpoints to the _world_.
* A regular node, run by Carol, that can communicate with only the sentries and exposes endpoints for use by clients.

## Docker elements

Before looking at the specific Compose elements, you need to define what the _regular_ Docker elements are.

You will run containers. You can start by giving them meaningful names:

* Alice's containers: `sentry-alice`, `val-alice`, and `kms-alice`.
* Bob's containers: `sentry-bob` and `val-bob`.
* Carol's containers: `node-carol`.

Docker lets you simulate private networks. To meaningfully achieve the above target setup in terms of network separation, you use Docker's user-defined networks. This means:

* Alice's validator and key management system (KMS) are on their private network: name it `net-alice-kms`.
* Alice's validator and sentry are on their private network: name it `net-alice`.
* Bob's validator and sentry are on their private network: name it `net-bob`.
* There is a public network on which both sentries and Carol's node run: name it `net-public`.

Although every machine on the network is a bit different, in terms of Docker images there are only two image types:

1. The Tendermint nodes (validators, sentries, and regular nodes) will run `checkersd` within containers created from a single Docker image.
2. The Tendermint KMS node will run TMKMS from a different Docker image.

### The node image

The node image contains, and runs by default, the checkers executable. You first have to compile it, and then build the image.

First, build the executable(s) that will be launched by Docker Compose within the Docker images. Depending on your platform, you will use `checkersd-linux-amd64` or `checkersd-linux-arm64`.

Update your `Makefile` with:

```make [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/Makefile#L33-L45]
build-all:
    GOOS=linux GOARCH=amd64 go build -o ./build/checkersd-linux-amd64 ./cmd/checkersd/main.go
    GOOS=linux GOARCH=arm64 go build -o ./build/checkersd-linux-arm64 ./cmd/checkersd/main.go
    GOOS=darwin GOARCH=amd64 go build -o ./build/checkersd-darwin-amd64 ./cmd/checkersd/main.go
    GOOS=darwin GOARCH=arm64 go build -o ./build/checkersd-darwin-arm64 ./cmd/checkersd/main.go

do-checksum:
    cd build && sha256sum \
        checkersd-linux-amd64 checkersd-linux-arm64 \
        checkersd-darwin-amd64 checkersd-darwin-arm64 \
        > checkers_checksum

build-with-checksum: build-all do-checksum
```

If you have a CPU architecture that is neither `amd64` nor `arm64`, update your `Makefile` accordingly.

<HighlightBox type="note">

If you copy-pasted directly into `Makefile`, do not forget to convert the spaces into tabs.

</HighlightBox>

Now run either command:

<CodeGroup>

<CodeGroupItem title="With checkers_i">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    checkers_i \
    make build-with-checksum
```

Use this command if you already built this `checkers_i` image, as this will take less time.

</CodeGroupItem>

<CodeGroupItem title="With golang:1.18.7">

```sh
$ docker run --rm -it \
    -v $(pwd):/checkers \
    -w /checkers \
    golang:1.18.7 \
    make build-with-checksum
```

Use this command if you did not already have the `checkers_i` image. This command may take longer but should always work.

</CodeGroupItem>

</CodeGroup>

---

Now include the relevant executable inside your **production** image. Create a new `Dockerfile-ubuntu-prod` with:

```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/Dockerfile-ubuntu-prod]
FROM --platform=linux ubuntu:22.04
ARG BUILDARCH

ENV LOCAL=/usr/local

COPY build/checkersd-linux-${BUILDARCH} ${LOCAL}/bin/checkersd

ENTRYPOINT [ "checkersd" ]
```

Build the image with:

```sh
$ docker build -f Dockerfile-ubuntu-prod . -t checkersd_i
```

<ExpansionPanel title="Troubleshooting">

Depending on your installed version of Docker, you may have to add the flags:

```txt
--build-arg BUILDARCH=amd64
```

Or just manually replace `${BUILDARCH}` with `amd64` or whichever is your architecture.

</ExpansionPanel>

Now you can run it:

```sh
$ docker run --rm -it checkersd_i help
```

You should see a recognizable list of commands.

Each Docker container will run `checkersd` as `root`, which does not matter because it all happens in a container. Therefore, there is no need to create a specific additional user like you would in a serious production setting. For the same reason, there is also no need to create a service to launch it.

### The key manager image

Alice runs the [Tendermint Key Management System](https://github.com/iqlusioninc/tmkms) on a separate machine. You need to prepare its image. The image will contain the executable, which you have to compile from its Rust code.

There are several considerations to clarify:

* How will you build it?
* What device will store the key?
* What KMS version works with your node version?

The **build step** is a good opportunity to use a [multi-stage Docker build](https://docs.docker.com/build/building/multi-stage/). With this technique:

1. You define a disposable image (the first stage) that clones the code and compiles it. This involves the download of Rust crates (i.e. packages). This image ends up being large but is then disposed of.
2. You define a slim image (the second stage) in which you only copy the compiled file. This is the image you keep for production. It ends up being small.

The disposable image needs to use Rust of at least version 1.56. Fortunately, there are ready-made Docker images. Pick [`rust:1.64.0`](https://hub.docker.com/layers/library/rust/1.64.0/images/sha256-44ba8b8d8a2993694926cc847e1cce27937550c2e9eade4d9887ba90b2a2063f).

Next, the executable needs to be compiled for the specific **device** onto which your key will be stored. You do not use hardware keys in this setup. So, when building it, you use the [`softsign` extension](https://github.com/iqlusioninc/tmkms/blob/c56b496e1bb1187482d7a6fad23c4566329c951e/src/keyring/providers/softsign.rs). This is achieved by adding the flag `--features=softsign`.

Finally, what **version** of the TMKMS should you compile? A given TMKMS version can work with a limited set of specific Tendermint versions. Find the Tendermint version of your checkers code with:

```sh
$ grep tendermint/tendermint go.mod
```

It should return something like this:

```txt
github.com/tendermint/tendermint v0.34.19
```

<HighlightBox type="tip">

Because here it is version 0.34, it is a good idea to use the KMS from [version 0.10.0](https://github.com/iqlusioninc/tmkms/blob/main/CHANGELOG.md) upwards. At the time of writing, **version 0.12.2** still seems to support Tendermint v0.34. It is under the [`v0.12.2`](https://github.com/iqlusioninc/tmkms/tree/v0.12.2) tag on Github. Pick this one.

</HighlightBox>

Having collected the requisites, you can create the multi-staged Docker image in a new `Dockerfile-ubuntu-tmkms`:

```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/Dockerfile-ubuntu-tmkms]
FROM --platform=linux rust:1.64.0 AS builder

RUN apt-get update
RUN apt-get install libusb-1.0-0-dev --yes

ENV LOCAL=/usr/local
ENV RUSTFLAGS=-Ctarget-feature=+aes,+ssse3
ENV TMKMS_VERSION=v0.12.2

WORKDIR /root
RUN git clone --branch ${TMKMS_VERSION} https://github.com/iqlusioninc/tmkms.git
WORKDIR /root/tmkms
RUN cargo build --release --features=softsign

# The production image starts here
FROM --platform=linux ubuntu:22.04

COPY --from=builder /root/tmkms/target/release/tmkms ${LOCAL}/bin

ENTRYPOINT [ "tmkms" ]
```

As you can see, the production stage is only three lines. Build the image as usual with:

```sh
$ docker build -f Dockerfile-ubuntu-tmkms . -t tmkms_i:v0.12.2
```

Now run it:

```sh
$ docker run --rm -it tmkms_i:v0.12.2
```

It returns you information about usage. You have just built the Tendermint Key Management System.

## Blockchain elements

Each container needs access to its private information, such as keys, genesis, and database. To facilitate data access and separation between containers, create folders that will map as a volume to the default `/root/.checkers` or `/root/tmkms` inside containers. One for each container:

```sh [https://github.com/cosmos/b9-checkers-academy-draft/tree/run-prod/docker]
$ mkdir -p docker/kms-alice
$ mkdir -p docker/node-carol
$ mkdir -p docker/sentry-alice
$ mkdir -p docker/sentry-bob
$ mkdir -p docker/val-alice
$ mkdir -p docker/val-bob
```

For instance, when running a container for `val-alice`, you would create the volume mapping with a command like:

```sh
$ docker run ... \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i ...
```

And for the KMS, like so:

```sh
$ docker run ... \
    -v $(pwd)/docker/kms-alice:/root/tmkms \
    tmkms_i:v0.12.2 ...
```

### Basic initialization

Before you can change the configuration you need to initialize it. Do it on all nodes with this one-liner:

```sh
$ echo -e node-carol'\n'sentry-alice'\n'sentry-bob'\n'val-alice'\n'val-bob \
    | xargs -I {} \
    docker run --rm -i \
    -v $(pwd)/docker/{}:/root/.checkers \
    checkersd_i \
    init checkers
```

As a secondary effect, this also creates the first shot of `config/genesis.json` on every node, although you will start work with the one on `val-alice`.

Early decisions that you can make at this stage are:

* Deciding that the chain will be named `checkers-1`. It is a convention to append a number in case it has to go through a hard fork.
* Deciding that the staking denomination will be called `upawn`, which will be understood as 1 PAWN equals 1 million of `upawn`.

<HighlightBox type="note">

Do you need that many decimals? Yes and no. Depending on your version of the Cosmos SDK, there is a hard-coded value of base tokens that a validator has to stake, and the number is `10,000,000`. If you do not have enough decimals, the _human_ token would have to have a lot of zeroes.

</HighlightBox>

The default initialization sets the base token to `stake`, so to get it to be `upawn` you need to make some changes:

1. In the authoritative [`config/genesis.json`](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/config/genesis.json#L63) (`val-alice`'s):

  ```sh
  $ docker run --rm -it \
      -v $(pwd)/docker/val-alice:/root/.checkers \
      --entrypoint sed \
      checkersd_i \
      -i 's/"stake"/"upawn"/g' /root/.checkers/config/genesis.json
  ```
  
  Note how the command overrides the default `checkersd` entry point and replaces it with `--entrypoint sed`.

2. In all five [`config/app.toml`](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/config/app.toml#L11):

  ```sh
  $ echo -e node-carol'\n'sentry-alice'\n'sentry-bob'\n'val-alice'\n'val-bob \
      | xargs -I {} \
      docker run --rm -i \
      -v $(pwd)/docker/{}:/root/.checkers \
      --entrypoint sed \
      checkersd_i \
      -Ei 's/([0-9]+)stake/\1upawn/g' /root/.checkers/config/app.toml
  ```

Make sure that [`config/client.toml`](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/config/client.toml#L9) mentions `checkers-1`, the chain's name:

```sh
$ echo -e node-carol'\n'sentry-alice'\n'sentry-bob'\n'val-alice'\n'val-bob \
    | xargs -I {} \
    docker run --rm -i \
    -v $(pwd)/docker/{}:/root/.checkers \
    --entrypoint sed \
    checkersd_i \
    -Ei 's/^chain-id = .*$/chain-id = "checkers-1"/g' \
    /root/.checkers/config/client.toml
```

### Keys

Some keys are created automatically, like the [node keys](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/node-carol/config/node_key.json). For others, you have to create them yourself. You will create:

* The validator operator keys for Alice and Bob.
* The consensus keys, whether they stay on Bob's node or are kept inside Alice's KMS.

Start with the keys for the validators and Alice's KMS Tendermint key.

### Validator operator keys

First, you need to create the two validators' operation keys. Such a key is not meant to stay on the node when it runs, it is meant to be used at certain junctures only, for instance, to stake on behalf of Alice (or Bob). Nonetheless, you are going to create them by running containers. Because you want to keep these keys inside and outside of containers, do the following:

1. Use the `--keyring-backend file`.
2. Keep them in the mapped volume with `--keyring-dir /root/.checkers/keys`.

Create the operator key for `val-alice`:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    keys \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    add alice
```

Use a passphrase you can remember. It does not need to be exceptionally complex as this is all a local simulation. This exercise uses `password` and stores this detail on file, which will become handy.

```sh [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/keys/passphrase.txt]
$ echo -n password > docker/val-alice/keys/passphrase.txt
```

Because with this prod simulation you care less about safety, so much less in fact, you can even keep the mnemonic on file too.

Do the same for `val-bob`:

```sh
$ mkdir -p docker/val-bob/keys
$ echo -n password > docker/val-bob/keys/passphrase.txt
$ docker run --rm -it \
    -v $(pwd)/docker/val-bob:/root/.checkers \
    checkersd_i \
    keys \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    add bob
```

### Alice's consensus key on the KMS

To get the KMS to work, you have to:

* Prepare the KMS.
* Import Alice's consensus key into the KMS' `softsign` _device_.
* Have the KMS and the node talk to each other.

### Prepare the KMS

As per [the documentation](https://github.com/iqlusioninc/tmkms/tree/v0.12.2#configuration-tmkms-init), initialize the KMS folder:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/kms-alice:/root/tmkms \
    tmkms_i:v0.12.2 \
    init /root/tmkms
```

In the newly-created `kms-alice/tmkms.toml` file:

1. Make sure that you use the right protocol version. In your case:
  
    <CodeGroup>

    <CodeGroupItem title="TOML">

    ```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/kms-alice/tmkms.toml#L27]
    [[validator]]
    ...
    protocol_version = "v0.34"
    ```

    </CodeGroupItem>

    <CodeGroupItem title="One-liner">

    ```sh
    $ docker run --rm -i \
      -v $(pwd)/docker/kms-alice:/root/tmkms \
      --entrypoint sed \
      tmkms_i:v0.12.2 \
      -Ei 's/^protocol_version = .*$/protocol_version = "v0.34"/g' \
      /root/tmkms/tmkms.toml
    ```

    </CodeGroupItem>
    
    </CodeGroup>

2. Pick an expressive name for the file that will contain the `softsign` key for `val-alice`:

    <CodeGroup>

    <CodeGroupItem title="TOML">

    ```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/kms-alice/tmkms.toml#L19]
    [[providers.softsign]]
    ...
    path = "/root/tmkms/secrets/val-alice-consensus.key"
    ```

    </CodeGroupItem>

    <CodeGroupItem title="One-liner">

    ```sh
    $ docker run --rm -i \
      -v $(pwd)/docker/kms-alice:/root/tmkms \
      --entrypoint sed \
      tmkms_i:v0.12.2 \
      -Ei 's/path = "\/root\/tmkms\/secrets\/cosmoshub-3-consensus.key"/path = "\/root\/tmkms\/secrets\/val-alice-consensus.key"/g' \
      /root/tmkms/tmkms.toml
    ```

    </CodeGroupItem>
    
    </CodeGroup>

3. Replace `cosmoshub-3` with `checkers-1`, the name of your blockchain, wherever the former appears:

    <CodeGroup>

    <CodeGroupItem title="TOML">

    ```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/kms-alice/tmkms.toml#L24]
    [[chain]]
    id = "checkers-1"
    ...
    [[providers.softsign]]
    chain_ids = ["checkers-1"]
    ...
    [[validator]]
    chain_id = "checkers-1"
    ```

    </CodeGroupItem>

    <CodeGroupItem title="One-liner">

    ```sh
    $ docker run --rm -i \
        -v $(pwd)/docker/kms-alice:/root/tmkms \
        --entrypoint sed \
        tmkms_i:v0.12.2 \
        -Ei 's/cosmoshub-3/checkers-1/g' /root/tmkms/tmkms.toml
    ```

    </CodeGroupItem>
    
    </CodeGroup>

### Import the consensus key

Now you need to import `val-alice`'s consensus key in `secrets/val-alice-consensus.key`.

The private key will no longer be needed on `val-alice`. However, during the genesis creation Alice will need access to her consensus public key. Save it in a new [`pub_validator_key.json`](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/config/pub_validator_key.json) without any new line:

```sh
$ docker run --rm -t \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    tendermint show-validator \
    | tr -d '\n' | tr -d '\r' \
    > docker/val-alice/config/pub_validator_key.json
```

The consensus private key should not reside on the validator. You can simulate that by moving it out:

```sh
$ mv docker/val-alice/config/priv_validator_key.json \
  docker/kms-alice/secrets/priv_validator_key-val-alice.json
```

Import it into the `softsign` "device" as defined in [`tmkms.toml`](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/kms-alice/tmkms.toml#L19):

```sh
$ docker run --rm -i \
    -v $(pwd)/docker/kms-alice:/root/tmkms \
    -w /root/tmkms \
    tmkms_i:v0.12.2 \
    softsign import secrets/priv_validator_key-val-alice.json \
    secrets/val-alice-consensus.key
```

On start, `val-alice` may still recreate a missing private key file due to how defaults are handled in the code. To prevent that, you can instead copy it from `sentry-alice` where it has no value.

```sh
$ cp docker/sentry-alice/config/priv_validator_key.json \
    docker/val-alice/config/
```

With the key created you now set up the connection from `kms-alice` to `val-alice`.

### Set up the KMS connection

Choose a port unused on `val-alice`, for instance `26659`, and inform `kms-alice`:

<CodeGroup>

<CodeGroupItem title="TOML">

```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/kms-alice/tmkms.toml#L25]
[[validator]]
...
addr = "tcp://val-alice:26659"
```

</CodeGroupItem>

<CodeGroupItem title="One-liner">

```sh
$ docker run --rm -i \
    -v $(pwd)/docker/kms-alice:/root/tmkms \
    --entrypoint sed \
    tmkms_i:v0.12.2 \
    -Ei 's/^addr = "tcp:.*$/addr = "tcp:\/\/val-alice:26659"/g' /root/tmkms/tmkms.toml
```
  
</CodeGroupItem>

</CodeGroup>

<!--
  TODO: how do we add an id? Like
  addr = "tcp://f2673103417334a839f5c20096909c3023ba4903@val-alice:26659"
  Otherwise, you could be signing blocks submitted by a malicious actor.
-->

In the above, `val-alice` is the future network name of Alice's validator, and it will indeed be resolved to an IP address via Docker's internal DNS. In a real production setup, you would use a fully resolved IP address to avoid the vagaries of DNS.

Do not forget, you must inform Alice's validator that it should indeed listen on port `26659`. In `val-alice/config/config.toml`:

<CodeGroup>

<CodeGroupItem title="TOML">

```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/config/config.toml#L68]
priv_validator_laddr = "tcp://0.0.0.0:26659"
```

</CodeGroupItem>

<CodeGroupItem title="One-liner">

```sh
$ docker run --rm -i \
  -v $(pwd)/docker/val-alice:/root/.checkers \
  --entrypoint sed \
  checkersd_i \
  -Ei 's/priv_validator_laddr = ""/priv_validator_laddr = "tcp:\/\/0.0.0.0:26659"/g' \
  /root/.checkers/config/config.toml
```

</CodeGroupItem>

</CodeGroup>

<HighlightBox type="note">

Make it listen on an IP address that is within the KMS private network.

</HighlightBox>

`0.0.0.0` represents all addresses of the node. In a real production setup, you would choose the IP address of the network card that is on the network common with `kms-alice`.

* Make sure it will not look for the consensus key on file:

<CodeGroup>

<CodeGroupItem title="TOML">

```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/config/config.toml#L61]
# priv_validator_key_file = "config/priv_validator_key.json"
```

</CodeGroupItem>

<CodeGroupItem title="One-liner">

```sh
$ docker run --rm -i \
  -v $(pwd)/docker/val-alice:/root/.checkers \
  --entrypoint sed \
  checkersd_i \
  -Ei 's/^priv_validator_key_file/# priv_validator_key_file/g' \
  /root/.checkers/config/config.toml
```

</CodeGroupItem>

</CodeGroup>

* Make sure it will not look for the consensus state file either, as this is taken care of by the KMS:

<CodeGroup>

<CodeGroupItem title="TOML">

```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/config/config.toml#L64]
# priv_validator_state_file = "data/priv_validator_state.json"
```

</CodeGroupItem>

<CodeGroupItem title="One-liner">

```sh
$ docker run --rm -i \
  -v $(pwd)/docker/val-alice:/root/.checkers \
  --entrypoint sed \
  checkersd_i \
  -Ei 's/^priv_validator_state_file/# priv_validator_state_file/g' \
  /root/.checkers/config/config.toml
```

</CodeGroupItem>

</CodeGroup>

Before moving on, make sure that the validator still has a `priv_validator_key.json` because the code may complain if the file cannot be found. You can copy the key from `sentry-alice`, which does not present any risk:

```sh
$ cp docker/sentry-alice/config/priv_validator_key.json \
    docker/val-alice/config
```

### Genesis

With the keys in you can start fleshing out the genesis, which is already created.

You need to:

1. Set up the chain ID.
2. Add the initial balances.
3. Add the initial validator stakes.
4. Distribute the genesis file to all relevant nodes.

### Set up chain ID

Earlier you chose `checkers-1`, so you adjust it here too:

<CodeGroup>

<CodeGroupItem title="JSON">

```json [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/config/genesis.json#L3]
"chain_id": "checkers-1",
```

</CodeGroupItem>

<CodeGroupItem title="One-liner">

```sh
$ docker run --rm -i \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    --entrypoint sed \
    checkersd_i \
    -Ei 's/"chain_id": "checkers"/"chain_id": "checkers-1"/g' \
    /root/.checkers/config/genesis.json
```

</CodeGroupItem>

</CodeGroup>

### Initial balances

In this setup, Alice starts with 1,000 PAWN and Bob with 500 PAWN, of which Alice stakes 60 and Bob 40. With these amounts, the network cannot start if either of them is offline. Get their respective addresses:

```sh
$ ALICE=$(echo password | docker run --rm -i \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    keys \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    show alice --address)
```

Replace `password` with the passphrase you picked when creating the keys.

Have Alice add her initial balance in the genesis:

```sh
$ docker run --rm -it \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    add-genesis-account $ALICE 1000000000upawn
```

Now move the genesis file to `val-bob`. This mimics what would happen in a real-life setup:

```sh
$ mv docker/val-alice/config/genesis.json \
    docker/val-bob/config/
```

Have Bob add his own initial balance:

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

### Initial stakes

Alice and Bob both have initial stakes that they define via genesis transactions. You create them.

#### Bob's stake

Bob is not using the Tendermint KMS but instead uses the validator key on file. Bob appears in second position in `app_state.accounts`, so his `account_number` ought to be `1`, but it is in fact written as `0`, so you use `0`:

```sh
$ echo password | docker run --rm -i \
    -v $(pwd)/docker/val-bob:/root/.checkers \
    checkersd_i \
    gentx bob 40000000upawn \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    --account-number 0 --sequence 0 \
    --chain-id checkers-1 \
    --gas 1000000 \
    --gas-prices 0.1upawn
```

Again, insert Bob's chosen passphrase instead of `password`. Return the genesis to Alice:

```sh
$ mv docker/val-bob/config/genesis.json \
    docker/val-alice/config/
```

It is Alice's turn to add her staking transaction.

#### Alice's stake

Create Alice's genesis transaction using the specific validator public key that you saved on file, and not the key that would be taken from `priv_validator_key.json` by default (and is now missing):

```sh
$ echo password | docker run --rm -i \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    gentx alice 60000000upawn \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    --account-number 0 --sequence 0 \
    --pubkey $(cat docker/val-alice/config/pub_validator_key.json) \
    --chain-id checkers-1 \
    --gas 1000000 \
    --gas-prices 0.1upawn
```

<HighlightBox type="note">

It is useful to know this `--pubkey` method. If you were using a hardware key located on the KMS, this would be the canonical way of generating your genesis transaction.

</HighlightBox>

### Genesis assembly

With the two initial staking transactions created, have Alice include both of them in the genesis:

```sh
$ cp docker/val-bob/config/gentx/gentx-* \
    docker/val-alice/config/gentx
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

### Genesis distribution

All the nodes that will run the executable need the final version of the genesis. Copy it across:

<CodeGroup>

<CodeGroupItem title="Separate commands">

```sh
$ cp docker/val-alice/config/genesis.json docker/node-carol/config
$ cp docker/val-alice/config/genesis.json docker/sentry-alice/config
$ cp docker/val-alice/config/genesis.json docker/sentry-bob/config
$ cp docker/val-alice/config/genesis.json docker/val-bob/config
```

</CodeGroupItem>

<CodeGroupItem title="One-liner">

```sh
$ echo -e node-carol'\n'sentry-alice'\n'sentry-bob'\n'val-bob \
    | xargs -I {} \
    cp docker/val-alice/config/genesis.json docker/{}/config
```

</CodeGroupItem>

</CodeGroup>

## Network preparation

Because the validators are on a private network and fronted by sentries, you need to set up the configuration of each node so they can find each other; also to make sure that the sentries keep the validators' addresses private. What are the nodes' public keys? For instance, for `val-alice`, it is:

```sh
$ docker run --rm -i \
    -v $(pwd)/docker/val-alice:/root/.checkers \
    checkersd_i \
    tendermint show-node-id
```

This returns something like:

```txt
f2673103417334a839f5c20096909c3023ba4903
```

### Set up Alice's sentry

The nodes that have access to `val-alice` should know Alice's sentry by this identifier:

```txt
f2673103417334a839f5c20096909c3023ba4903@val-alice:26656
```

Where:

* `val-alice` will be resolved via Docker's DNS.
* `26656` is the port as found in `val-alice`'s configuration:

  ```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/config/config.toml#L202]
  laddr = "tcp://0.0.0.0:26656"
  ```

In the case of `val-alice`, only `sentry-alice` has access to it. Moreover, this is a persistent node. So you add it in `sentry-alice`'s configuration:

```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/sentry-alice/config/config.toml#L215]
persistent_peers = "f2673103417334a839f5c20096909c3023ba4903@val-alice:26656"
```

`sentry-alice` also has access to `sentry-bob` and `node-carol`, although these nodes should probably not be considered persistent. You will add them under `"seeds"`. First, collect the same information from these nodes:

```sh
$ docker run --rm -i \
    -v $(pwd)/docker/sentry-bob:/root/.checkers \
    checkersd_i \
    tendermint show-node-id
$ docker run --rm -i \
    -v $(pwd)/docker/node-carol:/root/.checkers \
    checkersd_i \
    tendermint show-node-id
```

Eventually, in `sentry-alice`, you should have:

```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/sentry-alice/config/config.toml#L212-L215]
seeds = "7009cc51174dce87c31f537fe8fed906349a27f4@sentry-bob:26656,8f1bafad62a4a1f8678214d96a8b2ae2ed140cf7@node-carol:26656"
persistent_peers = "f2673103417334a839f5c20096909c3023ba4903@val-alice:26656"
```

Before moving on to other nodes, remember that `sentry-alice` should keep `val-alice` secret. Set:

```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/sentry-alice/config/config.toml#L261]
private_peer_ids = "f2673103417334a839f5c20096909c3023ba4903"
```

### Other nodes

Repeat the procedure for the other nodes, taking into account their specific circumstances:

* `val-alice`'s:
  
    ```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-alice/config/config.toml#L215]
    persistent_peers = "83144b58031953ad60eaccb0a790955450f1ddef@sentry-alice:26656"
    ```

* `val-bob`'s:

    ```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/val-bob/config/config.toml#L215]
    persistent_peers = "7009cc51174dce87c31f537fe8fed906349a27f4@sentry-bob:26656"
    ```

* `sentry-bob`'s:

    ```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/sentry-bob/config/config.toml#L212-L215]
    seeds = "83144b58031953ad60eaccb0a790955450f1ddef@sentry-alice:26656,8f1bafad62a4a1f8678214d96a8b2ae2ed140cf7@node-carol:26656"
    persistent_peers = "1e0d99ccf83b49e7aca852e82074c8e7f0e99d73@val-bob:26656"
    private_peer_ids = "1e0d99ccf83b49e7aca852e82074c8e7f0e99d73"
    ```

* `node-carol`'s:

    ```toml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/node-carol/config/config.toml#L212]
    seeds = "83144b58031953ad60eaccb0a790955450f1ddef@sentry-alice:26656,7009cc51174dce87c31f537fe8fed906349a27f4@sentry-bob:26656"
    ```

<HighlightBox type="note">

For the avoidance of doubt, `sentry-alice` has a different address depending on which node resolves the address:

* When it is resolved from `val-alice`, the resolution takes place in `net-alice`.
* When it is resolved from `sentry-bob`, the resolution takes place in `net-public`.

</HighlightBox>

### Open Carol's node

Carol created her node to open it to the public. Make sure that her node's RPC listens on all IP addresses:

<CodeGroup>

<CodeGroupItem title="TOML">

```json [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/node-carol/config/config.toml#L91]
laddr = "tcp://0.0.0.0:26657"
```

</CodeGroupItem>

<CodeGroupItem title="One-liner">

```sh
$ docker run --rm -i \
    -v $(pwd)/docker/node-carol:/root/.checkers \
    --entrypoint sed \
    checkersd_i \
    -Ei '0,/^laddr = .*$/{s/^laddr = .*$/laddr = "tcp:\/\/0.0.0.0:26657"/}' \
    /root/.checkers/config/config.toml
```

Note that it has to replace only the first occurrence in the whole.

</CodeGroupItem>

</CodeGroup>

## Compose elements

You have prepared:

* The basic Docker elements
* The blockchain elements
* The network elements

Time to assemble them in Compose.

### The executables that run

You define the different containers as `services`. Important elements to start with are:

* In `container_name`, you use names that make them intelligible and match the names you used in the above preparations.
* In `image`, you declare the Docker image to use.
* In `command`, you define the command to use when launching the image.

In a new [`docker-compose.yml`](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker-compose.yml), write:

```yaml
version: "3.7"

services:

  kms-alice:
    command: start --config /root/tmkms/tmkms.toml
    container_name: kms-alice
    image: tmkms_i:v0.12.2

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

You are going to further refine the service definitions next, starting with the disk volumes.

### The data each container needs

Each container needs to access its own private folder, prepared earlier, and only that folder. Declare the volume mappings:

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

The user-defined networks need to mimic the desired separation of machines/containers can be self-explanatorily declared as:

```yaml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker-compose.yml#L3-L7]
networks:
  net-alice-kms:
  net-alice:
  net-bob:
  net-public:
```

With the network declaration done, the associating of each computer to each network can be written as:

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

### Additional settings

The KMS connects to the node and can reconnect. So have `val-alice` start after `kms-alice`:

```yaml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker-compose.yml#L25-L26]
services:

  val-alice:
    ...
    depends_on:
      - kms-alice
```

With all these computers on their Docker networks, you may still want to access one of them to query the blockchain, or to play games. In order to make your host computer look like an open node, expose Carol's node on all addresses of your host:

```yaml [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker-compose.yml#L69-L70]
services:

  node-carol:
    ...
    ports:
      - 0.0.0.0:26657:26657
```

### Launching Compose

<HighlightBox type="tip">

After this long preparation, before launch, it could be a good time to make a Git commit so that you can restore easily.

</HighlightBox>

You are now ready to start your setup with a name other than the folder it is running in:

```sh
$ docker compose --project-name checkers-prod up --detach
```

At this point, it should be apparent that you need to update `.gitignore`. Add:

```gitignore [https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/.gitignore#L4-L7]
build/
docker/*/config/addrbook.json
docker/*/data/*
!docker/*/data/priv_validator_state.json
```

Note how `priv_validator_state.json` is necessary if you want to try again on another host, otherwise, it would be ignored by Git.

### Interacting with Compose

Your six containers are running. To monitor their status, and confirm that they are running, use the provided Docker container interface.

Now you can connect to `node-carol` to start interacting with the blockchain as you would a normal node. For instance, to ask a simple `status`:

<CodeGroup>

<CodeGroupItem title="Local Mac">

```sh
$ ./build/checkersd-darwin-amd64 status \
    --node "tcp://localhost:26657"
```

</CodeGroupItem>

<CodeGroupItem title="Windows Powershell">

```sh
> ./build/checkersd-windows-amd64 status \
     --node "tcp://localhost:26657"
```

</CodeGroupItem>

<CodeGroupItem title="In net-public">

```sh
$ docker run --rm -it \
    --network checkers-prod_net-public \
    checkersd_i status \
    --node "tcp://node-carol:26657"
```

Note how the `net-public` network name is prefixed with the Compose project name.

</CodeGroupItem>

<CodeGroupItem title="In plain Docker">

```sh
$ docker run --rm -it \
    checkersd_i status \
    --node "tcp://192.168.0.2:26657"
```

Here you would replace `192.168.0.2` with the actual IP address of your host computer.

</CodeGroupItem>

</CodeGroup>

---

From this point on everything you already know how to do, such as connecting to your local node, applies.

Whenever you submit a transaction to `node-carol`, it will be propagated to the sentries and onward to the validators.

At this juncture, you may ask: Is it still possible to run a full game in almost a single block as you did earlier in the CosmJS integration tests? After all, when `node-carol` passes on the transactions as they come, it is not certain that the recipients will honor the order in which they were received. Of course, they make sure to order Alice's transactions, thanks to the `sequence`, as well as Bob's. But do they keep the A-B-A-B...order in which they were sent?

To find out:

* Update `client/.env` so that:
    * You connect within `net-public` to [`RPC_URL="http://node-carol:26657"`](https://github.com/cosmos/academy-checkers-ui/blob/server-indexing/.env#L1).
    * You use the Alice and Bob of this document as the CosmJS _test_ Alice and Bob. Copy the content of `docker/val-alice/keys/mnemonic-alice.txt` into `client/.env`'s [`MNEMONIC_TEST_ALICE`](https://github.com/cosmos/academy-checkers-ui/blob/server-indexing/.env#L3). Then do the same for Bob.
    * Update the [`ADDRESS_TEST_ALICE`](https://github.com/cosmos/academy-checkers-ui/blob/server-indexing/.env#L4) address to contain the correct ones, and repeat the same for Bob.
* Skip the call to the (Ignite) faucet by adding a `return` in the relevant `before` in the test file:

  ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/server-indexing/test/integration/stored-game-action.ts#L63]
  before("credit test accounts", async function () {
      return
      ...
  }
  ```

* Double all the timeouts. For instance:

    ```typescript [https://github.com/cosmos/academy-checkers-ui/blob/server-indexing/test/integration/stored-game-action.ts#L84]
    this.timeout(10_000) // instead of 5_000
    ```

* Text-replace all the [`token`](https://github.com/cosmos/academy-checkers-ui/blob/server-indexing/test/integration/stored-game-action.ts#L89) with `upawn`.

* Launch the lot within `net-public`:

  ```sh
  $ docker run --rm -it \
      -v $(pwd)/client:/client -w /client \
      --network checkers-prod_net-public \
      node:18.7 \
      npm test
  ```

  Tests should pass. _Should_ as in there is no protocol guarantee that they will, but it looks like they do.

### Stopping Compose

To stop your whole setup, run:

```sh
$ docker compose --project-name checkers-prod down
```

<ExpansionPanel title="Troubleshooting">

<PanelListItem number="1">

You may encounter an error such as:

```txt
Error: error during handshake: error on replay: validator set is nil in genesis and still empty after InitChain
```

If encountering this or other errors, you may want to do a state reset on all nodes:

```sh
$ echo -e node-carol'\n'sentry-alice'\n'sentry-bob'\n'val-alice'\n'val-bob \
    | xargs -I {} \
    docker run --rm -i \
    -v $(pwd)/docker/{}:/root/.checkers \
    checkersd_i \
    tendermint unsafe-reset-all \
    --home /root/.checkers
```

</PanelListItem>

<PanelListItem number="2">

If one of your services (for example, `sentry-bob`) fails to start because it could not resolve one of the other containers, you can restart that service independently with:

```sh
$ docker compose restart sentry-bob
```

</PanelListItem>

<PanelListItem number="3">

If you want to get more detailed errors from your KMS, you can add a flag in its service definition:

```yaml
services:

  kms-alice:
    ...
    environment:
      - RUST_BACKTRACE=1
```

</PanelListItem>

<PanelListItem number="4" :last="true">

If you want to erase all states after a good run, and if you have a Git commit from which to restore the state files, you can create a [new script](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/docker/unsafe-reset-state.sh) for that.

</PanelListItem>

</ExpansionPanel>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to prepare Docker images.
* How to prepare nodes for a simulated production setup.
* How to prepare a Tendermint Key Management System for a simulated production setup.
* How to prepare a blockchain genesis with multiple parties.
* How to launch all that with the help of Docker Compose.

</HighlightBox>
