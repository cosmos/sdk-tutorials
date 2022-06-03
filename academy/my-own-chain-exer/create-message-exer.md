---
title: Exercise - Message - Create a Message to Create a Game
order:
description: Exercise - Introduce the message to create a game
tag: deep-dive
---

# Exercise - Message - Create a Message to Create a Game

You have created your game object type and have decided how to lay games in storage. Time to make it possible for participants to create games. 

## Think

Because this operation changes the state, it has to originate from transactions and messages. Your module will receive a message to create a game - what should go into this message? Questions that you have to answer include:

* Who is allowed to create a game?
* Are there any limitations to creating games?
* Given that a game involves two players, how do you prevent coercion and generally foster good behavior?
* Do you want to establish leagues?

Your implementation does not have to answer everything immediately, but you should be careful that decisions made now do not impede your own future plans or make things more complicated later.

Keep it simple: a single message should be enough to create a game.

## Code

As before:

* What Ignite CLI commands will create your message?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test your addition?
* How would you use Ignite CLI to locally run a one-node blockchain and interact with it via the CLI to see what you get?

Run the commands, make the adjustments, run some tests. **Create the message only**, do not create any games in storage for now.

## Next up

When you are satisfied (or not) with what you have, look at [a solution](../3-my-own-chain/create-message.md).
