---
order: 0
---

# Getting Started

In this tutorial, you will build a functional [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) application and, in the process, learn the basic concepts and structures of the SDK. The example will showcase how quickly and easily you can **build your own blockchain from scratch** on top of the Cosmos SDK.

By the end of this tutorial you will have a functional `nameservice` application, a mapping of strings to other strings (`map[string]string`). This is similar to [Namecoin](https://namecoin.org/), [ENS](https://ens.domains/), or [Handshake](https://handshake.org/), which all model the traditional DNS systems (`map[domain]zonefile`). Users will be able to buy unused names, or sell/trade their name.

All of the final source code for this tutorial project is in this directory (and compiles). However, it is best to follow along manually and try building the project yourself!

## Requirements

- [`golang` >1.15](https://golang.org/doc/install) installed
- Github account and either [Github CLI](https://hub.github.com/) or [Github Desktop (64-bit required)](https://help.github.com/en/desktop/getting-started-with-github-desktop/installing-github-desktop)
- Desire to create your own blockchain!

For this tutorial we will be using [Starport](https://github.com/tendermint/starport) v0.13.1, an easy to use tool for building blockchains. To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.13.1! | bash
```

You can also use Starport v0.13.1 on the web in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.13.1). Learn more about other ways to [install Starport](https://github.com/tendermint/starport/blob/develop/docs/1%20Introduction/2%20Install.md).

## Tutorial

Through the course of this tutorial you will create the following files that make up your application:

```bash
./nameservice
├── Makefile
├── Makefile.ledger
├── app.go
├── cmd
│   ├── nameservicecli
│   │   └── main.go
│   └── nameserviced
│       └── main.go
├── go.mod
├── go.sum
└── x
    └── nameservice
        ├── alias.go
        ├── client
        │   ├── cli
        │   │   ├── query.go
        │   │   └── tx.go
        │   └── rest
        │       ├── query.go
        │       ├── rest.go
        │       └── tx.go
        ├── genesis.go
        ├── handler.go
        ├── keeper
        │   ├── keeper.go
        │   └── querier.go
        ├── types
        │   ├── codec.go
        │   ├── errors.go
        │   ├── expected_keepers.go
        │   ├── key.go
        │   ├── msgs.go
        │   ├── querier.go
        │   └── types.go
        └── module.go
```

Follow along! The first step describes the design of your application.
