# Nameservice 模块的 CLI

Cosmos SDK使用[`cobra`](https://github.com/spf13/cobra)库进行CLI交互。该库使每个模块都可以轻松地显示自己的操作命令。要开始定义用户与模块的CLI交互，请创建以下文件：

- `./x/nameservice/client/cli/query.go`
- `./x/nameservice/client/cli/tx.go`
- `./x/nameservice/client/module_client.go`

### ## Queries

在`query.go`文件中为你模块的每个`Query`（`resolve`和`whois`）定义`cobra.Command`:

```go
package cli

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/sdk-tutorials/nameservice/x/nameservice"
	"github.com/spf13/cobra"
)

// GetCmdResolveName queries information about a name
func GetCmdResolveName(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "resolve [name]",
		Short: "resolve name",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			name := args[0]

			res, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/resolve/%s", queryRoute, name), nil)
			if err != nil {
				fmt.Printf("could not resolve name - %s \n", string(name))
				return nil
			}

			var out nameservice.QueryResResolve
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}

// GetCmdWhois queries information about a domain
func GetCmdWhois(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "whois [name]",
		Short: "Query whois info of name",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			name := args[0]

			res, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/whois/%s", queryRoute, name), nil)
			if err != nil {
				fmt.Printf("could not resolve whois - %s \n", string(name))
				return nil
			}

			var out nameservice.Whois
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}

// GetCmdNames queries a list of all names
func GetCmdNames(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "names",
		Short: "names",
		// Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)

			res, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/names", queryRoute), nil)
			if err != nil {
				fmt.Printf("could not get query names\n")
				return nil
			}

			var out nameservice.QueryResNames
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}
```



注意上述代码中：

- CLI 引入了一个新的`context`:[`CLIContext`](https://godoc.org/github.com/cosmos/cosmos-sdk/client/context#CLIContext)。它包含有关CLI交互所需的用户输入和应用程序配置的数据。

- `cliCtx.QueryWithData()`函数所需的`path`直接从你的查询路径中映射。

  - 路径的第一部分用于区分 SDK 应用程序可能的querier类型：`custom`用于`Querier`
  - 第二部分（`nameservice`）是将查询路由到的模块的名称。
  - 最后是要调用模块中的特定的querier。
  - 在这个例子中，第四部分是查询。这是因为查询参数是一个简单的字符串。要启用更复杂的查询输入，你需要使用[`.QueryWithData()`](https://godoc.org/github.com/cosmos/cosmos-sdk/client/context#CLIContext.QueryWithData)函数的第二个参数来传入`data`。有关此示例，请参阅 [Staking 模块中的 queriers](https://github.com/cosmos/cosmos-sdk/blob/develop/x/stake/querier/querier.go#L103)。

  

### Transaction

现在已经定义了查询交互，是时候继续在`tx.go`中的交易生成了：

> 你的应用程序需要导入你刚编写的代码。这里导入路径设置为此存储库（github.com/cosmos/sdk-application-tutorial/nameservice/x/nameservice）。如果您是在自己的仓库中进行的前面的操作，则需要更改导入路径（github.com/{.Username}/{.Project.Repo}/x/nameservice）。

```go
package cli

import (
	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/client/utils"
	"github.com/cosmos/cosmos-sdk/codec"
	"github.com/cosmos/sdk-tutorials/nameservice/x/nameservice"

	sdk "github.com/cosmos/cosmos-sdk/types"
	authtxb "github.com/cosmos/cosmos-sdk/x/auth/client/txbuilder"
)

// GetCmdBuyName is the CLI command for sending a BuyName transaction
func GetCmdBuyName(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "buy-name [name] [amount]",
		Short: "bid for existing name or claim new name",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc).WithAccountDecoder(cdc)

			txBldr := authtxb.NewTxBuilderFromCLI().WithTxEncoder(utils.GetTxEncoder(cdc))

			if err := cliCtx.EnsureAccountExists(); err != nil {
				return err
			}

			coins, err := sdk.ParseCoins(args[1])
			if err != nil {
				return err
			}

			msg := nameservice.NewMsgBuyName(args[0], coins, cliCtx.GetFromAddress())
			err = msg.ValidateBasic()
			if err != nil {
				return err
			}

			cliCtx.PrintResponse = true

			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg}, false)
		},
	}
}

// GetCmdSetName is the CLI command for sending a SetName transaction
func GetCmdSetName(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "set-name [name] [value]",
		Short: "set the value associated with a name that you own",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc).WithAccountDecoder(cdc)

			txBldr := authtxb.NewTxBuilderFromCLI().WithTxEncoder(utils.GetTxEncoder(cdc))

			if err := cliCtx.EnsureAccountExists(); err != nil {
				return err
			}

			msg := nameservice.NewMsgSetName(args[0], args[1], cliCtx.GetFromAddress())
			err := msg.ValidateBasic()
			if err != nil {
				return err
			}

			cliCtx.PrintResponse = true

			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg}, false)
		},
	}
}
```



注意在上述代码中：

- 使用了`authcmd`包。[查看文档了解更多使用信息](https://godoc.org/github.com/cosmos/cosmos-sdk/x/auth/client/cli#GetAccountDecoder)。它提供对CLI控制的帐户的访问权限，并便于签名。

## Module Client

导出此功能的最后一部分称为`ModuleClient`，在`./x/nameservice/client/module_client.go`文件中实现。[Module Client](https://godoc.org/github.com/cosmos/cosmos-sdk/types#ModuleClients) 为模块提供了导出客户端功能的标准方法。

> 注意：你的应用程序需要导入你刚编写的代码。这里导入路径设置为此仓库（github.com/cosmos/sdk-tutorials/nameservice/x/nameservice）。如果你是在自己项目中编写的，则需要更改导入路径成（github.com/{.Username}/ {.Project.Repo}/x/nameservice）。

```go
package client

import (
	"github.com/cosmos/cosmos-sdk/client"
	nameservicecmd "github.com/cosmos/sdk-tutorials/nameservice/x/nameservice/client/cli"
	"github.com/spf13/cobra"
	amino "github.com/tendermint/go-amino"
)

// ModuleClient exports all client functionality from this module
type ModuleClient struct {
	storeKey string
	cdc      *amino.Codec
}

func NewModuleClient(storeKey string, cdc *amino.Codec) ModuleClient {
	return ModuleClient{storeKey, cdc}
}

// GetQueryCmd returns the cli query commands for this module
func (mc ModuleClient) GetQueryCmd() *cobra.Command {
	// Group nameservice queries under a subcommand
	namesvcQueryCmd := &cobra.Command{
		Use:   "nameservice",
		Short: "Querying commands for the nameservice module",
	}

	namesvcQueryCmd.AddCommand(client.GetCommands(
		nameservicecmd.GetCmdResolveName(mc.storeKey, mc.cdc),
		nameservicecmd.GetCmdWhois(mc.storeKey, mc.cdc),
	)...)

	return namesvcQueryCmd
}

// GetTxCmd returns the transaction commands for this module
func (mc ModuleClient) GetTxCmd() *cobra.Command {
	namesvcTxCmd := &cobra.Command{
		Use:   "nameservice",
		Short: "Nameservice transactions subcommands",
	}

	namesvcTxCmd.AddCommand(client.PostCommands(
		nameservicecmd.GetCmdBuyName(mc.cdc),
		nameservicecmd.GetCmdSetName(mc.cdc),
	)...)

	return namesvcTxCmd
}
```

上述代码要注意：

- 此抽象允许客户端以标准方式从模块导入客户端功能。当我们[构建入口](./13-entrypoint.md)时，你将看到这一点。
- 有一个[未解决的问题](https://github.com/cosmos/cosmos-sdk/issues/2955)是将其余功能（在本教程的下一部分中描述）添加到此接口。

###  现在你已准备好定义[REST客户端将用于与模块通信的路由](./11-rest.md)！