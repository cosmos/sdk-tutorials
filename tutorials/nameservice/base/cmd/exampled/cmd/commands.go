package cmd

import (
	"errors"
	"io"
	"os"

	"cosmossdk.io/log"
	confixcmd "cosmossdk.io/tools/confix/cmd"
	tmcfg "github.com/cometbft/cometbft/config"
	dbm "github.com/cosmos/cosmos-db"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/debug"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/keys"
	"github.com/cosmos/cosmos-sdk/client/pruning"
	"github.com/cosmos/cosmos-sdk/client/rpc"
	"github.com/cosmos/cosmos-sdk/client/snapshot"
	"github.com/cosmos/cosmos-sdk/server"
	serverconfig "github.com/cosmos/cosmos-sdk/server/config"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	authcmd "github.com/cosmos/cosmos-sdk/x/auth/client/cli"
	"github.com/cosmos/cosmos-sdk/x/crisis"
	genutilcli "github.com/cosmos/cosmos-sdk/x/genutil/client/cli"
	"github.com/spf13/cast"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/app"
	auction "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction"
	auctionmod "github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction/module"
	"github.com/cosmos/sdk-tutorials/tutorials/nameservice/base/x/auction/testutils"
)

func initTendermintConfig() *tmcfg.Config {
	cfg := tmcfg.DefaultConfig()

	return cfg
}

func initAppConfig() (string, interface{}) {
	type CustomAppConfig struct {
		serverconfig.Config
	}

	srvCfg := serverconfig.DefaultConfig()
	srvCfg.StateSync.SnapshotInterval = 1000
	srvCfg.StateSync.SnapshotKeepRecent = 10

	customAppConfig := CustomAppConfig{
		Config: *srvCfg,
	}

	defaultAppTemplate := serverconfig.DefaultConfigTemplate

	return defaultAppTemplate, customAppConfig
}

func initRootCmd(rootCmd *cobra.Command, encodingConfig testutils.EncodingConfig, basicManager module.BasicManager, defaultNodeHome string) {
	cfg := sdk.GetConfig()
	cfg.Seal()

	rootCmd.AddCommand(
		genutilcli.InitCmd(basicManager, defaultNodeHome),
		debug.Cmd(),
		confixcmd.ConfigCommand(),
		pruning.Cmd(newApp, defaultNodeHome),
		snapshot.Cmd(newApp),
	)

	server.AddCommands(rootCmd, app.DefaultNodeHome, newApp, appExport, addModuleInitFlags)

	rootCmd.AddCommand(
		server.StatusCommand(),
		genesisCommand(encodingConfig, app.DefaultNodeHome, basicManager),
		queryCommand(),
		txCommand(),
		keys.Commands(),
	)
}

func addModuleInitFlags(startCmd *cobra.Command) {
	crisis.AddModuleInitFlags(startCmd)
	startCmd.Flags().String(auction.FlagValKey, "", "Name of Validator Key to Sign Txs")
	startCmd.Flags().String(auction.FlagRunProvider, "false", "Run the transaction provider logic")
}

func genesisCommand(encodingConfig testutils.EncodingConfig, defaultNodeHome string, basicManager module.BasicManager, cmds ...*cobra.Command) *cobra.Command {
	cmd := genutilcli.Commands(encodingConfig.TxConfig, basicManager, defaultNodeHome)

	for _, subCmd := range cmds {
		cmd.AddCommand(subCmd)
	}
	return cmd
}

func queryCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        "query",
		Aliases:                    []string{"q"},
		Short:                      "Querying subcommands",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	cmd.AddCommand(
		rpc.QueryEventForTxCmd(),
		server.QueryBlockCmd(),
		authcmd.QueryTxsByEventsCmd(),
		server.QueryBlocksCmd(),
		authcmd.QueryTxCmd(),
		server.QueryBlockResultsCmd(),
		auctionmod.QueryWhoisCmd(),
	)

	return cmd
}

func txCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        "tx",
		Short:                      "Transactions subcommands",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	cmd.AddCommand(
		authcmd.GetSignCommand(),
		authcmd.GetSignBatchCommand(),
		authcmd.GetMultiSignCommand(),
		authcmd.GetMultiSignBatchCmd(),
		authcmd.GetValidateSignaturesCommand(),
		authcmd.GetBroadcastCommand(),
		authcmd.GetEncodeCommand(),
		authcmd.GetDecodeCommand(),
		authcmd.GetSimulateCmd(),
		auctionmod.ReserveCmd(),
	)

	return cmd
}

func newApp(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	appOpts servertypes.AppOptions,
) servertypes.Application {
	baseappOptions := server.DefaultBaseappOptions(appOpts)

	skipUpgradeHeights := make(map[int64]bool)
	for _, h := range cast.ToIntSlice(appOpts.Get(server.FlagUnsafeSkipUpgrades)) {
		skipUpgradeHeights[int64(h)] = true
	}

	valKey, ok := appOpts.Get(auction.FlagValKey).(string)
	if !ok {
		valKey = "val"
	}

	return app.NewExampleApp(
		logger,
		db,
		traceStore,
		true,
		skipUpgradeHeights,
		valKey,
		appOpts,
		baseappOptions...,
	)
}

func appExport(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	height int64,
	forZeroHeight bool,
	jailAllowedAddrs []string,
	appOpts servertypes.AppOptions,
	modulesToExport []string,
) (servertypes.ExportedApp, error) {
	var exportApp *app.ExampleApp

	valKey, ok := appOpts.Get(auction.FlagValKey).(string)
	if !ok {
		return servertypes.ExportedApp{}, errors.New("validator key not set")
	}

	homePath, ok := appOpts.Get(flags.FlagHome).(string)
	if !ok || homePath == "" {
		return servertypes.ExportedApp{}, errors.New("application home not set")
	}

	viperAppOpts, ok := appOpts.(*viper.Viper)
	if !ok {
		return servertypes.ExportedApp{}, errors.New("appOpts is not viper.Viper")
	}
	viperAppOpts.Set(server.FlagInvCheckPeriod, 1)
	appOpts = viperAppOpts

	var loadLatest bool
	if height == -1 {
		loadLatest = true
	}

	exportApp = app.NewExampleApp(
		logger,
		db,
		traceStore,
		loadLatest,
		map[int64]bool{},
		valKey,
		appOpts,
	)

	if height != -1 {
		if err := exportApp.LoadHeight(height); err != nil {
			return servertypes.ExportedApp{}, err
		}
	}

	return exportApp.ExportAppStateAndValidators(forZeroHeight, jailAllowedAddrs, modulesToExport)
}

var tempDir = func() string {
	dir, err := os.MkdirTemp("", "tutorial")
	if err != nil {
		dir = app.DefaultNodeHome
	}
	defer os.RemoveAll(dir)

	return dir
}
