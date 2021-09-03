---
parent:
  title: Understanding the Authz Module
order: 0
description: Use the Cosmos SDK authz module to grant authorizations from one account (the granter) to another account (the grantee).
---

# Authz Module

The authz (authorization) module enables a granter to grant authorizations to a grantee that allows the grantee to execute messages on behalf of the granter.

## Use Authz to Grant Authorizations

By implementing the [authz module](https://docs.cosmos.network/v0.43/modules/authz/), Cosmos SDK application developers give users the ability to grant certain privileges to other users. For example, a user might want another user to vote on their behalf and so, rather than giving the other user access to their account, the user would grant an authorization that allows the other user to execute `MsgVote` on their behalf.

How users decide to use the authz module is up to them. In one case, a validator might want to create a separate account for voting in order to keep their validator key more secure. In another case, a DAO might want to distribute authorizations to members of the decentralized autonomous organization (DAO) in which case a multisg account would grant authorizations to individual accounts and members of the DAO would be able to execute messages without requiring signatures from all the other members.

In this tutorial, you spin up a single node network using the simulation application in Cosmos SDK (`simapp`), grant an authorization to another account, and then execute a message on behalf of the granter as the grantee.

## Requirements

Before you start the tutorial, you need to install the `simd` binary.

Clone the `cosmos-sdk` repository:
```
git clone https://github.com/cosmos/cosmos-sdk
```

Change directories and check out `v0.43.0`:
```
cd cosmos-sdk && git checkout v0.43.0
```

Install the `simd` binary:
```
make install
```

Check to make sure the installation was successful:
```
simd version
```

You should see `0.43.0` printed to the console.

## Configuration

<!-- TODO: update tip to use `unsafe-reset-all` with better user experience -->

::: tip
If you have used `simd` before, you might already have a `.simapp` directory in your home directory. To keep the previous data, either save the directory to another location or use the `--home` flag and specify a different directory for each command in the following instructions. If you don't want to keep the previous data, remove the previous directory (`rm -rf ~/.simapp`).
:::

Run the following commands to configure the `simd` binary.

Set the chain ID:
```
simd config chain-id demo
```

Set the keyring backend:
```
simd config keyring-backend test
```

## Key Setup

Create a couple test keys. You will use the `--recover` option so that the addresses used within the example commands below are consistent.

Add a key for Alice:
```
simd keys add alice --recover
```

Enter the following mnemonic:
```
plunge hundred health electric victory foil marine elite shiver tonight away verify vacuum giant pencil ocean nest pledge okay endless try spirit special start
```

Add a key for Bob:
```
simd keys add bob --recover
```

Enter the following mnemonic:
```
shuffle oppose diagram wire rubber apart blame entire thought firm carry swim old head police panther lyrics road must silly sting dirt hard organ
```

## Chain Setup

The following steps will start a chain for the simulation application (`simapp`).

Initialize the node:
```
simd init test --chain-id demo
```

Add Alice and an initial balance to the genesis file:
```
simd add-genesis-account alice 5000000000stake
```

Add Bob and an initial balance to the genesis file:
```
simd add-genesis-account bob 5000000000stake
```

Generate a transaction adding Alice to the initial validator set:
```
simd gentx alice 1000000stake --chain-id demo
```

Add the validator transaction to the genesis file:
```
simd collect-gentxs
```

## Start Chain

You are now ready to start a single node network on your local machine.

Start the chain:
```
simd start
```

## Submit Proposal

In order to demonstrate an authorization to vote on a governance proposal, you'll need to first create a governance proposal.

Create proposal:
```
simd tx gov submit-proposal --title="Test Authorization" --description="Is Bob authorized to vote?" --type="Text" --deposit="10000000stake" --from alice
```

View proposal:
```
simd q gov proposal 1
```

## Grant Authorization

Next, the granter will need to `grant` an authorization to the grantee.

The authorization will be a "generic" authorization, meaning there are no limits on the authorization. In this case, the grantee will be able to vote as many times as they want until the granter revokes the authorization.

Create authorization:
```
simd tx authz grant cosmos1khljzagdncfs03x5g6rf9qp5p93z9qgc3w5dwt generic --msg-type /cosmos.gov.v1beta1.MsgVote --from alice
```

View authorization:
```
simd q authz grants cosmos1jxd2uhx0j6e59306jq3jfqs7rhs7cnhvey4lqh cosmos1khljzagdncfs03x5g6rf9qp5p93z9qgc3w5dwt /cosmos.gov.v1beta1.MsgVote
```

## Generate Transaction

In order for the grantee to execute a message on behalf of the granter, the grantee will first need to generate an unsigned transaction where the transaction author (the `--from` address) is the granter. 

Create unsigned transaction:
```
simd tx gov vote 1 yes --from cosmos1jxd2uhx0j6e59306jq3jfqs7rhs7cnhvey4lqh --generate-only > tx.json
```

View transaction:
```
cat tx.json
```

## Execute Transaction

Finally, the grantee can sign and send the transaction using the `exec` command. The author of the transaction (the `--from` address) will be the grantee.

Sign and send transaction:
```
simd tx authz exec tx.json --from bob
```

View vote:
```
simd q gov vote 1 cosmos1jxd2uhx0j6e59306jq3jfqs7rhs7cnhvey4lqh
```

## Revoke Authorization

If the granter would like to revoke the authorization from the grantee, the granter can use the `revoke` command.

Revoke authorization:
```
simd tx authz revoke cosmos1khljzagdncfs03x5g6rf9qp5p93z9qgc3w5dwt /cosmos.gov.v1beta1.MsgVote --from alice
```

View authorization:
```
simd q authz grants cosmos1jxd2uhx0j6e59306jq3jfqs7rhs7cnhvey4lqh cosmos1khljzagdncfs03x5g6rf9qp5p93z9qgc3w5dwt /cosmos.gov.v1beta1.MsgVote
```

## 🎉 Congratulations 🎉

By completing this tutorial, you have learned how to use the authz module.

To learn more about the authorization module and different types of authorizations, check out the [authz module documentation](https://docs.cosmos.network/v0.43/modules/authz/).
