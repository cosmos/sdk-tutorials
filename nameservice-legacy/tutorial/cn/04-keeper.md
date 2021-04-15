# Keeper

Cosmos SDK模块的主要核心是名为`Keeper`的部分。它处理同存储的交互，引用其他的keeper进行跨模块的交互，并包含模块的大部分核心功能。

首先创建文件`./x/nameservice/keeper.go`来保存模块的keeper。在 Cosmos SDK 应用程序中，模块通常放在`./x/`文件夹中。

## Keeper结构

开始制作你的SDK模块，请在`./x/nameservice/keeper.go`文件中定义`nameservice.Keeper`：

```go
package nameservice

import (
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/x/bank"
	"github.com/cosmos/sdk-tutorials/nameservice/x/nameservice/types"
)

// Keeper maintains the link to data storage and exposes getter/setter methods for the various parts of the state machine
type Keeper struct {
	CoinKeeper bank.Keeper

	storeKey  sdk.StoreKey // Unexposed key to access store from sdk.Context

	cdc *codec.Codec // The wire codec for binary encoding/decoding.
}
```



关于上述代码的几点说明：

- 3个不同的`cosmos-sdk`包被引入：
  - [`codec`](https://godoc.org/github.com/cosmos/cosmos-sdk/codec) - 提供负责Cosmos编码格式的工具——[Amino](https://github.com/tendermint/go-amino)。
  - [`bank`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/bank) - `bank`模块控制账户和转账。
  - [`types`](https://godoc.org/github.com/cosmos/cosmos-sdk/types) - `types`包含了整个SDK常用的类型。
- `Keeper`结构体。在 keeper 中有几个关键部分：
  - [`bank.Keeper`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/bank#Keeper) : 这是`bank`模块的`Keeper`引用。包括它来允许该模块中的代码调用`bank`模块的函数。SDK使用[`对象能力`](https://en.wikipedia.org/wiki/Object-capability_model)来访问应用程序状态的各个部分。这是为了允许开发人员采用小权限准入原则，限制错误或恶意模块的去影响其不需要访问的状态的能力。
  - [`*codec.Codec`](https://godoc.org/github.com/cosmos/cosmos-sdk/codec#Codec) : 这是被Amino用于编码及解码二进制机构的编码解码器的指针。
  - [`sdk.StoreKey`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#StoreKey) : 通过它来访问一个持久化保存你的应用程序状态的`sdk.KVStore`。
- 模块有1个StoreKey:
  - `storeKey` - 这是 name 指向（如 `map[name]Whois`）Whois 结构的主存储空间，

## Getter 和 Setter

现在要添加通过`Keeper`来与存储交互的方法了。首先，添加一个函数来为指定域名设置解析字符串值：

```go
// Sets the entire Whois metadata struct for a name
func (k Keeper) SetWhois(ctx sdk.Context, name string, whois Whois) {
	if whois.Owner.Empty() {
		return
	}
	store := ctx.KVStore(k.storeKey)
	store.Set([]byte(name), k.cdc.MustMarshalBinaryBare(whois))
}
```

在此方法中，首先使用`Keeper`中的`namesStoreKey`获取`map[name]value`的存储对象。

> 注意：这个函数使用[`sdk.Context`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#Context)。该对象持有访问像`blockHeight`和`chainID`这样重要部分状态的函数。

接下来，你可以使用方法`.Set([]byte,[]byte)`向存储中插入`<name, value>`键值对。由于存储只接受`[]byte`,想要把`string`转化成`[]byte`再把它们作为参数传给`Set`方法。

接下来，添加一个函数来解析域名（即查找域名对应的解析值）：

```go
// Gets the entire Whois metadata struct for a name
func (k Keeper) GetWhois(ctx sdk.Context, name string) Whois {
	store := ctx.KVStore(k.storeKey)
	if !store.Has([]byte(name)) {
		return NewWhois()
	}
	bz := store.Get([]byte(name))
	var whois Whois
	k.cdc.MustUnmarshalBinaryBare(bz, &whois)
	return whois
}
```

这里，与`SetName`方法一样，首先使用`StoreKey`访问存储。接下来，不使用使用`.Get([] byte) []byte`方法而不是`Set`方法。向函数传参，传递key值，要把`name`字符串转化成`[]byte`，并以`[]byte`的形式返回结果。将此转换成字符串再返回。

如果一个域名尚未在存储中，它返回一个新的 Whois 信息，包含最低价格 MinPrice。

现在，我们添加了根据名称从 store 获取特定参数的功能。 我们重用了 GetWhois 和 SetWhois 函数，而不是重写 store 的 getter 和 setter。 例如，要设置字段，首先我们获取整个 Whois 数据，更新我们的特定字段，然后将新版本放回 store。

```go
// ResolveName - returns the string that the name resolves to
func (k Keeper) ResolveName(ctx sdk.Context, name string) string {
	return k.GetWhois(ctx, name).Value
}

// SetName - sets the value string that a name resolves to
func (k Keeper) SetName(ctx sdk.Context, name string, value string) {
	whois := k.GetWhois(ctx, name)
	whois.Value = value
	k.SetWhois(ctx, name, whois)
}

// HasOwner - returns whether or not the name already has an owner
func (k Keeper) HasOwner(ctx sdk.Context, name string) bool {
	return !k.GetWhois(ctx, name).Owner.Empty()
}

// GetOwner - get the current owner of a name
func (k Keeper) GetOwner(ctx sdk.Context, name string) sdk.AccAddress {
	return k.GetWhois(ctx, name).Owner
}

// SetOwner - sets the current owner of a name
func (k Keeper) SetOwner(ctx sdk.Context, name string, owner sdk.AccAddress) {
	whois := k.GetWhois(ctx, name)
	whois.Owner = owner
	k.SetWhois(ctx, name, whois)
}

// GetPrice - gets the current price of a name.  If price doesn't exist yet, set to 1nametoken.
func (k Keeper) GetPrice(ctx sdk.Context, name string) sdk.Coins {
	return k.GetWhois(ctx, name).Price
}

// SetPrice - sets the current price of a name
func (k Keeper) SetPrice(ctx sdk.Context, name string, price sdk.Coins) {
	whois := k.GetWhois(ctx, name)
	whois.Price = price
	k.SetWhois(ctx, name, whois)
}
```

SDK 还有一个特性叫 `sdk.Iterator`，可以返回一个迭代器用于遍历指定 store 中的所有  `<Key, Value>` 对。

我们增加一个函数用于获取遍历 store 中所有已知域名的迭代器。

```go
// Get an iterator over all names in which the keys are the names and the values are the whois
func (k Keeper) GetNamesIterator(ctx sdk.Context) sdk.Iterator {
	store := ctx.KVStore(k.storeKey)
	return sdk.KVStorePrefixIterator(store, []byte{})
}
```

最后需要在`./x/nameservice/keeper.go`文件中加上`Keeper`的构造函数：

```go
// NewKeeper creates new instances of the nameservice Keeper
func NewKeeper(coinKeeper bank.Keeper, storeKey sdk.StoreKey, cdc *codec.Codec) Keeper {
	return Keeper{
		coinKeeper: coinKeeper,
		storeKey:   storeKey,
		cdc:        cdc,
	}
}
```

###  接下来，该描述如何让用户通过  [`Msgs` and `Handlers `](./05-msgs-handlers.md) 与刚刚建立的 store 交互。