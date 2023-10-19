---
title: "IBC Application Developer Introduction"
order: 4
description:
tags:
  - ibc
  - cosmos-sdk
  - concepts
---

# IBC Application Developer Introduction

You might have already dived into [how to create custom SDK modules](/tutorials/8-understand-sdk-modules/index.md). Additionally, you had an [introduction to IBC](/academy/3-ibc/1-what-is-ibc.md), the ibc-go module in the SDK, and how to [spin up a relayer to send IBC packets](/academy/2-cosmos-concepts/13-relayer-intro.md).

Remember the separation of concerns in the Inter-Blockchain Communication Protocol (IBC) between the transport layer (IBC/TAO) and the application layer (IBC/APP). The transport layer provides the basic infrastructure layer to _transport_, _authenticate_, and _order_ arbitrary packets of data. The encoding, decoding, and interpretation of the data to trigger the custom application logic is then up to the application layer. The examples of token transfer sent over IBC implicitly used the ICS-20 or _transfer_ IBC application module provided by the **ibc-go** SDK module (which also provides the core transport layer functionality).

In the following sections, you will learn how to develop your custom IBC application modules, either by upgrading an existing module or starting from scratch using Ignite CLI.

<HighlightBox type="docs">

In the [integration](https://ibc.cosmos.network/v4.4.x/ibc/integration.html) section of the IBC documentation, the necessary steps to integrate IBC in a Cosmos SDK chain are outlined.
<br/><br/>
Note that this does not mean that the main application modules turn into IBC modules, it only means IBC is enabled for the chain. The IBC module has come out-of-the-box in Cosmos SDK chains since the 0.40.x version of the SDK, so it is unlikely you will have to implement these steps manually when developing a chain.
<br/><br/>
For example, the checkers blockchain you developed in the previous section **is IBC-enabled**. This is revealed when trying to send IBC denoms from other chains in order to set a wager. However, this does not make the `x/checkers` module an IBC-enabled module. You will investigate all the additions required to make the module IBC-enabled in what follows.

</HighlightBox>

## Structure of the sections to come

In this part of the chapter, you will first investigate the code you have to add to make a module IBC-enabled. For this conceptual example, you will build a simple chain from scratch with Ignite CLI. Ignite CLI provides the option to scaffold an IBC module, which does all of the hard work in terms of boilerplate code. Still, it makes sense to take a look at what exactly has changed. Therefore, you will compare the code with a _git diff_ when scaffolding a chain with a regular module and when you scaffold an IBC module.

A similar approach will be taken to check what Ignite CLI implements when scaffolding an IBC packet.

After finishing the conceptual part, you are going to [expand the checkers blockchain you created](./6-ibc-app-checkers.md) to include an IBC module in it, and will [create an additional leaderboard blockchain](./7-ibc-app-leaderboard.md) to act as a separate appchain that can interact via IBC with the checkers blockchain.

Let's dive into it!
