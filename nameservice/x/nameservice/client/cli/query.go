package cli

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/sdk-tutorials/nameservice/x/nameservice/internal/types"
	"github.com/spf13/cobra"
)

func GetQueryCmd(storeKey string, cdc *codec.Codec) *cobra.Command {
	nameserviceQueryCmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "Querying commands for the nameservice module",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}
	nameserviceQueryCmd.AddCommand(client.GetCommands(
		GetCmdResolveName(storeKey, cdc),
		GetCmdWhois(storeKey, cdc),
		GetCmdNames(storeKey, cdc),
	)...)
	return nameserviceQueryCmd
}

// GetCmdResolveName queries information about a name
func GetCmdResolveName(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "resolve [name]",
		Short: "resolve name",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			name := args[0]

			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/resolve/%s", queryRoute, name), nil)
			if err != nil {
				fmt.Printf("could not resolve name - %s \n", name)
				return nil
			}

			var out types.QueryResResolve
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}

// GetCmdWhois queries information about a domain
func GetCmdWhois(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "whois [name]",
		Short: "Query whois info of name",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			name := args[0]

			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/whois/%s", queryRoute, name), nil)
			if err != nil {
				fmt.Printf("could not resolve whois - %s \n", name)
				return nil
			}

			var out types.Whois
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}

// GetCmdNames queries a list of all names
func GetCmdNames(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "names",
		Short: "names",
		// Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)

			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/names", queryRoute), nil)
			if err != nil {
				fmt.Printf("could not get query names\n")
				return nil
			}

			var out types.QueryResNames
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}
