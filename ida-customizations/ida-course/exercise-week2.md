---
title: "Week 2 Exercise"
order:
description: From simple creation to practice
tags: deep-dive
---

# Week 2 Exercise

You are about to perform a small, simple exercise on Hackerrank, to confirm your attendance so far and check you're paying attention! Before you [try](https://hr.gs/ida-c3-week-2-ex), here is a summary of what you will be asked to do.

The public repository for this project can be found [here](https://github.com/b9lab/ida-exercise-week-2-student-repo). You may want to clone it to your local computer for practice.

## Preparation

We created a Docker container with the included `Dockerfile`:

```sh
$ docker build . -t exercise-w2
```

## What we set up

We created this repository with Ignite CLI v0.22.1 and the following command:

```sh
$ docker run --rm -it \
    -v $(pwd):/exercise \
    -w /exercise \
    exercise-w2 \
    ignite scaffold chain github.com/b9lab/other-world
```

The idea behind it is that this is the blockchain backing a future metaverse. The blockchain will account for anything of value in it.

We have added:

* One file that duplicates what accessing the storage looks like: `x/otherworld/keeper/world_params_duplicate.go`.
* And 2 test files:

    * `x/otherworld/types/world_params_student_test.go`
    * `x/otherworld/keeper/world_params_student_test.go`

All 3 files cannot compile before you have done as per below.

## What you need to do

You need to run an Ignite command to create a new Protobuf type and its associated keeper functions that follows this description:

1. The name is `WorldParams`.
2. It has 3 params exactly, no more, no less:
   1. A `string` for the world's `name`.
   2. A `uint` for the world's `gravity`.
   3. A `uint` for the world's `landSupply`.
3. It is unique in the blockchain store. At what key it is stored does not matter, but you should keep the naming conventions of keeper functions chosen by Ignite.
4. It should not have any associated messages.

## Definition of success

Make these tests pass:

* `x/otherworld/types/world_params_student_test.go`: It needs to pass with:

    ```sh
    $ docker run --rm -it \
        -v $(pwd):/exercise \
        -w /exercise \
        exercise-w2 \
        go test github.com/b9lab/other-world/x/otherworld/types
    ```

    Or:

    ```sh
    $ go test github.com/b9lab/other-world/x/otherworld/types
    ```

* `x/otherworld/keeper/world_params_student_test.go`: It needs to pass with:

    ```sh
    $ docker run --rm -it \
        -v $(pwd):/exercise \
        -w /exercise \
        exercise-w2 \
        go test github.com/b9lab/other-world/x/otherworld/keeper
    ```

    Or:

    ```sh
    $ go test github.com/b9lab/other-world/x/otherworld/keeper
    ```

To run them both at the same time, run:

```sh
$ docker run --rm -it \
    -v $(pwd):/exercise \
    -w /exercise \
    exercise-w2 \
    /exercise/score.sh
```

Or:

```sh
$ ./score.sh
```

In fact, `score.sh` is what we run in the Hackerrank environment.

## HackerRank environment

The HackerRank environment presents an online IDE to you, which already contains all the project files. We have also already installed all packages and modules for you.

You can start a new Terminal window by selecting _Terminal_ -> _New Terminal_ in the top menu.

You can run all tests to check your code by clicking on the _Run Tests_ button at the bottom right corner of the IDE.

## When you are ready

Please submit your exercise via the following link: [HackerRank Week 2 Exercise submission](https://hr.gs/ida-c3-week-2-ex).

**Please make sure to submit your exercise by Thursday, December 15th, 23:59 UTC.**

Do not worry if you do not pass the exercise: it is simply meant to be an opportunity to practice and demonstrate your engagement with the program.
