---
title: Exercise - Message - Create a Message to Create a Game
order:
description: Exercise - You introduce the message to create a game
tag: deep-dive
---

# Exercise - Message - Create a Message to Create a Game

You have created your game object type and have decided how to lay games in storage. Time to make it possible for participants to create games. Because this operation changes the state, it has to originate from transactions and messages.

## Think

Your module will receive a message to create a game. What should go into this message? The questions that you have to answer yourself include:

* Who is allowed to create a game?
* Are there any limitations to creating games?
* Given that a game involves two players, how do you prevent coercion and generally foster good behavior?
* Do you want to establish leagues?

Of course, your implementation does not have to answer everything immediately, but if you have future plans, make sure to not close them off or make your life eventually more complicated.

Keep it simple for now, and make it such that a single message is enough to create a game.

## Code

As before:

* What Ignite CLI commands will create your message?
* How do you adjust what Ignite CLI created for you?
* How would you unit-test your addition?
* How would you use Ignite CLI to run locally a one-node blockchain and interact with it via the CLI and see what you get?

Run the commands, make the adjustments, run some tests. **Create the message only**, don't create any game in storage for now.

## Next up

When you are satisfied, or not, with what you did, have a look at [a solution](../4-my-own-chain/create-message.md).
