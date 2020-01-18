---
order: 2
---

# Simple Daemon

## hcd

Let's start with our "daemon". Create the file `cmd/hcd/main.go`. This will be
your `hellochain daemon` command. For now we will rely on `starter` to bundle
things up, but we will come back later to add our own `greeter` functionality
when it's ready.

Your `./cmd/hcd/main.go` should look like this. We will use it to start and run
our node.

```go
package main

import (
	"github.com/tendermint/tendermint/libs/cli"

	app "github.com/cosmos/sdk-tutorials/hellochain"
	"github.com/cosmos/sdk-tutorials/hellochain/starter"
)

func main() {


	params := starter.NewServerCommandParams(
		"hcd", // name of the command
		"hellochain AppDaemon", // description
		starter.NewAppCreator(app.NewHelloChainApp), // method for constructing an app
		starter.NewAppExporter(app.NewHelloChainApp), // method for exporting chain state
	)

	serverCmd := starter.NewServerCommand(params)

	// prepare and add flags
	executor := cli.PrepareBaseCmd(serverCmd, "HC", starter.DefaultNodeHome)
	err := executor.Execute()
	if err != nil {
		panic(err)
	}
}
```

::: tip
The Cosmos SDK uses [cobra])(https://github.com/spf13/cobra) for building and
running CLI commands.
:::

## hccli

Next we will create the cli for interacting with the modules and parts of the chain. Start by creating the file `cmd/hccli/main.go`. We will be relying on the start package for now, until we come back to add the module you will create in this tutorial.

```go
package main

import (
	"github.com/tendermint/tendermint/libs/cli"

	app "github.com/cosmos/sdk-tutorials/hellochain"
	"github.com/cosmos/sdk-tutorials/hellochain/starter"
)

func main() {

	starter.BuildModuleBasics()

	rootCmd := starter.NewCLICommand()

	txCmd := starter.TxCmd(starter.Cdc)
	queryCmd := starter.QueryCmd(starter.Cdc)

	// add more Tx and Query commands
	app.ModuleBasics.AddTxCommands(txCmd, starter.Cdc)
	app.ModuleBasics.AddQueryCommands(queryCmd, starter.Cdc)
	rootCmd.AddCommand(txCmd, queryCmd)

	executor := cli.PrepareMainCmd(rootCmd, "HC", starter.DefaultCLIHome)
	err := executor.Execute()
	if err != nil {
		panic(err)
	}
}
```

Next we will create a Makefile for building and installing the package.