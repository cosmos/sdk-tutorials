---
order: 2
---

# App Desgin

## Assumption

The module is trustless, there is no condition to check when opening a channel between two chains. Any pair of tokens can be exchanged between any pair of chains.

A specific chain cannot mint new of its native token. 

This module will have some similarities with the `ibc-transfer` module and use some code from this module (like the voucher creation). It will be a bit more complex but it is interesting as a tutorial because it gives us a case where you need:

- Several types of packets to send
- Several types of acknowledgments to treat
- Some more complex logic on how to treat a packet, an acknowledgement, a timeout and more

<!-- ## Overview

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