package types

import (
	"github.com/cosmos/cosmos-sdk/codec"
)

// RegisterCodec registers concrete types on codec
func RegisterCodec(cdc *codec.Codec) {
  // this line is used by starport scaffolding # 1
		cdc.RegisterConcrete(MsgCreateVote{}, "voter/CreateVote", nil)
		cdc.RegisterConcrete(MsgSetVote{}, "voter/SetVote", nil)
		cdc.RegisterConcrete(MsgDeleteVote{}, "voter/DeleteVote", nil)
		cdc.RegisterConcrete(MsgCreatePoll{}, "voter/CreatePoll", nil)
		cdc.RegisterConcrete(MsgSetPoll{}, "voter/SetPoll", nil)
		cdc.RegisterConcrete(MsgDeletePoll{}, "voter/DeletePoll", nil)
}

// ModuleCdc defines the module codec
var ModuleCdc *codec.Codec

func init() {
	ModuleCdc = codec.New()
	RegisterCodec(ModuleCdc)
	codec.RegisterCrypto(ModuleCdc)
	ModuleCdc.Seal()
}
