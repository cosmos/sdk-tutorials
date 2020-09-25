## 开始

在本教程中，你将构建一个功能性的 [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) 应用。过程中能学习基本的概念和 SDK 的结构。该示例将展示如何基于 Cosmos SDK 快速、轻松地**从头开始构建自己的区块链**。

在本章教程结束时，你会得到一个功能性的`nameservice`应用，一个字符串对字符串的映射关系表(`map[string]string`)。类似于[Namecoin](https://namecoin.org/)，[ENS](https://ens.domains/)，[Handshake](https://handshake.org/)这些模仿传统的 DNS 系统（`map[domain]zonefile`）的应用。用户可以购买未被使用的域名，或是出售/交易这些域名。

本教程的所有最终源代码都在此[目录](https://github.com/cosmos/sdk-tutorials/nameservice)（并编译）。但是，最好手动完成并尝试自己构建项目！

### 需要

- 安装 [`golang` >1.13.0](https://golang.org/doc/install)
- 生效的[`$GOPATH`](https://github.com/golang/go/wiki/SettingGOPATH)
- 创造属于你自己区块链的意愿！

### 教程

通过本章教程你将创建如下的文件来组成你的应用:

```
./nameservice
├── Makefile
├── Makefile.ledger
├── app.go
├── cmd
│   ├── nscli
│   │   └── main.go
│   └── nsd
│       └── main.go
├── go.mod
├── go.sum
└── x
    └── nameservice
        ├── alias.go
        ├── client
        │   ├── cli
        │   │   ├── query.go
        │   │   └── tx.go
        │   └── rest
        │       ├── query.go
        │       ├── rest.go
        │       └── tx.go
        ├── genesis.go
        ├── handler.go
        ├── keeper
        │   ├── keeper.go
        │   └── querier.go
        ├── types
        │   ├── codec.go
        │   ├── errors.go
        │   ├── key.go
        │   ├── msgs.go
        │   ├── querier.go
        │   └── types.go
        └── module.go
```

首先创建一个新的 git 仓库：

```bash
mkdir -p $GOPATH/src/github.com/{ .Username }/nameservice
cd $GOPATH/src/github.com/{ .Username }/nameservice
git init
```

然后继续！第一步描述了设计你的应用。如果要直接跳转到编码部分，你可以从[第二步]()开始。

#### 教程部分

1. [设计](./01-app-design.md) 应用程序。
2. 从[`./app.go`](./02-app-init.md) 开始实现你的应用。
3. Start building your module by defining some basic [`Types`](./03-types.md).
4. 开始用[`Keeper`](./04-keeper.md)构建你的模块。
5. 通过[`Msg`和`Handler`](./05-msgs-handlers.md)定义状态转变。
   - [`SetName`](./06-set-name.md)
   - [`BuyName`](./07-buy-name.md)
6. 使用[`Querier`](./08-queriers.md)给你的状态机创建视图。
7. 使用[`sdk.Codec`](./09-codec.md)注册你的 types 到编码格式中。
8. 创建[你的模块的 CLI 交互](./10-cli.md)。
9. 创建[客户端访问你的 nameservice 的 HTTP 路径](./11-rest.md)。
10. 导入你的模块并[编译你的应用](./12-app-complete.md)!
11. 创建你的应用的[`nsd`和`nscli`入口](./13-entrypoint.md)。
12. 安装[依赖管理工具`go.mod`](./14-dep.md)。
13. [编译并启动](./15-build-run.md)示例项目。
14. [启动 REST 路径](./16-run-rest.md)。
