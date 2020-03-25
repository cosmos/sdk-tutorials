---
order: 0
---

# Getting started

Welcome to the quick and simple way to try out the Cosmos SDK. In this tutorial
will be building Hellochain, a "Hello World" blockchain with a basic `greeter`
module.

For this tutorial we are going to first build a "blank" application capable of
only bank-like interactions and then add some arbitrary "hello world"
functionality in the form of our `greeter` module. Nothing needs to be downloaded
or cloned, we will create every file from scratch.
In this tutorial we will create an app with the following file structure.

#TOOO make sure this is right
```bash
./hellochain
├── go.mod
├── Makefile
├── app.go
├── cmd
│   ├── hccli
│   │   └── main.go
│   └── hcd
│       └── main.go
└── x
    └── greeter
        ├── client
        │   ├── cli
        │   │   ├── query.go
        │   │   └── tx.go
        ├── internal
            ├── types
            |  ├── msgs.go
            |  └── types.go
            ├─ keeper
              └── querier.go
              ├── keeper.go
        ├── alias.go
        ├── module.go
        ├── handler.go

```

# Scaffold
we will be using the [scaffold tool](https://github.com/cosmos/scaffoldihttps://github.com/cosmos/scaffold) to jumpstart our app and skip much of the boilerplate required.
Install and test scaffold and test it with the following commands.
```bash
it clone git@github.com:cosmos/scaffold.git
cd scaffold
make tools
make install
scaffold --help
```

Use the following command to create the home directory for your "hello world" blockchain app containing the minimum necessary code (specified by the `lvl-1` arg) for a functioning PoS Tendermint blockchain app.
zthe command requires you provide a github username and repo name from which it will construct your app's path
```bash
$ scaffold  app lvl-1 <github user name> <repo name>
$scaffold app lvl-1 cosmos sdk-tutorials hellochain

Start by creating a new git repository:

```bash
mkdir -p hellochain
cd hellochain
git init
```

Then initialize your app as a go module:

```bash
cd ./hellochain
go mod init
```

Ok now you are ready to write some code.

Want to run this tutorial locally? Install
[Vuepress](https://vuepress.vuejs.org/) and run `vuepress dev` to follow along
at http://localhost:8080
