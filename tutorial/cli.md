# Nameservice Module CLI

The Cosmos SDK uses the [`cobra`](https://github.com/spf13/cobra) library for CLI interactions. This library makes it easy for each module to expose its own commands. To get started defining the user's CLI interactions with your module, create the following files:

 - `./x/nameservice/client/cli/query.go`
 - `./x/nameservice/client/cli/tx.go`

Start in `query.go`. Here, define `cobra.Command`s for each of your modules `Queriers` (`resolve`, and `whois`):

```go
package cli

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/spf13/cobra"
)

// GetCmdResolveName queries information about a name
func GetCmdResolveName(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "resolve [name]",
		Short: "resolve name",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			name := args[0]

			res, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/resolve/%s", queryRoute, name), nil)
			if err != nil {
				fmt.Printf("could not resolve name - %s \n", string(name))
				return nil
			}

			fmt.Println(string(res))

			return nil
		},
	}
}

// GetCmdWhois queries information about a domain
func GetCmdWhois(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "whois [name]",
		Short: "Query whois info of name",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			name := args[0]

			res, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/whois/%s", queryRoute, name), nil)
			if err != nil {
				fmt.Printf("could not resolve whois - %s \n", string(name))
				return nil
			}

			fmt.Println(string(res))

			return nil
		},
	}
}
```

Notes on the above code:
- The CLI introduces a new `context`: [`CLIContext`](https://godoc.org/github.com/cosmos/cosmos-sdk/client/context#CLIContext). It carries data about user input and application configuration that are needed for CLI interactions.
- The `path` required for the `cliCtx.QueryWithData()` function maps directly to the names in your query router.
  * The first part of the path is used to differentiate the types of queries possible to SDK applications: `custom` is for `Queriers`.
  * The second piece (`nameservice`) is the name of the module to route the query to.
  * Finally there is the specific querier in the module that will be called.
  * In these examples the fourth piece is the query. This works because the query parameter is a simple string. To enable more complex query inputs you need to use the second argument of the [`.QueryWithData()`](https://godoc.org/github.com/cosmos/cosmos-sdk/client/context#CLIContext.QueryWithData) function to pass in `data`. For an example of this see the [queriers in the Staking module](https://github.com/cosmos/cosmos-sdk/blob/develop/x/stake/querier/queryable.go#L103).

Once the query interactions are defined, its time to move on to the transaction generation in `tx.go`:

> _*NOTE*_: Your application needs to import the code you just wrote. Here the import path is set to this repository (`github.com/cosmos/sdk-application-tutorial/x/nameservice`). If you are following along in your own repo you will need to change the import path to reflect that (`github.com/{{ .Username }}/{{ .Project.Repo }}/x/nameservice`).

```go
package cli

import (
	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/client/utils"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/sdk-application-tutorial/x/nameservice"

	sdk "github.com/cosmos/cosmos-sdk/types"
	authcmd "github.com/cosmos/cosmos-sdk/x/auth/client/cli"
	authtxb "github.com/cosmos/cosmos-sdk/x/auth/client/txbuilder"
)

// GetCmdBuyName is the CLI command for sending a BuyName transaction
func GetCmdBuyName(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "buy-name [name] [amount]",
		Short: "bid for existing name or claim new name",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().
				WithCodec(cdc).
				WithAccountDecoder(authcmd.GetAccountDecoder(cdc))

			txBldr := authtxb.NewTxBuilderFromCLI().WithCodec(cdc)

			if err := cliCtx.EnsureAccountExists(); err != nil {
				return err
			}

			coins, err := sdk.ParseCoins(args[1])
			if err != nil {
				return err
			}

			account, err := cliCtx.GetFromAddress()
			if err != nil {
				return err
			}

			msg := nameservice.NewMsgBuyName(args[0], coins, account)
			err = msg.ValidateBasic()
			if err != nil {
				return err
			}

			cliCtx.PrintResponse = true

			return utils.CompleteAndBroadcastTxCli(txBldr, cliCtx, []sdk.Msg{msg})
		},
	}
}

// GetCmdSetName is the CLI command for sending a SetName transaction
func GetCmdSetName(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "set-name [name] [value]",
		Short: "set the value associated with a name that you own",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().
				WithCodec(cdc).
				WithAccountDecoder(authcmd.GetAccountDecoder(cdc))

			txBldr := authtxb.NewTxBuilderFromCLI().WithCodec(cdc)

			if err := cliCtx.EnsureAccountExists(); err != nil {
				return err
			}

			account, err := cliCtx.GetFromAddress()
			if err != nil {
				return err
			}

			msg := nameservice.NewMsgSetName(args[0], args[1], account)
			err = msg.ValidateBasic()
			if err != nil {
				return err
			}

			cliCtx.PrintResponse = true

			return utils.CompleteAndBroadcastTxCli(txBldr, cliCtx, []sdk.Msg{msg})
		},
	}
}
```

Notes on the above code:
- The `authcmd` package is used here. [The godocs have more information on usage](https://godoc.org/github.com/cosmos/cosmos-sdk/x/auth/client/cli#GetAccountDecoder). It provides access to accounts controlled by the CLI and facilitates signing.

### Now your module has everything it needs to be [incorporated into your Cosmos SDK application](./app-complete.md)!
