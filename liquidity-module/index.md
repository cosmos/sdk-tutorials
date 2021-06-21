---
order: 0
description: Use the Tendermint liquidity module to create pools, deposit to pools, and withdraw from pools with tokens sent using IBC.
---

# Understanding the Liquidity Module

The liquidity module, known on the Cosmos Hub as Gravity DEX, enables users to create liquidity pools and swap tokens. 

## Introduction

When using your Cosmos SDK-based blockchains, you want to enable users to trade tokens. You can have multiple tokens on your blockchain or have tokens from external blockchains sent to your blocking using inter-blockchain communication protocol (IBC). The liquidity module allows users to use pools to trade those tokens on your blockchain. Each pool represents a token pair and allows the user to swap from one token to the other token.
In this tutorial, you create your own blockchain, send tokens to another blockchain, create a pool, deposit to a pool, withdraw from a pool, and swap tokens.

**Important** In the code examples throughout this tutorial, when you see username be sure to substitute your username. 

**You will learn how to:**

- Create a blockchain with Starport
- Create your own token on your blockchain
- Connect your blockchain to the testnet
- Send your own token with IBC to the testnet
- Create a pool with your token
- Use the pool with your token

## Prerequisites

Before you start the tutorial, install the prerequisite software. 

- [Install Starport](../starport/index.md) v0.16.0 <!-- link to the new tutorial file for this prereq to install Starport https://github.com/cosmos/sdk-tutorials/pull/694/commits/9a988d64408df16dad61412b7c542f6dd1fa4bee  -->

        **Important** This tutorial uses [Starport](https://github.com/tendermint/starport) v0.16.0. The tutorial is based on this specific version of Starport and is not supported for other versions.

- Install the Gravity DEX binary:

        ```markdown
        git clone https://github.com/b-harvest/gravity-dex.git
        cd gravity-dex
        make install

        gaiad
        ```

## Create the Blockchain

Scaffold a new blockchain called `myblockchain`:

```bash
starport app github.com/username/myblockchain
cd myblockchain
```

## Add Your Token in the Configuration

**Note** The minimum reserve coin amount for a pool in the liquidity module is 1,000,000. Make sure you create enough tokens for your liquidity pools.

Navigate to the top-level folder of your app directory and edit the `config.yml` file. 

For the `accounts` parameter, add your username and your new token:

```yml
accounts:
	- name: username
    coins: ["10000token", "50000000stake", "1000000000000mytoken"]
```

## Start Your Blockchain

To start your blockchain, run this command in your local terminal:

```bash
starport serve
```

You see output similar to this output, but with different account passphrases:

```bash

```

## Configure the Relayer

A relayer is software to connect two blockchains. Configure the relayer with your endpoints to create a connection between your blockchain and the testnet. After the connection is established, you can send tokens from one blockchain to the other blockchain.

**Note** If you previously used the relayer, follow these steps to remove exiting relayer and Starport configurations:

- Remove your existing relayer config:
    
    ```bash
    rm -r $HOME/.relayer/*
    ```

- Delete previous configuration files:

    ```
    rm -r $HOME/.starport/*
    ```

Configure the relayer to create a connection between your local chain and the chain you want to connect to. In this example, the chain target is the Gravity DEX testnet.

```markdown
starport relayer configure
```

For the local `source` chain, use the default values.
For the testnet `target` chain, use the following values.


- Target RPC: [https://rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network/)

- Token Faucet: [https://faucet.testnet.cosmos.network:443](https://faucet.testnet.cosmos.network/)

- Target Gas Price (0.025uatom): 0.025stake


Connect the chains:

```markdown
starport relayer connect
```

## Get Token From the Faucet

From the terminal output that `starport serve` created for you, use the `username` accounts address and claim tokens from the faucet:

```markdown
curl -X POST -d '{"address": "cosmosxxxxx"}' https://faucet.testnet.cosmos.network
```

After you see a success message, you can check your balance. 

See your balance at [https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/](https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxxxx).

## Send Your Own Token to the Testnet

Now that your account on testnet is funded with testnet tokens, you can send your own token to the testnet. 

At your local terminal, enter this liquidity module command to transfer your token to the testnet:

```bash
myblockchaind tx ibc-transfer transfer transfer channel-0 cosmos16080vqxrjyngxfdkzj54uewszkztk6n3nv6f57 "500mytoken" --from username
```

After your transaction is complete, check your balance on the Gravity DEX testnet to confirm your token transfer.

## Create a Pool with My Token

With the liquidity module and gaiad binary installed and `gaiad` running, use these links to explore your app:

- RPC [https://rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network/)

- API[https://api.testnet.cosmos.network:443](https://api.testnet.cosmos.network/)

- gRPC [https://grpc.testnet.cosmos.network:443](https://grpc.testnet.cosmos.network/)

- Token faucet [https://faucet.testnet.cosmos.network:443](https://faucet.testnet.cosmos.network/)

### Verify Your Token Supply 

You can get all available tokens. Your token is now listed. See:

- https://api.testnet.cosmos.network/cosmos/bank/v1beta1/supply

- https://api.testnet.cosmos.network/ibc/applications/transfer/v1beta1/denom_traces

## Create a Liquidity Pool

To create a liquidity pool:

```bash
gaiad tx liquidity create-pool 1 1100000uphoton,1500000ibc/longibchash --from username --chain-id cosmoshub-testnet --gas-prices "0.025stake" --node https://rpc.testnet.cosmos.network:443
```

Confirm the pool has been created. See:

[https://api.testnet.cosmos.network/tendermint/liquidity/v1beta1/pools](https://api.testnet.cosmos.network/tendermint/liquidity/v1beta1/pools)


## Swap Token

You are ready to swap tokens! You have uphoton token and want to swap for the new IBC coin:

```markdown
gaiad tx liquidity swap 1 1 100000uphoton ibc/longibchash 0.1 0.003 --from username --chain-id cosmoshub-testnet --gas-prices "0.025stake" --node https://[rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network/)
```

Check the balance on the new account that made the trade:

[https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmos15zk2xl8acjl9g4hrxlsrhtf07dkecyay3yapys](https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmos15zk2xl8acjl9g4hrxlsrhtf07dkecyay3yapys)