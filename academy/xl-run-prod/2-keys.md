---
title: Prepare a validator and keys
order: 2
description: Set up keys for use for your validator
tag: deep-dive
---

# Prepare a validator and keys

In the [previous section](./1-software.md), you prepared a binary for your nodes. Some of your nodes will be validators. To propose and sign blocks, validators need access to private keys on an on-going basis. A regular node does not need such keys.

Here you learn how to prepare a validator and handle its keys. This works whether you are preparing a validator to join a preexisting network, or you are setting up your validator to be part of the [genesis](./genesis.md).

## Private key security considerations

More precisely than needing access to private keys, validators only need the capability to sign blocks on an on-going basis. There is a security difference between access to the private key and access to a signing facility:

1. When your validator has access to the private key, if your validator node has been compromised, your private key is too, and you are at the risk of wrongfully signing malicious blocks **for ever**.
2. On the other hand, when you only provide a signing _service_ to your validator, and your validator node has been compromised, you are _only_ at the risk of wrongfully signing malicious blocks **for as long as the signing service is up**.

In order to mitigate **point 1**, you can keep your private key in a [hardware security module](https://hub.cosmos.network/main/validators/validator-faq.html#how-to-handle-key-management) (a.k.a. HSM), from which it can be retrieved only once, during the HSM's offline setup. This HSM device then remains plugged into the computer that runs the validator or the signing service. See [here](https://hub.cosmos.network/main/validators/security.html#key-management-hsm) for the current list of supported devices. To use an HSM you own, you need physical access to the computer into which you plug it in.

In order to mitigate **point 2**, you can use a specialized [key management system](https://hub.cosmos.network/main/validators/kms/kms.html) (a.k.a. KMS). It runs on a computer separate from your validator node, it has access to the hardware key and is [contacted over the private network](https://github.com/iqlusioninc/tmkms/blob/v0.12.2/README.txsigner.md#architecture) by your validator node(s) for the purpose of signing blocks. Such a KMS is specialized in the sense that it is, for instance, able to detect attempts are signing two different blocks at the same height.

You can combine these stragegies. For instance, if you insist on using an HSM and having your validator node located in the cloud, you can run the KMS on a computer to which you have physical access, and which dials into your remote validator node to provide the signing service.

## What validator keys

A validator handles [two](https://hub.cosmos.network/main/validators/validator-faq.html#what-are-the-different-types-of-keys), perhaps three, different keys. Each with a different purpose:

1. The Tendermint consensus key. This key is used to sign blocks on an on-going basis, and is of type `ed25519`.
2. The validator operator application key. This key is used to create transactions that create or modify the validator parameters, and is of type `secp256k1`, or whichever type the application supports.
3. The delegator application key. [This key](https://hub.cosmos.network/main/validators/validator-faq.html#are-validators-required-to-self-delegate-atom) is used to handle the stake that gives the validator more weight.

Most likely keys 2 and 3 are [one and the same](https://github.com/cosmos/cosmos-sdk/blob/v0.46.1/proto/cosmos/staking/v1beta1/tx.proto#L45-L47) when you are a node operator.

## Hot and cold keys

To touch on a point of vocabulary, the Tendermint consensus key can be considered **hot** in that it can and has to produce valid signatures at any time. Even when safely housed in a HSM, this key is considered hot because it is usable immediately by your computers. This is a higher security risk compared to **cold** keys that are kept out of a networked computer altogether.

Your validator and potential delegator keys should be cold.
## Workflow security considerations

Beside private key security, your validator should work as intended in a world where computers crash and networks get congested. Failing to address these eventualities could cost a portion of the stakes of yours and your delegators'. By how much depends on certain [configured genesis parameters](https://docs.cosmos.network/v0.46/modules/slashing/08_params.html) of the network.

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

### Consensus key

When you run the standard `simd init` command, it creates a default Tendermint consensus key on disk found at path [`~/.simapp/config/priv_validator_key.json`](https://docs.cosmos.network/main/run-node/run-node.html#initialize-the-chain). This is convenient if you are starting a testnet, for which the security requirements are low. However for a more valuable network, you should delete this file so as to avoid using it by mistake. Or [import it](https://github.com/iqlusioninc/tmkms/blob/v0.12.2/README.txsigner.md#architecture) into the KMS and then delete it, if that is your choice.

To use Tendermint's KMS, follow the instructions [here](https://hub.cosmos.network/main/validators/kms/kms.html). When it is installed, configured and running, you can ask its public key that will be useful at the genesis stage. It has to be Protobuf JSON encoded, for instance `{"@type":"/cosmos.crypto.ed25519.PubKey","key":"byefX/uKpgTsyrcAZKrmYYoFiXG0tmTOOaJFziO3D+E="}`.

### App key

For this key, you can follow standard procedures for cold keys on your own computer.

## Advertise

Where to present yourself for delegators to find you.

