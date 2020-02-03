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

### Starter

To speed up this tutorial, A lot of basic functionality comes packaged for you
in the [starter](https://github.com/cosmos/sdk-tutorials/tree/master/hellochain/starter)
package. It will provide basic accounts, a bank, authentication, transaction
(Tx) verification as well as some helper functions for building CLI tools.
`starter` is your "crutch" for this tutorial. It is a heavily configured
abstraction for the point of skipping boilerplate and getting something up and
running quickly. Later, when you start the nameservice tutorial, you will kick
out this "crutch", but for now let's include it.

In this tutorial we will create an app with the following file structure.

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
