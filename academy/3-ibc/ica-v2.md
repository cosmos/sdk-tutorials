---
title: "Interchain Accounts"
order: -1
description: Understand ICA
tags: 
  - concepts
  - ibc
---

# Interchain Accounts

<HighlightBox type="learning">

**Interchain accounts (ICAs)** allow you to control an account on a **host chain** from a **controller chain**.
<br/><br/>
In this section, you will learn more about:

* Host chains and controller chains
* ICA (sub)module(s)
* The authentication module for custom authentication
* ADR 008 middleware for secondary application logic

</HighlightBox>

## What are Interchain Accounts?

The interoperable internet of blockchains made possible by IBC, opens up many new frontiers for cross-chain interactions and applications leveraging these primitives. In this interoperability narrative, it should be possible to interact with a certain chain -let's call it the _host chain_- through a remote interface, i.e. from another chain - the _controller chain_. Interchain accounts or ICA for short, enables just that; it allows for a chain, a module or a user on that chain to programmatically control an account, the interchain account, on a remote chain.

Sometimes interchain accounts are referred to as _cross-chain writes_ in conjunction with interchain queries (ICQ) or the ability to read data from a remote chain, i.e. _cross-chain reads_.

[The specification describing the interchain accounts](https://github.com/cosmos/ibc/tree/main/spec/app/ics-027-interchain-accounts) application protocol is ICS-27.

<HighlightBox type="docs">

The ibc-go implemenation of ICA can be found [in the apps subdirectory](https://github.com/cosmos/ibc-go/tree/main/modules/apps/27-interchain-accounts).

The corresponding documentation can be found in the [ibc-go docs](https://ibc.cosmos.network/main/apps/interchain-accounts/overview.html)

</HighlightBox>

## ICA core functionality: controller & host

From the description above, you'll be able to note that a distinction needs to be made between the so-called host and controller chains. Unlike ICS-20 which has an inherent symmetric design (if an ICS-20 channel is created between two chains, both chains can use the transfer module to send and receive tokens), ICA has a more asymmetric design in nature. Let's take a look at some relevant definitions:

**Host Chain:** the chain where the interchain account is registered. The host chain listens for IBC packets from a controller chain which should contain instructions (e.g. cosmos SDK messages) which the interchain account will execute.

**Controller Chain:** the chain that registers and controls an account on a host chain. The controller chain sends IBC packets to the host chain to control the account.

<HighlightBox type="info">

The interchain accounts application module is structured to support the ability of **exclusively enabling controller or host functionality**. This can be achieved by simply omitting either controller or host `Keeper` from the interchain accounts `NewAppModule` constructor function, and mounting only the desired submodule via the `IBCRouter`. Alternatively, [submodules can be enabled and disabled dynamically using on-chain parameters](https://ibc.cosmos.network/main/apps/interchain-accounts/parameters.html).

</HighlightBox>

**Authentication Module:** a custom IBC application module on the controller chain that uses the interchain accounts module API to build custom logic for the creation and management of interchain accounts. An authentication module is required for a controller chain to utilize the interchain accounts module functionality.

**Interchain account (ICA):** an account on a host chain. An interchain account has all the capabilities of a normal account. However, rather than signing transactions with a private key, a controller chain's authentication module will send IBC packets to the host chain which signal what transactions the interchain account should execute.

### Controller API

* RegisterInterchainAccount
    * Mention ORDERED channels
    * active channels
    * handshake
    * Port ID
* SendTx

### Host API

* RegisterInterchainAccount
    * Handshake
    * Port ID
* AuthenticateTx
* ExecuteTx (ExecuteMsg)

AutenticateTx as a segue towards Authentication modules

## Authentication

The ICA module provides an API for registering an account and for sending interchain transactions. A developer will use this module by implementing an **ICA Auth Module** (_authentication module_) and can expose gRPC endpoints for an application or user. Regular accounts use a private key to sign transactions on-chain. interchain accounts are instead controlled programmatically by separate chains via IBC transactions. interchain accounts are implemented as sub-accounts of the interchain accounts module account.

* MsgServer
* Legacy API

## Application callbacks





