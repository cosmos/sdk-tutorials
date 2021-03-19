---
order: 3
---

#  Initialize the Blockchain

In this chapter you create the basic blockchain for the interchain exchange app. You will scaffold the blockchain, the module, the transaction, the IBC packets and messages. In the later chapters you will integrate more code into each of the transaction handlers.

## Install Starport

This tutorial uses [Starport](https://github.com/tendermint/starport) v0.15.0. The Starport tool is the easiest way to build a blockchain. 

To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.15.0! | bash
```

You can also use Starport v0.15.0 in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.15.0). For more installation options, see [Install Starport](https://github.com/tendermint/starport/blob/develop/docs/1%20Introduction/2%20Install.md).

## Create the Blockchain

Scaffold a new blockchain called `interchange`

```bash
starport app github.com/tendermint/interchange
cd interchange
```

A new directory named interchange is created. This directory contains a working blockchain app.
Create a new IBC module next.

## Create the Module

Scaffold a module inside your blockchain named `ibcdex` with IBC capabilities.
The ibcdex module contains the logic for creating and maintaining orderbooks and routing them through IBC to the second blockchain.

```bash
starport module create ibcdex --ibc --ordering unordered
```

## Create the Transaction Types

Create two types of transactions and use the Starport `type` command. 
The two commands below will create a `sellOrderBook` and `buyOrderBook` transaction. 

```bash
starport type sellOrderBook orderIDTrack:int amountDenom priceDenom --indexed --module ibcdex
starport type buyOrderBook orderIDTrack:int amountDenom priceDenom --indexed --module ibcdex
```

The values are: 
- `orderIDTrack`, which is an internal counter in the order book to assign the orders an ID.
- `amountDenom`, which will represent which token will be sold and in which quantity
- `priceDenom` what price you are selling your token 

The flag `--indexed` adds an index to the transaction, the `--module ibcdex` adds this transaction to the `ibcdex` module.

## Create the IBC Packets

Create three packets for IBC, to create a new orderbook pair `createPair`, create a sell order `sellOrder`, create a buy order `buyOrder`.

```bash
starport packet createPair sourceDenom targetDenom --module ibcdex
starport packet sellOrder amountDenom amount:int priceDenom price:int --ack remainingAmount:int,gain:int --module ibcdex
starport packet buyOrder amountDenom amount:int priceDenom price:int --ack remainingAmount:int,purchase:int --module ibcdex
```

## Cancel messages

Cancelling orders is done locally in the network, there is no packet to send.
Use the `message` command to create a message to cancel a sell or buy order.

```go
starport message cancelSellOrder port channel amountDenom priceDenom orderID:int --desc "Cancel a sell order" --module ibcdex
starport message cancelBuyOrder port channel amountDenom priceDenom orderID:int --desc "Cancel a buy order" --module ibcdex
```

## Denom trace

The token denoms should the same behavior as in the `ibc-transfer` module:

- An external token received from a chain has a unique `denom`, reffered to as `voucher`
- When a token sent to a chain is sent back and received, the chain can resolve the voucher and convert it back to the original token denomination

Vouchers are hashes, therefore you must store which original denomination is related to a voucher, you can do this with an indexed type.

For a voucher, you store: the source port ID, source channel ID and the original denom

```go
starport type denomTrace port channel origin --indexed --module ibcdex
```

## Config

Add two config files `mars.yml` and `venus.yml` to test two blockchain networks with specific token for each.
Add the config files in the `interchain` folder.
The native denoms for Mars will be `mcx` also known as `marscoin` and for Venus `vcx` known as `venuscoin`.

Create the `mars.yml` file with your content:

```yaml
# interchain/mars.yml
accounts:
  - name: alice
    coins: ["1000token", "100000000stake", "1000mcx"]
  - name: bob
    coins: ["500token", "1000mcx"]
validator:
  name: alice
  staked: "100000000stake"
faucet:
  name: bob
  coins: ["5token"]
genesis:
  chain_id: "mars"
init:
  home: "$HOME/.mars"
```

Create the `venus.yml` file with your content:

```yaml
# interchain/venus.yml
accounts:
  - name: alice
    coins: ["1000token", "1000000000stake", "1000vcx"]
  - name: bob
    coins: ["500token", "1000vcx"]
validator:
  name: alice
  staked: "100000000stake"
faucet:
  host: ":4501"
  name: bob
  coins:
    - "5token"
host:
  rpc: ":26659"
  p2p: ":26658"
  prof: ":6061"
  grpc: ":9091"
  api: ":1318"
  frontend: ":8081"
  dev-ui: ":12346"
genesis:
  chain_id: "venus"
init:
  home: "$HOME/.venus"
```