package keeper

import (
	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/user/pofe/x/pofe/types""
	"strconv"
)

// GetClaimCount get the total number of claim
func (k Keeper) GetClaimCount(ctx sdk.Context) int64 {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.ClaimCountKey))
	byteKey := types.KeyPrefix(types.ClaimCountKey)
	bz := store.Get(byteKey)

	// Count doesn't exist: no element
	if bz == nil {
		return 0
	}

	// Parse bytes
	count, err := strconv.ParseInt(string(bz), 10, 64)
	if err != nil {
		// Panic because the count should be always formattable to int64
		panic("cannot decode count")
	}

	return count
}

// SetClaimCount set the total number of claim
func (k Keeper) SetClaimCount(ctx sdk.Context, count int64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.ClaimCountKey))
	byteKey := types.KeyPrefix(types.ClaimCountKey)
	bz := []byte(strconv.FormatInt(count, 10))
	store.Set(byteKey, bz)
}

func (k Keeper) CreateClaim(ctx sdk.Context, msg types.MsgCreateClaim) {
	// Create the claim
	count := k.GetClaimCount(ctx)
	var claim = types.Claim{
		Creator: msg.Creator,
		Id:      strconv.FormatInt(count, 10),
		Proof:   msg.Proof,
	}

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.ClaimKey))
	key := types.KeyPrefix(types.ClaimKey + claim.Id)
	value := k.cdc.MustMarshalBinaryBare(&claim)
	store.Set(key, value)

	// Update claim count
	k.SetClaimCount(ctx, count+1)
}

func (k Keeper) UpdateClaim(ctx sdk.Context, claim types.Claim) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.ClaimKey))
	b := k.cdc.MustMarshalBinaryBare(&claim)
	store.Set(types.KeyPrefix(types.ClaimKey+claim.Id), b)
}

func (k Keeper) GetClaim(ctx sdk.Context, key string) types.Claim {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.ClaimKey))
	var claim types.Claim
	k.cdc.MustUnmarshalBinaryBare(store.Get(types.KeyPrefix(types.ClaimKey+key)), &claim)
	return claim
}

func (k Keeper) HasClaim(ctx sdk.Context, id string) bool {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.ClaimKey))
	return store.Has(types.KeyPrefix(types.ClaimKey + id))
}

func (k Keeper) GetClaimOwner(ctx sdk.Context, key string) string {
	return k.GetClaim(ctx, key).Creator
}

// DeleteClaim deletes a claim
func (k Keeper) DeleteClaim(ctx sdk.Context, key string) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.ClaimKey))
	store.Delete(types.KeyPrefix(types.ClaimKey + key))
}

func (k Keeper) GetAllClaim(ctx sdk.Context) (msgs []types.Claim) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.ClaimKey))
	iterator := sdk.KVStorePrefixIterator(store, types.KeyPrefix(types.ClaimKey))

	defer iterator.Close()

	for ; iterator.Valid(); iterator.Next() {
		var msg types.Claim
		k.cdc.MustUnmarshalBinaryBare(iterator.Value(), &msg)
		msgs = append(msgs, msg)
	}

	return
}
