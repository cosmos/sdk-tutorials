---
parent:
title: Understanding the Group Module
order: 0
description: Use the Cosmos SDK group module to create and manage on-chain multisig accounts and enable voting for message execution based on configurable decision policies.
---

# Group Module

The [`group`](https://docs.cosmos.network/v0.46/modules/group/) module enables the creation and management of multisig accounts and enables voting for message execution based on configurable decision policies.

## Usage of the group module

When the group module is enabled in a chain (say the Cosmos Hub), this means that users can create groups and submit a group proposal.
This means that any number of users can be part of a group and vote on the group proposal. You can think of it as an enhanced multisig or DAO.

Before starting, let's first review some terminology:

* **Group Admin**: the account that creates the group is the group administrator. The group administrator is the account who can add, remove and change the group members, but does not need to be a member of the group itself. Choose it wisely.
* **[Group Policy](https://docs.cosmos.network/main/modules/group/01_concepts.html#group-policy)**: 
* **[Decision Policy](https://docs.cosmos.network/main/modules/group/01_concepts.html#decision-policy)**: a policy that defines how the group members can vote on a proposal and how the vote outcome is calculated.
* **Proposal**: A group proposal works the same way as a governance proposal: group members can submit proposals to the group and vote on proposals with a *Yes*, *No*, *No with Veto* and *Abstain*.

In this tutorial, you will learn how to create a group, manage its members, submit a group proposal and vote on it.
After that you'll be able to create your own on-chain DAO for your own use case.

## Requirements

The group module has been introduced in the [v0.46.0 release](https://docs.cosmos.network/v0.46/modules/group/) of the Cosmos SDK.
In order to follow the tutorial, you must use the binary of a chain with the group module, using a v0.46+ version of the SDK.
For demonstration purposes, you will use `simd`, the simulation app of the Cosmos SDK.

To install `simd`, first clone the Cosmos SDK GitHub repository and checkout the right version:

```sh
git clone https://github.com/cosmos/cosmos-sdk --depth=1 --branch v0.46.0
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

For creating a group, we must decide who is the admin and who are the members.
All members have a voting weight that is used to calculate their voting power in the group.

Let's create a `members.json` file that contains group members of a football association.
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
simd tx group create-group $ALICE_KEY "best football association" members.json
```


Let's see the group that we just created:

```sh
simd query group groups-by-admin $ALICE_KEY
simd query group group-members 1 # use the group id given by the previous command
```

Nice! Our group has `best football association` as metadata, Alice as group admin and having Alice and Bob as group members.

## Manage group members

For updating the group members, we send a transaction using the `update-group-members` command.
We can add a member in our members.json for adding a group member, or set a member voting weight to `0` for deleting the member.

Let's add Carol, Carlos and Charlie as group members and remove Bob:

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
            "metadata": "player"
        },
                {
            "address": "charlieaddr",
            "weight": "1",
            "metadata": "player"
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

As an exercice, please re-add bob in the group and go to the next section.

## Create group policy

Next we need to decide of a group policy. This defines how long a proposal can be voted on and how the outcome is calculated.
Here we use the `ThresholdDecisionPolicy`, it defines a threshold of yes votes (based on a tally of voter weights) that must be achieved in order for a proposal to pass.

Following is the content of the `policy.json`. Proposals can be voted on for a maximum of 10 minutes.
A proposal requires only one vote to pass.

```json
{
    "@type": "/cosmos.group.v1.ThresholdDecisionPolicy",
    "threshold": "1",
    "windows": {
        "voting_period": "10m",
        "min_execution_period": "0s"
    }
}
```


```sh
simd tx group create-group-policy $ALICE_KEY 1 "" policy.json
```

Let's verify our newly created group policy and save its address for future use:

```sh
simd query group group-policies-by-group 1
export GROUP_POLICY_ADDRESS=$(simd query group group-policies-by-group 1 --output json | jq -r '.group_policies[0].address')
```

## Vote on proposal

Now that we have a group with a few members and a group policy, let's submit our first group proposal.
Like for members management, we need to create a `proposal.json` file that contains the proposal.

A proposal can be of any message. For this tutorial, we continue with our example of an association.
The treasurer, Bob, wants to send money to a third party to pay the bills and creates a `proposal.json`:


```json
{
    "group_policy_address": "cosmos1..." , // the $GROUP_POLICY_ADDRESS
    // array of proto-JSON-encoded sdk.Msgs
    "messages": [
        {
            "@type": "/cosmos.bank.v1beta1.MsgSend",
            "from_address": "cosmos1...", // the $GROUP_POLICY_ADDRESS
            "to_address": "cosmos1zyzu35rmctfd2fqnnytthheugqs96qxsne67ad", // a third-party
            "amount": [
                {
                    "denom": "stake",
                    "amount": "100"
                }
            ]
        }
    ],
    "metadata": "costs utilities",
    "proposers": [ "cosmos1..." ] // $BOB_KEY
}
```

This proposal, if pass, will send 100 stake to cosmos1zyzu35rmctfd2fqnnytthheugqs96qxsne67ad to pay the bills.
The tokens will be sent from the decision policy address.

::: tip
The decision policy has no fund yet. We can fund it by sending a transaction with `simd tx bank send alice $GROUP_POLICY_ADDRESS 100stake`.
:::


```sh
simd tx group submit-proposal proposal.json --from bob
```

## View and vote on proposals

Let's see the proposal of our football association:

```sh
simd query group proposals-by-group-policy $GROUP_POLICY_ADDRESS
```

We can see our proposal has been submitted.

Next, we have Alice and Bob vote `Yes` on it and verify that our two votes are tallied:

```sh
simd tx group vote 1 $ALICE_KEY VOTE_OPTION_YES "agree"
simd tx group vote 1 $BOB_KEY VOTE_OPTION_YES "agree"
simd query group tally-result 1
```

After 10 minutes, our proposal should have passed, as the number of `Yes` votes are above the decision policy threshold:

```sh
simd query group proposal 1
```

By default proposal are not executed immediately so let's do that now:

```sh
simd tx group exec 1 --from alice
```

Verify that the proposal has been executed and the tokens have been sent:


```sh
simd query bank balances cosmos1zyzu35rmctfd2fqnnytthheugqs96qxsne67ad
```

## 🎉 Congratulations 🎉

By completing this tutorial, you have learned how to use the `group` module:

* Create a group
* Manage its members
* Submit a group proposal
* Vote on a proposal

For more information what else you can do with the CLI, please refer to its help.

```sh
simd tx group --help
simd query group --help
```

To learn more about the group module specs, check out the [group](https://docs.cosmos.network/main/modules/group) module developer documentation.
