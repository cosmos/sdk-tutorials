package keeper

import (
	"time"

	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/x/bank"
	"github.com/cosmos/modules/incubator/nft"
	autypes "github.com/cosmos/sdk-application-tutorial/auction/x/auction/internal/types"
)

type Keeper struct {
	BankKeeper bank.Keeper

	NftKeeper nft.Keeper

	StoreKey types.StoreKey

	cdc *codec.Codec
}

func NewKeeper(bk bank.Keeper, nftk nft.Keeper, sKey types.StoreKey, cdc *codec.Codec) Keeper {
	return Keeper{
		BankKeeper: bk,
		NftKeeper:  nftk,
		StoreKey:   sKey,
		cdc:        cdc,
	}
}

func (k Keeper) GetAuction(ctx types.Context, nftID string) (autypes.Auction, bool) {
	store := ctx.KVStore(k.StoreKey)
	nftIDByte := []byte(nftID)
	if !k.hasAuction(ctx, nftIDByte) {
		return autypes.Auction{}, false
	}
	bz := store.Get(nftIDByte)
	var auction autypes.Auction
	k.cdc.MustUnmarshalBinaryBare(bz, &auction)
	return auction, true
}

func (k Keeper) hasAuction(ctx types.Context, name []byte) bool {
	store := ctx.KVStore(k.StoreKey)
	return store.Has([]byte(name))
}

func (k Keeper) SetAuction(ctx types.Context, nftID string, auction autypes.Auction) {
	store := ctx.KVStore(k.StoreKey)
	nftIDByte := []byte(nftID)
	store.Set(nftIDByte, k.cdc.MustMarshalBinaryBare(auction))
}

func (k Keeper) DeleteAuction(ctx types.Context, nftID string) {
	store := ctx.KVStore(k.StoreKey)
	nftIDByte := []byte(nftID)
	store.Delete(nftIDByte)
}

// NewAuction creates a new auction for nfts,
func (k Keeper) NewAuction(ctx types.Context, nftID, nftDenom string, startTime, endTime time.Time) {
	auction := autypes.NewAuction(nft, startTime, endTime)
	k.SetAuction(ctx, nftID, nftDenom, auction)
}

func (k Keeper) NewBid(ctx types.Context, nftID string, bidder types.AccAddress, bid types.Coins) {
	auction, ok := k.GetAuction(ctx, nftID)
	if !ok {
		return
	}
	// check the endtime
	if auction.EndTime.Before(ctx.BlockHeader().Time) {
		autypes.ErrAuctionOver(autypes.DefaultCodespace)
		return
	}
	newBid := autypes.NewBid(bidder, bid, nftID)
	auction.ReplaceBid(newBid)
	k.SetAuction(ctx, nftID, auction)
}

// Get an iterator over all names in which the keys are the names and the values are the whois
func (k Keeper) GetAuctionsIterator(ctx types.Context) types.Iterator {
	store := ctx.KVStore(k.StoreKey)
	return types.KVStorePrefixIterator(store, nil)
}
