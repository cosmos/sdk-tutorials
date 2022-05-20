---
title: Exercise - Create an object
order:
description: Exercise - From simple creation to practice
tag: deep-dive
---

# Exercise - Create an object

You are about to perform a small, simple exercise on Hackerrank, to confirm your attendance so far and check you're paying attention! Before you [try](TODO), here is a summary of what you will be asked to do.

# The problem description

The following repository was created with Ignite CLI v0.17.3 and the command:

```sh
$ ignite scaffold chain
```

**The idea is that this blockchain will back a future metaverse**. The blockchain will account for anything of value in it.

## Hidden files

There are hidden files that:

1. Declare and implement a `WorldParams2` type.
2. Test this type against a future type which **you** have to create.

## Student actions

Your goal is to run an Ignite command to create a new Protobuf type that follows this description:

1. Its name is `WorldParams`.
2. It has exactly 3 params, in exactly this order, with the Protobuf indices going from `1` to `3` respectively:
   1. A `string` for the world's `name`.
   2. A `uint` for the world's `gravity`.
   3. A `uint` for the world's `landSupply`.
3. It is unique in the blockchain store. At what key it is stored does not matter, but you should keep the naming conventions of keeper functions chosen by Ignite.
4. It should not have any associated messages.

## How your work is tested

A hidden test file will check that your output is properly named and prepared. Based on that:

* If you have a compilation error, it means you have named elements wrongly.
* If the test fails, you have numbered things wrongly in Protobuf, or you have messages for `WorldParams`.
