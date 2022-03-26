---
title: "Cosmos Ecosystem V"
order: 7
description: Starport
tag: fast-track
---

## Starport: building application-specific blockchains with one command

[Starport](https://cosmos.network/starport/) is a developer-friendly, command-line interface (CLI) tool for application-specific blockchains building on Tendermint and the Cosmos SDK. The CLI tool offers everything developers need to build, test, and launch a chain. It accelerates blockchain development by scaffolding and assembling all components needed for a production-ready blockchain. Starport makes the process from initial idea to production 95% faster. It lets you build a blockchain in minutes. This lets developers focus more strongly on the business logic of their application.

With Starport developers can:

* Create a modular blockchain written in Go with a single command.
* Start a development server to experiment with token creation and allocation, as well as module configuration.
* Allow for inter-chain token transfers by using its built-in IBC relayer to send value and data to different chains.
* Benefit from a fast-developed frontend with automatically generated APIs and web pages in JavaScript, TypeScript and Vue.

<HighlightBox type="tip">

Have a look at the official [Starport documentation](https://docs.starport.com/) and the section on [Starport in the My Own Cosmos Chain chapter](../4-my-own-chain/starport.md).

</HighlightBox>

When you scaffold with Starport, things like key management, creating validators, and transferring tokens can be done through the CLI.




# Starport

<HighlightBox type="synopsis">

Before diving into the details of how Starport helps you scaffold the basics for your application blockchain make sure to understand the main concepts presented in the following sections:

* [A Blockchain App Architecture](../2-main-concepts/architecture.md)
* [Accounts](../2-main-concepts/accounts.md)
* [Transactions](../2-main-concepts/transactions.md)
* [Messages](../2-main-concepts/messages.md)
* [Modules](../2-main-concepts/modules.md)
* [Protobuf](../2-main-concepts/protobuf.md)
* [BaseApp](../2-main-concepts/base-app.md)

You can follow a hands-on exercise for Starport in the sections that follow this introduction.

</HighlightBox>

The Cosmos SDK provides the building blocks for a complete Tendermint blockchain, which implements the Inter-Blockchain Communication Protocol (IBC). The _BaseApp_ of the Cosmos SDK assembles these building blocks and provides a fully-running blockchain. All there is left to do for the specific blockchain application is to create specific modules and integrate them with BaseApp to make the application _your own_.

Starport assists with scaffolding modules and integrating them with BaseApp. Starport is a command-line tool that writes code files and updates them when instructed to do so. If you come from an _on Rails_ world, the concept will look familiar to you.

On top of that Starport will handle some compilation, run a local blockchain node, and help you with other tasks.


<YoutubePlayer videoId="pFAM6mkKoTA"/>


## Next up
