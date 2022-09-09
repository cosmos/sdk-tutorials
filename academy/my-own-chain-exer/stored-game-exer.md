---
title: Exercise - Store objects - Make a Checkers Blockchain
order:
description: Exercise - Create the object that stores a game
tags: 
  - deep-dive
---

# Exercise - Store objects - Make a Checkers Blockchain

You have created your basic project with Ignite CLI in the [previous section](../3-my-own-chain/ignitecli.md). Now you are face-to-face with the proverbial blank page: where do you start to make your blank project into a game of Checkers?

## Think

A good place to start is to think about the objects you keep in storage. **A game**, obviously... but what does any game have to keep in storage?

Questions to ask that could influence your design include but are not limited to:

* What is the lifecycle of a game?
* How are participants selected to be in a game?
* What fields make it possible to play across a span of time and transactions?
* What fields make it possible to differentiate between different games?
* How do you ensure safety against malice, sabotage, or even simple errors?
* What limitations does your design **intentionally** impose on participants?
* What limitations does your design **unintentionally** impose on participants?

After thinking about what goes into each individual game, you should consider the demands of the wider system. In general terms, before you think about the commands that achieve what you seek, ask:

* How do you lay games in storage?
* How do you save and retrieve games?

The goal here is not to finalize every conceivable game feature immediately. For instance, handling wagers or leaderboards can be left for another time. But there should be a basic game design good enough to accommodate future improvements.

## Code

**Do not** dive headlong into coding the rules of Checkers in Go - examples will already exist which you can put to use. Your job is to make a blockchain that just happens to enable the game of Checkers.

With that in mind:

* What Ignite CLI commands will get you a long way with implementation?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test your modest additions?
* How would you run a simulation of a running node?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

Run the commands, make the adjustments, and run some tests regarding game storage. Do not go into deeper issues like messages and transactions yet.

## Next up

When you are satisfied (or not) with what you have, look at [a solution](../3-my-own-chain/stored-game.md).
