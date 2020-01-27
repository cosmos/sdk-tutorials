# 开始编写你的应用

首先创建一个新的文件`./app.go`。这个文件是确定性状态机的核心。在`app.go`中，你定义了应用程序在接收交易时执行的操作。但首先，它要能够以正确的顺序接收交易。这是 [Tendermint共识引擎](https://github.com/tendermint/tendermint)的职责。

引入必要的依赖：

```go
package app

import (
	"encoding/json"
	"os"

	"github.com/tendermint/tendermint/libs/log"

	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/cosmos-sdk/x/auth"

	"github.com/cosmos/cosmos-sdk/x/auth/genaccounts"

	"github.com/cosmos/cosmos-sdk/x/bank"
	distr "github.com/cosmos/cosmos-sdk/x/distribution"
	"github.com/cosmos/cosmos-sdk/x/params"
	"github.com/cosmos/cosmos-sdk/x/staking"
	"github.com/cosmos/sdk-tutorials/nameservice/x/nameservice"

	bam "github.com/cosmos/cosmos-sdk/baseapp"
	sdk "github.com/cosmos/cosmos-sdk/types"
	abci "github.com/tendermint/tendermint/abci/types"
	dbm "github.com/tendermint/tm-db"
)
```

下面是各引入模块和包的文档：

- [`log`](https://godoc.org/github.com/tendermint/tendermint/libs/log): Tendermint 的日志
- [`auth`](https://godoc.org/github.com/cosmos/cosmos-sdk/x/auth): Cosmos SDK 的`auth`模块
- [`dbm`](https://godoc.org/github.com/tendermint/tm-db): Tendermint 的数据库代码
- [`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp): 如下

这里有几个包是`tendermint`包。Tendermint 通过名为 [ABCI](https://github.com/tendermint/tendermint/tree/master/abci) 的接口将交易从网络传递给应用程序。如果你要查看正在构建的区块链节点的架构，如下所示：

```
+---------------------+
|                     |
|     Application     |
|                     |
+--------+---+--------+
         ^   |
         |   | ABCI
         |   v
+--------+---+--------+
|                     |
|                     |
|     Tendermint      |
|                     |
|                     |
+---------------------+
```

幸运的是，你不必实现ABCI接口。Cosmos SDK以[`baseapp`](https://godoc.org/github.com/cosmos/cosmos-sdk/baseapp)的形式提供了它的实现样板。

`baseapp`做了以下几点：

- 解码从 Tendermint 共识引擎接收到的交易。
- 从交易中提取 messages 并做基本的合理性校验。
- 将这些 message 路由到合适的模块使其被正确处理。注意`baseapp`并不了解你想要使用的具体模块。你要做的就是在`app.go`中声明这些模块，在接下来的教程中将会看到这些工作。`baseapp`仅实现了适用于任意模块的核心路由逻辑。
- 如果 ABCI 消息是[`DeliverTx`](https://tendermint.com/docs/spec/abci/abci.html#delivertx)（[`CheckTx`](https://tendermint.com/docs/spec/abci/abci.html#checktx)）的话就Commit。
- 帮助设置[`BeginBlock`](https://tendermint.com/docs/spec/abci/abci.html#beginblock)和[`EndBlock`](https://tendermint.com/docs/spec/abci/abci.html#endblock),这两种消息让你能定义在每个区块开始和结束时执行的逻辑。实际上，每个模块实现了各自的`BeginBlock`和`EndBlock`子逻辑，app的职责是它们都聚合起来。（_注意：你不会在你的应用程序中使用这些消息_）
- 帮助初始化你的 state。
- 帮助设置 queries。

现在你需要为应用程序创建一个新的自定义类型`nameServiceApp`。这个类型将嵌入`baseapp`（在Go中的嵌入类似于其他语言中的继承），这意味着它可以访问`baseapp`的所有方法。

```go
const appName = "nameservice"

var (
	// default home directories for the application CLI
	DefaultCLIHome = os.ExpandEnv("$HOME/.nscli")

	// DefaultNodeHome sets the folder where the applcation data and configuration will be stored
	DefaultNodeHome = os.ExpandEnv("$HOME/.nsd")

	// NewBasicManager is in charge of setting up basic module elemnets
	ModuleBasics = module.NewBasicManager()

	// account permissions
	maccPerms = map[string][]string{}
)

type nameServiceApp struct {
    *bam.BaseApp
}
```



为你的应用添加一个简单的构造函数:

```go
func NewNameServiceApp(logger log.Logger, db dbm.DB) *nameServiceApp {

    // First define the top level codec that will be shared by the different modules. Note: Codec will be explained later
    cdc := MakeCodec()

    // BaseApp handles interactions with Tendermint through the ABCI protocol
    bApp := bam.NewBaseApp(appName, logger, db, auth.DefaultTxDecoder(cdc))

    var app = &nameServiceApp{
        BaseApp: bApp,
        cdc:     cdc,
    }

    return app
}
```

很好！现在你有了应用程序的骨架；但是，仍然缺少具体功能。

`baseapp`不了解你要在应用程序中使用的路由或用户交互。应用程序的主要作用是定义这些路由。另一个作用是定义初始状态。这两件事都要求你向应用程序添加模块。

正如你在[应用设计](./01-app-design.md)章节中看到的，你的nameservice需要一组模块：`auth`，`bank`，`staking`，`distribution`，`slashing`和`nameservice`。前两个已经存在了，但最后一个还没有！`nameservice`模块将定义你的状态机的大部分内容。下一步是构建它。

### 为了完成应用程序，你需要引入一些模块。 继续[开始构建你的域名服务模块](./03-types.md) 。 稍后会回到 app.go.