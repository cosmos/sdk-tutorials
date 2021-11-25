---
title: "Starport"
order: 2
description: An easy way to build your application-specific blockchain
tag: deep-dive
---

# Starport

The Cosmos SDK provides the building blocks for a complete Tendermint blockchain, which implements the Inter-Blockchain Communication (IBC) protocol. The _BaseApp_ of the Cosmos SDK assembles these building blocks and provides a fully-running blockchain. All there is left to do for a specific blockchain application is to create specific modules and integrate them with the BaseApp to make the application _your own_.

Fortunately, Starport assists with scaffolding modules and integrating them with the BaseApp, which is a command-line tool that writes code files and updates them when instructed to do so. If you come from an _on Rails_ world, the concept will look familiar to you.

On top of that, Starport will handle some compilation, run a local blockchain node, and take care of other helpful aspects.

## Install

<HighlightBox type="tip">

Want to dedicate some time to dive deeper when it comes to installing Starport? Have a look at [how to install Starport in the Starport Developer Guide](https://docs.starport.com/guide/install.html).

</HighlightBox>

To install Starport at the command line:

```sh
$ curl https://get.starport.com/starport! | bash
```

Once installed, you can verify the version of Starport you have:

```sh
$ starport version

Starport version:	v0.18.3
...
```

Helpfully, you can also just type `starport` to see the offered commands:

```sh
Starport is a tool for creating sovereign blockchains built with Cosmos SDK, the world’s
most popular modular blockchain framework. Starport offers everything you need to scaffold,
test, build, and launch your blockchain.

To get started, create a blockchain:

starport scaffold chain github.com/cosmonaut/mars

Usage:
  starport [command]

Available Commands:
  scaffold    Scaffold a new blockchain, module, message, query, and more
  chain       Build, initialize and start a blockchain node or perform other actions on the blockchain
  generate    Generate clients, API docs from source code
  network     Launch a blockchain network in production
  relayer     Connects blockchains via IBC protocol
  tools       Tools for advanced users
  docs        Show Starport docs
  version     Print the current build information
  help        Help about any command

Flags:
  -h, --help   help for starport

Use "starport [command] --help" for more information about a command.
```

<HighlightBox type="tip">

An introductory tutorial is a great place to start your journey into the Cosmos ecosystem. Head on over to the [Hello, World](https://docs.starport.network/guide/hello.html) tutorial in the [Starport Developer Guide](https://docs.starport.com/).

When you have followed the Hello-World tutorial, you can see the Hello-World response at [http://localhost:1317/cosmonaut/hello/hello/posts](http://localhost:1317/cosmonaut/hello/hello/posts).

</HighlightBox>

## Your chain

You can create a brand new chain project, named checkers for example, for Alice with:

```sh
$ starport scaffold chain github.com/alice/checkers
```

The scaffolding takes some time as it generates the source code for a fully functional ready-to-use blockchain. After the chain is scaffolded, a folder `checkers` is created.

The `checkers` folder contains several generated files and directories that make up the structure of a Cosmos SDK blockchain. It contains the following folders:

* `app`: a folder for the application.
* `cmd`: a folder for the commands.
* `proto`: a folder for the Protobuff definitions.
* `vue`: a folder for the UI.

<HighlightBox type="tip">

If Vue.js is something new to you, check out the [Vue.js website](https://vuejs.org/) for more on this JavaScript framework.

</HighlightBox>

In the generated code, you can observe lines similar to the following:

```golang
// this line is used by starport scaffolding # 1
```

**Do not remove or replace any such line in your code as they provide markers for Starport on where to add further code when instructed to do so. Do not rename or move any file that contains such a line, for the same reason.**

Is this project already functional? Go to the `checkers` folder and run:

```sh
$ cd checkers
$ starport chain serve
```

The `starport chain serve` command downloads dependencies and compiles the source code into a binary called `checkersd`. The command:

* Installs all dependencies.
* Builds Protobuf files.
* Compiles the application.
* Initializes the node with a single validator.
* Adds accounts.

After this command completes, you have a local testnet with a running node.

Take a look at the `config.yml` file in the `checkers` folder:

```yaml
accounts:
  - name: alice
    coins: ["20000token", "200000000stake"]
  - name: bob
    coins: ["10000token", "100000000stake"]
validator:
  name: alice
  staked: "100000000stake"
client:
  vuex:
    path: "vue/src/store"
  openapi:
    path: "docs/static/openapi.yml"
faucet:
  name: bob
  coins: ["5token", "100000stake"]
```

In this file, you can set the accounts, the accounts' starting balances, and the validator. In addition, you can let Starport generate a client and a faucet. Here, each time the faucet is called, it gives away five `token` and 100,000 `stake` tokens belonging to Bob.

You can observe the endpoints of the blockchain in the output of the `starport chain serve` command:

```sh
🌍 Tendermint node: http://0.0.0.0:26657
🌍 Blockchain API: http://0.0.0.0:1317
🌍 Token faucet: http://0.0.0.0:4500
```

Starport can detect any change to the source code, and immediately rebuilds the binaries before restarting the blockchain and keeping the state.

Now, boot up the frontend using the commands provided in the `readme.md` file of the `checkers` folder:

```sh
$ cd vue
$ npm install
$ npm run serve
```

Navigate to [localhost:8080](http://localhost:8080/). You can see that no wallet has been created or imported yet. To already have some tokens, you can choose to load Alice's wallet in the GUI. For that, use the mnemonic for Alice, which you can find in the output of the `starport chain serve` command, and copy/paste it to _import a wallet_.

Now, you should see the balance of Alice's account and be able to act as her.

In the sidebar, select **Custom Type** to view the custom type. There are no custom types yet. Therefore, this page is empty for now.

Before you create a new `message`, it is **good practice** to make a Git commit at this point. It is recommended to make a Git commit before running any `starport scaffold` command. With the Git commit, you can see what was added and it becomes easy to revert changes, if you are not satisfied or if your command was incomplete in hindsight.

With your Git commit tucked away, create a simple `message` with:

```sh
$ starport scaffold message createPost title body
```

The `starport scaffold message` command accepts a message named `createPost` as the first argument and a list of fields for the message, here `title` and `body`, which, unless specified, are `string`.

By default, a message is scaffolded in a module with a name that matches the name of the project, in this case, `checkers`. Learn more about your options with:

```sh
$ starport scaffold message --help
```

In the terminal output, you can see the list of files that were created or modified by the `scaffold message` command:

```sh
modify proto/chain/tx.proto
modify x/chain/client/cli/tx.go
create x/chain/client/cli/tx_create_post.go
modify x/chain/handler.go
create x/chain/keeper/msg_server_create_post.go
modify x/chain/types/codec.go
create x/chain/types/message_create_post.go
```

Open the `proto/chain/tx.proto` file, where you can find the definition of the message:

```protobuf
// this line is used by starport scaffolding # proto/tx/message
message MsgCreatePost {
  string creator = 1;
  string title = 2;
  string body = 3;
}
```

Starport also wired a new command into your chain's CLI:

```go
func CmdCreatePost() *cobra.Command {
  cmd := &cobra.Command{
    Use:   "create-post [title] [body]",
    Short: "Broadcast message createPost",
    Args:  cobra.ExactArgs(2),
    ...
  }
}
```

As for the GUI, Starport scaffolds one with a Vue.js frontend framework. You can find a function in your `vue/src/store/generated/alice/checkers/alice.checkers.checkers/index.js` file:

```javascript
async MsgCreatePost({ rootGetters }, { value }) {
    try {
        const txClient = await initTxClient(rootGetters);
        const msg = await txClient.msgCreatePost(value);
        return msg;
    }
    catch (e) {
        if (e == MissingWalletError) {
            throw new SpVuexError('TxClient:MsgCreatePost:Init', 'Could not initialize signing client. Wallet is required.');
        }
        else {
            throw new SpVuexError('TxClient:MsgCreatePost:Create', 'Could not create message: ' + e.message);
        }
    }
}
```

You just created a fully working Cosmos SDK chain, one that forms the basis of the [following guided exercise](./03-starport-03-stored-game.md). You may remove the `CreatePost` message, as it is not part of the guided exercise.

## Next

- [Create an IBC Interchain Exchange module](https://tutorials.cosmos.network/interchain-exchange/tutorial/00-intro.html)
