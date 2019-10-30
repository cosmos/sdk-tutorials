---
order: 24
---

# App

We will be putting the app together now. To make it easier there is an app starter located located in the helpers folder in the root of the module.

We will need to add the module we created. For this application we will be using a couple modules:

1. Auth - this gives us an account based module for the blockchain
2. Supply - this tracks the total supply of tokens on the blockchain
3. Bank - enables transfers between accounts
4. Staking - creates delegated proof of stake for the chain
5. Distribution - handle distribution of tokens for fees and block rewards
6. Params - parameters of the application, they can also be changed through governance, which we are not using in this tutorial
7. NFT - bring non-fungible tokens to your application
8. Auction - this is the module you created

## App Breakdown

```go
var (
	// default home directories for the application CLI
	DefaultCLIHome = os.ExpandEnv("$HOME/.auctionapp")

	// default home directories for the application daemon
	DefaultNodeHome = os.ExpandEnv("$HOME/.auctionapp")

	// The module BasicManager is in charge of setting up basic,
	// non-dependant module elements, such as codec registration
	// and genesis verification.
	ModuleBasics = module.NewBasicManager(
		auth.AppModuleBasic{},
		supply.AppModuleBasic{},
		genutil.AppModuleBasic{},
		bank.AppModuleBasic{},
		staking.AppModuleBasic{},
		distr.AppModuleBasic{},
		params.AppModuleBasic{},
		nft.AppModuleBasic{},
	)

	// module account permissions
	maccPerms = map[string][]string{
		auth.FeeCollectorName:     nil,
		distr.ModuleName:          nil,
		staking.BondedPoolName:    {supply.Burner, supply.Staking},
		staking.NotBondedPoolName: {supply.Burner, supply.Staking},
	}
)
```

Next we want to register all the modules codecs in order for transactions and queries to be encoded and decoded.

```go
// custom tx codec
func MakeCodec() *codec.Codec {
	var cdc = codec.New()
	ModuleBasics.RegisterCodec(cdc)
	sdk.RegisterCodec(cdc)
	codec.RegisterCrypto(cdc)
	return cdc
}
```

Next we will be creating the app type:

```go
// AuctionApp extends an ABCI application, but with most of its parameters exported.
// They are exported for convenience in creating helper functions, as object
// capabilities aren't needed for testing.
type App struct {
	*bam.BaseApp // https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp

	cdc *codec.Codec

	invCheckPeriod uint

	// keys to access the substores
	keys  map[string]*sdk.KVStoreKey
	tkeys map[string]*sdk.TransientStoreKey

	// keepers of the modules being used.
	AccountKeeper  auth.AccountKeeper
	BankKeeper     bank.Keeper
	SupplyKeeper   supply.Keeper
	StakingKeeper  staking.Keeper
	SlashingKeeper slashing.Keeper
	DistrKeeper    distr.Keeper
	ParamsKeeper   params.Keeper
	NFTKeeper      nft.Keeper

	// the module manager
	mm *module.Manager

	// simulation manager, this will not be implmented in this tutorial, as of now.
	sm *module.SimulationManager
}
```

```go
// NewSimApp returns a reference to an initialized SimApp.
func NewAuctionApp(
	logger log.Logger, db dbm.DB, traceStore io.Writer, loadLatest bool,
	invCheckPeriod uint, baseAppOptions ...func(*bam.BaseApp),
) *AuctionApp {
	cdc := MakeCodec()
```

```go
	// create a new baseapp to be used in the app
	bApp := bam.NewBaseApp(appName, logger, db, auth.DefaultTxDecoder(cdc), baseAppOptions...)
	bApp.SetCommitMultiStoreTracer(traceStore)
	bApp.SetAppVersion(version.Version)

	// set all the used keys
	keys := sdk.NewKVStoreKeys()
	tkeys := sdk.NewTransientStoreKeys(params.TStoreKey)

	// set you app to a variable
	app := &App()
```

