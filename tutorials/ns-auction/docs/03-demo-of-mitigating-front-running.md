# Demo of Mitigating Front-Running with Vote Extensions

The purpose of this demo is to test the implementation of the `VoteExtensionHandler` and `PrepareProposalHandler` that we have just added to the codebase. These handlers are designed to mitigate front-running by ensuring that all validators have a consistent view of the mempool when preparing proposals.

In this demo, we are using a 3 validator network. The Beacon validator is special because it has a custom transaction provider enabled. This means that it can potentially manipulate the order of transactions in a proposal to its advantage (i.e., front-running).

1. Bootstrap the validator network: This sets up a network with 3 validators. The script `./scripts/configure.sh "bob.cosmos"` is used to configure the network and the validators.

```shell
cd scripts
configure.sh "bob.cosmos"
```

2. Have alice attempt to reserve `bob.cosmos`: This is a normal transaction that alice wants to execute. The script ``./scripts/reserve.sh "bob.cosmos"` is used to send this transaction.

```shell
bash reserve.sh "bob.cosmos"
```

3. Query to verify the name has been reserved: This is to check the result of the transaction. The script `./scripts/whois.sh "bob.cosmos"` is used to query the state of the blockchain.

```shell
bash whois.sh "bob.cosmos"
```

It should return:

```{
  "name":  {
    "name":  "bob.cosmos",
    "owner":  "cosmos1nq9wuvuju4jdmpmzvxmg8zhhu2ma2y2l2pnu6w",
    "resolve_address":  "cosmos1h6zy2kn9efxtw5z22rc5k9qu7twl70z24kr3ht",
    "amount":  [
      {
        "denom":  "uatom",
        "amount":  "1000"
      }
    ]
  }
}
```

To detect front-running attempts by the beacon, scrutinise the logs during the `ProcessProposal` stage. Open the logs for each validator, including the beacon, `val1`, and `val2`, to observe the following behavior:

```shell
2:47PM ERR ❌️:: Detected invalid proposal bid :: name:"bob.cosmos" resolveAddress:"cosmos1wmuwv38pdur63zw04t0c78r2a8dyt08hf9tpvd" owner:"cosmos1wmuwv38pdur63zw04t0c78r2a8dyt08hf9tpvd" amount:<denom:"uatom" amount:"2000" >  module=server
2:47PM ERR ❌️:: Unable to validate bids in Process Proposal :: <nil> module=server
2:47PM ERR prevote step: state machine rejected a proposed block; this should not happen:the proposer may be misbehaving; prevoting nil err=null height=142 module=consensus round=0
```

4. List the Beacon's keys: This is to verify the addresses of the validators. The script `./scripts/list-beacon-keys.sh` is used to list the keys.

```shell
bash list-beacon-keys.sh
```

We should receive something similar to the following:

```shell
[
  {
    "name": "alice",
    "type": "local",
    "address": "cosmos1h6zy2kn9efxtw5z22rc5k9qu7twl70z24kr3ht",
    "pubkey": "{\"@type\":\"/cosmos.crypto.secp256k1.PubKey\",\"key\":\"A32cvBUkNJz+h2vld4A5BxvU5Rd+HyqpR3aGtvEhlm4C\"}"
  },
  {
    "name": "barbara",
    "type": "local",
    "address": "cosmos1nq9wuvuju4jdmpmzvxmg8zhhu2ma2y2l2pnu6w",
    "pubkey": "{\"@type\":\"/cosmos.crypto.secp256k1.PubKey\",\"key\":\"Ag9PFsNyTQPoJdbyCWia5rZH9CrvSrjMsk7Oz4L3rXQ5\"}"
  },
  {
    "name": "beacon-key",
    "type": "local",
    "address": "cosmos1ez9a6x7lz4gvn27zr368muw8jeyas7sv84lfup",
    "pubkey": "{\"@type\":\"/cosmos.crypto.secp256k1.PubKey\",\"key\":\"AlzJZMWyN7lass710TnAhyuFKAFIaANJyw5ad5P2kpcH\"}"
  },
  {
    "name": "cindy",
    "type": "local",
    "address": "cosmos1m5j6za9w4qc2c5ljzxmm2v7a63mhjeag34pa3g",
    "pubkey": "{\"@type\":\"/cosmos.crypto.secp256k1.PubKey\",\"key\":\"A6F1/3yot5OpyXoSkBbkyl+3rqBkxzRVSJfvSpm/AvW5\"}"
  }
]
```

This allows us to match up the addresses and see that the bid was not front run by the beacon due as the resolve address is Alice's address and not the beacons address.

By running this demo, we can verify that the `VoteExtensionHandler` and `PrepareProposalHandler` are working as expected and that they are able to prevent front-running.
