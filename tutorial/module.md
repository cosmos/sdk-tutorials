# AppModule Interface

The Cosmos SDK provides a standard interface for modules. This [`AppModule`](https://github.com/cosmos/cosmos-sdk/blob/master/types/module.go) interface requires modules to provide a set of methods used by the `ModuleBasicsManager` to incorporate them into your application. First we will scaffold out the interface and implement **some** of its methods. Then we will incorporate our nameservice module alongside `auth` and `bank` into our app.

Start by opening two new files, `module.go` and `genesis.go`. We will implement the AppModule interface in `module.go` and the functions specific to genesis state management in `genesis.go`. The genesis-specific methods on your AppModule struct will be pass-though calls to those defined in `genesis.go`.

Lets start with adding the following code to `module.go`. We will leave a number of the functions unimplemented for now.

```go
package nameservice

import (
	"encoding/json"

	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/x/bank"
	"github.com/cosmos/sdk-application-tutorial/x/nameservice/client/cli"
	"github.com/cosmos/sdk-application-tutorial/x/nameservice/client/rest"

	sdk "github.com/cosmos/cosmos-sdk/types"
	abci "github.com/tendermint/tendermint/abci/types"
)

var (
	_ sdk.AppModule      = AppModule{}
	_ sdk.AppModuleBasic = AppModuleBasic{}
)

const ModuleName = "nameservice"

// app module Basics object
type AppModuleBasic struct{}

func (AppModuleBasic) Name() string {
	return ModuleName
}

func (AppModuleBasic) RegisterCodec(cdc *codec.Codec) {
	RegisterCodec(cdc)
}

func (AppModuleBasic) DefaultGenesis() json.RawMessage {
	return ModuleCdc.MustMarshalJSON(DefaultGenesisState())
}

// Validation check of the Genesis
func (AppModuleBasic) ValidateGenesis(bz json.RawMessage) error {
	var data GenesisState
	err := ModuleCdc.UnmarshalJSON(bz, &data)
	if err != nil {
		return err
	}
	// once json successfully marshalled, passes along to genesis.go
	return ValidateGenesis(data)
}

// Register rest routes
func (AppModuleBasic) RegisterRESTRoutes(ctx context.CLIContext, rtr *mux.Router, cdc *codec.Codec) {
	rest.RegisterRoutes(ctx, rtr, cdc, StoreKey)
}

// Get the root query command of this module
func (AppModuleBasic) GetQueryCmd(cdc *codec.Codec) *cobra.Command {
	return cli.GetQueryCmd(StoreKey, cdc)
}

// Get the root tx command of this module
func (AppModuleBasic) GetTxCmd(cdc *codec.Codec) *cobra.Command {
	return cli.GetTxCmd(StoreKey, cdc)
}

type AppModule struct {
	AppModuleBasic
	keeper     Keeper
	coinKeeper bank.Keeper
}

// NewAppModule creates a new AppModule Object
func NewAppModule(k Keeper, bankKeeper bank.Keeper) AppModule {
	return AppModule{
		AppModuleBasic: AppModuleBasic{},
		keeper:         k,
		coinKeeper:     bankKeeper,
	}
}

func (AppModule) Name() string {
	return ModuleName
}

func (am AppModule) RegisterInvariants(ir sdk.InvariantRouter) {}

func (am AppModule) Route() string {
	return RouterKey
}

func (am AppModule) NewHandler() types.Handler {
	return NewHandler(am.keeper)
}
func (am AppModule) QuerierRoute() string {
	return ModuleName
}

func (am AppModule) NewQuerierHandler() types.Querier {
	return NewQuerier(am.keeper)
}

func (am AppModule) BeginBlock(_ sdk.Context, _ abci.RequestBeginBlock) types.Tags {
	return sdk.EmptyTags()
}

func (am AppModule) EndBlock(types.Context, abci.RequestEndBlock) ([]abci.ValidatorUpdate, types.Tags) {
	return []abci.ValidatorUpdate{}, sdk.EmptyTags()
}

func (am AppModule) InitGenesis(ctx types.Context, data json.RawMessage) []abci.ValidatorUpdate {
	var genesisState GenesisState
	ModuleCdc.MustUnmarshalJSON(data, &genesisState)
	return InitGenesis(ctx, am.keeper, genesisState)
}

func (am AppModule) ExportGenesis(ctx sdk.Context) json.RawMessage {
	gs := ExportGenesis(ctx, am.keeper)
	return ModuleCdc.MustMarshalJSON(gs)
}
```

To see more examples of AppModule implementation, check out some of the other modules in the SDK such as [x/staking](https://github.com/cosmos/cosmos-sdk/blob/master/x/staking/genesis.go)

### Next, we need to [implement the genesis-specific methods called above.](./genesis.md)
