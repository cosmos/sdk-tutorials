package cli

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/sdk-tutorials/blog/blog/x/blog/types"
	"github.com/spf13/cobra"
)

func GetCmdListPost(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "list-post",
		Short: "list all post",
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/"+types.QueryListPost, queryRoute), nil)
			if err != nil {
				fmt.Printf("could not list Post\n%s\n", err.Error())
				return nil
			}
			var out []types.Post
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}
