---
order: 1
description: Build a blockchain blog app, create types and CLI functions, define messages, list posts, and create a front-end user interface.
---

# Create posts

By following this beginner tutorial, you end up with a simple blog app that is powered by the Cosmos SDK.

**You will learn how to**

- Build a blockchain app `blogd` 
- Create CLI functions 
- Define messages to create blog posts
- List created posts
- Generate transaction types to add functionality
- Create and inspect the front-end user interface

## Requirements 

This tutorial uses [Starport](https://github.com/tendermint/starport) v0.15.1. Starport offers everything you need to build, test, and launch your blockchain.  To install `starport`, run the following command:

```
curl https://get.starport.network/starport@v0.15.1! | bash
```

You can also use Starport v0.15.1 on the web in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.15.1). Learn more about other ways to [install Starport](https://github.com/tendermint/starport/blob/develop/docs/intro/install.md).

## Getting Started

Get started! The first step is to [install the `starport`](https://github.com/tendermint/starport) CLI tool.

After `starport` is installed, use it to create the initial app structure inside a directory named `blog`:

```
starport scaffold chain github.com/example/blog
```

One of the main features of Starport is code generation. The preceding command has generated a directory structure with a working blockchain application. You can also add data types to your app with the `starport type` command. To see code generation in action, follow the poll application tutorial. In this guide, however, we'll create those files manually to learn how Starport code generation works.

## Overview

Take a quick look at what Starport has generated for us: 
The [`app/app.go`](https://docs.cosmos.network/master/basics/app-anatomy.html#core-application-file) file imports and configures SDK modules and creates a constructor for the application that extends a [basic SDK application](https://docs.cosmos.network/master/core/baseapp.html) among other things. This app uses only a couple standard modules bundled with Cosmos SDK (including `auth` for dealing with accounts and `bank` for handling coin transfers) and one module (`x/blog`) that contains custom functionality.

In `cmd` directory you have source files of two programs for interacting with your application: `blogd` starts a full-node for your blockchain and enables you to query the full-node, either to update the state by sending a transaction or to read it via a query.

This blog app stores data in a persistent [key-value store](https://docs.cosmos.network/master/core/store.html). Similarly to most key-value stores, you can retrieve, delete, update, and loop through keys to obtain the values you are interested in.

Create a simple blog-like application and define the first proto type, the `Post` in the `post.proto` file.


## Create the Proto File

Create the `post.proto` file.

```proto
// proto/blog/post.proto
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
```

The code above defines the four properties of a post: Creator, Title, Body and ID. Unique global IDs are generated for each post and also store them as strings.

Posts in the key-value store look like this:

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

Right now the store is empty. Next, define how the user adds a posts.

With the Cosmos SDK, users can interact with your app with either a CLI (`blogd`) or by sending HTTP requests. Let's define the CLI command first. Users should be able to type `blogd tx blog create-post 'This is a post!' 'Welcome to my blog app.' --from=alice` to add a post to your store. The `create-post` subcommand hasn’t been defined yet--let’s do it now.

## Create the CLI Function

Open the CLI transaction file `x/blog/client/cli/tx.go`.

In the `import` block, make sure to import the following packages:

```go
// x/blog/client/cli/tx.go
import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"
	"github.com/example/blog/x/blog/types"
)
```

This file already contains the function `GetTxCmd` which defines custom `blogd` [commands](https://docs.cosmos.network/master/building-modules/module-interfaces.html#cli). Now you can add the custom `create-post` command to `blogd` by first adding `CmdCreatePost` to `cmd`.

```go
	// this line is used by starport scaffolding # 1
	cmd.AddCommand(CmdCreatePost())
```

At the end of the file, let's define `CmdCreatePost` itself.

```go
func CmdCreatePost() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create-post [title] [body]",
		Short: "Creates a new post",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			argsTitle := string(args[0])
			argsBody := string(args[1])
      
			clientCtx, err := client.GetClientTxContext(cmd)
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

The function above defines what happens when you run the `create-post` subcommand. `create-post` takes two arguments `[title] [body]`, creates a message `NewMsgCreatePost` (with title as `args[0]` and body as `args[1]`) and broadcasts this message to be processed in your application.

This is a common pattern in the SDK: users make changes to the store by broadcasting [messages](https://docs.cosmos.network/master/building-modules/messages-and-queries.html#messages). Both CLI commands and HTTP requests create messages that can be broadcasted in order for state transition to occur.

## Define the Message to Create a Post

Define `NewMsgCreatePost` in a new file you should create as `x/blog/types/messages_post.go`.

```go
// x/blog/types/messages_post.go
package types

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var _ sdk.Msg = &MsgCreatePost{}
```

Similarly to the post proto, `MsgCreatePost` contains the post definition.

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
func (msg *MsgCreatePost) GetSignBytes() []byte {
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

Going back to `CmdCreatePost` in `x/blog/client/cli/tx.go`, you'll see `MsgCreatePost` being created and broadcast with `GenerateOrBroadcastMsgs`.

After being broadcast, the messages are processed by an important part of the application, called [**handlers**](https://docs.cosmos.network/master/building-modules/handler.html).

## Modify the Handler

You should already have the function `NewHandler` defined which lists all available handlers. Modify it to include a new function called `handleMsgCreatePost`.

```go
// x/blog/handler.go

		switch msg := msg.(type) {
		// this line is used by starport scaffolding # 1
		case *types.MsgCreatePost:
			return handleMsgCreatePost(ctx, k, msg)
		default:
```

Create the handler in `handler_post.go` file

## Create the Post Handler

Define the function `handleMsgCreatePost` in a new file `handler_post.go`:

```go
// x/blog/handler_post.go
package blog

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/example/blog/x/blog/keeper"
	"github.com/example/blog/x/blog/types"
)

func handleMsgCreatePost(ctx sdk.Context, k keeper.Keeper, msg *types.MsgCreatePost) (*sdk.Result, error) {
	k.CreatePost(ctx, *msg)

	return &sdk.Result{Events: ctx.EventManager().ABCIEvents()}, nil
}
```

After creating a post object with creator, ID and title, the message handler calls `k.CreatePost(ctx, post)`. 
- “k” stands for [Keeper](https://docs.cosmos.network/master/building-modules/keeper.html), an abstraction used by the SDK that writes data to the store. 
- Define the `CreatePost` keeper function in a new `keeper/post.go` file.

## Add the Post Keeper

First, create a new file `post.go` in the `keeper/` directory.
Then, add a `CreatePost` function that takes two arguments: 
- A [context](https://docs.cosmos.network/master/core/context.html#context-definition) 
- A post
- Also, the `GetPostCount` and `SetPostCount`  functions

```go
// x/blog/keeper/post.go
package keeper

import (
	"strconv"

	"github.com/cosmos/cosmos-sdk/store/prefix"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/example/blog/x/blog/types"
)

// GetPostCount get the total number of post
func (k Keeper) GetPostCount(ctx sdk.Context) int64 {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostCountKey))
	byteKey := types.KeyPrefix(types.PostCountKey)
	bz := store.Get(byteKey)

	// Count doesn't exist: no element
	if bz == nil {
		return 0
	}

	// Parse bytes
	count, err := strconv.ParseInt(string(bz), 10, 64)
	if err != nil {
		// Panic because the count should be always formattable to int64
		panic("cannot decode count")
	}

	return count
}

// SetPostCount set the total number of post
func (k Keeper) SetPostCount(ctx sdk.Context, count int64) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostCountKey))
	byteKey := types.KeyPrefix(types.PostCountKey)
	bz := []byte(strconv.FormatInt(count, 10))
	store.Set(byteKey, bz)
}

