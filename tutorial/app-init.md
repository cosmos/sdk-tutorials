# Start your application

Get started by creating a new file: `./app.go`. This file is the heart of your deterministic state-machine.

In `app.go`, you define what the application does when it receives a transaction. But first, it needs to be able to receive transactions in the correct order. This is the role of the [Tendermint consensus engine](https://github.com/tendermint/tendermint).

Start by importing the necessary dependencies:

```go
package app

import (
  "github.com/tendermint/tendermint/libs/log"
  "github.com/cosmos/cosmos-sdk/x/auth"

  bam "github.com/cosmos/cosmos-sdk/baseapp"
  dbm "github.com/tendermint/tendermint/libs/db"
)
```

Links to godocs for each module and package imported:

- [`log`](https://godoc.org/github.com/tendermint/tendermint/libs/log): Tendermint's logger.
- [`auth`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/auth): The `auth` module for the Comsos SDK.
- [`dbm`](https://godoc.org/github.com/tendermint/tendermint/libs/db): Code for working with the Tendermint database.
- [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp): See below

A couple of the packages here are `tendermint` packages. Tendermint passes transactions from the network to the application through an interface called the [ABCI](https://github.com/tendermint/tendermint/tree/master/abci). If you look at the architecture of the blockchain node you are building, it looks like the following:

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
- Commit if the ABCI message is [`DeliverTx`](https://tendermint.com/docs/spec/abci/abci.html#delivertx) ([`CheckTx`](https://tendermint.com/docs/spec/abci/abci.html#checktx) changes are not persistent).
- Help set up [`Beginblock`](https://tendermint.com/docs/spec/abci/abci.html#beginblock) and [`Endblock`](https://tendermint.com/docs/spec/abci/abci.html#endblock), two messages that enable you to define logic executed at the beginning and end of each block. In practice, each module implements its own `BeginBlock` and `EndBlock` sub-logic, and the role of the app is to aggregate everything together (_Note: you won't be using these messages in your application_).
- Help initialise your state.
- Help set up queries.

Now you need to create a new custom type `nameServiceApp` for your application. This type will embed `baseapp` (embedding in Go similar to inheritance in other languages), meaning it will have access to all of `baseapp`'s methods.

```go
const (
    appName = "nameservice"
)

type nameServiceApp struct {
    *bam.BaseApp
}
```

Add a simple constructor for your application:

```go
func NewNameServiceApp(logger log.Logger, db dbm.DB) *nameServiceApp {

    // First define the top level codec that will be shared by the different modules. Note: Codec will be explained later
    cdc := MakeCodec()

    // BaseApp handles interactions with Tendermint through the ABCI protocol
    bApp := bam.NewBaseApp(appName, logger, db, auth.DefaultTxDecoder(cdc))

    var app = &nameServiceApp{
        BaseApp: bApp,
        cdc:     cdc,
    }

    return app
}
```

Great! You now have the skeleton of your application; however, it still lacks functionality.

`baseapp` has no knowledge of the routes or user interactions you want to use in your application. The primary role of your application is to define these routes. Another role is to define the initial state. Both these things require that you add modules to your application.

As you have seen in the [application design](./app-design.md) section, you need three modules for your nameservice: `auth`, `bank` and `nameservice`. The first two already exist, but not the last! The `nameservice` module will define the bulk of your state machine. The next step is to build it.

### In order to complete your application, you need to include modules. Go ahead and [start building your nameservice module](./keeper.md). You will come back to `app.go` later.
