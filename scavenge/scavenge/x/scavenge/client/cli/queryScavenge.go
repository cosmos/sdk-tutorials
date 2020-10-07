package cli

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/sdk-tutorials/scavenge/scavenge/x/scavenge/types"
	"github.com/spf13/cobra"
)

func GetCmdListScavenge(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "list-scavenge",
		Short: "list all scavenge",
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/"+types.QueryListScavenge, queryRoute), nil)
			if err != nil {
				fmt.Printf("could not list Scavenge\n%s\n", err.Error())
				return nil
			}
			var out []types.Scavenge
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}

func GetCmdGetScavenge(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "get-scavenge [solutionHash]",
		Short: "Query a scavenge by solutionHash",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			solutionHash := args[0]

			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/%s/%s", queryRoute, types.QueryGetScavenge, solutionHash), nil)
			if err != nil {
				fmt.Printf("could not resolve scavenge %s \n%s\n", solutionHash, err.Error())

				return nil
			}

			var out types.Scavenge
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}
