# 编译并运行程序

## 编译`nameservice`应用

要在此仓库中编译 nameservice 应用程序以查看功能，首先需要安装 **Go 1.13.0** 或更高版本。

如果从未用过 `go mod`，需要先添加几个环境变量。

```bash
mkdir -p $HOME/go/bin
echo "export GOPATH=$HOME/go" >> ~/.bash_profile
echo "export GOBIN=\$GOPATH/bin" >> ~/.bash_profile
echo "export PATH=\$PATH:\$GOBIN" >> ~/.bash_profile
echo "export GO111MODULE=on" >> ~/.bash_profile
source ~/.bash_profile
```

现在，你可以安装并使用 nameservice 了。

```bash
# Install the app into your $GOBIN
make install

# Now you should be able to run the following commands:
nsd help
nscli help
```

## 运行活跃的网络并使用操作命令

要初始化配置和应用程序的`genesis.json`文件和及一个用于交易的帐户，请先运行：

> 注意：在下面的命令中，使用终端来提取地址。你也可以只是输入创建密钥时保存的原始字符串，如下所示。这些命令需要在你的机器上安装[`jq`](https://stedolan.github.io/jq/download/)。

> 注意：如果你之前已经运行过该教程，则可以从头开始使用`nsd unsafe-reset-all`或删除 home 文件夹下的两个执行程序的数据及配置文件夹`rm -rf ~/.ns *`

> 注意：如果你的 Cosmos 应用需要使用 ledger，使用命令 `nscli keys add jack` 创建 key 时需要在后面添加 ---ledger 参数。只要这样就可以了。当对交易进行签名时。jack 会被自动识别为由 ledger 生成的 key，进而请求 ledger 设备。

```bash
# Initialize configuration files and genesis file
# moniker is the name of your node
nsd init <moniker> --chain-id namechain

# Copy the `Address` output here and save it for later use
# [optional] add "--ledger" at the end to use a Ledger Nano S
nscli keys add jack

# Copy the `Address` output here and save it for later use
nscli keys add alice

# Add both accounts, with coins to the genesis file
nsd add-genesis-account $(nscli keys show jack -a) 1000nametoken,1000jackcoin
nsd add-genesis-account $(nscli keys show alice -a) 1000nametoken,1000alicecoin

# Configure your CLI to eliminate need for chain-id flag
nscli config chain-id namechain
nscli config output json
nscli config indent true
nscli config trust-node true
```

你现在可以通过调用`nsd start`来启动`nsd`。你将看到日志开始不停输出，表示正在生成的区块，这将花费几秒钟。

打开另一个终端，对刚刚创建的网络运行命令：

```bash
# First check the accounts to ensure they have funds
nscli query account $(nscli keys show jack -a)
nscli query account $(nscli keys show alice -a)

# Buy your first name using your coins from the genesis file
nscli tx nameservice buy-name jack.id 5nametoken --from jack

# Set the value for the name you just bought
nscli tx nameservice set-name jack.id 8.8.8.8 --from jack

# Try out a resolve query against the name you registered
nscli query nameservice resolve jack.id
# > 8.8.8.8

# Try out a whois query against the name you just registered
nscli query nameservice whois jack.id
# > {"value":"8.8.8.8","owner":"cosmos1l7k5tdt2qam0zecxrx78yuw447ga54dsmtpk2s","price":[{"denom":"nametoken","amount":"5"}]}

# Alice buys name from jack
nscli tx nameservice buy-name jack.id 10nametoken --from alice
```

### 恭喜，您已经构建了一个 Cosmos SDK 应用程序！ 本教程现已完成。 如果要查看如何使用 REST 服务器运行相同的命令，请[单击此处](./16-run-rest.md)。
