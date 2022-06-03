---
title: Exercise - Message Handler - Create and Save a Game Properly
order:
description: Exercise - Create a proper game
tag: deep-dive
---

# Exercise - Message Handler - Create and Save a Game Properly

You have created a message that is intended to create a game. However, it does not create a game yet because you have not implemented the message handling. How would you do this?

## Think

* How do you sanitize your inputs?
* How do you avoid conflicts with past and future games?
* How do you use your files that implement the Checkers rules?

## Code

* No Ignite CLI is involved here, it is just Go Go Go.
* Of course, you need to know where to put your code. Look for `TODO`.
* How would you unit-test this message handling?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

For now, do not bother with niceties like gas metering or event emission.

## Next up

When you are satisfied (or not) with what you have, look at [a solution](../3-my-own-chain/create-handling.md).
