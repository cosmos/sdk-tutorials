package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/server"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/tendermint/tendermint/libs/cli"
	"github.com/tendermint/tendermint/libs/common"
	"github.com/tendermint/tendermint/libs/log"
	"github.com/tendermint/tendermint/p2p"

	gaiaInit "github.com/cosmos/cosmos-sdk/cmd/gaia/init"
	app "github.com/cosmos/sdk-application-tutorial"
	abci "github.com/tendermint/tendermint/abci/types"
	dbm "github.com/tendermint/tendermint/libs/db"
	tmtypes "github.com/tendermint/tendermint/types"
)

// DefaultNodeHome sets the folder where the applcation data and configuration will be stored
var DefaultNodeHome = os.ExpandEnv("$HOME/.nameserviced")

func main() {
	cobra.EnableCommandSorting = false

	cdc := app.MakeCodec()
	ctx := server.NewDefaultContext()

	rootCmd := &cobra.Command{
		Use:               "nameserviced",
		Short:             "nameservice App Daemon (server)",
		PersistentPreRunE: server.PersistentPreRunEFn(ctx),
	}

	rootCmd.AddCommand(InitCmd(ctx, cdc))
	rootCmd.AddCommand(gaiaInit.AddGenesisAccountCmd(ctx, cdc))
	rootCmd.AddCommand(gaiaInit.GenTxCmd(ctx, cdc))
	rootCmd.AddCommand(gaiaInit.CollectGenTxsCmd(ctx, cdc))

	server.AddCommands(ctx, cdc, rootCmd, newApp, exportAppStateAndTMValidators)

	// prepare and add flags
	executor := cli.PrepareBaseCmd(rootCmd, "NS", DefaultNodeHome)
	err := executor.Execute()
	if err != nil {
		// handle with #870
		panic(err)
	}
}

func newApp(logger log.Logger, db dbm.DB, traceStore io.Writer) abci.Application {
	return app.NewnameserviceApp(logger, db)
}

func exportAppStateAndTMValidators(logger log.Logger, db dbm.DB, _ io.Writer, _ int64, _ bool) (
	json.RawMessage, []tmtypes.GenesisValidator, error) {
	dapp := app.NewnameserviceApp(logger, db)
	return dapp.ExportAppStateAndValidators()
}

// get cmd to initialize all files for tendermint and application
// nolint: errcheck
func InitCmd(ctx *server.Context, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "init",
		Short: "Initialize genesis config, priv-validator file, and p2p-node file",
		Args:  cobra.NoArgs,
		RunE: func(_ *cobra.Command, _ []string) error {

			config := ctx.Config
			config.SetRoot(viper.GetString(cli.HomeFlag))
			chainID := viper.GetString(client.FlagChainID)
			if chainID == "" {
				chainID = fmt.Sprintf("test-chain-%v", common.RandStr(6))
			}

			nodeKey, err := p2p.LoadOrGenNodeKey(config.NodeKeyFile())
			if err != nil {
				return err
			}
			nodeID := string(nodeKey.ID())

			pk := gaiaInit.ReadOrCreatePrivValidator(config.PrivValidatorFile())
			genTx, appMessage, validator, err := server.SimpleAppGenTx(cdc, pk)
			if err != nil {
				return err
			}

			appState, err := server.SimpleAppGenState(cdc, tmtypes.GenesisDoc{}, []json.RawMessage{genTx})
			if err != nil {
				return err
			}

			appStateJSON, err := cdc.MarshalJSON(appState)
			if err != nil {
				return err
			}

			toPrint := struct {
				ChainID    string          `json:"chain_id"`
				NodeID     string          `json:"node_id"`
				AppMessage json.RawMessage `json:"app_message"`
			}{
				chainID,
				nodeID,
				appMessage,
			}
			out, err := codec.MarshalJSONIndent(cdc, toPrint)
			if err != nil {
				return err
			}
			fmt.Fprintf(os.Stderr, "%s\n", string(out))
			return gaiaInit.ExportGenesisFile(config.GenesisFile(), chainID, []tmtypes.GenesisValidator{validator}, appStateJSON)
		},
	}
}
