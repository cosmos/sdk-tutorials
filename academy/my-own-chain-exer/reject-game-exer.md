---
title: Exercise - Message and Handler - Make Sure a Player Can Reject a Game
order: 10
description: Exercise - Reject a game
tag: deep-dive
---

# Exercise - Message and Handler - Make Sure a Player Can Reject a Game

Your blockchain can now create and play games, and inform the outside world about the process. It would be good to add a way for players to back out of games they don't want to play. What do you need to make this possible?

## Think

* What goes into the message?
* How do you sanitize the inputs?
* How do you unequivocally identify games?
* What conditions have to be satisfied to reject a game?
* How do you report back errors?
* What event should you emit?
* How do you use your files that implement the Checkers rules?
* What do you do with a rejected game?

## Code

* What Ignite CLI commands will create your message?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

As before, do not bother yet with niceties like gas metering.

## Next up

When you are satisfied (or not) with what you have, look at [a solution](../3-my-own-chain/reject-game.md).
