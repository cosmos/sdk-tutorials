# Alias

Start by creating a `./x/nameservice/alias.go` file. The main reason for having this file is to prevent import cycles. You can read more about import cycles in go here: [Golang import cycles](https://stackoverflow.com/questions/28256923/import-cycle-not-allowed)

First start by importing the "types" folder you have created.

```go
package nameservice

import (
	"github.com/cosmos/sdk-application-tutorial/x/nameservice/types"
)
```

There are three kinds of types we will create in the alias.go file.

1. a constant, this is where you will define immutable variables.

```go
const (
	ModuleName = types.ModuleName
	RouterKey  = types.RouterKey
	StoreKey   = types.StoreKey
)
```

2. a variable, which you will define to contain information such as your messages.

```go
var (
	NewKeeper        = keeper.NewKeeper
	NewQuerier       = keeper.NewQuerier
	NewMsgBuyName    = types.NewMsgBuyName
	NewMsgSetName    = types.NewMsgSetName
	NewMsgDeleteName = types.NewMsgDeleteName
	NewWhois         = types.NewWhois
	RegisterCodec    = types.RegisterCodec
	ModuleCdc        = types.ModuleCdc
)
```

3. a type, here you will define the types you have created in the types folder.

```go
type (
	Keeper          = keeper.Keeper
	MsgSetName      = types.MsgSetName
	MsgBuyName      = types.MsgBuyName
	MsgDeleteName   = types.MsgDeleteName
	QueryResResolve = types.QueryResResolve
	QueryResNames   = types.QueryResNames
	Whois           = types.Whois
)
```

Now you have aliased your needed constants, variables, and types. We can move forward with the creation of the module.

### Register your types in the [Amino encoding format next](./codec.md)!
