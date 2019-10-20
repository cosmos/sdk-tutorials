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
		storeKey:   sKey,
		cdc:        cdc,
	}
}

func (k Keeper) GetAuction(ctx types.Context, name string) autypes.Auction {
	store := ctx.KVStore(k.storeKey)
	nameByte := []byte(name)
	if !k.hasAuction(ctx, nameByte) {
		return nil
	}
	bz := store.Get(nameByte)
	var auction autypes.Auction
	k.cdc.MustUnmarshalBinaryBare(bz, &auction)
	return auction
}

func (k Keeper) hasAuction(ctx types.Context, name []byte) bool {
	store := ctx.KVStore(k.storeKey)
	return store.Has([]byte(name))
}

func (k Keeper) SetAuction(ctx types.Context, name string, auction autypes.Auction) {
	store := ctx.KVStore(k.storeKey)
	nameByte := []byte(name)
	store.Set(nameByte, k.cdc.MustMarshalBinaryBare(auction))
}

func (k Keeper) DeleteAuction(ctx types.Context, name string) {
	store := ctx.KVStore(k.storeKey)
	nameByte := []byte(name)
	store.Delete(nameByte)
}

// NewAuction creates a new auction for nfts,
func (k Keeper) NewAuction(ctx types.Context, name string, nftDenom, nftID string, startTime, endTime time.Time, owner types.AccAddress) {
	nft, _ := k.NftKeeper.GetNft(ctx, nftDenom, nftID)

	// check that the owner of the nft is the one creating the auction
	if nft.GetOwner() != owner {
		return
	}
	auction := autypes.NewAuction(nft, startTime, endTime)
	k.SetAuction(ctx, name, auction)
}

func (k Keeper) NewBid(ctx types.Context, name string, newB autypes.Bid) {
	auction := k.GetAuction(ctx, name)
	// check the endtime
	if auction.endTime < ctx.BlockHeader().Time {
		autypes.ErrAuctionOver(autypes.DefaultCodespace)
		return
	}
	auction.ReplaceBid(newB)
	k.SetAuction(ctx, name, auction)
}

// Get an iterator over all names in which the keys are the names and the values are the whois
func (k Keeper) GetAuctionsIterator(ctx types.Context) types.Iterator {
	store := ctx.KVStore(k.storeKey)
	return types.KVStorePrefixIterator(store, nil)
}
