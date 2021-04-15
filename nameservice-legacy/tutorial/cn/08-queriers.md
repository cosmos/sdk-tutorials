# Querier

首先创建`./x/nameservice/querier.go`文件。在这里定义应用程序用户可以对那些状态进行查询。你的`nameservice`模块会暴露两个querier:

- `resolve` : 传入一个`域名`返回`nameservice`给定的`解析值`。类似于DNS查询。
- `whois` : 传入一个`域名`返回`价格`，`解析值`和域名的`所有者`。用于确定你想要购买名称的成本。

首先定义`NewQuerier`函数，该函数充当查询此模块的子路由器（类似于`NewHandler`函数）。请注意，因为querier没有类似于Msg的接口，所以需要手动定义switch语句（它们无法从query.Route()函数中删除）：

```go
package nameservice

import (
	"fmt"
	"strings"

	"github.com/cosmos/cosmos-sdk/codec"

	sdk "github.com/cosmos/cosmos-sdk/types"
	abci "github.com/tendermint/tendermint/abci/types"
)

// query endpoints supported by the nameservice Querier
const (
	QueryResolve = "resolve"
	QueryWhois   = "whois"
	QueryNames   = "names"
)

// NewQuerier is the module level router for state queries
func NewQuerier(keeper Keeper) sdk.Querier {
	return func(ctx sdk.Context, path []string, req abci.RequestQuery) (res []byte, err error) {
		switch path[0] {
		case QueryResolve:
			return queryResolve(ctx, path[1:], req, keeper)
		case QueryWhois:
			return queryWhois(ctx, path[1:], req, keeper)
		case QueryNames:
			return queryNames(ctx, req, keeper)
		default:
			return nil, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "unknown nameservice query endpoint")
		}
	}
}
```

现在已定义路由器，为每个查询定义输入和响应：

```go
// nolint: unparam
func queryResolve(ctx sdk.Context, path []string, req abci.RequestQuery, keeper Keeper) ([]byte, error) {
	value := keeper.ResolveName(ctx, path[0])

	if value == "" {
		return []byte{}, sdkerrors.Wrap(sdkerrors.ErrUnknownRequest, "could not resolve name")
	}

	res, err := codec.MarshalJSONIndent(keeper.cdc, types.QueryResResolve{Value: value})
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}

// Query Result Payload for a resolve query
type QueryResResolve struct {
	Value string `json:"value"`
}

// implement fmt.Stringer
func (r QueryResResolve) String() string {
	return r.Value
}

// nolint: unparam
func queryWhois(ctx sdk.Context, path []string, req abci.RequestQuery, keeper Keeper) ([]byte, error) {
	whois := keeper.GetWhois(ctx, path[0])

	res, err := codec.MarshalJSONIndent(keeper.cdc, whois)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}

// implement fmt.Stringer
func (w Whois) String() string {
	return strings.TrimSpace(fmt.Sprintf(`Owner: %s
Value: %s
Price: %s`, w.Owner, w.Value, w.Price))
}

func queryNames(ctx sdk.Context, req abci.RequestQuery, keeper Keeper) ([]byte, error) {
	var namesList types.QueryResNames

	iterator := keeper.GetNamesIterator(ctx)

	for ; iterator.Valid(); iterator.Next() {
		namesList = append(namesList, string(iterator.Key()))
	}

	res, err := codec.MarshalJSONIndent(keeper.cdc, namesList)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return res, nil
}

// Query Result Payload for a names query
type QueryResNames []string

// implement fmt.Stringer
func (n QueryResNames) String() string {
	return strings.Join(n[:], "\n")
}
```

上述代码中要注意：

- 在这里你的`Keeper`的 getter 和 setter 方法被大量使用。在构建使用此模块的任何其他应用程序时，你可能需要返回并定义更多getter/setter以访问所需的状态。
- 按照惯例，每个输出类型都应该是 JSON marshallable 和 stringable（实现 Golang fmt.Stringer 接口）。 返回的字节应该是输出结果的JSON编码。
  - 因此，对于输出类型的解析，我们将解析字符串包装在一个名为 QueryResResolve 的结构中，该结构既是JSON marshallable 的又有.String（）方法。
  - 对于 Whois 的输出，正常的 Whois 结构已经是 JSON marshallable 的，但我们需要在其上添加.String（）方法。
  - 名称查询的输出也一样，[]字符串本身已经可 marshallable ，但我们需要在其上添加.String（）方法。

###  既然你有办法改变和查看模块状态，那么现在是时候完成它了！ 接下来以[Amino编码](./09-codec.md)格式注册类型！