---
title: "Go Relayer"
order: 
description: 
tag: deep-dive
---

# Go Relayer

<HighlightBox type="prerequisite">

Before you dive into Go relayers, make sure to:

* Install Go.
* Install Docker.
* Install Rust.

For all installations, please see the [setup page](../course-ida/setup.md).

</HighlightBox>

<HighlightBox type="learning">

Have you considered running a relayer?
   
In this section, you will learn:

* How to get started with the Go relayer
* Basic Go relayer commands
   
</HighlightBox>

[The Go relayer](https://github.com/cosmos/relayer) is a relayer implementation written in Golang. It can create clients, connections, and channels, as well as relay packets, and update and upgrade clients.

The Go relayer aims to get your relayer up and running with minimal manual configuration and abstracts away a lot of the more complex IBC concepts. The objective is that users can spin up their own relayer and relay packets. To provide this functionality, it automates a lot of work to fetch configuration data from the chain registry.

After the installation, you will get started with relaying on mainnet chains and do some local testing.

## Installation and getting started

The repository offers a script to start two chains, which we need to test the relayer.

First, create a folder for this section:

```bash
$ mkdir relay-go-test
$ cd relay-go-test
```

Clone the [Go relayer repository](https://github.com/cosmos/relayer):

```bash
$ git clone https://github.com/cosmos/relayer.git
```

Now clone the [Gaia](https://github.com/cosmos/gaia) repository into it:

```bash
$ git clone https://github.com/cosmos/gaia.git
```

Build Gaia:

```bash
$ cd gaia
$ make install
```

Now build the Go relayer:

```bash
$ cd ../relayer
$ make install
```

Make sure that your `$GOPATH` is set correctly and `$GOPATH/bin` is included in your `$PATH`. 

To check the available commands, run the help command on the `rly` binary.

```bash
$ rly -h

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
      --home string         set home directory (default "/Users/<username>/.relayer")
      --log-format string   log output format (auto, logfmt, json, or console) (default "auto")

Use "rly [command] --help" for more information about a command.

```

Notice how the categories reflect the requirements you saw in the last section: to manage chain and path information, manage keys, query, and transact. The configuration data is added to the config file, stored at `$HOME/.relayer/config/config.yaml` by default. If this is the first time you run the relayer, first initialize the config with the following command:

```bash
$ rly config init

#and check the config with
$ rly config show
```

Now you are all set to add the chains and paths you want to relay on, add your keys and start relaying. You will investigate two different scenarios: setting up a relayer between two chains on the mainnet (this would enable you to start relaying in production), and setting up two local chains for testing purposes.

## Relaying in production

As stated earlier, the Go relayer strives to get your relayer up and running in a short amount of time. You will follow the tutorial from the [Github repository](https://github.com/cosmos/relayer) to start relaying between the Cosmos Hub and Osmosis, one of the most popular paths.

1. **Configure the chains you want to relay between.**
   
   In this example, you will configure the relayer to operate on the canonical path between the Cosmos Hub and Osmosis.

   The `rly chains add` command fetches chain meta-data from the [chain registry](https://github.com/cosmos/chain-registry) and adds it to your config file:
   
   ```shell
   $ rly chains add cosmoshub osmosis
   ```
       
   Adding chains from the chain registry randomly selects a publicly available RPC address from the registry entry. If you are running your own node (which is recommended if you are running relaying services professionally), manually go into the config and adjust the `rpc-addr` setting to the RPC endpoint you have exposed.

   ><HighlightBox type="note">
   >
   >`rly chains add` will check the liveliness of the available RPC endpoints for that chain in the chain registry. It is possible that the command will fail if none of these RPC endpoints are available. In this case, you will want to manually add the chain config.
   >
   ></HighlightBox>

   To add the chain config files manually, example config files have been included [in the Cosmos relayer documentation](https://github.com/cosmos/relayer/tree/main/docs/example-configs/).

   ```shell
   $ rly chains add --url https://raw.githubusercontent.com/cosmos/relayer/main/docs/example-configs/cosmoshub-4.json
   $ rly chains add --url https://raw.githubusercontent.com/cosmos/relayer/main/docs/example-configs/osmosis-1.json
   ```
   
2. **Import OR create new keys for the relayer to use when signing and relaying transactions.**

   >`key-name` is an identifier of your choosing.

   * If you need to generate a new private key you can use the `add` subcommand:

    ```shell
    $ rly keys add cosmoshub-4 [key-name]  
    $ rly keys add osmosis-1 [key-name]  
    ```
  
   * If you already have a private key and want to restore it from your mnemonic you can use the `restore` subcommand:

   ```shell
   $ rly keys restore cosmoshub-4 [key-name] "mnemonic words here"
   $ rly keys restore osmosis-1 [key-name] "mnemonic words here"
   ```

3. **Edit the relayer's `key` values in the config file to match the `key-name`s chosen above.**

   >This step is necessary if you chose a `key-name` other than "default".
   
   Example:

      ```yaml
      - type: cosmos
         value:
         key: YOUR-KEY-NAME-HERE
         chain-id: cosmoshub-4
         rpc-addr: http://localhost:26657
      ```

4. **Ensure the keys associated with the configured chains are funded.**

   >**ATTENTION:** Your configured addresses will need to contain some of the respective native tokens to pay relayer fees.

   You can query the balance of each configured key by running:

   ```shell
   $ rly q balance cosmoshub-4
   $ rly q balance osmosis-1
   ```

5. **Configure path meta-data in the config file.**

   You configured the *chain* meta-data, now you need *path* meta-data. This scenario assumes that there is already a canonical channel, so there is no need for light client creation, nor connection and channel handshakes to set these up.

   There is one easy command to get this path information - initially from the [Interchain folder](https://github.com/cosmos/relayer/tree/main/interchain) in the Go relayer repository, but this will soon be replaced by [IBC data in the chain registry](https://github.com/cosmos/chain-registry/tree/master/_IBC).

     ```shell
     $ rly paths fetch
     ```

   ><HighlightBox type="note">
   >
   >Don't see the path metadata for paths you want to relay on? Please open a Push Request (PR) to add this metadata to the GitHub repository!
   >
   ></HighlightBox>

   At minimum, this command will add two paths. In our case it will add one path from the Cosmos Hub to Osmosis, and another path from Osmosis to the Cosmos Hub.

6. **Configure the channel filter.**
   
   By default, the relayer will relay packets over all channels on a given connection.

   Each path has an `src-channel-filter`, which you can utilize to specify which channels you would like to relay on.

   The `rule` can be one of three values:  
   
   * `allowlist`, which tells the relayer to relay on _ONLY_ the channels in `channel-list`.
   * `denylist`, which tells the relayer to relay on all channels _EXCEPT_ the channels in `channel-list`.
   * Empty value, which is the default setting and tells the relayer to relay on all channels.
   
   Since you should be only worried about the canonical channel between the Cosmos Hub and Osmosis, our filter settings would look like the following:

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
   
   >Because two channels between chains are tightly coupled, there is no need to specify the dst channels.

7. **Do a status check.**

   Before starting to relay and after making some changes to the config, you can check the status of the chains and paths in the config:

    ```shell
    $ rly chains list

    # output when healthy
    0: cosmoshub-4          -> type(cosmos) key(✔) bal(✔) path(✔)
    1: osmosis-1            -> type(cosmos) key(✔) bal(✔) path(✔)

    $ rly paths list

    # output when healthy
    0: hubosmo              -> chns(✔) clnts(✔) conn(✔) (cosmoshub-4<>osmosis-1)
    1: osmohub              -> chns(✔) clnts(✔) conn(✔) (osmosis-1<>cosmoshub-4)
    ```

   In case one of the checks receives a `✘` instead of `✔`, you will need to check if you completed all the previous steps correctly.

8. **Finally, start the relayer on the desired path.**

   The relayer will periodically update the clients and listen for IBC messages to relay.

     ```shell
     $ rly start [path]
     ```
   
    You will need to start a separate shell instance for each path you wish to relay over.

    >When running multiple instances of `rly start`, you will need to use the `--debug-addr` flag and provide an `address:port`. You can also pass an empty string `''`  to turn off this feature, or pass `localhost:0` to randomly select a port.

## Testing locally

Besides running a relayer between mainnet chains, you can also run a relayer between public testnet chains or locally run chains to do some testing of particular scenarios. Here you will use two local `gaia` chains and run a relayer between them. This is based on the demo in the [Go relayer repository](https://github.com/cosmos/relayer/blob/main/docs/demo.md).

Make sure you are in the `relayer` folder. Now use the offered script to spin up two chains, **ibc-0** and **ibc-1**, which will run in the background.

<HighlightBox type="note">

This script will remove the `~/.relayer` folder with your current config. Copy it to another folder if you want to keep your current config.

</HighlightBox>

To stop, use `killall gaiad`:

```bash
$ ./scripts/two-chainz
```

The relayer `--home` directory is now ready for normal operations between **ibc-0** and **ibc-1**. 

It is helpful to examine the folder structure of the relayer:

```bash
$ tree ~/.relayer
```

There you can see the addresses of the users created by the script.

Check the relayer configuration with:

```bash
$ cat ~/.relayer/config/config.yaml
```

Now see if the chains and path(s) are ready to relay over:

```bash
$ rly chains list
$ rly paths list
```

You can now connect the two chains with the `link` command. Note that if any clients, connections, and channels were not previously created (which would have shown up in the previous status check) the `link` command will attempt to create the missing objects. You can also check `rly tx -h` to find out the separate commands for these actions.

```bash
$ rly tx link demo -d -t 3s
```

Next, check the token balances on both chains:

```bash
$ rly q balance ibc-0
$ rly q bal ibc-1
```

Finally, send some tokens between the chains:

```bash
$ rly tx transfer ibc-0 ibc-1 1000000samoleans $(rly chains address ibc-1) channel-0
```

Now you have created the commitment proof on ibc-0 to send the packet, but no relaying has taken place yet.

### Relay packets/acknowledgments

Running `rly start demo` essentially loops these two commands:

```bash
$ rly tx relay-pkts demo channel-0 -d
$ rly tx relay-acks demo channel-0 -d
```

Check that the transfer has completed:

```bash
$ rly q bal ibc-0
$ rly q bal ibc-1
```

Send the tokens back to the account on ibc-0:

```bash
$ rly tx transfer ibc-1 ibc-0 1000000ibc/27A6394C3F9FF9C9DCF5DFFADF9BB5FE9A37C7E92B006199894CF1824DF9AC7C $(rly chains addr ibc-0) channel-0
$ rly tx relay-pkts demo channel-0 -d
$ rly tx relay-acks demo channel-0 -d
```

Check that the return trip has completed:

```bash
$ rly q bal ibc-0
$ rly q bal ibc-1
```

You can see that the stake balances decreased on each chain because of the set fees in the configuration.
