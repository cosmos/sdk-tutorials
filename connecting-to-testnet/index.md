---
parent:
  title: Connecting to a Testnet
order: 0
---

# The Cosmos Hub Testnet

In this tutorial, we will connect to the Cosmos testnetwork. We will learn how to:

- Get and install the software
- Start the Node
- Use the Cosmos SDK CLI
- Connect to the public endpoints

The [Cosmos Network](https://cosmos.network) is an expanding ecosystem of connected blockchains. Many blockchains in the ecosystem are built with [Tendermint Core](https://docs.tendermint.com/), [Cosmos SDK](https://docs.cosmos.network/) and connected with [IBC](https://ibcprotocol.org/). One of these blockchains is the [Cosmos Hub](https://cosmos.network/features). Mainnet of the Cosmos Hub has been online since early 2019 and you can learn how to [join the network as a validator](https://hub.cosmos.network/main/validators/validator-setup.html). In this guide you'll learn how to start a full-node for and interface with a Cosmos Hub **testnet**.

## What is a testnet?

A testnet in our purpose describes a network create with the Cosmos SDK that has been created to test applications.
It is created so app creator can connect and use the functionality they expect with a real network.
The state of a testnet can be reset at any time.

## Public Endpoints

When you have an application that needs access to the testnet, there is an infrastructure available that you can use.
Connect to the Cosmos Hub testnet using the following endpoints:

| Service      | URL                                                                                    |
| ------------ | -------------------------------------------------------------------------------------- |
| RPC          | [https://rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network:443)       |
| API          | [https://api.testnet.cosmos.network:443](https://api.testnet.cosmos.network:443)       |
| gRPC         | [https://grpc.testnet.cosmos.network:443](https://grpc.testnet.cosmos.network:443)     |
| Token faucet | [https://faucet.testnet.cosmos.network:443](https://faucet.testnet.cosmos.network:443) |

## Seed Nodes

* `30dce239c56cfd25cf0cebf5726c7c8be1e46f66@104.196.38.186:31819`
* `754a5f864adc5a60b287d4aed4f0ab11d8b056c8@34.73.24.113:31654`

## Requesting Tokens from a Faucet

The faucet has a simple [web-interface](https://faucet.testnet.cosmos.network), but you can also request tokens programmatically:

```
curl -X POST -d '{"address": "cosmos1kd63kkhtswlh5vcx5nd26fjmr9av74yd4sf8ve"}' https://faucet.testnet.cosmos.network
```