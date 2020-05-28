package greeter

import (
	"github.com/cosmos/sdk-tutorials/hellochain/x/greeter/keeper"
	"github.com/cosmos/sdk-tutorials/hellochain/x/greeter/types"
)

const (
	ModuleName   = types.ModuleName
	RouterKey    = types.RouterKey
	StoreKey     = types.StoreKey
	QuerierRoute = types.QuerierRoute
)

var (
	// functions aliases
	NewKeeper       = keeper.NewKeeper
	NewQuerier      = keeper.NewQuerier
	RegisterCodec   = types.RegisterCodec
	NewGenesisState = types.NewGenesisState
	ValidateGenesis = types.ValidateGenesis
	NewGreeting     = types.NewGreeting

	// variable aliases
	ModuleCdc = types.ModuleCdc
)

type (
	GreetingsList       = types.GreetingsList
	DefaultGenesisState = types.DefaultGenesisState
	MsgGreet            = types.MsgGreet
	Keeper              = keeper.Keeper
	GenesisState        = types.GenesisState
)
