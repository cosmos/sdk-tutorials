# Entrypoint

golang 的规范是把编译成可执行程序的文件放在项目的`./cmd`文件夹中。对于你的应用程序，您要创建 2 个可执行程序：

- `nsd` : 此可执行程序类似于`bitcoind`或其他加密货币的 daemon，因为它维护 p2p 连接，广播交易，处理本地存储并提供用以与网络交互的 RPC 接口。在这种情况下，Tendermint 被用于网络层和排序交易。
- `nscli` : 此可执行程序提供用户与你的应用程序交互的命令。

首先请在项目目录中创建两个将会被实例化成这可执行程序的文件：

- `./cmd/nsd/main.go`
- `./cmd/nscli/main.go`

## `nsd`

首先将如下代码加进`nsd/main.go` :

> 注意：你的应用程序需要导入你刚编写的代码。这里导入路径设置为此存储库（`github.com/cosmos/sdk-application-tutorial/nameservice`）。如果您是在自己的仓库中进行的前面的操作，则需要更改导入路径（github.com/{.Username}/{.Project.Repo}）。

```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/server"
	"github.com/cosmos/cosmos-sdk/x/auth"
	"github.com/cosmos/cosmos-sdk/x/bank"
	"github.com/cosmos/cosmos-sdk/x/bank"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"github.com/tendermint/tendermint/crypto"
	"github.com/tendermint/tendermint/libs/cli"
	"github.com/tendermint/tendermint/libs/common"
	"github.com/tendermint/tendermint/libs/log"

	gaiaInit "github.com/cosmos/cosmos-sdk/cmd/gaia/init"
	sdk "github.com/cosmos/cosmos-sdk/types"
	app "github.com/cosmos/sdk-tutorials/nameservice"
	abci "github.com/tendermint/tendermint/abci/types"
	cfg "github.com/tendermint/tendermint/config"
	dbm "github.com/tendermint/tm-db"
	tmtypes "github.com/tendermint/tendermint/types"
)

// DefaultNodeHome sets the folder where the application data and configuration will be stored
var DefaultNodeHome = os.ExpandEnv("$HOME/.nsd")

const (
	flagOverwrite = "overwrite"
)

func main() {
	cobra.EnableCommandSorting = false

	cdc := app.MakeCodec()
	ctx := server.NewDefaultContext()

	rootCmd := &cobra.Command{
		Use:               "nsd",
		Short:             "nameservice App Daemon (server)",
		PersistentPreRunE: server.PersistentPreRunEFn(ctx),
	}

	rootCmd.AddCommand(InitCmd(ctx, cdc))
	rootCmd.AddCommand(AddGenesisAccountCmd(ctx, cdc))
	server.AddCommands(ctx, cdc, rootCmd, newApp, appExporter())

	// prepare and add flags
	executor := cli.PrepareBaseCmd(rootCmd, "NS", DefaultNodeHome)
	err := executor.Execute()
	if err != nil {
		// handle with #870
		panic(err)
	}
}

func newApp(logger log.Logger, db dbm.DB, traceStore io.Writer) abci.Application {
	return app.NewNameServiceApp(logger, db)
}

func appExporter() server.AppExporter {
	return func(logger log.Logger, db dbm.DB, _ io.Writer, _ int64, _ bool, _ []string) (
		json.RawMessage, []tmtypes.GenesisValidator, error) {
		dapp := app.NewNameServiceApp(logger, db)
		return dapp.ExportAppStateAndValidators()
	}
}

// InitCmd initializes all files for tendermint and application
func InitCmd(ctx *server.Context, cdc *codec.Codec) *cobra.Command {
	cmd := &cobra.Command{
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

			_, pk, err := gaiaInit.InitializeNodeValidatorFiles(config)
			if err != nil {
				return err
			}

			var appState json.RawMessage
			genFile := config.GenesisFile()

			if !viper.GetBool(flagOverwrite) && common.FileExists(genFile) {
				return fmt.Errorf("genesis.json file already exists: %v", genFile)
			}

			genesis := app.GenesisState{
				AuthData: auth.DefaultGenesisState(),
				BankData: bank.DefaultGenesisState(),
			}

			appState, err = codec.MarshalJSONIndent(cdc, genesis)
			if err != nil {
				return err
			}

			_, _, validator, err := SimpleAppGenTx(cdc, pk)
			if err != nil {
				return err
			}

			if err = gaiaInit.ExportGenesisFile(genFile, chainID, []tmtypes.GenesisValidator{validator}, appState); err != nil {
				return err
			}

			cfg.WriteConfigFile(filepath.Join(config.RootDir, "config", "config.toml"), config)

			fmt.Printf("Initialized nsd configuration and bootstrapping files in %s...\n", viper.GetString(cli.HomeFlag))
			return nil
		},
	}

	cmd.Flags().String(cli.HomeFlag, DefaultNodeHome, "node's home directory")
	cmd.Flags().String(client.FlagChainID, "", "genesis file chain-id, if left blank will be randomly created")
	cmd.Flags().BoolP(flagOverwrite, "o", false, "overwrite the genesis.json file")

	return cmd
}

// AddGenesisAccountCmd allows users to add accounts to the genesis file
func AddGenesisAccountCmd(ctx *server.Context, cdc *codec.Codec) *cobra.Command {
	cmd := &cobra.Command{
		Use:   "add-genesis-account [address] [coins[,coins]]",
		Short: "Adds an account to the genesis file",
		Args:  cobra.ExactArgs(2),
		Long: strings.TrimSpace(`
