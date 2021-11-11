---
title: "Starport"
order: 2
description: An easy way to build your application-specific blockchain
tag: deep-dive
---

# Starport

## Install

The quickest and simplest way to create blockchain applications with the Cosmos SDK is to use Starport. 

To install Starport at the command line:

```bash
$ curl https://get.starport.network/starport! | bash

```bash
$ sudo mv starport /usr/local/bin/
```

To verify the version of Starport you have installed:

```bash
$ starport version
```

You can also just type `starport` to see the commands it offers:

```bash
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

You can see the Hello-World response at [http://localhost:1317/cosmonaut/hello/hello/posts](http://localhost:1317/cosmonaut/hello/hello/posts). 

## Your chain

You can create a chain for Alice with:

```bash
$ starport scaffold chain github.com/alice/chain
```

The scaffolding takes some time as it generates the source code for a fully functional ready-to-use blockchain. After the chain is scaffolded, you have a folder `chain`. 

The `chain` folder contains a number of generated files and directories that make up the structure of a Cosmos SDK blockchain:

  - A folder for the application called `app`
  - A folder for the commands called `cmd`
  - A folder for the protobuff definitions called `proto`
  - A folder for the UI called `vue`, see [Vue.js](https://vuejs.org/)

In the code, you can observe the following line that provides helpful context:

```golang
// this line is used by starport scaffolding # 1
```

Do not remove or replace this line in your code as it keeps Starport working.

So in the `chain` folder, run:

```bash
$ starport chain serve
```

The `starport chain serve` command downloads dependencies and compiles the source code into a binary called `chaind`. The command:

  - Installs all dependicies
  - Builds protobuff files
  - Compiles the application
  - Initializes the node with a single validator
  - Adds accounts

After this command completes, you have a testnet with a running node. 

Take a look at the `config.yml` file in the `chain` folder:

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

In this file, you can set the accounts and the validator. In addition, you can let Starport generate a client and a faucet. 

You can observe the endpoints of the blockchain in the output of the `starport chain serve` command:

```bash
🌍 Tendermint node: http://0.0.0.0:26657
🌍 Blockchain API: http://0.0.0.0:1317
🌍 Token faucet: http://0.0.0.0:4500
```

After you make any changes in the source, Starport rebuilds the binaries before starting the blockchain and keeps the state. 

Now, create a front end using the commands provided in the `readme.md` file in the `chain` folder:

```bash
$ cd vue
$ npm install
$ npm run serve
```

Navigate to [http://localhost:8080/](http://localhost:8080/). See that no wallet is created or imported yet. Use the mnemonic for Alice in the output of the `starport chain serve` command to import a wallet.

Now you can see the balance of Alice's account. 

In the sidebar, select **Custom Type** to view the custom type. There are no custom types yet, so this page is empty at the moment. You can create a `message` with:

```bash
$  starport scaffold message createPost title body
```

The starport scaffold message command accepts the message name `createPost` as the first argument and a list of fields (`title` and `body`) for the message. 

By default, a message is scaffolded in a module with a name that matches the name of the project, in this case, `chain`. 

In the terminal output, you see the list of files that are created or modified by the `message` command:

```bash
modify proto/chain/tx.proto
modify x/chain/client/cli/tx.go
create x/chain/client/cli/tx_create_post.go
modify x/chain/handler.go
create x/chain/keeper/msg_server_create_post.go
modify x/chain/types/codec.go
create x/chain/types/message_create_post.go
```

You see in the `proto/chain/tx.proto` the definition of the message:

```golang
// this line is used by starport scaffolding # proto/tx/message
message MsgCreatePost {
  string creator = 1;
  string title = 2;
  string body = 3;
}
```

Starport will also include a command into the CLI:

```golang
func CmdCreatePost() *cobra.Command {
  cmd := &cobra.Command{
    Use:   "create-post [title] [body]",
    Short: "Broadcast message createPost",
    Args:  cobra.ExactArgs(2),
    ...
```

Starport uses the Vue.js frontend, so you can find a function in the `starport/chain/vue/src/store/generated/alice/chain/alice.chain.chain/index.js` file:

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


## Next 

- [Create an IBC Interchain Exchange module](https://tutorials.cosmos.network/interchain-exchange/tutorial/00-intro.html)