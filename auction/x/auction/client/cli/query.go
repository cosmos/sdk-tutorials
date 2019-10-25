package cli

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/sdk-tutorials/auction/x/auction/internal/types"

	"github.com/spf13/cobra"
)

func GetQueryCmd(queryRoute string, cdc *codec.Codec) *cobra.Command {
	auctionQueryCmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "Querying commands for the nameservice module",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	auctionQueryCmd.AddCommand(client.GetCommands(
		GetCmdAuction(queryRoute, cdc),
		GetCmdAuctions(queryRoute, cdc),
	)...)

	return auctionQueryCmd
}

func GetCmdAuction(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "auction [nft-id]",
		Short: "query an auction",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			auctionID := args[0]

			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/auction/%s", queryRoute, auctionID), nil)
			if err != nil {
				fmt.Printf("could not find the auction")
				return err
			}

			var auction types.Auction
			cdc.MustUnmarshalJSON(res, &auction)
			return cliCtx.PrintOutput(auction)
		},
	}
}

func GetCmdAuctions(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "auctions",
		Short: "Get all Auctions",
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/auctions", queryRoute), nil)
			if err != nil {
				return err
			}

			var auctions []types.Auction
			cdc.MustUnmarshalJSON(res, &auctions)
			return cliCtx.PrintOutput(auctions)
		},
	}
}
