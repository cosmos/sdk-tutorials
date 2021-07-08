---
parent:
  title: Understanding IBC Denoms with Gaia
order: 1
description: Send tokens with IBC and trace your denom, understand how denoms work.
---

## Walkthrough sending with IBC and denom tracing

## Reaching the Other Blockchain

So far you have found the IBC channel, client, and the chain ID of the corresponding blockchain. But you still don't know how to connect to it!

A database of chain IDs and their nodes is something the Cosmos community is still working to solve. There are two solutions under development:

- Chain Name Service (decentralized)

  The [CNS](https://github.com/tendermint/cns) is a Cosmos SDK module that the Cosmos Hub will one day run. As a hub through which cross-chain transactions go through, it only makes sense for the Cosmos Hub to host the critical information on how to reach the other chain IDs. The problem is that CNS is new and still under development.

- Semi-automatically updated Github repo (semi-decentralized)

  The [github.com/cosmos/registry](https://github.com/cosmos/registry) repo is a stopgap solution. Each chain ID has a folder describing its genesis and a list of peers. To claim their chain ID, a blockchain operator must fork this repo, create a branch with their chain ID, and submit a pull request to include their chain ID in the official `cosmos/registry` of chain IDs.

  Every chain ID is represented by a folder, and within that foldera `peers.json` file contains a list of nodes that you can connect to.

  The [cosmos-registrar](https://github.com/apeunit/cosmos-registrar) is an an existing tool that was started by Jack Zampolin and further developed by Ape Unit. the cosmos-registrar automates claiming and updating a chain ID. In this case, updating a chain ID means committing a fresh peerlist to the GitHub repository. This commit should be run with a cronjob. Its state is best described as v1.0, so go ahead and report any bugs as Github issues.

## Verifying the Other (source) Blockchain with the Cosmos Registry

Let's assume you are now connected to a node that belongs to chain B. 

- Chain A has an IBC light client that points to chain B.
- Chain B has an IBC light client that points to chain A.

First, you must verify that the node of 'chain B' is indeed the same 'chain B' that is registered in [github.com/cosmos/registry](https://github.com/cosmos/registry).
Then, you must verify that chain A's IBC light client is pointing to that very same 'chain B'.

Finally, you must verify that chain B's IBC light client is pointing to chain A and that 'chain B' is the same chain B that is mentioned in `github.com/cosmos/registry`.

Check the `light-roots/latest.json` file under each chain ID folder in [cosmos/registry](https://github.com/cosmos/registry). This folder is created when a chain ID is first claimed.

```bash
cat light-roots/latest.json
```

Response

```bash
{
  "trust-height": 70,
  "trust-hash": "78AD39C7DBB0C28AA1DD4DBF909E8FC37522CAB177484871AB3FBD18B2F165B4"
}
```

Connect to one of the peers in `peers.json`. Its block at height 70 should have the hash `78AD39C7DBB0C28AA1DD4DBF909E8FC37522CAB177484871AB3FBD18B2F165B4`.

```bash
curl localhost:26657/commit?height=70
```

Response:

```bash
{
  "jsonrpc": "2.0",
  "id": -1,
  "result": {
    "signed_header": {
      "header": {
        "version": {
          "block": "11"
        },
        "chain_id": "wasmdlocal",
        "height": "70",
        "time": "2021-05-22T17:06:24.945921498Z",
        "last_block_id": {
          "hash": "BFD79481181393C07624680CB2FFCF98FC0CA13A810EAEDAF99EEE117530E2C3",
          "parts": {
            "total": 1,
            "hash": "BF7E0BC1DCC70D6F88522F5E941E8CE0A9F8FFF2623CB346E0DBA8419F13D8CF"
          }
        },
        "last_commit_hash": "0871E3E26E359B8C86E72D205A8A609EA9E369DDEAF348ADC94B1AE1F78E2309",
        "data_hash": "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855",
        "validators_hash": "B27189A358F6D20965B1BC2CF47564EF2A9B5D6A2C0D6CB7BE1F922BE39110E9",
        "next_validators_hash": "B27189A358F6D20965B1BC2CF47564EF2A9B5D6A2C0D6CB7BE1F922BE39110E9",
        "consensus_hash": "048091BC7DDC283F77BFBF91D73C44DA58C3DF8A9CBC867405D8B7F3DAADA22F",
        "app_hash": "2AD963954E56AD5055D66D1D92D19CBEA6FF65A1DF246F13293C5548B6974691",
        "last_results_hash": "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855",
        "evidence_hash": "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855",
        "proposer_address": "2A4AEFBCD5934C1C7D80540822CC978DDE7BBF89"
      },
      "commit": {
        "height": "70",
        "round": 0,
        "block_id": {
          "hash": "78AD39C7DBB0C28AA1DD4DBF909E8FC37522CAB177484871AB3FBD18B2F165B4",
          "parts": {
            "total": 1,
            "hash": "0292B8FC1A1FC2862699AD0CC33AEB5719DC183EA04705C1D4C8F01C0ABAD3E2"
          }
        },
        "signatures": [
          {
            "block_id_flag": 2,
            "validator_address": "2A4AEFBCD5934C1C7D80540822CC978DDE7BBF89",
            "timestamp": "2021-05-22T17:06:29.957359812Z",
            "signature": "RsbFvAANBPXdeGYHwBZsHUeHU/uJzWNWrbQ5UZa1lsUTpKALUPdTTnBwRjvnpbX44z3oH1RefHup+ZPjOf2UDQ=="
          }
        ]
      }
    },
    "canonical": true
  }
```

*Look in particular at the result.commit.block_id.hash property*

As of 25 May 2021, official `gaiad` releases do not output the hashes in the same format so you must compile `gaiad` with `ibc-go` at commit [4570955](https://github.com/cosmos/ibc-go/commit/457095517b7832c42ecf13571fee1e550fec02d0).

IBC won't tell you where to find a node from chain B, but after you've found one, you can get chain B's app hashes at certain block heights and compare them with what the chain B IBC light client on chain A tells you.

Querying chain A's IBC light client for chain B:

```bash
gaiad q ibc client consensus-states 07-tendermint-0 --node tcp://localhost:27000
```

Response:

```bash
consensus_states:
- consensus_state:
    '@type': /ibc.lightclients.tendermint.v1.ConsensusState
    next_validators_hash: A19419B856881CD94A27E0ED7EC6ADAD9FA749C5543D601E39AC6C4FB95CD8E0
    root:
      hash: IbhPNTZYeUYdk3pfZHHWP8VG/gefxGxkkvUuTrmVKkA=
    timestamp: "2021-05-20T13:49:41.169759553Z"
  height:
    revision_height: "906"
    revision_number: "0"
```

Now compare with chain B:

```bash
gaiad q ibc client node-state --node tcp://localhost:27010 --height 906
```

Response:

```bash
next_validators_hash: A19419B856881CD94A27E0ED7EC6ADAD9FA749C5543D601E39AC6C4FB95CD8E0
root:
  hash: IbhPNTZYeUYdk3pfZHHWP8VG/gefxGxkkvUuTrmVKkA=
timestamp: "2021-05-20T13:49:41.169759553Z"
```

## Getting Lower Level: Querying IBC By Using gaiad gRPC Endpoints

So far you learned at a high level what needs to be done. But what is actually going on under the hood? How is `gaiad` getting all that data, and how can you access this data from another SDK or programming language, for example CosmJS?

At a low level, the `gaiad` instance invoked from your shell is contacting another `gaiad` instance that is running a blockchain node using its gRPC endpoint. SDKs make it easier to query these GRPC endpoints, but only the `main` branch of CosmJS provides methods for accessing these IBC queries. These methods are not available on 0.24.1, the latest branch available from the npm software registry.

You may be familiar with `curl` when developing HTTP REST APIs. The equivalent command for gRPC is [grpcurl](https://github.com/fullstorydev/grpcurl/blob/master/README.md). Install `grpcurl` and follow these steps.

### Start Two Chains That Are Connected By Using IBC

Install gaiad v4.2.1:

```bash
git clone git@github.com:cosmos/gaia.git
cd gaia && git checkout v4.2.1
make build && cp build/gaiad $GOPATH/bin/gaiad
```

Use cosmos-sdk v0.42.4:

```bash
cd cosmos-sdk && git checkout v0.42.4 && make proto-all # you need docker
```

Download the relayer, tell it to use gaiad v4.2.1, start two chains.

```bash
git clone https://github.com/iqlusioninc/relayer
cd relayer
nano Makefile
```

Edit the following content

```make
...
SDKCOMMIT := $(shell go list -m -u -f '{{.Version}}' github.com/cosmos/cosmos-s>
GAIA_VERSION := v4.2.1
AKASH_VERSION := v0.10.2
```

Now execute the `two-chainz` script

```bash
./scripts/two-chainz
```

Result

```bash
...
Creating gaiad instance: home=./data | chain-id=ibc-0 | p2p=:26656 | rpc=:26657 | profiling=:6060 | grpc=:9090
Change settings in config.toml file...
Creating gaiad instance: home=./data | chain-id=ibc-1 | p2p=:26556 | rpc=:26557 | profiling=:6061 | grpc=:9091
...
```

The relayer Makefile actually rebuilds gaiad based on the version that was set in the Makefile. This command built the same version as before, just for safety's sake.

Create a shell script called `connect.sh` with this content:

```bash
#!/bin/bash
rly tx link demo -d -o 3s

rly q balance ibc-0
rly q balance ibc-1

rly tx transfer ibc-0 ibc-1 1000000samoleans $(rly chains address ibc-1)
echo "waiting for 2 seconds for the tx to confirm"
sleep 2

rly tx relay-packets demo -d
sleep 2
rly tx relay-acknowledgements demo -d

rly q balance ibc-0
echo "Balance of $(rly chains address ibc-1) on ibc-1:"
rly q balance ibc-1
```

Make the script executable with

```bash
chmod +x connect.sh
```

Now run `connect.sh`:

```bash
./connect.sh
```

Result:

```bash
I[2021-04-23|15:12:33.406] - [ibc-0] -> creating client on ibc-0 for ibc-1 header-height{5} trust-period(336h0m0s)
...
I[2021-04-23|15:12:55.023] ★ Channel created: [ibc-0]chan{channel-0}port{transfer} -> [ibc-1]chan{channel-0}port{transfer}
100000000000samoleans,99999982786stake
100000000000samoleans,99999982081stake
I[2021-04-23|15:12:55.507] ✔ [ibc-0]@{35} - msg(0:transfer) hash(F3729C01856C3FFE52C363DEBB3A5ECBC1453F8DCCD2417EF46A73595BE98A1A)
waiting for 2 seconds for the tx to confirm
I[2021-04-23|15:12:58.081] ✔ [ibc-1]@{30} - msg(0:update_client,1:recv_packet) hash(930A743A0481B40F10E617C5F79D9D45FB0836BE00F7CBF242E449C258B7F7F5)
I[2021-04-23|15:12:58.081] ★ Relayed 1 packets: [ibc-0]port{transfer}->[ibc-1]port{transfer}
I[2021-04-23|15:13:00.627] ✔ [ibc-0]@{40} - msg(0:update_client,1:acknowledge_packet) hash(6D00EA314F3F4B1496491553C56BE901BDFF554CE759D9C61F368B3DF343F50A)
I[2021-04-23|15:13:00.627] ★ Relayed 1 packets: [ibc-1]port{transfer}->[ibc-0]port{transfer}
99999000000samoleans,99999976647stake
Balance of cosmos1957r6c38kc6gy94w0k9t7ear8xdg4j8xvm80xq on ibc-1:
1000000transfer/channel-0/samoleans,100000000000samoleans,99999977240stake
```

From the last line, you can see that `rly` unwraps IBC denomtrace so that you can see the denom is `1000000transfer/channel-0/samoleans`. As you learned in the first section, `gaiad q ibc-transfer denom-trace` also unwraps the denomtrace for you. 

The `gaiad q bank` does not unwrap the denomtrace:

```bash
gaiad q bank balances cosmos1957r6c38kc6gy94w0k9t7ear8xdg4j8xvm80xq --node tcp://localhost:26557
```

Result:

```bash
balances:
- amount: "1000000"
  denom: ibc/27A6394C3F9FF9C9DCF5DFFADF9BB5FE9A37C7E92B006199894CF1824DF9AC7C
- amount: "100000000000"
  denom: samoleans
- amount: "99999977240"
  denom: stake
pagination:
  next_key: null
  total: "0"
```

### Performing the Low Level gRPC Queries Using grpcurl

Now that you have a private IBC testnet setup, you can query the IBC endpoints.

First, the `DenomTraces`.

```bash
grpcurl -plaintext -import-path ./third_party/proto -import-path ./proto \
-proto ./proto/ibc/applications/transfer/v1/query.proto \
localhost:9091 ibc.applications.transfer.v1.Query/DenomTraces
```

Result:

```bash
{
  "denomTraces": [
    {
      "path": "transfer/channel-0",
      "baseDenom": "samoleans"
    }
  ],
  "pagination": {
    "total": "1"
  }
}
```

Then the `ChannelClientState`.

```bash
grpcurl -plaintext -import-path ./third_party/proto -import-path ./proto \
-proto ./proto/ibc/core/channel/v1/query.proto \
-d '{"port_id": "transfer", "channel_id": "channel-0"}' \
localhost:9091 ibc.core.channel.v1.Query/ChannelClientState
```

Result:

```bash
{
  "identifiedClientState": {
    "clientId": "07-tendermint-0",
    "clientState": {
      "@error": "ibc.lightclients.tendermint.v1.ClientState is not recognized; see @value for raw binary message data",
      "@type": "/ibc.lightclients.tendermint.v1.ClientState",
      "@value": "CgVpYmMtMBIECAEQAxoECIDqSSIECIDfbioDCNgEMgA6AhAlQhkKCQgBGAEgASoBABIMCgIAARAhGAQgDDABQhkKCQgBGAEgASoBABIMCgIAARAgGAEgATABSgd1cGdyYWRlShB1cGdyYWRlZElCQ1N0YXRlUAFYAQ=="
    }
  },
  "proofHeight": {
    "revisionNumber": "1",
    "revisionHeight": "751"
  }
}
```

The ClientState is a raw binary blob. In protobuf world, raw binary blob is an `Any` or "any type" that grpcurl cannot parse and results in an error.

However, as you learned from the preceding ClientState querying example, `gaiad` can of course parse the ClientState binary data.

## TL;DR

You can ensure you are talking to the correct chain after you:

1. Look up the IBC client ID and chain ID of the chain that sent you the IBC asset
2. Get the canonical app hashes of particular block heights of the counterparty chain ID from a database like the [Chain Name Service](https://github.com/tendermint/cns) or the [github.com/cosmos/registry](https://github.com/cosmos/registry)
3. Ensure that the consensus state information from IBC light clients on both chains matches what the nodes of both chains say
