---
parent:
  title: Understand IBC Denoms with Gaia
order: 0
description: Send tokens with IBC, trace a denom, and understand how denoms work.
---

# Understand IBC Denoms with Gaia

One of the most powerful technologies when using the Cosmos SDK is the Interblockchain Communication Protocol (IBC). In the Cosmos ecosystem, every blockchain is intended to be sovereign and application-specific. With IBC, every blockchain can connect to another blockchain using the IBC protocol. This communication protocol will eventually create a system of sovereign _and_ connected blockchains.

## Introduction

The most used feature of IBC is to send tokens from one blockchain to another. When sending a token to another blockchain, a token `voucher` is generated on the other (target) blockchain.

Imagine two blockchains, blockchain A and blockchain B. In the beginning, you have your token on blockchain A.

![IBC token transfer](/ibc_token.png "IBC token transfer")
*Sending token from blockchain A to blockchain B*

The value that tokens represent can be transferred across chains, but the token itself cannot. When sending the tokens with IBC to another blockchain:

1. - Blockchain A locks the tokens and relays proof to blockchain B
2. - Blockchain B mints its own representative tokens in the form of _voucher_ replacement tokens
3. - Blockchain B sends the voucher tokens back to blockchain A
4. - The voucher tokens are destroyed (burned) on blockchain B
5. - The locked tokens on blockchain A are unlocked

The only way to unlock the locked tokens on blockchain A is to send the voucher token back from blockchain B. The result is that the voucher token on blockchain B is burned. The burn process purposefully takes the tokens out of circulation.

In this tutorial, you learn the format of the voucher token on blockchain B. You learn what information the token voucher includes and what the token voucher looks like, and you learn how to make sense of them. The information of the token is described as an IBC denom. You can parse this IBC denom to receive information about the voucher and learn which blockchain the token voucher came from.

**You will learn how to:**

- Trace the IBC denom
- Understand how denoms work
- Find out which chain the token came from

## Requirements

Install the gaia binary:

```bash
git clone https://github.com/cosmos/gaia.git
cd gaia
git checkout v5.0.0
make install

gaiad version
```

The output of `gaiad version` should print:

```bash
v5.0.0
```

## What Is This IBC Denom

The `voucher` tokens introduced in the asset transfer are called IBC Denominations (IBC denom). The voucher tokens are the result of a token transfer using IBC from one blockchain to another. The format of the voucher token is:

`ibc/DENOMHASH`.

Imagine that you've received a new `ibc/` token on blockchain B where you initially held `samoleans` and `stake` token.

Your balance now looks like:

`1000000ibc/CDC4587874B85BEA4FCEC3CEA5A1195139799A1FEE711A07D972537E18FDA39D,100000000000samoleans,99999977256stake`

Just like `samoleans` or `stake`, `ibc/CDC458787...` is the denomination (denom) of the token received from IBC. After `ibc/CDC458787...` is a hash of the denom, the IBC port, and the channel.

Why is `CDC458787...` a hash? 

- The hash contains paths that track the token on multiple hops from other blockchains to your account. 
- This path could potentially be unbearably long when directly printing the path. 
- The Cosmos SDK has a 64-character limit on the denomination of the token.

The tradeoff of using a hash is that you must query a node to find out what the actual path and denomination is. This query is called the _denomtrace_.

Follow along with the `gaiad` subcommands to query the denom and learn about the channel the tokens came from.

```bash
gaiad query ibc-transfer denom-trace CDC4587874B85BEA4FCEC3CEA5A1195139799A1FEE711A07D972537E18FDA39D --node https://rpc.testnet.cosmos.network:443
```

Response:

```bash
denom_trace:
  base_denom: moon
  path: transfer/channel-14
```

From the command output, you now know that there is an IBC port `transfer` and channel `channel-14`. But to know the IBC light client behind the port and channel, you need to perform another query.

Why is it called a light client? Because it is a light client of the _other_ chain, keeping track of its blockhashes. The `ibc channel client-state transfer` command  explains the details of the denom path.

```bash
gaiad query ibc channel client-state transfer channel-14 --node https://rpc.cosmos.network:443
```

Response:

