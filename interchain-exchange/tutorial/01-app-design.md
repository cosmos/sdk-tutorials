---
order: 2
---

# App Design

In this chapter you will learn how the interchain exchange module is designed.
The module has orderbooks, buy- and sell orders for a user to create.
First, an orderbook for a pair of token has to be created.
After an ordebrook exists, you can create buy and sell orders for this pair of token.

When a user exchanges a token with the `ibcdex`, you would receive a `voucher` of that token on the other blockchain.
This is similar to how a `ibc-transfer` is constructed.
Since a blockchain module does not have the rights to mint new token into existence, the token on the target chain would be locked up and the buyer would receive a `voucher` of that token.
This process can be reversed when the `voucher` get burned again to enable back the original token. This will be explained throghout the tutorial in more detail.

## Assumption

For any pair of tokens you can create an orderbook. The orderbook can be created for the exchange of any tokens between any pair of chains. There is no condition to check for open channels between two chains.
A specific chain cannot mint new of its native token. 
<!-- The module is trustless, there is no condition to check when opening a channel between two chains. Any pair of tokens can be exchanged between any pair of chains. -->

This module is inspired by the [`ibc-transfer`](https://github.com/cosmos/cosmos-sdk/tree/v0.42.1/x/ibc/applications/transfer) module and will have some similarities like the voucher creation. It will be a bit more complex but it will display how to create:

- Several types of packets to send
- Several types of acknowledgments to treat
- Some more complex logic on how to treat a packet, an acknowledgement, a timeout and more

## Overview

Assume you have two blockchains, one on Venus, one on Mars. The token to use on Venus is called `vcx`, the token on Mars `mcx`. 
When exchanging a token from Mars to Venus, on the Venus blockchain you would end up with an IBC `voucher` token that looks like `ibc/Venus/mcx`. The IBC path indicates the route the token has made. 

<!-- 
A = Mars
B = Venus
- The source chain is named **Mars**
- The target chain is named **Venus**
- The token exchanged on chain Mars is named **MCX**
- The token exchanged on chain Venus is named **VCX**
- The token MCX sent to Venus is named **ibc/Venus/MCX** — *this is comparable to the voucher with `ibc-transfer`*
- The token B(t) sent to A is named **ibc/A/B(t)**
- The pair between A(t) and B(t) is named **A(t)/B(t)**
- An account on a chain A is named **A(u)**
- An account on a chain B is named **B(u)**
- The representation of an account from chain A on chain B is named **B/A(u)**
- The representation of an account from chain B on chain A is named **A/B(u)**


- The source chain is named **A**
- The target chain is named **B**
- The token exchanged on chain A is named **A(t)**
- The token exchanged on chain B is named **B(t)**
- The token A(t) sent to B is named **ibc/B/A(t)** — *this is comparable to the voucher with `ibc-transfer`*
- The token B(t) sent to A is named **ibc/A/B(t)**
- The pair between A(t) and B(t) is named **A(t)/B(t)**
- An account on a chain A is named **A(u)**
- An account on a chain B is named **B(u)**
- The representation of an account from chain A on chain B is named **B/A(u)**
- The representation of an account from chain B on chain A is named **A/B(u)**

Any account A(u) can open a new pair A(t)/B(t) if it doesn't exist yet. When created A(u) or B(u) will be able to sell A(t) at a price B(t) or to buy A(t) at the price B(t). **This is the token on the source chain that is traded with a price from the token on the target chain**. -->

## Order books

As a typical exchange, a new pair implies the creation of an Order Book with orders to sell A(t) or orders to buy A(T). Here, we have two chains and this data-structure must be split between A and B.

Users A(u) will sold A(t) and users B(u) will buy A(t). Therefore, we represent all orders to sell A(t) on chain A and all the orders to buy A(t) on chain B.

Chain A contains in its store a sell order book and chain B contains a buy order book.

## Exchanging tokens back

Like `ibctransfer` each blockchain keep a trace of the token voucher created on the other chain.

If a chain A sells A(t) to B and ibc/B/A(t) is minted on B then, if ibc/B/A(t) is sold back on A the token minted will be A(t)

## Features

The features supported by the module are:

- Creating an exchange for a token pair between two chains
- Send sell orders on source chain
- Send buy orders on target chain
- Cancel sell or buy orders