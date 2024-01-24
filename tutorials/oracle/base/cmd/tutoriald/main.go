package main

import (
	"fmt"
	"os"

	svrcmd "github.com/cosmos/cosmos-sdk/server/cmd"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/app"
	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/app/params"
	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/cmd/tutoriald/cmd"
)

func main() {
	params.SetAddressPrefixes()

	rootCmd := cmd.NewRootCmd()
	if err := svrcmd.Execute(rootCmd, "", app.DefaultNodeHome); err != nil {
		fmt.Fprintln(rootCmd.OutOrStderr(), err)
		os.Exit(1)
	}
}
