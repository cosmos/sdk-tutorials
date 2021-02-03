package types

import (
	"github.com/cosmos/cosmos-sdk/codec"
    cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
    sdk "github.com/cosmos/cosmos-sdk/types"
)

func RegisterCodec(cdc *codec.LegacyAmino) {
    // this line is used by starport scaffolding # 2
cdc.RegisterConcrete(&MsgCreateClaim{}, "pofe/CreateClaim", nil)
cdc.RegisterConcrete(&MsgUpdateClaim{}, "pofe/UpdateClaim", nil)
cdc.RegisterConcrete(&MsgDeleteClaim{}, "pofe/DeleteClaim", nil)

} 

func RegisterInterfaces(registry cdctypes.InterfaceRegistry) {
    // this line is used by starport scaffolding # 3
registry.RegisterImplementations((*sdk.Msg)(nil),
	&MsgCreateClaim{},
	&MsgUpdateClaim{},
	&MsgDeleteClaim{},
)
}

var (
	amino = codec.NewLegacyAmino()
	ModuleCdc = codec.NewAminoCodec(amino)
)
