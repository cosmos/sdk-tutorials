---
title: Running in production
order: 0
description: What does running in production entail
tag: deep-dive
---

# Running in production

You have coded your Cosmos chain. It may not be feature complete, but unit and integration tests are passing. You ran it locally on your computer and interacted with it via the command-line. Congratulations. You have already accomplished a lot.

Now is the time to release it in the wild, perhaps as a testnet. You can take progressive steps for that. This is what this module is about.

What is the desired outcome? You want to have:

* A _mainnet_ blockchain and at least one _testnet_ blockchain.
* Each blockchain running on multiple machines, a number of them validators.
* Validators that are set up to mitigrate attacks.
* A faucet for your testnet(s).
* Public RPC ports for your users.
* When necessary, nodes that are running in preparation of a migration.
* When wanted, a working IBC infrastructure.

A good to divide and conquer is to go with:

* Binary software preparation.
* Key management.
* Genesis generations.
* Network setup.
* Software run and launch.
* Migration preparation.
* IBC prepration.

Start with the binary preparation in the [next section](./1-software.md).