```bash
client_id: 07-tendermint-18
client_state:
  '@type': /ibc.lightclients.tendermint.v1.ClientState
  allow_update_after_expiry: true
  allow_update_after_misbehaviour: true
  chain_id: mars
  frozen_height:
    revision_height: "0"
    revision_number: "0"
  latest_height:
    revision_height: "2207"
    revision_number: "0"
  max_clock_drift: 600s
  proof_specs:
  - inner_spec:
      child_order:
      - 0
      - 1
      child_size: 33
      empty_child: null
      hash: SHA256
      max_prefix_length: 12
      min_prefix_length: 4
    leaf_spec:
      hash: SHA256
      length: VAR_PROTO
      prefix: AA==
      prehash_key: NO_HASH
      prehash_value: SHA256
    max_depth: 0
    min_depth: 0
  - inner_spec:
      child_order:
      - 0
      - 1
      child_size: 32
      empty_child: null
      hash: SHA256
      max_prefix_length: 1
      min_prefix_length: 1
    leaf_spec:
      hash: SHA256
      length: VAR_PROTO
      prefix: AA==
      prehash_key: NO_HASH
      prehash_value: SHA256
    max_depth: 0
    min_depth: 0
  trust_level:
    denominator: "3"
    numerator: "1"
  trusting_period: 1209600s
  unbonding_period: 1814400s
  upgrade_path:
  - upgrade
  - upgradedIBCState
```

That's a lot of information, but it doesn't answer the question: how do you know if this IBC client can be relied upon?

### The Chain ID and the Client ID

Anybody can start a chain with the same chain ID. However, the IBC client ID is generated by the [Cosmos SDK IBC Keeper module](https://github.com/cosmos/ibc-go/blob/e012a4af5614f8774bcb595962012455667db2cf/modules/core/02-client/keeper/keeper.go#L56) (ICS-02 does not specify a standard for IBC client IDs). A Chain Name Service and the not-so-decentralized Github chain-registrar repo can verify the combination of the chain ID and the client ID. Both the Chain Name Service and the chain-registrar repo are under development and are considered experimental.

### Ensure the IBC Client Isn't Expired

In the event that Tendermint consensus fails (if >1/3 of validators produce a conflicting block), _and_ proof of this consensus failure is submitted on-chain, the IBC client becomes frozen with a `frozen_height` that is nonzero. In the previous example, the output of `gaiad query ibc channel client-state` confirms the client status and you know the IBC client is not expired. 

The `latest_height.revision_height` is the block height when the IBC client was last updated. To ensure that the block height is still up to date, you would have to query the blockchain itself for the block height 2207, and ensure that the timestamp of that block + the `trusting_period` of 1209600s/336h/14d is after the current time.

For example, you can verify the IBC client status using the query:

```bash
gaiad query block 5200792 --node https://rpc.cosmos.network:443
```

## Find the Path of Another Blockchain

Being able to list all possible blockchain paths is still an unsolved problem.

Any created blockchain can create a new `channel` to another blockchain without revealing too much of its information.

Currently, channels must communicate with each other using a person-to-person protocol to be trustable. This person-to-person communication protocol uses an IBC denom so you can identify which tokens to accept for an app.

One approach to solve this problem is to use a centralized or decentralized database of chain IDs and their nodes.  There are two solutions under development:

- Chain Name Service (decentralized)

  The [CNS](https://github.com/tendermint/cns) aims to be a Cosmos SDK module that the Cosmos Hub will one day run. As a hub through which cross-chain transactions go, it only makes sense for the Cosmos Hub to host the critical information on how to reach the other chain IDs. CNS is still new and under development.

- Cosmos Registry (semi-decentralized)

  The [github.com/cosmos/registry](https://github.com/cosmos/registry) repo is a stopgap solution. Each chain ID has a folder describing its genesis and a list of peers. To claim their chain ID, a blockchain operator must fork the `registry` repo, create a branch with their chain ID, and submit a pull request to include their chain ID in the official `cosmos/registry` of chain IDs.

  Every chain ID is represented by a folder, and within that folder a `peers.json` file contains a list of nodes that you can connect to.

- Cosmos Registrar (semi-decentralized)
  
  The [cosmos-registrar](https://github.com/apeunit/cosmos-registrar) is a tool that was started by Jack Zampolin and further developed by Ape Unit. The cosmos-registrar automates claiming and updating a chain ID. In this case, updating a chain ID means committing a fresh peerlist to the GitHub repository. This commit should be run with a cronjob. Its state is best described as v1.0, so go ahead and report any bugs as Github issues.

Choose the approach that best suits you and your use case.
