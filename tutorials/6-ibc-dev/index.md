---
parent:
title: "Understanding IBC Denoms"
order: 0
description: Send tokens with IBC, trace a denom, and understand how denoms work.
tags:
  - tutorial
  - dev-ops
  - ibc
---

# Understand IBC Denoms

The Interchain vision set out by the original [Cosmos whitepaper](https://v1.cosmos.network/resources/whitepaper) was one of sovereign, application-specific, Proof-of-Stake blockchains. A crucial component of this vision was the **Inter-Blockchain Communication Protocol** or simply **IBC**. With IBC, chains can maintain their sovereignty while still being able to permissionlessly inter-operate with other chains (that also enable IBC), thus paving the way towards an _internet of blockchains_.

_Sounds great, right? But wait, what does that actually mean?_

Well, IBC enables arbitrary message passing between chains (in fact, even more generalized state machines like a [solo machine](https://interchain-io.medium.com/ibc-beyond-light-clients-solo-machine-fb55ba0b0234)), so developers can go ahead and create all sorts of IBC applications that exchange packets of data over IBC to enable application logic.

However, the first and still most dominant example to date is to transfer a (fungible) token from a source chain to a destination chain.

Take this example: you have some ATOM on the Cosmos Hub but would like to swap this for some other token on a DEX (**D**ecentralized **Ex**change) like [Osmosis](https://app.osmosis.zone/). This can be illustrated with a random IBC transfer between the Hub and Osmosis using Mintscan, a popular block explorer.

![IBC token transfer](/tutorials/6-ibc-dev/images/ibc_token.png)

_Sending token from blockchain A to blockchain B_


Take the [following transaction](https://www.mintscan.io/cosmos/txs/F7196B37828BAAF5C55E499D62A58E2927542CB2FB57B587BA77BF5BB044FFBF). There you see some general information about the transaction, as well as data, particularly on the IBC transfer message that was included in the transaction. Dropping sender and receiver you find:

| Key            | Value         |
| -------------- | ------------- |
| Source Channel | channel-141   |
| Port           | transfer      |
| Sequence       | 1,269,133     |
| Amount         | 0.020000 ATOM |
| Origin Amount  | 20,000        |
| Origin Denom   | uatom         |

If you are familiar with the [basics of IBC](/academy/3-ibc/1-what-is-ibc.md), you will know what to make of these terms.

Now, what if you want to send some ATOM back from Osmosis to the Hub? An example would be [this transaction](https://www.mintscan.io/osmosis/txs/9721FE816ABEE87D25259F87BA816EB53651194DD871C3F6B0A5B00434429A80)

| Key            | Value         |
| -------------- | ------------- |
| Source Channel | channel-0     |
| Port           | transfer      |
| Sequence       | 1,265,787     |
| Amount         | 1.850271 ATOM |
| Origin Amount  | 1,850,271     |
| Origin Denom   | ?             |

Now instead of seeing `uatom` in the `Origin Denom` field, you see: `IBC/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2`.

This is what is called an **IBC denom**, and this is the way assets sent over IBC will be represented on-chain.

<HighlightBox type="learning">

In this tutorial you will:

* Look at the context of ICS-20.
* Explain how the IBC denom is derived.
* Learn how to trace back the original denom.
* Find out what chain denoms are coming from.

</HighlightBox>

## ICS-20 - token transfer

<HighlightBox type="info">

Token transfers or ICS-20 is discussed in detail in the [IBC section](/academy/3-ibc/5-token-transfer.md). The "ICS" in ICS-20 is shorthand for _Interchain standards_. In the section, you can find an in-depth look at how IBC enables the transfer of (fungible) tokens across chains. For the purposes of this tutorial, here comes a brief and simplified summary.

</HighlightBox>

Imagine two blockchains, blockchain A and blockchain B. As a starting point, you have some tokens on blockchain A you want to send to blockchain B. You can follow the steps in the image below:

![IBC token transfer](/tutorials/6-ibc-dev/images/ibc_token.png)

_Sending tokens from blockchain A to blockchain B_

When sending the tokens to another blockchain with IBC:

1. A packet commitment is stored on blockchain A and the tokens to be sent are escrowed on chain A (top left of the image).
2. A relayer takes note of the packet to be sent and submits a `MsgRecvPacket` on the destination chain, along with a proof to be verified by the chain A light client on chain B (middle of the image).
3. **With IBC, the value that the tokens represent can be transferred across chains, but the token itself cannot.** Therefore, blockchain B mints its own representative tokens in the form of _voucher_ replacement tokens. These will be characterized by the IBC denoms `IBC/...` (bottom right of the image).

<HighlightBox type="note">

Note that this only considers the _happy path_ where the token transfer is successful and the respective proofs can be verified.

</HighlightBox>

When sending the tokens back with IBC to the source blockchain:

4. Blockchain B sends the voucher tokens back to blockchain A.
5. The `voucher` tokens are destroyed (burned) on blockchain B.
6. The locked tokens on blockchain A are unlocked.

<HighlightBox type="info">

The only way to unlock the locked tokens on blockchain A is to send the `voucher` tokens back from blockchain B. The result is that the voucher tokens on blockchain B are burned. The burn process purposefully takes the vouchers out of circulation.

</HighlightBox>

## How are IBC denoms derived?

IBC is a protocol that allows for permissionless creation of clients, connections, and channels by relayers. Again, refer to the [IBC section](/academy/3-ibc/5-token-transfer.md) for more in-depth information. As explained there, **a consequence of the permissionless creation of clients, connections, and channels is that tokens that have traveled different paths have different security guarantees**. To account for this, the IBC protocol makes sure to prepend the path information to a base denomination when representing the `voucher`s minted on the sink chain when transferring tokens over IBC.

<HighlightBox type="best-practice">

Taking once more the example of Osmosis and the Cosmos Hub, when sending some OSMO from Osmosis to the Hub the `channelEnd` on the Hub side is characterized by:

```go
channelEnd{
  ...
  counterpartyChannelIdentifier: 'channel-141',
  counterpartyPortIdentifier: 'transfer'
  ...
}
```

This is prepended according to the format:
`{portID}/{channelID}/base_denom`

In this particular example: `transfer/channel-141/uosmo`.

</HighlightBox>

This representation of an IBC asset (where the path information is prepended to the base denomination the asset is representing) is a valid representation of the asset and can be found on some user interfaces. However, it is not quite the previously cited IBC denom `IBC/...`.

In fact, there is one more step required to arrive at the IBC denom. You take the hash of the `base_denom` prepended with the path information, using the SHA256 hashing function. This gives the following for the IBC denom:

```go
// hash() representing a SHA256 hashing function returning a string
ibc_denom := 'ibc/' + hash('path' + 'base_denom')
```

<HighlightBox type="best-practice">

In the example from earlier, with `transfer/channel-141/uosmo`, the corresponding IBC denom is: `ibc/14F9BC3E44B8A9C1BE1FB08980FAB87034C9905EF17CF2F5008FC085218811CC`.
<br/><br/>
Note that the assets transferred over IBC are stored on-chain as IBC denoms. It is however up to developers of frontends and user interfaces to decide whether they will use the human-readable form instead to fit their UX needs.

</HighlightBox>

It is possible to use a query to find the hash based on the path information of the IBC asset, as will be described; however, you can always calculate it using a [SHA256 hash generator](https://xorbin.com/tools/sha256-hash-calculator) as well.

<HighlightBox type="info">

**So...why use a hash?**

Hashing functions have many desirable properties that make them often used in cryptography. The property most useful in this discussion is that the hashed output is always reduced to a fixed length (256 bits in the case of SHA256), no matter the length of the input.
<br/><br/>
Consider the following:

* The hash could contain paths that track the token on multiple hops from chain to chain.
* This could potentially be unbearably long when directly printing the path.
* The Cosmos SDK has a 64-character limit on the denomination of the token.

This is why a hash was preferred. More information on the design decisions can be found [here](https://ibc.cosmos.network/main/architecture/adr-001-coin-source-tracing.html).

</HighlightBox>

The trade-off when using a hash is that you cannot compute the input given the output (hashing is an irreversible operation). Therefore, the ICS-20 module keeps a mapping of IBC denominations it has encountered in order to look up the original `path` and `base_denom`. Therefore, you are required to query a node to find out what the actual path and denomination are. This query is called the _denomtrace_.

<HighlightBox type="docs">

With IBC denoms, there is a special meaning for the `/` character. It is used to parse port and channel identifiers from the base denom. Hence it was initially forbidden to use forward slashes in the base denomination of tokens.
<br/><br/>
However, due to a requirement from the Evmos chain (which uses forward slashes in contract-based denoms), support for base denominations containing `/` has been added. For more information, check the [ibc-go documentation](https://ibc.cosmos.network/main/migrations/support-denoms-with-slashes.html).

</HighlightBox>

## Practical example: `denom_trace`

You can distinguish two cases of interacting with IBC denoms:

1. Calculating the IBC denom for a given path.
2. Tracing the path information and base denom when encountering an IBC denom.

The `transfer` IBC module exposes queries for both of these cases. In order to query, you will have to interact with a node of the blockchain network.

These queries are:

```sh
1. $ <binary> query ibc-transfer denom-hash [trace] [flags]
2. $ <binary> query ibc-transfer denom-trace [hash] [flags]
```

This tutorial uses the `gaiad` binary from the Cosmos Hub, continuing with the previous example where some OSMO is transferred from Osmosis to the Hub.

<HighlightBox type="note">

Despite using `gaiad` as an example here, you should use the chain binary of _the chain where the asset you are interested in is present_. The `transfer` IBC module needs to look up the mapping it stores when querying _denom_trace_.

</HighlightBox>

Install the Gaia binary:

```sh
$ git clone https://github.com/cosmos/gaia.git
$ cd gaia
$ git checkout v7.0.0
$ make install

$ gaiad version
```

The output of `gaiad version` should print:

```
v7.0.0
```

Follow along with the `gaiad` subcommands to query the denom and learn about the channel the tokens came from:

```sh
$ gaiad query ibc-transfer denom-trace 14F9BC3E44B8A9C1BE1FB08980FAB87034C9905EF17CF2F5008FC085218811CC --node https://rpc.cosmos.network:443
```

Response:

```
denom_trace:
  base_denom: uosmo
  path: transfer/channel-141
```

From the terminal output, you now know that there is an IBC port `transfer` and channel `channel-141` that corresponds to the IBC connection between the Hub and Osmosis. To learn the IBC light client behind the port and channel, you need to perform another query.

<HighlightBox type="info">

How do light clients get their name? These are on-chain clients that only keep track of the block hashes of a _counterparty_ chain. This allows the chain to create a trustless connection over IBC _without the client duplicating the counterparty chain in full_, making such clients "light" rather than "heavy".

</HighlightBox>

The `ibc channel client-state transfer` query lists the client details for a specified path:

```sh
$ gaiad query ibc channel client-state transfer channel-141 --node https://rpc.cosmos.network:443
```

Click the expansion panel to see the detailed response:

<ExpansionPanel title="Response">

```yml
client_id: 07-tendermint-259
client_state:
  "@type": /ibc.lightclients.tendermint.v1.ClientState
  allow_update_after_expiry: true
  allow_update_after_misbehaviour: true
  chain_id: osmosis-1
  frozen_height:
    revision_height: "0"
    revision_number: "0"
  latest_height:
    revision_height: "5901208"
    revision_number: "1"
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
  trusting_period: 1206000s
  unbonding_period: 1209600s
  upgrade_path:
    - upgrade
    - upgradedIBCState
```

</ExpansionPanel>

<HighlightBox type="docs">

This tutorial only discusses a `denom_trace` of a single _hop_. For information on multiple hops and the consequences for frontend services, refer to the [ibc-go docs](https://ibc.cosmos.network/main/apps/transfer/overview.html#multiple-hops).

</HighlightBox>

That is a lot of information, but it does not answer the question: _how do you know if this IBC client can be relied upon?_

### The chain ID and the client ID

Take a minute to consider this question: _how would you identify a chain?_

An initial response might be the **chain ID**. After all, this is literally the chain identifier. However, the chain ID is **not** a unique identifier. Anybody can start a chain with the same chain ID, so this is not a good parameter by which to verify the identity of the chain you want to connect with.

However, the IBC client ID is generated by the [Cosmos SDK IBC Keeper module](https://github.com/cosmos/ibc-go/blob/e012a4af5614f8774bcb595962012455667db2cf/modules/core/02-client/keeper/keeper.go#L56) (ICS-02 does not specify a standard for IBC client IDs). **This means that in the eyes of IBC, a chain is identified by virtue of the `client_id`.**

A type of _Chain Name Service_ can verify the combination of the chain ID and the client ID. There are a few options that are being used at the moment or in development:

* **Chain Name Service (on-chain, decentralized):**

  The [CNS](https://github.com/tendermint/cns) aims to be a Cosmos SDK module that the Cosmos Hub will one day run. As a hub through which cross-chain transactions go, it only makes sense for the Cosmos Hub to host critical information on how to reach other chain IDs. CNS is currently under development, with more information to follow.

* **Chain Registry (off-chain, semi-decentralized):**

  The [chain registry](https://github.com/cosmos/chain-registry) repo is a stopgap solution. Each chain ID has a folder describing its genesis and a list of peers. To claim their chain ID, a blockchain operator must fork the `registry` repo, create a branch with their chain ID, and submit a pull request to include their chain ID in the official `cosmos/registry` of chain IDs.

  Every chain ID is represented by a folder, and within that folder, a `peers.json` file contains a list of nodes that you can connect to.

Being able to list all possible blockchain paths is still an unsolved problem. Some ecosystem efforts are already being developed to help bridge this gap. Take for example this [IBC-Cosmos repo by Pulsar](https://github.com/PulsarDefi/IBC-Cosmos): it attempts to aggregate all known IBC denoms on all IBC connected chains. They use the following data schema:

```json
{
    "ibc/HASH__CHAIN": {
        "chain": String,
        "hash": String,
        "supply": String,
        "path": String,
        "origin": {
            "denom": String,
            "chain": String | List[String] | null
            // null if we cannot find this denom on native_token_data.json
            // list if we could not pick correct chain e.g: [terra, terra2] for uluna
        }
    }
}
```

Using this data as a source, one could write an API that allows querying for the path, base denom without querying a node.

A relayer can create a new `channel` from a newly created blockchain (without an established identity) to another blockchain without revealing too much of its information. Storing path information in the IBC denom that you can trace back and checking the associated client from the channel allows us to estimate of the security guarantees of the asset.

### Ensure the IBC client is not expired

Next to verifying the identity of the chain (or rather of the light client), another thing to consider is whether the light client is expired.

Light clients can expire or become _frozen_ if they do not get updated within the `TrustingPeriod`, or when evidence of misbehavior has been submitted. For example, in the event that the Tendermint consensus fails (if more than 1/3 of validators produce a conflicting block, also known as _double signing_), _and_ proof of this consensus failure is submitted on-chain, the IBC client becomes frozen, with a `frozen_height` that is nonzero.

In the previous example, the output of `gaiad query ibc channel client-state` confirms the client status so you know the IBC client is not expired.

<HighlightBox type="docs">

To find out how to recover clients that have become expired through submitting a governance proposal, check out the [ibc-go docs](https://ibc.cosmos.network/main/ibc/proposals.html).

</HighlightBox>

The `latest_height.revision_height` is the block height when the IBC client was last updated. In the previous example, to ensure that the block height is still up to date, you would have to query the blockchain itself for the block height 5901208 (or the latest block height when you perform the query), and ensure that the timestamp of that block + the `trusting_period` of 1209600s/336h/14d is after the current time.

For example, you can verify the IBC client status using the query:

```sh
$ gaiad query block 5901208 --node https://rpc.cosmos.network:443
```

## 🎉Congratulations!🎉

You have made it all the way through this tutorial and will now be unfazed when encountering an IBC denom in the wild!

<HighlightBox type="synopsis">

To summarize, this section has explored:

* The basics of ICS-20 token transfer over IBC.
* How you might encounter the IBC denom notation `ibc/...` containing a hash of the path information when you interact with assets that were transferred over IBC.
* How to derive an IBC denom, or perform a _denomtrace_ query to retrieve the path information and base denom of the asset.
* How to query from the path information to identify chain IDs associated with a light client, making use of the chain registry (and soon CNS). 
* How to reason about the security of an IBC asset based on the path information contained in the IBC denom.

</HighlightBox>

If your interest in IBC has been piqued, go to the IBC introduction and learn the intricacies of the IBC protocol and IBC applications, start [here](/academy/3-ibc/index.md).
