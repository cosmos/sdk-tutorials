---
title: "Understand the Feegrant Module"
order: 3
description: Use the Cosmos SDK feegrant module to grant the use of tokens to pay for fees from one account (the granter) to another account (the grantee).
tags:
  - tutorial
  - cosmos-sdk
  - dev-ops
---

# Understand the Feegrant Module

The [`feegrant`](https://docs.cosmos.network/v0.44/modules/feegrant/) module enables the granter (a user, contract, or module) to pay the fees for someone else (the grantee) when the grantee wants to broadcast a transaction on the blockchain. The granter retains full access to their tokens and is able to revoke the allowance at any time.

## Using feegrant to grant an allowance

An often-discussed use case for the `feegrant` module is _improved onboarding experience_, because new users do not have to acquire tokens before they can start interacting with the blockchain or smart contract.

Two [fee allowance types](https://docs.cosmos.network/v0.44/modules/feegrant/01_concepts.html#fee-allowance-types) are implemented with the `feegrant` module:

* `BasicAllowance`

    Grantee uses fees from a granter's account. The allowance can have a one-time limit, an expiration, or no limit.

* `PeriodicAllowance`

    Grantee uses fees from a granter's account. The allowance has a limit that is periodically reset.

In this tutorial, you will set up two tokens in your blockchain: a default token called `stake` to use for fees, and another token called `kudos` to send to your friends.

* You will learn how to spin up a single-node network using the simulation application in the Cosmos SDK (`simapp`).
* You will set Alice up to be a validator.
* Bob will be the grantee, who receives a `BasicAllowance` that allows Bob to send `kudos` tokens to Alice, even though Bob has zero `stake` to pay for fees.
* Alice will be the granter, who grants a `BasicAllowance` to Bob.

## Requirements

Before you start the tutorial, you need to install the `simd` binary.

Clone the `cosmos-sdk` repository:

```sh
$ git clone https://github.com/cosmos/cosmos-sdk
```

Change directories and check out `v0.44.0`:

```sh
$ cd cosmos-sdk && git checkout v0.44.0
```

Install the `simd` binary:

```sh
$ make install
```

Check to make sure the installation was successful:

```sh
$ simd version
```

The version number `0.44.0` is output to the console.

## Configuration

<HighlightBox type="tip">

If you have used `simd` before, you might already have a `.simapp` directory in your home directory. To keep the previous data, either save the directory to another location or use the `--home` flag and specify a different directory for each command in the following instructions. If you do not want to keep the previous data, remove the previous directory (`rm -rf ~/.simapp`).

</HighlightBox>

Run the following commands to configure the `simd` binary.

Set the chain ID:

```sh
$ simd config chain-id demo
```

Set the [keyring backend](https://docs.cosmos.network/master/run-node/keyring.html#setting-up-the-keyring):

```sh
$ simd config keyring-backend test
```

## Key setup

You will have to create a few test keys for your users.

Add a key for Alice, the validator:

```sh
$ simd keys add alice
```

Add a key for Bob, the grantee:

```sh
$ simd keys add bob
```

If you would like to see an overview of your keys, use:

```sh
$ simd keys list
```

<HighlightBox type="tip">

To avoid having to copy and paste the user addresses, now is a good time to export the user keys to variables that you can access and use for this tutorial.

</HighlightBox>

```sh
$ export ALICE=$(simd keys show alice --address)
$ export BOB=$(simd keys show bob --address)
```

## Chain setup

The following commands set up a chain using the simulation application (`simapp`).

Initialize the node:

```sh
$ simd init test --chain-id demo
```

Alice is your validator. Add Alice and an initial balance to the genesis file:

```sh
$ simd add-genesis-account alice 5000000000stake --keyring-backend test
```

Add Bob and an initial balance to the genesis file:

```sh
$ simd add-genesis-account bob 2000kudos --keyring-backend test
```

<HighlightBox type="note">

Note that Bob has only `kudos` tokens and is not able to pay for any fees that might be needed.

</HighlightBox>

Generate a transaction to add Alice to the initial validator set:

```sh
$ simd gentx alice 1000000stake --chain-id demo
```

Add the validator transaction to the genesis file:

```sh
$ simd collect-gentxs
```

## Start chain

You are now ready to start a single node network on your local machine.

Start the chain:

```sh
$ simd start
```

## Grant allowance

Before Bob can send `kudos` to Alice, you must set up an allowance for Bob so that Alice pays for any gas fees the transaction might incur.

The `BasicAllowance` is a permission for a grantee to use up fees until the `spend_limit` or `expiration` is reached. Open up a new terminal window and create an allowance with a spend limit of `100000stake` and no expiration date:

```sh
$ simd tx feegrant grant $ALICE $BOB --from alice --spend-limit 100000stake
```

View the allowance:

```sh
$ simd query feegrant grants $BOB
```

## Send tokens

First, check the balances of Alice and Bob. Verifying the initial balance provides a baseline so that you can later confirm if your transaction was successful:

```sh
$ simd query bank balances $ALICE
$ simd query bank balances $BOB
```

<HighlightBox type="note">

Note that Alice has `4999000000stake` because she bonded `1000000stake` to become a validator during the chain setup.

</HighlightBox>

Any transaction that is sent using the `tx` command can use the `--fee-account` flag to specify an account as input to pay for the fees.

Send `kudos` tokens from Bob to Alice, while Alice pays the fees:

```sh
$ simd tx bank send $BOB $ALICE 100kudos --from bob --fee-account $ALICE --fees 500stake
```

Look at the balances again:

```sh
$ simd query bank balances $ALICE
$ simd query bank balances $BOB
```

Notice how Alice has `500stake` less than before. The `500stake` was added to the transaction that Bob signed.

View the allowance again:

```sh
$ simd query feegrant grants $BOB
```

<HighlightBox type="note">

Note how `spend_limit` has been reduced and Bob now has `99500stake` left to spend on fees.

</HighlightBox>

## Revoke allowance

The granter can revoke the allowance from the grantee using the `revoke` command.

Revoke allowance:

```sh
$ simd tx feegrant revoke $ALICE $BOB --from alice
```

View the allowance:

```sh
$ simd query feegrant grants $BOB
```

## 🎉 Congratulations 🎉

By completing this tutorial, you have learned how to use the `feegrant` module!

<HighlightBox type="info">

Want a demonstration of x/feegrant and x/authz? In the following video Amaury Martiny, Core Developer at Parity Technologies, and Likhita Polavarapu, Software Developer at Vitwit, present a workshop on the significant UX benefits of both modules and how to integrate them into blockchain applications.

<YoutubePlayer videoId="g6t5ZJSQDus"/>

</HighlightBox>


<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to configure and use the simulation application (simapp).
* How to create an allowance.
* How to make a transaction with fees paid by a granter.
* How to revoke an allowance.

</HighlightBox>

There is a lot more that you can do with the `feegrant` module. You can add a list of allowed messages, set an expiration date, and set a time duration after which the spend limit is refilled. To learn more about the `feegrant` module and different types of allowances, check out the Cosmos SDK [Feegrant Module](https://docs.cosmos.network/v0.44/modules/feegrant/) documentation.
