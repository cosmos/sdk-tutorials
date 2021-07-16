# Introduction 

The Interchain Exchange is a module to create buy and sell orders between blockchains.

In this tutorial you will learn how to create a Cosmos SDK module that can create order pairs, buy and sell orders. You will be able to create order books, buy and sell orders across blockchains, which enables to swap tokens from one blockchain to another.

The code in this tutorial is purely written for a tutorial and only for educational purpose. It is not intended to be used in production.

If you want to see the end result, please refer to the [example implementation](https://github.com/tendermint/interchange).

**You will learn how to:**

- Create a blockchain with Starport
- Create a Cosmos SDK IBC module
- Create an order book that hosts buy and sell orders with a module
- Send IBC packets from one blockchain to another
- Deal with timeouts and acknowledgements of IBC packets

## How the module works

You will learn how to build an exchange that works with two or more blockchains. The module is called `ibcdex`.

The module allows to open an exchange order book between a pair of token from one blockchain and a token on another blockchain. The blockchains are required to have the `ibcdex` module available.

Tokens can be bought or sold with Limit Orders on a simple order book, there is no notion of Liquidity Pool or AMM.

The market is unidirectional: the token sold on the source chain cannot be bought back as it is, and the token bought from the target chain cannot be sold back using the same pair. If a token on a source chain is sold, it can only be bought back by creating a new pair on the order book. This is due to the nature of IBC, creating a `voucher` token on the target blockchain. In this tutorial you will learn the difference of a native blockchain token and a `voucher` token that is minted on another blockchain. You will learn how to create a second order book pair in order to receive the native token back.

In the next chapter you will learn details about the design of the interblockchain exchange.

# App Design

In this chapter you will learn how the interchain exchange module is designed. The module has order books, buy- and sell orders. First, an order book for a pair of token has to be created. After an order book exists, you can create buy and sell orders for this pair of token.

The module will make use of the Inter-Blockchain Communication Standard [IBC](https://github.com/cosmos/ics/blob/master/ibc/2_IBC_ARCHITECTURE.md). With use of the IBC, the module can create order books for tokens to have multiple blockchains interact and exchange their tokens. 

You will be able to create an order book pair with one token from one blockchain and another token from another blockchain. We will call the module you create in this tutorial `ibcdex`.
Both blockchains will need to have the `ibcdex` module installed and running.

When a user exchanges a token with the `ibcdex`, you receive a `voucher` of that token on the other blockchain. This is similar to how a `ibc-transfer` is constructed. Since a blockchain module does not have the rights to mint new token of a blockchain into existence, the token on the target chain would be locked up and the buyer would receive a `voucher` of that token.

This process can be reversed when the `voucher` get burned again to unlock the original token. This will be explained throghout the tutorial in more detail.

## Assumption

An order book can be created for the exchange of any tokens between any pair of chains. The requirement is to have the `ibcdex` module available. There can only be one order book for a pair of token at the same time.

<!-- There is no condition to check for open channels between two chains. -->

A specific chain cannot mint new of its native token. 

<!-- The module is trustless, there is no condition to check when opening a channel between two chains. Any pair of tokens can be exchanged between any pair of chains. -->

This module is inspired by the [`ibc-transfer`](https://github.com/cosmos/cosmos-sdk/tree/v0.42.1/x/ibc/applications/transfer) module and will have some similarities, like the `voucher` creation. It will be more complex but it will display how to create:

- Several types of packets to send
- Several types of acknowledgments to treat
- Some more complex logic on how to treat a packet on receipt, on timeout and more

## Overview

Assume you have two blockchains: `Venus` and `Mars`. The native token on Venus is called `vcx`, the token on Mars is `mcx`. 

When exchanging a token from Mars to Venus, on the Venus blockchain you would end up with an IBC `voucher` token with a denom that looks like `ibc/B5CB286...A7B21307F `. The long string of characters after `ibc/` is a denom trace hash of a token transferred through IBC. Using the blockchain's API you can get a denom trace from that hash. Denom trace consists of a `base_denom` and a `path`. In our example, `base_denom` will be `mcx` and the `path` will contain pairs of ports and channels through which the token has been transferred. For a single-hop transfer `path` will look like `transfer/channel-0`. Learn more about token paths in [ICS 20](https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer).

This token `ibc/Venus/mcx` cannot be sold back using the same order book. If you want to "reverse" the exchange and receive back the Mars token, a new order book `ibc/Venux/mcx` to `mcx` needs to be created.

## Order books

As a typical exchange, a new pair implies the creation of an order book with orders to sell `MCX` or orders to buy `VCX`. Here, you have two chains and this data-structure must be split between `Mars` and `Venus`.

Users from chain `Mars` will sell `MCX` and users from chain `Venus` will buy `MCX`. Therefore, we represent all orders to sell `MCX` on chain `Mars` and all the orders to buy `MCX` on chain `Venus`.

In this example blockchain `Mars` holds the sell oders and blockchain `Venus` holds the buy orders.

## Exchanging tokens back

Like `ibc-transfer` each blockchain keep a trace of the token voucher created on the other blockchain.

If a blockchain `Mars` sells `MCX` to `Venus` and `ibc/Venus/mcx` is minted on `Venus` then, if `ibc/Venus/mcx` is sold back on `Mars` the token unlocked and received will be `MCX`.

## Features

The features supported by the module are:

- Creating an exchange order book for a token pair between two chains
- Send sell orders on source chain
- Send buy orders on target chain
- Cancel sell or buy orders

# App Init

#  Initialize the Blockchain

In this chapter you create the basic blockchain module for the interchain exchange app. You scaffold the blockchain, the module, the transaction, the IBC packets and messages. In the later chapters you  integrate more code into each of the transaction handlers.

## Install Starport

This tutorial uses [Starport](https://github.com/tendermint/starport) v0.16.2 The Starport tool is the easiest way to build a blockchain. 

To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.16.2! | bash
```

You can also use Starport v0.16.2 in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.16.2), but this tutorial assumes you are using a local Starport installation. For more installation options, see [install Starport](https://docs.starport.network/intro/install.html).

## Create the Blockchain

Scaffold a new blockchain called `interchange`

```bash
starport scaffold chain github.com/username/interchange --no-default-module
cd interchange
```

A new directory named interchange is created. This directory contains a working blockchain app.
Create a new IBC module next.

## Create the Module

Scaffold a module inside your blockchain named `ibcdex` with IBC capabilities.
The ibcdex module contains the logic for creating and maintaining order books and routing them through IBC to the second blockchain.

```bash
starport module create ibcdex --ibc --ordering unordered
```

## Create CRUD logic for Buy and Sell Order Books

To scaffold two types with create, read, update and delete (CRUD) actions use the Starport `type` command.
The following commands create `sellOrderBook` and `buyOrderBook` types. 

```bash
starport type sellOrderBook amountDenom priceDenom --indexed --no-message --module ibcdex
starport type buyOrderBook amountDenom priceDenom --indexed --no-message --module ibcdex
```

The values are: 

- `amountDenom` represents which token will be sold and in which quantity
- `priceDenom` the token selling price 

The flag `--indexed` flag creates an "indexed type". Without this flag, a type is implemented like a list with new items appended. Indexed types act like key-value stores.

The `--module ibcdex` flag specifies that the type should be scaffolded in the `ibcdex` module.

## Create the IBC Packets

Create three packets for IBC:

- an order book pair `create_pair` 
- a sell order `sell-order` 
- a buy order `buy-order`

```bash
starport packet createPair sourceDenom targetDenom --module ibcdex
starport packet sellOrder amountDenom amount:int priceDenom price:int --ack remainingAmount:int,gain:int --module ibcdex
starport packet buyOrder amountDenom amount:int priceDenom price:int --ack remainingAmount:int,purchase:int --module ibcdex
```

The optional `--ack` flag defines field names and types of the acknowledgment returned after the packet has been received by the target chain. Value of `--ack` is a comma-separated (no spaces) list of names with optional types appended after a colon.

## Cancel messages

Cancelling orders is done locally in the network, there is no packet to send.
Use the `message` command to create a message to cancel a sell or buy order.

```go
starport message cancel-sell-order port channel amountDenom priceDenom orderID:int --desc "Cancel a sell order" --module ibcdex
starport message cancel-buy-order port channel amountDenom priceDenom orderID:int --desc "Cancel a buy order" --module ibcdex
```

The optional `--desc` flag lets you define a description of the CLI command that is used to broadcast a transaction with the message.

## Trace the Denom

The token denoms must have the same behavior as described in the `ibc-transfer` module:

- An external token received from a chain has a unique `denom`, reffered to as `voucher`.
- When a token is sent to a blockchain and then sent back and received, the chain can resolve the voucher and convert it back to the original token denomination.

`Voucher` tokens are represented as hashes, therefore you must store which original denomination is related to a voucher, you can do this with an indexed type.

For a `voucher` you store: the source port ID, source channel ID and the original denom

```go
starport type denom-trace port channel origin --indexed --no-message --module ibcdex
```

## Create the Configuration

Add two config files `mars.yml` and `venus.yml` to test two blockchain networks with specific token for each.
Add the config files in the `interchange` folder.
The native denoms for Mars are `mcx`, also known as `marscoin`, and for Venus `vcx`, also known as `venuscoin`.

Create the `mars.yml` file with your content:

```yaml
# mars.yml
accounts:
  - name: alice
    coins: ["1000token", "100000000stake", "1000mcx"]
  - name: bob
    coins: ["500token", "1000mcx", "100000000stake"]
validator:
  name: alice
  staked: "100000000stake"
faucet:
  name: bob
  coins: ["5token", "100000stake"]
genesis:
  chain_id: "mars"
init:
  home: "$HOME/.mars"
```

Create the `venus.yml` file with your content:

```yaml
# venus.yml
accounts:
  - name: alice
    coins: ["1000token", "1000000000stake", "1000vcx"]
  - name: bob
    coins: ["500token", "1000vcx", "100000000stake"]
validator:
  name: alice
  staked: "100000000stake"
faucet:
  host: ":4501"
  name: bob
  coins: ["5token", "100000stake"]
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

Implement the code for the order book in the next chapter.

# Using the exchange

## Order Book

Using the exchange starts from creating a order book for a pair of tokens:

```
interchanged tx ibcdex send-create-pair [src-port] [src-channel] [sourceDenom] [targetDenom]

# Create pair broadcasted to the source blockchain
interchanged tx ibcdex send-create-pair ibcdex channel-0 mcx vcx
```

A pair of token is defined by two denominations: source denom (in this example, `mcx`) and target denom (`vcx`). Creating an orderbook affects state on the source blockchain (to which the transaction was broadcasted) and the target blockchain. On the source blockchain `send-create-pair` creates an empty sell order book and on the target blockchain a buy order book is created.

```yml
# Created a sell order book on the source blockchain
SellOrderBook:
- amountDenom: mcx
  creator: ""
  index: ibcdex-channel-0-mcx-vcx
  orderIdTrack: 0
  orders: []
  priceDenom: vcx
```

```yml
# Created a buy order book on the target blockchain
BuyOrderBook:
- amountDenom: mcx
  creator: ""
  index: ibcdex-channel-0-mcx-vcx
  orderIdTrack: 1
  orders: []
  priceDenom: vcx
```

To make it possible `createPair` first sends an IBC packet to the target chain. Upon receiving a packet the target chain creates a buy order book and sends back an acknowledgement to the source chain. Upon receiving an acknowledgement, the source chain creates a sell order book. Sending an IBC packet requires a user specify a port and a channel through which a packet will be transferred.

## Sell Order

Once an order book is created, the next step is to create a sell order:

```
interchanged tx ibcdex send-sell-order [src-port] [src-channel] [amountDenom] [amount] [priceDenom] [price]

# Sell order broadcasted to the source blockchain
interchanged tx ibcdex send-sell-order ibcdex channel-0 mcx 10 vcx 15
```

The `send-sell-order` command broadcasts a message that locks tokens on the source blockchain and creates a new sell order on the source blockchain.

```yml
# Source blockchain
balances:
- amount: "990" # decreased from 1000
  denom: mcx
SellOrderBook:
- amountDenom: mcx
  creator: ""
  index: ibcdex-channel-0-mcx-vcx
  orderIdTrack: 2
  orders: # a new sell order is created
  - amount: 10
    creator: cosmos1v3p3j7c64c4ls32pcjct333e8vqe45gwwa289q
    id: 0
    price: 15
  priceDenom: vcx
```

## Buy Order

A buy order has the same set of arguments: amount of tokens to be purchased and a price.

```
`interchanged tx ibcdex send-buy-order [src-port] [src-channel] [amountDenom] [amount] [priceDenom] [price]`

# Buy order broadcasted to the target blockchain
interchanged tx ibcdex send-buy-order ibcdex channel-0 mcx 10 vcx 5
```

The `send-buy-order` command locks tokens on the target blockchain and creates a buy order book on the target blockchain.

```yml
# Target blockchain
balances:
- amount: "950" # decreased from 1000
  denom: vcx
BuyOrderBook:
- amountDenom: mcx
  creator: ""
  index: ibcdex-channel-0-mcx-vcx
  orderIdTrack: 3
  orders: # a new buy order is created
  - amount: 10
    creator: cosmos1qlrz3peenc6s3xjv9k97e8ef72nk3qn3a0xax2
    id: 1
    price: 5
  priceDenom: vcx
```

## Performing an Exchange with a Sell Order

We now have two orders open for MCX: a sell order on the source chain (for 10mcx at 15vcx) and a buy order on the target chain (for 5mcx at 5vcx). Let's perform an exchange by sending a sell order to the source chain.

```
# Sell order broadcasted to the source chain
interchanged tx ibcdex send-sell-order ibcdex channel-0 mcx 5 vcx 3
```

The sell order (for 5mcx at 3vcx) was filled on the target chain by the buy order. The amount of the buy order on the target chain has decreased by 5mcx.

```yml
# Target blockchain
BuyOrderBook:
- amountDenom: mcx
  creator: ""
  index: ibcdex-channel-0-mcx-vcx
  orderIdTrack: 5
  orders:
  - amount: 5 # decreased from 10
    creator: cosmos1qlrz3peenc6s3xjv9k97e8ef72nk3qn3a0xax2
    id: 3
    price: 5
  priceDenom: vcx
```

The sender of the filled sell order exchanged 5mcx for 25 vcx vouchers. 25 vouchers is a product of the amount of the sell order (5mcx) and price of the buy order (5vcx).

```yml
# Source blockchain
balances:
- amount: "25" # increased from 0
  denom: ibc/50D70B7748FB8AA69F09114EC9E5615C39E07381FE80E628A1AF63A6F5C79833 # vcx voucher
- amount: "985" # decreased from 990
  denom: mcx
```

The counterparty (sender of the buy mcx order) received 5 mcx vouchers. vcx balance hasn't changed, because the correct amount of vcx (50) were locked at the creation of the buy order during the previous step.

```yml
# Target blockchain
balances:
- amount: "5" # increased from 0
  denom: ibc/99678A10AF684E33E88959727F2455AE42CCC64CD76ECFA9691E1B5A32342D33 # mcx voucher
```

## Performing an Exchange with a Buy Order

An order is sent to buy 5mcx for 15vcx.

```
# Buy order broadcasted to the target chain
interchanged tx ibcdex send-buy-order ibcdex channel-0 mcx 5 vcx 15
```

A buy order is immediately filled on the source chain and sell order creator recived 75 vcx vouchers. The sell order amount is decreased by the amount of the filled buy order (by 5mcx).

```yml
# Source blockchain
balances:
- amount: "100" # increased from 25
  denom: ibc/50D70B7748FB8AA69F09114EC9E5615C39E07381FE80E628A1AF63A6F5C79833 # vcx voucher
SellOrderBook:
- amountDenom: mcx
  creator: ""
  index: ibcdex-channel-0-mcx-vcx
  orderIdTrack: 4
  orders:
  - amount: 5 # decreased from 10
    creator: cosmos1v3p3j7c64c4ls32pcjct333e8vqe45gwwa289q
    id: 2
    price: 15
  priceDenom: vcx
```

Creator of the buy order received 5 mcx vouchers for 75 vcx (5mcx * 15vcx).

```yml
# Target blockchain
balances:
- amount: "10" # increased from 5
  denom: ibc/99678A10AF684E33E88959727F2455AE42CCC64CD76ECFA9691E1B5A32342D33 # mcx vouchers
- amount: "875" # decreased from 950
  denom: vcx
```

## Complete Exchange with a Partially Filled Sell Order

An order is sent to sell 10mcx for 3vcx.

```
# Source blockchain
interchanged tx ibcdex send-sell-order ibcdex channel-0 mcx 10 vcx 3
```

The sell amount is 10mcx, but the opened buy order amount is only 5mcx. The buy order gets filled completely and removed from the order book. The author of the previously created buy order recived 10 mcx vouchers from the exchange.

```yml
# Target blockchain
balances:
- amount: "15" # increased from 5
  denom: ibc/99678A10AF684E33E88959727F2455AE42CCC64CD76ECFA9691E1B5A32342D33 # mcx voucher
BuyOrderBook:
- amountDenom: mcx
  creator: ""
  index: ibcdex-channel-0-mcx-vcx
  orderIdTrack: 5
  orders: [] # buy order with amount 5mcx has been closed
  priceDenom: vcx
```

The author of the sell order successfuly exchanged 5 mcx and recived 25 vcx vouchers. The other 5mcx created a sell order.

```yml
# Source blockchain
balances:
- amount: "125" # increased from 100
  denom: ibc/50D70B7748FB8AA69F09114EC9E5615C39E07381FE80E628A1AF63A6F5C79833 # vcx vouchers
- amount: "975" # decreased from 985
  denom: mcx
- amountDenom: mcx
SellOrderBook:
  creator: ""
  index: ibcdex-channel-0-mcx-vcx
  orderIdTrack: 6
  orders:
  - amount: 5 # hasn't changed
    creator: cosmos1v3p3j7c64c4ls32pcjct333e8vqe45gwwa289q
    id: 2
    price: 15
  - amount: 5 # new order is created
    creator: cosmos1v3p3j7c64c4ls32pcjct333e8vqe45gwwa289q
    id: 4
    price: 3
```

## Complete Exchange with a Partially Filled Buy Order

An order is created to buy 10 mcx for 5 vcx.

```
# Target blockchain
interchanged tx ibcdex send-buy-order ibcdex channel-0 mcx 10 vcx 5
```

The buy order is partially filled for 5mcx. An existing sell order for 5 mcx (with a price of 3 vcx) on the source chain has been completely filled and removed from the order book. The author of the closed sell order recived 15 vcx vouchers (product of 5mcx and 3vcx).

```yml
# Source blockchain
balances:
- amount: "140" # increased from 125
  denom: ibc/50D70B7748FB8AA69F09114EC9E5615C39E07381FE80E628A1AF63A6F5C79833 # vcx vouchers
SellOrderBook:
- amountDenom: mcx
  creator: ""
  index: ibcdex-channel-0-mcx-vcx
  orderIdTrack: 6
  orders:
  - amount: 5 # order hasn't changed
    creator: cosmos1v3p3j7c64c4ls32pcjct333e8vqe45gwwa289q
    id: 2
    price: 15
  # a sell order for 5 mcx has been closed
  priceDenom: vcx
```

Author of buy order recieves 5 mcx vouchers and 50 vcx of their tokens get locked. The 5mcx amount not filled by the sell order creates a buy order on the target chain.

```yml
# Target blockchain
balances:
- amount: "20" # increased from 15
  denom: ibc/99678A10AF684E33E88959727F2455AE42CCC64CD76ECFA9691E1B5A32342D33 # mcx vouchers
- amount: "825" # decreased from 875
  denom: vcx
BuyOrderBook:
- amountDenom: mcx
  creator: ""
  index: ibcdex-channel-0-mcx-vcx
  orderIdTrack: 7
  orders:
  - amount: 5 # new buy order is created
    creator: cosmos1qlrz3peenc6s3xjv9k97e8ef72nk3qn3a0xax2
    id: 5
    price: 5
  priceDenom: vcx
```

## Cancelling Orders

After the exchanges we have two orders open: sell order on the source chain (5mcx for 15vcx) and a buy order on the target chain (5mcx for 5vcx).

Cancelling a sell order:

```
# Source blockchain
interchanged tx ibcdex cancel-sell-order ibcdex channel-0 mcx vcx 2
```

```yml
# Source blockchain
balances:
- amount: "980" # increased from 975
  denom: mcx
```

Sell order book on the source blokchain is now empty.

Cancelling a buy order:

```
# Target blockchain
interchanged tx ibcdex cancel-buy-order ibcdex channel-0 mcx vcx 5
```

```yml
# Target blockchain
balances:
- amount: "850" # increased from 825
  denom: vcx
```

Buy order book on the target blokchain is now empty.

# Creating Order Books

In this chapter you will implement the logic for creating order books.

In Cosmos SDK the state is stored in a key-value store. Each order book will be stored under a unique key composed of four values: port ID, channel ID, source denom and target denom. For example, an order book for `mcx` and `vcx` could be stored under `ibcdex-channel-4-mcx-vcx`. Define a function that returns an order book store key.

```go
// x/ibcdex/types/keys.go
import "fmt"

//...
func OrderBookIndex( portID string, channelID string, sourceDenom string, targetDenom string, ) string {
  return fmt.Sprintf("%s-%s-%s-%s", portID, channelID, sourceDenom, targetDenom, )
}
```

`send-create-pair` is used to create order books. This command creates and broadcasts a transaction with a message of type `SendCreatePair`. The message gets routed to the `ibcdex` module, processed by the message handler in `x/ibcdex/handler.go` and finally a `SendCreatePair` keeper method is called.

You need `send-create-pair` to do the following:

* When processing `SendCreatePair` message on the source chain
  * Check that an order book with the given pair of denoms does not yet exist
  * Transmit an IBC packet with information about port, channel, source and target denoms
* Upon receiving the packet on the target chain
  * Check that an order book with the given pair of denoms does not yet exist on the target chain
  * Create a new order book for buy orders
  * Transmit an IBC acknowledgement back to the source chain
* Upon receiving the acknowledgement on the source chain
  * Create a new order book for sell orders

## `SendCreatePair` Message Handling

`SendCreatePair` function was created during the IBC packet scaffolding. Currently, it creates an IBC packet, populates it with source and target denoms and transmits this packet over IBC. Add the logic to check for an existing order book for a particular pair of denoms.

```go
// x/ibcdex/keeper/msg_server_create_pair.go
import "errors"

//...

func (k msgServer) SendCreatePair(goCtx context.Context, msg *types.MsgSendCreatePair) (*types.MsgSendCreatePairResponse, error) {
  ctx := sdk.UnwrapSDKContext(goCtx)
  // Get an order book index
  pairIndex := types.OrderBookIndex(msg.Port, msg.ChannelID, msg.SourceDenom, msg.TargetDenom)
  // If an order book is found, return an error
  _, found := k.GetSellOrderBook(ctx, pairIndex)
  if found {
    return &types.MsgSendCreatePairResponse{}, errors.New("the pair already exist")
  }
  // ...
}
```

## Lifecycle of an IBC Packet

During a successful transmission, an IBC packet goes through 4 stages:

1. Message processing before packet transmission (on the source cahin)
2. Reception of a packet (on the target chain)
3. Acknowledgment of a packet (on the source chain)
4. Timeout of a packet (on the source chain)

In the following section you'll be implementing packet reception logic in the `OnRecvCreatePairPacket` function and packet acknowledgement logic in the `OnAcknowledgementCreatePairPacket` function. Timeout function will be left empty.

## `OnRecv`

On the target chain when an IBC packet is recieved, the module should check whether a book already exists, if not, create a new buy order book for specified denoms.

```go
// x/ibcdex/keeper/create_pair.go
func (k Keeper) OnRecvCreatePairPacket(ctx sdk.Context, packet channeltypes.Packet, data types.CreatePairPacketData) (packetAck types.CreatePairPacketAck, err error) {
  // ...
  // Get an order book index
  pairIndex := types.OrderBookIndex(packet.SourcePort, packet.SourceChannel, data.SourceDenom, data.TargetDenom)
  // If an order book is found, return an error
  _, found := k.GetBuyOrderBook(ctx, pairIndex)
  if found {
    return packetAck, errors.New("the pair already exist")
  }
  // Create a new buy order book for source and target denoms
  book := types.NewBuyOrderBook(data.SourceDenom, data.TargetDenom)
  // Assign order book index
  book.Index = pairIndex
  // Save the order book to the store
  k.SetBuyOrderBook(ctx, book)
  return packetAck, nil
}
```

Define `NewBuyOrderBook` creates a new buy order book.

```go
 // x/ibcdex/types/buy_order_book.go
func NewBuyOrderBook(AmountDenom string, PriceDenom string) BuyOrderBook {
	book := NewOrderBook()
	return BuyOrderBook{
		AmountDenom: AmountDenom,
		PriceDenom: PriceDenom,
		Book: &book,
	}
}
```

Modify the buy_order_book.proto file to have the fields for creating a buy order on the order book.

```proto
// proto/ibcdex/buy_order_book.proto
import "ibcdex/order.proto";

message BuyOrderBook {
  // ...
  OrderBook book = 6;
}
```

```go
// x/ibcdex/types/order_book.go
func NewOrderBook() OrderBook {
	return OrderBook{
		IdCount: 0,
	}
}
```

The protocol buffer definition defines the data that an order book has. Add the `OrderBook` and `Order` messages to the `order.proto` file.

```proto
// proto/ibcdex/order.proto
syntax = "proto3";
package username.interchange.ibcdex;

option go_package = "github.com/username/interchange/x/ibcdex/types";

message OrderBook {
  int32 idCount = 1;
  repeated Order orders = 2;
}

message Order {
  int32 id = 1;
  string creator = 2;
  int32 amount = 3;
  int32 price = 4;
}
```

## `OnAcknowledgement`

On the source chain when an IBC acknowledgement is recieved, the module should check whether a book already exists, if not, create a new sell order book for specified denoms.

```go
// x/ibcdex/keeper/create_pair.go
func (k Keeper) OnAcknowledgementCreatePairPacket(ctx sdk.Context, packet channeltypes.Packet, data types.CreatePairPacketData, ack channeltypes.Acknowledgement) error {
	switch dispatchedAck := ack.Response.(type) {
	case *channeltypes.Acknowledgement_Error:
		return nil
	case *channeltypes.Acknowledgement_Result:
		// Decode the packet acknowledgment
		var packetAck types.CreatePairPacketAck
		if err := types.ModuleCdc.UnmarshalJSON(dispatchedAck.Result, &packetAck); err != nil {
			// The counter-party module doesn't implement the correct acknowledgment format
			return errors.New("cannot unmarshal acknowledgment")
		}
		// Set the sell order book
		pairIndex := types.OrderBookIndex(packet.SourcePort, packet.SourceChannel, data.SourceDenom, data.TargetDenom)
		book := types.NewSellOrderBook(data.SourceDenom, data.TargetDenom)
		book.Index = pairIndex
		k.SetSellOrderBook(ctx, book)
		return nil
	default:
		// The counter-party module doesn't implement the correct acknowledgment format
		return errors.New("invalid acknowledgment format")
	}
}
```

`NewSellOrderBook` creates a new sell order book.

```go
// x/ibcdex/types/sell_order_book.go
func NewSellOrderBook(AmountDenom string, PriceDenom string) SellOrderBook {
	book := NewOrderBook()
	return SellOrderBook{
		AmountDenom: AmountDenom,
		PriceDenom: PriceDenom,
		Book: &book,
	}
}
```

Modify the `sell_order_book.proto` file to add the order book into the buy order book. The proto definition for the `SellOrderBook` should look like follows:

```proto
// proto/ibcdex/sell_order_book.proto
// ...
import "ibcdex/order.proto";

message SellOrderBook {
  // ...
  OrderBook book = 6;
}
```

In this chapter we implemented the logic behind `send-create-pair` command that upon recieving of an IBC packet on the target chain creates a buy order book and upon recieving of an IBC acknowledgement on the source chain creates a sell order book.

# Creating Sell Orders

In this chapter you will implement the logic for creating sell orders.

The packet proto file for a sell order is already generated. Add the seller information.

```proto
// proto/ibcdex/packet.proto
message SellOrderPacketData {
  // ...
  string seller = 5;
}
```

## `SendSellOrder` Message Handling

Sell orders are created using `send-sell-order`. This command creates a transaction with a `SendSellOrder` message, which triggers the `SendSellOrder` keeper method.

`SendSellOrder` should:

* Check that an order book for specified denom pair exists
* Safely burn or lock tokens
  * If the token is an IBC token, burn the tokens
  * If the token is a native token, lock the tokens
* Save the voucher received on the target chain to later resolve a denom
* Transmit an IBC packet to the target chain

```go
// x/ibcdex/keeper/msg_server_sell_order.go
import "errors"

func (k msgServer) SendSellOrder(goCtx context.Context, msg *types.MsgSendSellOrder) (*types.MsgSendSourceSellOrderResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	// If an order book doesn't exist, throw an error
	pairIndex := types.OrderBookIndex(msg.Port, msg.ChannelID, msg.AmountDenom, msg.PriceDenom)
	_, found := k.GetSellOrderBook(ctx, pairIndex)
	if !found {
		return &types.MsgSendSellOrderResponse{}, errors.New("the pair doesn't exist")
	}
	// Get sender's address
	sender, err := sdk.AccAddressFromBech32(msg.Sender)
	if err != nil {
		return &types.MsgSendSellOrderResponse{}, err
	}
	// Use SafeBurn to ensure no new native tokens are minted
	if err := k.SafeBurn(ctx, msg.Port, msg.ChannelID, sender, msg.AmountDenom, msg.Amount); err != nil {
		return &types.MsgSendSellOrderResponse{}, err
	}
	// Save the voucher received on the other chain, to have the ability to resolve it into the original denom
	k.SaveVoucherDenom(ctx, msg.Port, msg.ChannelID, msg.AmountDenom)
	var packet types.SellOrderPacketData
	packet.Seller = msg.Sender
	packet.AmountDenom = msg.AmountDenom
	packet.Amount = msg.Amount
	packet.PriceDenom = msg.PriceDenom
	packet.Price = msg.Price
	// Transmit the packet
	err = k.TransmitSellOrderPacket(ctx, packet, msg.Port, msg.ChannelID, clienttypes.ZeroHeight(), msg.TimeoutTimestamp)
	if err != nil {
		return nil, err
	}
	return &types.MsgSendSellOrderResponse{}, nil
}
```

`SendSellOrder` depends on two new keeper methods: `SafeBurn` and `SaveVoucherDenom`.

### `SafeBurn`

`SafeBurn` burns tokens if they are IBC vouchers (have an `ibc/` prefix) and locks tokens if they are native to the chain.

```go
// x/ibcdex/keeper/mint.go
package keeper

import (
  "fmt"
  sdk "github.com/cosmos/cosmos-sdk/types"
  ibctransfertypes "github.com/cosmos/cosmos-sdk/x/ibc/applications/transfer/types"
  "github.com/username/interchange/x/ibcdex/types"
  "strings"
)

// isIBCToken checks if the token came from the IBC module
func isIBCToken(denom string) bool {
  return strings.HasPrefix(denom, "ibc/")
}

func (k Keeper) SafeBurn(ctx sdk.Context, port string, channel string, sender sdk.AccAddress, denom string, amount int32) error {
  if isIBCToken(denom) {
    // Burn the tokens
    if err := k.BurnTokens(ctx, sender, sdk.NewCoin(denom, sdk.NewInt(int64(amount)))); err != nil {
      return err
    }
  } else {
    // Lock the tokens
    if err := k.LockTokens(ctx, port, channel, sender, sdk.NewCoin(denom, sdk.NewInt(int64(amount)))); err != nil {
      return err
    }
  }
  return nil
}
```

Implement the `BurnTokens` keeper method.

```go
// x/ibcdex/keeper/mint.go
func (k Keeper) BurnTokens(ctx sdk.Context, sender sdk.AccAddress, tokens sdk.Coin) error {
  // transfer the coins to the module account and burn them
	if err := k.bankKeeper.SendCoinsFromAccountToModule(ctx, sender, types.ModuleName, sdk.NewCoins(tokens)); err != nil {
		return err
	}
  if err := k.bankKeeper.BurnCoins(
    ctx, types.ModuleName, sdk.NewCoins(tokens),
  ); err != nil {
    // NOTE: should not happen as the module account was
    // retrieved on the step above and it has enough balance
    // to burn.
    panic(fmt.Sprintf("cannot burn coins after a successful send to a module account: %v", err))
  }

  return nil
}
```

Implement the `LockTokens` keeper method.

```go
// x/ibcdex/keeper/mint.go
func (k Keeper) LockTokens(ctx sdk.Context, sourcePort string, sourceChannel string, sender sdk.AccAddress, tokens sdk.Coin) error {
  // create the escrow address for the tokens
  escrowAddress := ibctransfertypes.GetEscrowAddress(sourcePort, sourceChannel)
  // escrow source tokens. It fails if balance insufficient
  if err := k.bankKeeper.SendCoins(
    ctx, sender, escrowAddress, sdk.NewCoins(tokens),
  ); err != nil {
    return err
  }
  return nil
}
```

`BurnTokens` and `LockTokens` use `SendCoinsFromAccountToModule`, `BurnCoins`, and `SendCoins` keeper methods of the `bank` module. To start using these function from the `ibcdex` module, first add them to the `BankKeeper` interface.

```go
// x/ibcdex/types/expected_keeper.go
package types

import sdk "github.com/cosmos/cosmos-sdk/types"

// BankKeeper defines the expected bank keeper
type BankKeeper interface {
  SendCoinsFromAccountToModule(ctx sdk.Context, senderAddr sdk.AccAddress, recipientModule string, amt sdk.Coins) error
  BurnCoins(ctx sdk.Context, moduleName string, amt sdk.Coins) error
  SendCoins(ctx sdk.Context, fromAddr sdk.AccAddress, toAddr sdk.AccAddress, amt sdk.Coins) error
}
```

Next, in the `keeper` directory, specify the bank so that you can access it in your module. 

```go
// x/ibcdex/keeper/keeper.go
type (
  Keeper struct {
    // ...
    bankKeeper types.BankKeeper
  }
)

func NewKeeper(
  // ...
  bankKeeper types.BankKeeper,
) *Keeper {
  return &Keeper{
    // ...
    bankKeeper: bankKeeper,
  }
}
```

Lastly, the `app.go` file that describes which modules are used in the blockchain application, add the bank keeper to the `ibcdexKeeper`

```go
// app/app.go
app.ibcdexKeeper = *ibcdexkeeper.NewKeeper(
  // ...
  app.BankKeeper,
)
```

The `ibcdex` module will need to mint and burn token using the `bank` account. The use this feature, the module must have a _module account_. To enable the _module account_ declare this permission in the _module account permissions_ structure of the auth module.

```go
// app/app.go
maccPerms = map[string][]string{
    // ...
    ibcdextypes.ModuleName: {authtypes.Minter, authtypes.Burner},
}
```

### `SaveVoucherDenom`

`SaveVoucherDenom` saves the voucher denom to be able to convert it back later.

```go
// x/ibcdex/keeper/denom.go
func (k Keeper) SaveVoucherDenom(ctx sdk.Context, port string, channel string, denom string) {
	voucher := VoucherDenom(port, channel, denom)

	// Store the origin denom
	_, saved := k.GetDenomTrace(ctx, voucher)
	if !saved {
		k.SetDenomTrace(ctx, types.DenomTrace{
			Index:   voucher,
			Port:    port,
			Channel: channel,
			Origin:  denom,
		})
	}
}
```

Finally, last function we need to implement is `VoucherDenom`. `VoucherDenom` returns the voucher of the denom from the port ID and channel ID.

```go
// x/ibcdex/keeper/denom.go
import (
  sdk "github.com/cosmos/cosmos-sdk/types"
  ibctransfertypes "github.com/cosmos/cosmos-sdk/x/ibc/applications/transfer/types"
  "github.com/username/interchange/x/ibcdex/types"
)

func VoucherDenom(port string, channel string, denom string) string {
  // since SendPacket did not prefix the denomination, we must prefix denomination here
  sourcePrefix := ibctransfertypes.GetDenomPrefix(port, channel)
  // NOTE: sourcePrefix contains the trailing "/"
  prefixedDenom := sourcePrefix + denom
  // construct the denomination trace from the full raw denomination
  denom-trace := ibctransfertypes.ParseDenomTrace(prefixedDenom)
  voucher := denom-trace.IBCDenom()
  return voucher[:16]
}
```

## `OnRecv`

When a "sell order" packet is received on the target chain, the module should  ????

- Update the sell order book
- Distribute sold token to the buyer
- Send to chain A the sell order after the fill attempt

```go
// x/ibcdex/keeper/sell_order.go
func (k Keeper) OnRecvSellOrderPacket(ctx sdk.Context, packet channeltypes.Packet, data types.SellOrderPacketData) (packetAck types.SellOrderPacketAck, err error) {
	if err := data.ValidateBasic(); err != nil {
		return packetAck, err
	}
	pairIndex := types.OrderBookIndex(packet.SourcePort, packet.SourceChannel, data.AmountDenom, data.PriceDenom)
	book, found := k.GetBuyOrderBook(ctx, pairIndex)
	if !found {
		return packetAck, errors.New("the pair doesn't exist")
	}
	// Fill sell order
	remaining, liquidated, gain, _ := book.FillSellOrder(types.Order{
		Amount: data.Amount,
		Price:  data.Price,
	})
	// Return remaining amount and gains
	packetAck.RemainingAmount = remaining.Amount
	packetAck.Gain = gain
	// Before distributing sales, we resolve the denom
	// First we check if the denom received comes from this chain originally
	finalAmountDenom, saved := k.OriginalDenom(ctx, packet.DestinationPort, packet.DestinationChannel, data.AmountDenom)
	if !saved {
		// If it was not from this chain we use voucher as denom
		finalAmountDenom = VoucherDenom(packet.SourcePort, packet.SourceChannel, data.AmountDenom)
	}
	// Dispatch liquidated buy orders
	for _, liquidation := range liquidated {
		liquidation := liquidation
		addr, err := sdk.AccAddressFromBech32(liquidation.Creator)
		if err != nil {
			return packetAck, err
		}
		if err := k.SafeMint(ctx, packet.DestinationPort, packet.DestinationChannel, addr, finalAmountDenom, liquidation.Amount); err != nil {
			return packetAck, err
		}
	}
	// Save the new order book
	k.SetBuyOrderBook(ctx, book)
	return packetAck, nil
}
```

### `FillSellOrder`

`FillSellOrder` try to fill the sell order with the order book and returns all the side effects.

```go
// x/ibcdex/types/buy_order_book.go
func (b *BuyOrderBook) FillSellOrder(order Order) (remainingSellOrder Order, liquidated []Order, gain int32, filled bool) {
	var liquidatedList []Order
	totalGain := int32(0)
	remainingSellOrder = order
	// Liquidate as long as there is match
	for {
		var match bool
		var liquidation Order
		remainingSellOrder, liquidation, gain, match, filled = b.LiquidateFromSellOrder(
			remainingSellOrder,
		)
		if !match {
			break
		}
		// Update gains
		totalGain += gain
		// Update liquidated
		liquidatedList = append(liquidatedList, liquidation)
		if filled {
			break
		}
	}
	return remainingSellOrder, liquidatedList, totalGain, filled
}
```

#### `LiquidateFromSellOrder`

`LiquidateFromSellOrder` liquidates the first buy order of the book from the sell order if no match is found, return false for match.

```go
// x/ibcdex/types/buy_order_book.go
func (b *BuyOrderBook) LiquidateFromSellOrder(order Order) ( remainingSellOrder Order, liquidatedBuyOrder Order, gain int32, match bool, filled bool) {
  remainingSellOrder = order
  // No match if no order
  orderCount := len(b.Book.Orders)
  if orderCount == 0 {
    return order, liquidatedBuyOrder, gain, false, false
  }
  // Check if match
  highestBid := b.Book.Orders[orderCount-1]
  if order.Price > highestBid.Price {
    return order, liquidatedBuyOrder, gain, false, false
  }
  liquidatedBuyOrder = *highestBid
  // Check if sell order can be entirely filled
  if highestBid.Amount >= order.Amount {
    remainingSellOrder.Amount = 0
    liquidatedBuyOrder.Amount = order.Amount
    gain = order.Amount * highestBid.Price
    // Remove highest bid if it has been entirely liquidated
    highestBid.Amount -= order.Amount
    if highestBid.Amount == 0 {
      b.Book.Orders = b.Book.Orders[:orderCount-1]
    } else {
      b.Book.Orders[orderCount-1] = highestBid
    }
    return remainingSellOrder, liquidatedBuyOrder, gain, true, true
  }
  // Not entirely filled
  gain = highestBid.Amount * highestBid.Price
  b.Book.Orders = b.Book.Orders[:orderCount-1]
  remainingSellOrder.Amount -= highestBid.Amount
  return remainingSellOrder, liquidatedBuyOrder, gain, true, false
}
```

### `OriginalDenom`

`OriginalDenom` returns back the original denom of the voucher. False is returned if the port ID and channel ID provided are not the origins of the voucher

```go
// x/ibcdex/keeper/denom.go
func (k Keeper) OriginalDenom(ctx sdk.Context, port string, channel string, voucher string) (string, bool) {
	trace, exist := k.GetDenomTrace(ctx, voucher)
	if exist {
		// Check if original port and channel
		if trace.Port == port && trace.Channel == channel {
			return trace.Origin, true
		}
	}
	// Not the original chain
	return "", false
}
```

If a token is an IBC token (has an `ibc/` prefix) `SafeMint` mints IBC tokens with `MintTokens`, otherwise, it unlocks native tokens with `UnlockTokens`.

### `SafeMint`

```go
// x/ibcdex/keeper/mint.go
func (k Keeper) SafeMint(ctx sdk.Context, port string, channel string, receiver sdk.AccAddress, denom string, amount int32) error {
	if isIBCToken(denom) {
		// Mint IBC tokens
		if err := k.MintTokens(ctx, receiver, sdk.NewCoin(denom, sdk.NewInt(int64(amount)))); err != nil {
			return err
		}
	} else {
		// Unlock native tokens
		if err := k.UnlockTokens(
			ctx,
			port,
			channel,
			receiver,
			sdk.NewCoin(denom, sdk.NewInt(int64(amount))),
		); err != nil {
			return err
		}
	}
	return nil
}
```

#### `MintTokens`

```go
// x/ibcdex/keeper/mint.go
func (k Keeper) MintTokens(ctx sdk.Context, receiver sdk.AccAddress, tokens sdk.Coin) error {
	// mint new tokens if the source of the transfer is the same chain
	if err := k.bankKeeper.MintCoins(
		ctx, types.ModuleName, sdk.NewCoins(tokens),
	); err != nil {
		return err
	}
	// send to receiver
	if err := k.bankKeeper.SendCoinsFromModuleToAccount(
		ctx, types.ModuleName, receiver, sdk.NewCoins(tokens),
	); err != nil {
		panic(fmt.Sprintf("unable to send coins from module to account despite previously minting coins to module account: %v", err))
	}
	return nil
}
```

`MintTokens` uses two keeper methods from the `bank` module: `MintCoins` and `SendCoinsFromModuleToAccount`. Import them by adding their signatures to the `BankKeeper` interface.

```go
// x/ibcdex/types/expected_keeper.go
type BankKeeper interface {
  // ...
	MintCoins(ctx sdk.Context, moduleName string, amt sdk.Coins) error
	SendCoinsFromModuleToAccount(ctx sdk.Context, senderModule string, recipientAddr sdk.AccAddress, amt sdk.Coins) error
}
```

```go
// x/ibcdex/keeper/mint.go
func (k Keeper) UnlockTokens(ctx sdk.Context, sourcePort string, sourceChannel string, receiver sdk.AccAddress, tokens sdk.Coin) error {
	// create the escrow address for the tokens
	escrowAddress := ibctransfertypes.GetEscrowAddress(sourcePort, sourceChannel)
	// escrow source tokens. It fails if balance insufficient
	if err := k.bankKeeper.SendCoins(
		ctx, escrowAddress, receiver, sdk.NewCoins(tokens),
	); err != nil {
		return err
	}
	return nil
}
```

## `OnAcknowledgement`

Once an IBC packet is processed on the target chain, an acknowledgement is returned to the source chain and processed in `OnAcknowledgementSellOrderPacket`. The module on the source chain will store the remaining sell order in the sell order book and will distribute sold tokens to the buyers and will distribute to the seller the price of the amount sold. On error the module mints the burned tokens.

```go
// x/ibcdex/keeper/sell_order.go
func (k Keeper) OnAcknowledgementSellOrderPacket(ctx sdk.Context, packet channeltypes.Packet, data types.SellOrderPacketData, ack channeltypes.Acknowledgement) error {
	switch dispatchedAck := ack.Response.(type) {
	case *channeltypes.Acknowledgement_Error:
		// In case of error we mint back the native token
		receiver, err := sdk.AccAddressFromBech32(data.Seller)
		if err != nil {
			return err
		}
		if err := k.SafeMint(ctx, packet.SourcePort, packet.SourceChannel, receiver, data.AmountDenom, data.Amount); err != nil {
			return err
		}
		return nil
	case *channeltypes.Acknowledgement_Result:
		// Decode the packet acknowledgment
		var packetAck types.SellOrderPacketAck
		if err := types.ModuleCdc.UnmarshalJSON(dispatchedAck.Result, &packetAck); err != nil {
			// The counter-party module doesn't implement the correct acknowledgment format
			return errors.New("cannot unmarshal acknowledgment")
		}
		// Get the sell order book
		pairIndex := types.OrderBookIndex(packet.SourcePort, packet.SourceChannel, data.AmountDenom, data.PriceDenom)
		book, found := k.GetSellOrderBook(ctx, pairIndex)
		if !found {
			panic("sell order book must exist")
		}
		// Append the remaining amount of the order
		if packetAck.RemainingAmount > 0 {
			_, err := book.AppendOrder(data.Seller, packetAck.RemainingAmount, data.Price)
			if err != nil {
				return err
			}
			// Save the new order book
			k.SetSellOrderBook(ctx, book)
		}
		// Mint the gains
		if packetAck.Gain > 0 {
			receiver, err := sdk.AccAddressFromBech32(data.Seller)
			if err != nil {
				return err
			}
			finalPriceDenom, saved := k.OriginalDenom(ctx, packet.SourcePort, packet.SourceChannel, data.PriceDenom)
			if !saved {
				// If it was not from this chain we use voucher as denom
				finalPriceDenom = VoucherDenom(packet.DestinationPort, packet.DestinationChannel, data.PriceDenom)
			}
			if err := k.SafeMint(ctx, packet.SourcePort, packet.SourceChannel, receiver, finalPriceDenom, packetAck.Gain); err != nil {
				return err
			}
		}
		return nil
	default:
		// The counter-party module doesn't implement the correct acknowledgment format
		return errors.New("invalid acknowledgment format")
	}
}
```

```go
// x/ibcdex/types/sell_order_book.go
func (s *SellOrderBook) AppendOrder(creator string, amount int32, price int32) (int32, error) {
	return s.Book.appendOrder(creator, amount, price, Decreasing)
}
```

### `appendOrder` Implementation

```go
// x/ibcdex/types/order_book.go
package types

import (
	"errors"
	"sort"
)

const (
	MaxAmount = int32(100000)
	MaxPrice  = int32(100000)
)

type Ordering int

const (
	Increasing Ordering = iota
	Decreasing
)

var (
	ErrMaxAmount     = errors.New("max amount reached")
	ErrMaxPrice      = errors.New("max price reached")
	ErrZeroAmount    = errors.New("amount is zero")
	ErrZeroPrice     = errors.New("price is zero")
	ErrOrderNotFound = errors.New("order not found")
)
```

`AppendOrder` initializes and appends a new order to an order book from the order information.

```go
// x/ibcdex/types/order_book.go
func (book *OrderBook) appendOrder(creator string, amount int32, price int32, ordering Ordering) (int32, error) {
	if err := checkAmountAndPrice(amount, price); err != nil {
		return 0, err
	}
	// Initialize the order
	var order Order
	order.Id = book.GetNextOrderID()
	order.Creator = creator
	order.Amount = amount
	order.Price = price
	// Increment ID tracker
	book.IncrementNextOrderID()
	// Insert the order
	book.insertOrder(order, ordering)
	return order.Id, nil
}
```

#### `checkAmountAndPrice`

`checkAmountAndPrice` checks correct amount or price.

```go
// x/ibcdex/types/order_book.go
func checkAmountAndPrice(amount int32, price int32) error {
	if amount == int32(0) {
		return ErrZeroAmount
	}
	if amount > MaxAmount {
		return ErrMaxAmount
	}
	if price == int32(0) {
		return ErrZeroPrice
	}
	if price > MaxPrice {
		return ErrMaxPrice
	}
	return nil
}
```

#### `GetNextOrderID`

`GetNextOrderID` gets the ID of the next order to append

```go
// x/ibcdex/types/order_book.go
func (book OrderBook) GetNextOrderID() int32 {
	return book.IdCount
}
```

#### `IncrementNextOrderID`

`IncrementNextOrderID` updates the ID count for orders

```go
// x/ibcdex/types/order_book.go
func (book *OrderBook) IncrementNextOrderID() {
	// Even numbers to have different ID than buy orders
	book.IdCount++
}
```

#### `insertOrder`

`insertOrder` inserts the order in the book with the provided order

```go
// x/ibcdex/types/order_book.go
func (book *OrderBook) insertOrder(order Order, ordering Ordering) {
	if len(book.Orders) > 0 {
		var i int
		// get the index of the new order depending on the provided ordering
		if ordering == Increasing {
			i = sort.Search(len(book.Orders), func(i int) bool { return book.Orders[i].Price > order.Price })
		} else {
			i = sort.Search(len(book.Orders), func(i int) bool { return book.Orders[i].Price < order.Price })
		}
		// insert order
		orders := append(book.Orders, &order)
		copy(orders[i+1:], orders[i:])
		orders[i] = &order
		book.Orders = orders
	} else {
		book.Orders = append(book.Orders, &order)
	}
}
```

## `OnTimeout`

If a timeout occurs, we mint back the native token.

```go
// x/ibcdex/keeper/sell_order.go
func (k Keeper) OnTimeoutSellOrderPacket(ctx sdk.Context, packet channeltypes.Packet, data types.SellOrderPacketData) error {
	// In case of error we mint back the native token
	receiver, err := sdk.AccAddressFromBech32(data.Seller)
	if err != nil {
		return err
	}
	if err := k.SafeMint(ctx, packet.SourcePort, packet.SourceChannel, receiver, data.AmountDenom, data.Amount); err != nil {
		return err
	}
	return nil
}
```

# Creating Buy Orders

In this chapter you will be implementing creation of buy orders. The logic is very similar to the previous chapter.

## Modify the Proto Definition

Add the buyer to the proto file definition

```proto
// proto/ibcdex/packet.proto
message BuyOrderPacketData {
  // ...
  string buyer = 5;
}
```

## `SendBuyOrder` Message Handling

* Check if the pair exists on the order book
* If the token is an IBC token, burn the tokens
* If the token is a native token, lock the tokens
* Save the voucher received on the target chain to later resolve a denom

```go
// x/ibcdex/keeper/msg_server_buyOrder.go
import "errors"

func (k msgServer) SendBuyOrder(goCtx context.Context, msg *types.MsgSendBuyOrder) (*types.MsgSendBuyOrderResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	// Cannot send a order if the pair doesn't exist
	pairIndex := types.OrderBookIndex(msg.Port, msg.ChannelID, msg.AmountDenom, msg.PriceDenom)
	_, found := k.GetBuyOrderBook(ctx, pairIndex)
	if !found {
		return &types.MsgSendBuyOrderResponse{}, errors.New("the pair doesn't exist")
	}
	// Lock the token to send
	sender, err := sdk.AccAddressFromBech32(msg.Sender)
	if err != nil {
		return &types.MsgSendBuyOrderResponse{}, err
	}
  // Use SafeBurn to ensure no new native tokens are minted
	if err := k.SafeBurn(ctx, msg.Port, msg.ChannelID, sender, msg.PriceDenom, msg.Amount*msg.Price); err != nil {
		return &types.MsgSendBuyOrderResponse{}, err
	}
	// Save the voucher received on the other chain, to have the ability to resolve it into the original denom
	k.SaveVoucherDenom(ctx, msg.Port, msg.ChannelID, msg.PriceDenom)
	// Construct the packet
	var packet types.BuyOrderPacketData
	packet.Buyer = msg.Sender
  // Transmit an IBC packet...
	return &types.MsgSendBuyOrderResponse{}, nil
}
```

## `OnRecv`

- Update the buy order book
- Distribute sold token to the buyer
- Send to chain A the sell order after the fill attempt

```go
// x/ibcdex/keeper/buy_order.go
func (k Keeper) OnRecvBuyOrderPacket(ctx sdk.Context, packet channeltypes.Packet, data types.BuyOrderPacketData) (packetAck types.BuyOrderPacketAck, err error) {
	// validate packet data upon receiving
	if err := data.ValidateBasic(); err != nil {
		return packetAck, err
	}
	// Check if the sell order book exists
	pairIndex := types.OrderBookIndex(packet.SourcePort, packet.SourceChannel, data.AmountDenom, data.PriceDenom)
	book, found := k.GetSellOrderBook(ctx, pairIndex)
	if !found {
		return packetAck, errors.New("the pair doesn't exist")
	}
	// Fill buy order
	remaining, liquidated, purchase, _ := book.FillBuyOrder(types.Order{
		Amount: data.Amount,
		Price: data.Price,
	})
	// Return remaining amount and gains
	packetAck.RemainingAmount = remaining.Amount
	packetAck.Purchase = purchase
	// Before distributing gains, we resolve the denom
	// First we check if the denom received comes from this chain originally
	finalPriceDenom, saved := k.OriginalDenom(ctx, packet.DestinationPort, packet.DestinationChannel, data.PriceDenom)
	if !saved {
		// If it was not from this chain we use voucher as denom
		finalPriceDenom = VoucherDenom(packet.SourcePort, packet.SourceChannel, data.PriceDenom)
	}
	// Dispatch liquidated buy order
	for _, liquidation := range liquidated {
		liquidation := liquidation
		addr, err := sdk.AccAddressFromBech32(liquidation.Creator)
		if err != nil {
			return packetAck, err
		}
		if err := k.SafeMint(
			ctx,
			packet.DestinationPort,
			packet.DestinationChannel,
			addr,
			finalPriceDenom,
			liquidation.Amount*liquidation.Price,
		); err != nil {
			return packetAck, err
		}
	}
	// Save the new order book
	k.SetSellOrderBook(ctx, book)
	return packetAck, nil
}
```

### `FillBuyOrder`

`FillBuyOrder` try to fill the buy order with the order book and returns all the side effects.

```go
// x/ibcdex/types/sell_order_book.go
func (s *SellOrderBook) FillBuyOrder(order Order) (remainingBuyOrder Order, liquidated []Order, purchase int32, filled bool) {
	var liquidatedList []Order
	totalPurchase := int32(0)
	remainingBuyOrder = order
	// Liquidate as long as there is match
	for {
		var match bool
		var liquidation Order
		remainingBuyOrder, liquidation, purchase, match, filled = s.LiquidateFromBuyOrder(
			remainingBuyOrder,
		)
		if !match {
			break
		}
		// Update gains
		totalPurchase += purchase
		// Update liquidated
		liquidatedList = append(liquidatedList, liquidation)
		if filled {
			break
		}
	}
	return remainingBuyOrder, liquidatedList, totalPurchase, filled
}
```

#### `LiquidateFromBuyOrder`

`LiquidateFromBuyOrder` liquidates the first sell order of the book from the buy order. If no match is found, return false for match

```go
// x/ibcdex/types/sell_order_book.go
func (s *SellOrderBook) LiquidateFromBuyOrder(order Order) (remainingBuyOrder Order, liquidatedSellOrder Order, purchase int32, match bool, filled bool) {
	remainingBuyOrder = order
	// No match if no order
	orderCount := len(s.Book.Orders)
	if orderCount == 0 {
		return order, liquidatedSellOrder, purchase, false, false
	}
	// Check if match
	lowestAsk := s.Book.Orders[orderCount-1]
	if order.Price < lowestAsk.Price {
		return order, liquidatedSellOrder, purchase, false, false
	}
	liquidatedSellOrder = *lowestAsk
	// Check if buy order can be entirely filled
	if lowestAsk.Amount >= order.Amount {
		remainingBuyOrder.Amount = 0
		liquidatedSellOrder.Amount = order.Amount
		purchase = order.Amount
		// Remove lowest ask if it has been entirely liquidated
		lowestAsk.Amount -= order.Amount
		if lowestAsk.Amount == 0 {
			s.Book.Orders = s.Book.Orders[:orderCount-1]
		} else {
			s.Book.Orders[orderCount-1] = lowestAsk
		}
		return remainingBuyOrder, liquidatedSellOrder, purchase, true, true
	}
	// Not entirely filled
	purchase = lowestAsk.Amount
	s.Book.Orders = s.Book.Orders[:orderCount-1]
	remainingBuyOrder.Amount -= lowestAsk.Amount
	return remainingBuyOrder, liquidatedSellOrder, purchase, true, false
}
```

## `OnAcknowledgement`

- Chain `Mars` will store the remaining sell order in the sell order book and will distribute sold `MCX` to the buyers and will distribute to the seller the price of the amount sold
- On error we mint back the burned tokens

```go
// x/ibcdex/keeper/buy_order.go
func (k Keeper) OnAcknowledgementBuyOrderPacket(ctx sdk.Context, packet channeltypes.Packet, data types.BuyOrderPacketData, ack channeltypes.Acknowledgement) error {
	switch dispatchedAck := ack.Response.(type) {
	case *channeltypes.Acknowledgement_Error:
		// In case of error we mint back the native token
		receiver, err := sdk.AccAddressFromBech32(data.Buyer)
		if err != nil {
			return err
		}
		if err := k.SafeMint(
			ctx,
			packet.SourcePort,
			packet.SourceChannel,
			receiver,
			data.PriceDenom,
			data.Amount*data.Price,
		); err != nil {
			return err
		}
		return nil
	case *channeltypes.Acknowledgement_Result:
		// Decode the packet acknowledgment
		var packetAck types.BuyOrderPacketAck
        
		if err := types.ModuleCdc.UnmarshalJSON(dispatchedAck.Result, &packetAck); err != nil {
			// The counter-party module doesn't implement the correct acknowledgment format
			return errors.New("cannot unmarshal acknowledgment")
		}
		// Get the sell order book
		pairIndex := types.OrderBookIndex(packet.SourcePort, packet.SourceChannel, data.AmountDenom, data.PriceDenom)
		book, found := k.GetBuyOrderBook(ctx, pairIndex)
		if !found {
			panic("buy order book must exist")
		}
		// Append the remaining amount of the order
		if packetAck.RemainingAmount > 0 {
			_, err := book.AppendOrder(
				data.Buyer,
				packetAck.RemainingAmount,
				data.Price,
			)
			if err != nil {
				return err
			}
			// Save the new order book
			k.SetBuyOrderBook(ctx, book)
		}
		// Mint the purchase
		if packetAck.Purchase > 0 {
			receiver, err := sdk.AccAddressFromBech32(data.Buyer)
			if err != nil {
				return err
			}
			finalAmountDenom, saved := k.OriginalDenom(ctx, packet.SourcePort, packet.SourceChannel, data.AmountDenom)
			if !saved {
				// If it was not from this chain we use voucher as denom
				finalAmountDenom = VoucherDenom(packet.DestinationPort, packet.DestinationChannel, data.AmountDenom)
			}
			if err := k.SafeMint(
				ctx,
				packet.SourcePort,
				packet.SourceChannel,
				receiver,
				finalAmountDenom,
				packetAck.Purchase,
			); err != nil {
				return err
			}
		}
		return nil
	default:
		// The counter-party module doesn't implement the correct acknowledgment format
		return errors.New("invalid acknowledgment format")
	}
}
```

`AppendOrder` appends an order in the buy order book.

```go
// types/buy_order_book_test.go
func (b *BuyOrderBook) AppendOrder(creator string, amount int32, price int32) (int32, error) {
  return b.Book.appendOrder(creator, amount, price, Increasing)
}
```

## `OnTimeout`

If a timeout occurs, we mint back the native token.

```go
// x/ibcdex/keeper/sell_order.go
func (k Keeper) OnTimeoutSellOrderPacket(ctx sdk.Context, packet channeltypes.Packet, data types.SellOrderPacketData) error {
	// In case of error we mint back the native token
	receiver, err := sdk.AccAddressFromBech32(data.Seller)
	if err != nil {
		return err
	}
	if err := k.SafeMint(ctx, packet.SourcePort, packet.SourceChannel, receiver, data.AmountDenom, data.Amount); err != nil {
		return err
	}
	return nil
}
```

# Cancelling Orders

You have implemented order books, buy and sell orders.  In this chapter you will enable cancelling buy and sell orders. 

## Cancel a Sell Order

To cancel a sell order, you have to get the ID of the specific sell order. Then you can use the function `RemoveOrderFromID` to remove the specific order from the order book and update the keeper accordingly.

```go
// x/ibcdex/keeper/msg_server_cancel_sell_order.go
import "errors"

func (k msgServer) CancelSellOrder(goCtx context.Context, msg *types.MsgCancelSellOrder) (*types.MsgCancelSellOrderResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	// Retrieve the book
	pairIndex := types.OrderBookIndex(msg.Port, msg.Channel, msg.AmountDenom, msg.PriceDenom)
	s, found := k.GetSellOrderBook(ctx, pairIndex)
	if !found {
		return &types.MsgCancelSellOrderResponse{}, errors.New("the pair doesn't exist")
	}
	// Check order creator
	order, err := s.Book.GetOrderFromID(msg.OrderID)
	if err != nil {
		return &types.MsgCancelSellOrderResponse{}, err
	}
	if order.Creator != msg.Creator {
		return &types.MsgCancelSellOrderResponse{}, errors.New("canceller must be creator")
	}
	// Remove order
	if err := s.Book.RemoveOrderFromID(msg.OrderID); err != nil {
		return &types.MsgCancelSellOrderResponse{}, err
	}
	k.SetSellOrderBook(ctx, s)
	// Refund seller with remaining amount
	seller, err := sdk.AccAddressFromBech32(order.Creator)
	if err != nil {
		return &types.MsgCancelSellOrderResponse{}, err
	}
	if err := k.SafeMint(ctx, msg.Port, msg.Channel, seller, msg.AmountDenom, order.Amount); err != nil {
		return &types.MsgCancelSellOrderResponse{}, err
	}
	return &types.MsgCancelSellOrderResponse{}, nil
}
```

`GetOrderFromID` gets an order from the book from its ID.

```go
// x/ibcdex/types/order_book.go
func (book OrderBook) GetOrderFromID(id int32) (Order, error) {
	for _, order := range book.Orders {
		if order.Id == id {
			return *order, nil
		}
	}
	return Order{}, ErrOrderNotFound
}
```

`RemoveOrderFromID` removes an order from the book and keep it ordered.

```go
// x/ibcdex/types/order_book.go
func (book *OrderBook) RemoveOrderFromID(id int32) error {
	for i, order := range book.Orders {
		if order.Id == id {
			book.Orders = append(book.Orders[:i], book.Orders[i+1:]...)
			return nil
		}
	}
	return ErrOrderNotFound
}
```

## Cancel a Buy Order

To cancel a buy order, you have to get the ID of the specific buy order. Then you can use the function `RemoveOrderFromID` to remove the specific order from the order book and update the keeper accordingly.

```go
// x/ibcdex/keeper/msg_server_cancel_buy_order.go
import "errors"

func (k msgServer) CancelBuyOrder(goCtx context.Context, msg *types.MsgCancelBuyOrder) (*types.MsgCancelBuyOrderResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	// Retrieve the book
	pairIndex := types.OrderBookIndex(msg.Port, msg.Channel, msg.AmountDenom, msg.PriceDenom)
	b, found := k.GetBuyOrderBook(ctx, pairIndex)
	if !found {
		return &types.MsgCancelBuyOrderResponse{}, errors.New("the pair doesn't exist")
	}
	// Check order creator
	order, err := b.Book.GetOrderFromID(msg.OrderID)
	if err != nil {
		return &types.MsgCancelBuyOrderResponse{}, err
	}
	if order.Creator != msg.Creator {
		return &types.MsgCancelBuyOrderResponse{}, errors.New("canceller must be creator")
	}
	// Remove order
	if err := b.Book.RemoveOrderFromID(msg.OrderID); err != nil {
		return &types.MsgCancelBuyOrderResponse{}, err
	}
	k.SetBuyOrderBook(ctx, b)
	// Refund buyer with remaining price amount
	buyer, err := sdk.AccAddressFromBech32(order.Creator)
	if err != nil {
		return &types.MsgCancelBuyOrderResponse{}, err
	}
	if err := k.SafeMint(
		ctx,
		msg.Port,
		msg.Channel,
		buyer,
		msg.PriceDenom,
		order.Amount*order.Price,
	); err != nil {
		return &types.MsgCancelBuyOrderResponse{}, err
	}
	return &types.MsgCancelBuyOrderResponse{}, nil
}
```

That finishes all necessary functions needed for the `ibcdex` module. In this chapter you have implemented the design for cancelling specific buy or sell orders.

# Write tests

To test your application, add the test files to your code.

After you add the test files below, change into the `interchange` directory with your terminal, then run

```bash
go test -timeout 30s ./x/ibcdex/types
```

## Order Book Tests

```go
// types/order_book_test.go
package types_test

import (
	"math/rand"
	"testing"

	"github.com/cosmos/cosmos-sdk/crypto/keys/ed25519"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/stretchr/testify/require"
	"github.com/tendermint/interchange/x/ibcdex/types"
)

func GenString(n int) string {
	alpha := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

	buf := make([]rune, n)
	for i := range buf {
		buf[i] = alpha[rand.Intn(len(alpha))]
	}
	return string(buf)
}

func GenAddress() string {
	pk := ed25519.GenPrivKey().PubKey()
	addr := pk.Address()
	return sdk.AccAddress(addr).String()
}

func GenAmount() int32 {
	return int32(rand.Intn(int(types.MaxAmount)) + 1)
}

func GenPrice() int32 {
	return int32(rand.Intn(int(types.MaxPrice)) + 1)
}

func GenPair() (string, string) {
	return GenString(10), GenString(10)
}

func GenOrder() (string, int32, int32) {
	return GenLocalAccount(), GenAmount(), GenPrice()
}

func GenLocalAccount() string {
	return GenAddress()
}

func MockAccount(str string) string {
	return str
}

func OrderListToOrderBook(list []types.Order) types.OrderBook {
	listCopy := make([]*types.Order, len(list))
	for i, order := range list {
		order := order
		listCopy[i] = &order
	}

	return types.OrderBook{
		IdCount: 0,
		Orders:  listCopy,
	}
}

func TestRemoveOrderFromID(t *testing.T) {
	inputList := []types.Order{
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}

	book := OrderListToOrderBook(inputList)
	expectedList := []types.Order{
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}
	expectedBook := OrderListToOrderBook(expectedList)
	err := book.RemoveOrderFromID(2)
	require.NoError(t, err)
	require.Equal(t, expectedBook, book)

	book = OrderListToOrderBook(inputList)
	expectedList = []types.Order{
		{Id: 3, Creator: MockAccount("3"), Amount: 2, Price: 10},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
	}
	expectedBook = OrderListToOrderBook(expectedList)
	err = book.RemoveOrderFromID(0)
	require.NoError(t, err)
	require.Equal(t, expectedBook, book)

	book = OrderListToOrderBook(inputList)
	expectedList = []types.Order{
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}
	expectedBook = OrderListToOrderBook(expectedList)
	err = book.RemoveOrderFromID(3)
	require.NoError(t, err)
	require.Equal(t, expectedBook, book)

	book = OrderListToOrderBook(inputList)
	err = book.RemoveOrderFromID(4)
	require.ErrorIs(t, err, types.ErrOrderNotFound)
}
```

## Buy Order Tests

```go
// types/buy_order_book_test.go
package types_test

import (
	"testing"
	"sort"

	"github.com/stretchr/testify/require"
	"github.com/tendermint/interchange/x/ibcdex/types"
)

func OrderListToBuyOrderBook(list []types.Order) types.BuyOrderBook {
	listCopy := make([]*types.Order, len(list))
	for i, order := range list {
		order := order
		listCopy[i] = &order
	}

	book := types.BuyOrderBook{
		AmountDenom: "foo",
		PriceDenom:  "bar",
		Book: &types.OrderBook{
			IdCount: 0,
			Orders:  listCopy,
		},
	}
	return book
}

func TestAppendOrder(t *testing.T) {
	buyBook := types.NewBuyOrderBook(GenPair())

	// Prevent zero amount
	seller, amount, price := GenOrder()
	_, err := buyBook.AppendOrder(seller, 0, price)
	require.ErrorIs(t, err, types.ErrZeroAmount)

	// Prevent big amount
	_, err = buyBook.AppendOrder(seller, types.MaxAmount+1, price)
	require.ErrorIs(t, err, types.ErrMaxAmount)

	// Prevent zero price
	_, err = buyBook.AppendOrder(seller, amount, 0)
	require.ErrorIs(t, err, types.ErrZeroPrice)

	// Prevent big price
	_, err = buyBook.AppendOrder(seller, amount, types.MaxPrice+1)
	require.ErrorIs(t, err, types.ErrMaxPrice)

	// Can append buy orders
	for i := 0; i < 20; i++ {
		// Append a new order
		creator, amount, price := GenOrder()
		newOrder := types.Order{
			Id:      buyBook.Book.IdCount,
			Creator: creator,
			Amount:  amount,
			Price:   price,
		}
		orderID, err := buyBook.AppendOrder(creator, amount, price)

		// Checks
		require.NoError(t, err)
		require.Contains(t, buyBook.Book.Orders, &newOrder)
		require.Equal(t, newOrder.Id, orderID)
	}


	require.Len(t, buyBook.Book.Orders, 20)
	require.True(t, sort.SliceIsSorted(buyBook.Book.Orders, func(i, j int) bool {
		return buyBook.Book.Orders[i].Price < buyBook.Book.Orders[j].Price
	}))
}

type liquidateSellRes struct {
	Book       []types.Order
	Remaining  types.Order
	Liquidated types.Order
	Gain       int32
	Match      bool
	Filled     bool
}

func simulateLiquidateFromSellOrder(
	t *testing.T,
	inputList []types.Order,
	inputOrder types.Order,
	expected liquidateSellRes,
) {
	book := OrderListToBuyOrderBook(inputList)
	expectedBook := OrderListToBuyOrderBook(expected.Book)

	require.True(t, sort.SliceIsSorted(book.Book.Orders, func(i, j int) bool {
		return book.Book.Orders[i].Price < book.Book.Orders[j].Price
	}))
	require.True(t, sort.SliceIsSorted(expectedBook.Book.Orders, func(i, j int) bool {
		return expectedBook.Book.Orders[i].Price < expectedBook.Book.Orders[j].Price
	}))

	remaining, liquidated, gain, match, filled := book.LiquidateFromSellOrder(inputOrder)

	require.Equal(t, expectedBook, book)
	require.Equal(t, expected.Remaining, remaining)
	require.Equal(t, expected.Liquidated, liquidated)
	require.Equal(t, expected.Gain, gain)
	require.Equal(t, expected.Match, match)
	require.Equal(t, expected.Filled, filled)
}

func TestLiquidateFromSellOrder(t *testing.T) {
	// No match for empty book
	inputOrder := types.Order{Id: 10, Creator: MockAccount("1"), Amount: 100, Price: 30}
	book := OrderListToBuyOrderBook([]types.Order{})
	_, _, _, match, _ := book.LiquidateFromSellOrder(inputOrder)
	require.False(t, match)

	// Buy book
	inputBook := []types.Order{
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}

	// Test no match if highest bid too low (25 < 30)
	book = OrderListToBuyOrderBook(inputBook)
	_, _, _, match, _ = book.LiquidateFromSellOrder(inputOrder)
	require.False(t, match)

	// Entirely filled (30 < 50)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 22}
	expected := liquidateSellRes{
		Book: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
			{Id: 0, Creator: MockAccount("0"), Amount: 20, Price: 25},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 22},
		Liquidated: types.Order{Id: 0, Creator: MockAccount("0"), Amount: 30, Price: 25},
		Gain:       int32(30 * 25),
		Match:      true,
		Filled:     true,
	}
	simulateLiquidateFromSellOrder(t, inputBook, inputOrder, expected)

	// Entirely filled and liquidated ( 50 = 50)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 50, Price: 15}
	expected = liquidateSellRes{
		Book: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 15},
		Liquidated: types.Order{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		Gain:       int32(50 * 25),
		Match:      true,
		Filled:     true,
	}
	simulateLiquidateFromSellOrder(t, inputBook, inputOrder, expected)

	// Not filled and entirely liquidated (60 > 50)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 10}
	expected = liquidateSellRes{
		Book: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 10, Price: 10},
		Liquidated: types.Order{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		Gain:       int32(50 * 25),
		Match:      true,
		Filled:     false,
	}
	simulateLiquidateFromSellOrder(t, inputBook, inputOrder, expected)
}

type fillSellRes struct {
	Book       []types.Order
	Remaining  types.Order
	Liquidated []types.Order
	Gain       int32
	Filled     bool
}

func simulateFillSellOrder(
	t *testing.T,
	inputList []types.Order,
	inputOrder types.Order,
	expected fillSellRes,
) {
	book := OrderListToBuyOrderBook(inputList)
	expectedBook := OrderListToBuyOrderBook(expected.Book)

	require.True(t, sort.SliceIsSorted(book.Book.Orders, func(i, j int) bool {
		return book.Book.Orders[i].Price < book.Book.Orders[j].Price
	}))
	require.True(t, sort.SliceIsSorted(expectedBook.Book.Orders, func(i, j int) bool {
		return expectedBook.Book.Orders[i].Price < expectedBook.Book.Orders[j].Price
	}))

	remaining, liquidated, gain, filled := book.FillSellOrder(inputOrder)

	require.Equal(t, expectedBook, book)
	require.Equal(t, expected.Remaining, remaining)
	require.Equal(t, expected.Liquidated, liquidated)
	require.Equal(t, expected.Gain, gain)
	require.Equal(t, expected.Filled, filled)
}

func TestFillSellOrder(t *testing.T) {
	var inputBook []types.Order

	// Empty book
	inputOrder := types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 30}
	expected := fillSellRes{
		Book:       []types.Order{},
		Remaining:  inputOrder,
		Liquidated: []types.Order(nil),
		Gain:       int32(0),
		Filled:     false,
	}
	simulateFillSellOrder(t, inputBook, inputOrder, expected)

	// No match
	inputBook = []types.Order{
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
	}
	expected = fillSellRes{
		Book:       inputBook,
		Remaining:  inputOrder,
		Liquidated: []types.Order(nil),
		Gain:       int32(0),
		Filled:     false,
	}
	simulateFillSellOrder(t, inputBook, inputOrder, expected)

	// First order liquidated, not filled
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 22}
	expected = fillSellRes{
		Book: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 10, Price: 22},
		Liquidated: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		},
		Gain:   int32(50 * 25),
		Filled: false,
	}
	simulateFillSellOrder(t, inputBook, inputOrder, expected)

	// Filled with two order
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 18}
	expected = fillSellRes{
		Book: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 190, Price: 20},
		},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 18},
		Liquidated: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 10, Price: 20},
		},
		Gain:   int32(50*25 + 10*20),
		Filled: true,
	}
	simulateFillSellOrder(t, inputBook, inputOrder, expected)

	// Not filled, buy order book liquidated
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 300, Price: 10}
	expected = fillSellRes{
		Book:      []types.Order{},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 20, Price: 10},
		Liquidated: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		},
		Gain:   int32(50*25 + 200*20 + 30*15),
		Filled: false,
	}
	simulateFillSellOrder(t, inputBook, inputOrder, expected)
}
```

## Sell Order Tests

```go
// types/sell_order_book_test.go
package types_test

import (
	"github.com/tendermint/interchange/x/ibcdex/types"
	"testing"
	"github.com/stretchr/testify/require"
	"sort"
)

func OrderListToSellOrderBook(list []types.Order) types.SellOrderBook {
	listCopy := make([]*types.Order, len(list))
	for i, order := range list {
		order := order
		listCopy[i] = &order
	}

	book := types.SellOrderBook{
		AmountDenom: "foo",
		PriceDenom:  "bar",
		Book: &types.OrderBook{
			IdCount: 0,
			Orders:  listCopy,
		},
	}
	return book
}

func TestSellOrderBook_AppendOrder(t *testing.T) {
	sellBook := types.NewSellOrderBook(GenPair())

	// Prevent zero amount
	seller, amount, price := GenOrder()
	_, err := sellBook.AppendOrder(seller, 0, price)
	require.ErrorIs(t, err, types.ErrZeroAmount)

	// Prevent big amount
	_, err = sellBook.AppendOrder(seller, types.MaxAmount+1, price)
	require.ErrorIs(t, err, types.ErrMaxAmount)

	// Prevent zero price
	_, err = sellBook.AppendOrder(seller, amount, 0)
	require.ErrorIs(t, err, types.ErrZeroPrice)

	// Prevent big price
	_, err = sellBook.AppendOrder(seller, amount, types.MaxPrice+1)
	require.ErrorIs(t, err, types.ErrMaxPrice)

	// Can append sell orders
	for i := 0; i < 20; i++ {
		// Append a new order
		creator, amount, price := GenOrder()
		newOrder := types.Order{
			Id:      sellBook.Book.IdCount,
			Creator: creator,
			Amount:  amount,
			Price:   price,
		}
		orderID, err := sellBook.AppendOrder(creator, amount, price)

		// Checks
		require.NoError(t, err)
		require.Contains(t, sellBook.Book.Orders, &newOrder)
		require.Equal(t, newOrder.Id, orderID)
	}
	require.Len(t, sellBook.Book.Orders, 20)
	require.True(t, sort.SliceIsSorted(sellBook.Book.Orders, func(i, j int) bool {
		return sellBook.Book.Orders[i].Price > sellBook.Book.Orders[j].Price
	}))
}

type liquidateBuyRes struct {
	Book       []types.Order
	Remaining  types.Order
	Liquidated types.Order
	Purchase   int32
	Match      bool
	Filled     bool
}

func simulateLiquidateFromBuyOrder(
	t *testing.T,
	inputList []types.Order,
	inputOrder types.Order,
	expected liquidateBuyRes,
) {
	book := OrderListToSellOrderBook(inputList)
	expectedBook := OrderListToSellOrderBook(expected.Book)
	require.True(t, sort.SliceIsSorted(book.Book.Orders, func(i, j int) bool {
		return book.Book.Orders[i].Price > book.Book.Orders[j].Price
	}))
	require.True(t, sort.SliceIsSorted(expectedBook.Book.Orders, func(i, j int) bool {
		return expectedBook.Book.Orders[i].Price > expectedBook.Book.Orders[j].Price
	}))

	remaining, liquidated, purchase, match, filled := book.LiquidateFromBuyOrder(inputOrder)

	require.Equal(t, expectedBook, book)
	require.Equal(t, expected.Remaining, remaining)
	require.Equal(t, expected.Liquidated, liquidated)
	require.Equal(t, expected.Purchase, purchase)
	require.Equal(t, expected.Match, match)
	require.Equal(t, expected.Filled, filled)
}

func TestLiquidateFromBuyOrder(t *testing.T) {
	// No match for empty book
	inputOrder := types.Order{Id: 10, Creator: MockAccount("1"), Amount: 100, Price: 10}
	book := OrderListToSellOrderBook([]types.Order{})
	_, _, _, match, _ := book.LiquidateFromBuyOrder(inputOrder)
	require.False(t, match)

	// Sell book
	inputBook := []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
	}

	// Test no match if lowest ask too high (25 < 30)
	book = OrderListToSellOrderBook(inputBook)
	_, _, _, match, _ = book.LiquidateFromBuyOrder(inputOrder)
	require.False(t, match)

	// Entirely filled (30 > 15)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 20, Price: 30}
	expected := liquidateBuyRes{
		Book: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
			{Id: 2, Creator: MockAccount("2"), Amount: 10, Price: 15},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 30},
		Liquidated: types.Order{Id: 2, Creator: MockAccount("2"), Amount: 20, Price: 15},
		Purchase:   int32(20),
		Match:      true,
		Filled:     true,
	}
	simulateLiquidateFromBuyOrder(t, inputBook, inputOrder, expected)

	// Entirely filled (30 = 30)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 30}
	expected = liquidateBuyRes{
		Book: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 30},
		Liquidated: types.Order{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		Purchase:   int32(30),
		Match:      true,
		Filled:     true,
	}
	simulateLiquidateFromBuyOrder(t, inputBook, inputOrder, expected)

	// Not filled and entirely liquidated (60 > 30)
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 30}
	expected = liquidateBuyRes{
		Book: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining:  types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 30},
		Liquidated: types.Order{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		Purchase:   int32(30),
		Match:      true,
		Filled:     false,
	}
	simulateLiquidateFromBuyOrder(t, inputBook, inputOrder, expected)
}

type fillBuyRes struct {
	Book       []types.Order
	Remaining  types.Order
	Liquidated []types.Order
	Purchase   int32
	Filled     bool
}

func simulateFillBuyOrder(
	t *testing.T,
	inputList []types.Order,
	inputOrder types.Order,
	expected fillBuyRes,
) {
	book := OrderListToSellOrderBook(inputList)
	expectedBook := OrderListToSellOrderBook(expected.Book)

	require.True(t, sort.SliceIsSorted(book.Book.Orders, func(i, j int) bool {
		return book.Book.Orders[i].Price > book.Book.Orders[j].Price
	}))
	require.True(t, sort.SliceIsSorted(expectedBook.Book.Orders, func(i, j int) bool {
		return expectedBook.Book.Orders[i].Price > expectedBook.Book.Orders[j].Price
	}))

	remaining, liquidated, purchase, filled := book.FillBuyOrder(inputOrder)

	require.Equal(t, expectedBook, book)
	require.Equal(t, expected.Remaining, remaining)
	require.Equal(t, expected.Liquidated, liquidated)
	require.Equal(t, expected.Purchase, purchase)
	require.Equal(t, expected.Filled, filled)
}

func TestFillBuyOrder(t *testing.T) {
	var inputBook []types.Order

	// Empty book
	inputOrder := types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 10}
	expected := fillBuyRes{
		Book:       []types.Order{},
		Remaining:  inputOrder,
		Liquidated: []types.Order(nil),
		Purchase:   int32(0),
		Filled:     false,
	}
	simulateFillBuyOrder(t, inputBook, inputOrder, expected)

	// No match
	inputBook = []types.Order{
		{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
	}
	expected = fillBuyRes{
		Book:       inputBook,
		Remaining:  inputOrder,
		Liquidated: []types.Order(nil),
		Purchase:   int32(0),
		Filled:     false,
	}
	simulateFillBuyOrder(t, inputBook, inputOrder, expected)

	// First order liquidated, not filled
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 18}
	expected = fillBuyRes{
		Book: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
		},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 30, Price: 18},
		Liquidated: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
		},
		Purchase: int32(30),
		Filled:   false,
	}
	simulateFillBuyOrder(t, inputBook, inputOrder, expected)

	// Filled with two order
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 60, Price: 22}
	expected = fillBuyRes{
		Book: []types.Order{
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
			{Id: 1, Creator: MockAccount("1"), Amount: 170, Price: 20},
		},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 0, Price: 22},
		Liquidated: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 30, Price: 20},
		},
		Purchase: int32(30 + 30),
		Filled:   true,
	}
	simulateFillBuyOrder(t, inputBook, inputOrder, expected)

	// Not filled, sell order book liquidated
	inputOrder = types.Order{Id: 10, Creator: MockAccount("1"), Amount: 300, Price: 30}
	expected = fillBuyRes{
		Book:      []types.Order{},
		Remaining: types.Order{Id: 10, Creator: MockAccount("1"), Amount: 20, Price: 30},
		Liquidated: []types.Order{
			{Id: 2, Creator: MockAccount("2"), Amount: 30, Price: 15},
			{Id: 1, Creator: MockAccount("1"), Amount: 200, Price: 20},
			{Id: 0, Creator: MockAccount("0"), Amount: 50, Price: 25},
		},
		Purchase: int32(30 + 200 + 50),
		Filled:   false,
	}
	simulateFillBuyOrder(t, inputBook, inputOrder, expected)
}
```

When the tests are successful, your output should be 

```go
ok      github.com/username/interchange/x/ibcdex/types       0.550s
```
