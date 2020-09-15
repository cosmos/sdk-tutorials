package cli

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/spf13/cobra"
  "github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/types"
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
