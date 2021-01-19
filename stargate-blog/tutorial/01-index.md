---
order: 1
---

# Create posts

By following this beginner tutorial, you will end up with a simple blog app that is powered by the Cosmos SDK.

## Requirements 

For this tutorial we will be using [Starport](https://github.com/tendermint/starport) v0.13.1, an easy to use tool for building blockchains. To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.13.1! | bash
```

You can also use Starport v0.13.1 on the web in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.13.1). Learn more about other ways to [install Starport](https://github.com/tendermint/starport/blob/develop/docs/1%20Introduction/2%20Install.md).

## Getting Started

Let's get started! The first step is to [install the `starport`](https://github.com/tendermint/starport) CLI tool.

After `starport` is installed, use it to create the initial app structure inside a directory named `blog`:

```
starport app github.com/example/blog
```

One of the main features of Starport is code generation. The command above has generated a directory structure with a working blockchain application. Starport can also add data types to your app with `starport type` command. To see it in action, follow the poll application tutorial. In this guide, however, we'll create those files manually to understand how it all works under the hood.

## Overview

Let's take a quick look at what Starport has generated for us. [`app/app.go`](https://docs.cosmos.network/master/basics/app-anatomy.html#core-application-file) file imports and configures SDK modules and creates a constructor for our application that extends a [basic SDK application](https://docs.cosmos.network/master/core/baseapp.html) among other things. This app will use only a couple standard modules bundled with Cosmos SDK (including `auth` for dealing with accounts and `bank` for handling coin transfers) and one module (`x/blog`) that will contain custom functionality.

In `cmd` directory we have source files of two programs for interacting with our application: `blogd` starts a full-node for your blockchain and enables you to query the full-node, either to update the state by sending a transaction or to read it via a query.

This blog app will store data in a persistent [key-value store](https://docs.cosmos.network/master/core/store.html). Similarly to most key-value stores, you can retrieve, delete, update, and loop through keys to obtain the values you are interested in.

We’ll be creating a simple blog-like application, so let’s define the first proto type, the `post`.

## blog/proto/post.proto

```go
syntax = "proto3";
package example.blog.blog;

option go_package = "github.com/example/blog/x/blog/types";

import "gogoproto/gogo.proto";

message Post {
  string creator = 1;
  string id = 2;
  string title = 3; 
  string body = 4; 
}

message MsgCreatePost {
  string creator = 1;
  string title = 2; 
  string body = 3; 
}

message MsgUpdatePost {
  string creator = 1;
  string id = 2;
  string title = 3; 
  string body = 4; 
}

message MsgDeletePost {
  string creator = 1;
  string id = 2;
}

```

The code above defines the three properties of a post: Creator, Title, Body and ID. We generate unique global IDs for each post and also store them as strings.

Posts in our key-value store will look like this:

```
"post-0": {
  "Creator": "cosmos18cd5t4msvp2lpuvh99rwglrmjrrw9qx5h3f3gz",
  "Title": "This is a post!",
  "Body": "Welcome to my blog app.",
  "ID": "0"
},
"post-1": {
  ...
}
```

Right now the store is empty. Let's figure out how to add posts.

With the Cosmos SDK, users can interact with your app with either a CLI (`blogd`) or by sending HTTP requests. Let's define the CLI command first. Users should be able to type `blogd tx blog create-post 'This is a post!' 'Welcome to my blog app.' --from=user1` to add a post to your store. The `create-post` subcommand hasn’t been defined yet--let’s do it now.

## x/blog/client/cli/tx.go

In the `import` block, make sure to import these four packages:

```go
import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	// "github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/example/blog/x/blog/types"
)
```

This file already contains `func GetTxCmd` which defines custom `blogcli` [commands](https://docs.cosmos.network/master/building-modules/module-interfaces.html#cli). We will add the custom `create-post` command to our `blogcli` by first adding `GetCmdCreatePost` to `blogTxCmd`.

```go
  cmd.AddCommand(CmdCreatePost())
```

At the end of the file, let's define `GetCmdCreatePost` itself.

```go
func CmdCreatePost() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create-post [title] [body]",
		Short: "Creates a new post",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
      argsTitle := string(args[0])
      argsBody := string(args[1])
      
        	clientCtx := client.GetClientContextFromCmd(cmd)
			clientCtx, err := client.ReadTxCommandFlags(clientCtx, cmd.Flags())
			if err != nil {
				return err
			}

			msg := types.NewMsgCreatePost(clientCtx.GetFromAddress().String(), string(argsTitle), string(argsBody))
			if err := msg.ValidateBasic(); err != nil {
				return err
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

    return cmd
}

