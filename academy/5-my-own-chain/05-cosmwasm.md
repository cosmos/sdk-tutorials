---
title: "CosmWasm"
order: 21
description: Multi-chain smart contracts
tag: deep-dive
---

# CosmWasm

<HighlightBox type="synopsis">

The last section of this course looks at CosmWasm. Discover how multi-chain smart contracts become possible. The following sections are recommended as a preparation:

* [Transactions](../3-main-concepts/05-transactions.md)
* [Messages](../3-main-concepts/07-messages.md))
* [Queries](../3-main-concepts/12-queries.md)

</HighlightBox>

[CosmWasm](https://cosmwasm.com/) offers multi-chain solutions for smart contracts through an actor-model design focused on providing a library.

<ExpansionPanel title="More on the actor model">

The actor model is a design pattern for reliable, distributed systems. It is the pattern underlying CosmWasm smart contracts.

The actor has access to the internal state and actors can only message each other through a so-called dispatcher, which maintains the state and maps addresses to code and storage.

Want to read more on the actor model? Check out [the CosmWasm documentation on the Actor Model for Contract Calls](https://docs.cosmwasm.com/docs/0.16/architecture/actor).

</ExpansionPanel>

CosmWasm's design makes the code agnostic to the details of underlying chains. It only requires a Cosmos SDK application to embed the `Wasm` module.

CosmWasm is adaptable to different development environments by design and makes it possible to connect chains. It is a solid platform to develop on because:

* If you want to change chains, you can easily transfer smart contracts and decentralized applications (dApps).
* If your application grows, you can launch your chain for the next version of your smart contract. You do not need to compile and deploy the binaries again.

## Install

You need to have installed Go to use the Cosmos SDK. In addition, you have to install Rust to write smart contracts.

Go to [https://rustup.rs/](https://rustup.rs/) to install Rust. Set the wasm32 target:

```bash
$ rustup target list --installed
$ rustup target add wasm32-unknown-unknown
```

<HighlightBox type="info">

`wasmd` is the easiest way to get started. It is forked from [gaiad (the Gaia Daemon)](https://github.com/cosmos/gaia), which is a binary build with the Cosmos Hub, and includes the [Wasm](https://github.com/CosmWasm/wasmd/tree/master/x/wasm) module.

</HighlightBox>

Create a folder and clone the [`wasmd`](https://github.com/CosmWasm/wasmd) repository into it:

```bash
$ git clone https://github.com/CosmWasm/wasmd.git
$ cd wasmd
$ git checkout v0.18.0
$ make install
```

Verify your installation:

```bash
$ wasmd version
```

Make sure your `$GOPATH` and `$PATH` are set correctly in case you cannot call `wasmd`.

## Testnet

First test the `wasmd` client with the [Pebblenet](https://github.com/CosmWasm/testnets/tree/master/pebblenet-1) testnet. `wasmd` is configured via environment variables. Export the most [recent](https://raw.githubusercontent.com/CosmWasm/testnets/master/pebblenet-1/defaults.env) environment:

```bash
$ export CHAIN_ID="pebblenet-1"
$ export TESTNET_NAME="pebblenet-1"
$ export FEE_DENOM="upebble"
$ export STAKE_DENOM="urock"
$ export BECH32_HRP="wasm"
$ export WASMD_VERSION="v0.18.0"
$ export CONFIG_DIR=".wasmd"
$ export BINARY="wasmd"

$ export COSMJS_VERSION="v0.26.0"
$ export GENESIS_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/pebblenet-1/config/genesis.json"
$ export APP_CONFIG_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/pebblenet-1/config/app.toml"
$ export CONFIG_URL="https://raw.githubusercontent.com/CosmWasm/testnets/master/pebblenet-1/config/config.toml"

$ export RPC="https://rpc.pebblenet.cosmwasm.com:443"
$ export LCD="https://lcd.pebblenet.cosmwasm.com"
$ export FAUCET="https://faucet.pebblenet.cosmwasm.com"

$ export COSMOVISOR_VERSION="v0.42.9"
$ export COSMOVISOR_HOME=$HOME/.wasmd
$ export COSMOVISOR_NAME=wasmd
```

Now add some keys:

```bash
$ wasmd keys add wallet
$ wasmd keys add wallet2
```

Install [jq](https://stedolan.github.io/jq/), which is a lightweight and flexible command-line JSON processor. Then request some tokens from the [faucet](https://faucet.pebblenet.cosmwasm.com) for the `wallet`:

```bash
$ JSON=$(jq -n --arg addr $(wasmd keys show -a wallet) '{"denom":"upebble","address":$addr}') && curl -X POST --header "Content-Type: application/json" --data "$JSON" https://faucet.pebblenet.cosmwasm.com/credit
```

Do the same for `wallet2`. Check the balances of both wallets afterward:

```bash
$ wasmd query bank balances $(wasmd keys show wallet --address) --node $RPC
$ wasmd query bank balances $(wasmd keys show wallet2 --address) --node $RPC
```

Clone the contract samples in another location:

```bash
$ git clone https://github.com/InterWasm/cw-contracts
$ cd cw-contracts/contracts/
$ cargo wasm
```

`wasm` is an alias for `wasm build --release --target wasm32-unknown-unknown` in this last command.

As is generally the case for developing on blockchains you want to maintain your smart contract as small as possible. Check the size of your build with:

```bash
$ ls -lh target/wasm32-unknown-unknown/release/cw_nameservice.wasm
```

Optimize the code with [Docker](https://www.docker.com/) container based on an [image provided by CosmWasm](https://hub.docker.com/r/cosmwasm/rust-optimizer/tags) for production purposes:

```bash
$ docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.12.3
```

Compare the result:

```bash
$ ls -allh artifacts/cw_nameservice.wasm
```

Now upload the smart contract to the blockchain:

```bash
$ RES=$(wasmd tx wasm store artifacts/cw_nameservice.wasm --from wallet --node $RPC --chain-id pebblenet-1 --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3)
$ CODE_ID=$(echo $RES | jq -r '.logs[0].events[-1].attributes[0].value')
```

The response returns a `code_id` value. Keep it at hand to use in the next steps.

You see in `contracts/nameservice/src/contract.rs`:

```rust
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

`msg.purchase_price` and `msg.transfer_price` have the type [cosmwasm_std::Coin](https://docs.rs/cosmwasm-std/0.9.2/cosmwasm_std/struct.Coin.html). Thus, instantiate the smart contract with a `purchase_price` and `transfer_price`:

```bash
$ wasmd tx wasm instantiate $CODE_ID '{"purchase_price":{"amount":"100","denom":"upebble"},"transfer_price":{"amount":"999","denom":"upebble"}}' --from wallet --node $RPC --chain-id pebblenet-1 --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3  --label "CosmWasm tutorial name service"
```

Replace `$CODE_ID` with the `code_id` you got from the previous response.

Check the contract with:

```bash
$ wasmd query wasm list-contract-by-code $CODE_ID --node $RPC --output json
```

You can find the contract address in the response. Use it to fetch more information and replace `$CONTRACT` in the following command with the address you got:

```bash
$ wasmd query wasm contract $CONTRACT --node $RPC
```

You can call the contract after the initialization. You can find in `contract.rs`:

```rust
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

So we can register or transfer a name. First, register a name with your contract address `$CONTRACT`:

```bash
$ wasmd tx wasm execute $CONTRACT '{"register":{"name":"fred"}}' --amount 100upebble --from wallet --node $RPC --chain-id pebblenet-1 --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3
```

In the contract you can find:

```rust
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::ResolveRecord { name } => query_resolver(deps, env, name),
        QueryMsg::Config {} => to_binary(&config_read(deps.storage).load()?),
    }
}
```

There are two queries. Note that we now have `deps: Deps` instead of `deps: DepsMut`.

Verify the registration with `ResolveRecord`:

```bash
$ wasmd query wasm contract-state smart $CONTRACT '{"resolve_record": {"name": "fred"}}' --node $RPC --output json
```

The response gives you the wallet address if the name is registered. Transfer the name to the second wallet `wallet2`:

```bash
$ wasmd tx wasm execute $CONTRACT '{"transfer":{"name":"fred","to":"wasm17a6xrje3vnhmevp0tflwt6t0dv2faz5sa3l2lq"}}' --amount 999upebble --from wallet --node $RPC --chain-id pebblenet-1 --gas-prices 0.001upebble --gas auto --gas-adjustment 1.3
```

Replace the address `wasm17a6xrje3vnhmevp0tflwt6t0dv2faz5sa3l2lq` with the address of your second wallet:

```
$ wasmd keys show wallet2 --address
```

You used `transfer_price` which we set at the instantiation.

Check again with a `resolve_record` query if the transfer was successful. Try to do another transfer from `wallet2` to `wallet`, and check which wallet can perform such a transaction.

<HighlightBox type="tip">

CosmWasm offers good [documentation](https://docs.cosmwasm.com/docs/). This section is a summary of the [Getting Started section](https://docs.cosmwasm.com/docs/getting-started/intro/). Store the script at [https://docs.cosmwasm.com/docs/getting-started/setting-env#run-local-node-optional](https://docs.cosmwasm.com/docs/getting-started/setting-env#run-local-node-optional) in case you wish to test on your local node. Also have a look at the [contract semantics](https://docs.cosmwasm.com/docs/SEMANTICS/).

You can find more information in the [CosmWasm Developer Academy](https://docs.cosmwasm.com/dev-academy/intro) and modular tutorials in the [Wasm tutorials](https://docs.cosmwasm.com/tutorials/hijack-escrow/intro). In addition, you can find various hands-on videos on the [workshops](https://docs.cosmwasm.com/tutorials/videos-workshops) page.

</HighlightBox>

## Next up

At this point, you have:

* [Understood how Cosmos and the Cosmos SDK fit in the overall development of blockchain technology.](../2-what-is-cosmos/02-blockchain-and-cosmos.md)
* [A better sense of what comprises the Cosmos ecosystem.](../2-what-is-cosmos/03-cosmos-ecosystem.md)
* [Set up a wallet, got some ATOM tokens, and staked them.](../2-what-is-cosmos/04-atom-staking.md)
* [Learned more about the elements of application architecture.](../3-main-concepts/02-architecture.md)
* [Understood and applied main concepts of the Cosmos SDK.](../3-main-concepts/01-index.md)
* [Ran a node, API, and CLI for a Cosmos chain.](../4-running-a-chain/04-node-api-and-cli.md)
* [Used Starport to develop your chain.](./02-starport.md)
* [Explored CosmJS and the code generated by Starport.](./04-cosmjs.md)
* [Discovered how CosmWasm assists with developing multi-chain smart contracts in Rust.](./05-cosmwasm.md)

You might wonder: what's next? There are vast opportunities to continue your journey with Cosmos to:

* Reach out to the community.
* Contribute to the Cosmos SDK, IBC, and Tendermint BFT consensus development.
* Get support for enterprise solutions, which you are developing.

Head right to the [What's Next section](../6-whats-next/index.md) to find useful information to launch your journey into the Cosmos universe.
