---
title: "Queries"
order: 10
description: Query lifecycle and working with queries 
tag: deep-dive
---

# Queries

### gRPC routing

A query is a request for information made by end-users of an applications through an interface and processed by a full-node. Available information includes:

* information about the network, 
* Information about the application itself, and 
* Information about the application state

Queries do not require consensus to be processed (as they do not trigger state-transitions) and can therefore be fully handled independently by a full node.

<HighlightBox info=”info”>
Query lifecycles: Creating, handling queries with the CLI, RPC and application query handling.
https://github.com/cosmos/cosmos-sdk/blob/master/docs/basics/query-lifecycle.md 
</HighlightBox>


## Long-running exercise

We need to think in terms of what a server system, or a GUI would need:

1. A way to load a game by id.
2. A way to get current game ids by player.
3. Perhaps a way to get the games timing out soon.
4. A way to test whether a move will be accepted.

Point 1 means we need to revisit our storage structure, and keep a list of game ids by player. Probably ordered by id.

Point 4 assumes that the previous player's move is already confirmed in a block. Questions:

* Is there a way to test a move's validity while the previous player's move is still in the mempool?
* Is there a way to make sure that if the next player sends their move before the previous one was confirmed, both txs are ordered _properly_?

TODO define in code how these queries would be defined and routed.
