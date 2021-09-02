---
order: 1
---

# About the Testnet Tutorial

In this tutorial, you learn how to:

- Get and install the software
- Start the Node
- Use the Cosmos SDK CLI
- Interact with the Cosmos Hub [**testnet**](index.md)

## Requirements

- [curl](https://github.com/curl/curl)
- [git](https://git-scm.com/)
- [Go](https://golang.org/) (version 1.15 or higher)
- [jq](https://github.com/stedolan/jq)
- [make](https://en.wikipedia.org/wiki/Make_(software))

## Public Endpoints

When you have an application that needs access to the testnet, there is an infrastructure available that you can use.

To connect to the Cosmos Hub testnet, use the following endpoints:

| Service      | URL                                                                                    |
| ------------ | -------------------------------------------------------------------------------------- |
| RPC          | [https://rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network:443)       |
| API          | [https://api.testnet.cosmos.network:443](https://api.testnet.cosmos.network:443)       |
| gRPC         | [https://grpc.testnet.cosmos.network:443](https://grpc.testnet.cosmos.network:443)     |
| Token faucet | [https://faucet.testnet.cosmos.network:443](https://faucet.testnet.cosmos.network:443) |

## Seed Nodes

Seed nodes provides a list of nodes to connect to. Before you can start your node, you must provide at least one type of node to connect to the network. We have provided these seed nodes to help you connect your node to the testnet:

- `e6fab0296c0cc31228756822b15e98cfa84ff97b@p2p.testnet.cosmos.network:31729`
- `64fefc98915aa430417ba893bf13bd8cc101aedf@p2p.testnet.cosmos.network:32073`

## Requesting Tokens from a Faucet

The faucet has a simple [web interface](https://faucet.testnet.cosmos.network). You can also request tokens programmatically:

```bash
curl -X POST -d '{"address": "cosmos1kd63kkhtswlh5vcx5nd26fjmr9av74yd4sf8ve"}' https://faucet.testnet.cosmos.network
```
