# 类型

我们要做的第一件事是定义一个结构，包含域名所有元数据。 依据 ICANN DNS 术语，我们之后将此结构称为 Whois。

## `types.go`

首先创建文件 `./x/nameservice/types.go` 在其内定义模块自有类型，在 Cosmos SDK 应用中，习惯上将模块相关的代码放在 `./x/` 文件夹中。

## Whois

每个域名有三个预期相关的数据：

- Value - 域名解析出为的值。这是任意字符串，但将来您可以修改它以要求它适合特定格式，例如 IP 地址，DNS 区域文件或区块链地址。
- Owner - 该域名当前所有者的地址。
- Price - 你需要为购买域名支付的费用。

要开始你的 SDK 模块，在 `nameservice/x/nameservice/types/types.go` 文件中定义 `nameservice.Whois` 结构。

```go
package nameservice

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// Whois is a struct that contains all the metadata of a name
type Whois struct {
	Value string         `json:"value"`
	Owner sdk.AccAddress `json:"owner"`
	Price sdk.Coins      `json:"price"`
}
```

在[设计](./01-app-design.md)文档中提到过，如果名称尚未有所有者，我们希望使用 MinPrice 对其进行初始化。

```go
// MinNamePrice is Initial Starting Price for a name that was never previously owned
var MinNamePrice = sdk.Coins{sdk.NewInt64Coin("nametoken", 1)}

// NewWhois returns a new Whois with the minprice as the price
func NewWhois() Whois {
	return Whois{
		Price: MinNamePrice,
	}
}
```

### 现在我们继续去编写 [Keeper](./04-keeper.md) 模块的代码。
