package keeper

import (
	"fmt"

	"github.com/tendermint/tendermint/libs/log"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-tutorials/hellochain/x/greeter/types"
)

// Keeper of the greeter store
type Keeper struct {
	storeKey sdk.StoreKey
	cdc      *codec.Codec
}

// NewKeeper creates a greeter keeper
func NewKeeper(cdc *codec.Codec, key sdk.StoreKey, paramspace types.ParamSubspace) Keeper {
	keeper := Keeper{
		storeKey: key,
		cdc:      cdc,
	}
	return keeper
}

// Logger returns a module-specific logger.
func (k Keeper) Logger(ctx sdk.Context) log.Logger {
	return ctx.Logger().With("module", fmt.Sprintf("x/%s", types.ModuleName))
}

func (k Keeper) GetGreetings(ctx sdk.Context, key sdk.AccAddress) (types.GreetingsList, error) {
	store := ctx.KVStore(k.storeKey)
	var item types.GreetingsList
	byteKey := []byte(key)

	err := k.cdc.UnmarshalBinaryLengthPrefixed(store.Get(byteKey), &item)
	if err != nil {
		return nil, err
	}

	return item, nil
}

func (k Keeper) AppendGreeting(ctx sdk.Context, key string, greeting types.Greeting) (error, types.Greeting) {
	store := ctx.KVStore(k.storeKey)

	list, err := k.GetGreetings(ctx, greeting.Recipient)

	if err != nil {
		return nil, greeting
	}

	list = append(list, greeting)

	if greeting.Sender.Empty() {

	}

	store.Set(greeting.Recipient.Bytes(), k.cdc.MustMarshalBinaryBare(list))

	return nil, greeting
}

func (k Keeper) GetGreetingsIterator(ctx sdk.Context) sdk.Iterator {
	store := ctx.KVStore(k.storeKey)

	return sdk.KVStorePrefixIterator(store, nil)
}
