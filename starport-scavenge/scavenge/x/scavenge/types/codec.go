package types

import (
	"github.com/cosmos/cosmos-sdk/codec"
)

// RegisterCodec registers concrete types on codec
func RegisterCodec(cdc *codec.Codec) {
	cdc.RegisterConcrete(MsgCreateScavenge{}, "scavenge/CreateScavenge", nil)
	cdc.RegisterConcrete(MsgCommitSolution{}, "scavenge/CommitSolution", nil)
	cdc.RegisterConcrete(MsgRevealSolution{}, "scavenge/RevealSolution", nil)
}

// ModuleCdc defines the module codec
var ModuleCdc *codec.Codec

func init() {
	ModuleCdc = codec.New()
	RegisterCodec(ModuleCdc)
	codec.RegisterCrypto(ModuleCdc)
	ModuleCdc.Seal()
}
