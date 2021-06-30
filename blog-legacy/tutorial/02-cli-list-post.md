---
order: 2
---

# List posts

To list created posts we will be using `blogcli query blog list-post` command. `list-post` subcommand hasn’t been defined yet, so let’s do it now. [Query commands](https://docs.cosmos.network/master/building-modules/querier.html) from the CLI are handled by `query.go`.

## x/blog/client/cli/query.go

Function `GetQueryCmd` is used for creating a list of `query` subcommands, it should already be defined. Edit the function to add `GetCmdListPost` as a subcommand:

```go
  blogQueryCmd.AddCommand(
    flags.GetCommands(
      GetCmdListPost(queryRoute, cdc),
    )...,
  )
```

Now let’s define `GetCmdListPost` in a queryPost.go file:

## x/blog/client/cli/queryPost.go

```go
package cli

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/codec"
    "github.com/spf13/cobra"
  
    "github.com/example/blog/x/blog/types"
)

func GetCmdListPost(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "list-post",
		Short: "list all post",
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/"+types.QueryListPost, queryRoute), nil)
			if err != nil {
				fmt.Printf("could not list Post\n%s\n", err.Error())
				return nil
			}
			var out []types.Post
			cdc.MustUnmarshalJSON(res, &out)
			return cliCtx.PrintOutput(out)
		},
	}
}

```

`GetCmdListPost` runs an [ABCI](https://docs.tendermint.com/master/spec/abci/) query to fetch the data, unmarshals it back form binary to JSON and returns it to the console. ABCI is an interface between your app and Tendermint (a program responsible for replicating the state across machines). ABCI queries look like paths on a hierarchical filesystem. In our case, the query is `custom/blog/list-post`. Before we continue, we need to define `QueryListPost`.

## x/blog/types/querier.go

Define a `QueryListPost` that will be used later on to dispatch query requests:

```go
const (
  QueryListPost = "list-post"
)
```

## x/blog/keeper/querier.go

Import `types` package for the `QueryListPost` constant.

```go
import (
  // Existing imports ...
  "github.com/example/blog/x/blog/types"
)
```

`NewQuerier` acts as a dispatcher for query functions, it should already be defined. Modify the switch statement to include `listPost`:

```go
    switch path[0] {
    case types.QueryListPost:
      return listPost(ctx, k)
    default:
```

Now let’s define `listPost`:

### x/blog/keeper/post.go

Make sure to add the codec to the previous imports.

```go
import (
  // Existing imports ...
	"github.com/cosmos/cosmos-sdk/codec"
)
```

Then add the `listPost` function.

```go
func listPost(ctx sdk.Context, k Keeper) ([]byte, error) {
	var postList []types.Post
	store := ctx.KVStore(k.storeKey)
	iterator := sdk.KVStorePrefixIterator(store, []byte(types.PostPrefix))
	for ; iterator.Valid(); iterator.Next() {
		var post types.Post
		k.cdc.MustUnmarshalBinaryLengthPrefixed(store.Get(iterator.Key()), &post)
		postList = append(postList, post)
	}
	res := codec.MustMarshalJSONIndent(k.cdc, postList)
	return res, nil
}
```

This function uses a prefix iterator to loop through all the keys with a given prefix (in our case `PostPrefix` is `"post-"`). We’re getting values by key with `store.Get` and appending them to `postList`. Finally, we unmarshal bytes back to JSON and return the result to the console.

Now let’s see how it works. Run the following command to recompile your app, clear the data and relaunch the chain:

```sh
starport chain serve
```

After the app has launched, open a different terminal window and create a post:

```sh
blogcli tx blog create-post 'Hello!' 'This is my first blog post.' --from=user1
```

Now run the query to see the post:

```sh
blogcli query blog list-post
```

```json
[
  {
    "creator": "cosmos1mc6leyjdwd9ygxeqdnvtsh7ks3knptjf3s5lf9",
    "title": "Hello!",
    "body": "This is my first blog post.",
    "id": "30808a80-799d-475c-9f5d-b382ea24d79c"
  }
]
```

That’s a newly created post along with your address and a unique ID. Try creating more posts and see the output.

We can also make [ABCI](https://docs.tendermint.com/master/spec/abci/) queries from the browser:

```
http://localhost:26657/abci_query?path="custom/blog/list-post"
```

The result of this query is a base64 encoded string inside `result.response.value`. You can decode it using a browser’s built in JavaScript console: `atob("WwogIHsKICAgICJjcmV...")`.

## Errors

### `null`

```
blogcli q blog list-post
null
```

This is actually not an error, but may be a bit confusing. If you've added a post and immediately issued `list-post` subcommand, you may get a `null`. This happens, because it takes several seconds to process the block. After a couple of seconds you should be able to see output of `list-post` subcommand.
