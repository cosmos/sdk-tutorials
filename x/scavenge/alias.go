package scavenge

import (
	"github.com/okwme/scavenge/x/scavenge/internal/keeper"
	"github.com/okwme/scavenge/x/scavenge/internal/types"
	"github.com/okwme/scavenge/x/scavenge/internal/types/msgs"
)

const (
	// TODO: define constants that you would like exposed from the internal package

	ModuleName        = types.ModuleName
	RouterKey         = types.RouterKey
	StoreKey          = types.StoreKey
	DefaultParamspace = types.DefaultParamspace
	DefaultCodespace  = types.DefaultCodespace
	// QueryParams       = types.QueryParams
	QuerierRoute = types.QuerierRoute
)

var (
	// functions aliases
	NewKeeper           = keeper.NewKeeper
	NewQuerier          = keeper.NewQuerier
	RegisterCodec       = types.RegisterCodec
	NewGenesisState     = types.NewGenesisState
	DefaultGenesisState = types.DefaultGenesisState
	ValidateGenesis     = types.ValidateGenesis
	// TODO: Fill out function aliases

	// variable aliases
	ModuleCdc = types.ModuleCdc
	// TODO: Fill out variable aliases

	NewMsgCreateScavenge = msgs.NewMsgCreateScavenge
	NewMsgDeleteScavenge = msgs.NewMsgDeleteScavenge
	NewMsgUpdateScavenge = msgs.NewMsgUpdateScavenge

	NewMsgCommitSolution = msgs.NewMsgCommitSolution
	NewMsgRevealSolution = msgs.NewMsgRevealSolution
)

type (
	Keeper       = keeper.Keeper
	CodeType     = types.CodeType
	GenesisState = types.GenesisState
	Params       = types.Params

	MsgCreateScavenge = msgs.MsgCreateScavenge
	MsgDeleteScavenge = msgs.MsgDeleteScavenge
	MsgUpdateScavenge = msgs.MsgUpdateScavenge

	MsgCommitSolution = msgs.MsgCommitSolution
	MsgRevealSolution = msgs.MsgRevealSolution

	// TODO: Fill out module types
)
