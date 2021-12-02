---
title: "Starport"
order: 2
description: An easy way to build your application-specific blockchain
tag: deep-dive
---

# Starport

<HighlightBox type="synopsis">

It is time to take a closer look at Starport. Before diving into the details of how Starport helps you scaffold the basics for your application blockchain make sure to understand the main concepts presented in the following sections:

* [A Blockchain App Architecture](../main-concepts/architecture.md)
* [Accounts](../main-concepts/accounts.md)
* [Transactions](../main-concepts/transactions.md)
* [Messages](../main-concepts/messages.md))
* [Modules](../main-concepts/modules.md))
* [Protobuf](../main-concepts/protobuf.md)
* [BaseApp](../main-concepts/base-app.md)

You can follow a hands-on exercise for Starport in the sections that follow this introduction.

</HighlightBox>

The Cosmos SDK provides the building blocks for a complete Tendermint blockchain, which implements the Inter-Blockchain Communication Protocol (IBC). The _BaseApp_ of the Cosmos SDK assembles these building blocks and provides a fully-running blockchain. All there is left to do for the specific blockchain application is to create specific modules and integrate them with BaseApp to make the application _your own_.

Starport assists with scaffolding modules and integrating them with BaseApp. Starport is a command-line tool that writes code files and updates them when instructed to do so. If you come from an _on Rails_ world, the concept will look familiar to you.

On top of that Starport will handle some compilation, run a local blockchain node, and help the developer in other respects.


Let’s look at a simple run of Starport.

<YoutubePlayer videoId="pFAM6mkKoTA"/>


## Install

<HighlightBox type="tip">

Want to dedicate some time to dive deeper into installing Starport? Have a look at [how to install Starport in the Starport Developer Guide](https://docs.starport.com/guide/install.html).

</HighlightBox>

To install Starport at the command line:

```sh
$ curl https://get.starport.com/starport! | bash
```

You can verify the version of Starport you have once it is installed:

```sh
$ starport version

Starport version:	v0.18.3
...
```

You can also just type `starport` to see the offered commands:

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

An introductory tutorial is a great place to start your journey into the Cosmos ecosystem. Head on over to the _[Hello World](https://docs.starport.network/guide/hello.html)_ tutorial in the [Starport Developer Guide](https://docs.starport.com/).

You can see the Hello-World response at [http://localhost:1317/cosmonaut/hello/hello/posts](http://localhost:1317/cosmonaut/hello/hello/posts) after following the _Hello World_ tutorial.

</HighlightBox>

## Your chain

Let's get started by scaffolding a basic chain called `checkers` that you will place under the GitHub path Alice with:

```sh
$ starport scaffold chain github.com/alice/checkers
```

The scaffolding takes some time as it generates the source code for a fully functional ready-to-use blockchain. A folder `checkers` is created after the chain is scaffolded.

The `checkers` folder contains several generated files and directories that make up the structure of a Cosmos SDK blockchain. It contains the following folders:

* `app`. A folder for the application.
* `cmd`. A folder for the commands.
* `proto`. A folder for the Protobuf definitions.
* `vue`. A folder for the UI.

<HighlightBox type="tip">

If Vue.js is something new to you, check out the [Vue.js website](https://vuejs.org/) for more on this JavaScript framework.

</HighlightBox>

If you look at the code that Starport generates, you will often see comments like the following:

```go
// this line is used by starport scaffolding # 1
```

**Caution:** Do not remove or replace any such lines in your code as they provide markers for Starport on where to add further code when instructed to do so. Do not rename or move any file that contains such a line for the same reason.

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

You will have a local testnet with a running node after this command completes.

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

You can set the accounts, the accounts' starting balances, and the validator in this file. You can also let Starport generate a client and a faucet. The faucet gives away five `token` and 100,000 `stake` tokens belonging to Bob each time it is called.

You can observe the endpoints of the blockchain in the output of the `starport chain serve` command:

```sh
🌍 Tendermint node: http://0.0.0.0:26657
🌍 Blockchain API: http://0.0.0.0:1317
🌍 Token faucet: http://0.0.0.0:4500
```

Starport can detect any change to the source code. It immediately rebuilds the binaries before restarting the blockchain and keeping the state.

Now boot up the frontend using the commands provided in the `readme.md` file of the `checkers` folder:

```sh
$ cd vue
$ npm install
$ npm run serve
```

Navigate to [localhost:8080](http://localhost:8080/). You can see no wallet has been created or imported yet. Load Alice's wallet in the GUI to have some tokens. Use the mnemonic for Alice, which you can find in the output of the `starport chain serve` command, and copy and paste it to _import a wallet_.

Now you should see the balance of Alice's account and can act on her behalf.

Select **Custom Type** in the sidebar to see custom types. There are no custom types yet - this page is empty for now.

It is **good practice** to make a Git commit before you create a new `message`. It is generally recommended to make a Git commit before running any `starport scaffold` command. The Git commit makes seeing what was added and revert changes easier.

With your Git commit tucked away, now create a simple `message` with:

```sh
$ starport scaffold message createPost title body
```

The `starport scaffold message` command accepts a message named `createPost` as the first argument and a list of fields for the message, here `title` and `body`, which are `string`s.

A message is scaffolded in a module with a name that matches the name of the project by default. It is named `checkers` in this case. Learn more about your options with:

```sh
$ starport scaffold message --help
```

You can see a list of files that were created or modified by the `scaffold message` command in the Terminal output:

```sh
modify proto/chain/tx.proto
modify x/chain/client/cli/tx.go
create x/chain/client/cli/tx_create_post.go
modify x/chain/handler.go
create x/chain/keeper/msg_server_create_post.go
modify x/chain/types/codec.go
create x/chain/types/message_create_post.go
```

You can find the definition of the message in the `proto/chain/tx.proto` file. Open it:

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

Starport scaffolds a GUI with a Vue.js frontend framework. You can find a function in your `vue/src/store/generated/alice/checkers/alice.checkers.checkers/index.js` file:

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

## Next up

You just created a fully working Cosmos SDK chain, one that forms the basis of the [following guided exercise](./stored-game.md). 

<HighlightBox type="info">

You may remove the `CreatePost` message as it is not part of the guided exercise in the next sections.

</HighlightBox>
