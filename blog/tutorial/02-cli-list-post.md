---
order: 2
---

# List posts

To list created posts you use the `blogd query blog list-post` and `blogd query blog get-post` commands. The `list-post` and `get-post` subcommands haven’t been defined yet, so let’s do it now. [Query commands](https://docs.cosmos.network/master/building-modules/querier.html) from the CLI are handled by `query.go`.

First we define our proto files, in `proto/blog`

## Add the Query Proto File

```proto
// proto/blog/query.proto
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

In our proto file you define the structure of the API endpoint, as well as your request and response structure of the post.

## Edit the Query Functions in the CLI

Function `GetQueryCmd` is used for creating a list of `query` subcommands, it should already be defined. Edit the function to add `CmdListPost` and `CmdShowPost` as a subcommand:

```go
// x/blog/client/cli/query.go
	
	// this line is used by starport scaffolding # 1
	cmd.AddCommand(CmdListPost())
	cmd.AddCommand(CmdShowPost())
```

Now define `CmdListPost` in a new `queryPost.go` file:

## Add the Query Post to the CLI

Create the `x/blog/client/cli/queryPost.go` file.

```go
// x/blog/client/cli/queryPost.go
package cli

import (
	"context"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/example/blog/x/blog/types"
)

func CmdListPost() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "list-post",
		Short: "list all post",
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
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

			return clientCtx.PrintProto(res)
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
			clientCtx, err := client.GetClientTxContext(cmd)
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

			return clientCtx.PrintProto(res) 
		},
	}

	flags.AddQueryFlagsToCmd(cmd)

	return cmd
}
```

`CmdListPost` and `CmdShowPost` run an [ABCI](https://docs.tendermint.com/master/spec/abci/) query to fetch the data, unmarshals it back form binary to JSON and returns it to the console. ABCI is an interface between your app and Tendermint (a program responsible for replicating the state across machines). ABCI queries look like paths on a hierarchical filesystem. In our case, the query is `custom/blog/list-post`. Before you continue, you need to define `QueryListPost`.

## Add the Two Query Commands to the Types

Define a `QueryListPost` that will be used later on to dispatch query requests:

```go
// x/blog/types/query.go
package types

const (
	QueryGetPost  = "get-post"
	QueryListPost = "list-post"
)

```

## Add the Query Functions to the Keeper

`NewQuerier` acts as a dispatcher for query functions, it should already be defined. Modify the switch statement to include `listPost`:

```go
// x/blog/keeper/query.go

		switch path[0] {
		// this line is used by starport scaffolding # 2
		case types.QueryGetPost:
			return getPost(ctx, path[1], k, legacyQuerierCdc)
		case types.QueryListPost:
			return listPost(ctx, k, legacyQuerierCdc)
		default:
```

Now define `listPost`:

### Add the Query Post Functions to the Keeper

Create a new file `query_post.go` in the `keeper/` directory

Make sure to add the codec to the previous import and add the `listPost` and `getPost` function in a new file called `query_post.go` in our keeper.

```go
// x/blog/keeper/query_post.go
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

In the keeper you also define the grpc of the queryPost function.

### Add GRPC functionality

```go
// x/block/keeper/grpc_query_post.go
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

### Add GRPC to the Module Handler

You add the grpc query handler to your module.

Make sure to import `context` and add the `RegisterGRPCGatewayRoutes`:

```go
// x/blog/module.go
import (
	"context"
	// ... other imports
)
```

Search for the `RegisterGRPCGatewayRoutes` function and add the `RegisterQueryHandlerClient`

```go
// x/blog/module.go
func (AppModuleBasic) RegisterGRPCGatewayRoutes(clientCtx client.Context, mux *runtime.ServeMux) {
	// this line is used by starport scaffolding # 2
	types.RegisterQueryHandlerClient(context.Background(), mux, types.NewQueryClient(clientCtx))
}
```

This function uses a prefix iterator to loop through all the keys with a given prefix (in our case `PostKey` is `"Post-value-"`). You get values by key with `store.Get` and appending them to `postList`. Finally, unmarshal bytes back to JSON and return the result to the console.

Now, you can see how it works. Run the following command to recompile your app, clear the data and relaunch the chain:

```sh
starport chain serve
```

After the app has launched, open a different terminal window and create a post:

```sh
blogd tx blog create-post 'Hello!' 'This is my first blog post.' --from=alice
```

Now run the query to see the post:

```sh
blogd query blog list-post
```

```
Post:
- body: This is my first blog post.
  creator: cosmos1mc6leyjdwd9ygxeqdnvtsh7ks3knptjf3s5lf9
  id: "0"
  title: Hello!
```

That’s a newly created post along with your address and a unique ID. Try creating more posts and see the output.

You can also make [ABCI](https://docs.tendermint.com/master/spec/abci/) queries from the browser:

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

This `null` is actually not an error, but might be a bit confusing. If you've added a post and immediately issued `list-post` subcommand, you may get a `null`. This happens because it takes several seconds to process the block. After a couple of seconds you should be able to see output of `list-post` subcommand.
