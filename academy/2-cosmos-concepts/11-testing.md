---
title: "Testing"
order: 13
description: Best practices
tags: 
  - concepts
  - cosmos-sdk
---

# Context

<HighlightBox type="prerequisite">

It is recommended to first read the following sections to better understand testing:

* [Transactions](./3-transactions.md)
* [Messages](./4-messages.md)
* [Modules](./5-modules.md)
* [BaseApp](./8-base-app.md)

</HighlightBox>

<HighlightBox type="learning">

Testing is the general umbrella that describes all that revolves around making sure that the code created does what it is expected to do.

</HighlightBox>

# Testing

Testing is an integral part of software development in general. Done well, it helps teams catch bugs earlier, and thus cheaper. In the context of blockchains, which can lock large amounts of value and where [migrations](./12-migrations.md) are not simply one redeploy away from a fix, bugs can be catastrophic.

The Cosmos SDK implements its own testing vision for its own modules, and it would be good if your project followed the same patterns. Following the same patterns will help everyone in the ecosystem to _speak the same language_. It will also benefit you when you open the code for bug bounty since interested bounty hunters would be _on-boarded_ faster.

## Testing pyramid

After having had some [reflection](https://docs.cosmos.network/main/architecture/adr-059-test-scopes.html), Cosmos divides their tests into 4 broad categories in somewhat increasing scope:

* [Unit tests](https://docs.cosmos.network/main/building-modules/testing#unit-tests)
* [Integration tests](https://docs.cosmos.network/main/building-modules/testing#integration-tests)
* [Simulation tests](https://docs.cosmos.network/main/building-modules/testing#simulations)
* [End-to-end tests](https://docs.cosmos.network/main/building-modules/testing#end-to-end-tests)

### Unit tests

Unit tests are your classic smallest tests possible and they focus on a single module at a time. If a tested call needs something from another module, like a keeper, then:

* This dependency should be [mocked](https://devopedia.org/mock-testing), including mocked responses when applicable.
* The mock should confirm that the dependency was called as expected.
* If applicable, the test should confirm that a mocked response was handled as expected by the module under test.

To be considered as well-tested, your unit tests should cover all your module's functions.

### Integration tests

Integration tests are one step wider in scope. It is still focused on your module, but instead of mocking the dependencies, your test provisions a fully-fledged dependency.

In a well-thought-out environment, providing such a dependency should not be a concern of your module's tests. All the more so that your dependency has dependencies of its own. You want to avoid such deep correlations between modules, even their tests.

This is why from version 0.47 of the Cosmos SDK, each module exposes functions to provision a minimally viable module. This way, your module only knows to call the right functions in its dependent module but no further down the line. For instance, when (integration-)testing the bank module, no staking module is provisioned as it is a side concern instead of a dependency. To facilitate these integration tests, the Cosmos team has also developed an in-house dependency injection. Note that integration tests do not create an application, but instead a chain of dependencies.

In versions of the Cosmos SDK 0.46 and earlier, what are called integration tests really are full tests where a full application is being instantiated.

### Simulation tests

Simulation tests are similar in scope with the integration tests, with the difference that they create a minimally viable application in which to house your module. This scope starts to make sense only from Cosmos SDK 0.47, where the application dependencies are disentangled.

The purpose of simulation tests is also to introduce some random effects into the parameters passed.

### End-to-end tests

These tests are at the top of the testing pyramid. Just like simulation tests they work by testing the application, but this time the full application. If you work with Cosmos versions 0.46 or earlier, then those that are labeled as integration tests are end-to-end tests under the new designation from version 0.47 onwards.

Your e2e (end-to-end) tests should test flows that mirror what users would experience, and therefore should not limit themselves to minute interactions.

## Testing methodology

## Further reading

* [Test scopes decision](https://docs.cosmos.network/main/architecture/adr-059-test-scopes.html)