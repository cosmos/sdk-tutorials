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
* **[Group Policy](https://docs.cosmos.network/main/modules/group/01_concepts.html#group-policy)**: a group policy is an account associated with a group and a decision policy. In order to perform action on this account, a proposal must be approved by the majority of the group members; or as defined in the decision policy. Note, a group can have multiple group policies.
* **[Decision Policy](https://docs.cosmos.network/main/modules/group/01_concepts.html#decision-policy)**: a policy that defines how the group members can vote on a proposal and how the vote outcome is calculated.
* **Proposal**: A group proposal works the same way as a governance proposal: group members can submit proposals to the group and vote on proposals with a _Yes_, _No_, _No with Veto_ and _Abstain_.

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

Go to the cloned directory:

```sh
cd cosmos-sdk
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

<HighlightBox type="tip">

If you have used `simd` before, you might already have a `.simapp` directory in your home directory. You can skip to the next section or remove the chain directory (`rm -rf ~/.simapp`).

</HighlightBox>

In order to configure `simd`, you need to set the chain ID and the keyring backend.

```sh
simd config chain-id demo
simd config keyring-backend test
```

Secondly, you need to add keys for group users. Call them Alice and Bob.

```sh
simd keys add alice
simd keys add bob
```

With `simd keys list` you can verify that your two users have been added.

<HighlightBox type="tip">

To avoid having to copy and paste the user addresses, now is a good time to export the user keys to variables that you can access and use for this tutorial.

</HighlightBox>

```sh
export ALICE=$(simd keys show alice --address)
export BOB=$(simd keys show bob --address)
```

Now you are ready to fund Alice and Bob accounts and use the Alice account as validator:

```sh
simd init test --chain-id demo
simd add-genesis-account alice 5000000000stake --keyring-backend test
simd add-genesis-account bob 5000000000stake --keyring-backend test
simd gentx alice 1000000stake --chain-id demo
simd collect-gentxs
```

Lastly, start the chain:

```sh
simd start
```

`simapp` is now configured and running. You can now play with the group module.

## Create a group

To create a group, you must decide who is the admin and who are the members.
All members have a voting weight that is used to calculate their voting power in the group.

Create a `members.json` file that contains group members of a football association.
Replace `aliceaddr` and `bobaddr` with the literal addresses of Alice (`$ALICE`) and Bob (`$BOB`) respectively.


```json
{
    "members": [
        {
            "address": "aliceaddr", // $ALICE
            "weight": "1",
            "metadata": "president"
        },
        {
            "address": "bobaddr", // $BOB
            "weight": "1",
            "metadata": "treasurer"
        }
    ]
}
```

Create  the group:

```sh
simd tx group create-group $ALICE "best football association" members.json
```


Query and verify the group that you just created:

```sh
simd query group groups-by-admin $ALICE
export GROUP_ID=$(simd query group groups-by-admin $ALICE --output json | jq -r '.groups[0].id')
```

The previous command output showed that the group has an `id`. Use that `id` for querying the group members.

```sh
simd query group group-members $GROUP_ID
```

Nice! Our group has `best football association` as metadata, Alice as group admin, and Alice and Bob as group members.

## Manage group members

To update the group's members, you send a transaction using the `update-group-members` command.
You can add a member in your `members.json` to add a group member, or set a member's voting weight to `0` to delete the member.
Unchanged members do not need to be included in the `members.json`.

Let's add Carol, Dave and Emma as group members and remove Bob:

```json
{
    "members": [
        {
            "address": "bobaddr", // $BOB
            "weight": "0", // this deletes bob
            "metadata": "treasurer"
        },
        {
            "address": "caroladdr",
            "weight": "1",
            "metadata": "treasurer"
        },
        {
            "address": "daveaddr",
            "weight": "1",
            "metadata": "player"
        },
                {
            "address": "emmaaddr",
            "weight": "1",
            "metadata": "player"
        },
    ]
}
```

```sh
simd tx group update-group-members $ALICE $GROUP_ID members.json
```

You can verify that the group members are updated:

```sh
simd query group group-members $GROUP_ID
```

As an exercise, please add Bob back in the group and go to the next section.

## Create a group policy

Next you need to decide on a group policy. This defines how long a proposal can be voted on and how its outcome is calculated.
Here you use the `ThresholdDecisionPolicy`. It defines the threshold that the tally of weighted _yes_ votes must reach in order for a proposal to pass. Each member's vote is weighted by its weight as defined in the group.

Following is the content of the `policy.json`. It states that:

* A proposal can be voted on for a maximum of 10 minutes.
* A proposal requires only one vote to pass.

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
simd tx group create-group-policy $ALICE $GROUP_ID "" policy.json
```

Verify your newly created group policy and save its address for future use:

```sh
simd query group group-policies-by-group $GROUP_ID
export GROUP_POLICY_ADDRESS=$(simd query group group-policies-by-group $GROUP_ID --output json | jq -r '.group_policies[0].address')
```

## Create a proposal

Now that you have a group with a few members and a group policy, you submit your first group proposal.
Like for members management, you need to create a `proposal.json` file that contains the proposal.

A proposal can contain any number of messages defined on the current blockchain.

For this tutorial, you continue with your example of an association. The treasurer, Bob, who wants to send money to a third party to pay the bills, creates a `proposal.json`:


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
    "proposers": [ "bobaddr" ] // $BOB
}
```

This proposal, if passed, will send 100 `stake` to `cosmos1zyzu35rmctfd2fqnnytthheugqs96qxsne67ad` to pay the bills.
The tokens will be sent from the decision policy address.

<HighlightBox type="tip">

The decision policy has no funds yet. You can fund it by sending a transaction with `simd tx bank send alice $GROUP_POLICY_ADDRESS 100stake`.

</HighlightBox>


```sh
simd tx group submit-proposal proposal.json --from bob
```

## View and vote on proposals

Check and verify the proposal of your football association:

```sh
simd query group proposals-by-group-policy $GROUP_POLICY_ADDRESS
export PROPOSAL_ID=$(simd query group proposals-by-group-policy $GROUP_POLICY_ADDRESS --output json | jq -r '.proposals[0].id')
```

You can see that your proposal has been submitted.

Next, have Alice and Bob vote _Yes_ on the proposal and verify that both their votes are tallied:

```sh
simd tx group vote $PROPOSAL_ID $ALICE VOTE_OPTION_YES "agree"
simd tx group vote $PROPOSAL_ID $BOB VOTE_OPTION_YES "agree"
simd query group tally-result $PROPOSAL_ID
```

Wait for the policy-prescribed 10 minutes, after which your proposal should have passed, as the weighted tally of _Yes_ votes is above the decision policy threshold:

```sh
simd query group proposal $PROPOSAL_ID
```

By default proposals are not executed immediately. This is to account for the fact that not everything may be in place to successfully execute the proposal's messages. As you recall, you already funded the group policy. If you had not done it ahead of time, now would have been a good time to fund it.
	
Execute the proposal now:

```sh
simd tx group exec $PROPOSAL_ID --from alice
```

<HighlightBox type="note">

If there were any errors when executing the proposal messages, none of the messages will be executed and the proposal will be marked as _Failed_.

</HighlightBox>


Verify that the proposal has been executed and the tokens have been sent:

```sh
simd query bank balances cosmos1zyzu35rmctfd2fqnnytthheugqs96qxsne67ad
```

## 🎉 Congratulations 🎉

By completing this tutorial, you have learned how to use the `group` module. In particular how to:

* Create a group.
* Manage its members.
* Add a group policy.
* Submit a group proposal.
* Vote on a proposal.

For more information about what else you can do with the CLI, please refer to its help.

```sh
simd tx group --help
simd query group --help
```

To learn more about the group module specs, check out the [group](https://docs.cosmos.network/main/modules/group) module developer documentation.
