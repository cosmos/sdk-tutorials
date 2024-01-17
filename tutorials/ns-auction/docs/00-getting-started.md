# Advanced Tutorial: Auction Front-Running Simulation

## Table of Contents
- [Getting Started](#introduction)
- [Understanding Front-Running](#understanding-front-running)
- [Simulating the Auction](#simulating-the-auction)
- [Mitigating Front-running with Vote Extensions](#mitigating-front-running-with-vote-extensions)
- [Demo of Mitigating Front-Running](#demo-of-mitigating-front-running)
- [Conclusion](#conclusion)

## Getting Started
### Introduction

In this advanced tutorial, we will be working with an example application that facilitates the auctioning of namespaces. To see what frontrunning and namespaces are [here](./01-understanding-frontrunning.md) This application provides a practical use case to explore the prevention of auction front-running, also known as "bid sniping," where a validator or miner takes advantage of seeing a bid in the mempool to place their own higher bid before the original bid is processed.

The tutorial will guide you through creating a module using the Cosmos SDK that mitigates such front-running by implementing measures to ensure fair auction practices. The module will be built on top of the base blockchain provided in the `tutorials/base` directory and will use the auction module as a foundation. By the end of this tutorial, you will have a better understanding of how to prevent front-running in blockchain auctions, specifically in the context of namespace auctioning.

## Requirements and Setup

Before diving into the advanced tutorial on auction front-running simulation, ensure you meet the following requirements:

- [Golang >1.21.5](https://golang.org/doc/install) installed
- Familiarity with the concepts of front-running and MEV, as detailed in [Understanding Front-Running](./01-understanding-frontrunning.md)

You will also need a foundational blockchain to build upon. The `tutorials/base` directory has the necessary blockchain code to start your custom project with the Cosmos SDK.

To create your auction module with vote extensions, you should:

1. Clone the base blockchain code from the `tutorials/base` directory.
2. Confirm you have an existing module or create a new one where you want to add vote extensions.
3. Review the final product of an auction module with vote extensions in the `tutorials/ns-auction/x/ns-auction` directory to use as a reference.

This will set up a strong base for your blockchain, enabling the integration of advanced features such as auction front-running simulation.

