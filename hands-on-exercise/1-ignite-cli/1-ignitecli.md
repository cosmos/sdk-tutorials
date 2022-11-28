---
title: "Ignite CLI"
order: 2
description: An easy way to build your application-specific blockchain
tags: 
  - guided-coding
  - cosmos-sdk
---

# Ignite CLI

<HighlightBox type="prerequisite">

Before diving into the details of how Ignite CLI helps you scaffold the basics for your application blockchain make sure to understand the main concepts presented in the following sections:

* [A Blockchain App Architecture](/academy/2-cosmos-concepts/1-architecture.md)
* [Accounts](/academy/2-cosmos-concepts/2-accounts.md)
* [Transactions](/academy/2-cosmos-concepts/3-transactions.md)
* [Messages](/academy/2-cosmos-concepts/4-messages.md)
* [Modules](/academy/2-cosmos-concepts/5-modules.md)
* [Protobuf](/academy/2-cosmos-concepts/6-protobuf.md)
* [BaseApp](/academy/2-cosmos-concepts/8-base-app.md)

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Install the Ignite CLI.
* Scaffold a blockchain.
* Use the CLI.
* Start the Ignite UI server.
* Send your first message.

You can follow a hands-on exercise for Ignite CLI in the sections that follow this introduction.

</HighlightBox>

The Cosmos SDK provides the building blocks for a complete Tendermint blockchain, which implements the Inter-Blockchain Communication Protocol (IBC). The _BaseApp_ of the Cosmos SDK assembles these building blocks and provides a fully-running blockchain. All there is left to do for the specific blockchain application is to create specific modules and integrate them with BaseApp to make the application _your own_.

<HighlightBox type="info">

Ignite CLI assists with scaffolding modules and integrating them with BaseApp. Ignite CLI is a command-line tool that writes code files and updates them when instructed to do so. If you come from an _on Rails_ world, the concept will look familiar to you.
<br/><br/>
Ignite CLI also handles some compilation, runs a local blockchain node, and helps you with other tasks.

</HighlightBox>

<YoutubePlayer videoId="MTUQQ6nOkZo"/>

## Install

<HighlightBox type="reading">

