---
order: 2
---

# List posts

To list created posts we will be using `blogd query blog list-post` command. `list-post` subcommand hasn’t been defined yet, so let’s do it now. [Query commands](https://docs.cosmos.network/master/building-modules/querier.html) from the CLI are handled by `query.go`.

## x/blog/client/cli/query.go

Function `GetQueryCmd` is used for creating a list of `query` subcommands, it should already be defined. Edit the function to add `CmdListPost` as a subcommand:

```go
  cmd.AddCommand(CmdListPost())
```

Now let’s define `CmdListPost` in a queryPost.go file:

## x/blog/client/cli/queryPost.go

```go
package cli

import (
    "context"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/spf13/cobra"
    "github.com/example/blog/x/blog/types"
)

func CmdListPost() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "list-post",
		Short: "list all post",
		RunE: func(cmd *cobra.Command, args []string) error {
            clientCtx := client.GetClientContextFromCmd(cmd)
            clientCtx, err := client.ReadQueryCommandFlags(clientCtx, cmd.Flags())
            if err != nil {
                return err
            }

            pageReq, err := client.ReadPageRequest(cmd.Flags())
            if err != nil {
                return err
            }

            queryClient := types.NewQueryClient(clientCtx)

            params := &types.QueryAllPostRequest{
                Pagination: pageReq,
            }

            res, err := queryClient.PostAll(context.Background(), params)
            if err != nil {
                return err
            }

            return clientCtx.PrintOutput(res)
		},
	}

	flags.AddQueryFlagsToCmd(cmd)

    return cmd
}

```

`CmdListPost` runs an [ABCI](https://docs.tendermint.com/master/spec/abci/) query to fetch the data, unmarshals it back form binary to JSON and returns it to the console. ABCI is an interface between your app and Tendermint (a program responsible for replicating the state across machines). ABCI queries look like paths on a hierarchical filesystem. In our case, the query is `custom/blog/list-post`. Before we continue, we need to define `QueryListPost`.

## x/blog/types/query.go

Define a `QueryListPost` that will be used later on to dispatch query requests:

```go
const (
  QueryListPost = "list-post"
)
```

## x/blog/keeper/query.go

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
func listPost(ctx sdk.Context, keeper Keeper, legacyQuerierCdc *codec.LegacyAmino) ([]byte, error) {
	msgs := keeper.GetAllPost(ctx)

	bz, err := codec.MarshalJSONIndent(legacyQuerierCdc, msgs)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return bz, nil
}
```

This function uses a prefix iterator to loop through all the keys with a given prefix (in our case `PostPrefix` is `"post-"`). We’re getting values by key with `store.Get` and appending them to `postList`. Finally, we unmarshal bytes back to JSON and return the result to the console.

Now let’s see how it works. Run the following command to recompile your app, clear the data and relaunch the chain:

```sh
starport serve
```

After the app has launched, open a different terminal window and create a post:

```sh
blogd tx blog create-post 'Hello!' 'This is my first blog post.' --from=user1
```

Now run the query to see the post:

```sh
blogd query blog list-post
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
blogd q blog list-post
null
```

This is actually not an error, but may be a bit confusing. If you've added a post and immediately issued `list-post` subcommand, you may get a `null`. This happens, because it takes several seconds to process the block. After a couple of seconds you should be able to see output of `list-post` subcommand.
