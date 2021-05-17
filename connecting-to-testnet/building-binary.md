---
order: 1
---

# Building and Starting a Full Node

## Requirements

* [Go](https://golang.org/) (version 1.15 or higher)
* [make](https://en.wikipedia.org/wiki/Make_(software))
* [jq](https://github.com/stedolan/jq)
* [git](https://git-scm.com/)
* [curl](https://github.com/curl/curl)


## Building the Binary

Clone the code repository:

```
git clone --branch v1.0.1 https://github.com/b-harvest/gravity-dex
```

We're using `b-harvest/gravity-dex`, which is `cosmos/gaia` (the source code behind Cosmos Hub) with the `tendermint/liquidity` module (source code of Gravity DEX) imported.

Install node's binary `gaiad`:

```
cd gravity-dex && make install
```

## Initializing a Node

Initialize your node (replace `YOUR_MONIKER` with any string that identifies your node):

```
gaiad init YOUR_MONIKER --chain-id cosmoshub-testnet
```

## Starting a Node

Download the genesis file and save it into the data directory of your node:

```
curl -s https://rpc.testnet.cosmos.network/genesis | jq -r .result.genesis > ~/.gaia/config/genesis.json
```

Add seed nodes:

```
sed -i 's/seeds =.*/seeds = "30dce239c56cfd25cf0cebf5726c7c8be1e46f66@104.196.38.186:31819,754a5f864adc5a60b287d4aed4f0ab11d8b056c8@34.73.24.113:31654"/g' ~/.gaia/config/config.toml
```

If you're using macOS or BSD, use the following command:

```
sed -i '' 's/seeds =.*/seeds = "30dce239c56cfd25cf0cebf5726c7c8be1e46f66@104.196.38.186:31819,754a5f864adc5a60b287d4aed4f0ab11d8b056c8@34.73.24.113:31654"/g' ~/.gaia/config/config.toml
```

Start the node:

```
gaiad start
```

Your node should start syncing and over time will catch up with the network. By default, your node's RPC is accessible on [http://localhost:26657](http://localhost:26657).
