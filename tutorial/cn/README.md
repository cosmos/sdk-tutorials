## 开始

在本教程中，你将构建一个功能性的 [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) 应用。过程中能学习基本的概念和SDK的结构。该示例将展示如何基于 Cosmos SDK 快速、轻松地**从头开始构建自己的区块链**。

在本章教程结束时，你会得到一个功能性的`nameservice`应用，一个字符串对字符串的映射关系表(`map[string]string`)。类似于[Namecoin](https://namecoin.org/)，[ENS](https://ens.domains/)，[Handshake](https://handshake.org/)这些模仿传统的DNS系统（map[domain]zonefile）的应用。用户可以购买未被使用的域名，或是出售/交易这些域名。

本教程的所有最终源代码都在此[目录](https://github.com/cosmos/sdk-application-tutorial)（并编译）。但是，最好手动完成并尝试自己构建项目！

### 需要

- 安装 [go 1.11+](https://golang.org/doc/install)
- 生效的[`$GOPATH`](https://github.com/golang/go/wiki/SettingGOPATH)
- 创造属于你自己区块链的意愿！

### 教程

通过本章教程你将创建如下的文件来组成你的应用:

```
./nameservice
├── Gopkg.toml
├── Makefile
├── app.go
├── cmd
│   ├── nscli
│   │   └── main.go
│   └── nsd
│       └── main.go
└── x
    └── nameservice
        ├── client
        │   ├── cli
        │   │   ├── query.go
        │   │   └── tx.go
        │   ├── rest
        │   │   └── rest.go
        │   └── module_client.go
        ├── codec.go
        ├── handler.go
        ├── keeper.go
        ├── msgs.go
        ├── querier.go
        └── types.go
```

首先创建一个新的git仓库：

```bash
mkdir -p $GOPATH/src/github.com/{ .Username }/nameservice
cd $GOPATH/src/github.com/{ .Username }/nameservice
git init
```

然后继续！第一步描述了设计你的应用。如果要直接跳转到编码部分，你可以从[第二步]()开始。

#### 教程部分

1.  [设计](./01-app-design.md) 应用程序。
2. 从[`./app.go`](./02-app-init.md) 开始实现你的应用。
3. Start building your module by defining some basic [`Types`](./03-types.md).
4. 开始用[`Keeper`]()构建你的模块。
5. 通过[`Msg`和`Handler`]()定义状态转变。
   - [`SetName`]()
   - [`BuyName`]()
6. 使用[`Querier`]()给你的状态机创建视图。
7. 使用[`sdk.Codec`]()注册你的types到编码格式中。
8. 创建[你的模块的CLI交互]()。
9. 创建[客户端访问你的nameservice的HTTP路径]()。
10. 导入你的模块并[编译你的应用]()!
11. 创建你的应用的[`nsd`和`nscli`入口]。
12. 安装[依赖管理工具`dep`]()。
13. [编译并启动]()示例项目。
14. [启动REST路径](