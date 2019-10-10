package main

import (
	"encoding/json"

	"fmt"
	"io"
	"reflect"

	//"strings"

	"github.com/cosmos/cosmos-sdk/server"
	"github.com/cosmos/cosmos-sdk/x/genaccounts"
	genaccscli "github.com/cosmos/cosmos-sdk/x/genaccounts/client/cli"
	"github.com/cosmos/cosmos-sdk/x/staking"
	amino "github.com/tendermint/go-amino"

	"github.com/spf13/cobra"
	"github.com/tendermint/tendermint/libs/cli"
	"github.com/tendermint/tendermint/libs/log"
	typescriptify "github.com/tkrajina/typescriptify-golang-structs/typescriptify"

	sdk "github.com/cosmos/cosmos-sdk/types"
	genutilcli "github.com/cosmos/cosmos-sdk/x/genutil/client/cli"
	app "github.com/cosmos/sdk-application-tutorial"
	abci "github.com/tendermint/tendermint/abci/types"
	tmtypes "github.com/tendermint/tendermint/types"
	dbm "github.com/tendermint/tm-db"
)

func main() {
	cobra.EnableCommandSorting = false

	cdc := app.MakeCodec()

	config := sdk.GetConfig()
	config.SetBech32PrefixForAccount(sdk.Bech32PrefixAccAddr, sdk.Bech32PrefixAccPub)
	config.SetBech32PrefixForValidator(sdk.Bech32PrefixValAddr, sdk.Bech32PrefixValPub)
	config.SetBech32PrefixForConsensusNode(sdk.Bech32PrefixConsAddr, sdk.Bech32PrefixConsPub)
	config.Seal()

	ctx := server.NewDefaultContext()

	rootCmd := &cobra.Command{
		Use:               "nsd",
		Short:             "nameservice App Daemon (server)",
		PersistentPreRunE: server.PersistentPreRunEFn(ctx),
	}
	// CLI commands to initialize the chain
	rootCmd.AddCommand(
		dumpSchema(cdc),
		genutilcli.InitCmd(ctx, cdc, app.ModuleBasics, app.DefaultNodeHome),
		genutilcli.CollectGenTxsCmd(ctx, cdc, genaccounts.AppModuleBasic{}, app.DefaultNodeHome),
		genutilcli.GenTxCmd(
			ctx, cdc, app.ModuleBasics, staking.AppModuleBasic{},
			genaccounts.AppModuleBasic{}, app.DefaultNodeHome, app.DefaultCLIHome,
		),
		genutilcli.ValidateGenesisCmd(ctx, cdc, app.ModuleBasics),
		// AddGenesisAccountCmd allows users to add accounts to the genesis file
		genaccscli.AddGenesisAccountCmd(ctx, cdc, app.DefaultNodeHome, app.DefaultCLIHome),
	)

	server.AddCommands(ctx, cdc, rootCmd, newApp, exportAppStateAndTMValidators)

	// prepare and add flags
	executor := cli.PrepareBaseCmd(rootCmd, "NS", app.DefaultNodeHome)
	err := executor.Execute()
	if err != nil {
		panic(err)
	}
}

func newApp(logger log.Logger, db dbm.DB, traceStore io.Writer) abci.Application {
	return app.NewNameServiceApp(logger, db)
}

func inspectSchema(obj interface{}) {

	typ := reflect.TypeOf(obj)
	kind := typ.Kind()

	n := reflect.New(typ)
	val := reflect.ValueOf(n)

	fmt.Printf("typ***************************\n%v\n\n", typ)
	fmt.Printf("kind***************************\n%v\n\n", kind)
	fmt.Printf("val***************************\n%v\n\n", val)
	fmt.Printf("\n\n\n")

}

func dumpSchema(cdc *amino.Codec) *cobra.Command {
	converter := typescriptify.New()
	dumpSchemaCmd := &cobra.Command{
		Use:   "schema",
		Short: "dump schema from the amino codec",
		Run: func(cmd *cobra.Command, args []string) {
			types := cdc.TypeInfosByName()
			defer func() {
				if err := recover(); err != nil {
					fmt.Println("capturedd Panic")
					fmt.Println(err)
				}
			}()
			for _, v := range types {

				intr := reflect.New(v.Type).Elem().Interface()
				inspectSchema(intr)

				typ := reflect.TypeOf(intr)
				//v := reflect.ValueOf(intr)
				//n := reflect.New(typ)
				//v := reflect.ValueOf(n)

				switch typ.Kind() {

				case reflect.Struct, reflect.Array:
					converter.Add(intr)

				default:
					fmt.Printf("skipping %v", typ.Kind())

				}
			}

			err := converter.ConvertToFile("schemaTest.ts")
			if err != nil {
				panic(err)
			}
		},
	}
	return dumpSchemaCmd
}

func exportAppStateAndTMValidators(
	logger log.Logger, db dbm.DB, traceStore io.Writer, height int64, forZeroHeight bool, jailWhiteList []string,
) (json.RawMessage, []tmtypes.GenesisValidator, error) {

	if height != -1 {
		nsApp := app.NewNameServiceApp(logger, db)
		err := nsApp.LoadHeight(height)
		if err != nil {
			return nil, nil, err
		}
		return nsApp.ExportAppStateAndValidators(forZeroHeight, jailWhiteList)
	}

	nsApp := app.NewNameServiceApp(logger, db)

	return nsApp.ExportAppStateAndValidators(forZeroHeight, jailWhiteList)
}
