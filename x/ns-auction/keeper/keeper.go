package keeper

import (
	"fmt"

	"cosmossdk.io/log"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"cosmossdk.io/collections"
	"cosmossdk.io/core/address"
	storetypes "cosmossdk.io/core/store"
	"github.com/cosmos/cosmos-sdk/codec"
	ns "github.com/cosmos/sdk-tutorials/x/ns-auction"
)

type Keeper struct {
	cdc          codec.BinaryCodec
	addressCodec address.Codec

	authority string

	bk           ns.BankKeeper
	defaultDenom string

	// state management
	Schema collections.Schema
	Names  collections.Map[string, ns.Name]
}

func NewKeeper(cdc codec.BinaryCodec, addressCodec address.Codec, storeService storetypes.KVStoreService, authority string, bk ns.BankKeeper, denom string) Keeper {
	if _, err := addressCodec.StringToBytes(authority); err != nil {
		panic(fmt.Errorf("invalid authority address: %w", err))
	}

	sb := collections.NewSchemaBuilder(storeService)
	k := Keeper{
		cdc:          cdc,
		addressCodec: addressCodec,
		authority:    authority,
		bk:           bk,
		defaultDenom: denom,
		Names:        collections.NewMap(sb, ns.NamesKey, "names", collections.StringKey, codec.CollValue[ns.Name](cdc)),
	}

	schema, err := sb.Build()
	if err != nil {
		panic(err)
	}

	k.Schema = schema

	return k
}

func (k Keeper) GetAuthority() string {
	return k.authority
}

// Logger returns a module-specific logger.
func (keeper Keeper) Logger(ctx sdk.Context) log.Logger {
	return ctx.Logger().With("module", "x/"+ns.ModuleName)
}
