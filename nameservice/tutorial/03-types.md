---
order: 3
---

# Types

First thing we're going to do is create a type in the `/x/nameservice` folder with the `starport` tool using the following command:


```bash
starport type whois name price:int
```

Currently, we're only passing two values when scaffolding the `whois` type, because there are additional fields that we will be replacing. In all uses of `whois`, we'll be replacing the `Creator` field with `Owner` to reflect ownership of the name.

## Replace Creator with Owner

The first place to look at the scaffolded code for change is the protofiles.

Replace `creator` with `owner` in the protofile at `/proto/nameservice/whois.proto`.

```proto
message Whois {
  string owner = 1;
  uint64 id = 2;
  string name = 3; 
  int32 price = 4; 
}
```

The second protofile to make the changes located at `proto/nameservice/tx.proto`.

Make the same changes for the `message`s at `MsgCreateWhois`, `MsgUpdateWhois` and `MsgDeleteWhois`.

The `x/nameservice/types` folder will hold custom types for the module, and you should see the file that has been scaffolded `messages_whois.go`.

Change `creator` to `owner` in the `x/nameservice/types/messages_whois.go` file.

```go
package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgCreateWhois{}

func NewMsgCreateWhois(owner string, name string, price int32) *MsgCreateWhois {
	return &MsgCreateWhois{
		Owner: owner,
		Name:  name,
		Price: price,
	}
}

func (msg *MsgCreateWhois) Route() string {
	return RouterKey
}

func (msg *MsgCreateWhois) Type() string {
	return "CreateWhois"
}

func (msg *MsgCreateWhois) GetSigners() []sdk.AccAddress {
	owner, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{owner}
}

func (msg *MsgCreateWhois) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgCreateWhois) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid owner address (%s)", err)
	}
	return nil
}

var _ sdk.Msg = &MsgUpdateWhois{}

func NewMsgUpdateWhois(owner string, id uint64, name string, price int32) *MsgUpdateWhois {
	return &MsgUpdateWhois{
		Id:    id,
		Owner: owner,
		Name:  name,
		Price: price,
	}
}

func (msg *MsgUpdateWhois) Route() string {
	return RouterKey
}

func (msg *MsgUpdateWhois) Type() string {
	return "UpdateWhois"
}

func (msg *MsgUpdateWhois) GetSigners() []sdk.AccAddress {
	owner, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{owner}
}

func (msg *MsgUpdateWhois) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgUpdateWhois) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid owner address (%s)", err)
	}
	return nil
}

var _ sdk.Msg = &MsgCreateWhois{}

func NewMsgDeleteWhois(owner string, id uint64) *MsgDeleteWhois {
	return &MsgDeleteWhois{
		Id:    id,
		Owner: owner,
	}
}
func (msg *MsgDeleteWhois) Route() string {
	return RouterKey
}

func (msg *MsgDeleteWhois) Type() string {
	return "DeleteWhois"
}

func (msg *MsgDeleteWhois) GetSigners() []sdk.AccAddress {
	owner, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		panic(err)
	}
	return []sdk.AccAddress{owner}
}

func (msg *MsgDeleteWhois) GetSignBytes() []byte {
	bz := ModuleCdc.MustMarshalJSON(msg)
	return sdk.MustSortJSON(bz)
}

func (msg *MsgDeleteWhois) ValidateBasic() error {
	_, err := sdk.AccAddressFromBech32(msg.Owner)
	if err != nil {
		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid owner address (%s)", err)
	}
	return nil
}
```

The last place to change `creator` to `owner` is in the `keeper` directory.
First, the `x/nameservice/keeper/whois.go` file.