Adds accounts to the genesis file so that you can start a chain with coins in the CLI:

$ nsd add-genesis-account cosmos1tse7r2fadvlrrgau3pa0ss7cqh55wrv6y9alwh 1000STAKE,1000nametoken
`),
		RunE: func(_ *cobra.Command, args []string) error {
			addr, err := sdk.AccAddressFromBech32(args[0])
			if err != nil {
				return err
			}
			coins, err := sdk.ParseCoins(args[1])
			if err != nil {
				return err
			}
			coins.Sort()

			var genDoc tmtypes.GenesisDoc
			config := ctx.Config
			genFile := config.GenesisFile()
			if !common.FileExists(genFile) {
				return fmt.Errorf("%s does not exist, run `gaiad init` first", genFile)
			}
			genContents, err := ioutil.ReadFile(genFile)
			if err != nil {
			}

			if err = cdc.UnmarshalJSON(genContents, &genDoc); err != nil {
				return err
			}

			var appState app.GenesisState
			if err = cdc.UnmarshalJSON(genDoc.AppState, &appState); err != nil {
				return err
			}

			for _, stateAcc := range appState.Accounts {
				if stateAcc.Address.Equals(addr) {
					return fmt.Errorf("the application state already contains account %v", addr)
				}
			}

			acc := auth.NewBaseAccountWithAddress(addr)
			acc.Coins = coins
			appState.Accounts = append(appState.Accounts, &acc)
			appStateJSON, err := cdc.MarshalJSON(appState)
			if err != nil {
				return err
			}

			return gaiaInit.ExportGenesisFile(genFile, genDoc.ChainID, genDoc.Validators, appStateJSON)
		},
	}
	return cmd
}

// SimpleAppGenTx returns a simple GenTx command that makes the node a valdiator from the start
func SimpleAppGenTx(cdc *codec.Codec, pk crypto.PubKey) (
	appGenTx, cliPrint json.RawMessage, validator tmtypes.GenesisValidator, err error) {

	addr, secret, err := server.GenerateCoinKey()
	if err != nil {
		return
	}

	bz, err := cdc.MarshalJSON(struct {
		Addr sdk.AccAddress `json:"addr"`
	}{addr})
	if err != nil {
		return
	}

	appGenTx = json.RawMessage(bz)

	bz, err = cdc.MarshalJSON(map[string]string{"secret": secret})
	if err != nil {
		return
	}

	cliPrint = json.RawMessage(bz)

	validator = tmtypes.GenesisValidator{
		PubKey: pk,
		Power:  10,
	}

	return
}
```

注意上述代码中：

- 上面的大部分代码都结合了来自以下包的 CLI 命令：
  1. Tendermint
  2. Cosmos-SDK
  3. 你的 nameservice 模块
- `InitCmd`允许应用程序从配置中生成创世纪状态。深入了解函数调用，以了解有关区块链初始化过程的更多信息。
- `AddGenesisAccountCmd`可以方便地将帐户添加到创世文件中，允许在区块链启动时就使用资产钱包。

## nscli

通过构建 nscli 命令完成：

> 注意：你的应用程序需要导入你刚编写的代码。这里导入路径设置为此存储库（`github.com/cosmos/sdk-application-tutorial/nameservice`）。如果您是在自己的仓库中进行的前面的操作，则需要更改导入路径（github.com/{.Username}/{.Project.Repo}）。

