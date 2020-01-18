## Codec文件

[在Amino中注册你的数据类型](https://github.com/tendermint/go-amino#registering-types)使得它们能够被编码/解码，有一些代码需要放在`./x/nameservice/codec.go`中。你创建的任何接口和实现接口的任何结构都需要在`RegisterCodec`函数中声明。在此模块中，需要注册两个`Msg`的实现（`SetName`和`BuyName`），但你的`Whois`查询返回的类型不需要：

```go
package nameservice

import (
	"github.com/cosmos/cosmos-sdk/codec"
)

// RegisterCodec registers concrete types on wire codec
func RegisterCodec(cdc *codec.Codec) {
	cdc.RegisterConcrete(MsgSetName{}, "nameservice/SetName", nil)
	cdc.RegisterConcrete(MsgBuyName{}, "nameservice/BuyName", nil)
}
```

### 接下来需要为你的模块定义 [CLI 交互](./10-cli.md)了。

