package main

import (
	"github.com/tendermint/tendermint/libs/cli"

	app "github.com/cosmos/hellochain"
	"github.com/cosmos/sdk-tutorials/utils/starter"
)

func main() {

	params := starter.NewServerCommandParams(
		"hcd",
		"hellochain AppDaemon",
		starter.NewAppCreator(app.NewHelloChainApp),
		starter.NewAppExporter(app.NewHelloChainApp),
	)

	serverCmd := starter.NewServerCommand(params)

	// prepare and add flags
	executor := cli.PrepareBaseCmd(serverCmd, "HC", starter.DefaultNodeHome)
	err := executor.Execute()
	if err != nil {
		panic(err)
	}
}
