---
parent:
title: Understand the Gov Module
order: 5
description: Use the Cosmos SDK gov module for participation in Cosmos SDK governance - create proposals of any message type thanks to the new gov module.
tags:
  - tutorial
  - cosmos-sdk
  - dev-ops
---

# Understand the Gov Module

The [`gov`](https://docs.cosmos.network/v0.46/modules/gov) module enables governance on Cosmos SDK. It allows you to create proposals of any message type, and vote on them.

## Usage of the gov module

When the gov module is enabled on a chain (for example the Cosmos Hub), the users can submit a proposal to be voted on by the community.

A proposal can be an upgrade of the chain, a change of the parameters of the chain, a simple text proposal, or any other message type. This tutorial will focus on how you can participate in governance, by creating and voting on proposals.

Before starting, review some terminology:

* **Proposal:** A proposal is a suggestion that is submitted to the network for voting. Once a proposal is submitted, it is identified by a unique proposal ID.

* **Message:** A proposal includes an array of `sdk.Msgs` which are executed automatically if the proposal passes. This means you can submit a proposal about any action on which the governance module has `authority`.

* **Deposit period:** To prevent spam, proposals must be submitted with a deposit in the coins defined by the chain. At this point, for instance, the Cosmos Hub requires a [`64 ATOM` deposit](https://mintscan.io/cosmos/parameters). The deposit is always refunded to the depositors after voting, unless the proposal is vetoed: in that case, the deposit is burned.

  <HighlightBox type="tip">

  The proposer is not obliged to submit the totality of the deposit amount. Other users can also contribute to the deposit. 

  </HighlightBox>

* **Voting period:** After the minimum deposit is reached, the proposal enters the voting period. During this period, users can vote on the proposal. The voting period is a parameter of individual chains. For instance, the Cosmos Hub has a [`2 weeks` voting period](https://mintscan.io/cosmos/parameters).

* **Voting options:** Voters can choose between `Yes`, `No`, `NoWithVeto`, and `Abstain`. `NoWithVeto` allows the voter to cast a `No` vote, but also to veto the proposal. If a proposal is vetoed, it is automatically rejected and the deposit burned. `Abstain` allows the voter to abstain from voting. With a majority of `Yes`, the proposal pass and its messages are executed. `Abstain` is different from not voting at all, as voting contributes to reaching the quorum.

* **Voting weight:** A.k.a. **voting power**. Each vote is weighted by the voter's staked tokens at the time the vote tally is computed. For the avoidance of doubt, it means that the number of staked tokens at the time the vote transaction is sent is irrelevant.

* **Quorum:** Quorum is defined as the minimum percentage of voting power that needs to be cast on a proposal for the result to be valid. If the quorum is not reached, the proposal is rejected.

More information about the governance concepts can be found in the [Cosmos SDK documentation](https://docs.cosmos.network/v0.46/modules/gov/01_concepts.html).

## Requirements

In the Cosmos SDK [v0.46.0 release](https://docs.cosmos.network/v0.46/modules/gov/), the gov module has been [upgraded from `v1beta1` to `v1`](https://github.com/cosmos/cosmos-sdk/blob/main/UPGRADING.md#xgov-1). To follow this tutorial, you must use the binary of a chain with the _v1_ gov module, for instance with a v0.46+ version of the SDK. For demonstration purposes, you will use `simd`, the simulation app of the Cosmos SDK.

To install `simd`, first clone the Cosmos SDK GitHub repository and checkout the right version:

```sh
$ git clone https://github.com/cosmos/cosmos-sdk --depth=1 --branch v0.46.2
```

You are installing `v0.46.2` because this version added the command `draft-proposal`. You will learn later what it does.

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

The returned version number should be equal to `0.46.2`.

## Configuration

<HighlightBox type="tip">

If you have used `simd` before, you might already have a `.simapp` directory in your home directory. You can skip to the next section or remove the chain directory (`rm -rf ~/.simapp`).

</HighlightBox>

To configure `simd`, you have to set the chain ID and the keyring backend.

```sh
$ simd config chain-id demo
$ simd config keyring-backend test
```

Secondly, you need to add keys for chain users. Call them Alice and Bob:

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

Now you are ready to fund Alice and Bob's respective accounts and use the Alice account as a validator:

```sh
$ simd init test --chain-id demo
```

The default voting period is **172800s** (two days). It is too long to wait for the tutorial, so you will change it to **180s** (three minutes). To do so, edit the `~/.simapp/config/genesis.json` file:

<CodeGroup>

<CodeGroupItem title="v0.46" active>

```sh
$ cat <<< $(jq '.app_state.gov.voting_params.voting_period = "180s"' ~/.simapp/config/genesis.json) > ~/.simapp/config/genesis.json
```

</CodeGroupItem>

<CodeGroupItem title="v0.47+">

```sh
$ cat <<< $(jq '.app_state.gov.params.voting_period = "180s"' ~/.simapp/config/genesis.json) > ~/.simapp/config/genesis.json
```

</CodeGroupItem>

</CodeGroup>

Then add the genesis accounts:

```sh
$ simd add-genesis-account alice 5000000000stake --keyring-backend test
$ simd add-genesis-account bob 5000000000stake --keyring-backend test
$ simd gentx alice 1000000stake --chain-id demo
$ simd collect-gentxs
```

Lastly, start the chain:

```sh
$ simd start
```

`simapp` is now configured and running. You can play with the gov module.

## Create a proposal

<HighlightBox type="note">

Prior to submitting a proposal on the Cosmos Hub, it is good practice and also requested to publish a draft of the proposal on the [Cosmos Hub Forum](https://forum.cosmos.network). This allows the community to discuss the proposal before it appears on chain.

</HighlightBox>

Before sending anything to the blockchain, to create the files that describe a proposal in the proper format, you can use the following interactive command:

```sh
$ simd tx gov draft-proposal
```

You will first create a simple text proposal. A text proposal does not contain any message, but only proposal [metadata](https://docs.cosmos.network/v0.46/modules/gov/08_metadata.html).

```sh
Use the arrow keys to navigate: ↓ ↑ → ← 
? Select proposal type: 
  ▸ text
    community-pool-spend
    software-upgrade
    cancel-software-upgrade
    other
```

Then enter the proposal title, authors, and other proposal metadata:

```sh
✔ text
✔ Enter proposal title: Test Proposal
✔ Enter proposal authors: Alice
✔ Enter proposal summary: A test proposal with simapp
✔ Enter proposal details: -
✔ Enter proposal proposal forum url: https://example.org/proposal/1█
✔ Enter proposal vote option context: YES: XX, NO: YX, ABSTAIN: XY, NO_WITH_VETO: YY
```

Then enter the proposal deposit:

```sh
✔ Enter proposal deposit: 10stake
Your draft proposal has successfully been generated.
Proposals should contain off-chain metadata, please upload the metadata JSON to IPFS.
Then, replace the generated metadata field with the IPFS CID.
```

The `draft-proposal` command has now generated two files:

* **draft_metadata.json**
* **draft_proposal.json** 

The content of `draft_metadata.json` contains the information you have just entered:

```json
{
  "title": "Test Proposal",
  "authors": "Alice",
  "summary": "A test proposal with simapp",
  "details": "-",
  "proposal_forum_url": "https://example.org/proposal/1",
  "vote_option_context": "YES: XX, NO: YX, ABSTAIN: XY, NO_WITH_VETO: YY"
}
```

This json should be [pinned on IPFS](https://tutorials.cosmos.network/tutorials/how-to-use-ipfs/).

<HighlightBox type="note">

In fact, this file is already pinned on IPFS. Its CID is `QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49`. You can verify its content on <https://ipfs.io/ipfs/QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49>.

</HighlightBox>

Now look at the content of the generated `draft_proposal.json`:

```json
{
  "metadata": "ipfs://CID",
  "deposit": "10stake"
}
```

Replace the `metadata` field with `ipfs://QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49`.

Submit the proposal on chain from alice:

```sh
$ simd tx gov submit-proposal draft_proposal.json --from alice --keyring-backend test
```

The command outputs a transaction hash. You can use it to query the proposal:

```sh
$ simd query tx D8F1165AAB343EB9416F1DF3D30F2883D26E1125AED733878C590E60256ED9C9
```

## View and vote on proposals

In your case, the proposal ID is `1`. You can query the proposal with the following command:

```sh
$ simd query gov proposal 1
```

Which returns:

```sh
deposit_end_time: "2022-09-20T16:36:04.741427768Z"
final_tally_result:
  abstain_count: "0"
  no_count: "0"
  no_with_veto_count: "0"
  yes_count: "0"
id: "1"
messages: []
metadata: ipfs://QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49
status: PROPOSAL_STATUS_DEPOSIT_PERIOD
submit_time: "2022-09-18T16:36:04.741427768Z"
total_deposit:
- amount: "10"
  denom: stake
voting_end_time: null
voting_start_time: null
```

As you can see, the proposal is in the deposit period. This means that the deposit associated with it has not yet reached the minimum required, so you cannot vote on it just yet. Find out what is the minimum proposal deposit for a chain with the following command:

```sh
$ simd query gov params --output json | jq .deposit_params.min_deposit
```

It returns:

```json
[
  {
    "denom": "stake",
    "amount": "10000000"
  }
]
```

Therefore, since you submitted the proposal with `10stake`, you need to top up the deposit with `9999990stake`. You can do so with Bob and the following command:

```sh
$ simd tx gov deposit 1 9999990stake --from bob --keyring-backend test
```

The proposal is now in the voting period. Do not forget, you have three minutes (`180s` as per the gov parameters) to vote on the proposal.

```sh
$ simd query gov proposal 1 --output json | jq .status
```

You can vote on it with the following command:

```sh
$ simd tx gov vote 1 yes --from alice --keyring-backend test
$ simd tx gov vote 1 no --from bob --keyring-backend test
```

After waiting for the voting period, you can see that the proposal has passed.

```sh
$ simd query gov proposal 1 --output json | jq .status
```

This is because the governance proposal weights each vote by the number of tokens staked. Alice owns staked tokens, while Bob had no staked tokens at the end of the voting period. So Bob's vote was not taken into consideration in the tally of the result.

```sh
$ simd query staking delegations $ALICE
$ simd query staking delegations $BOB
```

After a proposal execution, the deposit is refunded (unless a weighted majority voted `No with veto`). You can check the balance of Alice and Bob with the following commands:

```sh
$ simd query bank balances $ALICE
$ simd query bank balances $BOB
```

## 🎉 Congratulations 🎉

By completing this tutorial, you have learned how to use the `gov` module!

<HighlightBox type="synopsis">

To summarize, this tutorial has explained:

* How to a create proposal.
* How to submit a proposal
* How to vote on a proposal.

</HighlightBox>

For more information about what else you can do with the CLI, please refer to the module help.

```sh
$ simd tx gov --help
$ simd query gov --help
```

To learn more about the gov specs, check out the [group](https://docs.cosmos.network/main/modules/gov) module developer documentation.
If you want to learn more about the Cosmos Hub governance, please refer to the [Cosmos Hub governance](https://hub.cosmos.network/main/governance) documentation.
