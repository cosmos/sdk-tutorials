---
order: 3
---

# Using the CLI

After [building](./building-binary.md) node's binary `gaiad` and initializing the node with `gaiad init`, you can use the binary to interact with the testnet by running a full node locally or through public endpoints.

## Creating a Key Pair

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

```
gaiad keys add bob
```

```
- name: bob
  type: local
  address: cosmos18crmvhzeqt3k3razrqy06rksg3am7c9t522s6l
  pubkey: cosmospub1addwnpepqwm7fgdkmctuaylxvqqknlxmyeclgd7ucamehgz7agd3ur0d2x06cq5xlj9
  mnemonic: ""
  threshold: 0
  pubkeys: []


**Important** write this mnemonic phrase in a safe place.
It is the only way to recover your account if you ever forget your password.

parent attract shuffle cloth oblige split abstract melt party ancient torch grant mind smart engage deal guitar nice sea ability mansion glance mom gas
```

## Requesting Tokens from the Faucet

In your terminal, run the following command:

```
curl -X POST -d '{"address": "cosmos14fgy2tk5szqlt9wrtntzcghjrzsz9y7yq45yt2"}' https://faucet.testnet.cosmos.network
```

When the tokens are sent, you see the following response:

```
{"transfers":[{"coin":"10000000uphoton","status":"ok"}]}
```

After you have received the token, you can query your balance and confirm the tokens have arrived.

## Querying Balances

Use one of these methods to query balances.

To query balances using the locally running full node:

1. Make sure your node is started and has finished syncing.

1. Run this command:

    ```
    gaiad q bank balances $(gaiad keys show alice -a)
    ```

To query balances using a public RPC endpoint:

```
gaiad q bank balances $(gaiad keys show alice -a) --node https://rpc.testnet.cosmos.network:443
```

```
balances:
- amount: "10000000"
  denom: uphoton
pagination:
  next_key: null
  total: "0"
```

## Sending Tokens

To use the CLI to send tokens:

```
gaiad tx bank send $(gaiad keys show alice -a) $(gaiad keys show bob -a) 1000uphoton --from alice --node https://rpc.testnet.cosmos.network:443 --chain-id cosmoshub-testnet
```

Then query the balance:

```
gaiad q bank balances $(gaiad keys show bob -a) --node https://rpc.testnet.cosmos.network:443
```

```
balances:
- amount: "1000"
  denom: uphoton
pagination:
  next_key: null
  total: "0"
```

## Using Gravity DEX CLI 

For Gravity DEX commands, see the [liquidity module client docs](https://github.com/tendermint/liquidity/blob/develop/doc/client.md).