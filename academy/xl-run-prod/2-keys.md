---
title: Prepare a validator and keys
order: 2
description: Set up keys for use for your validator
tag: deep-dive
---

# Prepare a validator and keys

In the [previous section](./1-software.md), you prepared a binary for your nodes. Some of your nodes will be validators. To propose and sign blocks, validators need access to private keys on an on-going basis.

Here you learn how to prepare a validator and handle its keys. This works whether you are preparing a validator to join a preexisting network, or you are setting up your validator to be part of the [genesis](./genesis.md).

## Private key security considerations

More precisely than needing access to private keys, validators only need the capability to sign blocks on an on-going basis. There is a difference between access to the private key and access to signing. Ideally, the private key should be in a [hardware security module](https://hub.cosmos.network/main/validators/validator-faq.html#how-to-handle-key-management) (HSM), from which it can be retrieved only once, during setup. This HSM device then remains plugged into the computer that runs the validator. See [here](https://hub.cosmos.network/main/validators/security.html#key-management-hsm) for the current list of supported devices.

These validator keys can be considered _hot_ in that they can produce valid signatures at any time. This is a higher security risk compared to _cold_ keys that are kept out of a networked computer.

With hot keys, there remains the risk that a signature may be requested for something other than a block, like sending all your coins to your attacker. However, you know that validators can be entrusted with delegated stakes by other network participants. Your validator itself can use this mechanism. For instance:

* Your **hot** validator key holds the minimum necessary amount of coins on it.
* Another, **cold**, key holds the rest of your coins intended for staking and uses the delegation feature to increase your validator's weight.

To further separate your node from the hardware key, you can install a [key management system](https://hub.cosmos.network/main/validators/kms/kms.html) (KMS). It runs on the computer with the hardware key and is contacted by your node.

## Workflow security considerations

Beside private key security, your validator should work as intended in a world where computers crash and networks get congested. Failing to address these eventualities could cost a portion of the stakes of yours and your delegators.

There are two main honest-mistake pitfalls:

1. Your validator fails signing or proposing blocks. This can happen if:
    * Your computer is offline for too long.
    * Your computer does not receive updates in time.
2. Your validator wrongfully signs two valid blocks of the same height. This can happen if:
    * You have two computers using the same key.

To address point 1, this sounds about good ol' keeping your computer running and your networks in good shape. There is an added difficulty, though. Because your validator participates in a public network, its address can be [discovered and attacked](https://hub.cosmos.network/main/validators/validator-faq.html#how-can-validators-protect-themselves-from-denial-of-service-attacks). To mitigate this risk, you can for instance use a [sentry node architecture](https://forum.cosmos.network/t/sentry-node-architecture-overview/454). In this architecture, your validator node is only accessible through private networks, and a number of public facing nodes connect to the network at large and to your validator over the private network. These sentry nodes can be placed on the cloud and only relay over the gossip network. You can safely shut them down or start up more of them. As an additional feature, if you absolutely trust a few other nodes, you can have your node connect to those directly over a private network.

To address point 2, there is current work on the Tendermint side to create a specific KMS application that sits between your validator and your HSM. This application would be handling strictly one process at a time, and would store the latest signed blocks so that it can detect an attempt at double-signing.

Pending a release of such a tool, you must ensure that only one of your computers signs blocks at a time. In particular if you adopt an aggressive computer restart policy.

## Generate

Types: https://hub.cosmos.network/main/validators/validator-faq.html#what-are-the-different-types-of-keys

In OS built-in secret store.

## Advertise

Where to present yourself for delegators to find you.
