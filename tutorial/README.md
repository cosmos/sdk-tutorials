# SDK Application Tutorial

In this tutorial, you will build a functional [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) application and, in the process, learn the basic concepts and structures of the SDK. The example will showcase how quickly and easily you can **build your own blockchain from scratch** on top of the Cosmos SDK.

By the end of this tutorial you will have a functional `nameservice` application, a mapping of strings to other strings (`map[string]string`). This is similar to [Namecoin](https://namecoin.org/), [ENS](https://ens.domains/), or [Handshake](https://handshake.org/), which all model the traditional DNS systems (`map[domain]zonefile`). Users will be able to buy unused names, or sell/trade their name.

All of the final source code for this tutorial project is in [this directory](https://github.com/cosmos/sdk-application-tutorial) (and compiles). However, it is best to follow along manually and try building the project yourself!

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
│   ├── nameservicecli
│   │   └── main.go
│   └── nameserviced
│       └── main.go
└── x
    └── nameservice
        ├── client
        │   └── cli
        │       ├── query.go
        │       └── tx.go
        ├── codec.go
        ├── handler.go
        ├── keeper.go
        ├── msgs.go
        └── querier.go
```

Start by creating a new git repository:

```bash
mkdir -p $GOPATH/src/github.com/{{ .Username }}/nameservice
cd $GOPATH/src/github.com/{{ .Username }}/nameservice
git init
```

Then, just follow along! The first step describes the design of your application. If you want to jump directly to the coding section, you can start with the [second step](./tutorial/keeper.md)

### Tutorial parts

1. [Design](./tutorial/app-design.md) the application.
2. Begin the implementation of your application in [`./app.go`](./tutorial/app-init.md).
2. Start building your module with the [`Keeper`](./tutorial/keeper.md).
3. Define state transitions through [`Msgs` and `Handlers`](./tutorial/msgs-handlers.md).
    * [`SetName`](./tutorial/set-name.md)
    * [`BuyName`](./tutorial/buy-name.md)
4. Make views on your state machine with [`Queriers`](./tutorial/queriers.md).
5. Register your types in the encoding format using [`sdk.Codec`](./tutorial/codec.md).
6. Create [CLI interactions for your module](./tutorial/cli.md).
7. Import your module and [finish building your application](./tutorial/app-complete.md)!
8. Create the [`nameserviced` and `nameservicecli` entry points](./tutorial/entrypoint.md) to your application.
9. Setup [dependency management using `dep`](./tutorial/dep.md).

## [Click here](./tutorial/app-design.md) to get started with the tutorial!
