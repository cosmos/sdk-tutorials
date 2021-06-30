---
order: 3
---

# List posts with HTTP

At some point you may want to create a front-end to your application and interact with it by sending HTTP requests. In part 2 we've seen that sending requests to `/abci_query` is one way of getting data from your app. This works well for testing and certain specific usecases, but for a production application you may want to create a clean API for yourself and other users. This API should probably have short endpoints (without implementation details, like `abci`) and respond differently to HTTP verbs like GET and POST. You may also want to have some request processing logic that handles basic checks and data transformation. Luckily, Cosmos SDK provides just that.

Let's create a [server](https://docs.cosmos.network/master/building-modules/module-interfaces.html#rest) that handles `GET` requests to `/blog/posts` endpoint by returning a list of posts.

## `x/blog/client/rest/rest.go`

In this file you should see `func RegisterRoutes` used for registering HTTP endpoints and handler functions.

Add the following line to register our first route:

```go
	r.HandleFunc("/blog/posts", listPostHandler(cliCtx, "blog")).Methods("GET")
```

Now let's define `listPostHandler` in the same package:

### x/blog/client/rest/queryPost.go

```go
package rest

import (
	"fmt"
	"net/http"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/types/rest"
)

func listPostHandler(cliCtx context.CLIContext, storeName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/list-post", storeName), nil)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}
		rest.PostProcessResponse(w, cliCtx, res)
	}
}
```

As many handler functions in Cosmos apps `listPostHandler` takes context, which contains meta information about the app and its environment, as a first argument. We're also passing `storeName`, which in our case is `"blog"`.

Similarly to the CLI handler the function runs `QueryWithData` with a `custom/blog/list-post` ABCI query. The `[]byte` return value then gets unmarshalled into JSON and returned to the handler.

To build your app and launch servers, run:

```
starport chain serve
```

Alternatively, follow instructions in Part 1 to recompile and relaunch your app and add some test posts to the store. Make sure `blogcli q blog list-post` returns a list of posts.

To launch our HTTP server run the following command in a different terminal window:

```
blogcli rest-server
```

You should see server logs streaming in the terminal:

```
I[2020-06-07|11:19:14.921] Starting application REST service (chain-id: "blog")... module=rest-server
I[2020-06-07|11:19:14.921] Starting RPC HTTP server on 127.0.0.1:1317   module=rest-server
```

As we can see by default the server runs on `1317` port. Let's make a request to our handler:

```
http://localhost:1317/blog/posts
```

You should see a list of posts returned as JSON from a HTTP server:

```json
{
  "height": "0",
  "result": [
    {
      "creator": "cosmos1ulpw5rtzd537s9v8g363wtvrxnz5fmrheh8hgm",
      "title": "Hello!",
      "body": "This is a my first post",
      "id": "a07a0d36-e201-4c37-8d6b-be20f4f8f3d3"
    }
  ]
}
```
