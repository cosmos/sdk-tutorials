---
order: 0
description: Use the Tendermint liquidity module to create pools, deposit and withdraw from pools with tokens sent via IBC.
---

# Understanding the liquidity module

The liquidity module, on the Cosmos Hub known as Gravity DEX, enables users to create liquidity pools and swap tokens. 

## Introduction

When using your Cosmos based blockchains you want to enable users to trade tokens. You can have multiple tokens on your blockchain or have tokens from external blockchains sent with IBC to your blockchain. The liquidity module allows users to trade those tokens on your blockchain, using pools. Each pool represents a token pair and, once created, allows the user to swap from one token to the other.
In this tutorial you will learn how to create your own blockchain, send token to another blockchain, create a pool, deposit and withdraw from a pool and swap tokens.

**You will learn how to:**

- Create a blockchain with Starport
- Create your own token on your blockchain
- Connect your blockchain to the testnet
- Send your own token with IBC to the testnet
- Create a pool with your token
- Use the pool with your token

## Install Starport

This tutorial uses [Starport](https://github.com/tendermint/starport) v0.16.0. The Starport tool is the easiest way to build a blockchain. 

To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.16.0! | bash
```

You can also use Starport v0.16.0 in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.15.1). For more installation options, see [install Starport](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.16.0), but this tutorial assumes you are using a local Starport installation. See [install Starport](https://github.com/tendermint/starport/blob/develop/docs/intro/install.md).

## Create the Blockchain

Scaffold a new blockchain called `myblockchain`

```bash
starport app github.com/username/myblockchain
cd myblockchain
```

## Add your token in the configuration.

Open the `config.yml` file. 
In the `accounts` parameter, add your username and new token:

*Note: the minimum reserve coin amount for a pool in the liquidity module is 1,000,000, make sure to have enough tokens created*

```yml
accounts:
	- name: username
    coins: ["10000token", "50000000stake", "1000000000000mytoken"]
```

## Start your blockchain

Start your blockchain with running the command in your terminal.

```bash
starport serve
```

You should see an output similar to this, with different account passphrases.

```bash

```

## Configure the relayer

The relayer is a software to connect two blockchains. Configure it with your endpoints so you can have connection between your blokchain and the testnet. After the connection is established, you will be able to send token from one blockchain to the other.

*Note: If you already used the relayer before, you might want to remove existing relayer config: rm -r $HOME/.relayer/*

*Note: If you already used the relayer before, delete all configuration that you used before rm -r $HOME/.starport/*

Configure the relayer to create a connection between your local chain and the chain you want to connect to. In this example, the chain target will be the Gravity DEX testnet.

```markdown
starport relayer configure
```

For the local `source` chain, use the default values.
For the testnet `target` chain, use the following values.


Target RPC: [https://rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network/)

Token Faucet: [https://faucet.testnet.cosmos.network:443](https://faucet.testnet.cosmos.network/)

Target Gas Price (0.025uatom): 0.025stake


Connect the chains

```markdown
starport relayer connect
```

## Get Token from the Faucet

From the terminal output that `starport serve` created for you, use the `username` accounts address and claim token from the faucet

```markdown
curl -X POST -d '{"address": "cosmosxxxxx"}' https://faucet.testnet.cosmos.network
```

When you get a success message, you can check your balance.

*See balance* [https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/](https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmosxxxxx)

## Send your own Token to the testnet

Now that your account on testnet is funded with testnet token, send your own token to the testnet.

Use your terminal to send your own created token to the testnet using the command line.

```bash
myblockchaind tx ibc-transfer transfer transfer channel-0 cosmos16080vqxrjyngxfdkzj54uewszkztk6n3nv6f57 "500mytoken" --from username
```

Once again, check your balance on the Gravity DEX testnet to confirm your token have arrived.

## Create a pool with my token

Prerequisite: 
Install the Gravity DEX binary

```markdown
git clone https://github.com/b-harvest/gravity-dex.git
cd gravity-dex
make install

gaiad
```

RPC	[https://rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network/)

API	[https://api.testnet.cosmos.network:443](https://api.testnet.cosmos.network/)

gRPC	[https://grpc.testnet.cosmos.network:443](https://grpc.testnet.cosmos.network/)

Token faucet	[https://faucet.testnet.cosmos.network:443](https://faucet.testnet.cosmos.network/)

**Get all available token, your token should now be listed**

https://api.testnet.cosmos.network/cosmos/bank/v1beta1/supply

https://api.testnet.cosmos.network/ibc/applications/transfer/v1beta1/denom_traces

**Create the Pool**

```bash
gaiad tx liquidity create-pool 1 1100000uphoton,1500000ibc/longibchash --from username --chain-id cosmoshub-testnet --gas-prices "0.025stake" --node https://rpc.testnet.cosmos.network:443
```

Confirm the pool has been created

[https://api.testnet.cosmos.network/tendermint/liquidity/v1beta1/pools](https://api.testnet.cosmos.network/tendermint/liquidity/v1beta1/pools)


## Swap Token

You have uphoton and want the new IBC coin

```markdown
gaiad tx liquidity swap 1 1 100000uphoton ibc/longibchash 0.1 0.003 --from username --chain-id cosmoshub-testnet --gas-prices "0.025stake" --node https://[rpc.testnet.cosmos.network:443](https://rpc.testnet.cosmos.network/)
```

Check balance on new account that made the trade

[https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmos15zk2xl8acjl9g4hrxlsrhtf07dkecyay3yapys](https://api.testnet.cosmos.network/cosmos/bank/v1beta1/balances/cosmos15zk2xl8acjl9g4hrxlsrhtf07dkecyay3yapys)