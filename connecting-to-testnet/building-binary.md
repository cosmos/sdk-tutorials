---
order: 2
---

# Building and Starting a Full Node

To build and start a full node, you build the binary, and then initialize and start a node.

## Building the Binary

This testnet repo is `cosmos/gaia`. This repo provides the functionality of:

- `cosmos/gaia` the source code behind Cosmos Hub

1. Clone the code repository:

    ```bash
    git clone --branch v5.0.5 https://github.com/cosmos/gaia
    ```

    You can safely ignore this message:

    ```bash
    You are in 'detached HEAD' state...
    ```

1. Install the node's binary `gaiad`:

    ```bash
    cd gaia && make install
    ```

## Initializing a Node

To initialize your node:

```bash
gaiad init YOUR_MONIKER
```

where `YOUR_MONIKER` is a placeholder for a string that identifies your node. Be sure to replace `YOUR_MONIKER` with a self-describing string for your node.

## Starting a Node

1. Download and save the genesis file in the data directory of your node:

    ```bash
    curl -s https://rpc.testnet.cosmos.network/genesis | jq -r .result.genesis > ~/.gaia/config/genesis.json
    ```

1. Add seed nodes using the command that is suitable for your environment.

    - For operating systems other than macOS:

    ```bash
    sed -i 's/seeds =.*/seeds = "e6fab0296c0cc31228756822b15e98cfa84ff97b@p2p.testnet.cosmos.network:31729,64fefc98915aa430417ba893bf13bd8cc101aedf@p2p.testnet.cosmos.network:32073"/g' ~/.gaia/config/config.toml
    ```

    - For macOS operating systems:

    ```bash
    sed -i '' 's/seeds =.*/seeds = "e6fab0296c0cc31228756822b15e98cfa84ff97b@p2p.testnet.cosmos.network:31729,64fefc98915aa430417ba893bf13bd8cc101aedf@p2p.testnet.cosmos.network:32073"/g' ~/.gaia/config/config.toml
    ```

1. Start the node:

    ```bash
    gaiad start
    ```

Your node starts syncing and over time catches up with the network. By default, your node's RPC is accessible on [http://localhost:26657](http://localhost:26657).

1. To verify your node sync status, open http://localhost:26657/status and look for `result.sync_info.catching_up` as shown in the last line of this example:

```bash
    "sync_info": {
      "latest_block_hash": "16929948398D787AB93880382BEB5CA9329AF8CB99D4DA864603C9F2068F8670",
      "latest_app_hash": "D31E734E15D8D60654322889B6C66AE8D8B69FEB943FF43EF872FEF7F3E3C195",
      "latest_block_height": "88578",
      "latest_block_time": "2021-05-18T13:38:18.281032897Z",
      "earliest_block_hash": "B927536508832AA7991AA8BDD532084D2657B570611054DF4647126CDC2C7CA9",
      "earliest_app_hash": "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855",
      "earliest_block_height": "1",
      "earliest_block_time": "2021-05-13T09:57:33.716282198Z",
      "catching_up": true
    },
```
