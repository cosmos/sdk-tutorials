---
title: Prepare a validator and keys
order: 2
description: Set up keys for use for your validator
tag: deep-dive
---

# Prepare a validator and keys

In the [previous section](./1-software.md), you prepared a binary for your nodes. Some of your nodes will be validators. To propose and sign blocks, validators need access to private keys on an on-going basis. A regular node does not need keys.

Here you learn how to prepare a validator and handle its keys. This works whether you are preparing a validator to join a preexisting network, or you are setting up your validator to be part of the [genesis](./genesis.md).

## Private key security considerations

More precisely than needing access to private keys, validators only need the capability to sign blocks on an on-going basis. There is a security difference between access to the private key and access to a signing facility:

1. When your validator has access to the private key, if your validator node has been compromised, your private key is too, and you are at the risk of wrongfully signing malicious blocks and transactions **for ever**.
2. On the other hand, when you only provide a signing _service_ to your validator, and your validator node has been compromised, you are _only_ at the risk of wrongfully signing malicious blocks and transactions **for as long as the signing service is up**.

In order to mitigate **point 1**, you can keep your private key in a [hardware security module](https://hub.cosmos.network/main/validators/validator-faq.html#how-to-handle-key-management) (a.k.a. HSM), from which it can be retrieved only once, during the HSM's offline setup. This HSM device then remains plugged into the computer that runs the validator or the signing service. See [here](https://hub.cosmos.network/main/validators/security.html#key-management-hsm) for the current list of supported devices. To use an HSM you own, you need physical access to the computer into which you plug it in.

In order to mitigate **point 2**, you can use a specialized [key management system](https://hub.cosmos.network/main/validators/kms/kms.html) (a.k.a. KMS). It runs on a computer separate from your validator node, it has access to the hardware key and is contacted over the private network by your validator node(s) for the purpose of signing blocks. Such a KMS is specialized in the sense that it is, for instance, able to detect attempts are signing two different blocks at the same height.

You can combine these stragegies. For instance, if you insist on using an HSM and having your validator node located in the cloud, you can run the KMS on a computer to which you have physical access, and which dials into your remote validator node to provide the signing service.

## Hot and cold keys

To touch on a point of vocabulary, these validator keys can be considered **hot** in that they can produce valid signatures at any time. Even when safely housed in a HSM, these keys are considered hot because they are accessible immediately by your computers. This is a higher security risk compared to **cold** keys that are kept out of a networked computer altogether.

In order to further reduce the surface attack of your hot keys, you can use the delegation mechanism. You know that validators can be entrusted with delegated stakes by other network participants. Your validator itself can use this mechanism. For instance:

* Your **hot** validator key holds the minimum necessary amount of coins on it.
* Another, **cold**, key holds the rest of your coins intended for staking and uses the delegation feature to increase your validator's weight.

## Workflow security considerations

Beside private key security, your validator should work as intended in a world where computers crash and networks get congested. Failing to address these eventualities could cost a portion of the stakes of yours and your delegators'.

There are two main honest-mistake pitfalls:

1. Your validator fails signing or proposing blocks. This can happen if:
    * Your computer is offline for too long.
    * Your computer does not receive updates in time.
2. Your validator wrongfully signs two valid blocks of the same height. This can happen if:
    * You have a misconfigured failover validator.
    * You have two computers using the same key.

To address point 1, this sounds about good ol' keeping your computer running and your networks in good shape. There is an added difficulty, though. Because your validator participates in a public network, its address can be [discovered and attacked](https://hub.cosmos.network/main/validators/validator-faq.html#how-can-validators-protect-themselves-from-denial-of-service-attacks). To mitigate this risk, you can for instance use a [sentry node architecture](./4-network.md#ddos). In this architecture, your validator node is only accessible through private networks, and a number of regular public facing nodes connect to the network at large and to your validator over the private network. These sentry nodes can be placed on the cloud and only relay over the gossip network. You can safely shut them down or start up more of them. As an additional feature, if you absolutely trust a few other nodes, you can have your node connect to those directly over a private network.

To address point 2, this is where your use of the specialized KMS application that sits between your validator and your HSM can help. This application handles strictly one process at a time, and stores the latest signed blocks so that it can detect an attempt at double-signing.

Without such a KMS, you must ensure that only one of your computers signs blocks at a time. In particular, watch out if you adopt an aggressive computer restart policy.

## Generate

https://docs.cosmos.network/main/run-node/run-node.html

Types: https://hub.cosmos.network/main/validators/validator-faq.html#what-are-the-different-types-of-keys

In OS built-in secret store.

https://catboss.medium.com/turning-a-full-node-in-to-a-validator-node-osmosis-1-36f3358f2412

## Advertise

Where to present yourself for delegators to find you.

