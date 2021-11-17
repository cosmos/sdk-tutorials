---
title: "Multistore and Keepers"
order: 8
description: Store types, the AnteHandler, and keepers
tag: deep-dive
---

# Multistore and Keepers

## Long-running exercise

So far we have described what we wanted to do:

* Define a game id. How is defined? Probably incrementally.
* Save many `FullGame`s in storage for retrieval by id.
* Save `FullGame` ids in an ordered list of their timeouts, for use in `EndBlock`.
* Handle `CreateGameTx`, `MoveTx`, and `RejectTx`.

We need to add the other functions:

* Remove all traces of the game when it is finished.

Because of these requirements, we think about an appropriate storage structure.

Here we also introduce the idea of gas costs. Ratios proposal are to be adjusted so it makes sense compared to the base transaction costs:

* `CreateGameTx`: costs 10. Conceptually, it should include the costs of closing a game. If that was not the case, the losing player would be incentivized to let the game hit its timeout.
* `MoveTx`: costs 1. Perhaps make it cost 0 when the player loses the game, in order to incentivize the player to conclude the game instead of letting it hit the time out.
* `RejectTx`: costs 0 because we want to incentivize cleaning up the state. This transaction would still cost what Cosmos SDK bills for transactions.

TODO. This is where we start coding these ideas inside the keeper.
