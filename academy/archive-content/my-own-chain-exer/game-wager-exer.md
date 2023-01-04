---
title: Exercise - Token - Let Players Set a Wager
order:
description: Exercise - Players set a wager
tags: 
  - deep-dive
---

# Exercise - Token - Let Players Set a Wager

Now that no games can be left stranded, it is possible for players to safely wager on their games. How could this be implemented?

## Think

* What form will a wager take?
* Who decides on the amount of wagers?
* Where is a wager recorded?
* Is there any desirable atomicity of actions?
* At what junctures do you need to handle payments, refunds, and wins?
* Are there errors to report back?
* What event should you emit?

## Code

* What Ignite CLI commands, if any, will assist you?
* How do you adjust what Ignite CLI created for you?
* Where do you make your changes?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

## Next up

When you are satisfied (or not) with what you have, look at [a solution](../3-my-own-chain/game-wager.md).
