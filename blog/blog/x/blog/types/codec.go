package types

import (
	"github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"

	// this line is used by starport scaffolding # 1
	sdk "github.com/cosmos/cosmos-sdk/types"
)

func RegisterCodec(cdc *codec.LegacyAmino) {
	// this line is used by starport scaffolding # 2
	cdc.RegisterConcrete(&MsgCreateComment{}, "blog/CreateComment", nil)
	cdc.RegisterConcrete(&MsgUpdateComment{}, "blog/UpdateComment", nil)
	cdc.RegisterConcrete(&MsgDeleteComment{}, "blog/DeleteComment", nil)

	cdc.RegisterConcrete(&MsgCreatePost{}, "blog/CreatePost", nil)
}

func RegisterInterfaces(registry cdctypes.InterfaceRegistry) {
	// this line is used by starport scaffolding # 3
	registry.RegisterImplementations((*sdk.Msg)(nil),
		&MsgCreateComment{},
		&MsgUpdateComment{},
		&MsgDeleteComment{},
	)
	registry.RegisterImplementations((*sdk.Msg)(nil),
		&MsgCreatePost{},
	)
}

var (
	amino     = codec.NewLegacyAmino()
	ModuleCdc = codec.NewAminoCodec(amino)
)
