---
title: "CosmWasm"
order: 21
description: Multi-chain smart contracts
tag: deep-dive
---

# CosmWasm

<HighlightBox type="synopsis">

Discover how multi-chain smart contracts become possible with CosmWasm. The following sections are recommended as a preparation:

* [Transactions](../2-main-concepts/transactions.md)
* [Messages](../2-main-concepts/messages.md)
* [Queries](../2-main-concepts/queries.md)

</HighlightBox>

[CosmWasm](https://cosmwasm.com/) offers multi-chain solutions for smart contracts through an actor-model design focused on providing a library.

<ExpansionPanel title="More on the actor model">

The actor model is a design pattern for reliable, distributed systems. It is the pattern underlying CosmWasm smart contracts.

Each actor has access to its own internal state and can only message other actors through a so-called dispatcher, which maintains the state and maps addresses to code and storage.

Want to read more on the actor model? Check out [the CosmWasm documentation on the Actor Model for Contract Calls](https://docs.cosmwasm.com/docs/0.16/architecture/actor).

</ExpansionPanel>

CosmWasm's design makes the code agnostic to the details of underlying chains. It only requires a Cosmos SDK application to embed the `Wasm` module.

CosmWasm is adaptable to different development environments by design and makes it possible to connect chains. It is a solid platform to develop on because:

* If you want to change chains, you can easily transfer smart contracts and decentralized applications (dApps).
* If your application grows, you can launch your chain for the next version of your smart contract. You do not need to compile and deploy the binaries again.

## Install

You need to have installed Go to use the Cosmos SDK. You also need Rust to write smart contracts.

Go to [rustup.rs](https://rustup.rs) to install Rust, or update your version with `rustup update`. Then, have it download and install the `wasm32` compilation target:

```sh
$ rustup target list --installed
# if wasm32 is not listed above, run this
$ rustup target add wasm32-unknown-unknown
```

<HighlightBox type="info">

`wasmd` is the easiest way to get started. It is forked from [gaiad (the Gaia Daemon)](https://github.com/cosmos/gaia), which is a binary build with the Cosmos Hub, and includes the [Wasm](https://github.com/CosmWasm/wasmd/tree/master/x/wasm) module.

</HighlightBox>

Create a folder and clone the [`wasmd`](https://github.com/CosmWasm/wasmd) repository into it:

```sh
$ git clone https://github.com/CosmWasm/wasmd.git
$ cd wasmd
$ git checkout v0.18.0
$ make install
```

Verify your installation:

```sh
$ wasmd version
0.18.0
```

If you cannot call `wasmd`, make sure your `$GOPATH` and `$PATH` are set correctly.

## Connect to a testnet

First test the `wasmd` client with the [Pebblenet](https://github.com/CosmWasm/testnets/tree/master/pebblenet-1) testnet. `wasmd` is configured via environment variables. Export the most recent environment from [here](https://github.com/CosmWasm/testnets/blob/master/pebblenet-1/defaults.env):

```sh
$ curl https://raw.githubusercontent.com/CosmWasm/testnets/master/pebblenet-1/defaults.env -o pebblenet-1-defaults.env
$ source pebblenet-1-defaults.env
```

Confirm you got it right:

```sh
$ echo $CHAIN_ID
pebblenet-1
```

And if you happen to open another terminal window, don't forget to repeat this `source` command as this is local to the session.

## Your accounts

Now add some keys:

```sh
$ wasmd keys add wallet
$ wasmd keys add wallet2
```

Let's see what was created:

```sh
$ wasmd keys show wallet --address
wasm1jj7gzazxvgy56rj8kersuc44ehvep0uey85jdn
```

That's your address, query your token balance:

```sh
wasmd query bank balances $(wasmd keys show wallet --address) --node $RPC
pagination: {}
```

None. Time to ask the [faucet](https://faucet.pebblenet.cosmwasm.com) to remedy that sorry state. To facilitate command-line actions, install [jq](https://stedolan.github.io/jq/), which is a lightweight and flexible command-line JSON processor. Then prepare the request for your `wallet`:

```sh
$ JSON=$(jq --null-input --arg addr $(wasmd keys show wallet --address) '{"denom":"upebble","address":$addr}')
$ echo "$JSON"
{
  "denom": "upebble",
  "address": "wasm1jj7gzazxvgy56rj8kersuc44ehvep0uey85jdn"
}
```

`upebble` is the denomination of the test net token. With the content of the request ready, you can call the faucet:

```sh
$ curl -X POST --header "Content-Type: application/json" --data "$JSON" https://faucet.pebblenet.cosmwasm.com/credit
ok
```

Query your balance again:

```sh
$ wasmd query bank balances $(wasmd keys show wallet --address) --node $RPC
balances:
- amount: "100000"
  denom: upebble
pagination: {}
```

Repeat the same for `wallet2`.

## Compile a smart contract

Now that you have enough tokens to deploy a smart contract on Pebblenet, clone the contract samples away from your `wasmd` folder:

```sh
$ git clone https://github.com/InterWasm/cw-contracts
$ cd cw-contracts/contracts/nameservice
$ cargo wasm
...
Compiling cw-nameservice v0.11.0 (/Users/me/cw-contracts/contracts/nameservice)
 Finished release [optimized] target(s) in 1m 20s
```

In this last command, `wasm` is [an alias](https://github.com/InterWasm/cw-contracts/blob/ac4c2b9/contracts/nameservice/.cargo/config#L2) for `wasm build --release --target wasm32-unknown-unknown`.

You now have a compiled smart contract on file. You want to maintain your smart contract binary as small as possible and Rust compiled with default settings. Check the size of your build with:

```sh
$ ls -lh target/wasm32-unknown-unknown/release/cw_nameservice.wasm
-rwxr-xr-x 2 me staff 1.7M target/wasm32-unknown-unknown/release/cw_nameservice.wasm
```

You can optimize the code with a [Docker](https://www.docker.com/) container based on an [image provided by CosmWasm](https://hub.docker.com/r/cosmwasm/rust-optimizer/tags) for production purposes:

```sh
$ docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.12.3
```

Compare the result:

```sh
$ ls -alh artifacts/cw_nameservice.wasm
-rw-r--r--  1 me staff 139K artifacts/cw_nameservice.wasm
```


## Upload a smart contract binary

Time to store the smart contract binaries on the blockchain:

```sh
$ RES=$(wasmd tx wasm store artifacts/cw_nameservice.wasm --from wallet --node $RPC --chain-id pebblenet-1 --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3)
$ CODE_ID=$(echo $RES | jq -r '.logs[0].events[-1].attributes[0].value')
```

<!--

Got this error on: wasmd tx wasm store:
{"height":"1631444","txhash":"4C4E829D840AED2DCB0020126810C94303D57C59FE6417E371041194CCD63C3D","codespace":"wasm","code":2,"raw_log":"failed to execute message; message index: 0: Error calling the VM: Error during static Wasm validation: Wasm contract has unknown interface_version_* marker export (see https://github.com/CosmWasm/cosmwasm/blob/main/packages/vm/README.md): create wasm contract failed","gas_wanted":"10000000","gas_used":"848933"}

-->

The response returns a `code_id` value, which uniquely identifies your newly uploaded binary in the blockchain. Keep it at hand in order to instantiate a name service with this binary in the next steps.

## Instantiate your smart contract

You only uploaded some code but do not yet have any smart contract instance. You can now instantiate a new smart contract that uses this code. Look at the aptly-named `instantiate` function in the name server contract:

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

Among the parameters the function expects are [`msg.purchase_price` and `msg.transfer_price`](https://github.com/InterWasm/cw-contracts/blob/2f545b7/contracts/nameservice/src/msg.rs#L6-L9). Both have the type [cosmwasm_std::Coin](https://docs.rs/cosmwasm-std/0.9.2/cosmwasm_std/struct.Coin.html), which, you will note, looks very similar to Cosmos SDK's [`Coin`](https://github.com/cosmos/cosmos-sdk/blob/c41ac20c6cd6cc2b65afa6af587bf39048b2f251/types/coin.pb.go#L31-L34). Of course this is no coincidence. With this knowledge, instantiate a new name service with a `purchase_price` and `transfer_price`:

```sh
$ wasmd tx wasm instantiate $CODE_ID '{"purchase_price":{"amount":"100","denom":"upebble"},"transfer_price":{"amount":"999","denom":"upebble"}}' --from wallet --node $RPC --chain-id pebblenet-1 --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3  --label "CosmWasm tutorial name service"
```

You see again the `CODE_ID` that refers to which binary to use for the instantiation. Check that the name service instance was successfully created with:

```sh
$ wasmd query wasm list-contract-by-code $CODE_ID --node $RPC --output json
```

You can find the contract address in the response. Make it a variable too:

```sh
$ CONTRACT = the_address_in_the_response
```

 Use it to fetch more information with the following command:

```sh
$ wasmd query wasm contract $CONTRACT --node $RPC
```

## Call your smart contract

With your instance now running, you can call other functions on it.

### Register a name

Looking back into the contract code, you can find the `execute` function:

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

There are two _execute_ message types. It is used to register or transfer a name within the name service. Start by [registering](https://github.com/InterWasm/cw-contracts/blob/2f545b7b8b8511bc0f92f2f3f838c236ba0d850c/contracts/nameservice/src/msg.rs#L11-L16) a new name with your instance:

```sh
$ wasmd tx wasm execute $CONTRACT '{"register":{"name":"fred"}}' --amount 100upebble --from wallet --node $RPC --chain-id pebblenet-1 --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3
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

There are two _query_ message types. Note that you now have `deps: Deps` instead of `deps: DepsMut`. This indicates that the execution of the function does not mutate the state. This is indeed what you want to use with your functions that implement a _query_ type of service.

Verify the registration with [`ResolveRecord`](https://github.com/InterWasm/cw-contracts/blob/2f545b7b8b8511bc0f92f2f3f838c236ba0d850c/contracts/nameservice/src/msg.rs#L18-L24):

```sh
$ wasmd query wasm contract-state smart $CONTRACT '{"resolve_record": {"name": "fred"}}' --node $RPC --output json
```

The response gives you the wallet address owning the registered name, which should be `wallet`.

### Transfer a name

Now create another transaction to transfer the name to the second wallet `wallet2`. First prepare the query with the address of your other wallet:

```sh
$ JSON=$(jq --null-input --arg addr $(wasmd keys show wallet2 --address) '{"transfer":{"name":"fred","to":$addr}}')
```

Then send the transaction:

```sh
$ wasmd tx wasm execute $CONTRACT "$JSON" --amount 999upebble --from wallet --node $RPC --chain-id pebblenet-1 --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3
```

Under the hood, the execution used `transfer_price`, which you set at the instantiation.

Check again with a `resolve_record` query to confirm that the transfer was successful. Experiment with another transfer from `wallet2` to `wallet`, and pay attention at which wallet can perform which transaction.

<HighlightBox type="tip">

CosmWasm offers good [documentation](https://docs.cosmwasm.com/docs/). This section is a summary of the [Getting Started section](https://docs.cosmwasm.com/docs/getting-started/intro/). Store the `env` script from [here]https://docs.cosmwasm.com/docs/1.0/getting-started/setting-env#setup-go-cli) in case you wish to test on your local node. Also have a look at the [contract semantics](https://docs.cosmwasm.com/docs/SEMANTICS/).

You can find more information in the [CosmWasm Developer Academy](https://docs.cosmwasm.com/dev-academy/intro) and modular tutorials in the [Wasm tutorials](https://docs.cosmwasm.com/tutorials/hijack-escrow/intro). You can also find various hands-on videos on the [workshops](https://docs.cosmwasm.com/tutorials/videos-workshops) page.

</HighlightBox>

## Next up

At this point, you have:

* [Understood how Cosmos and the Cosmos SDK fit in the overall development of blockchain technology.](../1-what-is-cosmos/blockchain-and-cosmos.md)
* [A better sense of what comprises the Cosmos ecosystem.](../1-what-is-cosmos/cosmos-ecosystem.md)
* [Set up a wallet, got some ATOM tokens, and staked them.](../1-what-is-cosmos/atom-staking.md)
* [Learned more about the elements of application architecture.](../2-main-concepts/architecture.md)
* [Understood and applied main concepts of the Cosmos SDK.](../2-main-concepts/index.md)
* [Ran a node, API, and CLI for a Cosmos chain.](../3-running-a-chain/node-api-and-cli.md)
* [Used Ignite CLI to develop your chain.](./ignitecli.md)
* [Explored CosmJS and the code generated by Ignite CLI.](./cosmjs.md)
* [Discovered how CosmWasm assists with developing multi-chain smart contracts in Rust.](./cosmwasm.md)

So what's next? The Cosmos is vast with lots of projects, people and concepts to discover:

* Reach out to the community.
* Contribute to the Cosmos SDK, IBC, and Tendermint BFT consensus development.
* Get support for enterprise solutions, which you are developing.

Head to the [What's Next section](../5-whats-next/index.md) to find useful information to launch your journey into the Cosmos universe.
