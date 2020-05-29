---
order: 0
---

# Getting started

Welcome to the quick and simple way to try out the [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) . In this tutorial
will be building Hellochain, a "Hello World" blockchain with a basic `greeter` module.

For this tutorial we are going to first build a "blank" application capable of
only bank-like interactions and then add some arbitrary "hello world"
functionality in the form of our `greeter` module.

All of the final source code for this tutorial project is in this directory (and compiles). However, it is best to follow along manually and try building the project yourself!

## Requirements

- [`golang` >1.13.0](https://golang.org/doc/install) installed

In this tutorial we will create an app with the following file structure. You do not need to download any code to get started as the top level `hellochain` directory will be created for you by the `scaffold` tool. For reference, a completed version of this app is contained in the `sdk-tutorials/hellochain` directory.
```bash

./hellochain
├── Makefile
├── README.md
├── app
│   ├── app.go
│   └── export.go
├── cmd
│   ├── acli
│   │   └── main.go
│   └── aud
│       ├── genaccounts.go
│       └── main.go
├── go.mod
├── go.sum
├── init.sh
├── space.png
└── x
    └── greeter
        ├── README.md
        ├── abci.go
        ├── alias.go
        ├── client
        │   ├── cli
        │   │   ├── query.go
        │   │   └── tx.go
        │   └── rest
        │       ├── query.go
        │       ├── rest.go
        │       └── tx.go
        ├── genesis.go
        ├── handler.go
        ├── keeper
        │   ├── keeper.go
        │   ├── params.go
        │   └── querier.go
        ├── module.go
        ├── spec
        │   └── README.md
        └── types
            ├── codec.go
            ├── errors.go
            ├── expected_keepers.go
            ├── genesis.go
            ├── key.go
            ├── msgs.go
            └── types.go

```

# Scaffold
we will be using the [scaffold tool](https://github.com/cosmos/scaffoldihttps://github.com/cosmos/scaffold) to jumpstart our app and skip much of the boilerplate required.
Install and test scaffold  with the following commands.
```bash
git clone git@github.com:cosmos/scaffold.git
cd scaffold
make tools
make install
scaffold --help
```

Once installed, use the following scaffold command to create the home directory for your "hellochain" blockchain containing the minimum necessary code (specified by the `lvl-1` arg) for a functioning  Tendermint blockchain app.
the command requires you toprovide a github username and repo name from which it will construct your app's path. match these with the ditrctory path in which you have saved your app (i.e `$GOPATH/github.com/user/repo/hellochain`

```bash
$ scaffold  app lvl-1 <github user name> <repo name>
```

For this tutorial we will name the repo HelloChain, but you can add your Github username.

Ok now that we have a basic working app daemon, its time to construct our `greeter` module to add some functionality to our chain.



Want to run this tutorial locally? Install
[Vuepress](https://vuepress.vuejs.org/) and run `vuepress dev` to follow along
at http://localhost:8080
