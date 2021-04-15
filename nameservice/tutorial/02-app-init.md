---
order: 02
---

# Start your application

Get started by creating a new app, we will be using the `app` command which is provided by the Starport.

You can fill in `username` with your Github username and `repo` with the name of the repo you are creating. 
```bash
starport app github.com/username/nameservice
cd nameservice
```

## Overview

In `app.go` it is defined what the application does when it receives a transaction. But first, it needs to be able to receive transactions in the correct order. This is the role of the [Tendermint consensus engine](https://github.com/tendermint/tendermint).

Links to godocs for each module and package imported:

- [`log`](https://godoc.org/github.com/tendermint/tendermint/libs/log): Tendermint's logger.
- [`auth`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/auth): The `auth` module for the Cosmos SDK.
- [`dbm`](https://godoc.org/github.com/tendermint/tm-db): Code for working with the Tendermint database.
- [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp): See below

A couple of the packages here are `tendermint` packages. Tendermint passes transactions from the network to the application through an interface called the [ABCI](https://docs.tendermint.com/master/spec/abci/). If you look at the architecture of the blockchain node you are building, it looks like the following:

```
+---------------------+
|                     |
|     Application     |
|                     |
+--------+---+--------+
         ^   |
         |   | ABCI
         |   v
+--------+---+--------+
|                     |
|                     |
|     Tendermint      |
|                     |
|                     |
+---------------------+
```

Fortunately, you do not have to implement the ABCI interface. Starport handles the implementation for you.
If you are interested to learn more, the Cosmos SDK provides a boilerplate implementation of it in the form of [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp).

Here is what `baseapp` does:

- Decode transactions received from the Tendermint consensus engine.
- Extract messages from transactions and do basic sanity checks.
- Route the message to the appropriate module so that it can be processed. Note that `baseapp` has no knowledge of the specific modules you want to use. It is your job to declare such modules in `app.go`, as you will see later in this tutorial. `baseapp` only implements the core routing logic that can be applied to any module.
- Commit if the ABCI message is [`DeliverTx`](https://docs.tendermint.com/master/spec/abci/abci.html#delivertx) ([`CheckTx`](https://docs.tendermint.com/master/spec/abci/abci.html#checktx) changes are not persistent).
- Help set up [`BeginBlock`](https://docs.tendermint.com/master/spec/abci/abci.html#beginblock) and [`Endblock`](https://docs.tendermint.com/master/spec/abci/abci.html#endblock), two messages that enable you to define logic executed at the beginning and end of each block. In practice, each module implements its own `BeginBlock` and `EndBlock` sub-logic, and the role of the app is to aggregate everything together (_Note: you won't be using these messages in your application_).
- Help initialize your state.
- Help set up queries.

Great! You now have the start of your application. Currently you have a working blockchain, but we will customize it throughout this tutorial.

## Running your application

As you have seen in the [application design](./app-design.md) section, you need a few modules for your nameservice: `auth`, `bank`, `staking`, `distribution`, `slashing` and `nameservice`.

### In order to complete your application, you need to include modules. Go ahead and start building your nameservice module. You will come back to `app.go` later.
