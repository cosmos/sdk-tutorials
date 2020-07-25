# Create posts

By following this beginner tutorial, you will end up with a simple blog app that is powered by the Cosmos SDK.

## Prerequisites

- A [recent version of Go](https://golang.org/doc/install) installed.

## Getting Started

Let's get started! The first step is to install the `starport` CLI tool:

### NPM

```
npm install -g @tendermint/starport
```

### Homebrew

```
brew install tendermint/tap/starport
```

Alternatively, Starport can be built [from source](http://github.com/tendermint/starport).

After `starport` is installed, use it to create the initial app structure inside a directory named `blog`:

```
starport app github.com/example/blog
```

One of the main features of Starport is code generation. The command above has generated a directory structure with a working blockchain application. Starport can also add data types to your app with `starport type` command. To see it in action, follow the poll application tutorial. In this guide, however, we'll create those files manually to understand how it all works under the hood.

This blog app will store data in a persistent key-value store. Similarly to most key-value stores, you can retrieve, delete, update, and loop through keys to obtain the values you are interested in.

We’ll be creating a simple blog-like application, so let’s define the first type, the `Post`.

## x/blog/types/types.go

```go
package types

import (
  sdk "github.com/cosmos/cosmos-sdk/types"
)

// Post is a type containing Creator, Title, and ID
type Post struct {
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
  Title   string         `json:"title" yaml:"title"`
  ID      string         `json:"id" yaml:"id"`
}
```

The code above defines the three properties of a post: Creator, Title and ID. The SDK provides useful types to represent things like addresses, so we use `sdk.AccAddress` for Creator. A Title is stored as a string. Lastly, we generate unique global IDs for each post and also store them as strings.

Posts in our key-value store will look like this:

```
"post-0bae9f7d-20f8-4b51-9d5c-af9103177d66": {
  "Creator": "cosmos18cd5t4msvp2lpuvh99rwglrmjrrw9qx5h3f3gz",
  "Title": "This is a post!",
  "ID": "0bae9f7d-20f8-4b51-9d5c-af9103177d66"
},
"post-8c6d8cd4-b4c9-4ba3-a683-e894db3f2605": {
  ...
}
```

Right now the store is empty. Let's figure out how to add posts.

With the Cosmos SDK, users can interact with your app with either a CLI (`blogcli`) or by sending HTTP requests. Let's define the CLI command first. Users should be able to type `blogcli tx blog create-post "This is a post!" --from=user1` to add a post to your store. The `create-post` subcommand hasn’t been defined yet--let’s do it now.

## x/blog/client/cli/tx.go

In the `import` block, make sure to import these six additional packages:

```go
import (
  // Existing imports...
  "bufio"
  "github.com/cosmos/cosmos-sdk/client/context"
  "github.com/cosmos/cosmos-sdk/x/auth"
  "github.com/cosmos/cosmos-sdk/x/auth/client/utils"
  sdk "github.com/cosmos/cosmos-sdk/types"
)
```

This file already contains `func GetTxCmd` which defines custom `blogcli` commands. We will add the custom `create-post` command to our `blogcli` by first adding `GetCmdCreatePost` to `blogTxCmd`.

```go
  blogTxCmd.AddCommand(flags.PostCommands(
    GetCmdCreatePost(cdc),
  )...)
```

At the end of the file, let's define `GetCmdCreatePost` itself.

```go
func GetCmdCreatePost(cdc *codec.Codec) *cobra.Command {
  return &cobra.Command{
    Use:   "create-post [title]",
    Short: "Creates a new post",
    Args:  cobra.ExactArgs(1),
    RunE: func(cmd *cobra.Command, args []string) error {
      cliCtx := context.NewCLIContext().WithCodec(cdc)
      inBuf := bufio.NewReader(cmd.InOrStdin())
      txBldr := auth.NewTxBuilderFromCLI(inBuf).WithTxEncoder(utils.GetTxEncoder(cdc))
      msg := types.NewMsgCreatePost(cliCtx.GetFromAddress(), args[0])
      err := msg.ValidateBasic()
      if err != nil {
        return err
      }
      return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
    },
  }
}
```

The function above defines what happens when you run the `create-post` subcommand. `create-post` takes one argument `[title]`, creates a message `NewMsgCreatePost` (with title as `args[0]`) and broadcasts this message to be processed in your application.
This is a common pattern in the SDK: users make changes to the store by broadcasting messages. Both CLI commands and HTTP requests create messages that can be broadcasted in order for state transition to occur.

Let’s define `NewMsgCreatePost` in a new file you should create as `x/blog/types/MsgCreatePost.go`.

## x/blog/types/MsgCreatePost.go

```go
package types
import (
  sdk "github.com/cosmos/cosmos-sdk/types"
  sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
  "github.com/google/uuid"
)
var _ sdk.Msg = &MsgCreatePost{}
type MsgCreatePost struct {
  Creator sdk.AccAddress `json:"creator" yaml:"creator"`
  Title   string         `json:"title" yaml:"title"`
  ID      string         `json:"id" yaml:"id"`
}
```

Similarly to the post struct, `MsgCreatePost` contains creator and title properties. We don’t include ID property, because `MsgCreatePost` defines only the data we accept from the user—we will be generating ID automatically on the next step.

```go
// NewMsgCreatePost creates the `MsgCreatePost` message
func NewMsgCreatePost(creator sdk.AccAddress, title string) MsgCreatePost {
  return MsgCreatePost{
    Creator: creator,
    Title:   title,
    ID:      uuid.New().String(),
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
func (msg MsgCreatePost) GetSigners() []sdk.AccAddress {
  return []sdk.AccAddress{sdk.AccAddress(msg.Creator)}
}
// GetSignBytes ...
func (msg MsgCreatePost) GetSignBytes() []byte {
  bz := ModuleCdc.MustMarshalJSON(msg)
  return sdk.MustSortJSON(bz)
}
// ValidateBasic ...
func (msg MsgCreatePost) ValidateBasic() error {
  if msg.Creator.Empty() {
    return sdkerrors.Wrap(sdkerrors.ErrInvalidAddress, "creator can't be empty")
  }
  return nil
}
```

Going back to `GetCmdCreatePost` in `x/blog/client/cli/tx.go`, you'll see `MsgCreatePost` being created and broadcast with `GenerateOrBroadcastMsgs`.

After being broadcast, the messages are processed by an important part of the SDK, called **handlers**.

## x/blog/handler.go
Begin by importing your new blog types that we created:
```go
import (
  // Existing imports...
  "github.com/example/blog/x/blog/types"
)
```

You should already have `func NewHandler` defined which lists all available handlers. Modify it to include a new function called `handleMsgCreatePost`.

```go
    switch msg := msg.(type) {
    case types.MsgCreatePost:
      return handleMsgCreatePost(ctx, k, msg)
    default:
```

Now let’s define `handleMsgCreatePost`:

```go
func handleMsgCreatePost(ctx sdk.Context, k Keeper, msg types.MsgCreatePost) (*sdk.Result, error) {
  var post = types.Post{
    Creator: msg.Creator,
    ID:      msg.ID,
    Title:   msg.Title,
  }
  k.CreatePost(ctx, post)
  return &sdk.Result{Events: ctx.EventManager().Events()}, nil
}
```

In this handler you create a `Post` object (post type was defined in the very first step). You populate the post object with creator and title from the message (`msg.Creator` and `msg.Title`) and use the unique ID that was generated in `tx.go` with `NewMsgCreatePost()` using `uuid.New().String()`.

After creating a post object with creator, ID and title, the message handler calls `k.CreatePost(ctx, post)`. “k” stands for Keeper, an abstraction used by the SDK that writes data to the store. Let’s define the `CreatePost` keeper function.

## x/blog/keeper/keeper.go

```go
func (k Keeper) CreatePost(ctx sdk.Context, post types.Post) {
  store := ctx.KVStore(k.storeKey)
  key := []byte(types.PostPrefix + post.ID)
  value := k.cdc.MustMarshalBinaryLengthPrefixed(post)
  store.Set(key, value)
}
```

`CreatePost` creates a key by concatenating a post prefix with an ID. If you look back at how our store looks, you’ll notice keys have prefixes `post-0bae9f7d-20f8-4b51-9d5c-af9103177d66` in this case `post-` . The reason for this is you have one store, but you might want to keep different types of objects in it, like posts and users. Prefixing keys with `post-` and `user-` allows you to share one namespace between different types of objects.

## x/blog/types/key.go

To define the post prefix add the following code:

```go
package types

const (
  // Other constants...
  // PostPrefix is used for keys in the KV store
  PostPrefix = "post-"
)
```

## x/blog/types/codec.go

Finally, `store.Set(key, value)` writes our post to the store.
Two last things to do is tell our encoder how our `MsgCreatePost` is converted to bytes.

```go
func RegisterCodec(cdc *codec.Codec) {
  cdc.RegisterConcrete(MsgCreatePost{}, "blog/CreatePost", nil)
}
```

## x/blog/alias.go

And modify `alias.go` to bring message types from types package to blog package:

```go
var (
  // ...
  NewMsgCreatePost = types.NewMsgCreatePost
)
type (
  // ...
  MsgCreatePost = types.MsgCreatePost
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
3. Initialization scripts in the `Makefile` removes data directories, configures your app and generates two accounts. By default your app stores data in your home directory in `~/.blogd` and `~/.blogcli`. The script removes them, so every time you have a clean state.
4. `blogd start` launches your app. After a couple of seconds you will see hashes of blocks being generated. Leave this terminal window open and open a new one.

Note: depending on your OS and firewall settings, you may have to accept a prompt asking if your application's binary (`blogd` in this case) can accept external connections.

Run the following command to create a post:

```sh
blogcli tx blog create-post 'This is a post!" --from=user1
```

“This is a post!” is a title for our post and `--from=user1` tells the program who is creating this post. `user1` is a label for your pair of keys used to sign the transaction, created by initialization script previously. Keys are stored in `~/.blogcli`.

After running the command and confirming it, you will see an object with “txhash” property with a value like `CA1491B39384A4F29E568F62B156E0F2D0601507EF499CE1B8F3930BAFE7F03C`.

To verify that the transaction has been processed, open a browser and visit the following URL (make sure to replace `CA14...` with the value of your txhash):

```
http://localhost:26657/tx?hash=0xCA1491B39384A4F29E568F62B156E0F2D0601507EF499CE1B8F3930BAFE7F03C
```

Congratulations! You have just created and launched your custom blockhain and sent the first transaction.

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
blogcli tx blog create-post Hello! --from=user1
ERROR: unknown command "create-post" for "blog"
```

Make sure you’ve added `GetCmdCreatePost(cdc)`, to `func GetTxCmd` in `x/blog/client/cli/tx.go`.

### Cannot encode unregistered concrete type

```sh
blogcli tx blog create-post Hello! --from=user1
panic: Cannot encode unregistered concrete type types.MsgCreatePost.
```

Make sure you’ve added `cdc.RegisterConcrete(MsgCreatePost{}, "blog/CreatePost", nil)` to `func RegisterCodec` in `x/blog/types/codec.go`.
