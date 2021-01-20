---
order: 2
---

# List posts

To list created posts we will be using `blogd query blog list-post` and `blogd query blog get-post` command. `list-post` and `get-post` subcommand hasn’t been defined yet, so let’s do it now. [Query commands](https://docs.cosmos.network/master/building-modules/querier.html) from the CLI are handled by `query.go`.

First we define our proto files, in `proto/blog`

## proto/blog/query.go

```go
syntax = "proto3";
package example.blog.blog;

import "google/api/annotations.proto";
import "cosmos/base/query/v1beta1/pagination.proto";
// this line is used by starport scaffolding # 1
import "blog/post.proto";

option go_package = "github.com/example/blog/x/blog/types";

// Query defines the gRPC querier service.
service Query {
    // this line is used by starport scaffolding # 2
	rpc Post(QueryGetPostRequest) returns (QueryGetPostResponse) {
		option (google.api.http).get = "/example/blog/blog/post/{id}";
	}
	rpc PostAll(QueryAllPostRequest) returns (QueryAllPostResponse) {
		option (google.api.http).get = "/example/blog/blog/post";
	}

}

// this line is used by starport scaffolding # 3
message QueryGetPostRequest {
	string id = 1;
}

message QueryGetPostResponse {
	Post Post = 1;
}

message QueryAllPostRequest {
	cosmos.base.query.v1beta1.PageRequest pagination = 1;
}

message QueryAllPostResponse {
	repeated Post Post = 1;
	cosmos.base.query.v1beta1.PageResponse pagination = 2;
}

```

In our proto file we define the structure of the API endpoint, as well as our request and response structure of the post.

## x/blog/client/cli/query.go

Function `GetQueryCmd` is used for creating a list of `query` subcommands, it should already be defined. Edit the function to add `CmdListPost` and `CmdShowPost` as a subcommand:

```go
	cmd.AddCommand(CmdListPost())
	cmd.AddCommand(CmdShowPost())
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

func CmdShowPost() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "show-post [id]",
		Short: "shows a post",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
            clientCtx := client.GetClientContextFromCmd(cmd)
            clientCtx, err := client.ReadQueryCommandFlags(clientCtx, cmd.Flags())
            if err != nil {
                return err
            }

            queryClient := types.NewQueryClient(clientCtx)

            params := &types.QueryGetPostRequest{
                Id: args[0],
            }

            res, err := queryClient.Post(context.Background(), params)
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

`CmdListPost` and `CmdShowPost` run an [ABCI](https://docs.tendermint.com/master/spec/abci/) query to fetch the data, unmarshals it back form binary to JSON and returns it to the console. ABCI is an interface between your app and Tendermint (a program responsible for replicating the state across machines). ABCI queries look like paths on a hierarchical filesystem. In our case, the query is `custom/blog/list-post`. Before we continue, we need to define `QueryListPost`.

## x/blog/types/query.go

Define a `QueryListPost` that will be used later on to dispatch query requests:

```go
package types

const (
	QueryGetPost  = "get-post"
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
    case types.QueryGetPost:
      return getPost(ctx, path[1], k, legacyQuerierCdc)

    case types.QueryListPost:
      return listPost(ctx, k, legacyQuerierCdc)

    default:
```

Now let’s define `listPost`:

### x/blog/keeper/query_post.go

Make sure to add the codec to the previous import and add the `listPost` and `getPost` function in a new file called `query_post.go` in our keeper.

```go
package keeper

import (
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

func listPost(ctx sdk.Context, keeper Keeper, legacyQuerierCdc *codec.LegacyAmino) ([]byte, error) {
	msgs := keeper.GetAllPost(ctx)

	bz, err := codec.MarshalJSONIndent(legacyQuerierCdc, msgs)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return bz, nil
}

func getPost(ctx sdk.Context, id string, keeper Keeper, legacyQuerierCdc *codec.LegacyAmino) ([]byte, error) {
	msg := keeper.GetPost(ctx, id)

	bz, err := codec.MarshalJSONIndent(legacyQuerierCdc, msg)
	if err != nil {
		return nil, sdkerrors.Wrap(sdkerrors.ErrJSONMarshal, err.Error())
	}

	return bz, nil
}

```

In the keeper we define also the grpc of our queryPost function.

### x/block/keeper/grpc_query_post.go

```go
package keeper

import (
	"context"

	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/query"
	"github.com/example/blog/x/blog/types"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (k Keeper) PostAll(c context.Context, req *types.QueryAllPostRequest) (*types.QueryAllPostResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var posts []*types.Post
	ctx := sdk.UnwrapSDKContext(c)

	store := ctx.KVStore(k.storeKey)
	postStore := prefix.NewStore(store, types.KeyPrefix(types.PostKey))

	pageRes, err := query.Paginate(postStore, req.Pagination, func(key []byte, value []byte) error {
		var post types.Post
		if err := k.cdc.UnmarshalBinaryBare(value, &post); err != nil {
			return err
		}

		posts = append(posts, &post)
		return nil
	})

	if err != nil {
		return nil, status.Error(codes.Internal, err.Error())
	}

	return &types.QueryAllPostResponse{Post: posts, Pagination: pageRes}, nil
}

func (k Keeper) Post(c context.Context, req *types.QueryGetPostRequest) (*types.QueryGetPostResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "invalid request")
	}

	var post types.Post
	ctx := sdk.UnwrapSDKContext(c)

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	k.cdc.MustUnmarshalBinaryBare(store.Get(types.KeyPrefix(types.PostKey + req.Id)), &post)

	return &types.QueryGetPostResponse{Post: &post}, nil
}

```

We add the grpc query handler to our module on 

### x/blog/module.go

We add to the `RegisterGRPCGatewayRoutes`, make sure to import `context`

```go
import (
	"context"
	// ... other imports
)
```

```go
func (AppModuleBasic) RegisterGRPCGatewayRoutes(clientCtx client.Context, mux *runtime.ServeMux) {
    types.RegisterQueryHandlerClient(context.Background(), mux, types.NewQueryClient(clientCtx))
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
