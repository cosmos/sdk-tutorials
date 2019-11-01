# 应用目标

你正在构建的应用程序的目标是让用户购买域名并为其设置解析的值。给定域名的所有者将是当前最高出价者。在本节中，你将了解如何将这些简单需求转化为程序的设计。

区块链应用程序只是一个[确定性的复制状态机](https://en.wikipedia.org/wiki/State_machine_replication)。作为开发人员，你只需定义状态机（即状态，启动状态和触发状态转变的消息），[_Tendermint_](https://tendermint.com/docs/introduction/introduction.html) 将通过网络为你处理进行复制。

> Tendermint是一个与应用程序无关的引擎，负责处理区块链的网络层和共识层。实际上，这意味着Tendermint负责传播和排序交易字节。Tendermint Core依赖于拜占庭容错（BFT）算法来达成交易顺序的共识。点击[这里](https://tendermint.com/docs/introduction/introduction.html)了解更多Tendermint相关信息。

[Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) 旨在帮助你构建状态机。SDK是一个模块化框架，意味着应用程序是通过将一组可互操作的模块集成在一起构建而成的。每个模块都包含自己的消息/交易处理器，而SDK负责将每条消息路由到其对应模块。

以下是nameservice应用程序所需的模块：

- `auth` : 此模块定义了账户和手续费，并为你应用程序的其余部分提供了访问这些功能的权限。
- `bank` : 此模块使得应用程序能够创建和管理token及余额。
- `staking` : This module enables the application to have validators that people can delegate to.
- `distribution` : This module give a functional way to passively distribute rewards between validators and delegators.
- `slashing` : This module disincentivizes people with value staked in the network, ie. Validators.
- `supply` : This module holds the total supply of the chain.
- `nameservice` : 此模块目前还不存在！其将处理你所构建的`nameservice`应用的核心逻辑。它是你构建应用程序时必须使用的主要部分。

> 你可能会好奇为什么没有模块来处理验证人集合的变更。实际上，Tendermint依靠一组验证人来对下一个要添加至区块链的有效交易区块[达成共识](https://tendermint.com/docs/introduction/introduction.html#consensus-overview)。默认情况下，如果没有模块处理验证集合的变更，验证人集合将与创世文件`genesis.json`中定义的验证人集合保持一致。该应用程序就是这种情况。如果要允许更改应用程序的验证人集合，可以使用SDK的 [staking 模块](https://github.com/cosmos/cosmos-sdk/tree/develop/x/staking)，或编写自己的模块！

现在，看一下应用程序的两个主要部分：state（状态） 和 message（消息）类型。

## State

state反映了特定时刻你的应用程序。它告诉了每个帐户拥有多少token，每个域名的所有者和价格，以及每个域名的解析值。

token 和帐户的 state 由`auth`和`bank`模块定义，这意味着你现在不必关心它。你需要做的是定义与你的`nameservice`模块特定相关部分state。

在 SDK 中，所有内容都存储在一个名为`multistore`的存储中。可以在此 multistore 中创建任意数量的键值对存储（在Cosmos SDK中称作[`KVStore`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#KVStore)）。在本应用中，我们将使用一个 store 记录 `name` 与 `whois` 信息，`name` 的 value、owner 和 price 将存储在一个结构中。

### Message

message 包含在 transaction 中。它们负责触发 state 的转变。每个模块定义了一个 message 列表及如何去处理它们。下面这些 message 是你需要为你的 nameservice 应用去实现的：

- `MsgSetName`: 此 message 允许域名的所有者为指定域名的`nameStore`设置一个值。
- `MsgBuyName`: 此 message 允许账户去购买一个域名并在`ownerStore`中成为所有者。
  - 当有人购买一个域名时，他们需要支付币之前所有者购买价格更高的费用。如果域名还没有人购买，那么他们需要燃烧最小价格（`MinPrice`）的代币。

当一条交易（包含在区块中）到达一个Tendermint节点时，它将通过 [ABCI](https://github.com/tendermint/tendermint/tree/master/abci) 传递给应用程序并被解码以得到 message。然后将message路由至对应的模块，并根据定义在`Handler`中的逻辑来进行处理。如果 state 需要更新，`Handler`会调用`Keeper`来执行更新。你将在后面的教程了解有关这些概念的更多信息。

### 现在你已经从高层视角完成了对应用程序的设计，是时候开始[实现](02-app-init.md)它了。
