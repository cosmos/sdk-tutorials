package app

import (
	_ "embed"
	"io"
	"os"
	"path/filepath"
	"time"

	dbm "github.com/cosmos/cosmos-db"

	"cosmossdk.io/core/appconfig"
	"cosmossdk.io/depinject"
	"cosmossdk.io/log"

	storetypes "cosmossdk.io/store/types"

	"github.com/cosmos/cosmos-sdk/baseapp"
	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/cosmos/cosmos-sdk/runtime"
	"github.com/cosmos/cosmos-sdk/server"
	"github.com/cosmos/cosmos-sdk/server/api"
	"github.com/cosmos/cosmos-sdk/server/config"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	authkeeper "github.com/cosmos/cosmos-sdk/x/auth/keeper"
	bankkeeper "github.com/cosmos/cosmos-sdk/x/bank/keeper"
	consensuskeeper "github.com/cosmos/cosmos-sdk/x/consensus/keeper"
	distrkeeper "github.com/cosmos/cosmos-sdk/x/distribution/keeper"
	"github.com/cosmos/cosmos-sdk/x/genutil"
	genutiltypes "github.com/cosmos/cosmos-sdk/x/genutil/types"
	stakingkeeper "github.com/cosmos/cosmos-sdk/x/staking/keeper"
	oracle_abci "github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle/abci"
	oraclekeeper "github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle/keeper"
	"github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle/mockprovider"

	_ "cosmossdk.io/api/cosmos/tx/config/v1"                                  // import for side-effects
	_ "github.com/cosmos/cosmos-sdk/x/auth"                                   // import for side-effects
	_ "github.com/cosmos/cosmos-sdk/x/auth/tx/config"                         // import for side-effects
	_ "github.com/cosmos/cosmos-sdk/x/bank"                                   // import for side-effects
	_ "github.com/cosmos/cosmos-sdk/x/consensus"                              // import for side-effects
	_ "github.com/cosmos/cosmos-sdk/x/distribution"                           // import for side-effects
	_ "github.com/cosmos/cosmos-sdk/x/mint"                                   // import for side-effects
	_ "github.com/cosmos/sdk-tutorials/tutorials/oracle/base/x/oracle/module" // import for side-effects
)

// DefaultNodeHome default home directories for the application daemon
var DefaultNodeHome string

//go:embed app.yaml
var AppConfigYAML []byte

var (
	_ runtime.AppI            = (*ExampleApp)(nil)
	_ servertypes.Application = (*ExampleApp)(nil)
)

// ExampleApp extends an ABCI application, but with most of its parameters exported.
// They are exported for convenience in creating helper functions, as object
// capabilities aren't needed for testing.
type ExampleApp struct {
	*runtime.App
	legacyAmino       *codec.LegacyAmino
	appCodec          codec.Codec
	txConfig          client.TxConfig
	interfaceRegistry codectypes.InterfaceRegistry

	// keepers
	AccountKeeper         authkeeper.AccountKeeper
	BankKeeper            bankkeeper.Keeper
	StakingKeeper         *stakingkeeper.Keeper
	DistrKeeper           distrkeeper.Keeper
	ConsensusParamsKeeper consensuskeeper.Keeper
	OracleKeeper          oraclekeeper.Keeper

	// simulation manager
	sm *module.SimulationManager
}

func init() {
	userHomeDir, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}

	DefaultNodeHome = filepath.Join(userHomeDir, ".exampled")
}

// AppConfig returns the default app config.
func AppConfig() depinject.Config {
	return depinject.Configs(
		appconfig.LoadYAML(AppConfigYAML),
		depinject.Supply(
			// supply custom module basics
			map[string]module.AppModuleBasic{
				genutiltypes.ModuleName: genutil.NewAppModuleBasic(genutiltypes.DefaultMessageValidator),
			},
		),
	)
}

