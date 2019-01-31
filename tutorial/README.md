# Getting Started

In this tutorial, you will build a functional [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) application and, in the process, learn the basic concepts and structures of the SDK. The example will showcase how quickly and easily you can **build your own blockchain from scratch** on top of the Cosmos SDK.

By the end of this tutorial you will have a functional `nameservice` application, a mapping of strings to other strings (`map[string]string`). This is similar to [Namecoin](https://namecoin.org/), [ENS](https://ens.domains/), or [Handshake](https://handshake.org/), which all model the traditional DNS systems (`map[domain]zonefile`). Users will be able to buy unused names, or sell/trade their name.

All of the final source code for this tutorial project is in this directory (and compiles). However, it is best to follow along manually and try building the project yourself!

## Requirements

- [`golang` >1.11](https://golang.org/doc/install) installed
- A working [`$GOPATH`](https://github.com/golang/go/wiki/SettingGOPATH)
- Desire to create your own blockchain!

## Tutorial

Through the course of this tutorial you will create the following files that make up your application:

```bash
./nameservice
├── Gopkg.toml
├── Makefile
├── app.go
├── cmd
│   ├── nscli
│   │   └── main.go
│   └── nsd
│       └── main.go
└── x
    └── nameservice
        ├── client
        │   ├── cli
        │   │   ├── query.go
        │   │   └── tx.go
        │   ├── rest
        │   │   └── rest.go
        │   └── module_client.go
        ├── codec.go
        ├── handler.go
        ├── keeper.go
        ├── msgs.go
        └── querier.go
```

Start by creating a new git repository:

```bash
mkdir -p $GOPATH/src/github.com/{ .Username }/nameservice
cd $GOPATH/src/github.com/{ .Username }/nameservice
git init
```

Then, just follow along! The first step describes the design of your application. If you want to jump directly to the coding section, you can start with the [second step](./keeper.md)

### Tutorial parts

1. [Design](./app-design.md) the application.
2. Begin the implementation of your application in [`./app.go`](./app-init.md).
3. Start building your module with the [`Keeper`](./keeper.md).
4. Define state transitions through [`Msgs` and `Handlers`](./msgs-handlers.md).
    * [`SetName`](./set-name.md)
    * [`BuyName`](./buy-name.md)
5. Make views on your state machine with [`Queriers`](./queriers.md).
6. Register your types in the encoding format using [`sdk.Codec`](./codec.md).
7. Create [CLI interactions for your module](./cli.md).
8. Create [HTTP routes for clients to access your nameservice](./rest.md)
9. Import your module and [finish building your application](./app-complete.md)!
10. Create the [`nsd` and `nscli` entry points](./entrypoint.md) to your application.
11. Setup [dependency management using `dep`](./dep.md).
12. [Build and run](./build-run.md) the example.
13. [Run REST routes](./run-rest.md).

## [Click here](./app-design.md) to get started with the tutorial!
