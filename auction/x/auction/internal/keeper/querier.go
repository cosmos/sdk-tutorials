package keeper

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/sdk-application-tutorial/auction/x/auction/internal/types"
	abci "github.com/tendermint/tendermint/abci/types"
)

const (
	QueryAuction  = "auction"
	QueryAuctions = "auctions"
)

func NewQuerier(keeper Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) (res []byte, err sdk.Error) {
		switch path[0] {
		case QueryAuction:
			return queryAuction(ctx, path[1:], req, keeper)
		case QueryAuctions:
			return queryAuctions(ctx, req, keeper)
		default:
			return nil, sdk.ErrUnknownRequest("unknown auction query endpoint")
		}
	}
}

func queryAuction(ctx sdk.Context, path []string, req abci.RequestQuery, keeper Keeper) ([]byte, sdk.Error) {
	auction, ok := keeper.GetAuction(ctx, path[0])
	if !ok {
		return nil, sdk.ErrInternal(fmt.Sprintf("could not find auction:%s", path[0]))
	}

	res, err := codec.MarshalJSONIndent(keeper.cdc, auction)
	if err != nil {
		panic("could not marshal result to JSON")
	}
	return res, nil
}

func queryAuctions(ctx sdk.Context, req abci.RequestQuery, keeper Keeper) ([]byte, sdk.Error) {

	var auctions []types.Auction

	iterator := keeper.GetAuctionsIterator(ctx)

	for ; iterator.Valid(); iterator.Next() {
		auctions = append(auctions, string(iterator.Value()))
	}

	res, err := codec.MarshalJSONIndent(keeper.cdc, auctions)
	if err != nil {
		panic("could not marshal result to JSON")
	}
	return res, nil
}
