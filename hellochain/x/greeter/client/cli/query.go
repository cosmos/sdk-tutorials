package cli

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/codec"

	gtypes "github.com/cosmos/sdk-tutorials/hellochain/x/greeter/internal/types"
)

// GetQueryCmd returns the parent query command for the greeter module
func GetQueryCmd(storeKey string, cdc *codec.Codec) *cobra.Command {

	greeterQueryCmd := &cobra.Command{
		Use:                        "greeter",
		Short:                      "Querying commands for the greeter module",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}
	greeterQueryCmd.AddCommand(flags.GetCommands(
		GetCmdListGreetings(storeKey, cdc),
	)...)
	return greeterQueryCmd
}

// GetCmdListGreetings returns the command to list greetings for a given address
func GetCmdListGreetings(queryRoute string, cdc *codec.Codec) *cobra.Command {

	return &cobra.Command{
		Use:   "list [addr]",
		Short: "list greetings for address. Usage list [address]",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			addr := args[0]

			/*
				cliCtx.QueryWithData queries your app using a specific URL format described below.
				The route string formats to "custom/greeter/list/addr"
				"/custom/" for custom modules added by you,
				"/greeter/" the module's QuerierRoute
				"/list/" 		the specific endpoint for greeter's Querier
				"/addr" 		the query parameter
			*/

			route := fmt.Sprintf("custom/%s/list/%s", queryRoute, addr)
			res, _, err := cliCtx.QueryWithData(route, nil)
			if err != nil {
				return nil
			}

			out := gtypes.NewQueryResGreetings()
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}
