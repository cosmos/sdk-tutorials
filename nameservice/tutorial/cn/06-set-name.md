# SetName

## `Msg`

SDK中`Msg`的命令约束是 `Msg{.Action}`。要实现的第一个操作是`SetName`，因此命名为`MsgSetName`。此`Msg`允许域名的所有者设置该域名的解析返回值。首先在名为`./x/nameservice/msgs.go`的新文件中定义`MsgSetName`：

```go
package nameservice

import (
	"encoding/json"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

// MsgSetName defines a SetName message
type MsgSetName struct {
	Name string
	Value  string
	Owner  sdk.AccAddress
}

// NewMsgSetName is a constructor function for MsgSetName
func NewMsgSetName(name string, value string, owner sdk.AccAddress) MsgSetName {
	return MsgSetName{
		Name: name,
		Value:  value,
		Owner:  owner,
	}
}
```

`MsgSetName`具有设置域名解析值所需的三个属性：

- `name` - 所要设置的域名
- `value` - 要设置的域名解析值
- `owner` - 域名的所有者

接下来，实现`Msg`接口：

```go
// Route should return the name of the module
func (msg MsgSetName) Route() string { return "nameservice" }

// Type should return the action
func (msg MsgSetName) Type() string { return "set_name"}
```

SDK使用上述函数将`Msg`路由至合适的模块进行处理。它们还为用于索引的数据库标签添加了可读性的名称。

```go
// ValidateBasic runs stateless checks on the message
func (msg MsgSetName) ValidateBasic() sdk.Error {
	if msg.Owner.Empty() {
		return sdk.ErrInvalidAddress(msg.Owner.String())
	}
	if len(msg.Name) == 0 || len(msg.Value) == 0 {
		return sdk.ErrUnknownRequest("Name and/or Value cannot be empty")
	}
	return nil
}
```

`ValidateBasic`用于对`Msg`的有效性进行一些基本的**无状态**检查。在此情形下，请检查没有属性为空。请注意这里使用`sdk.Error`类型。 SDK提供了一组应用开发人员经常遇到的错误类型。

```go
// GetSignBytes encodes the message for signing
func (msg MsgSetName) GetSignBytes() []byte {
	b, err := json.Marshal(msg)
	if err != nil {
		panic(err)
	}
	return sdk.MustSortJSON(b)
}
```

`GetSignBytes`定义了如何编码`Msg`以进行签名。在大多数情形下，要编码成排好序的JSON。不应修改输出。

```go
// GetSigners defines whose signature is required
func (msg MsgSetName) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{msg.Owner}
}
```

`GetSigners`定义一个`Tx`上需要哪些人的签名才能使其有效。在这种情形下，`MsgSetName`要求域名所有者在尝试重置域名解析值时要对该交易签名。

## `Handler`

现在`MsgSetName`已经定义好了，下一部来定义收到此Msg时需要采取的操作。也就是`handler`所要做的。

在一个新文件(`./x/nameservice/handler.go`)先写入如下代码：

```go
package nameservice

import (
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

// NewHandler returns a handler for "nameservice" type messages.
func NewHandler(keeper Keeper) sdk.Handler {
	return func(ctx sdk.Context, msg sdk.Msg) sdk.Result {
		switch msg := msg.(type) {
		case MsgSetName:
			return handleMsgSetName(ctx, keeper, msg)
		default:
			errMsg := fmt.Sprintf("Unrecognized nameservice Msg type: %v", msg.Type())
			return sdk.ErrUnknownRequest(errMsg).Result()
		}
	}
}
```

`NewHandler`本质上是一个子路由，它将进入该模块的msg路由到正确的handler做处理。目前，只有一个 `Msg`/` Handler`。

现在，你需要定义在`handlerMsgSetName`中定义处理`MsgSetName`消息的实际逻辑：

> 注意：SDK中handler的命名规范是`handlerMsg{.Action}`

```go
// Handle a message to set name
func handleMsgSetName(ctx sdk.Context, keeper Keeper, msg MsgSetName) sdk.Result {
	if !msg.Owner.Equals(keeper.GetOwner(ctx, msg.Name)) { // Checks if the the msg sender is the same as the current owner
		return sdk.ErrUnauthorized("Incorrect Owner").Result() // If not, throw an error
	}
	keeper.SetName(ctx, msg.Name, msg.Value) // If so, set the name to the value specified in the msg.
	return sdk.Result{}                      // return
}
```

在此函数中，要检查`Msg`的发送者是否就是域名的所有者(keeper.GetOwner)。如果是，就能通过调用`Keeper`里的函数来设置域名。如果不是，则抛出错误并返回给用户。

### 很好，现在所有者可以 SetName，但在域名还没有出售时，你的模块需要有一个途径让用户购买域名。我们来一起定义 [BuyName 消息](./07-buy-name.md)。

