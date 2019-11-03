---
order: 1
---

# Simple App

First lets assemble and run a very minimal blockchain. Most of the code for
this is wrapped into `starter` so the boilerplate is fairly short. We will be
using `starter.AppStarter` which wraps the Cosmos SDK modules `bank`, `auth`,
`params`, `supply`, `genaccounts`, and `genutil` into a minimal app.

`app.go` is where you construct your app out of its component modules.
`starter` is taking care of most of this for now but we will come back later
when it's time to add our own module.

Set up your project with the following in `hellochain/app.go`

```go
package hellochain

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	abci "github.com/tendermint/tendermint/abci/types"
	dbm "github.com/tendermint/tm-db"
	"github.com/tendermint/tendermint/libs/log"

	"github.com/cosmos/sdk-tutorials/hellochain/starter"
)

const appName = "hellochain"

var (
	// ModuleBasics holds the AppModuleBasic struct of all modules included in the app
	ModuleBasics = starter.ModuleBasics
)

type helloChainApp struct {
	*starter.AppStarter // helloChainApp extends starter.AppStarter
}

// NewHelloChainApp returns a fully constructed SDK application
func NewHelloChainApp(logger log.Logger, db dbm.DB) abci.Application {

  // construct our starter to extend
	appStarter := starter.NewAppStarter(appName, logger, db)


	// compose our app with starter
	var app = &helloChainApp{
		appStarter,
	}

	// do some final configuration...
	app.InitializeStarter()

	return app
}
```

Next lets build and run this app just to make sure its working and try out some
of the basic functionality.