Define the parameter keeper and module parameters.
Define the keepers of your application

```go

	// init params keeper and subspaces
	app.ParamsKeeper = params.NewKeeper(app.cdc, keys[params.StoreKey], tkeys[params.TStoreKey], params.DefaultCodespace)
	authSubspace := app.ParamsKeeper.Subspace(auth.DefaultParamspace)
	bankSubspace := app.ParamsKeeper.Subspace(bank.DefaultParamspace)
	stakingSubspace := app.ParamsKeeper.Subspace(staking.DefaultParamspace)
	distrSubspace := app.ParamsKeeper.Subspace(distr.DefaultParamspace)
	slashingSubspace := app.ParamsKeeper.Subspace(slashing.DefaultParamspace)

	// add keepers
	app.AccountKeeper = auth.NewAccountKeeper(app.cdc, keys[auth.StoreKey], authSubspace, auth.ProtoBaseAccount)
	app.BankKeeper = bank.NewBaseKeeper(app.AccountKeeper, bankSubspace, bank.DefaultCodespace, app.ModuleAccountAddrs())
	app.SupplyKeeper = supply.NewKeeper(app.cdc, keys[supply.StoreKey], app.AccountKeeper, app.BankKeeper, maccPerms)
	stakingKeeper := staking.NewKeeper(app.cdc, keys[staking.StoreKey],
		app.SupplyKeeper, stakingSubspace, staking.DefaultCodespace)
	app.DistrKeeper = distr.NewKeeper(app.cdc, keys[distr.StoreKey], distrSubspace, &stakingKeeper,
		app.SupplyKeeper, distr.DefaultCodespace, auth.FeeCollectorName, app.ModuleAccountAddrs())
	app.SlashingKeeper = slashing.NewKeeper(app.cdc, keys[slashing.StoreKey], &stakingKeeper,
		slashingSubspace, slashing.DefaultCodespace)
	app.NFTKeeper = nft.NewKeeper(app.cdc, keys[nft.StoreKey])

	// register the staking hooks
	// NOTE: stakingKeeper above is passed by reference, so that it will contain these hooks
	app.StakingKeeper = *stakingKeeper.SetHooks(
		staking.NewMultiStakingHooks(app.DistrKeeper.Hooks(), app.SlashingKeeper.Hooks()),
	)
```

