---
order: 02
---

# Start your application

Let's get started by creating a new app, we'll be using the lvl-1 [app template](https://github.com/cosmos/scaffold/blob/master/docs/app.md) provided by the scaffold tool.

Run the following command, where `user` is your Github username and `repo` is the name of the repo where you'll be creating your application, `nameservice-tutorial` for example. For now you don't need any flags, but scaffold allows you to choose extra configuration options at this step if you like.
```bash
scaffold app lvl-1 [user] [repo] [flags]

cd [repo]
```

Inside the repo you just created you'll see three directories: `app` which holds the definition of the main state machine runtime, `cmd` with commands for interacting with the runtime, and `x` that contains the application-specific modules with message/transaction processing logic that will be combined with the main runtime to form the complete state machine.

In `app/app.go` we'll see the runtime logic describing what the application does when it receives a transaction. This file imports several modules and packages, the godocs of which can be found here:

- [`log`](https://godoc.org/github.com/tendermint/tendermint/libs/log): Tendermint's logger.
- [`auth`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/auth): The `auth` module for the Cosmos SDK.
- [`dbm`](https://godoc.org/github.com/tendermint/tm-db): Code for working with the Tendermint database.
- [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp): See below

You'll notice several of the imported packages listed above are `Tendermint` packages. In order to build a blockchain application, the state machine must receive transactions in the correct order, which is the job of the [Tendermint consensus engine](https://github.com/tendermint/tendermint).  Tendermint passes transactions from the network to the application through an interface called the [ABCI](https://docs.tendermint.com/master/spec/abci/). The architecture of the blockchain node, including your App (state machine) and Tendermint (consensus layer) looks like the following:


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

Fortunately, you do not have to implement the ABCI interface. The Cosmos SDK provides a boilerplate implementation of it in the form of [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp).

Here is what `baseapp` does:

- Decode transactions received from the Tendermint consensus engine.
- Extract messages from transactions and do basic sanity checks.
- Route the message to the appropriate module so that it can be processed. Note that `baseapp` has no knowledge of the specific modules you want to use. It is your job to declare such modules in `app.go`, as you will see later in this tutorial. `baseapp` only implements the core routing logic that can be applied to any module.
- Commit if the ABCI message is [`DeliverTx`](https://docs.tendermint.com/master/spec/abci/abci.html#delivertx) ([`CheckTx`](https://docs.tendermint.com/master/spec/abci/abci.html#checktx) changes are not persistent).
- Help set up [`Beginblock`](https://docs.tendermint.com/master/spec/abci/abci.html#beginblock) and [`Endblock`](https://docs.tendermint.com/master/spec/abci/abci.html#endblock), two messages that enable you to define logic executed at the beginning and end of each block. In practice, each module implements its own `BeginBlock` and `EndBlock` sub-logic, and the role of the app is to aggregate everything together (_Note: you won't be using these messages in your application_).
- Help initialize your state.
- Help set up queries.

Now you need to rename the `appName` & `newApp` types to the name of your app. In this case you can use `nameservice` & `nameServiceApp`. This type will embed `baseapp` (embedding in Go similar to inheritance in other languages), meaning it will have access to all of `baseapp`'s methods.

Great! You now have the start of your application. Currently you have a working blockchain, but we will customize it throughout this tutorial.

`baseapp` has no knowledge of the routes or user interactions you want to use in your application. The primary role of your application is to define these routes. Another role is to define the initial state. Both these things require that you add modules to your application.

As you have seen in the [application design](./app-design.md) section, you need a few modules for your nameservice: `auth`, `bank`, `staking`, `distribution`, `slashing` and `nameservice`. The first five already exist, but not the last! The `nameservice` module will define the bulk of your state machine. The next step is to build it.

### In order to complete your application, you need to include modules. Go ahead and start building your nameservice module. You will come back to `app.go` later.
