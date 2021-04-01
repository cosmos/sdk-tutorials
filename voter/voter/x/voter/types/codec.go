package types

import (
	"github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/msgservice"
)

func RegisterCodec(cdc *codec.LegacyAmino) {
	// this line is used by starport scaffolding # 2
	cdc.RegisterConcrete(&MsgCreateVote{}, "voter/CreateVote", nil)
	cdc.RegisterConcrete(&MsgUpdateVote{}, "voter/UpdateVote", nil)
	cdc.RegisterConcrete(&MsgDeleteVote{}, "voter/DeleteVote", nil)

	cdc.RegisterConcrete(&MsgCreatePoll{}, "voter/CreatePoll", nil)
	cdc.RegisterConcrete(&MsgUpdatePoll{}, "voter/UpdatePoll", nil)
	cdc.RegisterConcrete(&MsgDeletePoll{}, "voter/DeletePoll", nil)

}

func RegisterInterfaces(registry cdctypes.InterfaceRegistry) {
	// this line is used by starport scaffolding # 3
	registry.RegisterImplementations((*sdk.Msg)(nil),
		&MsgCreateVote{},
		&MsgUpdateVote{},
		&MsgDeleteVote{},
	)
	registry.RegisterImplementations((*sdk.Msg)(nil),
		&MsgCreatePoll{},
		&MsgUpdatePoll{},
		&MsgDeletePoll{},
	)

	msgservice.RegisterMsgServiceDesc(registry, &_Msg_serviceDesc)
}

var (
	amino     = codec.NewLegacyAmino()
	ModuleCdc = codec.NewAminoCodec(amino)
)
