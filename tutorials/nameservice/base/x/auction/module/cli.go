package module

import (
	"context"
	"fmt"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/spf13/cobra"

	auction "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"
)

func (AppModule) GetTxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:  auction.ModuleName,
		Args: cobra.ExactArgs(1),
		RunE: client.ValidateCmd,
	}

	cmd.AddCommand(
		ReserveCmd(),
	)
	return cmd
}

func ReserveCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "reserve [name] [resolve_address] [amount]",
		Short: "Create a new game",
		Args:  cobra.ExactArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}
			cmd.Println(fmt.Sprintf("This is the name: %s", args[0]))
			cmd.Println(fmt.Sprintf("This is the resolve: %s", args[1]))
			cmd.Println(fmt.Sprintf("This is the amount: %s", args[2]))

			sender := clientCtx.GetFromAddress()

			amt, err := sdk.ParseCoinsNormalized(args[2])
			if err != nil {
				return err
			}

			msg := &auction.MsgBid{
				Name:           args[0],
				ResolveAddress: args[1],
				Owner:          sender.String(),
				Amount:         amt,
			}

			cmd.Printf("Reserve Name: %s\n", msg)

			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func QueryWhoisCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "whois [name]",
		Short: "Get the resolve address and owner for a name record",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			queryClient := auction.NewQueryClient(clientCtx)
			params := &auction.QueryNameRequest{Name: args[0]}
			res, err := queryClient.Name(context.Background(), params)
			if err != nil {
				return err
			}

			cmd.Println(fmt.Sprintf("This is the name: %s", args[0]))
			cmd.Println(fmt.Sprintf("This is the resolve: %s", res.Name))
			cmd.Println(fmt.Sprintf("This is the owner: %s", res.Name.Owner))

			return nil
		},
	}

	flags.AddQueryFlagsToCmd(cmd)
	return cmd
}
