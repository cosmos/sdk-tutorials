---
title: Exercise - Create an Object
order:
description: Exercise - From simple creation to practice
tags: 
  - deep-dive
---

# Exercise - Create an Object

You are about to perform a small, simple exercise on Hackerrank, to confirm your attendance so far and check you're paying attention! <!-- Before you [try](TODO), here is a summary of what you will be asked to do. -->

## The problem description

The repository was created with Ignite CLI v0.22.1 and the command:

```sh
$ ignite scaffold chain github.com/b9lab/other-world
```

**The idea is that this blockchain will back a future metaverse**. The blockchain will account for anything of value in it.

## Read-only files

There are no hidden files but there are plenty of [read-only files](https://github.com/b9lab/ida-exercise-week-2-student-repo/blob/master/hackerrank.yml#L7-L35). You should not try to modify them from the command-line. That includes not trying to fix a "broken" test. When running Ignite, it should not modify these files either anyway.

## Student actions

Your goal is to run an Ignite command to create a new Protobuf type that follows this description:

1. Its name is `WorldParams`.
2. It has exactly 3 parameters:
   1. A `string` for the world's `name`.
   2. A `uint` for the world's `gravity`.
   3. A `uint` for the world's `landSupply`.
3. It is unique in the blockchain store. At what key it is stored does not matter, but you should keep the naming conventions of keeper functions chosen by Ignite.
4. It should not have any associated messages.

## How your work is tested

We run the `score.sh`. In it, you can see it runs two Go test commands.

## How you can prepare

To assist you getting a feel of what it looks like behind the Hackerrank wall, we have put this small [public repository](https://github.com/b9lab/ida-exercise-week-2-student-repo) at the branch `master` that contains what you will see.

It will fail to compile because it is missing `WorldParams`. You can practice as much as you want.

## When you are ready

Please submit your exercise via the following link: [HackerRank week 2 exercise submission](https://hr.gs/ida-p1-exercise-week-2).

**Please make sure to submit your exercise till Monday September 30th 23:59 UTC.**
