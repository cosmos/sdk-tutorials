package app

// import (
// 	"encoding/json"
// 	"math/rand"

// 	"github.com/gorilla/mux"
// 	"github.com/spf13/cobra"

// 	abci "github.com/tendermint/tendermint/abci/types"

// 	"github.com/cosmos/cosmos-sdk/client/context"
// 	"github.com/cosmos/cosmos-sdk/codec"
// 	sdk "github.com/cosmos/cosmos-sdk/types"
// 	"github.com/cosmos/cosmos-sdk/types/module"
// 	"github.com/cosmos/cosmos-sdk/x/bank"
// 	sim "github.com/cosmos/cosmos-sdk/x/simulation"
// 	"github.com/cosmos/modules/incubator/nft"
// 	"github.com/cosmos/sdk-tutorials/auction/x/auction/client/cli"
// 	"github.com/cosmos/sdk-tutorials/auction/x/auction/client/rest"
// )

// var (
// 	_ module.AppModule           = AppModule{}
// 	_ module.AppModuleBasic      = AppModuleBasic{}
// 	_ module.AppModuleSimulation = AppModuleSimulation{}
// )

// // AppModuleBasic defines the basic application module
// type AppModuleBasic struct{}

// var _ module.AppModuleBasic = AppModuleBasic{}

// // Name returns the gov module's name.
// func (AppModuleBasic) Name() string {
// 	return //TODO:
// }

// // RegisterCodec registers the gov module's types for the given codec.
// func (AppModuleBasic) RegisterCodec(cdc *codec.Codec) {
// 	//TODO:
// }

// // DefaultGenesis returns default genesis state as raw bytes
// func (AppModuleBasic) DefaultGenesis() json.RawMessage {
// 	return//TODO:
// }

// // ValidateGenesis performs genesis state validation
// func (AppModuleBasic) ValidateGenesis(bz json.RawMessage) error {
// 	var data GenesisState
// 	err := ModuleCdc.UnmarshalJSON(bz, &data)
// 	if err != nil {
// 		return err
// 	}
// 	return ValidateGenesis(data)
// }

// // RegisterRESTRoutes registers the REST routes
// func (AppModuleBasic) RegisterRESTRoutes(ctx context.CLIContext, rtr *mux.Router) {
// //TODO:
// }

// // GetTxCmd gets the root tx command of this module
// func (AppModuleBasic) GetTxCmd(cdc *codec.Codec) *cobra.Command {
// 	return //TODO:
// }

// // GetQueryCmd gets the root query command of this module
// func (AppModuleBasic) GetQueryCmd(cdc *codec.Codec) *cobra.Command {
// 	return //TODO:
// }

// //____________________________________________________________________________

// // AppModuleSimulation defines the module simulation functions used
// type AppModuleSimulation struct{}

// // RegisterStoreDecoder registers a decoder
// func (AppModuleSimulation) RegisterStoreDecoder(sdr sdk.StoreDecoderRegistry) {}

// // GenerateGenesisState creates a randomized GenState
// func (AppModuleSimulation) GenerateGenesisState(simState *module.SimulationState) {}

// // RandomizedParams creates randomized param changes for the simulator.
// func (AppModuleSimulation) RandomizedParams(r *rand.Rand) []sim.ParamChange {
// 	return []sim.ParamChange{}
// }

// //____________________________________________________________________________

// // AppModule implements an application module for the gov module.
// type AppModule struct {
// 	AppModuleBasic
// 	AppModuleSimulation

// //TODO:
// }

// // NewAppModule creates a new AppModule object
// func NewAppModule() AppModule {
// 	return AppModule{
// //TODO:
// 	}
// }

// // Name returns the gov module's name.
// func (AppModule) Name() string {
// 	return //TODO:
// }

// // RegisterInvariants registers module invariants
// func (am AppModule) RegisterInvariants(ir sdk.InvariantRegistry) {}

// // Route returns the message routing key for the gov module.
// func (AppModule) Route() string {
// 	return //TODO:
// }

// // NewHandler returns an sdk.Handler for the gov module.
// func (am AppModule) NewHandler() sdk.Handler {
// 	return //TODO:
// }

// // QuerierRoute returns the gov module's querier route name.
// func (AppModule) QuerierRoute() string {
// 	return //TODO:
// }

// // NewQuerierHandler returns no sdk.Querier.
// func (am AppModule) NewQuerierHandler() sdk.Querier {
// 	return //TODO: NewQuerier
// }

// // InitGenesis performs genesis initialization for the gov module. It returns
// // no validator updates.
// func (am AppModule) InitGenesis(ctx sdk.Context, data json.RawMessage) []abci.ValidatorUpdate {
// 	var genesisState GenesisState
// 	ModuleCdc.MustUnmarshalJSON(data, &genesisState)
// 	// TODO: add init genesis
// 	return []abci.ValidatorUpdate{}
// }

// // ExportGenesis returns the exported genesis state as raw bytes for the gov
// // module.
// func (am AppModule) ExportGenesis(ctx sdk.Context) json.RawMessage {
// 	gs := ExportGenesis(ctx, am.keeper)
// 	return ModuleCdc.MustMarshalJSON(gs)
// }

// // BeginBlock performs a no-op.
// func (AppModule) BeginBlock(_ sdk.Context, _ abci.RequestBeginBlock) {}

// // EndBlock returns the end blocker for the gov module. It returns no validator
// // updates.
// func (am AppModule) EndBlock(ctx sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
// 	// EndBlocker(ctx, am.keeper)
// 	return []abci.ValidatorUpdate{}
// }
