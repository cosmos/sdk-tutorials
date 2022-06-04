---
title: Exercise - Auto-Expiring Games
order:
description: Exercise - Enforce the expiration of games
tag: deep-dive
---

# Exercise - Auto-Expiring Games

Players can now reject games, so there is a way for stale games to be removed from storage. But is this enough to avoid _state pollution_?

## Think

* What conditions have to be satisfied for a game to be considered stale and the blockchain to act?
* How do you sanitize the new information inputs?
* How would you get rid of stale games as part of the protocol, that is _without user inputs_?
* How do you optimize performance and data structures so that a few stale games do not cause your blockchain to grind to a halt?
* How can you be sure that your blockchain is safe from attacks?
* How do you make your changes compatible with future plans for wagers?
* Are there errors to report back?
* What event should you emit?

## Code

* What Ignite CLI commands, if any, will assist you?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test these new elements?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

For now, do not bother yet with future ideas like wager handling.

## Next up

When you are satisfied (or not) with what you have, look at some solutions which relate to:

* [System performance](../3-my-own-chain/game-fifo.md)
* [Game duration](../3-my-own-chain/game-deadline.md)
* [Good player performance](../3-my-own-chain/game-winner.md)
* [Poor player engagement](../3-my-own-chain/game-forfeit.md)
