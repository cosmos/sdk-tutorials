package cli

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/codec"

	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// GetQueryCmd returns the cli query commands for this module
func GetQueryCmd(queryRoute string, cdc *codec.Codec) *cobra.Command {
	// Group scavenge queries under a subcommand
	scavengeQueryCmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      fmt.Sprintf("Querying commands for the %s module", types.ModuleName),
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	scavengeQueryCmd.AddCommand(
		flags.GetCommands(
			GetCmdListScavenges(queryRoute, cdc),
			GetCmdGetScavenge(queryRoute, cdc),
			GetCmdGetCommit(queryRoute, cdc),
		)...,
	)

	return scavengeQueryCmd

}

func GetCmdListScavenges(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "list",
		Short: "list",
		// Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)

			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/"+types.QueryListScavenges, queryRoute), nil)
			if err != nil {
				fmt.Printf("could not get scavenges\n%s\n", err.Error())
				return nil
			}

			var out types.QueryResScavenges
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}
func GetCmdGetScavenge(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "get [solutionHash]",
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
func GetCmdGetCommit(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "commited [solution] [scavenger]",
		Short: "Query a commit by solution and address of scavenger",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)

			var solution = args[0]
			var solutionHash = sha256.Sum256([]byte(solution))
			var solutionHashString = hex.EncodeToString(solutionHash[:])

			var scavenger = args[1]

			var solutionScavengerHash = sha256.Sum256([]byte(solution + scavenger))
			var solutionScavengerHashString = hex.EncodeToString(solutionScavengerHash[:])

			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/%s/%s", queryRoute, types.QueryCommit, solutionScavengerHashString), nil)
			if err != nil {
				fmt.Printf("could not resolve commit %s for scavenge %s \n%s\n", solutionScavengerHashString, solutionHashString, err.Error())
				return nil
			}

			var out types.Commit
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}
