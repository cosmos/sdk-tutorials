---
title: Run in Production
order: 2
description: What does running in production entail?
tags:
  - concepts
  - cosmos-sdk
  - dev-ops
---

# Overview

You have coded your Cosmos chain. It may not be feature complete, but unit and integration tests are passing. You ran it locally on your computer and interacted with it via the command line. Congratulations, you have already accomplished a lot.

Now is the time to release it into the wild, perhaps as a testnet. You can take progressive steps to achieve this. That is what this chapter is about.

What is the desired outcome? You want to have:

* A _mainnet_ blockchain and at least one _testnet_ blockchain.
* Each blockchain running on multiple machines, a number of them validators.
* Validators that are set up to mitigate attacks.
* A faucet for your testnet(s).
* Public RPC ports for your users.
* When necessary, nodes that are running in preparation of a migration.
* When wanted, a working Inter-Blockchain Communication Protocol (IBC) infrastructure.

A good way to divide and conquer is to go with:

* Binary software preparation
* Key management
* Genesis generations
* Network setup
* Software run and launch
* Migration preparation
* IBC preparation

Start with the binary preparation in the [next section](./2-software.md).
