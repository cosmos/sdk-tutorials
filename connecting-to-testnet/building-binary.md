---
order: 2
---

# Building and Starting a Full Node

To build and start a full node, you build the binary, and then initialize and start a node. 

## Building the Binary

This testnet repo is `b-harvest/gravity-dex`. This repo provides the functionality of: 

- `cosmos/gaia` the source code behind Cosmos Hub
- `tendermint/liquidity` the module source code of Gravity DEX 

1. Clone the code repository:

    ```
    git clone --branch v1.0.1 https://github.com/b-harvest/gravity-dex
    ```

1. Install the node's binary `gaiad`:

    ```
    cd gravity-dex && make install
    ```

## Initializing a Node

To initialize your node:

```
gaiad init YOUR_MONIKER --chain-id cosmoshub-testnet
```
 
where `YOUR_MONIKER` is a placeholder for a string that identifies your node. Be sure to replace `YOUR_MONIKER` with a self-describing string for your node. 

## Starting a Node

1. Download the genesis file:

    ```
    curl -s https://rpc.testnet.cosmos.network/genesis | jq -r .result.genesis > ~/.gaia/config/genesis.json
    ```
1. Save the genesis file in the data directory of your node.

1. Add seed nodes using the command that is suitable for your environment. 

    - For operating systems other than macOS or BSD:

    ```
    sed -i 's/seeds =.*/seeds = "30dce239c56cfd25cf0cebf5726c7c8be1e46f66@104.196.38.186:31819,754a5f864adc5a60b287d4aed4f0ab11d8b056c8@34.73.24.113:31654"/g' ~/.gaia/config/config.toml
    ```

    - For macOS or BSD operating systems:

    ```
    sed -i '' 's/seeds =.*/seeds = "30dce239c56cfd25cf0cebf5726c7c8be1e46f66@104.196.38.186:31819,754a5f864adc5a60b287d4aed4f0ab11d8b056c8@34.73.24.113:31654"/g' ~/.gaia/config/config.toml
    ```

1. Start the node:

    ```
    gaiad start
    ```

Your node starts syncing and over time catches up with the network. By default, your node's RPC is accessible on [http://localhost:26657](http://localhost:26657).