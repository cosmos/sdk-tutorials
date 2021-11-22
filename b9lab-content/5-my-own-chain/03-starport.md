---
title: "Starport"
order: 2
description: An easy way to build your application-specific blockchain
tag: deep-dive
---

# Starport

The Cosmos SDK provides the building blocks that make a complete Tendermint blockchain. One that, additionally, implements the IBC protocol. The _base app_ of the Cosmos SDK assembles these building blocks together and provides you with a fully running blockchain. All there is left to do for your specific blockchain application is to create your modules, their code, and integrate them with the base app so as to make it _your app_. That's still more work ahead.

Fortunately, Starport is here to assist you with scaffolding your modules and integrating them with the base app. This is a command-line tool that writes code files, and updates them too when you instruct it. If you come from an _on Rails_ world, the concept will look familiar to you.

On top of that, Starport will handle some compilation, run a local blockchain node and do other helpful stuff.

## Install

<HighlightBox type="tip">

Want to dedicate some time to dive deeper when it comes to installing Starport? Have a look at how to install Starport [in the Starport documentation](install Starport).

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
Helpfully, you can also just type `starport` to see the commands it offers:

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
An introductory tutorial is a great place to start your journey into the Cosmos ecosystem. Head on over to the [Hello, World](https://docs.starport.network/guide/hello.html) tutorial in the [Starport Developer Guide](https://docs.starport.com/).

When you have followed the Hello-World tutorial, you can see the Hello-World response at [http://localhost:1317/cosmonaut/hello/hello/posts](http://localhost:1317/cosmonaut/hello/hello/posts).

## Your chain

You can create a brand new chain project, named checkers for instance, for Alice with:

```sh
$ starport scaffold chain github.com/alice/checkers
```
The scaffolding takes some time as it generates the source code for a fully functional ready-to-use blockchain. After the chain is scaffolded, you have a folder `checkers`.

The `checkers` folder contains a number of generated files and directories that make up the structure of a Cosmos SDK blockchain:

  - A folder for the application called `app`.
  - A folder for the commands called `cmd`.
  - A folder for the protobuff definitions called `proto`.
  - A folder for the UI called `vue`, see [Vue.js](https://vuejs.org/).

In the code generated, you can observe lines like the following:

```golang
// this line is used by starport scaffolding # 1
```
Do not remove or replace any such line in your code as they provide markers for Starport about where to add further code when instructed. Do not rename or move any file that contains such a line, for the same reason.

IS this project already functional? Go into the `checkers` folder, run:

```sh
$ cd checkers
$ starport chain serve
```
The `starport chain serve` command downloads dependencies and compiles the source code into a binary called `checkersd`. The command:

  - Installs all dependencies.
  - Builds protobuf files.
  - Compiles the application.
  - Initializes the node with a single validator.
  - Adds accounts.

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
In this file, you can set the accounts, their starting balances, and the validator. In addition, you can let Starport generate a client and a faucet. Here, each time the faucet is called, it gives away 5 `token` and 100,000 `stake` tokens belonging to Bob.

You can observe the endpoints of the blockchain in the output of the `starport chain serve` command:

```sh
🌍 Tendermint node: http://0.0.0.0:26657
🌍 Blockchain API: http://0.0.0.0:1317
🌍 Token faucet: http://0.0.0.0:4500
```
Starport can detect any change you make to the source code, and immediately rebuilds the binaries before restarting the blockchain and keeping the state.

Now, boot up the front end using the commands provided in the `readme.md` file in the `checkers` folder:

```sh
$ cd vue
$ npm install
$ npm run serve
```
Navigate to [localhost:8080](http://localhost:8080/). You can see that no wallet has been created or imported yet. In order to already have some tokens, you can choose to load Alice's wallet in the GUI. For that, use the mnemonic for Alice, which you can find in the output of the `starport chain serve` command, and copy / paste it to _import a wallet_.

Now you should see the balance of Alice's account and act as her.

In the sidebar, select **Custom Type** to view the custom type. There are no custom types yet, therefore this page is empty for now.

Before you create a new `message`, it is good practice to make a Git commit at this point. In fact, it is recommended to make a Git commit before any run of a `starport scaffold` command. This way, you can clearly see what it added, and makes it easy for you to revert if you are not satisfied, or if your command was incomplete in hindsight.

With your Git commit tucked away, let's create a simple `message` with:

```sh
$ starport scaffold message createPost title body
```
The `starport scaffold message` command accepts a message name `createPost` as the first argument, and a list of fields for the message, here `title` and `body`, which, unless specified, are `string`.

By default, a message is scaffolded in a module with a name that matches the name of the project, in this case, `checkers`. Better still, learn about your options with:

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
As for GUI, Starport scaffolds one with the Vue.js frontend framework. For instance, you can find a function in your `vue/src/store/generated/alice/checkers/alice.checkers.checkers/index.js` file:

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
You just created a fully working Cosmos SDK chain, one that forms the basis of the following guided exercise if you choose to follow it. You may remove the `CreatePost` message as it is not part of the guided exercise.

## Next

- [Create an IBC Interchain Exchange module](https://tutorials.cosmos.network/interchain-exchange/tutorial/00-intro.html)
