---
title: Exercise - Store objects - Make a Checkers Blockchain
order:
description: Exercise - Create the object that stores a game
tag: deep-dive
---

# Exercise - Store objects - Make a Checkers Blockchain

You have created your basic project with Ignite CLI in the [previous section](../4-my-own-chain/ignitecli.md). Now you are face-to-face with the proverbial blank page: where do you start to make your blank project a game of Checkers?

## Think

A good place to start is to think about the objects you keep in storage.

A game obviously, but what does a game have to keep in storage? Questions that you should ask yourself and that could influence your design are not limited to, but include:

* What is the lifecycle of a game?
* How are participants selected to be in a game?
* What are the field(s) that make it possible to play it across a span of time and transactions?
* What are the field(s) that make it possible to differentiate between different games?
* How do you ensure safety against malice, sabotage or plain fat-finger errors?
* What limitations do you intentionally put to participants?
* What limitations does your design unintentionally impose on participants?

After thinking about what goes into a game, you should think about:

* How do you lay those games in storage? In general terms, before you think about the commands that achieve what you seek.
* How do you save and retrieve games?

The goal of this first step is not to get everything in immediately. For instance, handling wagers or leaderboards can be left for another time. But there should be a design good enough to accommodate future improvements.

## Code

**Don't** dive headlong into coding the rules of Checkers in Go. The right attitude here is to use someone else's work on Checkers, surely a CS student or two have done this for practice. Your job is to make a blockchain that happens to enable the game of Checkers.

With that in mind:

* What Ignite CLI commands will get you a long way with implementation?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test your modest additions?
* How would you use Ignite CLI to run locally a one-node blockchain and interact with it via the CLI and see what you get?

Run the commands, make the adjustments, run some tests. Don't go into messages and transactions yet.

## Next up

When you are satisfied, or not, with what you did, have a look at [a solution](../4-my-own-chain/stored-game.md).
