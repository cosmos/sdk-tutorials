package keeper

import (
	abci "github.com/tendermint/tendermint/abci/types"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	greeter "github.com/cosmos/sdk-tutorials/hellochain/x/greeter/internal/types"
)

// query endpoints supported by the hellochain Querier
const (
	ListGreetings = "list"
)

// NewQuerier is the module level router for state queries
func NewQuerier(keeper Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) (res []byte, err error) {
		switch path[0] {
		case ListGreetings:
			return listGreetings(ctx, path[1:], req, keeper)
		default:
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "unknown greeter query endpoint")
		}
	}
}

func listGreetings(ctx sdk.Context, params []string, req abci.RequestQuery, keeper Keeper) ([]byte, error) {
	greetingList := greeter.NewQueryResGreetings()
	iterator := keeper.GetGreetingsIterator(ctx)

	addr, err := sdk.AccAddressFromBech32(params[0])
	if err != nil {
		return nil, err
	}

	for ; iterator.Valid(); iterator.Next() {

		var greeting greeter.Greeting
		keeper.cdc.MustUnmarshalBinaryBare(iterator.Value(), &greeting)

		if greeting.Recipient.Equals(addr) {
			greetingList[addr.String()] = append(greetingList[addr.String()], greeting)
		}
	}

	hellos, err := codec.MarshalJSONIndent(keeper.cdc, greetingList)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return hellos, nil
}
