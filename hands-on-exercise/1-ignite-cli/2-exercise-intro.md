---
title: "Exercise - Make a Checkers Blockchain"
order: 3
description: Exercise introduction
tags:
  - concepts
  - cosmos-sdk
---

# Exercise - Make a Checkers Blockchain

The next sections are all about creating a decentralized game of checkers (see the rules [here](https://www.ducksters.com/games/checkers_rules.php)) using Ignite CLI and the Cosmos SDK. Each section progressively advances the project. To learn the most efficiently, you should treat each section as _a solution_ to the questions raised at the start of the section.

## Is it for me?

These exercises help you prepare a conceptual framework for the information that follows. You are not tested on them, but it is in your best interest to complete each one before moving on to the associated section.

<HighlightBox type="info">

Although the guided coding exercises use Cosmos SDK **v0.45.4**, the current release is at _v0.47.2_. In addition, v0.50 is imminent, and will feature the following:

* **ABCI++**: a refactor of the ABCI layer to enable more use cases. In particular the SDK’s `EndBlock` disappears as a module function and is replaced by another while keeping the same conceptual capability.
* **Core API**: the creation of a stable, standard API for building modules that is independent of the SDK and CometBFT versions, allowing for modules to be written which can target multiple implementations of these dependencies.
* **Global `bech32` removal**: currently bech32 prefixes are a global in the Cosmos SDK and for applications as well. The objective is to remove most if not all globals within the SDK.
* **gRPC requirements for IBC relayers**: IBC relayers such as the Go Relayer and Hermes Relayer still use the RPC endpoint of full nodes. For easier interoperability, relayers should ideally switch completely to using the gRPC interface.
* **x/tx sign mode handlers**: sign mode handlers are being added to the x/tx module that natively use the new Golang Protobuf API.
* **`GetSigners`**: as `GetSigners` is now automated, it can be removed from msg.go; an extension interface will be added for users that still need it.
* **`ValidateBasic`**: with the use of `ValidateBasic` considered optional, the Cosmos SDK will remove its usage in favor of having all validation happen on `msg` server. The SDK will still support an extension interface for those that would like to continue using it.
* **Migration of the new store module**: the use of a new node key format necessitates migration of the original IAVL store to the new version.
* **Integration testing**: becomes more meaningful with only dependencies being instantiated, instead of a whole app.

For a sense of the scale of the Cosmos SDK's ongoing development, you can review **all** the changes that have been implemented to date at [this link](https://github.com/cosmos/cosmos-sdk/releases).

</HighlightBox>

<!--## Next up

Start with your checkers blockchain by heading to the [next section](./3-stored-game.md).-->
