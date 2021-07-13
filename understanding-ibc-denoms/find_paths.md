---
parent:
  title: Understanding IBC Denoms with Gaia
order: 1
description: Send tokens with IBC and trace your denom, understand how denoms work.
---

## Find another blockchains path

In chapter 1 you learned how to find the IBC channel, client, and the chain ID of a corresponding blockchain.

It is still an unsolved problem to list all possible blockchain paths.
A database of chain IDs and their nodes is something Cosmos is still working to solve. There are two solutions under development:

- Chain Name Service (decentralized)

  The [CNS](https://github.com/tendermint/cns) is a Cosmos SDK module that the Cosmos Hub will one day run. As a hub through which cross-chain transactions go through, it only makes sense for the Cosmos Hub to host the critical information on how to reach the other chain IDs. The problem is that CNS is new and still under development.

- Semi-automatically updated Github repo (semi-decentralized)

  The [github.com/cosmos/registry](https://github.com/cosmos/registry) repo is a stopgap solution. Each chain ID has a folder describing its genesis and a list of peers. To claim their chain ID, a blockchain operator must fork this repo, create a branch with their chain ID, and submit a pull request to include their chain ID in the official `cosmos/registry` of chain IDs.

  Every chain ID is represented by a folder, and within that foldera `peers.json` file contains a list of nodes that you can connect to.

  The [cosmos-registrar](https://github.com/apeunit/cosmos-registrar) is an an existing tool that was started by Jack Zampolin and further developed by Ape Unit. the cosmos-registrar automates claiming and updating a chain ID. In this case, updating a chain ID means committing a fresh peerlist to the GitHub repository. This commit should be run with a cronjob. Its state is best described as v1.0, so go ahead and report any bugs as Github issues.

## Verifying the Other (source) Blockchain with Cosmos Registry

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

## TL;DR

You can ensure you are talking to the correct chain after you:

1. Look up the IBC client ID and chain ID of the chain that sent you the IBC asset
2. Get the canonical app hashes of particular block heights of the counterparty chain ID from a database like the [Chain Name Service](https://github.com/tendermint/cns) or the [github.com/cosmos/registry](https://github.com/cosmos/registry)
3. Ensure that the consensus state information from IBC light clients on both chains matches what the nodes of both chains say