// NewExampleApp returns a reference to an initialized ExampleApp.
func NewExampleApp(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	loadLatest bool,
	appOpts servertypes.AppOptions,
	baseAppOptions ...func(*baseapp.BaseApp),
) (*ExampleApp, error) {
	var (
		app        = &ExampleApp{}
		appBuilder *runtime.AppBuilder
	)

	if err := depinject.Inject(
		depinject.Configs(
			AppConfig(),
			depinject.Supply(
				logger,
				appOpts,
			),
		),
		&appBuilder,
		&app.appCodec,
		&app.legacyAmino,
		&app.txConfig,
		&app.interfaceRegistry,
		&app.AccountKeeper,
		&app.BankKeeper,
		&app.StakingKeeper,
		&app.DistrKeeper,
		&app.ConsensusParamsKeeper,
		&app.OracleKeeper,
	); err != nil {
		return nil, err
	}

	voteExtHandler := oracle_abci.NewVoteExtHandler(
		logger,
		time.Second,
		map[string]oracle_abci.Provider{
			"mock": mockprovider.NewMockProvider(),
		},
		map[string][]oraclekeeper.CurrencyPair{
			"mock": {
				{Base: "ATOM", Quote: "USD"},
				{Base: "OSMO", Quote: "USD"},
			},
		},
		app.OracleKeeper,
	)

	propHandler := oracle_abci.NewProposalHandler(
		logger,
		app.OracleKeeper,
		app.StakingKeeper,
	)

	baseAppOptions = append(baseAppOptions, func(ba *baseapp.BaseApp) {
		ba.SetExtendVoteHandler(voteExtHandler.ExtendVoteHandler())
		ba.SetVerifyVoteExtensionHandler(voteExtHandler.VerifyVoteExtensionHandler())
		ba.SetPrepareProposal(propHandler.PrepareProposal())
		ba.SetProcessProposal(propHandler.ProcessProposal())
		ba.SetPreBlocker(propHandler.PreBlocker)
	})

	app.App = appBuilder.Build(db, traceStore, baseAppOptions...)

	// register streaming services
	if err := app.RegisterStreamingServices(appOpts, app.kvStoreKeys()); err != nil {
		return nil, err
	}

	/****  Module Options ****/

	// create the simulation manager and define the order of the modules for deterministic simulations
	// NOTE: this is not required apps that don't use the simulator for fuzz testing transactions
	app.sm = module.NewSimulationManagerFromAppModules(app.ModuleManager.Modules, make(map[string]module.AppModuleSimulation, 0))
	app.sm.RegisterStoreDecoders()

	if err := app.Load(loadLatest); err != nil {
		return nil, err
	}

	return app, nil
}

// LegacyAmino returns ExampleApp's amino codec.
func (app *ExampleApp) LegacyAmino() *codec.LegacyAmino {
	return app.legacyAmino
}

// GetKey returns the KVStoreKey for the provided store key.
func (app *ExampleApp) GetKey(storeKey string) *storetypes.KVStoreKey {
	sk := app.UnsafeFindStoreKey(storeKey)
	kvStoreKey, ok := sk.(*storetypes.KVStoreKey)
	if !ok {
		return nil
	}
	return kvStoreKey
}

func (app *ExampleApp) kvStoreKeys() map[string]*storetypes.KVStoreKey {
	keys := make(map[string]*storetypes.KVStoreKey)
	for _, k := range app.GetStoreKeys() {
		if kv, ok := k.(*storetypes.KVStoreKey); ok {
			keys[kv.Name()] = kv
		}
	}

	return keys
}

// SimulationManager implements the SimulationApp interface
func (app *ExampleApp) SimulationManager() *module.SimulationManager {
	return app.sm
}

// RegisterAPIRoutes registers all application module routes with the provided
// API server.
func (app *ExampleApp) RegisterAPIRoutes(apiSvr *api.Server, apiConfig config.APIConfig) {
	app.App.RegisterAPIRoutes(apiSvr, apiConfig)
	// register swagger API in app.go so that other applications can override easily
	if err := server.RegisterSwaggerAPI(apiSvr.ClientCtx, apiSvr.Router, apiConfig.Swagger); err != nil {
		panic(err)
	}
}
