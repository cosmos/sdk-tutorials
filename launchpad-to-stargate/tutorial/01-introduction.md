---
order: 1
description: Migrate your Cosmos SDK application from v0.39 and earlier (Launchpad) to v0.40 and later (Stargate).
---

# Migrating from v0.39 to v0.40 and later using Starport

This tutorial is a guide to migrate your Cosmos SDK application from v0.39 and earlier (Launchpad) to v0.40 and later (Stargate). The Cosmos SDK v0.40 release comes with many features and enhancements, such as IBC, efficiency gains, protobuf support, and more.

## Requirements

We will be using Starport to assist us with the migration.

Install it by entering:

```bash
curl https://get.starport.network/starport@v0.13.1! | bash
```

This tutorial migrates the Proof of File existence (PoFE) tutorial from v0.39 and earlier to v0.40 and later (Stargate). The tutorial examples show a migration from Cosmos SDK version `v0.39.1` to `v0.40.0`.

To get the code for the Proof of File Existence (PoFE) application, clone the [pofe repo](https://github.com/cosmos/sdk-tutorials/tree/master/proof-of-file-existence/pofe).

## Resources

This tutorial regularly references the [App and Modules Migration](https://docs.cosmos.network/master/migrations/app_and_modules.html) documentation that contains crucial information about how to migrate a module and application from v0.39 to v0.40 and later (Stargate). 

The modular and composable design of Cosmos SDK applications simplifies the migration process by copying modules from v0.39 to a boilerplate Stargate v0.40 and later application and then updating the commands. This tutorial uses Starport to scaffold new files that are used as a baseline for migrating your application logic.

## Boilerplate application

In this tutorial, you move the logic from the `launchpad` application to the `stargate` application to make your blockchain Stargate-ready.

1. Put the v0.39 PoFE application in a `launchpad` directory.
1. Create an adjacent `stargate` directory. 

The directory structure should look like this:

```sh
.
├── launchpad # launchpad application directory
│   └── pofe 
│       ├── app
│       │   ...
└── stargate # stargate application directory

```

Once you have your application ready, we will be using Starport to assist us with the migration to Stargate.

Start off by scaffolding your application using the following command.

```sh
starport scaffold chain github.com/user/pofe
```

After the scaffold command is run, you should have a folder called `pofe` with your boilerplate Stargate application.

## Directory Structure

By taking a look at the directory structure, you can determine that there have been a few changes in the overall directory structure.

```sh
pofe
├── app
│   ├── app.go
│   ├── +++ encoding.go
│   ├── export.go
│   ├── +++ genesis.go
│   ├── +++ params
│   │   ├── +++ encoding.go
│   │   └── +++ proto.go
│   ├── prefix.go
│   └── +++ types.go
├── cmd
│   ├── # pofecli
│   │   └── # main.go
│   └── pofed
│       ├── cmd
│       │   ├── app.go
│       │   ├── genaccounts.go
│       │   └── root.go
│       └── main.go
├── config.yml
├── go.mod
├── go.sum
├── +++ internal
│   └── tools
│       └── tools.go
├── +++ proto
│   ├── cosmos
│   │   └── base
│   │       └── query
│   │           └── v1beta1
│   │               └── pagination.proto
│   └── pofe
│       ├── genesis.proto
│       └── query.proto
├── readme.md
├── +++ scripts
│   └── protocgen
├── +++ third_party
│   └── proto
│       ├── confio
│       │   └── proofs.proto
│       ├── cosmos_proto
│       │   └── cosmos.proto
│       ├── gogoproto
│       │   └── gogo.proto
│       ├── google
│       │   ├── api
│       │   │   ├── annotations.proto
│       │   │   ├── http.proto
│       │   │   └── httpbody.proto
│       │   └── protobuf
│       │       ├── any.proto
│       │       └── descriptor.proto
│       └── tendermint
│           ├── abci
│           │   └── types.proto
│           ├── crypto
│           │   ├── keys.proto
│           │   └── proof.proto
│           ├── libs
│           │   └── bits
│           │       └── types.proto
│           ├── types
│           │   ├── evidence.proto
│           │   ├── params.proto
│           │   ├── types.proto
│           │   └── validator.proto
│           └── version
│               └── types.proto
└── x
    └── pofe
        ├── # abci.go
        ├── client
        │   ├── cli
        │   │   ├── query.go
        │   │   └── tx.go
        │   └── rest
        │       └── rest.go
        ├── genesis.go
        ├── handler.go
        ├── keeper
        │   ├── +++ grpc_query.go
        │   ├── # params.go        
        │   ├── keeper.go
        │   └── query.go
        ├── module.go
        └── types
            ├── codec.go
            ├── errors.go
            ├── # events.go
            ├── # expected_keepers.go
            ├── genesis.go
            ├── +++ genesis.pb.go
            ├── # key.go
            ├── keys.go
            ├── # params.go
            ├── # querier.go
            ├── +++ query.go
            ├── +++ query.pb.go
            └── types.go
```

The first key change in the application is that `pofecli` no longer exists, and all of its functionality has been consolidated into `pofed`. You will still be able to access commands from `pofecli` in `pofed`.

The second notable change in the app structure is the integration of protobufs. Protobufs are a compiled form of messaging and therefore more performant than their JSONRPC counterparts.

The directory includes `pofe/internal`, `pofe/scripts`, `pofe/third_party`, and `pofe/proto` folders and the regex `*.pb.go` and `*.pb.gw.go` files.

Now you have a better understanding of the differences in your application and are prepared to migrate your application from v0.39 to v0.40 and later (Stargate).
