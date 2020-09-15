package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/sdk-tutorials/starport-scavenge/scavenge/x/scavenge/types"
  "github.com/cosmos/cosmos-sdk/codec"
)

func (k Keeper) CreateScavenge(ctx sdk.Context, scavenge types.Scavenge) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.ScavengePrefix + scavenge.ID)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(scavenge)
	store.Set(key, value)
}

func listScavenge(ctx sdk.Context, k Keeper) ([]byte, error) {
  var scavengeList []types.Scavenge
  store := ctx.KVStore(k.storeKey)
  iterator := sdk.KVStorePrefixIterator(store, []byte(types.ScavengePrefix))
  for ; iterator.Valid(); iterator.Next() {
    var scavenge types.Scavenge
    k.cdc.MustUnmarshalBinaryLengthPrefixed(store.Get(iterator.Key()), &scavenge)
    scavengeList = append(scavengeList, scavenge)
  }
  res := codec.MustMarshalJSONIndent(k.cdc, scavengeList)
  return res, nil
}