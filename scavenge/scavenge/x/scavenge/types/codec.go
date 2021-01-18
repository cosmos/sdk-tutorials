package types

import (
	"github.com/cosmos/cosmos-sdk/codec"
)

// RegisterCodec registers concrete types on codec
func RegisterCodec(cdc *codec.Codec) {
	// this line is used by starport scaffolding # 1
	cdc.RegisterConcrete(MsgCommitSolution{}, "scavenge/CreateCommit", nil)
	cdc.RegisterConcrete(MsgSetCommit{}, "scavenge/SetCommit", nil)
	cdc.RegisterConcrete(MsgDeleteCommit{}, "scavenge/DeleteCommit", nil)
	cdc.RegisterConcrete(MsgCreateScavenge{}, "scavenge/CreateScavenge", nil)
	cdc.RegisterConcrete(MsgSetScavenge{}, "scavenge/SetScavenge", nil)
	cdc.RegisterConcrete(MsgDeleteScavenge{}, "scavenge/DeleteScavenge", nil)
	cdc.RegisterConcrete(MsgRevealSolution{}, "scavenge/MsgRevealSolution", nil)
}

// ModuleCdc defines the module codec
var ModuleCdc *codec.Codec

func init() {
	ModuleCdc = codec.New()
	RegisterCodec(ModuleCdc)
	codec.RegisterCrypto(ModuleCdc)
	ModuleCdc.Seal()
}