```

The function above defines what happens when you run the `create-post` subcommand. `create-post` takes two arguments `[title] [body]`, creates a message `NewMsgCreatePost` (with title as `args[0]` and `args[1]`) and broadcasts this message to be processed in your application.

This is a common pattern in the SDK: users make changes to the store by broadcasting [messages](https://docs.cosmos.network/master/building-modules/messages-and-queries.html#messages). Both CLI commands and HTTP requests create messages that can be broadcasted in order for state transition to occur.

## x/blog/types/messages_post.go

Let’s define `NewMsgCreatePost` in a new file you should create as `x/blog/types/messages_post.go`.

```go
package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgCreatePost{}
```

Similarly to the post struct, `MsgCreatePost` contains our proto definition.

```go
func NewMsgCreatePost(creator string, title string, body string) *MsgCreatePost {
  return &MsgCreatePost{
		Creator: creator,
    Title: title,
    Body: body,
	}
}

```

`NewMsgCreatePost` is a constructor function that creates the `MsgCreatePost` message. The following five functions have to be defined to implement the `Msg` interface. They allow you to perform validation that doesn’t require access to the store (like checking for empty values), etc.

```go
// Route ...
func (msg MsgCreatePost) Route() string {
  return RouterKey
}
// Type ...
func (msg MsgCreatePost) Type() string {
  return "CreatePost"
}
// GetSigners ...
func (msg *MsgCreatePost) GetSigners() []sdk.AccAddress {
  creator, err := sdk.AccAddressFromBech32(msg.Creator)
  if err != nil {
    panic(err)
  }
  return []sdk.AccAddress{creator}
}
// GetSignBytes ...
func (msg MsgCreatePost) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}
// ValidateBasic ...
func (msg *MsgCreatePost) ValidateBasic() error {
  _, err := sdk.AccAddressFromBech32(msg.Creator)
  	if err != nil {
  		return sdkerrors.Wrapf(sdkerrors.ErrInvalidAddress, "invalid creator address (%s)", err)
  	}
  return nil
}
```

Going back to `GetCmdCreatePost` in `x/blog/client/cli/tx.go`, you'll see `MsgCreatePost` being created and broadcast with `GenerateOrBroadcastMsgs`.

After being broadcast, the messages are processed by an important part of the application, called [**handlers**](https://docs.cosmos.network/master/building-modules/handler.html).

## x/blog/handler.go

You should already have `func NewHandler` defined which lists all available handlers. Modify it to include a new function called `handleMsgCreatePost`.

```go
    switch msg := msg.(type) {
    case types.MsgCreatePost:
      return handleMsgCreatePost(ctx, k, msg)
    default:
```

Let's create the handler in `handler_post.go` file

## x/blog/handler_post.go

Now let’s define `handleMsgCreatePost`:

```go
func handleMsgCreatePost(ctx sdk.Context, k keeper.Keeper, msg *types.MsgCreatePost) (*sdk.Result, error) {
	k.CreatePost(ctx, *msg)

	return &sdk.Result{Events: ctx.EventManager().ABCIEvents()}, nil
}

```

After creating a post object with creator, ID and title, the message handler calls `k.CreatePost(ctx, post)`. “k” stands for [Keeper](https://docs.cosmos.network/master/building-modules/keeper.html), an abstraction used by the SDK that writes data to the store. Let’s define the `CreatePost` keeper function in a new `keeper/post.go` file.

## x/blog/keeper/post.go

Add a `CreatePost` function that takes two arguments: a [context](https://docs.cosmos.network/master/core/context.html#context-definition) and a post.

```go
package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/example/blog/x/blog/types"
)

func (k Keeper) CreatePost(ctx sdk.Context, post types.Post) {
	store := ctx.KVStore(k.storeKey)
	key := []byte(types.PostPrefix + post.ID)
	value := k.cdc.MustMarshalBinaryLengthPrefixed(post)
	store.Set(key, value)
}

