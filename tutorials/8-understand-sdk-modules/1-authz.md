---
title: "Understand the Authz Module"
order: 2
description: Use the Cosmos SDK authz module to grant authorizations from one account (the granter) to another account (the grantee).
tags:
  - tutorial
  - cosmos-sdk
  - dev-ops
---

# Understand the Authz Module

The [authz](https://docs.cosmos.network/v0.44/modules/authz/) (authorization) module enables one user (the granter) to authorize another (the grantee) to execute messages on their behalf. The authz module is different from the [auth](https://docs.cosmos.network/v0.44/modules/auth/) (authentication) module that is responsible for specifying the base transaction and account types.

## Use authz to grant authorizations

By implementing the authz module, Cosmos SDK application developers give users the ability to grant certain privileges to other users. For example, a user might want another user to vote on their behalf and so, rather than giving the other user access to their account, the user would grant an authorization that allows the other user to execute `MsgVote` on their behalf.

How users decide to use the authz module is up to them. In one case, a validator might want to create a separate account for voting in order to keep their validator key more secure. In another case, a decentralized autonomous organization (DAO) might want to distribute authorizations to members of the DAO, in which case a multisig account would grant authorizations to individual accounts and members of the DAO would be able to execute messages without requiring signatures from all the other members.

In this tutorial, you will spin up a single node network using the simulation application in the Cosmos SDK (`simapp`), grant an authorization to another account, and then execute a message on behalf of the granter as the grantee.

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

You should see `0.44.0` printed on the console.

## Configuration

<!-- TODO: update tip to use `unsafe-reset-all` with better user experience -->

<HighlightBox type="tip">

If you have used `simd` before, you might already have a `.simapp` directory in your home directory. To keep the previous data, either save the directory to another location or use the `--home` flag and specify a different directory for each command in the following instructions. If you do not want to keep the previous data, remove the previous directory (`rm -rf ~/.simapp`).

</HighlightBox>

Run the following commands to configure the `simd` binary.

Set the chain ID:

```sh
$ simd config chain-id demo
```

Set the keyring backend:

```sh
$ simd config keyring-backend test
```

## Key setup

Create a couple of test keys. Use the `--recover` option so that the addresses used in the following example commands are consistent.

Add a key for Alice:

```sh
$ simd keys add alice --recover
```

Enter the following mnemonic:

```txt
plunge hundred health electric victory foil marine elite shiver tonight away verify vacuum giant pencil ocean nest pledge okay endless try spirit special start
```

Add a key for Bob:

```sh
$ simd keys add bob --recover
```

Enter the following mnemonic:

```txt
shuffle oppose diagram wire rubber apart blame entire thought firm carry swim old head police panther lyrics road must silly sting dirt hard organ
```

## Chain setup

The following commands set up a chain using the simulation application (`simapp`).

Initialize the node:

```sh
$ simd init test --chain-id demo
```

Add Alice and an initial balance to the genesis file:

```sh
$ simd add-genesis-account alice 5000000000stake --keyring-backend test
```

Add Bob and an initial balance to the genesis file:

```sh
$ simd add-genesis-account bob 5000000000stake --keyring-backend test
```

Generate a transaction to add Alice to the initial validator set:

```sh
$ simd gentx alice 1000000stake --chain-id demo
```

Add the validator transaction to the genesis file:

```sh
$ simd collect-gentxs
```

## Start chain

You are now ready to start a single-node network on your local machine.

Start the chain:

```sh
$ simd start
```

## Submit s proposal

To demonstrate authorization to vote on a governance proposal, you must first create a governance proposal. The following command creates a text proposal that includes the minimum deposit, which allows the governance proposal to immediately enter the voting period. For more information about the command and the flag options, run `simd tx gov submit-proposal --help`.

Create proposal:

```sh
$ simd tx gov submit-proposal --title="Test Authorization" --description="Is Bob authorized to vote?" --type="Text" --deposit="10000000stake" --from alice
```

View proposal:

```sh
$ simd query gov proposal 1
```

## Grant authorization

Next, the granter must `grant` an authorization to the grantee.

The authorization is a "generic" authorization, which is one that takes a message type (such as `MsgVote`) as a parameter and allows the grantee unlimited authorization to execute that message on behalf of the granter. Other [authorization types](https://docs.cosmos.network/v0.44/modules/authz/01_concepts.html#built-in-authorizations) include "send", "delegate", "unbond", and "redelegate" in which case a limit on the number of tokens can be set by the granter. In this case, the grantee can vote as many times as they want until the granter revokes the authorization.

Create authorization:

```sh
$ simd tx authz grant cosmos1khljzagdncfs03x5g6rf9qp5p93z9qgc3w5dwt generic --msg-type /cosmos.gov.v1beta1.MsgVote --from alice
```

View authorization:

```sh
$ simd query authz grants cosmos1jxd2uhx0j6e59306jq3jfqs7rhs7cnhvey4lqh cosmos1khljzagdncfs03x5g6rf9qp5p93z9qgc3w5dwt /cosmos.gov.v1beta1.MsgVote
```

## Generate transaction

In order for the grantee to execute a message on behalf of the granter, the grantee must first generate an unsigned transaction where the transaction author (the `--from` address) is the granter.

Create unsigned transaction:

```sh
$ simd tx gov vote 1 yes --from cosmos1jxd2uhx0j6e59306jq3jfqs7rhs7cnhvey4lqh --generate-only > tx.json
```

View transaction:

```sh
$ cat tx.json
```

## Execute transaction

Finally, the grantee can sign and send the transaction using the `exec` command. The author of the transaction (the `--from` address) is the grantee.

Sign and send transaction:

```sh
$ simd tx authz exec tx.json --from bob
```

View vote:

```sh
$ simd query gov vote 1 cosmos1jxd2uhx0j6e59306jq3jfqs7rhs7cnhvey4lqh
```

## Revoke authorization

The granter can revoke the authorization from the grantee using the `revoke` command.

Revoke authorization:

```sh
$ simd tx authz revoke cosmos1khljzagdncfs03x5g6rf9qp5p93z9qgc3w5dwt /cosmos.gov.v1beta1.MsgVote --from alice
```

View authorization:

```sh
$ simd query authz grants cosmos1jxd2uhx0j6e59306jq3jfqs7rhs7cnhvey4lqh cosmos1khljzagdncfs03x5g6rf9qp5p93z9qgc3w5dwt /cosmos.gov.v1beta1.MsgVote
```

## 🎉 Congratulations 🎉

By completing this tutorial, you have learned how to use the authz module!

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to configure and use the simulation application (simapp).
* How to create a governance proposal.
* How to create a voting authorization.
* How to generate an unsigned transaction.
* How to sign and execute a transaction.
* How to revoke a voting authorization.

</HighlightBox>

To learn more about the authorization module and different types of authorizations, check out the [authz module documentation](https://docs.cosmos.network/v0.44/modules/authz/).
