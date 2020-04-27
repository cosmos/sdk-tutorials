package greeter

import (
	"github.com/cosmos/sdk-tutorials/hellochain/x/greeter/keeper"
	"github.com/cosmos/sdk-tutorials/hellochain/x/greeter/types"
)

const (
	// TODO: define constants that you would like exposed from your module

	ModuleName        = types.ModuleName
	RouterKey         = types.RouterKey
	StoreKey          = types.StoreKey
	DefaultParamspace = types.DefaultParamspace
	QuerierRoute      = types.QuerierRoute
)

var (
	// functions aliases
	NewKeeper       = keeper.NewKeeper
	NewQuerier      = keeper.NewQuerier
	RegisterCodec   = types.RegisterCodec
	NewGenesisState = types.NewGenesisState
	ValidateGenesis = types.ValidateGenesis
	// TODO: Fill out function aliases
	NewGreeting = types.NewGreeting

	// variable aliases
	ModuleCdc = types.ModuleCdc
	// TODO: Fill out variable aliases
)

type (
	GreetingsList       = types.GreetingsList
	DefaultGenesisState = types.DefaultGenesisState
	MsgGreet            = types.MsgGreet
	Keeper              = keeper.Keeper
	GenesisState        = types.GenesisState
	Params              = types.Params

	// TODO: Fill out module types
)
