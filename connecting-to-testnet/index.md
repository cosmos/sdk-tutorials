---
parent:
  title: Connecting to a Testnet
---

# Connecting to a Testnet

The [Cosmos Network](https://cosmos.network) is an expanding ecosystem of connected blockchains. Many blockchains in the ecosystem are built with [Tendermint Core](https://docs.tendermint.com/), [Cosmos SDK](https://docs.cosmos.network/) and connected with [IBC](https://ibcprotocol.org/). One of these blockchains is the [Cosmos Hub](https://cosmos.network/features). Mainnet of the Cosmos Hub has been online since early 2019 and you can learn how to [join the network as a validator](https://hub.cosmos.network). In this guide you'll learn how to start a full-node for and interface with a Cosmos Hub **testnet**.

## Starting a Full Node

### Requirements

* [Go](https://golang.org/) (version 1.15 or higher)
* [make](https://en.wikipedia.org/wiki/Make_(software))
* [jq](https://github.com/stedolan/jq)
* [git](https://git-scm.com/)
* [curl](https://github.com/curl/curl)

### Running a Node

Clone the code repository:

```
git clone --branch v1.0.1 https://github.com/b-harvest/gravity-dex
```

Install node's binary `gaiad`:

```
cd gravity-dex && make install
```

Initialize your node (replace `YOUR_MONIKER` with any string that identifies your node):

```
gaiad init YOUR_MONIKER --chain-id cosmoshub-testnet
```

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

Your node should start syncing and over time will catch up with the network. By default, your node's RPC should be accessible on [http://localhost:26657](http://localhost:26657) and API on [http://localhost:1317](http://localhost:1317).

## Public Endpoints

You can also connect to the Cosmos Hub testnet using the following endpoints:

| Service      | URL                                                                                    |
| ------------ | -------------------------------------------------------------------------------------- |
| RPC          | [https://rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network:443)       |
| API          | [https://api.testnet.cosmos.network:443](https://api.testnet.cosmos.network:443)       |
| gRPC         | [https://grpc.testnet.cosmos.network:443](https://grpc.testnet.cosmos.network:443)     |
| Token faucet | [https://faucet.testnet.cosmos.network:443](https://faucet.testnet.cosmos.network:443) |

## Requesting Tokens from a Faucet

The faucet has a simple [web-interface](https://faucet.testnet.cosmos.network), but you can also request tokens programmatically:

```
curl -X POST -d '{"address": "cosmos1kd63kkhtswlh5vcx5nd26fjmr9av74yd4sf8ve"}' http://faucet.testnet.cosmos.network
```