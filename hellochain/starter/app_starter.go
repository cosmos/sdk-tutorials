package starter

import (
	"encoding/json"
	"io"
	"os"

	abci "github.com/tendermint/tendermint/abci/types"
	"github.com/tendermint/tendermint/libs/log"
	tmos "github.com/tendermint/tendermint/libs/os"
	pvm "github.com/tendermint/tendermint/privval"
	tmtypes "github.com/tendermint/tendermint/types"

	dbm "github.com/tendermint/tm-db"

	bam "github.com/cosmos/cosmos-sdk/baseapp"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/server"
	"github.com/cosmos/cosmos-sdk/simapp"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	"github.com/cosmos/cosmos-sdk/x/auth"
	"github.com/cosmos/cosmos-sdk/x/bank"
	"github.com/cosmos/cosmos-sdk/x/genutil"
	"github.com/cosmos/cosmos-sdk/x/params"
	"github.com/cosmos/cosmos-sdk/x/supply"
)

// nolint
var (
	ModuleBasics    module.BasicManager
	Cdc             *codec.Codec
	DefaultCLIHome  = os.ExpandEnv("$HOME/.hellocli")
	DefaultNodeHome = os.ExpandEnv("$HOME/.hellod")
	maccPerms       = map[string][]string{
		auth.FeeCollectorName: nil,
	}
)

//AppStarter is a drop in to make simple hello world blockchains

func init() {
	ModuleBasics = module.NewBasicManager(
		auth.AppModuleBasic{},
		bank.AppModuleBasic{},
		params.AppModuleBasic{},
		supply.AppModuleBasic{},
	)
}

var _ simapp.App = (*AppStarter)(nil)

// AppStarter is a basic app
type AppStarter struct {
	*bam.BaseApp // AppStarter extends BaseApp

	// keys to access the substores
	keys  map[string]*sdk.KVStoreKey
	tkeys map[string]*sdk.TransientStoreKey

	// subspaces
	subspaces map[string]params.Subspace

	// Keepers
	accountKeeper auth.AccountKeeper
	bankKeeper    bank.Keeper
	supplyKeeper  supply.Keeper
	paramsKeeper  params.Keeper
	Cdc           *codec.Codec

	// Module Manager
	Mm *module.Manager

	// simulation manager
	sm *module.SimulationManager
}

// AppStarter implements abci.Application
var _ abci.Application = AppStarter{}

// MakeCodec registers the structs for encoding in amino
func MakeCodec() *codec.Codec {
	cdc := codec.New()
	ModuleBasics.RegisterCodec(cdc)
	sdk.RegisterCodec(cdc)
	codec.RegisterCrypto(cdc)
	Cdc = cdc
	return cdc
}

// InitChainer is called by Tendermint to start the chain.
func (app *AppStarter) InitChainer(ctx sdk.Context, req abci.RequestInitChain) abci.ResponseInitChain {
	config := server.NewDefaultContext().Config
	config.SetRoot(DefaultNodeHome)

	server.UpgradeOldPrivValFile(config)

	_, _, err := genutil.InitializeNodeValidatorFiles(config)
	if err != nil {
		panic(err)
	}

	/*
		---------------------NOTICE-----------------------
		vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

		The code below is a hack to override the
		functionality of tendermint. It is done here like
		this so that you can focus on building fun custom
		modules instead of all the necessary plumbing
		required when building a production-ready app with
		proof-of-stake. Don't worry about it now but
		PLEASE NOTE that this is NOT BEST PRACTICE!

		vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
		---------------------------------------------------
	*/
	privValidator := pvm.LoadOrGenFilePV(
		config.PrivValidatorKeyFile(), config.PrivValidatorStateFile())
	valPubKey := tmtypes.TM2PB.PubKey(privValidator.GetPubKey())

	update := abci.ValidatorUpdate{
		PubKey: valPubKey,
		Power:  100}

	var genesisState GenesisState

	err = app.Cdc.UnmarshalJSON(req.AppStateBytes, &genesisState)
	if err != nil {
		panic(err)
	}

	genesis := app.Mm.InitGenesis(ctx, genesisState)
	genesis.Validators = append(genesis.Validators, update)
	return genesis
}

// BeginBlocker runs before each block is committed.
func (app *AppStarter) BeginBlocker(ctx sdk.Context, req abci.RequestBeginBlock) abci.ResponseBeginBlock {
	return app.Mm.BeginBlock(ctx, req)
}

// EndBlocker runs after each block is committed.
func (app *AppStarter) EndBlocker(ctx sdk.Context, req abci.RequestEndBlock) abci.ResponseEndBlock {
	return app.Mm.EndBlock(ctx, req)
}

// LoadHeight loads the state at a given block height
func (app *AppStarter) LoadHeight(height int64) error {
	return app.LoadVersion(height, app.keys[bam.MainStoreKey])
}

// ExportAppStateAndValidators returns the Genesis and AppState for the apps modules
func (app *AppStarter) ExportAppStateAndValidators(forZeroHeight bool, jailWhiteList []string,
) (appState json.RawMessage, validators []tmtypes.GenesisValidator, err error) {

	ctx := app.NewContext(true, abci.Header{Height: app.LastBlockHeight()})

	genState := app.Mm.ExportGenesis(ctx)
	appState, err = codec.MarshalJSONIndent(app.Cdc, genState)
	if err != nil {
		return nil, nil, err
	}

	return appState, validators, nil
}

