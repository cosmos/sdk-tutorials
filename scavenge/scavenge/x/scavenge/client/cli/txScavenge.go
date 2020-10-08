package cli

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/x/auth"
	"github.com/cosmos/cosmos-sdk/x/auth/client/utils"
	"github.com/sdk-tutorials/scavenge/scavenge/x/scavenge/types"
)

func GetCmdCreateScavenge(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "create-scavenge [description] [solution] [reward]",
		Short: "Creates a new scavenge",
		Args:  cobra.ExactArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			inBuf := bufio.NewReader(cmd.InOrStdin())
			txBldr := auth.NewTxBuilderFromCLI(inBuf).WithTxEncoder(utils.GetTxEncoder(cdc))

			var solution = args[1]
			var solutionHash = sha256.Sum256([]byte(solution))
			var solutionHashString = hex.EncodeToString(solutionHash[:])

			reward, err := sdk.ParseCoins(args[2])
			if err != nil {
				return err
			}

			msg := types.NewMsgCreateScavenge(cliCtx.GetFromAddress(), args[0], solutionHashString, reward)
			err = msg.ValidateBasic()
			if err != nil {
				return err
			}

			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}

func GetCmdRevealSolution(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "reveal-solution [solution]",
		Short: "Reveals a solution for scavenge",
		Args:  cobra.ExactArgs(1), // Does your request require arguments
		RunE: func(cmd *cobra.Command, args []string) error {

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			inBuf := bufio.NewReader(cmd.InOrStdin())
			txBldr := auth.NewTxBuilderFromCLI(inBuf).WithTxEncoder(utils.GetTxEncoder(cdc))

			var solution = args[0]

			msg := types.NewMsgRevealSolution(cliCtx.GetFromAddress(), solution)
			err := msg.ValidateBasic()
			if err != nil {
				return err
			}

			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}
