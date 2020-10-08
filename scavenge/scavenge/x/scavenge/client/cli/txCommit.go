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

func GetCmdCommitSolution(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "commit-solution [solution]",
		Short: "Commits a solution for scavenge",
		Args:  cobra.ExactArgs(1), // Does your request require arguments
		RunE: func(cmd *cobra.Command, args []string) error {

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			inBuf := bufio.NewReader(cmd.InOrStdin())
			txBldr := auth.NewTxBuilderFromCLI(inBuf).WithTxEncoder(utils.GetTxEncoder(cdc))

			var solution = args[0]
			var solutionHash = sha256.Sum256([]byte(solution))
			var solutionHashString = hex.EncodeToString(solutionHash[:])

			var scavenger = cliCtx.GetFromAddress().String()

			var solutionScavengerHash = sha256.Sum256([]byte(solution + scavenger))
			var solutionScavengerHashString = hex.EncodeToString(solutionScavengerHash[:])

			msg := types.NewMsgCommitSolution(cliCtx.GetFromAddress(), solutionHashString, solutionScavengerHashString)
			err := msg.ValidateBasic()
			if err != nil {
				return err
			}
			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}
