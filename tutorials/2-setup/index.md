---
title: "Set Up Your Work Environment"
order: 0
description: All you need for the hands-on sections
tags: 
  - tutorial
  - dev-ops
---

# Set Up Your Work Environment

On this page, you can find helpful links to set up your work environment for all hands-on sections.

<HighlightBox type="learning">

In this section, you can find all you need to install:

* [Docker](https://www.docker.com/)
* [Go](https://go.dev/)
* [Node.js](https://nodejs.org/en/)
* [Rust](https://www.rust-lang.org/)
* [Visual Studio Code](https://code.visualstudio.com/)

</HighlightBox>

On a general note, it is advisable to **prepare a separate project folder to keep all your Cosmos exercises**.

## Install Docker

Docker is very helpful to do the exercises. So you may need to install Docker. To install, head to the [Install Docker Engine page](https://docs.docker.com/engine/install/). If you are new to Docker have a look at this [quick introduction](/tutorials/5-docker-intro).

## Install Go

You need Go to develop with the Cosmos SDK. If you still need to install Go on your system, head to the [Go download and install page](https://go.dev/doc/install).

<HighlightBox type="best-practice">

Picking the latest version of Go should do.

</HighlightBox>

## Install Node.js

To develop with CosmJS, you need Node.js. Just head to the [Node.js download page](https://nodejs.org/en/download/) to install it.

<HighlightBox type="best-practice">

You should install the latest version of Node.js.

</HighlightBox>

## Install Rust

To work with Rust, you may need to install it first. You can find a well-documented install step-by-step in the [Install page from Rust](https://www.rust-lang.org/tools/install).

To check that you are up-to-date run:

```
$ rustc --version
```

If you already installed the Rust toolchain, you can update your installation by running:

```
$ rustup update
```

To test the installation of Rust, you can use the following command:

```
$ cargo version
```

It displays the cargo version and helps confirm proper installation.

## Install Visual Studio Code

This integrated development environment assists both with developing with the Cosmos SDK and CosmJS. To install it, please go to the [Visual Studio Code install page](https://code.visualstudio.com/Download). Then select depending on your operating system (OS).

<HighlightBox type="best-practice">

The first time you open a Cosmos SDK project with Visual Studio Code, it offers to install a Go plug-in. You can go ahead and accept it.

</HighlightBox>

<!--## Next up

Now that you are all set, dive right into running a node and explore working with `simapp` in the [next section](/hands-on-exercise/3-run-node/index.md).-->
