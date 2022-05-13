---
title: Exercise - Message Handler - Create and Save a Game Properly
order:
description: Exercise - You create a proper game
tag: deep-dive
---

# Exercise - Message Handler - Create and Save a Game Properly

You have created a message that is intended to create a game. However it does not create a game just yet because you have not yet implemented the message handling proper. It is time to do this part.

## Think

* How do you sanitize your inputs?
* How do you avoid conflicts with past and future games?
* How do you use your files that implement the Checkers rules?

## Code

* No Ignite CLI involved here, it is Go Go Go.
* Of course, you need to know where to put your code. Look for `TODO`.
* How would you unit-test this handling?
* How would you use Ignite CLI to run locally a one-node blockchain and interact with it via the CLI and see what you get?

For now, don't bother with niceties like gas metering or event emission.

## Next up

When you are satisfied, or not, with what you did, have a look at [a solution](../4-my-own-chain/create-handling.md).