```go
package main

import (
	"os"
	"path"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/keys"
	"github.com/cosmos/cosmos-sdk/client/lcd"
	"github.com/cosmos/cosmos-sdk/client/rpc"
	"github.com/cosmos/cosmos-sdk/client/tx"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	amino "github.com/tendermint/go-amino"
	"github.com/tendermint/tendermint/libs/cli"

	sdk "github.com/cosmos/cosmos-sdk/types"
	authcmd "github.com/cosmos/cosmos-sdk/x/auth/client/cli"
	auth "github.com/cosmos/cosmos-sdk/x/auth/client/rest"
	bankcmd "github.com/cosmos/cosmos-sdk/x/bank/client/cli"
	bank "github.com/cosmos/cosmos-sdk/x/bank/client/rest"
	app "github.com/cosmos/sdk-tutorials/nameservice"
	nsclient "github.com/cosmos/sdk-tutorials/nameservice/x/nameservice/client"
	nsrest "github.com/cosmos/sdk-tutorials/nameservice/x/nameservice/client/rest"
)

var defaultCLIHome = os.ExpandEnv("$HOME/.nscli")

func main() {
	cobra.EnableCommandSorting = false

	cdc := app.MakeCodec()

	// Read in the configuration file for the sdk
	config := sdk.GetConfig()
	config.SetBech32PrefixForAccount(sdk.Bech32PrefixAccAddr, sdk.Bech32PrefixAccPub)
	config.SetBech32PrefixForValidator(sdk.Bech32PrefixValAddr, sdk.Bech32PrefixValPub)
	config.SetBech32PrefixForConsensusNode(sdk.Bech32PrefixConsAddr, sdk.Bech32PrefixConsPub)
	config.Seal()

	mc := []sdk.ModuleClients{
		nsclient.NewModuleClient(storeNS, cdc),
	}

	rootCmd := &cobra.Command{
		Use:   "nscli",
		Short: "nameservice Client",
	}

	// Add --chain-id to persistent flags and mark it required
	rootCmd.PersistentFlags().String(client.FlagChainID, "", "Chain ID of tendermint node")
	rootCmd.PersistentPreRunE = func(_ *cobra.Command, _ []string) error {
		return initConfig(rootCmd)
	}

	// Construct Root Command
	rootCmd.AddCommand(
		rpc.StatusCommand(),
		client.ConfigCmd(defaultCLIHome),
		queryCmd(cdc, mc),
		txCmd(cdc, mc),
		client.LineBreak,
		lcd.ServeCommand(cdc, registerRoutes),
		client.LineBreak,
		keys.Commands(),
		client.LineBreak,

	)

	executor := cli.PrepareMainCmd(rootCmd, "NS", defaultCLIHome)
	err := executor.Execute()
	if err != nil {
		panic(err)
	}
}

func registerRoutes(rs *lcd.RestServer) {
	rs.CliCtx = rs.CliCtx.WithAccountDecoder(rs.Cdc)
	rpc.RegisterRoutes(rs.CliCtx, rs.Mux)
	tx.RegisterRoutes(rs.CliCtx, rs.Mux, rs.Cdc)
	auth.RegisterRoutes(rs.CliCtx, rs.Mux, rs.Cdc, storeAcc)
	bank.RegisterRoutes(rs.CliCtx, rs.Mux, rs.Cdc, rs.KeyBase)
	nsrest.RegisterRoutes(rs.CliCtx, rs.Mux, rs.Cdc, storeNS)
}

func queryCmd(cdc *amino.Codec, mc []sdk.ModuleClients) *cobra.Command {
	queryCmd := &cobra.Command{
		Use:     "query",
		Aliases: []string{"q"},
		Short:   "Querying subcommands",
	}

	queryCmd.AddCommand(
		rpc.ValidatorCommand(cdc),
		rpc.BlockCommand(),
		tx.SearchTxCmd(cdc),
		tx.QueryTxCmd(cdc),
		client.LineBreak,
		authcmd.GetAccountCmd(storeAcc, cdc),
	)

	for _, m := range mc {
		queryCmd.AddCommand(m.GetQueryCmd())
	}

	return queryCmd
}

func txCmd(cdc *amino.Codec, mc []sdk.ModuleClients) *cobra.Command {
	txCmd := &cobra.Command{
		Use:   "tx",
		Short: "Transactions subcommands",
	}

	txCmd.AddCommand(
		bankcmd.SendTxCmd(cdc),
		client.LineBreak,
		authcmd.GetSignCommand(cdc),
		tx.GetBroadcastCommand(cdc),
		client.LineBreak,
	)

	for _, m := range mc {
		txCmd.AddCommand(m.GetTxCmd())
	}

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
```

注意：

- 代码结合了来自以下包的 CLI 命令：Tendermint、Cosmos-SDK、你的 nameservice 模块。
- [`cobra` CLI 文档](https://github.com/spf13/cobra)将有助于理解上述代码。
- 你可以在这里看到之前定义的`ModuleClient`。
- 注意如何将路由包含在`registerRoutes`函数中

### 现在你已经定义了二进制文件，那么就可以来处理[依赖关系管理并构建应用程序](./14-dep.md)！
