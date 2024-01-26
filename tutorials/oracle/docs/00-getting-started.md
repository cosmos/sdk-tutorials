# Advanced Tutorial: Oracle Module leveraging Vote Extensions

## Table of Contents

- [Getting Started](00-getting-started.md)
- [What is an Oracle?](01-what-is-an-oracle.md)
- [Implementing Vote Extensions](02-implementing-vote-extensions.md)
- [Testing the Oracle Module](03-testing-oracle.md)

## Prerequisites

In this tutorial, we expect the reader to have a chain project already working as we won’t go through the steps of creating a new chain/module.

We also assume you are already familiar with the Cosmos SDK, if you are not we suggest you start with [https://tutorials.cosmos.network](https://tutorials.cosmos.network), as ABCI++ is considered an advanced topic.

## What are Vote extensions?

Vote extensions is arbitrary information which can be inserted into a block. This feature is part of ABCI 2.0, which is available for use in the SDK 0.50 release and part of the 0.38 CometBFT release.

More information about vote extensions can be seen [here](https://docs.cosmos.network/main/build/abci/vote-extensions).

## Overview of the project

We’ll go through the creation of a simple price oracle module focusing on the vote extensions implementation, ignoring the details inside the price oracle itself.

We’ll go through the implementation of:

- `ExtendVote` to get information from external price APIs.
- `VerifyVoteExtension` to check that the format of the provided votes is correct.
- `PrepareProposal` to process the vote extensions from the previous block and include them into the proposal as a transaction.
- `ProcessProposal` to check that the first transaction in the proposal is actually a “special tx” that contains the price information.
- `PreBlocker` to make price information available during FinalizeBlock.