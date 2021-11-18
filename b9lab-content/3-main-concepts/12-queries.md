---
title: "Queries"
order: 10
description: Query lifecycle and working with queries 
tag: deep-dive
---

# Queries

A query is a request for information made by end-users of an application through an interface and processed by a full node. Available information includes:

* Information about the network
* Information about the application itself 
* Information about the application state

Queries do not require consensus to be processed, as they do not trigger state transitions, and can therefore be fully handled independently by a full node.

<HighlightBox info=”info”>

For an overview of the query lifecycles, a look into [creating and handling queries with the CLI and RPC, as well as application query handling]https://github.com/cosmos/cosmos-sdk/blob/master/docs/basics/query-lifecycle.md) in the Cosmos SDK documentation.

</HighlightBox>

## Long-running exercise

We need to think in terms of what a server system, or a GUI, would need:

1. A way to load a game by ID.
2. A way to get current game Ids by player.
3. Perhaps a way to get the game's timing out soon.
4. A way to test whether a move will be accepted.

Point 1 means we need to revisit our storage structure and keep a list of game IDs by player. Probably ordered by ID.

Point 4 assumes that the previous player's move is already confirmed in a block. This leads to the following questions:

* Is there a way to test a move's validity while the previous player's move is still in the mempool?
* Is there a way to make sure that if the next player sends their move before the previous one was confirmed, so to say both transactions are ordered _properly_?

<!-- TODO define in code how these queries would be defined and routed. -->
