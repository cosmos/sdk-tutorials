package cli

import (
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-application-tutorial/auction/x/auction/internal/types"
	"github.com/spf13/cobra"
	"github.com/cosmos/cosmos-sdk/x/auth/client/utils"
)

func GetTxCmd(sKey string, cdc *codec.Codec) *cobra.Command {
	auctionTxCmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "auction transaction subcommands",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	return auctionTxCmd
}

// GetCmdCreateAuction is the CLI command for creating auctions
func GetCmdCreateAuction(cdc *codec.Codec) *cobra.Command {
return &cobra.Command{
	Use: "create-auction [nft-id] [nft-denom] [end-time]",
	Short: "create an auction for your nft",
	Args: cobra.ExtractArgs(3),
	RunE: func(cmd *cobra.Command, args []string) error {
		cliCtx := context.NewCLIContext().WithCodec(cdc)

		txBldr := auth.NewTxBuilderFromCLI().WithTxEncoder(utils.GetTxEncoder(cdc))

		msg := types.NewMsgCreateAuction(args[0], args[1], cliCtx.GetFromAddress(), args[3])
		err := msg.ValidateBasic()
		if err != nil {
			return err
		}

		return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
	},
}
}

// Place Bid
