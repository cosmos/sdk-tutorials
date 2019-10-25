---
order: 15
---

# Nameservice Module Rest Interface

Your module can also expose a REST interface to allow programatic access to the module's functionality. To get started create a file to hold the HTTP handlers:

- `./x/nameservice/client/rest/rest.go`

Add in the `imports` and `const`s to get started:

> _*NOTE*_: Your application needs to import the code you just wrote. Here the import path is set to this repository (`github.com/cosmos/sdk-tutorials/nameservice/x/nameservice`). If you are following along in your own repo you will need to change the import path to reflect that (`github.com/{ .Username }/{ .Project.Repo }/x/nameservice`).

```go
package rest

import (
	"fmt"
	"net/http"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/sdk-tutorials/nameservice/x/nameservice/types"

	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/rest"

	"github.com/gorilla/mux"
)

const (
	restName = "name"
)
```

### RegisterRoutes

First, define the REST client interface for your module in a `RegisterRoutes` function. Have the routes all start with your module name to prevent name space collisions with other modules' routes:

```go
// RegisterRoutes - Central function to define routes that get registered by the main application
func RegisterRoutes(cliCtx context.CLIContext, r *mux.Router, storeName string) {
	r.HandleFunc(fmt.Sprintf("/%s/names", storeName), namesHandler(cliCtx, storeName)).Methods("GET")
	r.HandleFunc(fmt.Sprintf("/%s/names", storeName), buyNameHandler(cliCtx)).Methods("POST")
	r.HandleFunc(fmt.Sprintf("/%s/names", storeName), setNameHandler(cliCtx)).Methods("PUT")
	r.HandleFunc(fmt.Sprintf("/%s/names/{%s}", storeName, restName), resolveNameHandler(cliCtx, storeName)).Methods("GET")
	r.HandleFunc(fmt.Sprintf("/%s/names/{%s}/whois", storeName, restName), whoIsHandler(cliCtx, storeName)).Methods("GET")
	r.HandleFunc(fmt.Sprintf("/%s/names", storeName), deleteNameHandler(cliCtx)).Methods("DELETE")
}
```

### Query Handlers

First create a `query.go` file to place all your querys in.

Next, its time to define the handlers mentioned above. These will be very similar to the CLI methods defined earlier. Start with the queries `whois` and `resolve`:

<<<@/nameservice/x/nameservice/client/rest/query.go

Notes on the above code:

- Notice we are using the same `cliCtx.QueryWithData` function to fetch the data
- These functions are almost the same as the corresponding CLI functionality

### Tx Handlers

First define a `tx.go` file to hold all your tx rest endpoints.

Now define the `buyName`, `setName` and `deleteName` transaction routes. Notice these aren't actually sending the transactions to buy, set and delete names. That would require sending a password along with the request which would be a security issue. Instead these endpoints build and return each specific transaction which can then be signed in a secure manner and afterwards broadcast to the network using a standard endpoint like `/txs`.

<<<@/nameservice/x/nameservice/client/rest/tx.go

Notes on the above code:

- The [`BaseReq`](https://godoc.org/github.com/cosmos/cosmos-sdk/client/utils#BaseReq) contains the basic required fields for making a transaction (which key to use, how to decode it, which chain you are on, etc...) and is designed to be embedded as shown.
- `baseReq.ValidateBasic` handles setting the response code for you and therefore you don't need to worry about handling errors or successes when using those functions.

### Next its time to augment `nameservice` by implementing the AppModule interface.
