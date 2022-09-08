---
parent:
title: Understand IBC Denoms with Gaia
order: 0
description: Send tokens with IBC, trace a denom, and understand how denoms work.
---

# Understand IBC Denoms

The Interchain vision set out by the original [Cosmos whitepaper](https://v1.cosmos.network/resources/whitepaper) was one of sovereign application-specific proof-of-stake blockchains. A crucial component of this vision, was the **Interblockchain Communication Protocol** or simply **IBC**. With IBC, chains can maintain their sovereignty while still being able to permissionlessly interoperate with other chains (that enable IBC) thus paving the way towards an _Internet of Blockchains_.

_Sounds great, right? But wait, what does that actually mean?_

Well, IBC enables arbitrary message passing between chains (in fact, even more generalized state machines like a [solomachine](https://interchain-io.medium.com/ibc-beyond-light-clients-solo-machine-fb55ba0b0234)), so developers can go ahead and create all sorts of IBC applications that exchange packets of data over IBC to enable application logic.

However, the first and still most dominant example to date, is to transfer a (fungible) token from a source chain to a destination chain.

Take this example: you have some ATOM on the Cosmos Hub but would like like to swap this for some other token on a DEX (**D**ecentralized **EX**change) like [Osmosis](https://app.osmosis.zone/). Let's take a look at one random IBC transfer between the Hub and Osmosis using Mintscan, a popular block explorer.

Take the [following transaction](https://www.mintscan.io/cosmos/txs/F7196B37828BAAF5C55E499D62A58E2927542CB2FB57B587BA77BF5BB044FFBF). There we see some general information about the Transaction as well as data particularly on the IBC transfer message that was included in the transaction. Dropping sender and receiver we find:

| Key            | Value         |
| -------------- | ------------- |
| Source Channel | channel-141   |
| Port           | transfer      |
| Sequence       | 1,269,133     |
| Amount         | 0.020000 ATOM |
| Origin Amount  | 20,000        |
| Origin Denom   | uatom         |

If you're familiar with the [basics of IBC](../../academy/4-ibc/what-is-ibc.md), you'll know what to make of these terms.

Now, what if want to send some ATOM back from Osmosis to the Hub? An example would be [this transaction](https://www.mintscan.io/osmosis/txs/9721FE816ABEE87D25259F87BA816EB53651194DD871C3F6B0A5B00434429A80)

| Key            | Value         |
| -------------- | ------------- |
| Source Channel | channel-0     |
| Port           | transfer      |
| Sequence       | 1,265,787     |
| Amount         | 1.850271 ATOM |
| Origin Amount  | 1,850,271     |
| Origin Denom   | ?             |

Now instead of seeing `uatom` in the `Origin Denom` field, we see: `IBC/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2`.

This is what we call an **IBC denom** and is the way assets sent over IBC will be represented on-chain.

<HighlightBox type="learning">

In this tutorial we'll:

- look at the context of ICS20
- explain how the IBC denom is derived
- learn how to trace back the original denom
- find out what chain denoms are coming from

</HighlightBox>

## ICS20: Token transfer

Token transfer or ICS20 (ICS is shorthand for _Interchain standards_) is discussed in detail in the [IBC section](../../academy/4-ibc/token-transfer.md). We invite you to read more over there for an in-depth look at how IBC enables transfer of (fungible) token across chains. For the purposes of this tutorial, we provide a brief and simplified summary.

Imagine two blockchains, blockchain A and blockchain B. As a starting point, you have some tokens on blockchain A you want to send to blockchain B. You can follow the steps in the image below:

![IBC token transfer](/tutorials/understanding-ibc-denoms/ibc_token.png "IBC token transfer")
_Sending tokens from blockchain A to blockchain B_

When sending the tokens with IBC to another blockchain:

<HighlightBox type="note">

Note that we only consider the _happy path_ where the token transfer is successful and the respective proofs can be verified.
</HighlightBox>

1. A packet commitment is stored on blockchain A and the tokens to be sent are escrowed on chain A (top left of the image)
2. A relayer takes note of the packet to be sent and submits a `MsgRecvPacket` on the destination chain, along with a proof to be verified by the chain A light client on chain B (middle of the image)
3. **With IBC, the value that tokens represent can be transferred across chains, but the token itself cannot.**
   Hence, blockchain B mints its own representative tokens in the form of _voucher_ replacement tokens. They will be characterized by the IBC denoms `IBC/...` (bottom right image)

When sending the tokens back with IBC to the source blockchain:

4. Blockchain B sends the voucher tokens back to blockchain A.
5. The `voucher` tokens are destroyed (burned) on blockchain B.
6. The locked tokens on blockchain A are unlocked.

<HighlightBox type="info">

The only way to unlock the locked tokens on blockchain A is to send the `voucher` token back from blockchain B. The result is that the voucher token on blockchain B is burned. The burn process purposefully takes the vouchers out of circulation.

</HighlightBox>

## How are IBC denoms derived?

IBC is a protocol that allows for permissionless creation of clients, connections and channels by relayers. Again we refer to the [IBC section](../../academy/4-ibc/token-transfer.md) for more in-depth information. As explained there, **a consequence of the permissionless creation of clients (,connections and channels) is that tokens that have traveled different paths, have different security guarantees**. To account for this, the IBC protocol makes sure to prepend the path information to a base denomination when representing the `voucher`s minted on the sink chain when transferring tokens over IBC.

<HighlightBox type="best-practice">

Taking once more the example of Osmosis and the Cosmos Hub. When we send some OSMO from Osmosis to the Hub, the `channelEnd` on the Hub side is characterized by:

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

The representation of an IBC asset where the path information is prepended to the base denomination the asset is representing, is a valid representation of the asset and can be found on some user interfaces. However, it is not quite the previously cited IBC denom `IBC/...`.

In fact, there is one more step to arrive at the IBC denom. We take the hash of the `base_denom` prepended with the path information, using the SHA256 hashing function. This gives us for the IBC denom:

```go
// hash() representing a SHA256 hashing function returning a string
ibc_denom := 'ibc/' + hash('path' + 'base_denom')
```

<HighlightBox type="best-practice">

In the example from earlier, with `transfer/channel-141/uosmo` the corresponding IBC denom is: `ibc/14F9BC3E44B8A9C1BE1FB08980FAB87034C9905EF17CF2F5008FC085218811CC`.

Note that the assets transferred over IBC are stored on-chain as IBC denoms. It is however up to developers of frontends and user interfaces to decide whether they will use the human readable form instead, to fit their UX needs.

</HighlightBox>

In the following paragraph we'll see a query to find the hash based on the path information of the IBC asset, however one can always calcuate it using a [SHA256 hash generator](https://xorbin.com/tools/sha256-hash-calculator) as well.

<HighlightBox type="info">

**So... why use a hash?**

Hashing functions have many desirable properties that make them often used in cryptography, the property most useful in this discussion is that it always reduced to an output of fixed length (256 bits in case of SHA256), no matter the input.

Consider the following:

- The hash could contain paths that track the token on multiple hops from chain to chain.
- This path could potentially be unbearably long when directly printing the path.
- The Cosmos SDK has a 64-character limit on the denomination of the token.

Hence why a hash was preferred, more information on the design decisions can be found [here](https://ibc.cosmos.network/main/architecture/adr-001-coin-source-tracing.html).

</HighlightBox>

The tradeoff of using a hash is that you cannot compute the input, given the output (hashing is an irreversible operation). Therefore the ICS20 module keeps a mapping of IBC denominations it has encountered to look up the orignal `path` and `base_denom`. Hence you are required to query a node to find out what the actual path and denomination is. This query is called the _denomtrace_.

<HighlightBox type="docs">

We see that in IBC denoms, there is a special meaning for the '/' character. We use it to parse port and channel identifiers from the base denom. Hence it was initially forbidden to use forward slashes in the base denomination of tokens.
<br>
However, due to a requirement from the Evmos chain, which uses forward slashes in contract-based denoms, support for base denominations containing '/' has been added. For more information, check the [ibc-go documentation](https://ibc.cosmos.network/main/migrations/support-denoms-with-slashes.html).

</HighlightBox>

## Practical example: `denom_trace`

We can distinguish two cases of interacting with IBC denoms:

1. to calculate the IBC denom for a given path
2. to trace the path information and base denom when encountering an IBC denom

The `transfer` IBC module exposes queries for both of these cases. In order to query, you'll have to interact with a node of a chain.

These queries are:

```sh
1. $ <binary> query ibc-transfer denom-hash [trace] [flags]
2. $ <binary> query ibc-transfer denom-trace [hash] [flags]
```

In this tutorial, we'll be using the `gaiad` binary from the Cosmos Hub, continuing with the example from above where we transfer some OSMO from Osmosis to the Hub.

<HighlightBox type="note">

Note that altough we use `gaiad` as an example here, you should use the chain binary of the chain where the asset you're interested in is present. The `transfer` IBC module needs to look up the mapping it stores when querying _denom_trace_
</HighlightBox>

Install the gaia binary:

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

Follow along with the `gaiad` subcommands to query the denom and learn about the channel the tokens came from.

```sh
$ gaiad query ibc-transfer denom-trace 14F9BC3E44B8A9C1BE1FB08980FAB87034C9905EF17CF2F5008FC085218811CC --node https://rpc.cosmos.network:443
```

Response:

```
denom_trace:
  base_denom: uosmo
  path: transfer/channel-141
```

From the terminal output, you now know that there is an IBC port `transfer` and channel `channel-141` that corresponds to the IBC connection between Hub and Osmosis. But to know the IBC light client behind the port and channel, you need to perform another query.

<HighlightBox type="info">

Why is it called a light client? Because it is a light client of the _counterparty_ chain, keeping track of its blockhashes.

</HighlightBox>

The `ibc channel client-state transfer` query lists the client details for a specified path.

```sh
$ gaiad query ibc channel client-state transfer channel-141 --node https://rpc.cosmos.network:443
```

Click the expansion panel to see the detailed repsonse:

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

That's a lot of information, but it doesn't answer the question: _how do you know if this IBC client can be relied upon?_

<HighlightBox type="docs">

In this tutorial, we've only discussed the `denom_trace` in case of a single _hop_, for more information on multiple hops and the consequences for frontend services we refer to the [ibc-go docs](https://ibc.cosmos.network/main/apps/transfer/overview.html#multiple-hops).

</HighlightBox>

### The Chain ID and the Client ID

Take a minute to consider this question: _how would you identify a chain?_

An initial response might be the **chain ID**. After all, the chain ID is literally the chain identifier. But chain ID is not a unique identifier... . Anybody can start a chain with the same chain ID and so it is not a good parameter to verify the identity of the chain we connect with.

However, the IBC client ID is generated by the [Cosmos SDK IBC Keeper module](https://github.com/cosmos/ibc-go/blob/e012a4af5614f8774bcb595962012455667db2cf/modules/core/02-client/keeper/keeper.go#L56) (ICS02 does not specify a standard for IBC client IDs). **This means that in the eyes of IBC, a chain is identified by virtue of the `client_id`**.

A type of _Chain Name Service_ can verify the combination of the chain ID and the client ID. There are a few options that are being used at the moment, or being developed:

- **Chain Name Service (on-chain, decentralized)**:

  The [CNS](https://github.com/tendermint/cns) aims to be a Cosmos SDK module that the Cosmos Hub will one day run. As a hub through which cross-chain transactions go, it only makes sense for the Cosmos Hub to host the critical information on how to reach the other chain IDs. CNS is currently under development. More information will follow... .

- **Chain Registry (off-chain, semi-decentralized)**:

  The [chain registry](https://github.com/cosmos/chain-registry) repo is a stopgap solution. Each chain ID has a folder describing its genesis and a list of peers. To claim their chain ID, a blockchain operator must fork the `registry` repo, create a branch with their chain ID, and submit a pull request to include their chain ID in the official `cosmos/registry` of chain IDs.

  Every chain ID is represented by a folder, and within that folder a `peers.json` file contains a list of nodes that you can connect to.

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
            // null if we cant find this denom on native_token_data.json
            // list if we couldn't pick correct chain e.g: [terra, terra2] for uluna
        }
    }
}
```

Using this data as source, one could write an API that allows to query for the path, base denom without querying a node.

A relayer can create a new `channel` from a newly created (without an established identity) to another blockchain without revealing too much of its information. Storing path information in the IBC denom that we can trace back and checking the associated client from the channel allows us to make an estimation of the security guarantees of the asset.

### Ensure the IBC Client Isn't Expired

Next to verifying the identity of the chain (or rather light client), another thing to consider is whether the light client is expired.

In the event that Tendermint consensus fails (if >1/3 of validators produce a conflicting block, this is called a _double signing_), _and_ proof of this consensus failure is submitted on-chain, the IBC client becomes frozen with a `frozen_height` that is nonzero. In the previous example, the output of `gaiad query ibc channel client-state` confirms the client status and you know the IBC client is not expired.

<HighlightBox type="docs">

To find out how to recover clients that have become expired through submitting a governance proposal, check out the [ibc-go docs](https://ibc.cosmos.network/main/ibc/proposals.html).

</HighlightBox>

The `latest_height.revision_height` is the block height when the IBC client was last updated. To ensure that the block height is still up to date, you would have to query the blockchain itself for the block height 5901208 (or the latest block height when you perform the query), and ensure that the timestamp of that block + the `trusting_period` of 1209600s/336h/14d is after the current time.

For example, you can verify the IBC client status using the query:

```sh
$ gaiad query block 5901208 --node https://rpc.cosmos.network:443
```

## 🎉Congratulations🎉

You've made it all the way through and will now be unfazed when encountering and IBC denom in the wild.

These are some things to take away from this tutorial:

<HighlightBox type="remember">

- You understand the basics of ICS20 token transfer over IBC
- When you interact with assets that were transferred over IBC, you might encounter the IBC denom notation `ibc/...` containing a hash of the path information.
- You can derive an IBC denom or know how to perform a _denomtrace_ query to retrieve the path information and base denom of the asset.
- You know about the chain registry (and soon CNS) to identify chain IDs associated with a light client you can query from the path information.
- You can reason about the security of an IBC asset based on the path information contained in the IBC denom

</HighlightBox>

### Next up

If your interest in IBC was peeked, you can go tot the IBC section of the Developer Portal and learn the intracies of the IBC protocol and IBC applications, starting [here](../../academy/4-ibc/index.md).
