## App.go

To create your application start a new file: `./app.go`. To get started, add the dependencies you will need:

> _*NOTE*_: Your application needs to import the code you just wrote. Here the import path is set to this repository (`github.com/cosmos/sdk-application-tutorial/x/nameservice`). If you are following along in your own repo you will need to change the import path to reflect that (`github.com/{{ .Username }}/{{ .Project.Repo }}/x/nameservice`).

```go
package app

import (
	"github.com/tendermint/tendermint/libs/log"

	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/x/auth"
	"github.com/cosmos/cosmos-sdk/x/bank"
	"github.com/cosmos/sdk-application-tutorial/x/nameservice"

	bam "github.com/cosmos/cosmos-sdk/baseapp"
	sdk "github.com/cosmos/cosmos-sdk/types"
	abci "github.com/tendermint/tendermint/abci/types"
	cmn "github.com/tendermint/tendermint/libs/common"
	dbm "github.com/tendermint/tendermint/libs/db"
)
```

Here we imported some dependencies from Tendermint, from the Cosmos SDK, and then the three modules we will use in your app: `auth`, `bank`, and `nameservice`.

Links to godocs for each module and package imported:
- [`codec`](https://godoc.org/github.com/cosmos/cosmos-sdk/codec): Functions for working with amino
- [`auth`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/auth)
- [`bank`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/bank)
- [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk): This module helps developers bootstrap Cosmos SDK applications. It implements the [Tendermint ABCI](https://github.com/tendermint/tendermint/tree/master/abci) protocol, which enables your application to be safely replicated with the Tendermint consensus engine.
- [`sdk`](https://godoc.org/github.com/cosmos/cosmos-sdk): Common types for working with SDK applications
- [`abci`](https://godoc.org/github.com/tendermint/tendermint/abci/types): Similar to the `sdk/types` module, but for Tendermint
- [`cmn`](https://godoc.org/github.com/tendermint/tendermint/libs/common): Code for working with Tendermint applications
- [`dbm`](https://godoc.org/github.com/tendermint/tendermint/libs/db): Code for working with the Tendermint database

Start by declaring the name and struct for your app. In this tutorial the app is called `nameservice`.

```go
const (
	appName = "nameservice"
)

type nameserviceApp struct {
	*bam.BaseApp
	cdc *codec.Codec

	keyMain          *sdk.KVStoreKey
	keyAccount       *sdk.KVStoreKey
	keyNSnames       *sdk.KVStoreKey
	keyNSowners      *sdk.KVStoreKey
	keyNSprices      *sdk.KVStoreKey
	keyFeeCollection *sdk.KVStoreKey

	accountKeeper       auth.AccountKeeper
	bankKeeper          bank.Keeper
	feeCollectionKeeper auth.FeeCollectionKeeper
	nsKeeper            nameservice.Keeper
}
```

Next, create a constructor for a new `nameserviceApp`.  In this function your application:

- Creates required `Keepers` from each desired module
- Generates `storeKeys` required by each keeper
- Registers `Handler`s from each module
- Registers `Querier`s from each module
- Mounts `KVStore`s onto Tendermint
- Sets the `initChainer` for defining application state

There are notes in the code that describe each line:

```go
// NewnameserviceApp is a constructor function for nameserviceApp
func NewnameserviceApp(logger log.Logger, db dbm.DB) *nameserviceApp {

	// First define the top level codec that will be shared by the different modules
	cdc := MakeCodec()

	// BaseApp handles interactions with Tendermint through the ABCI protocol
	bApp := bam.NewBaseApp(appName, logger, db, auth.DefaultTxDecoder(cdc))

	// Here you initialize your application with the store keys it requires
	var app = &nameserviceApp{
		BaseApp: bApp,
		cdc:     cdc,

		keyMain:          sdk.NewKVStoreKey("main"),
		keyAccount:       sdk.NewKVStoreKey("acc"),
		keyNSnames:       sdk.NewKVStoreKey("ns_names"),
		keyNSowners:      sdk.NewKVStoreKey("ns_owners"),
		keyNSprices:      sdk.NewKVStoreKey("ns_prices"),
		keyFeeCollection: sdk.NewKVStoreKey("fee_collection"),
	}

	// The AccountKeeper handles address -> account lookups
	app.accountKeeper = auth.NewAccountKeeper(
		app.cdc,
		app.keyAccount,
		auth.ProtoBaseAccount,
	)

	// The BankKeeper allows you perform sdk.Coins interactions
	app.bankKeeper = bank.NewBaseKeeper(app.accountKeeper)

	// The FeeCollectionKeeper collects transaction fees and renders them to the fee distribution module
	app.feeCollectionKeeper = auth.NewFeeCollectionKeeper(cdc, app.keyFeeCollection)

	// The NameserviceKeeper is the Keeper from the module for this tutorial
	// It handles interactions with the namestore
	app.nsKeeper = nameservice.NewKeeper(
		app.bankKeeper,
		app.keyNSnames,
		app.keyNSowners,
		app.keyNSprices,
		app.cdc,
	)

	// The AnteHandler handles signature verification and transaction pre-processing
	app.SetAnteHandler(auth.NewAnteHandler(app.accountKeeper, app.feeCollectionKeeper))

	// The app.Router is the main transaction router where each module registers it's routes
	// Here we register the bank and nameservice routes
	app.Router().
		AddRoute("bank", bank.NewHandler(app.bankKeeper)).
		AddRoute("nameservice", nameservice.NewHandler(app.nsKeeper))

	// The app.QueryRouter is the main query router where each module registers it's routes
	app.QueryRouter().
		AddRoute("nameservice", nameservice.NewQuerier(app.nsKeeper))

	// The initChainer handles translating the genesis.json file into initial state for the network
	app.SetInitChainer(app.initChainer)

	app.MountStoresIAVL(
		app.keyMain,
		app.keyAccount,
		app.keyNSnames,
		app.keyNSowners,
		app.keyNSprices,
	)

	err := app.LoadLatestVersion(app.keyMain)
	if err != nil {
		cmn.Exit(err.Error())
	}

	return app
}
```

The `initChainer` defines how accounts in `genesis.json` are mapped into the application state on initial chain start.

> *NOTE*:

The constructor registers the `initChainer` function, but it isn't defined yet. Go ahead and create it:

```go
// GenesisState represents chain state at the start of the chain. Any initial state (account balances) are stored here.
type GenesisState struct {
	Accounts []auth.BaseAccount `json:"accounts"`
}

func (app *nameserviceApp) initChainer(ctx sdk.Context, req abci.RequestInitChain) abci.ResponseInitChain {
	stateJSON := req.AppStateBytes

	genesisState := new(GenesisState)
	err := app.cdc.UnmarshalJSON(stateJSON, genesisState)
	if err != nil {
		panic(err)
	}

	for _, acc := range genesisState.Accounts {
		acc.AccountNumber = app.accountKeeper.GetNextAccountNumber(ctx)
		app.accountKeeper.SetAccount(ctx, &acc)
	}

	return abci.ResponseInitChain{}
}
```

Finally add a helper function to generate an amino [`*codec.Codec`](https://godoc.org/github.com/cosmos/cosmos-sdk/codec#Codec) that properly registers all of the modules used in your application:

```go
func MakeCodec() *codec.Codec {
	var cdc = codec.New()
	auth.RegisterCodec(cdc)
	bank.RegisterCodec(cdc)
	nameservice.RegisterCodec(cdc)
	sdk.RegisterCodec(cdc)
	codec.RegisterCrypto(cdc)
	return cdc
}
```

### Now that you have created an application that includes your module, it's time to [build your entrypoints](./entrypoint.md)!
