# Nameservice Module Rest Interface

You module can also expose a REST interface to allow programatic access to the module's functionality. To get started create a file to hold the HTTP handlers:

- `./x/nameservice/client/rest/rest.go`

Add in the `imports` and `const`s to get started:

> _*NOTE*_: Your application needs to import the code you just wrote. Here the import path is set to this repository (`github.com/cosmos/sdk-application-tutorial/x/nameservice`). If you are following along in your own repo you will need to change the import path to reflect that (`github.com/{ .Username }/{ .Project.Repo }/x/nameservice`).

```go
package rest

import (
	"fmt"
	"net/http"

	"github.com/cosmos/cosmos-sdk/client/context"
	clientrest "github.com/cosmos/cosmos-sdk/client/rest"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/rest"
	"github.com/cosmos/sdk-application-tutorial/x/nameservice"

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
func RegisterRoutes(cliCtx context.CLIContext, r *mux.Router, cdc *codec.Codec, storeName string) {
	r.HandleFunc(fmt.Sprintf("/%s/names", storeName), buyNameHandler(cdc, cliCtx)).Methods("POST")
	r.HandleFunc(fmt.Sprintf("/%s/names", storeName), setNameHandler(cdc, cliCtx)).Methods("PUT")
	r.HandleFunc(fmt.Sprintf("/%s/names/{%s}", storeName, restName), resolveNameHandler(cdc, cliCtx, storeName)).Methods("GET")
	r.HandleFunc(fmt.Sprintf("/%s/names/{%s}/whois", storeName, restName), whoIsHandler(cdc, cliCtx, storeName)).Methods("GET")
}
```

### Query Handlers

Next, its time to define the handlers mentioned above. These will be very similar to the CLI methods defined earlier. Start with the queries `whois` and `resolve`:

```go
func resolveNameHandler(cdc *codec.Codec, cliCtx context.CLIContext, storeName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		paramType := vars[restName]

		res, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/resolve/%s", storeName, paramType), nil)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}

		rest.PostProcessResponse(w, cdc, res, cliCtx.Indent)
	}
}

func whoIsHandler(cdc *codec.Codec, cliCtx context.CLIContext, storeName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		paramType := vars[restName]

		res, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/whois/%s", storeName, paramType), nil)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}

		rest.PostProcessResponse(w, cdc, res, cliCtx.Indent)
	}
}
```

Notes on the above code:

- Notice we are using the same `cliCtx.QueryWithData` function to fetch the data
- These functions are almost the same as the corresponding CLI functionality

### Tx Handlers

Now define the `buyName` and `setName` transaction routes:

```go
type buyNameReq struct {
	BaseReq rest.BaseReq `json:"base_req"`
	Name    string       `json:"name"`
	Amount  string       `json:"amount"`
	Buyer   string       `json:"buyer"`
}

func buyNameHandler(cdc *codec.Codec, cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req buyNameReq

		if !rest.ReadRESTReq(w, r, cdc, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}

		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}

		addr, err := sdk.AccAddressFromBech32(req.Buyer)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		coins, err := sdk.ParseCoins(req.Amount)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		// create the message
		msg := nameservice.NewMsgBuyName(req.Name, coins, addr)
		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		clientrest.CompleteAndBroadcastTxREST(w, cliCtx, baseReq, []sdk.Msg{msg}, cdc)
	}
}

type setNameReq struct {
	BaseReq rest.BaseReq `json:"base_req"`
	Name    string       `json:"name"`
	Value   string       `json:"value"`
	Owner   string       `json:"owner"`
}

func setNameHandler(cdc *codec.Codec, cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req setNameReq
		if !rest.ReadRESTReq(w, r, cdc, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}

		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}

		addr, err := sdk.AccAddressFromBech32(req.Owner)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		// create the message
		msg := nameservice.NewMsgSetName(req.Name, req.Value, addr)
		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		clientrest.CompleteAndBroadcastTxREST(w, cliCtx, baseReq, []sdk.Msg{msg}, cdc)
	}
}
```

Notes on the above code:

- The [`BaseReq`](https://godoc.org/github.com/cosmos/cosmos-sdk/client/utils#BaseReq) contains the basic required fields for making a transaction (which key to use, how to decode it, which chain you are on, etc...) and is designed to be embedded as shown.
- `baseReq.ValidateBasic` and `clientrest.CompleteAndBroadcastTxREST` handle setting the response code for you and therefore you don't need to worry about handling errors or successes when using those functions.

### Now your module has everything it needs to be [incorporated into your Cosmos SDK application](./app-complete.md)!
