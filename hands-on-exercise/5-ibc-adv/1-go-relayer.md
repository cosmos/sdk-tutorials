---
title: "Go Relayer"
order: 2
description: Relayer implementation in Golang
tags:
  - guided-coding
  - ibc
  - dev-ops
---

# Go Relayer

<HighlightBox type="prerequisite">

Before you dive into Go relayers, make sure to:

* Install Go.
* Install Docker.
* Install Rust.

For all installations, please see the [setup page](/tutorials/2-setup/index.md).

</HighlightBox>

<HighlightBox type="learning">

Have you considered running a relayer?
<br/><br/>
In this section, you will learn:

* How to get started with the Go relayer.
* Basic Go relayer commands.

</HighlightBox>

[The Go relayer](https://github.com/cosmos/relayer) is a relayer implementation written in Golang. It can create clients, connections, and channels, as well as relay packets and update and upgrade clients.

The Go relayer aims to get your relayer up and running with minimal manual configuration and abstracts away a lot of the more complex Inter-Blockchain Communication Protocol (IBC) concepts. The objective is that users can spin up their own relayer and relay packets. To provide this functionality, it automates a lot of work to fetch configuration data from the [chain registry](https://github.com/cosmos/chain-registry).

After the installation, you will get started with relaying on mainnet chains and do some local testing.

## Installation and getting started

The repository offers a script to start two chains, which you need to test the relayer.

<!-- TODO: once testing locally has been updated, change this text -->

<HighlightBox type="note">

The most up-to-date major version of the Go relayer is v2. This version delivered major updates and improvements, including the introduction of a provider interface to accommodate chains with different consensus types than CometBFT and event-based processing that results in performance improvements.
<br/><br/>
It is recommended to use this latest version, and the following commands assume you are using v2.

</HighlightBox>

1. First, create a folder for this section:

  ```sh
  $ mkdir relay-go-test
  $ cd relay-go-test
  ```

2. Clone the [Go relayer repository](https://github.com/cosmos/relayer):

  ```sh
  $ git clone https://github.com/cosmos/relayer.git
  ```

3. Now build the Go relayer:

  ```sh
  $ cd relayer
  $ git checkout v2.4.2
  $ make install
  ```

Make sure that your `$GOPATH` is set correctly and `$GOPATH/bin` is included in your `$PATH`.

To check the available commands, run the help command on the `rly` binary.

```sh
$ rly -h
```

Which returns:

```txt
rly has:
   1. Configuration management for Chains and Paths
   2. Key management for managing multiple keys for multiple chains
   3. Query and transaction functionality for IBC

   NOTE: Most of the commands have aliases that make typing them much quicker
         (i.e. 'rly tx', 'rly q', etc...)

Usage:
  rly [command]

Available Commands:
  config      Manage configuration file
  chains      Manage chain configurations
  paths       Manage path configurations
  keys        Manage keys held by the relayer for each chain

  transact    IBC transaction commands
  query       IBC query commands
  start       Start the listening relayer on a given path

  version     Print the relayer version info
  help        Help about any command
  completion  Generate the autocompletion script for the specified shell

Flags:
  -d, --debug               debug output
  -h, --help                help for rly
      --home string         set home directory (default "/Users/<userName>/.relayer")
      --log-format string   log output format (auto, logfmt, json, or console) (default "auto")

Use "rly [command] --help" for more information about a command.
```

Notice how the categories reflect the requirements you saw in the last section: to manage chain and path information, manage keys, query, and transact. The configuration data is added to the config file, stored at `$HOME/.relayer/config/config.yaml` by default. If this is the first time you run the relayer, first initialize the config with the following command:

```sh
$ rly config init
```

And check the config with:

```sh
$ rly config show
```

<HighlightBox type="info">

By default, transactions will be relayed with a memo of `rly(VERSION)` - for example, `rly(v2.0.0)`.
<br/><br/>
To customize the memo for all relaying, use the `--memo` flag when initializing the configuration.

```shell
$ rly config init --memo "My custom memo"
```

Custom memos will have `rly(VERSION)` appended. For example, a memo of `My custom memo` running on relayer version `v2.0.0` would result in a transaction memo of `My custom memo | rly(v2.0.0)`.
<br/><br/>
The `--memo` flag is also available for other `rly` commands that involve sending transactions, such as `rly tx link` and `rly start`. It can be passed there to override the `config.yaml` value if desired.
<br/><br/>
To omit the memo entirely, including the default value of `rly(VERSION)`, use `-` for the memo.

</HighlightBox>

Now you are all set to add the chains and paths you want to relay on, add your keys and start relaying. You will investigate two different scenarios: setting up a relayer between two chains on the mainnet (this would enable you to start relaying in production), and setting up two local chains for testing purposes.

## Relaying in production

As stated earlier, the Go relayer strives to get your relayer up and running in a short amount of time. You will follow the tutorial from the [Github repository](https://github.com/cosmos/relayer) to start relaying between the Cosmos Hub and Osmosis, one of the most popular paths.

1. Configure the chains you want to relay between.

  In this example, you will configure the relayer to operate on the canonical path between the Cosmos Hub and Osmosis.

  The `rly chains add` command fetches chain metadata from the [chain registry](https://github.com/cosmos/chain-registry) and adds it to your config file:

  ```sh
  $ rly chains add cosmoshub osmosis
  ```

  Adding chains from the chain registry randomly selects a publicly available RPC address from the registry entry. If you are running your own node (which is recommended if you are running relaying services professionally), manually go into the config and adjust the `rpc-addr` setting to the RPC endpoint you have exposed.

  <HighlightBox type="note">

  `rly chains add` will check the liveliness of the available RPC endpoints for that chain in the chain registry. The command may fail if none of these RPC endpoints are available. In this case, you will want to manually add the chain config.

  </HighlightBox>

  To add the chain config files manually, example config files have been included [in the Cosmos relayer documentation](https://github.com/cosmos/relayer/tree/main/docs/example-configs/).

  ```sh
  $ rly chains add --url https://raw.githubusercontent.com/cosmos/relayer/main/docs/example-configs/cosmoshub-4.json
  $ rly chains add --url https://raw.githubusercontent.com/cosmos/relayer/main/docs/example-configs/osmosis-1.json
  ```

2. Import OR create new keys for the relayer to use when signing and relaying transactions.

  <HighlightBox type="info">

  `key-name` is an identifier of your choosing.

  </HighlightBox>

  * If you need to generate a new private key you can use the `add` subcommand:

    ```sh
    $ rly keys add cosmoshub [key-name]
    $ rly keys add osmosis [key-name]
    ```

  * If you already have a private key and want to restore it from your mnemonic you can use the `restore` subcommand:

    ```sh
    $ rly keys restore cosmoshub [key-name] "mnemonic words here"
    $ rly keys restore osmosis [key-name] "mnemonic words here"
    ```

3. Edit the relayer's `key` values in the config file to match the `key-name`s chosen above.

  <HighlightBox type="info">

  This step is necessary if you chose a `key-name` other than "default".

  </HighlightBox>

  Example:

   ```yaml
   - type: cosmos
     value:
     key: YOUR-KEY-NAME-HERE
     chain-id: cosmoshub-4
     rpc-addr: http://localhost:26657
   ```

4. Ensure the keys associated with the configured chains are funded.

  <HighlightBox type="best-practice">

  **ATTENTION:** Your configured addresses will need to contain some of the respective native tokens to pay relayer fees.

  </HighlightBox>

  You can query the balance of each configured key by running:

  ```sh
  $ rly query balance cosmoshub
  $ rly q balance osmosis
  ```

5. Configure path metadata in the config file.

  You configured the _chain_ metadata, now you need _path_ metadata. This scenario assumes that there is already a canonical channel, so there is no need for light client creation, nor connection and channel handshakes to set these up.

  There is one easy command to get this path information - initially from the [Interchain folder](https://github.com/cosmos/relayer/tree/2.0.x/interchain) in the Go relayer repository, but this is being replaced by [IBC data in the chain registry](https://github.com/cosmos/chain-registry/tree/master/_IBC).

  ```sh
  $ rly paths fetch
  ```

  <HighlightBox type="note">

  Do not see the path metadata for paths you want to relay on? Please open a Push Request (PR) to add this metadata to the GitHub repository!

  </HighlightBox>

6. Configure the channel filter.

  By default, the relayer will relay packets over all channels on a given connection.

  Each path has a `src-channel-filter`, which you can utilize to specify which channels you would like to relay on.

  The `rule` can be one of three values:

  * `allowlist`, which tells the relayer to relay on **only** the channels in `channel-list`.
  * `denylist`, which tells the relayer to relay on all channels **except** the channels in `channel-list`.
  * Empty value, which is the default setting and tells the relayer to relay on all channels.

  Since you should only be worried about the canonical channel between the Cosmos Hub and Osmosis, our filter settings would look like the following:

  Example:

  ```yaml
   hubosmo:
    src:
      chain-id: cosmoshub-4
      client-id: 07-tendermint-259
      connection-id: connection-257
    dst:
      chain-id: osmosis-1
      client-id: 07-tendermint-1
      connection-id: connection-1
    src-channel-filter:
      rule: allowlist
      channel-list: [channel-141]
  ```

  <HighlightBox type="info">

  Because two channels between chains are tightly coupled, there is no need to specify the dst channels.

  </HighlightBox>

7. Do a status check.

  Before starting to relay and after making some changes to the config, you can check the status of the chains and paths in the config:

  ```sh
  $ rly chains list
  ```

  Which returns this output when healthy:

  ```txt
  0: cosmoshub-4          -> type(cosmos) key(✔) bal(✔) path(✔)
  1: osmosis-1            -> type(cosmos) key(✔) bal(✔) path(✔)
  ```

  ```sh
  $ rly paths list
  ```

  Which returns this output when healthy:

  ```txt
  0: cosmoshub-osmosis              -> chns(✔) clnts(✔) conn(✔) (cosmoshub-4<>osmosis-1)
  ```

  In case one of the checks receives a `✘` instead of `✔`, you will need to check if you completed all the previous steps correctly.

8. Finally, start the relayer on the desired path.

  The relayer will periodically update the clients and listen for IBC messages to relay.

  ```sh
  $ rly start [path]
  ```

  The relayer now has an event processor added to respond to emitted events signaling an IBC packet event. You can use it by adding an additional flag:

  ```sh
  $ rly start [path] -p events
  ```

  You will need to start a separate shell instance for each path you wish to relay over.

  When running multiple instances of `rly start`, you will need to use the `--debug-addr` flag and provide an `address:port`. You can also pass an empty string `''` to turn off this feature, or pass `localhost:0` to randomly select a port.

## Testing locally

Besides running a relayer between mainnet chains, you can also run a relayer between public testnet chains, or run chains locally to do some testing of particular scenarios. Here you will use a `docker-compose` network with two local `checkers` chains and a relayer between them.

<HighlightBox type="note">

The example presented is based on the demo in the [b9lab/cosmos-ibc-docker](https://github.com/b9lab/cosmos-ibc-docker/tree/main/tokentransfer) repository.

</HighlightBox>

Start by cloning the repository:

```sh
$ git clone https://github.com/b9lab/cosmos-ibc-docker.git
```

<HighlightBox type="info">

Make sure that you have installed [Docker Compose](https://docs.docker.com/compose/install/) and [Docker](https://docs.docker.com/get-docker/) before continuing.

</HighlightBox>

Then build the **images for the checkers blockchain**:

```sh
$ cd cosmos-ibc-docker/tokentransfer/checkers
$ ./build-images.sh
```

You can build the relayer image manually, or just start the network via `docker-compose` and let it build the missing image for the `ibc-go` relayer:

```sh
$ cd cosmos-ibc-docker/tokentransfer
$ docker-compose -f tokentransfer.yml --profile go up
```

Observe the output of `docker-compose` until the chains are ready - the chains will take some time.

When the chains are ready, start the relayer process. In a new terminal, jump into the relayer container:

```sh
$ docker exec -it relayer bash
```

The demo includes a script to start the relayer, but do the steps manually to practice a bit.

First, initialize the configuration:

```sh
$ rly config init
$ rly chains add-dir configs
$ rly paths add-dir paths
```

<HighlightBox type="info">

You can find the `configs` and `paths` folders in the folder `cosmos-ibc-docker/tokentransfer/relayer_go`. In the `checkersa.json` and `checkersb.json`, you can find the endpoints of the chains and a default key alias.

</HighlightBox>

Populate the aliases:

```sh
$ rly keys restore checkersa alice "cinnamon legend sword giant master simple visit action level ancient day rubber pigeon filter garment hockey stay water crawl omit airport venture toilet oppose"
$ rly keys restore checkersb bob "define envelope federal move soul panel purity language memory illegal little twin borrow menu mule vote alter bright must deal sight muscle weather rug"
```

The mnemonics are set in the checkers blockchains, take _alice_ from `checkersa` and _bob_ from `checkersb`.

Now check if the chains and path(s) are ready to relay over:

```sh
$ rly chains list
$ rly paths list
```

You can now connect the two chains with the `link` command.

<HighlightBox type="note">

The relayer will check if any clients, connections, and channels are present for the given path. If not, the `link` command will attempt to create the missing objects.

</HighlightBox>

You can also check `rly tx -h` to find the separate commands for these actions.

```sh
$ rly tx link demo -d -t 3s
```

Next, check the token balances on both chains:

```sh
$ rly q balance checkersa --ibc-denoms
$ rly q bal checkersb -i
```

Finally, send some tokens between the chains:

```sh
$ rly tx transfer checkersa checkersb 10token $(rly chains address checkersb) channel-0
```

<HighlightBox type="note">

The default key used for checkersa is _alice_.

</HighlightBox>

`$(rly chains address checkersb)` will give the address of _bob_.

You created the commitment proof on `checkersa` to send the packet, but no relaying has taken place yet.

### Relay packets/acknowledgements

Running `rly start demo` would essentially loop these two commands:

```sh
$ rly tx relay-pkts demo channel-0 -d
$ rly tx relay-acks demo channel-0 -d
```

Check that the transfer was completed:

```sh
$ rly q bal checkersa -i
$ rly q bal checkersb -i
```

You can see that the tokens have a denom on the `checkersb` chain because they are not native `token`s of `checkersb`. Send the tokens back to the account on `checkersa` by replacing `$denom` (this will be something like `ibc/D11F61D9F5E49A31348A7CD2DECE888D4DFEE1DADA343F7D8D4502BFA9496936`):

```sh
$ rly tx transfer checkersb checkersa 10$denom $(rly chains addr checkersa) channel-0
$ rly tx relay-pkts demo channel-0 -d
$ rly tx relay-acks demo channel-0 -d
```

Check that the return trip was completed:

```sh
$ rly q bal checkersa -i
$ rly q bal checkersb -i
```

You can see that the stake balances decreased on each chain because of the set fees in the configuration.

If you are finished with the tests, make sure to shut down your network with:

```sh
$ docker-compose -f tokentransfer.yml --profile go down
```

<HighlightBox type="synopsis">

To summarize, this section has explored:

* The Go relayer, a relayer implementation written in Golang that can create clients, connections, and channels, as well as relay packets, and update and upgrade clients.
* How the Go relayer requires minimal manual configuration and abstracts away many more complex IBC concepts by automating a lot of work to fetch configuration data from the chain registry.
* How to install and configure the Go relayer, and how to run it between public testnet chains or locally run chains to conveniently test particular scenarios.

</HighlightBox>

<!--## Next up

After having taken a look at the Go relayer, it is now time to turn to the Hermes relayer in the [next section](./4-hermes-relayer.md).-->