func (k Keeper) CreatePost(ctx sdk.Context, msg types.MsgCreatePost) {
	// Create the post
	count := k.GetPostCount(ctx)
	var post = types.Post{
		Creator: msg.Creator,
		Id:      strconv.FormatInt(count, 10),
		Title:   msg.Title,
		Body:    msg.Body,
	}

	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	key := types.KeyPrefix(types.PostKey + post.Id)
	value := k.cdc.MustMarshalBinaryBare(&post)
	store.Set(key, value)

	// Update post count
	k.SetPostCount(ctx, count+1)
}

func (k Keeper) GetPost(ctx sdk.Context, key string) types.Post {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	var post types.Post
	k.cdc.MustUnmarshalBinaryBare(store.Get(types.KeyPrefix(types.PostKey + key)), &post)
	return post
}

func (k Keeper) HasPost(ctx sdk.Context, id string) bool {
	store :=  prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	return store.Has(types.KeyPrefix(types.PostKey + id))
}

func (k Keeper) GetPostOwner(ctx sdk.Context, key string) string {
	return k.GetPost(ctx, key).Creator
}

func (k Keeper) GetAllPost(ctx sdk.Context) (msgs []types.Post) {
	store := prefix.NewStore(ctx.KVStore(k.storeKey), types.KeyPrefix(types.PostKey))
	iterator := sdk.KVStorePrefixIterator(store, types.KeyPrefix(types.PostKey))

	defer iterator.Close()

	for ; iterator.Valid(); iterator.Next() {
		var msg types.Post
		k.cdc.MustUnmarshalBinaryBare(iterator.Value(), &msg)
		msgs = append(msgs, msg)
	}

	return
}
```

`CreatePost` creates a key by concatenating a post prefix with an ID. If you look back at how  the store looks, you’ll notice keys have prefixes, for example `Post-value-0bae9f7d-20f8-4b51-9d5c-af9103177d66` contains the prefix `Post-value-` . The reason for this is you have one store, but you might want to keep different types of objects in it, like posts and users. Prefixing keys such as `Post-value-` and `User-value-` allows you to share one storage space between different types of objects.

## Add the Prefix for a Post

To define the post prefix add the following code:

```go
// x/blog/types/keys.go
package types

