---
parent:
title: Understanding the Group Module
order: 0
description: Use the Cosmos SDK group module to create and manage on-chain multisig accounts and enables voting for message execution based on configurable decision policies.
---

# Group Module

The [`group`](https://docs.cosmos.network/v0.46/modules/group/) module enables the creation and management of multisig accounts and enables voting for message execution based on configurable decision policies.

## Use Group to Create a Multisig Account



## Requirements

The group module has been introduced in the [v0.46.0 release](https://docs.cosmos.network/v0.46/modules/group/) of the Cosmos SDK.
In order to follow the tutorial you must use the binary of a chain with the group module, using a v0.46+ version of the SDK.
For demonstration purposes we will use `simd`, the simulation app of the Cosmos SDK.

For installing `simd`, first clone the github reposoitory:

```sh
git clone https://github.com/cosmos/cosmos-sdk --depth=1 
```

Go to the cloned directory and checkout the v0.46.0 release:

```sh
cd cosmos-sdk && git checkout v0.46.0
```

Install `simd`

```sh
make install
```

Make sure the installation was successful:

```sh
simd version
```

The version number should be greater than or equal to `0.46.0`.

## Configuration

::: tip
If you have used `simd` before, you might already have a `.simapp` directory in your home directory. You can skip to the next section or remove the chain directory (`rm -rf ~/.simapp`).
:::

In order to configure `simd`, you need to set the chain ID and the keyring backend.

```sh
simd config chain-id demo
simd config keyring-backend test
```

Secondly, you need to add keys for group users; let's call them alice and bob.

```sh
simd keys add alice
simd keys add bob
```

With `simd keys list` you can verify that our two users have been added.

::: tip
To avoid having to copy and paste the user addresses, now is a good time to export the user keys to variables that you can access and use for this tutorial.
:::

```sh
export ALICE_KEY=$(simd keys show alice -a)
export BOB_KEY=$(simd keys show bob -a)
```

Now we are ready to fund alice and bob accounts and use alice account as validator:

```sh
simd init test --chain-id demo
simd add-genesis-account alice 5000000000stake --keyring-backend test
simd add-genesis-account bob 5000000000stake --keyring-backend test
simd gentx alice 1000000stake --chain-id demo
simd collect-gentxs
```

Lastly, we start the chain:

```sh
simd start
```

`simapp` is now configured and running! We can now play with the group module!
