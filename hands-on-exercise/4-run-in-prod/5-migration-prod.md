---
title: "Simulate a migration in production in Docker"
order: 6
description: Introduce the leaderboard in a simulated production setup with Docker Compose
tags: 
  - guided-coding
  - cosmos-sdk
  - dev-ops
---

# Simulate a migration in Docker

<HighlightBox type="prerequisite">

Make sure you have all you need before proceeding:

* You understand the concepts of [migrations](/academy/2-cosmos-concepts/13-migrations.md), [production](/tutorials/9-path-to-prod/index.md), and [migrations in production](/tutorials/9-path-to-prod/7-migration.md).
* Docker is installed and you [understand it](/tutorials/5-docker-intro/index.md).
* You have the checkers blockchain codebase up to the migrations. If not, follow the [previous steps](/hands-on-exercise/4-run-in-prod/4-migration-leaderboard.md) or check out the [relevant version](https://github.com/cosmos/b9-checkers-academy-draft/tree/leaderboard-migration).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Prepare Docker elements.
* Deal with data migrations.
* Upgrade your blockchain in production with Cosmovisor.
* Compose everything in one orchestrated ensemble.
* Test it.

</HighlightBox>

In previous sections, you have:

* Simulated a production setup with the help of Docker Compose.
* Learned how to implement an in-place migration.

This section is about:

* Running an in-place migration...
* ...in a simulated production setup...
* ...with the help of Docker Compose.

You will reuse the nodes, validators, and sentries created for Alice, Bob, and Carol in a [previous section](/hands-on-exercise/4-run-in-prod/1-run-prod-docker.md).

## What to expect

In this section, you will accomplish the following steps:

1. Build the checkers v2 software.
2. Build the checkers v1.1 software.
3. Build the checkers v1 software.
4. Build Cosmovisor and set it up for two consecutive known upgrades on all nodes.
5. Launch everything.
6. Create the first upgrade governance proposal, `v1tov1_1`.
7. Have the first proposal pass.
8. Repeat with the second upgrade governance proposal, `v1_1tov2`.
9. Observe the first migration take place.
10. Have the second proposal pass.
11. Observe the second migration take place.
12. Stop everything and start it again safely in v2.

In a real production situation, node operators would wait for a named upgrade governance proposal to be on the ballot (if not wait for it to be approved) before they went to the trouble of setting up Cosmovisor; therefore point 6 would happen some time before points 2 and 4. However, because we know that the proposal will go through, we will use the above order in the interest of time.

Also, both proposals will be created before the first upgrade, and the second proposal with be _passed_ after the first upgrade. That is in the interest of the exercise, so as to see the second proposal cross the first upgrade in its pending state.

## Prepare checkers executables

At this stage, your checkers code already has the migration elements. It is therefore in its v2 configuration. Create the corresponding Docker image:

```sh
$ docker build . \
    -f prod-sim/Dockerfile-checkersd-alpine \
    -t checkersd_i:v2-alpine
```

To build v1 and v1.1, you first need to check out the code before the migration code steps were added. Depending on your branch names, this would be:

<CodeGroup>

<CodeGroupItem title="Build v1.1">

```sh [https://github.com/cosmos/b9-checkers-academy-draft/tree/player-info-migration]
$ git checkout player-info-migration
$ docker build . \
    -f prod-sim/Dockerfile-checkersd-alpine \
    -t checkersd_i:v1.1-alpine
```

</CodeGroupItem>

<CodeGroupItem title="Build v1">

```sh [https://github.com/cosmos/b9-checkers-academy-draft/tree/run-prod]
$ git checkout run-prod
$ docker build . \
    -f prod-sim/Dockerfile-checkersd-alpine \
    -t checkersd_i:v1-alpine
```

</CodeGroupItem>

</CodeGroup>

Do not forget to come back to your v2 branch. For instance with:

```sh
$ git checkout leaderboard-migration
```

## Blockchain elements

Your genesis elements should still be in v1 as they were created in the `run-prod` branch. You can confirm this by verifying that there are no player infos and no leaderboards in the [checkers genesis store](https://github.com/cosmos/b9-checkers-academy-draft/blob/run-prod/prod-sim/node-carol/config/genesis.json#L85).

As you did in the [migration section](/hands-on-exercise/4-run-in-prod/2-migration.md), you need to reduce the voting period from 2 days to 10 minutes to make the exercise bearable:

```sh
$ jq -j '.app_state.gov.voting_params.voting_period = "600s"' prod-sim/desk-alice/config/genesis.json > prod-sim/desk-alice/config/genesis-2.json && mv prod-sim/desk-alice/config/genesis-2.json prod-sim/desk-alice/config/genesis.json
$ jq -j '.app_state.gov.voting_params.voting_period = "600s"' prod-sim/desk-bob/config/genesis.json > prod-sim/desk-bob/config/genesis-2.json && mv prod-sim/desk-bob/config/genesis-2.json prod-sim/desk-bob/config/genesis.json
$ jq -j '.app_state.gov.voting_params.voting_period = "600s"' prod-sim/sentry-alice/config/genesis.json > prod-sim/sentry-alice/config/genesis-2.json && mv prod-sim/sentry-alice/config/genesis-2.json prod-sim/sentry-alice/config/genesis.json
$ jq -j '.app_state.gov.voting_params.voting_period = "600s"' prod-sim/sentry-bob/config/genesis.json > prod-sim/sentry-bob/config/genesis-2.json && mv prod-sim/sentry-bob/config/genesis-2.json prod-sim/sentry-bob/config/genesis.json
$ jq -j '.app_state.gov.voting_params.voting_period = "600s"' prod-sim/val-alice/config/genesis.json > prod-sim/val-alice/config/genesis-2.json && mv prod-sim/val-alice/config/genesis-2.json prod-sim/val-alice/config/genesis.json
$ jq -j '.app_state.gov.voting_params.voting_period = "600s"' prod-sim/val-bob/config/genesis.json > prod-sim/val-bob/config/genesis-2.json && mv prod-sim/val-bob/config/genesis-2.json prod-sim/val-bob/config/genesis.json
$ jq -j '.app_state.gov.voting_params.voting_period = "600s"' prod-sim/node-carol/config/genesis.json > prod-sim/node-carol/config/genesis-2.json && mv prod-sim/node-carol/config/genesis-2.json prod-sim/node-carol/config/genesis.json
```

The names of the upgrade proposals will be `v1tov2_1` and `v1_1tov2`. The names are important, as they are defined in the code, and Cosmovisor uses them to determine which executable to run.

## Prepare the Cosmovisor executable

Because the project in its current state uses Cosmos SDK v0.45.4, to avoid any surprise you will prepare Cosmovisor at the [v0.45.4](https://docs.cosmos.network/v0.45/run-node/cosmovisor.html) version too.

You can describe the steps in a new Dockerfile `prod-sim/Dockerfile-cosmovisor-alpine`, described here logically (before a recap lower down):

1. You need to build Cosmovisor from its code:

    ```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration-prod/prod-sim/Dockerfile-cosmovisor-alpine#L1-L26]
    FROM --platform=linux golang:1.18.7-alpine AS builder

    ENV COSMOS_VERSION=v0.45.4

    RUN apk update
    RUN apk add make git

    WORKDIR /root
    RUN git clone --depth 1 --branch ${COSMOS_VERSION} https://github.com/cosmos/cosmos-sdk.git

    WORKDIR /root/cosmos-sdk/cosmovisor

    RUN make cosmovisor

    FROM --platform=linux alpine

    ENV LOCAL=/usr/local

    COPY --from=builder /root/cosmos-sdk/cosmovisor/cosmovisor ${LOCAL}/bin/cosmovisor
    ```

2. Cosmovisor is instructed via [environment variables](https://docs.cosmos.network/v0.45/run-node/cosmovisor.html#command-line-arguments-and-environment-variables). In the eventual containers, the `/root/.checkers` folder comes from a volume mount, so to avoid any conflict it is better not to put the `cosmovisor` folder directly inside it. Instead pick `/root/.checkers-upgrade`:

    ```diff [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration-prod/prod-sim/Dockerfile-cosmovisor-alpine#L21-L24]
        ...
        FROM --platform=linux alpine
        
        ENV LOCAL=/usr/local
    +  ENV DAEMON_HOME=/root/.checkers-upgrade
    +  ENV DAEMON_NAME=checkersd
    +  ENV DAEMON_ALLOW_DOWNLOAD_BINARIES=false
    +  ENV DAEMON_RESTART_AFTER_UPGRADE=true
        ...
    ```

3. With the folder decided, you can introduce all three checkers executables. They can be conveniently taken from their respective Docker images:

    ```diff [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration-prod/prod-sim/Dockerfile-cosmovisor-alpine#L15-L29]
    +  FROM --platform=linux checkersd_i:v1-alpine AS v1
    +  FROM --platform=linux checkersd_i:v1.1-alpine AS v1.1
    +  FROM --platform=linux checkersd_i:v2-alpine AS v2
        FROM --platform=linux alpine
        ...
        COPY --from=builder /root/cosmos-sdk/cosmovisor/cosmovisor ${LOCAL}/bin/cosmovisor
    +  COPY --from=v1 /usr/local/bin/checkersd $DAEMON_HOME/cosmovisor/genesis/bin/checkersd
    +  COPY --from=v1.1 /usr/local/bin/checkersd $DAEMON_HOME/cosmovisor/upgrades/v1tov1_1/bin/checkersd
    +  COPY --from=v2 /usr/local/bin/checkersd $DAEMON_HOME/cosmovisor/upgrades/v1tov2/bin/checkersd
        ...
    ```

    Checkers starts at v1, therefore the v1 executable goes into `.../genesis`. We know that:
    
    * The executable of the eventual upgrade named `v1tov1_1` is the v1.1 one.
    * The executable of the eventual upgrade named `v1_1tov2` is the v2 one.

    Note also the decision to use `/usr/local` explicitly, as this is knowledge that is kept in a separate Docker image.

4. Now make Cosmovisor start by default:

    ```diff [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration-prod/prod-sim/Dockerfile-cosmovisor-alpine#L31]
        COPY --from=v2 /usr/local/bin/checkersd $DAEMON_HOME/cosmovisor/upgrades/v1tov2/bin/checkersd

    +  ENTRYPOINT [ "cosmovisor" ]
    ```

When you put all this together, you get:

```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration-prod/prod-sim/Dockerfile-cosmovisor-alpine]
FROM --platform=linux golang:1.18.7-alpine AS builder

ENV COSMOS_VERSION=v0.45.4

RUN apk update
RUN apk add make git

WORKDIR /root
RUN git clone --depth 1 --branch ${COSMOS_VERSION} https://github.com/cosmos/cosmos-sdk.git

WORKDIR /root/cosmos-sdk/cosmovisor

RUN make cosmovisor

FROM --platform=linux checkersd_i:v1-alpine AS v1
FROM --platform=linux checkersd_i:v1.1-alpine AS v1.1
FROM --platform=linux checkersd_i:v2-alpine AS v2
FROM --platform=linux alpine

ENV LOCAL=/usr/local
ENV DAEMON_HOME=/root/.checkers-upgrade
ENV DAEMON_NAME=checkersd
ENV DAEMON_ALLOW_DOWNLOAD_BINARIES=false
ENV DAEMON_RESTART_AFTER_UPGRADE=true

COPY --from=builder /root/cosmos-sdk/cosmovisor/cosmovisor ${LOCAL}/bin/cosmovisor
COPY --from=v1 /usr/local/bin/checkersd $DAEMON_HOME/cosmovisor/genesis/bin/checkersd
COPY --from=v1.1 /usr/local/bin/checkersd $DAEMON_HOME/cosmovisor/upgrades/v1tov1_1/bin/checkersd
COPY --from=v2 /usr/local/bin/checkersd $DAEMON_HOME/cosmovisor/upgrades/v1_1tov2/bin/checkersd

ENTRYPOINT [ "cosmovisor" ]
```

Now you can create the Cosmovisor Docker image with a meaningful tag:

```sh
$ docker build . \
    -f prod-sim/Dockerfile-cosmovisor-alpine \
    -t cosmovisor_i:v1tov2-alpine
```

## Docker Compose elements

With the executables and the blockchain elements ready, you can now define the _production setup_. You already defined one in the previous [run checkers in prod section](/hands-on-exercise/4-run-in-prod/1-run-prod-docker.md). In this new setup, the only things that change are the Docker images you call: `cosmovisor_i` instead of `checkersd_i`. Even the `start` command does not need to change.

To avoid rewriting everything, you can declare a Docker Compose [extension](https://docs.docker.com/compose/extends/) in a new file `prod-sim/docker-compose-cosmovisor.yml`. Each `checkersd` type of service is extended, and in the end is replaced, with a new `image`:

```yaml [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration-prod/prod-sim/docker-compose-cosmovisor.yml]
version: "3.7"

services:

  val-alice:
    extends:
      file: docker-compose.yml
      service: val-alice
    image: cosmovisor_i:v1tov2-alpine

  sentry-alice:
    extends:
      file: docker-compose.yml
      service: sentry-alice
    image: cosmovisor_i:v1tov2-alpine

  val-bob:
    extends:
      file: docker-compose.yml
      service: val-bob
    image: cosmovisor_i:v1tov2-alpine

  sentry-bob:
    extends:
      file: docker-compose.yml
      service: sentry-bob
    image: cosmovisor_i:v1tov2-alpine

  node-carol:
    extends:
      file: docker-compose.yml
      service: node-carol
    image: cosmovisor_i:v1tov2-alpine
```

<HighlightBox type="note">

`docker-compose-cosmovisor.yml`'s `val-alice` extends `docker-compose.yml`'s `val-alice`, while keeping the same name. In effect this overwrites `val-alice`, instead of starting another validator working on the same shared `prod-sim/val-alice` folder.

</HighlightBox>

## Run all the elements

Now you can run everything and confirm that all services start:

```sh
$ docker compose \
    --file prod-sim/docker-compose.yml \
    --file prod-sim/docker-compose-cosmovisor.yml \
    --project-name checkers-prod up \
    --detach
```

In fact, at this stage there is no difference from the previous prod setup, which was what you now call v1. Blocks are being created.

Confirm you are on v1:

* One way to confirm is to use checkers v1.1 to query Carol's node for the player infos:

    ```sh
    $ docker run --rm -it \
        --network checkers-prod_net-public \
        checkersd_i:v1.1-alpine \
        query checkers list-player-info \
        --node "tcp://node-carol:26657"
    ```

    It returns:

    ```txt
    Error: rpc error: code = Unknown desc = unknown query path: unknown request
    ```

    This confirms that the anwering node does not know about such structure.

* Another way to confirm is to see to which folder Cosmovisor's `current` folder is symbolically linking:

    ```sh
    $ docker exec -it node-carol \
        ls -l /root/.checkers-upgrade/cosmovisor/current
    ```

    This should return:

    ```txt
    ... /root/.checkers-upgrade/cosmovisor/current -> /root/.checkers-upgrade/cosmovisor/genesis
    ```

    Again, this confirms that it is running v1, as found in `.../genesis`.

## Add games

You will now need Alice and Bob's addresses, so take them from the keyrings found on their respective _desktops_.

<CodeGroup>

<CodeGroupItem title="Alice">

```sh
$ alice=$(echo password | docker run --rm -i \
    -v $(pwd)/prod-sim/desk-alice:/root/.checkers \
    checkersd_i:v1-alpine \
    keys \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    show alice --address)
```

</CodeGroupItem>

<CodeGroupItem title="Bob">

```sh
$ bob=$(echo password | docker run --rm -i \
    -v $(pwd)/prod-sim/desk-bob:/root/.checkers \
    checkersd_i:v1-alpine \
    keys \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    show bob --address)
```

</CodeGroupItem>

</CodeGroup>

The CosmJS tests use `stake` and `token` whereas this production setup uses only `upawn`. So do a text-wise search and change all occurrences of `stake` and `token` to `upawn` in [`client/test/integration/stored-game-action.ts`](https://github.com/cosmos/academy-checkers-ui/blob/main/test/integration/stored-game-action.ts). Also remove the [`upawn: 1,`](https://github.com/cosmos/academy-checkers-ui/blob/main/test/integration/stored-game-action.ts#L56-L60) lines that prevent compilation.

Copying what you did it in [leaderboard migration section](/hands-on-exercise/4-run-in-prod/4-migration-leaderboard.md), credit the test accounts so that the CosmJS tests do not attempt to call a missing faucet:

```sh
$ echo password | docker run --rm -i \
    -v $(pwd)/prod-sim/desk-alice:/root/.checkers \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine tx bank \
    send $alice cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql 300upawn \
    --from $alice \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    --chain-id checkers-1 \
    --node http://node-carol:26657 \
    --broadcast-mode block --yes
$ echo password | docker run --rm -i \
    -v $(pwd)/prod-sim/desk-bob:/root/.checkers \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine tx bank \
    send $bob cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22 300upawn \
    --from $bob \
    --keyring-backend file --keyring-dir /root/.checkers/keys \
    --chain-id checkers-1 \
    --node http://node-carol:26657 \
    --broadcast-mode block --yes
```

Then run the tests. One run of the tests creates one completed game. It is ok do this multiple times:

```sh
$ docker run --rm -it \
    -v $(pwd)/client:/client \
    -w /client \
    --network checkers-prod_net-public \
    --env RPC_URL="http://node-carol:26657" \
    node:18.7-slim \
    npm test
```

Note how the `RPC_URL` is passed via an environment variable. This uses the fact that `dotenv`'s `config()` function does not overwrite existing variables.

The completed game will count for the future leaderboard.

## Prepare the upgrade proposals

Copying what was done in the [previous migration section](/hands-on-exercise/4-run-in-prod/2-migration.md#governance-proposal), with one block every 5 seconds, you make:

* The first upgrade proposal to be run in 15 minutes (i.e. 180 blocks).
* The second upgrade proposal to be run in 25 minutes (i.e. 300 blocks).

Remember that both proposals will have a voting period of 10 minutes, with the second one straddling the first upgrade:

* At _t=0_, the first proposal is in its voting period, for an upgrade 15 minutes later (_t=+15 min_).
* At _t=+10 min_, the first proposal should pass, and at about the same time, you create the second proposal (it does not matter if it is a bit before or a bit after), for an upgrade 15 minutes later (_t=+25 min_).
* At _t=+15 min_, the first upgrade happens automatically thanks to Cosmovisor. Now running v1.1.
* At _t=+20 min_, the second proposal should pass.
* At _t=+25 min_, the second upgrade happens. Now running v2.

Find the current block height with:

```sh
$ docker run --rm -it \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine status \
    --node "tcp://node-carol:26657" \
    | jq -r ".SyncInfo.latest_block_height"
```

This returns something like:

```txt
1000
```

### Send the first upgrade proposal

With a minimum deposit of 10,000,000 upawn, you can now have Alice send the governance proposal from her desktop to Carol's public node:

```sh
$ echo password | docker run --rm -i \
    -v $(pwd)/prod-sim/desk-alice:/root/.checkers \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine \
    tx gov submit-proposal software-upgrade v1tov1_1 \
    --node "tcp://node-carol:26657" \
    --title "v1_1tov2" \
    --description "First step - add player infos" \
    --upgrade-height 1180 \
    --deposit 10000000upawn \
    --from $alice --keyring-backend file --keyring-dir /root/.checkers/keys \
    --broadcast-mode block \
    --yes
```

The command is long but it makes sense when you look at it carefully. It returns you the proposal id:

```yaml
- attributes:
  - key: proposal_id
    value: "1"
  - key: proposal_type
    value: SoftwareUpgrade
  - key: voting_period_start
    value: "1"
```

### Vote on the first proposal

Have both Alice and Bob vote "yes" on the proposal:

<CodeGroup>

<CodeGroupItem title="Alice">

```sh
echo password | docker run --rm -i \
    -v $(pwd)/prod-sim/desk-alice:/root/.checkers \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine \
    tx gov vote 1 yes \
    --node "tcp://node-carol:26657" \
    --from $alice --keyring-backend file --keyring-dir /root/.checkers/keys \
    --yes
```

</CodeGroupItem>

<CodeGroupItem title="Bob">

```sh
echo password | docker run --rm -i \
    -v $(pwd)/prod-sim/desk-bob:/root/.checkers \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine \
    tx gov vote 1 yes \
    --node "tcp://node-carol:26657" \
    --from $bob --keyring-backend file --keyring-dir /root/.checkers/keys \
    --yes
```

</CodeGroupItem>

</CodeGroup>

### Refill your cup

Wait 10 minutes from the time you created the first proposal.

When the proposal voting period ends, check that the votes went through and what the latest block height is:

<CodeGroup>

<CodeGroupItem title="Votes">

```sh
$ docker run --rm -it \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine \
    query gov votes 1 \
    --node "tcp://node-carol:26657"
```

</CodeGroupItem>

<CodeGroupItem title="Period">

```sh
$ docker run --rm -it \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine \
    query gov proposal 1 \
    --node "tcp://node-carol:26657"
```

</CodeGroupItem>

<CodeGroupItem title="Block Height">

```sh
$ docker run --rm -it \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine status \
    --node "tcp://node-carol:26657" \
    | jq -r ".SyncInfo.latest_block_height"
```

</CodeGroupItem>

</CodeGroup>

The proposal's current status will be:

```txt
status: PROPOSAL_STATUS_VOTING_PERIOD
```

You must wait until after the proposal status changes to:

```txt
status: PROPOSAL_STATUS_PASSED
```

You must now wait longer, this time for the upgrade block to be reached. In the mean time...

### Send the second upgrade proposal

Between the time the first proposal has passed and the first upgrade takes place, you send the second proposal, this time by Bob:

```sh
$ echo password | docker run --rm -i \
    -v $(pwd)/prod-sim/desk-bob:/root/.checkers \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine \
    tx gov submit-proposal software-upgrade v1_1tov2 \
    --node "tcp://node-carol:26657" \
    --title "v1_1tov2" \
    --description "Leaderboard introduction" \
    --upgrade-height 1300 \
    --deposit 10000000upawn \
    --from $bob --keyring-backend file --keyring-dir /root/.checkers/keys \
    --broadcast-mode block \
    --yes
```

It returns you the second proposal id:

```yaml
- attributes:
  - key: proposal_id
    value: "2"
  - key: proposal_type
    value: SoftwareUpgrade
  - key: voting_period_start
    value: "2"
```

Similarly, you have Alice and Bob vote on it:

<CodeGroup>

<CodeGroupItem title="Alice">

```sh
echo password | docker run --rm -i \
    -v $(pwd)/prod-sim/desk-alice:/root/.checkers \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine \
    tx gov vote 2 yes \
    --node "tcp://node-carol:26657" \
    --from $alice --keyring-backend file --keyring-dir /root/.checkers/keys \
    --yes
```

</CodeGroupItem>

<CodeGroupItem title="Bob">

```sh
echo password | docker run --rm -i \
    -v $(pwd)/prod-sim/desk-bob:/root/.checkers \
    --network checkers-prod_net-public \
    checkersd_i:v1-alpine \
    tx gov vote 2 yes \
    --node "tcp://node-carol:26657" \
    --from $bob --keyring-backend file --keyring-dir /root/.checkers/keys \
    --yes
```

</CodeGroupItem>

</CodeGroup>

## The first live upgrade

If you are scanning the logs of one of the containers, for instance from Docker's GUI, you should see something like:

```txt
ERR UPGRADE "v1tov1_1" NEEDED at height: 1180:
INF starting node with ABCI Tendermint in-process
```

That was v1's last message followed by v1_1's first message.

After that, you should be able to query for the presence of player infos:

```sh
$ docker run --rm -it \
    --network checkers-prod_net-public \
    checkersd_i:v1.1-alpine \
    query checkers list-player-info \
    --node "tcp://node-carol:26657"
```

This should return:

```yaml
playerInfo:
- forfeitedCount: "0"
  index: cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql
  lostCount: "0"
  wonCount: "2"
- forfeitedCount: "0"
  index: cosmos1mql9aaux3453tdghk6rzkmk43stxvnvha4nv22
  lostCount: "2"
```

You can also confirm that the leaderboard is still missing:

```sh
$ docker run --rm -it \
    --network checkers-prod_net-public \
    checkersd_i:v2-alpine \
    query leaderboard show-leaderboard \
    --node "tcp://node-carol:26657"
```

Still returns:

```txt
Error: rpc error: code = Unknown desc = unknown query path: unknown request
```

You can verify with Cosmosvisor too that it is now running v1.1:

```sh
$ docker exec -it node-carol \
    ls -l /root/.checkers-upgrade/cosmovisor/current
```

Should return:

```txt
... /root/.checkers-upgrade/cosmovisor/current -> /root/.checkers-upgrade/cosmovisor/upgrade/v1tov1_1
```

## The second live upgrade

You can follow the status of the second proposal with:

```sh
$ docker run --rm -it \
    --network checkers-prod_net-public \
    checkersd_i:v1.1-alpine \
    query gov proposal 2 \
    --node "tcp://node-carol:26657"
```

And observe that it changes to `PASSED` after the first upgrade. After that, if you are scanning the logs of one of the containers, for instance from Docker's GUI, you should see something like:

```txt
ERR UPGRADE "v1_1tov2" NEEDED at height: 1300:
INF starting node with ABCI Tendermint in-process
```

That was v1.1's last message followed by v2's first message. You can confirm that the leaderboard has been populated:

```sh
$ docker run --rm -it \
    --network checkers-prod_net-public \
    checkersd_i:v2-alpine \
    query leaderboard show-leaderboard \
    --node "tcp://node-carol:26657"
```

Returns:

```yaml
Leaderboard:
  winners:
  - addedAt: "1683213831"
    address: cosmos1fx6qlxwteeqxgxwsw83wkf4s9fcnnwk8z86sql
    wonCount: "2"
```

## What about stop and restart?

All checkers containers are now running checkersd v2. You can see that Cosmovisor has swapped the `current` executable:

```sh
$ docker exec -it node-carol \
    ls -l /root/.checkers-upgrade/cosmovisor/current
```

This should return:

```txt
... /root/.checkers-upgrade/cosmovisor/current -> /root/.checkers-upgrade/cosmovisor/upgrade/v1_1tov2
```

It will return this **until the containers are stopped** and deleted, that is.

<HighlightBox type="warn">

Remember that the containers are loaded from a Docker image configured with Cosmovisor. In the current configuration, Cosmovisor starts with what it finds at `genesis/bin/checkersd`, i.e. v1.
<br/><br/>
All this is to say that you should not expect it to work if you stop and start your Cosmovisor Compose setup as is.

</HighlightBox>

If you were using real production servers, Cosmovisor's symbolic link would not reset itself on restart, so you would be safe in this regard. You would have time to revisit your server's configuration so as to launch `checkersd` v2 natively.

In this example you can prepare yet another Compose file, this time specifically for v2:

```yaml [https://github.com/cosmos/b9-checkers-academy-draft/blob/migration-prod/prod-sim/docker-compose-v2.yml]
version: "3.7"

services:

  val-alice:
    extends:
      file: docker-compose.yml
      service: val-alice
    image: checkersd_i:v2-alpine

  sentry-alice:
    extends:
      file: docker-compose.yml
      service: sentry-alice
    image: checkersd_i:v2-alpine

  val-bob:
    extends:
      file: docker-compose.yml
      service: val-bob
    image: checkersd_i:v2-alpine

  sentry-bob:
    extends:
      file: docker-compose.yml
      service: sentry-bob
    image: checkersd_i:v2-alpine

  node-carol:
    extends:
      file: docker-compose.yml
      service: node-carol
    image: checkersd_i:v2-alpine
```

Now you can safely stop the Cosmovisor setup:

```sh
$ docker compose --project-name checkers-prod down
```

And start the v2 setup:

```sh
$ docker compose \
    --file prod-sim/docker-compose.yml \
    --file prod-sim/docker-compose-v2.yml \
    --project-name checkers-prod up \
    --detach
```

<HighlightBox type="note">

If you want to test other migration configurations, for instance where Carol _forgot_ to put Cosmovisor on her node, you can revert all your blockchain files to v1 with:

```sh
$ ./prod-sim/unsafe-reset-state.sh
```

Another exercise you can attempt is create a `v1tov2` upgrade that does **both** upgrades in one go. You would have to add this `v1tov2` name into the Go code, and make sure it is handled correctly.

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to prepare multi-stage Docker images for different executable versions.
* How to prepare Cosmovisor for a simulated production migration.
* How to upgrade a blockchain in production, by live migrating from v1 of the blockchain to v1.1 and then v2.
* How to launch all that with the help of Docker Compose.
* A complete procedure for how to conduct the update via the CLI.

</HighlightBox>
