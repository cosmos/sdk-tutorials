# CLI
A Command Line Interface (CLI) will help us interact with our app once it is running on a machine somewhere. Each Module has it's own namespace within the CLI that gives it the ability to create and sign Messages destined to be handled by that module. It also comes with the ability to query the state of that module. When combined with the rest of the app, the CLI will let you do things like generate keys for a new account or check the status of an interaction you already had with the application.

The CLI for our module is broken into two files called `tx.go` and `query.go` which are located in `./x/scavenge/client/cli/`. One file is for making transactions that contain messages which will ultimately update our state. The other is for making queries which will give us the ability to read information from our state. Both files utilize the [Cobra](https://github.com/spf13/cobra) library.

## tx.go
The `tx.go` file contains `GetTxCmd` which is a standard method within the Cosmos SDK. It is referenced later in the `module.go` file which describes exactly which attributes a modules has. This makes it easier to incorporate different modules for different reasons at the level of the actual application. After all, we are focusing on a module at this point, but later we will create an application that utilizes this module as well as other modules which are already available within the Cosmos SDK.

Inside `GetTxCmd` we create a new module-specific command and call is `scavenge`. Within this command we add a sub-command for each Message type we've defined: 
* `GetCmdCreateScavenge`
* `GetCmdCommitSolution`
* `GetCmdRevealSolution`


Each function takes parameters from the **Cobra** CLI tool to create a new msg, sign it and submit it to the application to be processed. These functions should go into the `tx.go` file and look as follows:
```go
package cli

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/x/auth"
	"github.com/cosmos/cosmos-sdk/x/auth/client/utils"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
)

// GetTxCmd returns the transaction commands for this module
func GetTxCmd(cdc *codec.Codec) *cobra.Command {
	scavengeTxCmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      fmt.Sprintf("%s transactions subcommands", types.ModuleName),
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	scavengeTxCmd.AddCommand(client.PostCommands(
		GetCmdCreateScavenge(cdc),
		GetCmdCommitSolution(cdc),
		GetCmdRevealSolution(cdc),
	)...)

	return scavengeTxCmd
}

func GetCmdCreateScavenge(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "createScavenge [reward] [solution] [description]",
		Short: "Creates a new scavenge with a reward",
		Args:  cobra.ExactArgs(3), // Does your request require arguments
		RunE: func(cmd *cobra.Command, args []string) error {

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			txBldr := auth.NewTxBuilderFromCLI().WithTxEncoder(utils.GetTxEncoder(cdc))

			reward, err := sdk.ParseCoins(args[0])
			if err != nil {
				return err
			}

			var solution = args[1]
			var solutionHash = sha256.Sum256([]byte(solution))
			var solutionHashString = hex.EncodeToString(solutionHash[:])

			msg := types.NewMsgCreateScavenge(cliCtx.GetFromAddress(), args[2], solutionHashString, reward)
			err = msg.ValidateBasic()
			if err != nil {
				return err
			}

			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}

func GetCmdCommitSolution(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "commitSolution [solution]",
		Short: "Commits a solution for scavenge",
		Args:  cobra.ExactArgs(1), // Does your request require arguments
		RunE: func(cmd *cobra.Command, args []string) error {

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			txBldr := auth.NewTxBuilderFromCLI().WithTxEncoder(utils.GetTxEncoder(cdc))

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
			fmt.Println("ready:")
			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}

func GetCmdRevealSolution(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "revealSolution [solution]",
		Short: "Reveals a solution for scavenge",
		Args:  cobra.ExactArgs(1), // Does your request require arguments
		RunE: func(cmd *cobra.Command, args []string) error {

			cliCtx := context.NewCLIContext().WithCodec(cdc)
			txBldr := auth.NewTxBuilderFromCLI().WithTxEncoder(utils.GetTxEncoder(cdc))

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
```

### sha256
Note that this file makes use of the `sha256` library for hashing our plain text solutions into the scrambled hashes. This activity takes place on the client side so the solutions are never leaked to any public entity which might want to sneak a peak and steal the bounty reward associated with the scavenges. You can also notice that the hashes are converted into hexadecimal representation to make them easy to read as strings (which is how they are ultimately stored in the keeper).

## query.go
The `query.go` file contains similar **Cobra** commands that reserve a new name space for referencing our `scavenge` module. Instead of creating and submitting messages however, the `query.go` file creates queries and returns the results in human readable form. The queries it handles are the same we defined in our `querier.go` file earlier:
* `GetCmdListScavenges`
* `GetCmdGetScavenge`
* `GetCmdGetCommit`


After defining these commands, your `query.go` file should look like:
```go
package cli

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/context"
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
		client.GetCommands(
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
```

Notice that this file also makes use of the `sha256` library for converting plain text into hexadecimal hash strings.

While these are all the major moving pieces of a module (`Message`, `Handler`, `Keeper`, `Querier` and `Client`) there are some organizational tasks which we have yet to complete. The next step will be making sure that our module is completely configured in order to make it usable within any application.

Let's do that together [here](./09-module.md).