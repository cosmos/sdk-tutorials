---
parent:
title: Understanding the Group Module
order: 0
description: Use the Cosmos SDK group module to create and manage on-chain multisig accounts and enables voting for message execution based on configurable decision policies.
---

# Group Module

The [`group`](https://docs.cosmos.network/v0.46/modules/group/) module enables the creation and management of multisig accounts and enables voting for message execution based on configurable decision policies.

## Usage of the group module

When the group module is enabled in a chain (say the Cosmos Hub), this means that users can create groups and submit group proposal.
This means that any group of users can be part of a group and vote on the group proposal. You can think of it as an enhanced multisig or DAO.

Before starting let's first review a few terminology:

* **Group Admin**: the person that creates the group is the group administrator. The group administrator is the person who can add, remove and change the group members, but does not need to be part of the group itself. Chose it wisely.
* **[Group Policy](https://docs.cosmos.network/main/modules/group/01_concepts.html#group-policy)**: 
* **[Decision Policy](https://docs.cosmos.network/main/modules/group/01_concepts.html#decision-policy)**: a policy that defines how the group members can vote on a proposal and how the vote outcome is calculated.
* **Proposal**: Groups proposal works the same way as governance proposal: group members can submit proposals to the group and vote with a *Yes*, *No*, *No with Veto* and *Abstain* on proposals.

In this tutorial, we will learn how to create groups, manage its members and submit and vote on a group proposal.
After that you'll be able to create your own on-chain DAO for your own use case.

## Requirements

The group module has been introduced in the [v0.46.0 release](https://docs.cosmos.network/v0.46/modules/group/) of the Cosmos SDK.
In order to follow the tutorial you must use the binary of a chain with the group module, using a v0.46+ version of the SDK.
For demonstration purposes we will use `simd`, the simulation app of the Cosmos SDK.

For installing `simd`, first clone the github repository:

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

## Create a group

For creating a group you must decide who is the admin and who are the members.
Each members has a voting weight that is used to calculate their voting power in the group.

Let's create a `members.json` file that contains group memebers of an association.
Replace `aliceaddr` and `bobaddr` by the address of Alice (`$ALICE_KEY`) and Bob (`$BOB_KEY`).


```json
{
    "members": [
        {
            "address": "aliceaddr",
            "weight": "1",
            "metadata": "president"
        },
        {
            "address": "bobaddr",
            "weight": "1",
            "metadata": "treasurer"
        }
    ]
}
```


```sh
simd tx group create-group $ALICE_KEY "my association" members.json
```


Let's see the group that we just created:

```sh
simd query group groups-by-admin $ALICE_KEY
simd query group group-members 1 # use the group id given by the previous command
```

Nice! Our group has `my association` as medatada, Alice as group admin and having Alice and Bob as group members.

## Manage group members

For updating the group members we send a transaction using the `update-group-members` command.
We can add a member in our members.json for adding a group member or set a member voting weight to `0` for deleting the member.

Let's add Carol, Carlos and Charlie as group member and remove Bob:

```json
{
    "members": [
        {
            "address": "aliceaddr",
            "weight": "1",
            "metadata": "president"
        },
        {
            "address": "bobaddr",
            "weight": "0", // this deletes bob
            "metadata": "treasurer"
        },
        {
            "address": "caroladdr",
            "weight": "1",
            "metadata": "treasurer"
        },
        {
            "address": "carlosaddr",
            "weight": "1",
            "metadata": "member"
        },
                {
            "address": "charlieaddr",
            "weight": "1",
            "metadata": "member"
        },
    ]
}
```

```sh
simd tx group update-group-members $ALICE_KEY 1 members.json
```

We can verify that the group members are updated:

```sh
simd query group group-members 1
```

For more information what other transaction are possible with the group module, please refer to its help.

```sh
simd tx group --help
```

As an exercice, please re-add bob in the group and go to the next section.

## Vote on proposal

Now that we have a group with a few members, let's submit our first group proposal.
Like for members management, we need to create a `proposals.json` file that contains the proposal.

```json
{
    "group_policy_address": "cosmos1...",
    // array of proto-JSON-encoded sdk.Msgs
    "messages": [
        {
            "@type": "/cosmos.bank.v1beta1.MsgSend",
            "from_address": "cosmos1...",
            "to_address": "cosmos1...",
            "amount": [
                {
                    "denom": "stake",
                    "amount": "10"
                }
            ]
        }
    ],
    "metadata": "4pIMOgIGx1vZGU=", // base64-encoded metadata
    "proposers": [ "cosmos1...", "cosmos1..."],
}
```


```sh
simd tx group submit-proposal proposal.json
```

## Change group policy

## 🎉 Congratulations 🎉

You are up to speed! You've learned how to create a group, manage its members and submit and vote on a group proposal.

To learn more about the implementation group module, check out the [group](https://docs.cosmos.network/main/modules/group) module developer documentation.
