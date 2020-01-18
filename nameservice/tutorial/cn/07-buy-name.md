# BuyName

## `Msg`

现在来定义购买域名的`Msg`，并加在`./x/nameservice/msgs.go`文件中。代码同`SetName`非常相似：

```go
// MsgBuyName defines the BuyName message
type MsgBuyName struct {
	Name string
	Bid    sdk.Coins
	Buyer  sdk.AccAddress
}

// NewMsgBuyName is the constructor function for MsgBuyName
func NewMsgBuyName(name string, bid sdk.Coins, buyer sdk.AccAddress) MsgBuyName {
	return MsgBuyName{
		Name: name,
		Bid:    bid,
		Buyer:  buyer,
	}
}

// Route should return the name of the module
func (msg MsgBuyName) Route() string { return "nameservice" }

// Type should return the action
func (msg MsgBuyName) Type() string { return "buy_name" }

// ValidateBasic runs stateless checks on the message
func (msg MsgBuyName) ValidateBasic() sdk.Error {
	if msg.Buyer.Empty() {
		return sdk.ErrInvalidAddress(msg.Buyer.String())
	}
	if len(msg.Name) == 0 {
		return sdk.ErrUnknownRequest("Name cannot be empty")
	}
	if !msg.Bid.IsAllPositive() {
		return sdk.ErrInsufficientCoins("Bids must be positive")
	}
	return nil
}

// GetSignBytes encodes the message for signing
func (msg MsgBuyName) GetSignBytes() []byte {
	b, err := json.Marshal(msg)
	if err != nil {
		panic(err)
	}
	return sdk.MustSortJSON(b)
}

// GetSigners defines whose signature is required
func (msg MsgBuyName) GetSigners() []sdk.AccAddress {
	return []sdk.AccAddress{msg.Buyer}
}
```

接着，在`./x/nameservice/handler.go`文件中，把`MsgBuyName`加入到模块路由器中：

```go
// NewHandler returns a handler for "nameservice" type messages.
func NewHandler(keeper Keeper) sdk.Handler {
	return func(ctx sdk.Context, msg sdk.Msg) sdk.Result {
		switch msg := msg.(type) {
		case MsgSetName:
			return handleMsgSetName(ctx, keeper, msg)
		case MsgBuyName:
			return handleMsgBuyName(ctx, keeper, msg)
		default:
			errMsg := fmt.Sprintf("Unrecognized nameservice Msg type: %v", msg.Type())
			return sdk.ErrUnknownRequest(errMsg).Result()
		}
	}
}
```

最后，定义`BuyName`的`handler`，该函数执行由msg触发的状态转换。请记住，此时msg已运行其`ValidateBasic`函数，因此已进行了一些输入验证。但是，`ValidateBasic`无法查询应用程序状态。应在`handler`中执行依赖于网络状态（例如帐户余额）的验证逻辑。

```go
// Handle a message to buy name
func handleMsgBuyName(ctx sdk.Context, keeper Keeper, msg MsgBuyName) sdk.Result {
	if keeper.GetPrice(ctx, msg.Name).IsAllGT(msg.Bid) { // Checks if the the bid price is greater than the price paid by the current owner
		return sdk.ErrInsufficientCoins("Bid not high enough").Result() // If not, throw an error
	}
	if keeper.HasOwner(ctx, msg.Name) {
		_, err := keeper.coinKeeper.SendCoins(ctx, msg.Buyer, keeper.GetOwner(ctx, msg.Name), msg.Bid)
		if err != nil {
			return sdk.ErrInsufficientCoins("Buyer does not have enough coins").Result()
		}
	} else {
		_, _, err := keeper.coinKeeper.SubtractCoins(ctx, msg.Buyer, msg.Bid) // If so, deduct the Bid amount from the sender
		if err != nil {
			return sdk.ErrInsufficientCoins("Buyer does not have enough coins").Result()
		}
	}
	keeper.SetOwner(ctx, msg.Name, msg.Buyer)
	keeper.SetPrice(ctx, msg.Name, msg.Bid)
	return sdk.Result{}
}
```

首先确保出价高于当前价格。然后，检查域名是否已有所有者。如果有，之前的所有者将会收到`Buyer`的钱。

如果没有所有者，你的`nameservice`模块会把`Buyer`的资金“燃烧”（即发送到不可恢复的地址）。

如果`SubtractCoins`或`SendCoins`返回一个非空错误，handler会抛出一个错误，回退状态转变。没有的话，使用之前在`Keeper`上定义的 getter 和 setter，handler 将买方设置为新所有者，并将新价格设置为当前出价。

> 注意：此handler使用`coinKeeper`中的函数执行货币相关操作。如果你的应用程序正在执行货币相关操作，你可能需要查看此模块的[文档](https://godoc.org/github.com/cosmos/cosmos-sdk/x/bank#BaseKeeper)，以查看它提供的功能。

###  现在已经有了 `Msgs` and `Handlers` 定义，是时候学习如何使交易中的数据能被[查询](./08-queriers.md)到！