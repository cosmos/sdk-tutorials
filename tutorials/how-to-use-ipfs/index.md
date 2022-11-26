---
parent:
title: How to use IPFS for governance
order: 0
description: Learn how to use IPFS for governance, for instance, for storing proposal metadata off-chain.
tags:
  - tutorial
  - cosmos-sdk
  - dev-ops
---

# How to use IPFS for governance

## What is IPFS

In Web 2.0, a web application consists of a backend and a frontend. The backend is the server where the database and the application logic run. The frontend consists of the user interface, what the user sees, and communicates with the backend via API calls. Usually, these are stored by the developer of the application in centralized servers.

In the decentralized world, we can consider Cosmos SDK chains as a backend of our decentralized applications (Dapps). The blockchain lets us store and retrieve data. Dapps usually have a frontend as well, and that frontend can be stored in a centralized entity (AWS, GitHub Pages) or, in order to be 100% decentralized, use a protocol like IPFS.

> IPFS is a distributed system for storing and accessing files, websites, applications, and data.

This means that IPFS allows you to store your frontend in a decentralized manner.

You can find more information about how IPFS works in their [documentation](https://docs.ipfs.tech/concepts/what-is-ipfs).

In this tutorial, you will learn how to store files and websites on IPFS.

## Requirements 

First download and install IPFS, find the instructions for your OS [here](https://docs.ipfs.io/install/command-line/).

Verify you have a working installation by running the following command:

```sh
$ ipfs --version
```

Which for instance returns:

```txt
ipfs version 0.15.0
```

## Submit a file

To make a file available on IPFS, you need to make it available to an IPFS node. This can be a local IPFS node or a remote one. In this tutorial, you will use a remote node.

For Cosmos chain governance, you want to store the metadata on IPFS nodes.

Create a file called `metadata.json` with the following content:

```json
{
  "title": "Funds alumni program",
  "authors": "IDA Alumni",
  "summary": "Lorem ipseum dolor sit amet",
  "details": "",
  "proposalForumURL": "https://forum.cosmos.network/t/foo",
  "voteOptionContext": "",
}
```

Add the file to your IPFS node:

```sh
$ ipfs add metadata.json
```

Which for instance returns:

```txt
added Qmbct5cv1SxMpEYCpNEvZnQ5TkN1rk7KyTmV95nbsrbLiR metadata.json
```

By running `add` you have [pinned the file](https://docs.ipfs.tech/how-to/pin-files/#three-kinds-of-pins) to the node, stopping it from being eventually pruned.

The content identifier (CID) of the file is `Qmbct5cv1SxMpEYCpNEvZnQ5TkN1rk7KyTmV95nbsrbLiR`. This is the CID that you will use to retrieve the file from IPFS.

Verify the content of the file by running:

```sh
$ ipfs cat Qmbct5cv1SxMpEYCpNEvZnQ5TkN1rk7KyTmV95nbsrbLiR
```

At this point, you can start your local IPFS node:

```sh
$ ipfs deamon
```

The file becomes available on IPFS. You can easily access it via `https://ipfs.io/ipfs/<cid>`, in your case `https://ipfs.io/ipfs/Qmbct5cv1SxMpEYCpNEvZnQ5TkN1rk7KyTmV95nbsrbLiR`.

Note that as soon as you stop the node, it is possible that after a while, the file will not be accessible on the network. This is because only your node has pinned the file, other nodes may delete the file depending of their retention policy.

As you want to store the metadata permanently, without running your IPFS own node (for the scope of this tutorial), you want to pin it to a remote node, using a [pinning service](https://docs.ipfs.tech/how-to/pin-files/#three-kinds-of-pins).

## Pinning services

Pinning services are services that pin files on their nodes, making them available on the network, without having to run your own node.

For this tutorial, you will use [Web3.storage](https://web3.storage/), a pinning service provided by **Protocol Labs**, the main developers of IPFS. Feel free to use any other pinning service you prefer, such as [Pinata](https://pinata.cloud), [Infura](https://infura.io/product/ipfs), etc.

First, create an account on [Web3.storage](https://web3.storage/) and get an [API token](https://web3.storage/tokens/?create=true). With Web3.storage, you need to request access to the pinning API, or you can upload the file directly from the interface.

Next, add `web3.storage` as a remote service:

```sh
$ ipfs pin remote service add web3.storage https://api.web3.storage/ <YOUR_AUTH_KEY_JWT>
```

Make sure your node can serve the file when the Web3.storage server looks for it:

```sh
$ ipfs daemon &
```

Now you can pin the file to the remote node:

```sh
$ ipfs pin remote add --service=web3.storage --name="proposal-1-metadata.json" Qmbct5cv1SxMpEYCpNEvZnQ5TkN1rk7KyTmV95nbsrbLiR
```

Your file is now pinned to the remote node.

## 🎉 Congratulations 🎉

By completing this tutorial, you have learned how to use IPFS for storing files, notably for proposal metadata.

To learn more about IPFS in general, you can check their [documentation](https://docs.ipfs.io/).
Additionally, you can learn more about how to use the `CID` in the [group](/tutorials/8-understand-sdk-modules/3-group.md) module tutorial.