const (
	// Other constants...

	// PostKey defines the post value store key
  	PostKey= "Post-value-"

	// PostCountKey defines the post count store key
	PostCountKey= "Post-count-"
)
```

## Add the Codec

Finally, `store.Set(key, value)` writes your post to the store.
Two last things to do is tell your [encoder](https://docs.cosmos.network/master/core/encoding.html#amino) how the `MsgCreatePost` is converted to bytes.

```go
// x/blog/types/codec.go
package types

import (
	"github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
	// this line is used by starport scaffolding # 1
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
	amino     = codec.NewLegacyAmino()
	ModuleCdc = codec.NewAminoCodec(amino)
)
```

## Launch the Application

Now you are ready to build and start the app and create some posts.

To launch the application run:

```
starport chain serve
```

This command installs dependencies, builds and initializes the app, and runs servers. You can also do these tasks manually:

First, create a `Makefile` in your `/blog` root directory

### Create a Makefile

```bash
PACKAGES=$(shell go list ./... | grep -v '/simulation')

VERSION := $(shell echo $(shell git describe --tags) | sed 's/^v//')
COMMIT := $(shell git log -1 --format='%H')

ldflags = -X github.com/cosmos/cosmos-sdk/version.Name=blog \
	-X github.com/cosmos/cosmos-sdk/version.ServerName=blogd \
	-X github.com/cosmos/cosmos-sdk/version.Version=$(VERSION) \
	-X github.com/cosmos/cosmos-sdk/version.Commit=$(COMMIT) 

BUILD_FLAGS := -ldflags '$(ldflags)'

all: install

install: go.sum
	@echo "--> Installing blogd"
	@go install -mod=readonly $(BUILD_FLAGS) ./cmd/blogd

go.sum: go.mod
	@echo "--> Ensure dependencies have not been modified"
	GO111MODULE=on go mod verify

test:
	@go test -mod=readonly $(PACKAGES)
```


1. `go mod tidy` cleans up dependencies.
2. `make` builds your app and creates a binary in your go path: `blogd`.
3. Initialization scripts in the `Makefile` removes data directories, configures your app and generates two accounts. By default your app stores data in your home directory in `~/.blogd`. The script removes them, so every time you have a clean state.
4. `blogd start` launches your app. After a couple of seconds you see hashes of blocks being generated. Leave this terminal window open and open a new one.

Note: depending on your OS and firewall settings, you may have to accept a prompt asking if your application's binary (`blogd` in this case) can accept external connections.

Run the following command to create a post:

```sh
blogd tx blog create-post "My first post" "This is a post\!" --from=alice --chain-id="blog"
```

- “My first post” is a title for your post and `--from=alice` tells the program who is creating this post. 
- `alice` is a label for your pair of keys used to sign the transaction, created by the initialization script located within the `/Makefile` previously. 
- `--chain-id="blog"` specifies to send the transaction to the `blog` chain-id
- Keys are stored in `~/.blogd`.

After running the command and confirming it, you see an object with “txhash” property with a value like `4B7B68DEACC7CDF3243965A449095B4AB895C9D9BDF0516725BF2173794A9B3C`.

To verify that the transaction has been processed, open a browser and visit the following URL (make sure to replace `4B7B6...` with the value of your txhash but make sure to have the `0x` prefix):

```
http://localhost:26657/tx?hash=0x4B7B68DEACC7CDF3243965A449095B4AB895C9D9BDF0516725BF2173794A9B3C
```
In the URL, retain the `0x` prefix but replace `4B7B6...` with the value of your txhash:
You can check out a basic block overview in a web browser:

```
http://localhost:12345/#/blocks
```

Congratulations! You have just created and launched your custom blockchain and sent the first transaction 🎉

## Forgot something?

### Unknown command "create-post" for "blog"

```bash
blogd tx blog create-post 'Hello!' 'My first post' --from=alice
ERROR: unknown command "create-post" for "blog"
```

Make sure you’ve added `cmd.AddCommand(CmdCreatePost())`, to `func GetTxCmd` in `x/blog/client/cli/tx.go`.

### Unrecognized blog message type

```bash
blogd tx blog create-post 'Hello!' 'My first post' --from=alice
ERROR: unrecognized blog message type
```

Make sure you have added 
`case *types.MsgCreatePost:
	return handleMsgCreatePost(ctx, k, msg)
`
to `func NewHandler` in `x/blog/handler.go`

### Cannot encode unregistered concrete type

```bash
blogd tx blog create-post Hello! --from=alice
panic: Cannot encode unregistered concrete type types.MsgCreatePost.
```

Make sure you’ve added `cdc.RegisterConcrete(MsgCreatePost{}, "blog/CreatePost", nil)` to `func RegisterCodec` in `x/blog/types/codec.go`.

### not found: key not found

```bash
Error: rpc error: code = NotFound desc = account cosmos1t3rafxvy3ggluchm5sjzetj9wt50eq9hjay6f2 not found: key not found
```

Make sure that you wait for the first block to be created after bootstrapping a chain again.
