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

The Cosmos SDK implements its own testing vision for its own modules, and it would be good if your project followed the same patterns. Following the same patterns will help everyone in the ecosystem to _speak the same language_. Speaking the same language will also benefit you when you open the code for bug bounty. Indeed readable tests increase the trust that casual observers have in your code overall, and by extension, your project, and allows interested bounty hunters to be _on-boarded_ faster.

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

As an example, imagine that your module is moving tokens on behalf of your users. Your module therefore has a dependency on the bank keeper. As part of a unit test setup, you create a mocked bank keeper and use it. After the test action, at verification time, your unit test confirms that your module called the expected functions of the bank keeper with the expected parameters. Your unit test does **not** test whether bank balances have changed because, remember, your module does not have a real bank keeper.

### Integration tests

Integration tests are one step wider in scope. They are still focused on your module, but instead of mocking the dependencies, your test provisions a minimally-viable application that includes fully-fledged dependencies including, crucially, those your own module needs.

A minimally-viable application is one that contains your module and all its dependencies, and their own, but nothing more.

In a well-designed testing environment, providing such fully-fledged dependencies should not be a concern of your module's tests. All the more so that your dependencies have dependencies of their own. You want to minimize such deep correlations between modules, even their tests.

This is why, with a view to minimizing correlations, from version 0.47 of the Cosmos SDK, each module exposes functions to provision a minimally viable module. This way, your module only knows how to instantiate itself given fully-fledged dependencies, the _inputs_. An added benefit is that your module exposes explicitly the inputs it needs to instantiate.

Your integration tests then start by creating an app that instantiates the list of explicitly defined inputs required. For instance, when creating a minimally-viable app to (integration-)test the bank module, no slashing module is provisioned as it is a side concern instead of a dependency. Of course, each module requires a different minimally-viable app. To facilitate the creation of such an app and therefore integration tests, the Cosmos team has also developed an in-house dependency injection.

To fit in the context of Go testing, modules provide testing suites that encapsulate the test instantiations.

Note that, in versions of the Cosmos SDK 0.46 and earlier, what are called integration tests really are full tests where a full application is being instantiated. The reason behind it is that at these versions, the coding effort to create a minimally-viable app was not commensurate with the benefit it provided compared to a full app.

### Simulation tests

Simulation tests are similar in scope with the integration tests, where they reuse your module's minimally viable application. This scope starts to make sense only from Cosmos SDK 0.47 too, where the application dependencies are disentangled.

The purpose of simulation tests is to introduce some random effects into the parameters passed.

### End-to-end tests

These tests are at the top of the testing pyramid. Unlike integration and simulation tests they work by testing _the_ application, this time the full application, not a minimally-viable one. If you work with Cosmos versions 0.46 or earlier, then the tests that are labeled as integration tests already are end-to-end tests under the new designation from version 0.47 onwards.

Your e2e (end-to-end) tests should test flows that mirror what users would experience, and therefore should not limit themselves to minute interactions. Conceptually, they are for your whole application, and not per module.

In the context of Go, just like for integration tests, you provide testing suites that handle the instantiations. Ideally, your testing suite should be usable outside of your application so that other applications can test interactions with yours.

## Further reading

* [Test scopes decision report](https://docs.cosmos.network/main/architecture/adr-059-test-scopes.html)
