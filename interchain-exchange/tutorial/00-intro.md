---
order: 1
---

# Introduction

The Interchain Exchange is a module to create buy and sell orders in between two blockchains.
In this tutorial you will learn how to create a module that can create order pairs, buy and sell orders. You will be able to create buy and sell orders across blockchains, which enables to swap tokens from one blockchain to another.

The code in this tutorial is purely written for a tutorial and only for educational purpose. It is not intended to be used in production.
{synopsis}

**You will learn how to**
- Create a blockchain with Starport
- Create a Cosmos SDK IBC module
- How to create an orderbook that hosts buy and sell orders with a module
- Send packets from one blockchain to another
- How to deal with timeouts and acknowledgements of the packets

## How the module works

The module allows to open an exchange between a pair of tokens on the source chain and a token on the target chain. 
Tokens can be bought or sold with Limit Orders on a simple orderbook, there is no notion of Liquidity Pool or AMM.

The market is unidirectional: the token sold on the source chain cannot be bought back and the token bought from the target chain cannot be sold back using the same pair. If a token on a source chain is sold, it can only be bought back by creating a new pair on the orderbook.

In the next chapter you will learn more about the design of the exchange.