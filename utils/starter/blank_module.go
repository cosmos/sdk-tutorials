package starter

import (
	"encoding/json"

	"github.com/gorilla/mux"
	"github.com/spf13/cobra"

	abci "github.com/tendermint/tendermint/abci/types"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
)

// BlankModuleBasic implements the AppModuleBasic interface using a given ModuleName
type BlankModuleBasic struct {
	ModuleName string
}

// BlankModule implements the AppModule interface
type BlankModule struct {
	BlankModuleBasic
	keeper interface{} //modules have keepers, BlankModule just has a placeholder
}

type blankModuleGenesisState []string

// type check to ensure the interface is properly implemented
var (
	_ module.AppModule      = BlankModule{}
	_ module.AppModuleBasic = BlankModuleBasic{}
)

// NewBlankModule returns a new BlankModule with a given name and keeper.
func NewBlankModule(name string, keeper interface{}) BlankModule {

	return BlankModule{BlankModuleBasic{name}, keeper}
}

// Name returns the modules name
func (bm BlankModuleBasic) Name() string {
	return bm.ModuleName
}

// RegisterCodec should be overridden in the full module implementation.
func (BlankModuleBasic) RegisterCodec(cdc *codec.Codec) {
	panic("RegisterCodec not implemented")
}

// ValidateGenesis should be overridden in the full module implementation.
func (bm BlankModuleBasic) ValidateGenesis(bz json.RawMessage) error {
	return nil
	//panic("ValidateGenesis not implemented")
}

// DefaultGenesis returns a blank and empty genesis state
func (bm BlankModuleBasic) DefaultGenesis() json.RawMessage {
	data := blankModuleGenesisState{bm.ModuleName}
	cdc := codec.New()
	return cdc.MustMarshalJSON(data)
}

// RegisterInvariants is required by the AppModule interface.
func (bm BlankModule) RegisterInvariants(ir sdk.InvariantRegistry) {}

// Route returns the module name as a string to use for query routing
func (bm BlankModule) Route() string {
	return bm.ModuleName
}

// NewQuerierHandler should be overridden in the full module implementation.
func (bm BlankModule) NewQuerierHandler() sdk.Querier {
	panic("NewQuerierHandler not implemented")
}

// GetQueryCmd should be overridden in the full module implementation.
func (bm BlankModuleBasic) GetQueryCmd(*codec.Codec) *cobra.Command {
	panic("GetQueryCmd not implemented")
}

// GetTxCmd should be overridden in the full module implementation.
func (bm BlankModuleBasic) GetTxCmd(*codec.Codec) *cobra.Command {
	panic("GetTxCmd not implemented")
}

// RegisterRESTRoutes should be overridden in the full module implementation
func (BlankModuleBasic) RegisterRESTRoutes(ctx context.CLIContext, rtr *mux.Router) {
	//rest.RegisterRoutes(ctx, rtr, cdc, StoreKey)
	panic("RegisterRESTRoutes not implemented")
}

// BeginBlock can be empty.
func (bm BlankModule) BeginBlock(_ sdk.Context, _ abci.RequestBeginBlock) {}

// EndBlock can return an empty ValidatorUpdate
func (bm BlankModule) EndBlock(sdk.Context, abci.RequestEndBlock) []abci.ValidatorUpdate {
	return []abci.ValidatorUpdate{}
}

// InitGenesis can return an empty ValidatorUpdate
func (bm BlankModule) InitGenesis(ctx sdk.Context, data json.RawMessage) []abci.ValidatorUpdate {
	return []abci.ValidatorUpdate{}
}

// ExportGenesis can return nil
func (bm BlankModule) ExportGenesis(ctx sdk.Context) json.RawMessage {
	return nil
}

// NewHandler should be overridden by the full module implementation
func (bm BlankModule) NewHandler() sdk.Handler {
	panic("NewHandler not implemented")
}

// QuerierRoute returns the ModuleName as a string to use for routing
func (bm BlankModule) QuerierRoute() string {
	return bm.ModuleName
}