```go
	// NOTE: Any module instantiated in the module manager that is later modified
	// must be passed by reference here.
	app.mm = module.NewManager(
		genutil.NewAppModule(app.AccountKeeper, app.StakingKeeper, app.BaseApp.DeliverTx),
		auth.NewAppModule(app.AccountKeeper),
		bank.NewAppModule(app.BankKeeper, app.AccountKeeper),
		supply.NewAppModule(app.SupplyKeeper, app.AccountKeeper),
		distr.NewAppModule(app.DistrKeeper, app.SupplyKeeper),
		slashing.NewAppModule(app.SlashingKeeper, app.StakingKeeper),
		staking.NewAppModule(app.StakingKeeper, app.AccountKeeper, app.SupplyKeeper),
		nft.NewAppModule(app.NFTKeeper),
	)

	// During begin block slashing happens after distr.BeginBlocker so that
	// there is nothing left over in the validator fee pool, so as to keep the
	// CanWithdrawInvariant invariant.
	app.mm.SetOrderBeginBlockers(distr.ModuleName, slashing.ModuleName)

	app.mm.SetOrderEndBlockers(staking.ModuleName)

	// NOTE: The genutils moodule must occur after staking so that pools are
	// properly initialized with tokens from genesis accounts.
	app.mm.SetOrderInitGenesis(
		auth.ModuleName, distr.ModuleName, staking.ModuleName,
		bank.ModuleName, slashing.ModuleName,
		supply.ModuleName, nft.ModuleName,
		genutil.ModuleName,
	)

	app.mm.RegisterRoutes(app.Router(), app.QueryRouter())

	// create the simulation manager and define the order of the modules for deterministic simulations
	//
	// NOTE: this is not required apps that don't use the simulator for fuzz testing
	// transactions
	app.sm = module.NewSimulationManager(
		auth.NewAppModule(app.AccountKeeper),
		bank.NewAppModule(app.BankKeeper, app.AccountKeeper),
		supply.NewAppModule(app.SupplyKeeper, app.AccountKeeper),
		distr.NewAppModule(app.DistrKeeper, app.SupplyKeeper),
		staking.NewAppModule(app.StakingKeeper, app.AccountKeeper, app.SupplyKeeper),
		slashing.NewAppModule(app.SlashingKeeper, app.StakingKeeper),
		nft.NewAppModule(app.NFTKeeper),
	)

	app.sm.RegisterStoreDecoders()

	// initialize stores
	app.MountKVStores(keys)
	app.MountTransientStores(tkeys)

	// initialize BaseApp
	app.SetInitChainer(app.InitChainer)
	app.SetBeginBlocker(app.BeginBlocker)
	app.SetAnteHandler(auth.NewAnteHandler(app.AccountKeeper, app.SupplyKeeper, auth.DefaultSigVerificationGasConsumer))
	app.SetEndBlocker(app.EndBlocker)

	if loadLatest {
		err := app.LoadLatestVersion(app.keys[bam.MainStoreKey])
		if err != nil {
			cmn.Exit(err.Error())
		}
	}
	return app
}
```

Below we will define helper functions for the app:

- BeginBlock is code that will be executed at the start of every bloc
- EndBlock is code that will be executed at the end of every block
- InitChainer update the state at chain initialization
- LoadHeight loads a particular height
- ModuleAccountAddrs returns all the app's module account addresses.
- Codec returns auctionApp's codec

```go
// application updates every begin block
func (app *AuctionApp) BeginBlocker(ctx sdk.Context, req abci.RequestBeginBlock) abci.ResponseBeginBlock {
	return app.mm.BeginBlock(ctx, req)
}

// application updates every end block
func (app *AuctionApp) EndBlocker(ctx sdk.Context, req abci.RequestEndBlock) abci.ResponseEndBlock {
	return app.mm.EndBlock(ctx, req)
}

// application update at chain initialization
func (app *AuctionApp) InitChainer(ctx sdk.Context, req abci.RequestInitChain) abci.ResponseInitChain {
	var genesisState simapp.GenesisState
	app.cdc.MustUnmarshalJSON(req.AppStateBytes, &genesisState)
	return app.mm.InitGenesis(ctx, genesisState)
}

// load a particular height
func (app *AuctionApp) LoadHeight(height int64) error {
	return app.LoadVersion(height, app.keys[bam.MainStoreKey])
}

func (app *AuctionApp) ModuleAccountAddrs() map[string]bool {
	modAccAddrs := make(map[string]bool)
	for acc := range maccPerms {
		modAccAddrs[supply.NewModuleAddress(acc).String()] = true
	}

	return modAccAddrs
}

// Codec returns auctionApp's codec
func (app *AuctionApp) Codec() *codec.Codec {
	return app.cdc
}

// GetKey returns the KVStoreKey for the provided store key
func (app *AuctionApp) GetKey(storeKey string) *sdk.KVStoreKey {
	return app.keys[storeKey]
}

// GetTKey returns the TransientStoreKey for the provided store key
func (app *AuctionApp) GetTKey(storeKey string) *sdk.TransientStoreKey {
	return app.tkeys[storeKey]
}

// GetMaccPerms returns a copy of the module account permissions
func GetMaccPerms() map[string][]string {
	dupMaccPerms := make(map[string][]string)
	for k, v := range maccPerms {
		dupMaccPerms[k] = v
	}
	return dupMaccPerms
}
```
