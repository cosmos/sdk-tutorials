---
title: Prepare a Validator and Keys
order: 4
description: Set up keys for use by your validator
tags:
  - guided-coding
  - cosmos-sdk
  - dev-ops
---

# Prepare a Validator and Keys

In the [previous section](./2-software.md), you prepared a binary for your nodes. Some of your nodes will be validators. To propose and sign blocks, validators need ongoing access to important private keys. A regular node does not need such important keys.

Here you learn how to prepare a validator and handle its keys. This works whether you are preparing a validator to join a preexisting network, or you are setting up your validator to be part of the [genesis](./4-genesis.md).

## Private key security considerations

More precisely than needing ongoing access to private keys, validators only need the capability to sign blocks on an ongoing basis. There is a security difference between access to the private key and access to a signing facility:

1. When your validator has access to the private key, if your validator node has been compromised then your private key is too, and you are at the risk of wrongfully signing malicious blocks **forever**.
2. On the other hand, when you only provide a signing _service_ to your validator, if your validator node has been compromised then you are _only_ at the risk of wrongfully signing malicious blocks **for as long as the signing service is up**.

In order to mitigate the danger of **point 1**, you can keep your private key in a [hardware security module](https://hub.cosmos.network/main/validators/validator-faq.html#how-to-handle-key-management) (a.k.a. HSM), from which it can be retrieved only once, during the HSM's offline setup. This HSM device then remains plugged into the computer that runs the validator or the signing service. See [here](https://hub.cosmos.network/main/validators/security.html#key-management-hsm) for the current list of supported devices. To use an HSM you own, you need physical access to the computer into which you plug it.

To implement **point 2**, you can use a specialized [key management system](https://hub.cosmos.network/main/validators/kms/kms.html) (KMS). This runs on a computer separate from your validator node but has access to the hardware key and [contacts your  validator node(s) over the private network](https://github.com/iqlusioninc/tmkms/blob/v0.12.2/README.txsigner.md#architecture) (or is contacted by your validator node(s)) for the purpose of signing blocks. Such a KMS is specialized in the sense that it is, for instance, able to detect attempts to sign two different blocks at the same height.

You can combine these strategies. For instance, if you insist on using an HSM and having your validator node located in the cloud, you can run the KMS on the computer the HSM is physically plugged into, which dials into your remote validator node to provide the signing service.

## What validator keys

A validator handles [two](https://hub.cosmos.network/main/validators/validator-faq.html#what-are-the-different-types-of-keys), perhaps three, different keys. Each has a different purpose:

1. The **Tendermint consensus key** is used to sign blocks on an ongoing basis. It is of the key type `ed25519`, which the KMS can keep. When Bech-encoded, the address is prefixed with `cosmosvalcons` and the public key is prefixed with `cosmosvalconspub`.
2. The **validator operator application key** is used to create transactions that create or modify validator parameters. It is of type `secp256k1`, or whichever type the application supports. When Bech-encoded, the address is prefixed with `cosmosvaloper`.
3. The [**delegator application key**](https://hub.cosmos.network/main/validators/validator-faq.html#are-validators-required-to-self-delegate-atom) is used to handle the stake that gives the validator more weight. When Bech-encoded, the address is prefixed with `cosmos` and the public key is prefixed with `cosmospub`.

Most likely keys 2 and 3 [are the same](https://github.com/cosmos/cosmos-sdk/blob/v0.46.1/proto/cosmos/staking/v1beta1/tx.proto#L45-L47) when you are a node operator.

## Hot and cold keys

To touch on a point of vocabulary, the Tendermint consensus key can be considered **hot**, in that it can and must produce valid signatures at any time. Even when safely housed in an HSM, this key is considered hot because it is usable immediately by your computers. This is a higher security risk compared to **cold** keys, which are kept out of a networked computer altogether, or at least require human approval before being accessed (like an HSM device stored in your desk drawer).

Your validator operator and potential delegator keys should be **cold**.

## Workflow security considerations

Besides private key security, your validator should work as intended in a world where computers crash and networks get congested. Failing to address these eventualities could cost a portion of the stakes of you and your delegators. How much depends on certain [configured genesis parameters](https://docs.cosmos.network/v0.46/modules/slashing/08_params.html) of the network.

There are two main honest-mistake pitfalls:

1. Your validator fails in signing or proposing blocks. This can happen if:
    * Your computer is offline for too long.
    * Your computer does not receive updates in time.
2. Your validator wrongfully signs two valid blocks of the same height. This can happen if:
    * You have a misconfigured failover validator.
    * You have two computers using the same key.

To address **point 1**, this sounds like an issue about keeping your computer running and your networks in good shape. There is an added difficulty, though. Because your validator participates in a public network, its address can be [discovered and attacked](https://hub.cosmos.network/main/validators/validator-faq.html#how-can-validators-protect-themselves-from-denial-of-service-attacks). To mitigate this risk, you can for instance use a [sentry node architecture](./5-network.md#ddos) so your validator node is only accessible through private networks, and a number of regular public-facing nodes connect to the network at large and your validator over the private network. These sentry nodes can be placed on the cloud and only relay over the gossip network. You can safely shut them down (not all of them, of course) or start up more. Your sentries should not disclose your validator's address to the P2P network. As an additional feature, if you absolutely trust a few other nodes, you can have your node connect to those directly over a private network.

To address **point 2**, this is where your use of the specialized KMS application that sits between your validator and your HSM can help. This application handles strictly one process at a time and stores the latest signed blocks so that it can detect any attempt at double-signing.

Without such a KMS, you must ensure that only one of your computers signs blocks at a time. In particular, be wary if you adopt an aggressive computer restart policy.

## Key generation

Now, take a closer look at generating keys, a consensus and an app key.

### Consensus key

When you run the standard `simd init` command, it creates a default Tendermint consensus key on disk at path [`~/.simapp/config/priv_validator_key.json`](https://docs.cosmos.network/main/run-node/run-node.html#initialize-the-chain). This is convenient if you are starting a testnet, for which the security requirements are low. However, for a more valuable network, you should delete this file to avoid using it by mistake, or [import it](https://github.com/iqlusioninc/tmkms/blob/v0.12.2/README.txsigner.md#architecture) into the KMS and then delete it if that is your choice.

To use Tendermint's KMS follow the instructions [here](https://hub.cosmos.network/main/validators/kms/kms.html), or how it is applied in the [checkers hands-on exercise](/hands-on-exercise/2-ignite-cli-adv/9-run-prod-docker.md). When it is installed, configured, and running, you can ask it for its public key, which will be useful at the genesis stage. It has to be Protobuf JSON encoded, for instance:

```json
{"@type":"/cosmos.crypto.ed25519.PubKey","key":"byefX/uKpgTsyrcAZKrmYYoFiXG0tmTOOaJFziO3D+E="}
```

Note the `@` in `"@type"`.

### App key

For this key, you can follow standard procedures for cold keys on your computer, in the model of `simd keys ...`.

## Advertise

With your keys set up, you want to eventually cover your validator costs, if not run a profitable business. Part of the equation is to have third-party token holders delegate to your validator so you can collect a commission from their share of the rewards. Also, given that only a limited number of validators can be in the validating pool, you have to increase the amount delegated to your validator in order to gain entry to said pool.

You want to make sure potential delegators can find your validator operator application key, and present your service in an attractive manner. It is highly specific to your chain and can be in dedicated Web 2.0 forums or purpose-built indexed websites.

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to prepare keys for a validator, which needs to be able to sign blocks on an ongoing basis, and handle the validator's keys.
* How to use a signing service so that the validator is able to perform its duties with the minimum risk of persistent or permanent compromise.
* The benefits of using a hardware security module (HSM) to prevent a private key from being duplicated by a malicious actor.
* The benefits of using a key management system (KMS) over a private network to create distance between the validator node and the keys used in validation.
* The three types of keys involved: the Tendermint consensus key, the validator operator application key, and the delegator application key.
* The difference between "hot" and "cold" keys.
* The importance of addressing the potentially negative eventualities of practical networking.

</HighlightBox>
