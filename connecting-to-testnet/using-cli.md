---
order: 2
---

# Using the CLI

After building node's binary `gaiad` and initializing the node with `gaiad init`, you can use the binary to interact with the testnet either through a full-node running locally or through public endpoints.

## Create a key pair

```
gaiad keys add alice
```

```
- name: alice
  type: local
  address: cosmos14fgy2tk5szqlt9wrtntzcghjrzsz9y7yq45yt2
  pubkey: cosmospub1addwnpepqd70k907xneur8ucpm8fv5z858rdlvgz77llc3a9tyxpu0ffxwx3v988mnr
  mnemonic: ""
  threshold: 0
  pubkeys: []


**Important** write this mnemonic phrase in a safe place.
It is the only way to recover your account if you ever forget your password.

wave vague strong repeat mango infant suffer busy vault movie rubber crystal found object stuff miracle odor box crystal owner shoe token van alone
```

## Request Tokens from the Faucet

```
curl -X POST -d '{"address": "cosmos14fgy2tk5szqlt9wrtntzcghjrzsz9y7yq45yt2"}' https://faucet.testnet.cosmos.network
```

```
{"transfers":[{"coin":"10000000uphoton","status":"ok"}]}%    
```

## Query the Balance

Using the locally running full-node (make sure your node is started and has finished syncing):

```
gaiad q bank balances cosmos14fgy2tk5szqlt9wrtntzcghjrzsz9y7yq45yt2
```

Using the public RPC endpoint:

```
gaiad q bank balances cosmos14fgy2tk5szqlt9wrtntzcghjrzsz9y7yq45yt2 --node https://rpc.testnet.cosmos.network:443
```

```
balances:
- amount: "10000000"
  denom: uphoton
pagination:
  next_key: null
  total: "0"
```