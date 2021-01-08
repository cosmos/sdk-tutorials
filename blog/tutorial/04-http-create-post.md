---
order: 4
---

# Create posts with HTTP

Let's create a front-end for our blog application. In this guide we will be writing a client-side application in JavaScript that can create a wallet (public/private key pair), fetch a list of posts from our server, create posts and send to our server.

## `x/blog/client/rest/rest.go`

We'll be creating posts by sending `POST` requests to the same endpoint: `/blog/posts`. To add a handler add the following line to `func RegisterRoutes`:

```go
	r.HandleFunc("/blog/posts", createPostHandler(cliCtx)).Methods("POST")
```

Now let's create `createPostHandler` inside a new file you should create at `x/blog/client/rest/txPost.go`.

### x/blog/client/rest/txPost.go

We will need a `createPostRequest` type that represents the request that we will be sending from the client:

```go
package rest

import (
	"net/http"

	"github.com/cosmos/cosmos-sdk/client/context"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/rest"
	"github.com/cosmos/cosmos-sdk/x/auth/client/utils"
	"github.com/example/blog/x/blog/types"
)

type createPostRequest struct {
	BaseReq rest.BaseReq `json:"base_req"`
	Creator string       `json:"creator"`
	Title   string       `json:"title"`
	Body    string       `json:"body"`
}

func createPostHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createPostRequest
		if !rest.ReadRESTReq(w, r, cliCtx.Codec, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}
		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}
		creator, err := sdk.AccAddressFromBech32(req.Creator)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		msg := types.NewMsgCreatePost(creator, req.Title, req.Body)
		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}

```

`createPostHandler` first parses request parameters, performs basic validations, converts `Creator` field from a string into an SDK account address type then finally creates `MsgCreatePost` message.

## Creating an account

Before we start using our application we need to make sure that the account we have generated exists on our chain. To do so we will send a nominal amount of tokens from an existing account to a new one.

```sh
blogcli keys show user1
```

You will get information about one of the existing accounts (your values will be different):

```json
{
  "name": "user1",
  "type": "local",
  "address": "cosmos1wt47yve6l29yjtxtsajhltr2vqhf7mpw5n6fx6",
  "pubkey": "cosmospub1addwnpepq03v7d6q4yt4nalj74elq8l5498wd9krcx92mxudkarj8aapy0qjvfaga8z"
}
```

Transfer some tokens from this account to the new one:

The passphrase for this account is:
`solid play vibrant paper clinic talent people employ august camp april reduce`

```sh
blogcli tx send $(blogcli keys show user1 -a) cosmos152gzu3vzf7g9tu46vszgpac24lwr48vc8k8kkh 10token --from=user1
```

Notice that the sender address can be queried automatically using the sub-command `$(blogcli keys show user1 -a)` with the flag `-a` to show just the address and the receiver account address `cosmos152gzu3vzf7g9tu46vszgpac24lwr48vc8k8kkh` is the one we have generated from the mnemonic.

In this guide we're activating accounts manually, but in production apps you might want to do it as part of a signing up process.