```

`CreatePost` creates a key by concatenating a post prefix with an ID. If you look back at how our store looks, you’ll notice keys have prefixes, which is why `post-0bae9f7d-20f8-4b51-9d5c-af9103177d66` contained the prefix `post-` . The reason for this is you have one store, but you might want to keep different types of objects in it, like posts and users. Prefixing keys with `post-` and `user-` allows you to share one storage space between different types of objects.

## x/blog/types/keys.go

To define the post prefix add the following code:

```go
package types

const (
  // Other constants...
  // PostPrefix is used for keys in the KV store
  	PostKey= "Post-value-"
	  PostCountKey= "Post-count-"
)
```

## x/blog/types/codec.go

Finally, `store.Set(key, value)` writes our post to the store.
Two last things to do is tell our [encoder](https://docs.cosmos.network/master/core/encoding.html#amino) how our `MsgCreatePost` is converted to bytes.

```go
package types

import (
	"github.com/cosmos/cosmos-sdk/codec"
    cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
    sdk "github.com/cosmos/cosmos-sdk/types"
)

func RegisterCodec(cdc *codec.LegacyAmino) {
    // this line is used by starport scaffolding # 2
  cdc.RegisterConcrete(&MsgCreatePost{}, "blog/CreatePost", nil)

} 

func RegisterInterfaces(registry cdctypes.InterfaceRegistry) {
    // this line is used by starport scaffolding # 3
  registry.RegisterImplementations((*sdk.Msg)(nil),
    &MsgCreatePost{},
  )
}

var (
	amino = codec.NewLegacyAmino()
	ModuleCdc = codec.NewAminoCodec(amino)
)

```

## Launch

Now we are ready to build and start our app and create some posts.

To launch your application run:

```
starport serve
```

This command installs dependencies, builds and initializes the app, and runs servers. You can also do it manually:

1. `go mod tidy` cleans up dependencies.
2. `make` builds your app and creates two binaries in your go path: `blogd` and `blogcli`.
3. Initialization scripts in the `Makefile` removes data directories, configures your app and generates two accounts. By default your app stores data in your home directory in `~/.blogd`. The script removes them, so every time you have a clean state.
4. `blogd start` launches your app. After a couple of seconds you will see hashes of blocks being generated. Leave this terminal window open and open a new one.

Note: depending on your OS and firewall settings, you may have to accept a prompt asking if your application's binary (`blogd` in this case) can accept external connections.

Run the following command to create a post:

```sh
blogd tx blog create-post "My first post" "This is a post\!" --from=user1
```

“This is a post!” is a title for our post and `--from=user1` tells the program who is creating this post. `user1` is a label for your pair of keys used to sign the transaction, created by the initialization script located within the `/Makefile` previously. Keys are stored in `~/.blogd`.

After running the command and confirming it, you will see an object with “txhash” property with a value like `CA1491B39384A4F29E568F62B156E0F2D0601507EF499CE1B8F3930BAFE7F03C`.

To verify that the transaction has been processed, open a browser and visit the following URL (make sure to replace `CA14...` with the value of your txhash but make sure to keep the `0x` prefix):

```
http://localhost:26657/tx?hash=0xCA1491B39384A4F29E568F62B156E0F2D0601507EF499CE1B8F3930BAFE7F03C
```

Congratulations! You have just created and launched your custom blockchain and sent the first transaction 🎉

## Errors

### Cannot find module providing package

```
x/blog/client/cli/tx.go:12:2: cannot find module providing package github.com/cosmos/cosmos-sdk/client/utils: import lookup disabled by -mod=readonly
x/blog/client/cli/tx.go:75:59: undefined: sdk
```

Make sure you import all required packages in x/blog/client/cli/tx.go:

```go
import (
  // ...
  sdk "github.com/cosmos/cosmos-sdk/types"
  "github.com/cosmos/cosmos-sdk/x/auth/client/utils"
)
```

### Unknown command "create-post" for "blog"

```sh
blogd tx blog create-post 'Hello!' 'My first post' --from=user1
ERROR: unknown command "create-post" for "blog"
```

Make sure you’ve added `cmd.AddCommand(CmdCreatePost())`, to `func GetTxCmd` in `x/blog/client/cli/tx.go`.

### Cannot encode unregistered concrete type

```sh
blogd tx blog create-post Hello! --from=user1
panic: Cannot encode unregistered concrete type types.MsgCreatePost.
```

Make sure you’ve added `cdc.RegisterConcrete(MsgCreatePost{}, "blog/CreatePost", nil)` to `func RegisterCodec` in `x/blog/types/codec.go`.
