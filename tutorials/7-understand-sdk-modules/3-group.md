---
title: "Understand the Group Module"
order: 4
description: Use the Cosmos SDK group module to create and manage on-chain multisig accounts and enable voting for message execution based on configurable decision policies.
tags:
  - tutorial
  - cosmos-sdk
  - dev-ops
---

# Understand the Group Module

The [`group`](https://docs.cosmos.network/v0.46/modules/group/) module enables the creation and management of multisig accounts and enables voting for message execution based on configurable decision policies.

## Usage of the group module

When the group module is enabled in a chain (say the Cosmos Hub), users can create groups and submit group proposals. This means that any number of users can be part of a group and vote on the group's proposals. You can think of it as an enhanced multisig or DAO.

Before starting, review some terminology:

* **Group Admin:** the account that creates the group is the group administrator. The group administrator is the account that can add, remove, or change the group members, but does not need to be a member of the group itself. Choose it wisely.
* **[Group policy](https://docs.cosmos.network/v0.46/modules/group/01_concepts.html#group-policy):** a group policy is an account associated with a group and a decision policy. In order to perform actions on this account, a proposal must be approved by a majority of the group members or as defined in the decision policy. For the avoidance of doubt, note that a group can have multiple group policies.
* **[Decision policy](https://docs.cosmos.network/v0.46/modules/group/01_concepts.html#decision-policy):** a policy that defines how the group members can vote on a proposal and how the vote outcome is calculated. A decision policy is associated with a group policy. This means that a group can have different decision policies for each of its different group policies.
* **Proposal:** a group proposal works the same way as a governance proposal. Group members can submit proposals to the group and vote on proposals with a _Yes_, _No_, _No with Veto_, and _Abstain_.

In this tutorial, you will learn how to create a group, manage its members, submit a group proposal, and vote on it. After that, you will be able to create your own on-chain DAO for your own use case.

## Requirements

The group module has been introduced in the [v0.46.0 release](https://docs.cosmos.network/v0.46/modules/group/) of the Cosmos SDK. In order to follow the tutorial, you must use the binary of a chain with the group module, using a v0.46+ version of the SDK. For demonstration purposes, you will use `simd`, the simulation app of the Cosmos SDK.

To install `simd`, first clone the Cosmos SDK GitHub repository and checkout the right version:

```sh
$ git clone https://github.com/cosmos/cosmos-sdk --depth=1 --branch v0.46.0
```

Go to the cloned directory:

```sh
$ cd cosmos-sdk
```

Install `simd`:

```sh
$ make install
```

Make sure the installation was successful:

```sh
$ simd version
```

The version number should be greater than or equal to `0.46.0`.

## Configuration

<HighlightBox type="tip">

If you have used `simd` before, you might already have a `.simapp` directory in your home directory. You can skip to the next section or remove the chain directory (`rm -rf ~/.simapp`).

</HighlightBox>

In order to configure `simd`, you need to set the chain ID and the keyring backend.

```sh
$ simd config chain-id demo
$ simd config keyring-backend test
```

Secondly, you need to add keys for group users. Call them Alice and Bob:

```sh
$ simd keys add alice
$ simd keys add bob
```

With `simd keys list` you can verify that your two users have been added.

<HighlightBox type="tip">

To avoid having to copy and paste the user addresses, now is a good time to export the user keys to variables that you can access and use for this tutorial.

</HighlightBox>

```sh
$ export ALICE=$(simd keys show alice --address)
$ export BOB=$(simd keys show bob --address)
```

Now you are ready to fund Alice and Bob's respective accounts and use the Alice account as validator:

```sh
$ simd init test --chain-id demo
$ simd add-genesis-account alice 5000000000stake --keyring-backend test
$ simd add-genesis-account bob 5000000000stake --keyring-backend test
$ simd gentx alice 1000000stake --chain-id demo
$ simd collect-gentxs
```

Lastly, start the chain:

```sh
$ simd start
```

`simapp` is now configured and running. You can now play with the group module.

## Create a group

To create a group, you must decide who is the admin and who are the members. All members have a voting weight that is used to calculate their voting power in the group.

Create a `members.json` file that contains group members of a football association. Replace `aliceaddr` and `bobaddr` with the literal addresses of Alice (`$ALICE`) and Bob (`$BOB`) respectively.

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

For the avoidance of doubt, in the JSON above, Alice is labeled with some metadata that identifies her as the `"president"`. The presence of this metadata does not make her the administrator of the group. It only identifies her as a member of the group, presumably one to whom the group's other members will look up.

Create the group:


Note that, according to the [group documentation](https://docs.cosmos.network/v0.46/modules/group/06_metadata.html), the metadata of a group must be off-chain. This means that, should you choose IPFS as your storage, you must put the IPFS CID of the group metadata in the `metadata` field. To learn more about IPFS, check out the [IPFS tutorial](https://tutorials.cosmos.network/tutorials/how-to-use-ipfs).

Here is what the metadata of Alice and Bob looks like:

**group_metadata.json**:

```json
{
  "name": "Football Association",
  "description": "Best football association",
  "group_website_url": "https://www.footbal.club",
  "group_forum_url": ""
}
```

Which gives the IPFS CID of `QmXNvNnHrX7weSyDLBNEv6YxnmwEUncmvG1z8HTxXEBnW1`.

```sh
$ simd tx group create-group $ALICE "ipfs://QmXNvNnHrX7weSyDLBNEv6YxnmwEUncmvG1z8HTxXEBnW1" members.json
```

It is here, by sending the create transaction, that Alice becomes the administrator of the group.

At what ID was the group created? Recall the transaction and look for the attributes of the event whose type is `"cosmos.group.v1.EventCreateGroup"`. For instance:

```sh
$ simd query tx 079D9B213DCDE99DB0E31A8AFE9B0FDC605C81C1880D08D99A493A7BC52FAC23 --output json | jq ".events" | jq '.[] | select(.type == "cosmos.group.v1.EventCreateGroup") | .attributes'
```

This returns something like:
    
```json
[
  {
    "key": "Z3JvdXBfaWQ=",
    "value": "IjEi",
    "index": true
  }
]
```

Where `Z3JvdXBfaWQ=` is a [Base64 encoding](https://www.browserling.com/tools/base64-decode) of `group_id`, and `IjEi` is a Base64 encoding of `"1"`, including the `"`. Therefore your group ID is `1`. Or with a one-liner:

```sh
$ export GROUP_ID=$(simd query tx 079D9B213DCDE99DB0E31A8AFE9B0FDC605C81C1880D08D99A493A7BC52FAC23 --output json | jq '.events' | jq -r '.[] | select(.type == "cosmos.group.v1.EventCreateGroup") | .attributes[0].value' | base64 --decode | jq -r '.')
```

Query and verify the group that you just created and its ID, which you just extracted:

```sh
$ simd query group groups-by-admin $ALICE
```

This last command outputs `1` too. This shows you that the group and its `id` can be recalled. Use that `id` for querying the group members:

```sh
$ simd query group group-members $GROUP_ID
```

Nice! Your group has `ipfs://QmXNvNnHrX7weSyDLBNEv6YxnmwEUncmvG1z8HTxXEBnW1` as metadata (which you can recall with the `group-info` command), Alice as group admin, and Alice and Bob as group members.

<HighlightBox type="note">

The members of your group understand that this hash is for IPFS. Without IPFS, the metadata is viewable at <https://ipfs.io/ipfs/QmXNvNnHrX7weSyDLBNEv6YxnmwEUncmvG1z8HTxXEBnW1>.

</HighlightBox>

## Manage group members

To update the group's members, you send a transaction using the `update-group-members` command and a JSON file modeled on the previous `members.json`. The file only needs to contain the changes to the membership. Unchanged members do not need to be included in the `members_updates.json`.

To add a member to the group, you mention it in the JSON, and to remove a member from the group, you mention it and set this member's voting weight to `0`.

Add Carol, Dave, and Emma as group members, and remove Bob. Create `members_update.json` with:

```json
{
    "members": [
        {
            "address": "bobaddr", // $BOB
            "weight": "0" // this deletes bob
            // The metadata does not need to be mentioned
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
$ simd tx group update-group-members $ALICE $GROUP_ID members_updates.json
```

You can verify that the group members are updated:

```sh
$ simd query group group-members $GROUP_ID
```

As an exercise, add Bob back to the group before moving on to the next section.

## Create a group policy

Next, you need to create a group policy and its decision policy. These define how long a proposal can be voted on, and how its outcome is calculated. Here you use the [`ThresholdDecisionPolicy`](https://github.com/cosmos/cosmos-sdk/blob/release/v0.46.x/proto/cosmos/group/v1/types.proto#L53-L62) as decision policy. It defines the threshold that the tally of weighted _yes_ votes must reach for a proposal to pass. Each member's vote carries a specific weight, as defined in the group.

The following is the content of the `policy.json`. It states that:

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

Have the group administrator create the group policy with metadata that identifies it as one with a quick turnaround:

```sh
$ simd tx group create-group-policy $ALICE $GROUP_ID "{\"name\":\"quick turnaround\",\"description\":\"\"}" policy.json
```

Note that this time, the metadata is on-chain an escaped JSON string. This is as per the [group documentation](https://docs.cosmos.network/v0.46/modules/group/06_metadata.html).

Check and verify your newly created group policy, and in particular the address you just created:

```sh
$ export GROUP_POLICY_ADDRESS=$(simd query tx 06DB56C25457E10CCAB5476C8BE84534EBC6E10241953C137AEC9CD6C35A5F3B --output json | jq '.events' | jq -r '.[] | select(.type == "cosmos.group.v1.EventCreateGroupPolicy") | .attributes[0].value' | base64 --decode | jq -r '.')
``` 

You can also find the group policy by querying the group:

```sh
$ simd query group group-policies-by-group $GROUP_ID
$ simd query group group-policies-by-group $GROUP_ID --output json | jq -r '.group_policies[0].address'
```

<HighlightBox type="note">

Note how the decision policy's address, at `cosmos` plus 59 characters, is longer than a _regular_ account's address. This is because a group address is a derived address. You can learn more on that in [ADR-28](https://github.com/cosmos/cosmos-sdk/blob/main/docs/architecture/adr-028-public-key-addresses.md#derived-addresses).

</HighlightBox>

## Create a proposal

Now that you have a group with a few members and a group policy, you can submit your first group proposal. As with member management, you need to create a `proposal.json` file that contains the proposal.

A proposal can contain any number of messages defined on the current blockchain.

For this tutorial, continue with your example of an association. The treasurer, Bob, wants to send money to a third party to pay the bills, and so creates a `proposal.json` and a `proposal_metadata.json` (as proposal metadata should be off-chain):

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
    "metadata": "ipfs://QmearrgtJxKHu37HnNjU1AQMnvWoXqwh6cWR8mytBJoFVv",
    "proposers": [ "bobaddr" ] // $BOB
}
```

You are meant to upload the `proposal_metadata.json` to [IPFS](https://tutorials.cosmos.network/tutorials/how-to-use-ipfs) and set its CID in the `metadata` field of the `proposal.json`.

```json
{
  "title": "Pay the utilities bill",
  "authors": "Bob Smith",
  "summary": "Pay the energy bill of the association",
  "details": "",
  "proposal_forum_url": "https://football.club/proposal/nov-utility-bills",
  "vote_option_context": "Yes means pay the energy bill. No means to not pay the energy bill and have no more warm water.",
}
```

This proposal, if passed, will send 100 `stake` to `cosmos1zyzu35rmctfd2fqnnytthheugqs96qxsne67ad` to pay the bills.
The tokens will be sent from the decision policy address.

<HighlightBox type="tip">

The decision policy has no funds yet. You can fund it by sending a transaction with `simd tx bank send alice $GROUP_POLICY_ADDRESS 100stake`.

</HighlightBox>

Submit the proposal:

```sh
$ simd tx group submit-proposal proposal.json --from bob
```

Once more, extract the proposal ID - remember to use the transaction hash you got from the previous command:

```sh
$ export PROPOSAL_ID=$(simd query tx E3CBE6932254088D5A80CD5CB18BB0F4D35396A542BD20731E1B6B997E1B0847 --output json | jq '.events' | jq -r '.[] | select(.type == "cosmos.group.v1.EventSubmitProposal") | .attributes[0].value' | base64 --decode | jq -r '.')
```

You can also find the proposal ID via your group policy:

```sh 
$ simd query group proposals-by-group-policy $GROUP_POLICY_ADDRESS --output json | jq '.proposals[0]'
```

## View and vote on proposals

You can see that your proposal has been submitted and that it contains a lot of information. For instance, confirm that its final tally is empty:

```sh
$ simd query group proposal $PROPOSAL_ID --output json | jq '.proposal.final_tally_result'
```

Which returns:

```json
{
  "yes_count": "0",
  "abstain_count": "0",
  "no_count": "0",
  "no_with_veto_count": "0"
}
```

Also, confirm that it is in the `PROPOSAL_STATUS_SUBMITTED` status:

```sh
$ simd query group proposals-by-group-policy $GROUP_POLICY_ADDRESS --output json | jq -r '.proposals[0].status'
```

Next, have Alice and Bob vote _Yes_ on the proposal and verify that both their votes are tallied using the proper query command:

```sh
$ simd tx group vote $PROPOSAL_ID $ALICE VOTE_OPTION_YES "agree"
$ simd tx group vote $PROPOSAL_ID $BOB VOTE_OPTION_YES "aye"
$ simd query group tally-result $PROPOSAL_ID
```

While you wait for the policy-prescribed 10 minutes, you can confirm that the final tally is still empty. After the 10 minutes have gone by your proposal should have passed, because the weighted tally of _Yes_ votes is above the decision policy threshold. Confirm this by looking at its `status`. It should be `PROPOSAL_STATUS_ACCEPTED`:

```sh
$ simd query group proposal $PROPOSAL_ID
```

By default, proposals are not executed immediately. You can confirm this by looking at the proposal: it contains `executor_result: PROPOSAL_EXECUTOR_RESULT_NOT_RUN`.

<HighlightBox type="remember">

Proposals are not immediately executed to account for the possibility that not everything may be in place to successfully execute the proposal's messages. As you recall, you already funded the group policy. If you did not fund it ahead of time, now is the time to do it.

Next time, if you wish to try to execute a proposal immediately after its submission, you can do so by using the `--exec 1` flag. It will count the proposers' signatures as _Yes_ votes.

</HighlightBox>
    
Execute the proposal now:

```sh
$ simd tx group exec $PROPOSAL_ID --from alice
```

<HighlightBox type="note">

If there were any errors when executing the proposal messages, none of the messages will be executed and the proposal will be marked as _Failed_.

</HighlightBox>

Verify that the proposal has been executed:
    
```sh
$ simd query group proposal $PROPOSAL_ID
```

It should return an error: `Error: rpc error: code = Unknown desc = load proposal: not found: unknown request`. That is because it has been entirely removed.

Confirm that the tokens have been received by the intended recipient:

```sh
$ simd query bank balances cosmos1zyzu35rmctfd2fqnnytthheugqs96qxsne67ad
```

## 🎉 Congratulations 🎉

By completing this tutorial, you have learned how to use the `group` module!

<HighlightBox type="synopsis">

To summarize, this tutorial has explained:

* How to create a group.
* How to manage its members.
* How to add a group policy.
* How to submit a group proposal.
* How to vote on a proposal.
* How to execute an accepted proposal.

</HighlightBox>

For more information about what else you can do with the CLI, please refer to its help.

```sh
$ simd tx group --help
$ simd query group --help
```

To learn more about the group module specs, check out the [group](https://docs.cosmos.network/v0.46/modules/group) module developer documentation.
