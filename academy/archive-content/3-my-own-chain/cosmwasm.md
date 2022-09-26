---
title: "CosmWasm"
order: 21
description: Multi-chain smart contracts
tags: 
  - tutorial
  - cosmos-sdk
  - dev-ops
---

# CosmWasm

<HighlightBox type="prerequisite">

The following sections are recommended as a preparation:

* [Transactions](/academy/2-cosmos-concepts/3-transactions.md)
* [Messages](/academy/2-cosmos-concepts/4-messages.md)
* [Queries](/academy/2-cosmos-concepts/9-queries.md)

</HighlightBox>

<HighlightBox type="learning">

In this section, you will:

* Discover how multi-chain smart contracts become possible with CosmWasm.
* Install Go and Rust (if necessary), to use the Cosmos SDK and to write smart contracts respectively.
* Connect to a testnet and faucet to prepare for the main activity.
* Compile, upload, instantiate, and interact with a simple contract.

</HighlightBox>

[CosmWasm](https://cosmwasm.com/) runs smart contracts in WebAssembly - the Wasm part - on Cosmos blockchains - the Cosm part. It uses a safety-oriented actor model that prevents many of the security issues found on other smart contract platforms and provides a library for developers.

<ExpansionPanel title="More on the actor model">

The actor model is a design pattern for reliable distributed systems. It is the pattern underlying CosmWasm smart contracts.
<br/>
Each actor has access to its own private, internal state. Actors can only message other actors indirectly through a so-called dispatcher, which maintains the state and maps addresses to code and storage. Common security concerns like re-entrance simply do not exist in this model.

<HighlightBox type="docs">

Want to read more on the actor model? See [the CosmWasm documentation on the Actor Model for Contract Calls](https://docs.cosmwasm.com/docs/0.16/architecture/actor).

</HighlightBox>

</ExpansionPanel>

Any Cosmos blockchain can potentially run CosmWasm smart contracts, and they can communicate with Cosmos SDK modules. All that is required is that the binary for the chain imports the `Wasm` module, which is part of the Cosmos SDK, that enables this capability.

CosmWasm is tightly integrated with IBC, meaning that contracts on different chains will be able to communicate with each other. This design creates new possibilities for system designs with topologies that traverse chain boundaries. For example, consider a DEX running on one chain and oracles or trading signals on other chains, all tightly connected.

CosmWasm contracts are usually written in Rust and then compiled to WebAssembly - support for other languages is expected over time. CosmWasm separates the ideas of code and instances so that the chain is not overloaded with many copies of the same code. Instead, code that is uploaded to the chain once can be instantiated at many different addresses.

Getting started is easy. Start by using the provided binary to run a single-node blockchain (with the `Wasm` module integrated, of course), and a Rust IDE and compiler. In this exercise, you will compile, upload, instantiate, and interact with a simple contract.

## Install

<HighlightBox type="info">

**Go** must be installed to use the Cosmos SDK. You also need **Rust** to write smart contracts.

</HighlightBox>

Go to [rustup.rs](https://rustup.rs) to install Rust, or update your version with `rustup update`. Then, have it download and install the `wasm32` compilation target:

```sh
$ rustup target list --installed
# if wasm32 is not listed above, run this
$ rustup target add wasm32-unknown-unknown
```

<HighlightBox type="info">

`wasmd` is the easiest way to begin. It is forked from [gaiad (the Gaia Daemon)](https://github.com/cosmos/gaia), which is a binary build with the Cosmos Hub, and includes the [Wasm](https://github.com/CosmWasm/wasmd/tree/master/x/wasm) module.

</HighlightBox>

Create a folder and clone the [`wasmd`](https://github.com/CosmWasm/wasmd) repository into it:

```sh
$ git clone https://github.com/CosmWasm/wasmd.git
$ cd wasmd
$ git checkout v0.23.0
$ make install
```

Verify your installation:

```sh
$ wasmd version
```

This returns:

```
0.23.0
```

If you cannot call `wasmd`, make sure your `$GOPATH` and `$PATH` are set correctly.

## Connect to a testnet

First, test the `wasmd` client with the [Cliffnet](https://github.com/CosmWasm/testnets/tree/master/archive/cliffnet-1) testnet. `wasmd` is configured via environment variables. Export the most recent environment from [here](https://github.com/CosmWasm/testnets/tree/master/archive/cliffnet-1):

```sh
$ curl https://raw.githubusercontent.com/CosmWasm/testnets/master/cliffnet-1/defaults.env -o cliffnet-1-defaults.env
$ source cliffnet-1-defaults.env
```

Confirm you got it correctly:

```sh
$ echo $CHAIN_ID
```

This returns:

```
cliffnet-1
```

<HighlightBox type="remember">

If you open another terminal window, do not forget to repeat this `source` command, as this is local to the session.

</HighlightBox>

## Your accounts

Now add some keys:

```sh
$ wasmd keys add alice
$ wasmd keys add bob
```

What was created?

```sh
$ wasmd keys show alice --address
```

This returns:

```
wasm1jj7gzazxvgy56rj8kersuc44ehvep0uey85jdn
```

That is your address. Query your token balance:

```sh
$ export alice=$(wasmd keys show alice --address)
$ wasmd query bank balances $alice --node $RPC
```

This returns:

```
pagination: {}
```

You have none. Time to ask the [faucet](https://faucet.cliffnet.cosmwasm.com) to remedy this. To facilitate command-line actions, install [jq](https://stedolan.github.io/jq/), which is a lightweight and flexible command-line JSON processor. Then prepare the request for `alice`:

```sh
$ export json_request='{"denom":"upebble","address":"'$alice'"}'
$ echo $json_request | jq
```

This returns:

```json
{
  "denom": "upebble",
  "address": "wasm1jj7gzazxvgy56rj8kersuc44ehvep0uey85jdn"
}
```

`upebble` is the denomination of the testnet token. With the content of the request ready, call the faucet:

```sh
$ curl -X POST --header "Content-Type: application/json" --data "$json_request" https://faucet.cliffnet.cosmwasm.com/credit
```

This returns:

```
ok
```

Query your balance again:

```sh
$ wasmd query bank balances $alice --node $RPC
```

This returns:

```
balances:
- amount: "100000000"
  denom: upebble
pagination: {}
```

Repeat this process for `bob`.

## Compile a smart contract

Now that you have enough tokens to deploy a smart contract on Cliffnet, clone the contract samples away from your `wasmd` folder:

```sh
$ git clone https://github.com/InterWasm/cw-contracts
$ cd cw-contracts/contracts/nameservice
$ cargo wasm
```

This returns:

```
...
Compiling cw-nameservice v0.11.0 (/Users/me/cw-contracts/contracts/nameservice)
 Finished release [optimized] target(s) in 1m 20s
```

In this last command, `wasm` is [an alias](https://github.com/InterWasm/cw-contracts/blob/ac4c2b9/contracts/nameservice/.cargo/config#L2) for `wasm build --release --target wasm32-unknown-unknown`.

You now have a compiled smart contract on file. You want to maintain your smart contract binary as small as possible and have Rust compiled with default settings. Check the size of your build with:

```sh
$ ls -lh target/wasm32-unknown-unknown/release/cw_nameservice.wasm
```

This returns:

```
-rwxr-xr-x 2 me staff 1.8M target/wasm32-unknown-unknown/release/cw_nameservice.wasm
```

You can optimize the code with a [Docker](https://www.docker.com/) container based on an [image provided by CosmWasm](https://hub.docker.com/r/cosmwasm/rust-optimizer/tags) for production purposes:

```sh
$ docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.12.6
```

<ExpansionPanel title="Troubleshooting">

<PanelListItem number="1">

**Apple M1**

If you work with a machine using M1 architecture, you need to add the `--platform linux/amd64` flag:

```sh
 $ docker run --rm --platform linux/amd64 -v "$(pwd)":/code \
   --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
   --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
   cosmwasm/rust-optimizer:0.12.6
```

</PanelListItem>

</ExpansionPanel>

Compare the result:

```sh
$ ls -alh artifacts/cw_nameservice.wasm
```

This returns:

```
-rw-r--r--  1 me staff 138K artifacts/cw_nameservice.wasm
```

## Upload a smart contract binary

Time to store the smart contract binaries on the blockchain:

```sh
$ export result=$(wasmd tx wasm store artifacts/cw_nameservice.wasm --from alice --node $RPC --chain-id cliffnet-1 --gas-prices 0.01upebble --gas auto --gas-adjustment 1.3 --output json --broadcast-mode block --yes)
$ export code_id=$(echo $result | jq -r '.logs[0].events[-1].attributes[0].value')
$ echo $code_id
```

<!--

Got this error on: wasmd tx wasm store:
{"height":"1631444","txhash":"4C4E829D840AED2DCB0020126810C94303D57C59FE6417E371041194CCD63C3D","codespace":"wasm","code":2,"raw_log":"failed to execute message; message index: 0: Error calling the VM: Error during static Wasm validation: Wasm contract has unknown interface_version_* marker export (see https://github.com/CosmWasm/cosmwasm/blob/main/packages/vm/README.md): create wasm contract failed","gas_wanted":"10000000","gas_used":"848933"}

-->

The response returns a `code_id` value (for instance `1391`), which uniquely identifies your newly uploaded binary in the blockchain. Record this to instantiate a name service with this binary in the next steps.

## Instantiate your smart contract

You have uploaded some code, but do not yet have any smart contract instance. Now to instantiate a new smart contract that uses this code. Look at the aptly-named `instantiate` function in the name server contract:

```rust [https://github.com/InterWasm/cw-contracts/blob/2f545b7b8b8511bc0f92f2f3f838c236ba0d850c/contracts/nameservice/src/contract.rs#L14-L28]
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, StdError> {
    let config_state = Config {
        purchase_price: msg.purchase_price,
        transfer_price: msg.transfer_price,
    };

    config(deps.storage).save(&config_state)?;

    Ok(Response::default())
}
```

Among the parameters the function expects are [`msg.purchase_price` and `msg.transfer_price`](https://github.com/InterWasm/cw-contracts/blob/2f545b7/contracts/nameservice/src/msg.rs#L6-L9). Both have the type [cosmwasm_std::Coin](https://docs.rs/cosmwasm-std/0.9.2/cosmwasm_std/struct.Coin.html), which looks very similar to Cosmos SDK's [`Coin`](https://github.com/cosmos/cosmos-sdk/blob/c41ac20c6cd6cc2b65afa6af587bf39048b2f251/types/coin.pb.go#L31-L34). This is no coincidence. With this knowledge, instantiate a new name service with a `purchase_price` and `transfer_price`:

```sh
$ wasmd tx wasm instantiate $code_id '{"purchase_price":{"amount":"100","denom":"upebble"},"transfer_price":{"amount":"999","denom":"upebble"}}' --from alice --no-admin --node $RPC --chain-id cliffnet-1 --gas-prices 0.01upebble --gas auto --gas-adjustment 1.3 --label "CosmWasm tutorial name service" --broadcast-mode block --yes
```

<HighlightBox type="note">

Note the `code_id` that refers to which binary to use for the instantiation.

</HighlightBox>

Check that the name service instance was successfully created with:

```sh
$ wasmd query wasm list-contract-by-code $code_id --node $RPC --output json
```

You can find the contract address in the response. Make it a variable too:

```sh
$ export contract_address=$(wasmd query wasm list-contract-by-code $code_id --node $RPC --output json | jq -r ".contracts[0]")
```

Use this to fetch more information with the following command:

```sh
$ wasmd query wasm contract $contract_address --node $RPC
```

## Call your smart contract

With your instance now running, you can call other functions on it.

### Register a name

Looking into the contract code, you can find the `execute` function:

```rust [https://github.com/InterWasm/cw-contracts/blob/2f545b7b8b8511bc0f92f2f3f838c236ba0d850c/contracts/nameservice/src/contract.rs#L30-L41]
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Register { name } => execute_register(deps, env, info, name),
        ExecuteMsg::Transfer { name, to } => execute_transfer(deps, env, info, name, to),
    }
}
```

There are two _execute_ message types. These are used to register or transfer a name within the name service.

Start by [registering](https://github.com/InterWasm/cw-contracts/blob/2f545b7b8b8511bc0f92f2f3f838c236ba0d850c/contracts/nameservice/src/msg.rs#L11-L16) a new name with your instance:

```sh
$ wasmd tx wasm execute $contract_address '{"register":{"name":"fred"}}' --amount 100upebble --from alice --node $RPC --chain-id cliffnet-1 --gas-prices 0.01upebble --gas auto --gas-adjustment 1.3 --broadcast-mode block --yes
```

### Verify the name registration

With the transaction posted, it is time to verify that the name was registered. In the contract you can find the `query` function:

```rust [https://github.com/InterWasm/cw-contracts/blob/2f545b7b8b8511bc0f92f2f3f838c236ba0d850c/contracts/nameservice/src/contract.rs#L95-L101]
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::ResolveRecord { name } => query_resolver(deps, env, name),
        QueryMsg::Config {} => to_binary(&config_read(deps.storage).load()?),
    }
}
```

There are two _query_ message types. Note that you now have `deps: Deps` instead of `deps: DepsMut`. This indicates that the execution of the function does not mutate the state. This is what to use with functions that implement a _query_ type of service.

Verify the registration with [`ResolveRecord`](https://github.com/InterWasm/cw-contracts/blob/2f545b7b8b8511bc0f92f2f3f838c236ba0d850c/contracts/nameservice/src/msg.rs#L18-L24):

```sh
$ wasmd query wasm contract-state smart $contract_address '{"resolve_record": {"name": "fred"}}' --node $RPC --output json
```

The response gives you the wallet address owning the registered name, which should be `alice`.

### Transfer a name

Now create another transaction to transfer the name to the second wallet `bob`. First, prepare the query with the address of your other wallet:

```sh
$ export json_request='{"transfer":{"name":"fred","to":"'$bob'"}}'
```

Then send the transaction:

```sh
$ wasmd tx wasm execute $contract_address "$json_request" --amount 999upebble --from alice --node $RPC --chain-id cliffnet-1 --gas-prices 0.01upebble --gas auto --gas-adjustment 1.3 --broadcast-mode block --yes
```

Under the hood, the execution used `transfer_price`, which you set at the instantiation.

Check again with a `resolve_record` query to confirm that the transfer was successful. Experiment with another transfer from `bob` to `alice`, and pay attention to which wallet can perform which transaction.

<HighlightBox type="docs">

CosmWasm offers good [documentation](https://docs.cosmwasm.com/docs/). This section is a summary of the [Getting Started section](https://docs.cosmwasm.com/docs/getting-started/intro/). Store the `env` script from [here](https://docs.cosmwasm.com/docs/1.0/getting-started/setting-env#setup-go-cli) in case you wish to test it on your local node. Also look at the [contract semantics](https://docs.cosmwasm.com/docs/SEMANTICS/).
<br/>

You can find more information in the [CosmWasm Developer Academy](https://docs.cosmwasm.com/dev-academy/intro) and modular tutorials in the [Wasm tutorials](https://docs.cosmwasm.com/tutorials/hijack-escrow/intro). You can also find various hands-on videos on the [workshops](https://docs.cosmwasm.com/tutorials/videos-workshops) page.

</HighlightBox>

CosmWasm is adaptable to different development environments by design and makes it possible to connect chains. It is a solid platform to develop on because:

* If you want to change chains, you can easily transfer smart contracts and decentralized applications (dApps).
* If your application grows, you can launch your chain for the next version of your smart contract. You do not need to compile and deploy the binaries again.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* CosmWasm, the *Cosmos* way of using *WebAssembly*, which provides a multi-chain solution for smart contracts through an actor-model design pattern that delivers reliable distributed systems.
* How CosmWasm is code agnostic, requiring only that a Cosmos SDK application embeds the `Wasm` module, and not only makes it possible to connect chains but facilitates an application changing the chain it is platformed on.
* How you will need **Go** to use the Cosmos SDK and **Rust** to write smart contracts. 
* How to connect to a testnet; add accounts and query their balance; compile a smart contract; upload a smart contract binary; instantiate the smart contract; and call the smart contract, including how to register, verify, and transfer a name.

</HighlightBox>

<!--
## Next up
At this point, you have:

* [Understood how Cosmos and the Cosmos SDK fit in the overall development of blockchain technology.](../1-what-is-cosmos/1-blockchain-and-cosmos.md)
* [A better sense of what comprises the Cosmos Ecosystem.](../1-what-is-cosmos/2-cosmos-ecosystem.md)
* [Set up a wallet, got some ATOM tokens, and staked them.](../1-what-is-cosmos/3-atom-staking.md)
* [Learned more about the elements of application architecture.](../2-cosmos-concepts/1-architecture.md)
* [Understood and applied main concepts of the Cosmos SDK.](../2-cosmos-concepts/index.md)
* [Run a node, API, and CLI for a Cosmos chain.](/tutorials/2-setup/index.md)
* [Used Ignite CLI to develop your chain.](/hands-on-exercise/1-ignite-cli/1-ignitecli.md)
* Discovered how CosmWasm assists with developing multi-chain smart contracts in Rust.

Head to the [next chapter](https://interchainacademy.cosmos.network/course-ida/landingpages/week4-lp.html) to discover the Inter-Blockchain Communication Protocol.
-->

