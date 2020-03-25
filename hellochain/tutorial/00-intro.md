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
$scaffold app lvl-1 cosmos sdk-tutorials hellochain
```



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

Now lets test our appp daemon command to ensure that our scaffolded app is correct. Here we will run`aud` our app daemon  and call the `init` command with the `--help` flag. we will call `init` again later in this tutorial when our chain is ready but for now lets check that all is working correctly.

```bash
$ cd hellochain
$ go run cmd/aud/main.go cmd/audgenaccounts.go -- init  --help

```
You should see the following output
```bash
Initialize validators's and node's configuration files.

Usage:
  aud init [moniker] [flags]

Flags:
      --chain-id string   genesis file chain-id, if left blank will be randomly created
  -h, --help              help for init
  -o, --overwrite         overwrite the genesis.json file

Global Flags:
      --home string             directory for config and data (default "/Users/digitalhans/.aud")
      --inv-check-period uint   Assert registered invariants every N blocks
      --log_level string        Log level (default "main:info,state:info,*:error")
      --trace                   print out full stack trace on errors
```
Ok now that we have a basic working app daemon, its time to construct our `greeter` module to add some functionality to our chain.



Want to run this tutorial locally? Install
[Vuepress](https://vuepress.vuejs.org/) and run `vuepress dev` to follow along
at http://localhost:8080