```go
package keeper

import (
	"encoding/binary"
	"strconv"

	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/username/nameservice/x/nameservice/types"
)

// GetWhoisCount get the total number of whois
func (k Keeper) GetWhoisCount(ctx sdk.Context) uint64 {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisCountKey))
	byteKey := types.KeyPrefix(types.WhoisCountKey)
	bz := store.Get(byteKey)

	// Count doesn't exist: no element
	if bz == nil {
		return 0
	}

	// Parse bytes
	count, err := strconv.ParseUint(string(bz), 10, 64)
	if err != nil {
		// Panic because the count should be always formattable to iint64
		panic("cannot decode count")
	}

	return count
}

// SetWhoisCount set the total number of whois
func (k Keeper) SetWhoisCount(ctx sdk.Context, count uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisCountKey))
	byteKey := types.KeyPrefix(types.WhoisCountKey)
	bz := []byte(strconv.FormatUint(count, 10))
	store.Set(byteKey, bz)
}

// AppendWhois appends a whois in the store with a new id and update the count
func (k Keeper) AppendWhois(
	ctx sdk.Context,
	owner string,
	name string,
	price int32,
) uint64 {
	// Create the whois
	count := k.GetWhoisCount(ctx)
	var whois = types.Whois{
		Owner: owner,
		Id:    count,
		Name:  name,
		Price: price,
	}

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	value := k.cdc.MustMarshalBinaryBare(&whois)
	store.Set(GetWhoisIDBytes(whois.Id), value)

	// Update whois count
	k.SetWhoisCount(ctx, count+1)

	return count
}

// SetWhois set a specific whois in the store
func (k Keeper) SetWhois(ctx sdk.Context, whois types.Whois) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	b := k.cdc.MustMarshalBinaryBare(&whois)
	store.Set(GetWhoisIDBytes(whois.Id), b)
}

// GetWhois returns a whois from its id
func (k Keeper) GetWhois(ctx sdk.Context, id uint64) types.Whois {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	var whois types.Whois
	k.cdc.MustUnmarshalBinaryBare(store.Get(GetWhoisIDBytes(id)), &whois)
	return whois
}

// HasWhois checks if the whois exists in the store
func (k Keeper) HasWhois(ctx sdk.Context, id uint64) bool {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	return store.Has(GetWhoisIDBytes(id))
}

// GetWhoisOwner returns the owner of the whois
func (k Keeper) GetWhoisOwner(ctx sdk.Context, id uint64) string {
	return k.GetWhois(ctx, id).Owner
}

// RemoveWhois removes a whois from the store
func (k Keeper) RemoveWhois(ctx sdk.Context, id uint64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	store.Delete(GetWhoisIDBytes(id))
}

// GetAllWhois returns all whois
func (k Keeper) GetAllWhois(ctx sdk.Context) (list []types.Whois) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.WhoisKey))
	iterator := sdk.KVStorePrefixIterator(store, []byte{})

	defer iterator.Close()

	for ; iterator.Valid(); iterator.Next() {
		var val types.Whois
		k.cdc.MustUnmarshalBinaryBare(iterator.Value(), &val)
		list = append(list, val)
	}

	return
}

// GetWhoisIDBytes returns the byte representation of the ID
func GetWhoisIDBytes(id uint64) []byte {
	bz := make([]byte, 8)
	binary.BigEndian.PutUint64(bz, id)
	return bz
}

// GetWhoisIDFromBytes returns ID in uint64 format from a byte array
func GetWhoisIDFromBytes(bz []byte) uint64 {
	return binary.BigEndian.Uint64(bz)
}

```

Second, the `x/nameservice/keeper/msg_server_whois.go` file.

```go
package keeper

import (
	"context"
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	"github.com/username/nameservice/x/nameservice/types"
)

func (k msgServer) CreateWhois(goCtx context.Context, msg *types.MsgCreateWhois) (*types.MsgCreateWhoisResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	id := k.AppendWhois(
		ctx,
		msg.Owner,
		msg.Name,
		msg.Price,
	)

	return &types.MsgCreateWhoisResponse{
		Id: id,
	}, nil
}

func (k msgServer) UpdateWhois(goCtx context.Context, msg *types.MsgUpdateWhois) (*types.MsgUpdateWhoisResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	var whois = types.Whois{
		Owner: msg.Owner,
		Id:    msg.Id,
		Name:  msg.Name,
		Price: msg.Price,
	}

	// Checks that the element exists
	if !k.HasWhois(ctx, msg.Id) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrKeyNotFound, fmt.Sprintf("key %d doesn't exist", msg.Id))
	}

	// Checks if the the msg sender is the same as the current owner
	if msg.Owner != k.GetWhoisOwner(ctx, msg.Id) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "incorrect owner")
	}

	k.SetWhois(ctx, whois)

	return &types.MsgUpdateWhoisResponse{}, nil
}

func (k msgServer) DeleteWhois(goCtx context.Context, msg *types.MsgDeleteWhois) (*types.MsgDeleteWhoisResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)

	if !k.HasWhois(ctx, msg.Id) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrKeyNotFound, fmt.Sprintf("key %d doesn't exist", msg.Id))
	}
	if msg.Owner != k.GetWhoisOwner(ctx, msg.Id) {
		return nil, sdkerrors.Wrap(sdkerrors.ErrUnauthorized, "incorrect owner")
	}

	k.RemoveWhois(ctx, msg.Id)

	return &types.MsgDeleteWhoisResponse{}, nil
}

```

You have now touched and seen most places that are relevant to a new scaffolded message.
Continue with the Whois implementation logic.

## Whois

Each name will have three pieces of data associated with it.

- Name - The name that gets resolved. This is just an arbitrary string, but in the future you can modify this to require it fitting a specific format, such as an IP address, DNS Zone file, or blockchain address.
- Owner - The address of the current owner of the name
- Price - The price you will need to pay in order to buy the name

As mentioned in the [Design doc](./01-app-design.md) you want to initialize a new whois entry with a MinPrice.

