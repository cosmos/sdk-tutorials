package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"

	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/sdk-tutorials/proof-of-file-existence/pofe/x/pofe/types"
)

// CreateClaim creates a claim
func (k Keeper) CreateClaim(ctx sdk.Context, claim types.Claim) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.ClaimPrefix + claim.Proof)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(claim)
	store.Set(key, value)
}

// GetClaim returns the claim information
func (k Keeper) GetClaim(ctx sdk.Context, key string) (types.Claim, error) {
	store := ctx.KVStore(k.storeKey)
	var claim types.Claim
	byteKey := []byte(types.ClaimPrefix + key)
	err := k.cdc.UnmarshalBinaryLengthPrefixed(store.Get(byteKey), &claim)
	if err != nil {
		return claim, err
	}
	return claim, nil
}

// SetClaim sets a claim
func (k Keeper) SetClaim(ctx sdk.Context, claim types.Claim) {
	claimKey := claim.Proof
	store := ctx.KVStore(k.storeKey)
	bz := k.cdc.MustMarshalBinaryLengthPrefixed(claim)
	key := []byte(types.ClaimPrefix + claimKey)
	store.Set(key, bz)
}

// DeleteClaim deletes a claim
func (k Keeper) DeleteClaim(ctx sdk.Context, key string) {
	store := ctx.KVStore(k.storeKey)
	store.Delete([]byte(types.ClaimPrefix + key))
}

//
// Functions used by querier
//

func listClaim(ctx sdk.Context, k Keeper) ([]byte, error) {
	var claimList []types.Claim
	store := ctx.KVStore(k.storeKey)
	iterator := sdk.KVStorePrefixIterator(store, []byte(types.ClaimPrefix))
	for ; iterator.Valid(); iterator.Next() {
		var claim types.Claim
		k.cdc.MustUnmarshalBinaryLengthPrefixed(store.Get(iterator.Key()), &claim)
		claimList = append(claimList, claim)
	}
	res := codec.MustMarshalJSONIndent(k.cdc, claimList)
	return res, nil
}

func getClaim(ctx sdk.Context, path []string, k Keeper) (res []byte, sdkError error) {
	key := path[0]
	claim, err := k.GetClaim(ctx, key)
	if err != nil {
		return nil, err
	}

	res, err = codec.MarshalJSONIndent(k.cdc, claim)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}

// Get creator of the item
func (k Keeper) GetClaimOwner(ctx sdk.Context, key string) sdk.AccAddress {
	claim, err := k.GetClaim(ctx, key)
	if err != nil {
		return nil
	}
	return claim.Creator
}

// Check if the key exists in the store
func (k Keeper) ClaimExists(ctx sdk.Context, key string) bool {
	store := ctx.KVStore(k.storeKey)
	return store.Has([]byte(types.ClaimPrefix + key))
}
