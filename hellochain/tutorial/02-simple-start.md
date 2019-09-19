# Simple Daemon

### hcd

Let's start with our "daemon". Open the file `cmd/hcd/main.go`. This will be
your `hellochain daemon` command. For now we will rely on `starter` to bundle
things up, but we will come back later to add our own `greeter` functionality
when it's ready.

Your `./cmd/hcd/main.go` should look like this. We will use it to start and run
our node.

```go
package main

import (
	"github.com/tendermint/tendermint/libs/cli"

	app "github.com/cosmos/hellochain"
	"github.com/cosmos/sdk-tutorials/utils/starter"
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

Next we will create a Makefile for building and installing the package.
