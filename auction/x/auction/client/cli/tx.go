package cli

import (
	"time"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/x/auth"
	"github.com/cosmos/cosmos-sdk/x/auth/client/utils"
	"github.com/cosmos/sdk-application-tutorial/auction/x/auction/internal/types"
	"github.com/spf13/cobra"
)

func GetTxCmd(sKey string, cdc *codec.Codec) *cobra.Command {
	auctionTxCmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "auction transaction subcommands",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	auctionTxCmd.AddCommand(client.PostCommands(
		GetCmdCreateAuction(cdc),
		GetCmdPlaceBid(cdc),
	)...)

	return auctionTxCmd
}

// GetCmdCreateAuction is the CLI command for creating auctions
func GetCmdCreateAuction(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "create-auction [nft-id] [nft-denom] [end-time]",
		Short: "create an auction for your nft",
		Args:  cobra.ExactArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)

			txBldr := auth.NewTxBuilderFromCLI().WithTxEncoder(utils.GetTxEncoder(cdc))

			auctionDuration, err := time.ParseDuration(args[2])
			if err != nil {
				return err
			}

			msg := types.NewMsgCreateAuction(args[0], args[1], cliCtx.GetFromAddress(), auctionDuration)
			err2 := msg.ValidateBasic()
			if err2 != nil {
				return err2
			}

			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}

// Place Bid

func GetCmdPlaceBid(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use: "bid [nft-id] [bid]",
		Short: "Place a bid on a auction"
		Args: cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)

			txBldr := auth.NewTxBuilderFromCLI().WithTxEncoder(utils.GetTxEncoder(cdc))

			coins, err := sdk.ParseCoins(args[1])
			if err != nil {
				return err
			}

			msg := types.NewMsgBid(cliCtx.GetFromAddress(), coins, args[0])
			err2 := msg.ValidateBasic()
			if err2 != nil {
				return err2
			}

			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}
