# Alias

Start by creating a `./x/nameservice/alias.go` file. The main reason for having this file is to prevent import cycles. You can read more about import cycles in go here: [Golang import cycles](https://stackoverflow.com/questions/28256923/import-cycle-not-allowed)

First start by import the types folder you have created.

```go
package nameservice

import (
	"github.com/cosmos/sdk-application-tutorial/x/nameservice/types"
)
```

There are three types of types we will create in the alias.go file.

1. A const, this is where you will define imutable variables.

```go
const (
	ModuleName = types.ModuleName
	RouterKey  = types.RouterKey
	StoreKey   = types.StoreKey
)
```

2. A var, here you will define varibale, like your messages.

```go
var (
	NewMsgBuyName = types.NewMsgBuyName
	NewMsgSetName = types.NewMsgSetName
	NewWhois      = types.NewWhois
	ModuleCdc     = types.ModuleCdc
	RegisterCodec = types.RegisterCodec
)
```

3. A type, here you will define the types you have created in the types folder.

```go
type (
	MsgSetName      = types.MsgSetName
	MsgBuyName      = types.MsgBuyName
	QueryResResolve = types.QueryResResolve
	QueryResNames   = types.QueryResNames
	Whois           = types.Whois
)
```

Now you have aliased your needed consts, vars, and types. We can move forward with the creation of the module.

### Register your types in the [Amino encoding format next](./codec.md)!
