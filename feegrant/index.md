---
parent:
  title: Understanding the Fee Grant Module
order: 0
description: Use the Cosmos SDK feegrant module to grant the use of tokens to pay for fees from one account (the granter) to another account (the grantee).
---

# Feegrant Module

The [feegrant](https://docs.cosmos.network/v0.44/modules/feegrant/) enables a user / contract / module (the granter) to pay the fees for someone else (the grantee) when they want to broadcast a transaction on the blockchain. A key feature of feegrant is that the granter retains full access to their tokens, and is able to revoke the allowance at any time.

## Use Feegrant to Grant an Allowance

An often discussed use case for the feegrant module is that blockchains or smart contracts can allow new users to start interacting with the chain or contract without having to acquire tokens first, greatly improving the onboarding experience.

There are two [fee allowance types](https://docs.cosmos.network/v0.44/modules/feegrant/01_concepts.html#fee-allowance-types) that the feegrant module implements: `BasicAllowance` and `PeriodicAllowance`, the latter allows you to setup a periodic allowance to another user. In this tutorial, you will set up two tokens in your blockchain: one default token called `stake`, which will be used for fees, and another called `kudos`, for sending to your friends.

You will learn how to spin up a single node network using the simulation application in Cosmos SDK (`simapp`), let Charlie grant a `BasicAllowance` to Bob, and then have Bob send `kudos` tokens to Charlie, while having zero `stake` to pay for fees.

## Requirements

Before you start the tutorial, you need to install the `simd` binary.

Clone the `cosmos-sdk` repository:

```bash
git clone https://github.com/cosmos/cosmos-sdk
```

Change directories and check out `v0.44.0`:

```bash
cd cosmos-sdk && git checkout v0.44.0
```

Install the `simd` binary:

```bash
make install
```

Check to make sure the installation was successful:

```bash
simd version
```

You should see `0.44.0` printed to the console.

## Configuration

<!-- TODO: update tip to use `unsafe-reset-all` with better user experience -->

::: tip
If you have used `simd` before, you might already have a `.simapp` directory in your home directory. To keep the previous data, either save the directory to another location or use the `--home` flag and specify a different directory for each command in the following instructions. If you don't want to keep the previous data, remove the previous directory (`rm -rf ~/.simapp`).
:::

Run the following commands to configure the `simd` binary.

Set the chain ID:

```bash
simd config chain-id demo
```

Set the [keyring backend](https://docs.cosmos.network/v0.42/run-node/keyring.html#the-test-backend):

```bash
simd config keyring-backend test
```

## Key Setup

You'll have to create a few test keys for your users.

Add a key for Alice:

```bash
simd keys add alice
```

Add a key for Bob:

```bash
simd keys add bob
```

And lastly, add a key for Charlie:

```bash
simd keys add charlie
```

If you'd like to see an overview of your keys, use:

```bash
simd keys list
```

In order to avoid having to copy-paste their address all the time, you should export them to variables that you can keep using during this tutorial:

```bash
export ALICE_KEY=$(simd keys show alice -a)
export BOB_KEY=$(simd keys show bob -a)
export CHARLIE_KEY=$(simd keys show charlie -a)
```

## Chain Setup

The following commands set up a chain using the simulation application (`simapp`).

Initialize the node:

```bash
simd init test --chain-id demo
```

Alice will be your validator. Add Alice and an initial balance to the genesis file:

```bash
simd add-genesis-account alice 5000000000stake --keyring-backend test
```

Add Bob and an initial balance to the genesis file:

```bash
simd add-genesis-account bob 2000kudos --keyring-backend test
```

Note that Bob only has `kudos` tokens and won't be able to pay for any fees that might be needed.

Add Charlie and an initial balance to the genesis file:

```bash
simd add-genesis-account charlie 1000000stake --keyring-backend test
```

Generate a transaction to add Alice to the initial validator set:

```bash
simd gentx alice 1000000stake --chain-id demo
```

Add the validator transaction to the genesis file:

```bash
simd collect-gentxs
```

## Start Chain

You are now ready to start a single node network on your local machine.

Start the chain:

```bash
simd start
```

## Grant Allowance

Before Bob can send `kudos` to Charlie, you'll need to setup an allowance for Bob, so that Charlie will pay for any gas fees the transaction might incur. You're not letting Alice pay the fees for Bob because Alice is the validator and would receive all those fees, which means you wouldn't be able to see the difference in her balance.

The `BasicAllowance` is a permission for a grantee to use up fees until the `spend_limit` or `expiration` is reached. Create an allowance with a spend limit of `100000stake` and no expiration date:

```bash
simd tx feegrant grant $CHARLIE_KEY $BOB_KEY --from charlie --spend-limit 100000stake
```

View the allowance:

```bash
simd q feegrant grants $BOB_KEY
```

## Send Tokens

First, let's check the balances of Alice, Bob and Charlie, so that you can later confirm if your transaction was successful:

```bash
simd q bank balances $ALICE_KEY
simd q bank balances $BOB_KEY
simd q bank balances $CHARLIE_KEY
```

Note that Alice has `4999000000stake` because she bonded `1000000stake` to become a validator during the chain setup.

Any transaction that is sent using the `tx` command can be ammended with a flag `--fee-account` that takes an account as input which will pay for the fees.

Send `kudos` tokens from Bob to Charlie, while Charlie pays the fees:

```bash
simd tx bank send $BOB_KEY $CHARLIE_KEY 100kudos --from bob --fee-account $CHARLIE_KEY --fees 500stake
```

Look at the balances again:

```bash
simd q bank balances $ALICE_KEY
simd q bank balances $BOB_KEY
simd q bank balances $CHARLIE_KEY
```

Notice how Charlie lost the `500stake` that we added to the transaction, while Bob was the one who signed.

View the allowance again:

```bash
simd q feegrant grants $BOB_KEY
```

Note how `spend_limit` has been reduced and Bob now has 99500stake left to spend on fees.

## Revoke Allowance

The granter can revoke the allowance from the grantee using the `revoke` command.

Revoke allowance:

```bash
simd tx feegrant revoke $CHARLIE_KEY $BOB_KEY --from charlie
```

View the allowance:

```bash
simd q feegrant grants $BOB_KEY
```

## 🎉 Congratulations 🎉

By completing this tutorial, you have learned how to use the feegrant module:

- Configured and used the simulation application (simapp)
- Created an allowance
- Made a transaction with fees paid by a granter
- Revoked an allowance

There is a lot more that you can do with the feegrants module. You can add a list of allowed messages, set an expiration date and set a time duration after which the spend limit is refilled again. To learn more about the feegrant module and different types of allowances, check out the [feegrant module documentation](https://docs.cosmos.network/v0.44/modules/feegrant/).
