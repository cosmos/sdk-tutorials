---
parent:
  title: Understanding the Fee Grant Module
order: 0
description: Use the Cosmos SDK fee grant module to grant the use of tokens to pay for fees from one account (the granter) to another account (the grantee).
---

# Feegrant Module

The [feegrant](https://docs.cosmos.network/v0.44/modules/feegrant/) enables a user / contract / module (the granter) to pay the fees for someone else (the grantee) when they want to broadcast a transaction on the blockchain. A key feature of feegrant is that the granter retains full access to their tokens, and is able to revoke the allowance at any time.

## Use Feegrant to Grant an Allowance

An often discussed use case for the fee grant module is improved onboarding experience because new users don't have to acquire tokens before they can start interacting with the blockchain or smart contract.  

Two [fee allowance types](https://docs.cosmos.network/v0.44/modules/feegrant/01_concepts.html#fee-allowance-types) are implemented with the fee grant module:

- `BasicAllowance`

    Grantee uses fees from a granter's account.

- `PeriodicAllowance`

    A periodic allowance to another user. 

In this tutorial, you will set up two tokens in your blockchain: a default token called `stake` to use for fees and another token called `kudos` to send to your friends.

You will learn how to spin up a single node network using the simulation application in Cosmos SDK (`simapp`) and set up Alice to be a validator. Then you'll have Bob send `kudos` tokens to Carol, while having zero `stake` to pay for fees. The latter will be possible because you'll let Carol grant a `BasicAllowance` to Bob.

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

Add a key for Alice, the validator:

```bash
simd keys add alice
```

Add a key for Bob, the grantee:

```bash
simd keys add bob
```

And lastly, add a key for Carol, the granter:

```bash
simd keys add carol
```

If you'd like to see an overview of your keys, use:

```bash
simd keys list
```

::: tip
To avoid having to copy and paste the user addresses now is a good time to export the user keys to variables that you can access and use for this tutorial. 
:::

```bash
export ALICE_KEY=$(simd keys show alice -a)
export BOB_KEY=$(simd keys show bob -a)
export CAROL_KEY=$(simd keys show carol -a)
```

## Chain Setup

The following commands set up a chain using the simulation application (`simapp`).

Initialize the node:

```bash
simd init test --chain-id demo
```

Alice is your validator. Add Alice and an initial balance to the genesis file:

```bash
simd add-genesis-account alice 5000000000stake --keyring-backend test
```

Add Bob and an initial balance to the genesis file:

```bash
simd add-genesis-account bob 2000kudos --keyring-backend test
```

Note that Bob has only `kudos` tokens and won't be able to pay for any fees that might be needed.

Add Carol and an initial balance to the genesis file:

```bash
simd add-genesis-account carol 1000000stake --keyring-backend test
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

Before Bob can send `kudos` to Carol, you'll need to set up an allowance for Bob, so that Carol will pay for any gas fees the transaction might incur. Note that Alice is the validator, so it would not make sense to make her the granter as well because a validator would receive all the fees that the granter paid for. In that case, you wouldn't have been able to see the difference in her balance after a transaction was completed.

The `BasicAllowance` is a permission for a grantee to use up fees until the `spend_limit` or `expiration` is reached. Create an allowance with a spend limit of `100000stake` and no expiration date:

```bash
simd tx feegrant grant $CAROL_KEY $BOB_KEY --from carol --spend-limit 100000stake
```

View the allowance:

```bash
simd q feegrant grants $BOB_KEY
```

## Send Tokens

First, let's check the balances of Alice, Bob and Carol, so that you can later confirm if your transaction was successful:

```bash
simd q bank balances $ALICE_KEY
simd q bank balances $BOB_KEY
simd q bank balances $CAROL_KEY
```

Note that Alice has `4999000000stake` because she bonded `1000000stake` to become a validator during the chain setup.

Any transaction that is sent using the `tx` command can be ammended with a flag `--fee-account` that takes an account as input which will pay for the fees.

Send `kudos` tokens from Bob to Carol, while Carol pays the fees:

```bash
simd tx bank send $BOB_KEY $CAROL_KEY 100kudos --from bob --fee-account $CAROL_KEY --fees 500stake
```

Look at the balances again:

```bash
simd q bank balances $ALICE_KEY
simd q bank balances $BOB_KEY
simd q bank balances $CAROL_KEY
```

Notice how Carol lost the `500stake` that we added to the transaction, while Bob was the one who signed.

View the allowance again:

```bash
simd q feegrant grants $BOB_KEY
```

Note how `spend_limit` has been reduced and Bob now has 99500stake left to spend on fees.

## Revoke Allowance

The granter can revoke the allowance from the grantee using the `revoke` command.

Revoke allowance:

```bash
simd tx feegrant revoke $CAROL_KEY $BOB_KEY --from carol
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