// BuildModuleBasics adds more moduleBasics to the app
func BuildModuleBasics(moduleBasics ...module.AppModuleBasic) {

	for _, mb := range moduleBasics {
		ModuleBasics[mb.Name()] = mb
	}
	Cdc = MakeCodec()
}

// NewAppStarter created a basic app with bank, auth, supply and any other ModuleBasics passed to it
func NewAppStarter(appName string, logger log.Logger, db dbm.DB, moduleBasics ...module.AppModuleBasic) *AppStarter {

	BuildModuleBasics(moduleBasics...)

	Cdc = MakeCodec()

	bApp := bam.NewBaseApp(appName, logger, db, auth.DefaultTxDecoder(Cdc))

	keys := sdk.NewKVStoreKeys(bam.MainStoreKey, auth.StoreKey,
		supply.StoreKey, params.StoreKey)

	tkeys := sdk.NewTransientStoreKeys(params.TStoreKey)

	var app = &AppStarter{
		BaseApp:   bApp,
		Cdc:       Cdc,
		keys:      keys,
		tkeys:     tkeys,
		subspaces: make(map[string]params.Subspace),
	}

	app.paramsKeeper = params.NewKeeper(app.Cdc, keys[params.StoreKey], tkeys[params.TStoreKey])
	app.subspaces[auth.ModuleName] = app.paramsKeeper.Subspace(auth.DefaultParamspace)
	app.subspaces[bank.ModuleName] = app.paramsKeeper.Subspace(bank.DefaultParamspace)

	app.accountKeeper = auth.NewAccountKeeper(
		app.Cdc,
		keys[auth.StoreKey],
		app.subspaces[auth.ModuleName],
		auth.ProtoBaseAccount,
	)

	// The BankKeeper allows you perform sdk.Coins interactions
	app.bankKeeper = bank.NewBaseKeeper(
		app.accountKeeper,
		app.subspaces[bank.ModuleName],
		app.ModuleAccountAddrs(),
	)

	// The SupplyKeeper collects transaction fees and renders them to the fee distribution module
	app.supplyKeeper = supply.NewKeeper(
		app.Cdc,
		keys[supply.StoreKey],
		app.accountKeeper,
		app.bankKeeper,
		maccPerms,
	)

	app.Mm = module.NewManager(
		auth.NewAppModule(app.accountKeeper),
		bank.NewAppModule(app.bankKeeper, app.accountKeeper),
	)
	return app
}

// GenesisState holds the genesis state data for every module
type GenesisState map[string]json.RawMessage

// NewDefaultGenesisState populates a GenesisState with each module's default
func NewDefaultGenesisState() GenesisState {
	return ModuleBasics.DefaultGenesis()
}

// ModuleAccountAddrs returns all the app's module account addresses.
func (app *AppStarter) ModuleAccountAddrs() map[string]bool {
	modAccAddrs := make(map[string]bool)
	for acc := range maccPerms {
		modAccAddrs[supply.NewModuleAddress(acc).String()] = true
	}

	return modAccAddrs
}

// InitializeStarter configures the app. NOTE ModuleBasics must be complete before calling this
func (app *AppStarter) InitializeStarter() {

	app.Mm.SetOrderInitGenesis(
		auth.ModuleName,
		bank.ModuleName,
	)

	app.Mm.RegisterRoutes(app.Router(), app.QueryRouter())

	app.SetInitChainer(app.InitChainer)
	app.SetBeginBlocker(app.BeginBlocker)
	app.SetEndBlocker(app.EndBlocker)
	app.SetAnteHandler(
		auth.NewAnteHandler(
			app.accountKeeper,
			app.supplyKeeper,
			auth.DefaultSigVerificationGasConsumer,
		),
	)

	// initialize stores
	app.MountKVStores(app.keys)
	app.MountTransientStores(app.tkeys)

	err := app.LoadLatestVersion(app.keys[bam.MainStoreKey])
	if err != nil {
		tmos.Exit(err.Error())
	}
}

// Codec returns simapp's codec
func (app *AppStarter) Codec() *codec.Codec {
	return app.Cdc
}

// SimulationManager implements the SimulationApp interface
func (app *AppStarter) SimulationManager() *module.SimulationManager {
	return app.sm
}

// NewAppCreator wraps and returns a function for instantiaing an app
func NewAppCreator(creator func(log.Logger, dbm.DB) abci.Application) server.AppCreator {
	return func(logger log.Logger, db dbm.DB, traceStore io.Writer) abci.Application {
		app := creator(logger, db)
		return app
	}
}

// NewAppExporter wraps and returns a function for exporting application state
func NewAppExporter(creator func(log.Logger, dbm.DB) abci.Application) server.AppExporter {
	return func(logger log.Logger, db dbm.DB, traceStore io.Writer, height int64,
		forZeroHeight bool, jailWhiteList []string) (json.RawMessage, []tmtypes.GenesisValidator, error) {
		return nil, nil, nil
	}
}
