---
parent:
title: Understand the Gov Module
order: 0
description: Use the Cosmos SDK gov module for participation to Cosmos SDK governance. Create proposals of any message type thanks to the new gov module.
tags:
  - tutorial
  - cosmos-sdk
  - dev-ops
---

# Understand the Gov Module

The [`gov`](https://docs.cosmos.network/v0.46/modules/gov) module enables governance on Cosmos SDK. It allows you to create proposals of any message type, and vote on them.

## Usage of the gov module

When the gov module is enabled on a chain (for example the Cosmos Hub), the users can submit proposal to be voted on by the community.
A proposal can be an upgrade of the chain, a change of the parameters of the chain, a simple text proposal, or any other message type. This tutorial will focus on how you can participate in governance, by creating and voting on proposals.

Before starting, review some terminology:

* **Proposal:** A proposal is a suggestion that is submitted to the network for voting. Once a proposal is submitted, it is identified by a unique proposal ID.

* **Message:** A proposal includes an array of `sdk.Msgs` which are executed automatically if the proposal passes. This means you can submit a proposal about any action on which the governance module has `authority`.

* **Deposit period:** To prevent spam, proposals must be submitted with a deposit in the coins defined by the chain. At this point, for instance, the Cosmos Hub requires a `64 ATOM` deposit. The deposit is always refunded to the depositers after voting, unless the proposal is vetoed: in that case the deposit is burned.

<HighlightBox type="tip">

The proposer is not obliged to submit the totality of the deposit amount. Other users can also contribute to the deposit. 

</HighlightBox>

* **Voting period:** After the mininimum deposit is reached, the proposal enters the voting period. During this period, users can vote on the proposal. The voting period is defined by the chain, for instance, the Cosmos Hub has a `2 weeks` voting period.

* **Quorum:** Quorum is defined as the minimum percentage of voting power that needs to be casted on a proposal for the result to be valid. If the quorum is not reached, the proposal is rejected.

* **Voting options:** Voters can choose between `Yes`, `No`, `NoWithVeto` and `Abstain`. `NoWithVeto` allows the voter to cast a `No` vote but also to veto the proposal. If a proposal is vetoed, it is automatically rejected and the deposit burned. `Abstain` allows the voter to abstain from voting. With a majority of `Yes` the proposal pass and its messages are executed.

More information about the governance concepts can be found in the [Cosmos SDK documentation](https://docs.cosmos.network/v0.46/modules/gov/01_concepts.html).

## Requirements

The gov module has been introduced in the [v0.46.0 release](https://docs.cosmos.network/v0.46/modules/gov/) of the Cosmos SDK. In order to follow the tutorial, you must use the binary of a chain with the gov module, using a v0.46+ version of the SDK. For demonstration purposes, you will use `simd`, the simulation app of the Cosmos SDK.

To install `simd`, first clone the Cosmos SDK GitHub repository and checkout the right version:

```sh
$ git clone https://github.com/cosmos/cosmos-sdk --depth=1 --branch v0.46.3
```

We are installing `v0.46.3` because this version added the command `draft-proposal`. We will explain later what it does.

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

The version number should be greater than or equal to `0.46.3`.

## Configuration

<HighlightBox type="tip">

If you have used `simd` before, you might already have a `.simapp` directory in your home directory. You can skip to the next section or remove the chain directory (`rm -rf ~/.simapp`).

</HighlightBox>

In order to configure `simd`, you need to set the chain ID and the keyring backend.

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

`simapp` is now configured and running. You can now play with the gov module.

## Create a proposal

<HighlightBox type="note">

Prior to submit a proposal on the Cosmos Hub, it is requested to publish a draft of the proposal on the [Cosmos Hub Forum](https://forum.cosmos.network). This allows the community to discuss the proposal before it arrives on chain.

</HighlightBox>

For creating a proposal we can use the following interactive command:

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
✔ Enter proposal summary: A test proposal on simd█
✔ Enter proposal details: -
✔ Enter proposal proposal forum url: https://forum.example.org/proposal/1█
✔ Enter proposal vote option context: YES: Accept the proposal, NO: Reject the proposal, No with veto: Reject proposal and burn deposit.
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
 "summary": "A test proposal on simd",
 "details": "-",
 "proposal_forum_url": "https://forum.example.org/proposal/1",
 "vote_option_context": "YES: Accept the proposal, NO: Reject the proposal, No with veto: Reject proposal and burn deposit."
}
```

This json is deemed to be [pinned on IPFS](https://tutorials.cosmos.network/tutorials/how-to-use-ipfs/).

<HighlightBox type="note">

We went ahead and pinned this file on IPFS. It's CID is `QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49`. You can verify its content on <https://w3s.link/ipfs/QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49>.

</HighlightBox>

Now look at the content of the generated `draft_proposal.json`:

```json
{
 "metadata": "ipfs://CID",
 "deposit": "10stake"
}
```

Replace the `metadata` field by `ipfs://QmbmhY1eNXdmcVV8QPqV5enwLZm1mjH7iv8aYTQ4RJCH49`.

Submit the proposal on chain from alice:

```sh
$ simd tx gov submit-proposal draft_proposal.json --from=alice --keyring-backend test
```

The command output a transaction hash. You can use it to query the proposal:

```sh
$ simd query tx 3447C74EE19EF5E4B413547F1809C1E2026A7B7A8281366F88174F37D87F7060 --output json
```

## View and vote on proposals

In our case, the proposal ID is `1`. You can query the proposal with the following command:

```sh
$ simd query gov proposal 1
```

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
