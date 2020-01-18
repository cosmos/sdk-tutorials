package starter

import (
	"os"
	"path"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"

	"github.com/cosmos/cosmos-sdk/client/keys"
	"github.com/cosmos/cosmos-sdk/client/rpc"
	"github.com/cosmos/cosmos-sdk/server"
	"github.com/cosmos/cosmos-sdk/x/genaccounts"
	genaccscli "github.com/cosmos/cosmos-sdk/x/genaccounts/client/cli"
	"github.com/cosmos/cosmos-sdk/x/staking"
	amino "github.com/tendermint/go-amino"
	"github.com/tendermint/tendermint/libs/cli"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/lcd"
	sdk "github.com/cosmos/cosmos-sdk/types"
	authcmd "github.com/cosmos/cosmos-sdk/x/auth/client/cli"
	bankcmd "github.com/cosmos/cosmos-sdk/x/bank/client/cli"
	genutilcli "github.com/cosmos/cosmos-sdk/x/genutil/client/cli"
)

// NewCLICommand returns a basic root CLI cmd to interact with a running SDK chain.
func NewCLICommand() *cobra.Command {

	cobra.EnableCommandSorting = false

	config := sdk.GetConfig()
	config.SetBech32PrefixForAccount(sdk.Bech32PrefixAccAddr, sdk.Bech32PrefixAccPub)
	config.SetBech32PrefixForValidator(sdk.Bech32PrefixValAddr, sdk.Bech32PrefixValPub)
	config.SetBech32PrefixForConsensusNode(sdk.Bech32PrefixConsAddr, sdk.Bech32PrefixConsPub)
	config.Seal()

	rootCmd := &cobra.Command{
		Use:   "hccli",
		Short: "hellochain Client",
	}

	rootCmd.PersistentFlags().String(client.FlagChainID, "", "Chain ID of tendermint node")

	// Add --chain-id to persistent flags and mark it required
	rootCmd.PersistentPreRunE = func(_ *cobra.Command, _ []string) error {
		return initConfig(rootCmd)
	}

	// Construct Root Command
	rootCmd.AddCommand(
		rpc.StatusCommand(),
		client.ConfigCmd(DefaultCLIHome),
		client.LineBreak,
		lcd.ServeCommand(Cdc, registerRoutes),
		client.LineBreak,
		keys.Commands(),
		client.LineBreak,
	)
	return rootCmd

}

func registerRoutes(rs *lcd.RestServer) {
	client.RegisterRoutes(rs.CliCtx, rs.Mux)
	ModuleBasics.RegisterRESTRoutes(rs.CliCtx, rs.Mux)
}

// QueryCmd builds a basic collection of query commands for your SDK CLI tool.
func QueryCmd(cdc *amino.Codec) *cobra.Command {
	queryCmd := &cobra.Command{
		Use:     "query",
		Aliases: []string{"q"},
		Short:   "Querying subcommands",
	}

	queryCmd.AddCommand(
		rpc.ValidatorCommand(cdc),
		rpc.BlockCommand(),
		client.LineBreak,
		authcmd.GetAccountCmd(cdc),
		authcmd.QueryTxCmd(cdc),
		authcmd.QueryTxsByEventsCmd(cdc),
	)

	return queryCmd
}

// TxCmd builds a basic collection of transaction commands.
func TxCmd(cdc *amino.Codec) *cobra.Command {
	txCmd := &cobra.Command{
		Use:   "tx",
		Short: "Transactions subcommands",
	}

	txCmd.AddCommand(
		bankcmd.SendTxCmd(cdc),
		client.LineBreak,
		authcmd.GetSignCommand(cdc),
		authcmd.GetMultiSignCommand(cdc),
		client.LineBreak,
		authcmd.GetBroadcastCommand(cdc),
		authcmd.GetEncodeCommand(cdc),
		client.LineBreak,
	)

	return txCmd
}

func initConfig(cmd *cobra.Command) error {
	home, err := cmd.PersistentFlags().GetString(cli.HomeFlag)
	if err != nil {
		return err
	}

	cfgFile := path.Join(home, "config", "config.toml")
	if _, err := os.Stat(cfgFile); err == nil {
		viper.SetConfigFile(cfgFile)

		if err := viper.ReadInConfig(); err != nil {
			return err
		}
	}
	if err := viper.BindPFlag(client.FlagChainID, cmd.PersistentFlags().Lookup(client.FlagChainID)); err != nil {
		return err
	}
	if err := viper.BindPFlag(cli.EncodingFlag, cmd.PersistentFlags().Lookup(cli.EncodingFlag)); err != nil {
		return err
	}
	return viper.BindPFlag(cli.OutputFlag, cmd.PersistentFlags().Lookup(cli.OutputFlag))
}

// ServerCommandParams described the params needed to build a basic server CLI command.
type ServerCommandParams struct {
	CmdName     string             // name of the CLI command
	CmdDesc     string             // short description of its function
	AppCreator  server.AppCreator  // method for constructing an ABCI application
	AppExporter server.AppExporter // method for exporting the chain state of an ABCI application
}

// NewServerCommandParams collects the params for a server command
func NewServerCommandParams(name string, desc string, creator server.AppCreator,
	exporter server.AppExporter) ServerCommandParams {
	return ServerCommandParams{name, desc, creator, exporter}
}

// NewServerCommand creates a new ServerCommandParams object
func NewServerCommand(params ServerCommandParams) *cobra.Command {

	cobra.EnableCommandSorting = false

	config := sdk.GetConfig()
	config.SetBech32PrefixForAccount(sdk.Bech32PrefixAccAddr, sdk.Bech32PrefixAccPub)
	config.SetBech32PrefixForValidator(sdk.Bech32PrefixValAddr, sdk.Bech32PrefixValPub)
	config.SetBech32PrefixForConsensusNode(sdk.Bech32PrefixConsAddr, sdk.Bech32PrefixConsPub)
	config.Seal()

	ctx := server.NewDefaultContext()

	cdc := MakeCodec()

	rootCmd := &cobra.Command{
		Use:               params.CmdName,
		Short:             params.CmdDesc,
		PersistentPreRunE: server.PersistentPreRunEFn(ctx),
	}

	rootCmd.AddCommand(
		genutilcli.InitCmd(ctx, cdc, ModuleBasics, DefaultNodeHome),
		genutilcli.CollectGenTxsCmd(ctx, cdc, genaccounts.AppModuleBasic{}, DefaultNodeHome),
		genutilcli.GenTxCmd(ctx, cdc, ModuleBasics, staking.AppModuleBasic{},
			genaccounts.AppModuleBasic{}, DefaultNodeHome, DefaultCLIHome),
		genutilcli.ValidateGenesisCmd(ctx, cdc, ModuleBasics),
		genaccscli.AddGenesisAccountCmd(ctx, cdc, DefaultNodeHome, DefaultCLIHome),
	)

	server.AddCommands(ctx, cdc, rootCmd, params.AppCreator, params.AppExporter)
	return rootCmd
}
