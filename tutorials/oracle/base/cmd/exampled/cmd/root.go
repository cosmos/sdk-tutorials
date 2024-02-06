package cmd

import (
	"os"
	"time"

	"cosmossdk.io/client/v2/autocli"
	clientv2keyring "cosmossdk.io/client/v2/autocli/keyring"
	"cosmossdk.io/core/address"
	"cosmossdk.io/depinject"
	"cosmossdk.io/log"
	cmtcfg "github.com/cometbft/cometbft/config"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/config"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/cosmos/cosmos-sdk/crypto/keyring"
	"github.com/cosmos/cosmos-sdk/server"
	serverconfig "github.com/cosmos/cosmos-sdk/server/config"
	"github.com/cosmos/cosmos-sdk/types/module"
	"github.com/cosmos/cosmos-sdk/types/tx/signing"
	"github.com/cosmos/cosmos-sdk/x/auth/tx"
	txmodule "github.com/cosmos/cosmos-sdk/x/auth/tx/config"
	"github.com/cosmos/cosmos-sdk/x/auth/types"
	"github.com/spf13/cobra"

	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/app"
)

// NewRootCmd creates a new root command for exampled. It is called once in the
// main function.
func NewRootCmd() *cobra.Command {
	var (
		//  It can be used to set options like the signer, fee granularity, and other transaction-related configurations.
		txConfigOpts tx.ConfigOptions
		// It can include options for modules, address codecs, and other CLI-related configurations.
		autoCliOpts autocli.AppOptions
		// This includes things like genesis data, default genesis data, verifying genesis data, and the module's name.
		moduleBasicManager module.BasicManager
		// This can include things like the client's home directory, the client's input/output, and the client's trust node.
		clientCtx client.Context
	)

	if err := depinject.Inject(
		depinject.Configs(app.AppConfig(),
			depinject.Supply(
				log.NewNopLogger(),
			),
			depinject.Provide(
				ProvideClientContext,
				ProvideKeyring,
			),
		),
		&txConfigOpts,
		&autoCliOpts,
		&moduleBasicManager,
		&clientCtx,
	); err != nil {
		panic(err)
	}

	rootCmd := &cobra.Command{
		Use:   "exampled",
		Short: "exampled - the example chain app",
		PersistentPreRunE: func(cmd *cobra.Command, _ []string) error {
			// set the default command outputs
			cmd.SetOut(cmd.OutOrStdout())
			cmd.SetErr(cmd.ErrOrStderr())

			clientCtx = clientCtx.WithCmdContext(cmd.Context())
			clientCtx, err := client.ReadPersistentCommandFlags(clientCtx, cmd.Flags())
			if err != nil {
				return err
			}

			clientCtx, err = config.ReadFromClientConfig(clientCtx)
			if err != nil {
				return err
			}

			// sign mode textual is only available in online mode
			if !clientCtx.Offline {
				// This needs to go after ReadFromClientConfig, as that function ets the RPC client needed for SIGN_MODE_TEXTUAL.
				txConfigOpts.EnabledSignModes = append(txConfigOpts.EnabledSignModes, signing.SignMode_SIGN_MODE_TEXTUAL)
				txConfigOpts.TextualCoinMetadataQueryFn = txmodule.NewGRPCCoinMetadataQueryFn(clientCtx)
				txConfigWithTextual, err := tx.NewTxConfigWithOptions(codec.NewProtoCodec(clientCtx.InterfaceRegistry), txConfigOpts)
				if err != nil {
					return err
				}

				clientCtx = clientCtx.WithTxConfig(txConfigWithTextual)
			}

			if err := client.SetCmdClientContextHandler(clientCtx, cmd); err != nil {
				return err
			}

			if err := client.SetCmdClientContextHandler(clientCtx, cmd); err != nil {
				return err
			}

			// overwrite the minimum gas price from the app configuration
			srvCfg := serverconfig.DefaultConfig()
			srvCfg.MinGasPrices = "0example"

			// overwrite the block timeout
			cmtCfg := cmtcfg.DefaultConfig()
			cmtCfg.Consensus.TimeoutCommit = 3 * time.Second
			cmtCfg.LogLevel = "*:error,p2p:info,state:info" // better default logging

			// TODO: copy from nameservice/simapp
			return server.InterceptConfigsPreRunHandler(cmd, "", srvCfg, cmtCfg)
		},
	}

	initRootCmd(rootCmd, clientCtx.TxConfig, moduleBasicManager)

	if err := autoCliOpts.EnhanceRootCommand(rootCmd); err != nil {
		panic(err)
	}

	return rootCmd
}

func ProvideClientContext(
	appCodec codec.Codec,
	interfaceRegistry codectypes.InterfaceRegistry,
	txConfig client.TxConfig,
	legacyAmino *codec.LegacyAmino,
) client.Context {
	clientCtx := client.Context{}.
		WithCodec(appCodec).
		WithInterfaceRegistry(interfaceRegistry).
		WithTxConfig(txConfig).
		WithLegacyAmino(legacyAmino).
		WithInput(os.Stdin).
		WithAccountRetriever(types.AccountRetriever{}).
		WithHomeDir(app.DefaultNodeHome).
		WithViper("TUTORIAL") // env variable prefix

	// Read the config again to overwrite the default values with the values from the config file
	clientCtx, _ = config.ReadFromClientConfig(clientCtx)

	return clientCtx
}

func ProvideKeyring(clientCtx client.Context, addressCodec address.Codec) (clientv2keyring.Keyring, error) {
	kb, err := client.NewKeyringFromBackend(clientCtx, clientCtx.Keyring.Backend())
	if err != nil {
		return nil, err
	}

	return keyring.NewAutoCLIKeyring(kb)
}
