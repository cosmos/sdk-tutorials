# Msg 和 Handler

现在你已经设置了`Keeper`，是时候构建允许用户购买域名和设置解析值的`Msg`和`Handler`了。

## Msg

`Msg`触发状态转变。`Msgs`被包裹在客户端提交至网络的[`Txs`](https://github.com/cosmos/cosmos-sdk/blob/develop/types/tx_msg.go#L34-L38)中。Cosmos SDK从`Txs`中打包和解包来自`Msgs`，这就意味着，作为一个应用开发者，你只需要去定义`Msgs`。`Msgs`必须要满足下面的接口（我们会在下一小节实现）:

```go
// Transactions messages must fulfill the Msg
type Msg interface {
	// Return the message type.
	// Must be alphanumeric or empty.
	Type() string

	// Returns a human-readable string for the message, intended for utilization
	// within tags
	Route() string

	// ValidateBasic does a simple validation check that
	// doesn't require access to any other information.
	ValidateBasic() Error

	// Get the canonical byte representation of the Msg.
	GetSignBytes() []byte

	// Signers returns the addrs of signers that must sign.
	// CONTRACT: All signatures must be present to be valid.
	// CONTRACT: Returns addrs in some deterministic order.
	GetSigners() []AccAddress
}
```

## Handler

`Handler`定义了在接收到一个特定`Msg`时，需要采取的操作（哪些存储需要更新，怎样更新及要满足什么条件）。

在此模块中，你有两种类型的`Msg`，用户可以发送这些`Msg`来和应用程序状态进行交互：`SetName`和`BuyName`。它们各自同其`Handler`关联。

###  现在你已经更好地理解了 Msgs 和 Handler，可以开始构建你的第一条消息：[`SetName`](06-set-name.md)。

