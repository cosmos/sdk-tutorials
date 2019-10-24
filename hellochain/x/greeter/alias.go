package greeter

import (
	"github.com/cosmos/sdk-tutorials/hellochain/x/greeter/internal/keeper"
	"github.com/cosmos/sdk-tutorials/hellochain/x/greeter/internal/types"
)

const (
	ModuleName = types.ModuleName
	RouterKey  = types.RouterKey
	StoreKey   = types.StoreKey
)

var (
	NewKeeper            = keeper.NewKeeper
	NewQuerier           = keeper.NewQuerier
	NewMsgGreet          = types.NewMsgGreet
	ModuleCdc            = types.ModuleCdc
	RegisterCodec        = types.RegisterCodec
	NewGreeting          = types.NewGreeeting
	GreetingsList        = types.GreeetingsList
	NewQueryResGreetings = types.NewQueryResGreetings
	QueryRrdGreetings    = types.QueryResGreetings
)

type (
	Keeper          = keeper.Keeper
	MsgSetName      = types.MsgSetName
	MsgBuyName      = types.MsgBuyName
	MsgDeleteName   = types.MsgDeleteName
	QueryResResolve = types.QueryResResolve
	QueryResNames   = types.QueryResNames
	Whois           = types.Whois
)
