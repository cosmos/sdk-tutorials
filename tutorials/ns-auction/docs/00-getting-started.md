# Advanced Tutorial: Auction Front-Running Simulation

## Table of Contents

- [Getting Started](#introduction)
- [Understanding Front-Running](01-understanding-front-running)
- [Mitigating Front-running with Vote Extensions](02-mitigating-front-running-with-vote-extensions)
- [Demo of Mitigating Front-Running](03-demo-of-mitigating-front-running)

## Getting Started

### Introduction

In this advanced tutorial, we will be working with an example application that facilitates the auctioning of namespaces. To see what frontrunning and namespaces are [here](./01-understanding-frontrunning.md) This application provides a practical use case to explore the prevention of auction front-running, also known as "bid sniping", where a validator takes advantage of seeing a bid in the mempool to place their own higher bid before the original bid is processed.

The tutorial will guide you through using the Cosmos SDK to mitigate front-running using vote extensions. The module will be built on top of the base blockchain provided in the `tutorials/base` directory and will use the `ns-auction` module as a foundation. By the end of this tutorial, you will have a better understanding of how to prevent front-running in blockchain auctions, specifically in the context of namespace auctioning.

## Requirements and Setup

Before diving into the advanced tutorial on auction front-running simulation, ensure you meet the following requirements:

- [Golang >1.21.5](https://golang.org/doc/install) installed
- Familiarity with the concepts of front-running and MEV, as detailed in [Understanding Front-Running](./01-understanding-frontrunning.md)

You will also need a foundational blockchain to build upon. The `tutorials/base` directory has the necessary blockchain code to start your custom project with the Cosmos SDK. But also you will need to have your own module or use the `ns-auction` module provided in the `tutorials/ns-auction/x/ns-auction` directory as a reference.

This will set up a strong base for your blockchain, enabling the integration of advanced features such as auction front-running simulation.