Want to dedicate some time to dive deeper into installing Ignite CLI? Learn [how to install Ignite CLI in the Ignite CLI Developer Guide](https://docs.ignite.com/guide/install.html).

</HighlightBox>

<HighlightBox type="best-practice">

If you do not want to install Go and Ignite on your computer, look at the **section about Docker below** to facilitate your handling of specific versions and platforms.

</HighlightBox>

This entire exercise was built using the Ignite CLI version 0.22.1. To install it at the command line:

```sh
$ curl https://get.ignite.com/cli@v0.22.1! | bash
```

Or if you install it in a Linux VM:

```sh
$ curl https://get.ignite.com/cli@v0.22.1! | sudo bash
```

You can verify the version of Ignite CLI you have once it is installed:

```sh
$ ignite version
```

This prints its version:

```txt
Ignite CLI version:     v0.22.1
...
```

<HighlightBox type="info">

This entire exercise was built using the Ignite CLI version noted above. Using a newer version could work, but you might run into compatibility issues if you clone any code made with _this_ version of Ignite CLI and then try to continue the project with _your_ version of Ignite CLI.
<br/><br/>
If you need to install the latest version of Ignite CLI, use:

```sh
$ curl https://get.ignite.com/cli@! | bash
```

When you then run `ignite version`, it prints its version:

```txt
Ignite CLI version:     v0.22.2
```

</HighlightBox>

<HighlightBox type="docs">

If you'd like to upgrade an existing project to the latest version of Ignite CLI, you can follow the [Ignite CLI migration documentation](https://github.com/ignite/cli/tree/develop/docs/docs/migration/).

</HighlightBox>

You can also just type `ignite` to see the offered commands:

```txt
Ignite CLI is a tool for creating sovereign blockchains built with Cosmos SDK, the world’s
most popular modular blockchain framework. Ignite CLI offers everything you need to scaffold,
test, build, and launch your blockchain.

To get started, create a blockchain:

ignite scaffold chain github.com/username/mars

Usage:
  ignite [command]

Available Commands:
  scaffold    Scaffold a new blockchain, module, message, query, and more
  chain       Build, initialize and start a blockchain node or perform other actions on the blockchain
  generate    Generate clients, API docs from source code
  account     Commands for managing accounts
  relayer     Connect blockchains by using IBC protocol
  tools       Tools for advanced users
  docs        Show Ignite CLI docs
  version     Print the current build information
  help        Help about any command
  completion  Generate the autocompletion script for the specified shell

Flags:
  -h, --help   help for ignite

Use "ignite [command] --help" for more information about a command.
```

## Prepare Docker

If you want to allow for portability and avoid version issues, it is advisable to use [Docker](https://docs.docker.com/engine/install/). If you are new to Docker, have a look at [this tutorial](/tutorials/5-docker-intro).

First, you need to create a `Dockerfile` that details the same preparation steps. Save this as `Dockerfile-ubuntu`:

```dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/ignite-start/Dockerfile-ubuntu]
FROM --platform=linux ubuntu:22.04
ARG BUILDARCH

# Change your versions here
ENV GO_VERSION=1.18.3
ENV IGNITE_VERSION=0.22.1
ENV NODE_VERSION=18.x

ENV LOCAL=/usr/local
ENV GOROOT=$LOCAL/go
ENV HOME=/root
ENV GOPATH=$HOME/go
ENV PATH=$GOROOT/bin:$GOPATH/bin:$PATH

RUN mkdir -p $GOPATH/bin

ENV PACKAGES curl gcc jq
RUN apt-get update
RUN apt-get install -y $PACKAGES

# Install Go
RUN curl -L https://go.dev/dl/go${GO_VERSION}.linux-$BUILDARCH.tar.gz | tar -C $LOCAL -xzf -

# Install Ignite
RUN curl -L https://get.ignite.com/cli@v${IGNITE_VERSION}! | bash

# Install Node
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash -
RUN apt-get install -y nodejs

EXPOSE 1317 3000 4500 5000 26657

WORKDIR /checkers
```

Next you need to create the Docker image:

```sh
$ docker build -f Dockerfile-ubuntu . -t checkers_i
```

You can confirm the installed version of Ignite:

```sh
$ docker run --rm -it checkers_i ignite version
```

It should return, among other things:

```txt
Ignite CLI version:     v0.22.1
```

That is the bare minimum required to be able to run the commands that come on this page. If at a later stage you want to create a persistent container named `checkers`, you can do:

```sh
$ docker create --name checkers -i -v $(pwd):/checkers -w /checkers -p 1317:1317 -p 3000:3000 -p 4500:4500 -p 5000:5000 -p 26657:26657 checkers_i
$ docker start checkers
```

## Your chain

Start by scaffolding a basic chain called `checkers` that you will place under the GitHub path `alice`:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite scaffold chain github.com/alice/checkers
```

</CodeGroupItem>

<CodeGroupItem title="Throwaway Docker container">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite scaffold chain github.com/alice/checkers
```

This only works if you have prepared the `checkers_i` Docker image.

</CodeGroupItem>

</CodeGroup>

`github.com/alice/checkers` is the name of the Golang module by which this project will be known. If you own the `github.com/alice` path, you can even eventually host it there and have other people use your project as a module.

<ExpansionPanel title="Troubleshooting">

For the sake of good support, the versions of all software used are communicated as encountered throughout this course. It is natural that after the writing of the course material some version changes will appear, and it may occur that something breaks. Instead of using different versions of the software from the ones in the course, please look at the following list, which might fix problems you are running into. Otherwise, use Docker as explained on this page.
<p></p>
If all else fails, please post the issue you face on Discord.

<PanelListItem number="1">

**Apple M1**

If you work with a machine using M1 architecture, the Docker image should allow you to run with your specific CPU architecture. However, if you encounter too many problems you can try the following:

1. Follow this course in a [Rosetta](https://www.courier.com/blog/tips-and-tricks-to-setup-your-apple-m1-for-development/) terminal.
2. Install [Homebrew](https://brew.sh/index).
3. Install Golang with `brew install go`.

</PanelListItem>

<PanelListItem number="2" :last="true">

**Building Errors during `scaffold`**

If you work with Go 1.18, you may need to install the following:

* ```sh
  $ go install github.com/grpc-ecosystem/grpc-gateway/protoc-gen-grpc-gateway@latest
  ```

* ```sh
  $ go install github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger@latest
  ```

* ```sh
  $ go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2@latest
  ```

* ```sh
  $ git clone https://github.com/regen-network/cosmos-proto
  $ cd cosmos-proto/protoc-gen-gocosmos
  $ go install
  ```

* ```sh
  $ go get github.com/golangci/golangci-lint/cmd/golangci-lint
  ```

* ```sh
  $ go get golang.org/x/crypto/ssh/terminal@v0.0.0-20220411220226-7b82a4e95df4
  ```

</PanelListItem>

</ExpansionPanel>

The scaffolding takes some time as it generates the source code for a fully functional, ready-to-use blockchain. Ignite CLI creates a folder named `checkers` and scaffolds the chain inside it.

The `checkers` folder contains several generated files and directories that make up the structure of a Cosmos SDK blockchain. It contains the following folders:

* [`app`](https://github.com/cosmos/b9-checkers-academy-draft/tree/ignite-start/app): a folder for the application.
* [`cmd`](https://github.com/cosmos/b9-checkers-academy-draft/tree/ignite-start/cmd): a folder for the command-line interface commands.
* [`proto`](https://github.com/cosmos/b9-checkers-academy-draft/tree/ignite-start/proto): a folder for the Protobuf objects definitions.
* [`vue`](https://github.com/cosmos/b9-checkers-academy-draft/tree/ignite-start/vue): a folder for the auto-generated UI.
* [`x`](https://github.com/cosmos/b9-checkers-academy-draft/tree/ignite-start/x): a folder for all your modules, in particular `checkers`.

<HighlightBox type="docs">

If Vue.js is something new to you, check out the [Vue.js website](https://vuejs.org/) for more on this JavaScript framework.

</HighlightBox>

If you look at the code that Ignite CLI generates, for instance in `./x/checkers/module.go`, you will often see comments like the following:

```go [https://github.com/cosmos/b9-checkers-academy-draft/blob/ignite-start/x/checkers/module.go#L6]
// this line is used by starport scaffolding # 1
```

<HighlightBox type="warn">

Do not remove or replace any lines like these in your code as they provide markers for Ignite CLI on where to add further code when instructed to do so. For the same reason, do not rename or move any file that contains such a line.

</HighlightBox>

Go to the `checkers` folder and run:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ cd checkers
$ ignite chain serve
```

</CodeGroupItem>

<CodeGroupItem title="Throwaway Docker">

```sh
$ cd checkers
$ docker run --rm -it -v $(pwd):/checkers -w /checkers -p 1317:1317 -p 3000:3000 -p 4500:4500 -p 5000:5000 -p 26657:26657 --name checkers checkers_i ignite chain serve
```

<HighlightBox type="note">

Notice how you still name the container `checkers` so that you can access it for further commands.

</HighlightBox>

</CodeGroupItem>

<CodeGroupItem title="Persistent Docker">

```sh
$ cd checkers
$ docker create --name checkers -i -v $(pwd):/checkers -w /checkers -p 1317:1317 -p 3000:3000 -p 4500:4500 -p 5000:5000 -p 26657:26657 checkers_i
$ docker start checkers
$ docker exec -it checkers ignite chain serve
```

</CodeGroupItem>

</CodeGroup>

The `ignite chain serve` command downloads (a lot of) dependencies and compiles the source code into a binary called `checkersd`. This command:

* Installs all dependencies.
* Builds Protobuf files.
* Compiles the application.
* Initializes the node with a single validator.
* Adds accounts.

<ExpansionPanel title="Go dependencies and Docker">

If you use Docker with throwaway containers (`run --rm`) you will notice that it downloads the Go dependencies every time. To increase your productivity, you can have the dependencies be downloaded in the Docker image itself:

1. Move your `Dockerfile-ubuntu` file into your checkers project, next to the `go.mod` file.
2. Add the following lines to `Dockerfile-ubuntu`:

  ```Dockerfile [https://github.com/cosmos/b9-checkers-academy-draft/blob/ignite-start/Dockerfile-ubuntu#L35-L37]
  COPY go.mod /checkers/go.mod
  RUN go mod download
  RUN rm /checkers/go.mod
  ```

3. Recreate the image:

  ```sh
  $ docker build -f Dockerfile-ubuntu . -t checkers_i
  ```

</ExpansionPanel>

After the `chain serve` command completes, you have a local testnet with a running node. What about the added accounts? Take a look:

```yaml [https://github.com/cosmos/b9-checkers-academy-draft/blob/ignite-start/config.yml]
accounts:
  - name: alice
    coins: ["20000token", "200000000stake"]
  - name: bob
    coins: ["10000token", "100000000stake"]
validator:
  name: alice
  staked: "100000000stake"
client:
  openapi:
    path: "docs/static/openapi.yml"
  vuex:
    path: "vue/src/store"
faucet:
  name: bob
  coins: ["5token", "100000stake"]
```

In this file you can set the accounts, the accounts' starting balances, and the validator. You can also let Ignite CLI generate a client and a faucet. The faucet gives away five `token` and 100,000 `stake` tokens belonging to Bob each time it is called.

You can observe the endpoints of the blockchain in the output of the `ignite chain serve` command:

```txt
🌍 Tendermint node: http://0.0.0.0:26657
🌍 Blockchain API: http://0.0.0.0:1317
🌍 Token faucet: http://0.0.0.0:4500
```

<HighlightBox type="info">

Ignite CLI can detect any change to the source code. When it does, it immediately rebuilds the binaries before restarting the blockchain and keeping the state.

</HighlightBox>

## Interact via the CLI

You can already interact with your running chain. With the chain running in its shell, open another shell and try:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd status
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd status
```

</CodeGroupItem>

</CodeGroup>

This prints:

```json
{"NodeInfo":{"protocol_version":{"p2p":"8","block":"11","app":"0"},"id":"8df1253b4deb59f63cc912dce096ab010c951e9d","listen_addr":"tcp://0.0.0.0:26656","network":"checkers","version":"0.34.19","channels":"40202122233038606100","moniker":"mynode","other":{"tx_index":"on","rpc_address":"tcp://0.0.0.0:26657"}},"SyncInfo":{"latest_block_hash":"6F167C4E2C99385857663B9531016DBC85DC0AEC1B58BF759B729EEAC843B92A","latest_app_hash":"EE408C7580E1E4A81E20190D9131FBD07AE1C536D3507DF9C6E0CB476A2D7680","latest_block_height":"13","latest_block_time":"2022-06-27T15:43:14.906782552Z","earliest_block_hash":"48250CF257E117F28FE207A71DDCA67459FEBE2EF1367D7B0EAE43754D5A53A1","earliest_app_hash":"E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855","earliest_block_height":"1","earliest_block_time":"2022-06-27T15:42:57.697745314Z","catching_up":false},"ValidatorInfo":{"Address":"98E9E157C87A44503BB8D01CAFC97DDB5D0C78DE","PubKey":{"type":"tendermint/PubKeyEd25519","value":"U3wlX8+lx6YQq3g2QbYnnAdUuMQ7AlMXH21Vxrq2OHg="},"VotingPower":"100"}}
```

In there you can see a hint of liveness: `"latest_block_height":"13"`. You can use this one-liner to better see the information:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd status 2>&1 | jq
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c "checkersd status 2>&1 | jq"
```

</CodeGroupItem>

</CodeGroup>

You can learn a lot by going through the possibilities with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ checkersd --help
$ checkersd status --help
$ checkersd query --help
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers checkersd --help
$ docker exec -it checkers checkersd status --help
$ docker exec -it checkers checkersd query --help
```

</CodeGroupItem>

</CodeGroup>

And so on.

## Your GUI

Ignite CLI also scaffolded a frontend. Boot it up by using the commands provided in the `README.md` file of the `vue` folder. Let the chain run in its own process and open a new terminal window in your `checkers` folder. In this terminal, execute:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ cd vue
$ npm install
$ npm run dev
```

If you want to serve on all network addresses, you need to run `npm run dev -- --host`.

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it checkers bash -c "cd vue && npm install"
$ docker exec -it checkers bash -c "cd vue && npm run dev -- --host"
```

</CodeGroupItem>

</CodeGroup>

---

Note the `--host` flag, which is forwarded to the underlying `vite` command thanks to the `--` separator. This is necessary if you run the frontend within Docker.

Navigate to [localhost:3000](http://localhost:3000/), or to whichever address was listed when running `dev`. The first load may take a few seconds. On the client-side, from the top right you can connect to the page via [Keplr](chrome://extensions/?id=dmkamcknogkgcdfhhbddcghachkejeap) if you are on the Chrome browser. You should see something like this:

![My Keplr account with nothing](/hands-on-exercise/1-ignite-cli/images/ignite-vue-keplr-no-assets.png)

Your account is connected but has no balance. This is a good opportunity to use the faucet:

1. Head to [http://localhost:4500](http://localhost:4500)
2. Expand the <kbd>POST / Send tokens to receiver account</kbd> box.
3. Click the <kbd>Try it out</kbd> button.
4. Paste your address in the JSON at `"address"`.
5. Click the big blue <kbd>Execute</kbd> button.

![Submit request to faucet](/hands-on-exercise/1-ignite-cli/images/faucet-request-1.png)

When you return to the main page, you should see your new assets:

![My Keplr account with tokens](/hands-on-exercise/1-ignite-cli/images/ignite-vue-keplr-with-tokens.png)

From here, you can send tokens around. You can also ask for `"10stake"` from the faucet, if you recall the name of the tokens from `config.yml`.

There is not much else to do. After all, this is the Cosmos BaseApp. Ignite will continue scaffolding this GUI as your checkers project advances.

<HighlightBox type="note">

Keplr is also able to import Alice and Bob (i.e. the accounts that Ignite created). Use Keplr's <kbd>+Add account</kbd> feature. This is a convenient way to bypass having to use the faucet. You will need to use Alice's mnemonic, which you can find in the output of the `ignite chain serve` command.
<br/><br/>
If you do not see the mnemonic, that is because the mnemonic was shown to you the first time you ran the command and you did not copy it. If so, reset with `ignite chain serve --reset-once`.
<br/><br/>
Now you should see the balance of Alice's account and can act on her behalf.

</HighlightBox>

<HighlightBox type="best-practice">

Make a Git commit before you create a new `message`. In fact, it is generally recommended to make a Git commit before running **any** `ignite scaffold` command. A Git commit protects the work you have done so far and makes it easier to see what the `scaffold` command added. It also makes it easy to just revert all changes if you are unsatisfied and want to run a different `scaffold` command.

</HighlightBox>

## Your first message

After your Git commit, and having stopped running Ignite, create a simple `message` with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite scaffold message createPost title body
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it -v $(pwd):/checkers -w /checkers checkers_i ignite scaffold message createPost title body
```

</CodeGroupItem>

</CodeGroup>

The `ignite scaffold message` command accepts a message name (here `createPost`) as the first argument, and a list of fields for the message (here `title` and `body`), which are `string` fields unless mentioned otherwise.

A message is scaffolded in a module with a name that matches the name of the project by default. It is named `checkers` in this case. Alternatively you could have used `--module checkers`. Learn more about your options with:

<CodeGroup>

<CodeGroupItem title="Local" active>

```sh
$ ignite scaffold message --help
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it checkers_i ignite scaffold message --help
```

</CodeGroupItem>

</CodeGroup>

You can see a list of files that were created or modified by the `scaffold message` command in the Terminal output:

```txt
modify proto/checkers/tx.proto
modify x/checkers/client/cli/tx.go
create x/checkers/client/cli/tx_create_post.go
modify x/checkers/handler.go
create x/checkers/keeper/msg_server_create_post.go
modify x/checkers/module_simulation.go
create x/checkers/simulation/create_post.go
modify x/checkers/types/codec.go
create x/checkers/types/message_create_post.go
create x/checkers/types/message_create_post_test.go
```

The `modify` was made possible thanks to the lines like `// this line is used by starport scaffolding # 1` that you did not remove.

So where is everything? You can find the root definition of your new message in:

<CodeGroup>

<CodeGroupItem title="proto/checkers/tx.proto" active>

```protobuf
message MsgCreatePost {
  string creator = 1;
  string title = 2;
  string body = 3;
}
```

</CodeGroupItem>

</CodeGroup>

Ignite CLI also wired a new command into your chain's CLI in:

<CodeGroup>

<CodeGroupItem title="x/checkers/client/cli/tx_create_post.go" active>

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

</CodeGroupItem>

</CodeGroup>

Ignite CLI scaffolded GUI elements relating to your message with a Vue.js frontend framework. You can, for instance, start with this function in:

<CodeGroup>

<CodeGroupItem title="vue/src/store/generated/alice/checkers/alice.checkers.checkers/index.ts" active>

```typescript
async MsgCreatePost({ rootGetters }, { value }) {
    try {
        const txClient=await initTxClient(rootGetters)
        const msg = await txClient.msgCreatePost(value)
        return msg
    } catch (e) {
        if (e == MissingWalletError) {
            throw new SpVuexError('TxClient:MsgCreatePost:Init', 'Could not initialize signing client. Wallet is required.')
        }else{
            throw new SpVuexError('TxClient:MsgCreatePost:Create', 'Could not create message: ' + e.message)

        }
    }
},
```

</CodeGroupItem>

</CodeGroup>

When you are done with this exercise you can stop Ignite's `chain serve.`

<HighlightBox type="info">

Want another demonstration? In the following video Denis Fadeev, creator of and core contributor to Ignite CLI, explains how to create and interact with a Cosmos SDK blockchain using just a few basic commands, then provides a real-time demonstration of Ignite CLI in action.

<YoutubePlayer videoId="aQuHeE7fWK0"/>

</HighlightBox>


<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to install Ignite CLI, a command-line tool that writes code files and updates them when instructed, handles some compilation, runs a local blockchain node, and assists with other tasks.
* How to scaffold a basic blockchain, with the suggested best practice not to replace lines with code markers indicating where to add further code on later instruction, nor to rename or move any file containing such a line.
* How to interact via the CLI to demonstrate that your chain is live when running in its shell.
* How to boot up the frontend that Ignite CLI has created by using a terminal window and navigating to the localhost on your browser.
* How to test the base functionality of your chain by creating a simple message.

</HighlightBox>

<!--## Next up

You just created a fully working Cosmos SDK chain, one that forms the basis of the [following exercise](./2-exercise-intro.md).-->

<HighlightBox type="info">

You can remove the `MsgCreatePost` message as it is not part of the guided exercise in the next sections. You can clean it all by running:

```sh
$ git stash -u && git stash drop
```

</HighlightBox>
