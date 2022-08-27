<!--
layout: LandingPage
tutorials:
tools:
  - title: Cosmos SDK
    description: A framework for building public blockchains.
    links:
      - name: Learn more
        url: https://v1.cosmos.network/sdk
      - name: Documentation
        url: https://docs.cosmos.network/
    image: /cosmos-sdk-icon.svg
  - title: Tendermint Core
    description: Blockchain consensus engine and application interface.
    links:
      - name: Learn more
        url: https://tendermint.com/core/
      - name: Documentation
        url: https://docs.tendermint.com/
    image: /tendermint-icon.svg
  - title: Ignite CLI
    description: All-in-one platform to build, launch, and maintain apps on a sovereign and secured blockchain.
    links:
      - name: Learn more
        url: https://ignite.com/cli
      - name: Documentation
        url: https://docs.ignite.com
    image: /ignitecli-icon.svg
  - title: IBC
    description: Industry standard protocol for inter-blockchain communication.
    links:
      - name: Learn more
        url: https://ibcprotocol.org/
      - name: Documentation
        url: https://ibc.cosmos.network/
    image: /ibc-icon.svg
  - title: CosmWasm
    description: Smart contracting platform built for the Cosmos Ecosystem.
    links:
      - name: Learn more
        url: https://cosmwasm.com/
      - name: Documentation
        url: https://docs.cosmwasm.com/docs/1.0/
    image: /cosmwasm-icon.svg
  - title: Cosmos Hub
    description: Software powering Cosmos Hub, the heart of the Cosmos network, and home of the ATOM token.
    links:
      - name: Documentation
        url: https://hub.cosmos.network/
    image: /generic-star-icon.svg
articles:
  - title: Authz and Fee Grant Modules
    date: Thursday, March 10
    time: 4
    url: https://blog.cosmos.network/secret-powers-what-are-the-authz-and-fee-grant-modules-c57d0e808794
    image: /authz-article-banner.png
  - title: Tendermint v0.35
    date: Friday, November 5
    time: 4
    url: https://medium.com/tendermint/tendermint-v0-35-introduces-prioritized-mempool-a-makeover-to-the-peer-to-peer-network-more-61eea6ec572d
    image: /article-02.jpg
  - title: What is IBC?
    date: Tuesday, December 7
    time: 9
    url: https://bisontrails.co/ibc-protocol
    image: /article-03.jpg
-->

This repo contains the code and content for the [Developer Portal](https://developers.cosmos.network/) and the [Interchain Developer Academy](https://academy.cosmos.network/).

Note: The layout metadata at the top of the README.md file controls how the tutorial page is published. Write permissions are limited to preserve the structure and contents.

These tutorials guide you through actionable steps and walk-throughs to teach you how to use the Cosmos Stack. The Cosmos Stack is the world’s most popular framework for building application-specific blockchains, it consists of several products:

- **Cosmos SDK**, a modular framework to build blockchain applications
- **IBC**, the Inter-Blockchain Communication protocol that allows blockchains to communicate 
- **Tendermint**, the algorithm that provides the consensus and networking layer for your blockchain application

The Developer Portal contains three types of content:
- **Concepts**, informational content explaining the how the Cosmos Stack functions
- **Individual Tutorials**, short tutorials to get you up to speed with individual components
- **Checkers Game**, a modular tutorial that covers the full stack and teaches you every element from set-up to launching in production with a front-end application attached.

Going through the entire content will teach you about:

* Blockchain technology and cryptography
* Developing with the Cosmos SDK & Ignite CLI
* The Tendermint consensus algorithm
* The Inter-Blockchain Communication Protocol
* Building front- and backends with CosmJS
* Integrating wallets such as Keplr
* Relaying in the Cosmos Network

The code and docs for each tutorial are based on a specific version of the software. Be sure to follow the tutorial instructions to download and use the right version.

Use the tutorials landing page as your entry point to articles on [Cosmos blog](https://blog.cosmos.network/), videos on [Cosmos YouTube](https://www.youtube.com/c/CosmosProject/videos), and ways to get help and support.

This repo manages and publishes the tutorials. For details, see [CONTRIBUTING](CONTRIBUTING.md) and [TECHNICAL-SETUP](TECHNICAL-SETUP.md).
The tutorials are formatted using [markdownlint](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md).
