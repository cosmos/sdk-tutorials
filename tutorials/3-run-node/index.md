---
parent:
  title: Run a Node, API, and CLI
  description: Interact with a Cosmos SDK chain through simapp
  number: 3
order: 0
title:
tags:
  - tutorial
  - dev-ops
  - cosmos-sdk
---

# Run a Node, API, and CLI

<HighlightBox type="synopsis">

In this first section, you will learn how to run a blockchain and discover how to interact with it.

There are different ways to run a node of a Cosmos blockchain. You will explore how to do so using [`simapp`](https://github.com/cosmos/cosmos-sdk/tree/master/simapp).

</HighlightBox>

Before you start working with `simapp`, take a look at what you are going to do:

<YoutubePlayer videoId="wNUjkp2PFQI"/>

## Compile `simapp`

The Cosmos SDK repository contains a folder called [`simapp`](https://github.com/cosmos/cosmos-sdk/blob/master/simapp/). In this folder you can find the code to run a simulated version of the Cosmos SDK, so you can test commands without actually interacting with your chain. The binary is called `simd` and you will be using it to interact with your node.

First, create and change the directory into a `cosmos` folder, and then clone the `cosmos-sdk` repo into that folder:

```sh
$ mkdir cosmos
$ cd cosmos
$ git clone https://github.com/cosmos/cosmos-sdk
$ cd cosmos-sdk
```

Make sure you are using the same version used at the time of writing:

```sh
$ git checkout v0.45.4
```

Now build `cosmos-sdk`. If you use Docker, with the help of a ready-made [multi-stage creation](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/Dockerfile#L37) you create a new Docker image that contains the compiled `simd`:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ make build
```

The build takes a few minutes and creates a `build` folder and a `simapp` binary named `simd`.

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker build . -t simd:v0.45.4
```

</CodeGroupItem>

</CodeGroup>

Confirm that you got what you expected:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd version
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it simd:v0.45.4 simd version
```

</CodeGroupItem>

</CodeGroup>

This should return:

```txt
0.45.4
```

## Initialize `simapp`

To help you ring-fence this exercise, you can use a [Git-ignored](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/.gitignore#L12) subfolder of the repository: `private`.

Run this step not only when the database has already been initialized but even if this is the first time you are testing `simapp`:

```sh
$ rm -rf ./private/.simapp
```

Time to initialize the application. The initialization creates the genesis block and an initial chain state. Pick a chain id, for instance `learning-chain-1`:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd init demo \
    --home ./private/.simapp \
    --chain-id learning-chain-1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd)/private:/root \
    simd:v0.45.4 \
    simd init demo \
    --chain-id learning-chain-1
```

</CodeGroupItem>

</CodeGroup>

Which prints:

```json
{"app_message":{"auth":{"accounts":[],"params":{"max_memo_characters":"256","sig_verify_cost_ed25519":"590","sig_verify_cost_secp256k1":"1000","tx_sig_limit":"7","tx_size_cost_per_byte":"10"}},"authz":{"authorization":[]},"bank":{"balances":[],"denom_metadata":[],"params":{"default_send_enabled":true,"send_enabled":[]},"supply":[]},"capability":{"index":"1","owners":[]},"crisis":{"constant_fee":{"amount":"1000","denom":"stake"}},"distribution":{"delegator_starting_infos":[],"delegator_withdraw_infos":[],"fee_pool":{"community_pool":[]},"outstanding_rewards":[],"params":{"base_proposer_reward":"0.010000000000000000","bonus_proposer_reward":"0.040000000000000000","community_tax":"0.020000000000000000","withdraw_addr_enabled":true},"previous_proposer":"","validator_accumulated_commissions":[],"validator_current_rewards":[],"validator_historical_rewards":[],"validator_slash_events":[]},"evidence":{"evidence":[]},"feegrant":{"allowances":[]},"genutil":{"gen_txs":[]},"gov":{"deposit_params":{"max_deposit_period":"172800s","min_deposit":[{"amount":"10000000","denom":"stake"}]},"deposits":[],"proposals":[],"starting_proposal_id":"1","tally_params":{"quorum":"0.334000000000000000","threshold":"0.500000000000000000","veto_threshold":"0.334000000000000000"},"votes":[],"voting_params":{"voting_period":"172800s"}},"mint":{"minter":{"annual_provisions":"0.000000000000000000","inflation":"0.130000000000000000"},"params":{"blocks_per_year":"6311520","goal_bonded":"0.670000000000000000","inflation_max":"0.200000000000000000","inflation_min":"0.070000000000000000","inflation_rate_change":"0.130000000000000000","mint_denom":"stake"}},"params":null,"slashing":{"missed_blocks":[],"params":{"downtime_jail_duration":"600s","min_signed_per_window":"0.500000000000000000","signed_blocks_window":"100","slash_fraction_double_sign":"0.050000000000000000","slash_fraction_downtime":"0.010000000000000000"},"signing_infos":[]},"staking":{"delegations":[],"exported":false,"last_total_power":"0","last_validator_powers":[],"params":{"bond_denom":"stake","historical_entries":10000,"max_entries":7,"max_validators":100,"unbonding_time":"1814400s"},"redelegations":[],"unbonding_delegations":[],"validators":[]},"upgrade":{},"vesting":{}},"chain_id":"learning-chain-1","gentxs_dir":"","moniker":"demo","node_id":"4f9021a015e696912f452532d53ac849d71cb750"}
```

<ExpansionPanel title="A more readable version">

Here is a more readable version of the same initial chain state:

```json
{
  "app_message": {
    "auth": {
      "accounts": [],
      "params": {
        "max_memo_characters": "256",
        "sig_verify_cost_ed25519": "590",
        "sig_verify_cost_secp256k1": "1000",
        "tx_sig_limit": "7",
        "tx_size_cost_per_byte": "10"
      }
    },
    "authz": {
      "authorization": []
    },
    "bank": {
      "balances": [],
      "denom_metadata": [],
      "params": {
        "default_send_enabled": true,
        "send_enabled": []
      },
      "supply": []
    },
    "capability": {
      "index": "1",
      "owners": []
    },
    "crisis": {
      "constant_fee": {
        "amount": "1000",
        "denom": "stake"
      }
    },
    "distribution": {
      "delegator_starting_infos": [],
      "delegator_withdraw_infos": [],
      "fee_pool": {
        "community_pool": []
      },
      "outstanding_rewards": [],
      "params": {
        "base_proposer_reward": "0.010000000000000000",
        "bonus_proposer_reward": "0.040000000000000000",
        "community_tax": "0.020000000000000000",
        "withdraw_addr_enabled": true
      },
      "previous_proposer": "",
      "validator_accumulated_commissions": [],
      "validator_current_rewards": [],
      "validator_historical_rewards": [],
      "validator_slash_events": []
    },
    "evidence": {
      "evidence": []
    },
    "feegrant": {
      "allowances": []
    },
    "genutil": {
      "gen_txs": []
    },
    "gov": {
      "deposit_params": {
        "max_deposit_period": "172800s",
        "min_deposit": [{
          "amount": "10000000",
          "denom": "stake"
        }]
      },
      "deposits": [],
      "proposals": [],
      "starting_proposal_id": "1",
      "tally_params": {
        "quorum": "0.334000000000000000",
        "threshold": "0.500000000000000000",
        "veto_threshold": "0.334000000000000000"
      },
      "votes": [],
      "voting_params": {
        "voting_period": "172800s"
      }
    },
    "mint": {
      "minter": {
        "annual_provisions": "0.000000000000000000",
        "inflation": "0.130000000000000000"
      },
      "params": {
        "blocks_per_year": "6311520",
        "goal_bonded": "0.670000000000000000",
        "inflation_max": "0.200000000000000000",
        "inflation_min": "0.070000000000000000",
        "inflation_rate_change": "0.130000000000000000",
        "mint_denom": "stake"
      }
    },
    "params": null,
    "slashing": {
      "missed_blocks": [],
      "params": {
        "downtime_jail_duration": "600s",
        "min_signed_per_window": "0.500000000000000000",
        "signed_blocks_window": "100",
        "slash_fraction_double_sign": "0.050000000000000000",
        "slash_fraction_downtime": "0.010000000000000000"
      },
      "signing_infos": []
    },
    "staking": {
      "delegations": [],
      "exported": false,
      "last_total_power": "0",
      "last_validator_powers": [],
      "params": {
        "bond_denom": "stake",
        "historical_entries": 10000,
        "max_entries": 7,
        "max_validators": 100,
        "unbonding_time": "1814400s"
      },
      "redelegations": [],
      "unbonding_delegations": [],
      "validators": []
    },
    "upgrade": {},
    "vesting": {}
  },
  "chain_id": "learning-chain-1",
  "gentxs_dir": "",
  "moniker": "demo",
  "node_id": "4f9021a015e696912f452532d53ac849d71cb750"
}
```

</ExpansionPanel>

It is good practice to append a number, such as `-1`, at the end of a more meaningful chain id, such as `learning-chain`. This allows you to increment this number if and when you introduce a hard-fork to your chain.

You can inspect the initial configuration with:

```sh
$ cat ./private/.simapp/config/genesis.json
```

## Prepare your account

<HighlightBox type="tip">

It helps to understand the concepts clearly when working hands-on with the Cosmos SDK. Need a refresher? See the [section on _Accounts_ in the _Main Concepts_ chapter](/academy/2-cosmos-concepts/2-accounts.md).

</HighlightBox>

You can also inspect your keys. These are held in one of the backend keyrings, which by default is that of the operating system or of the test. To ring-fence them too, and to ensure consistency, you will use the `test` backend and also save them in `./private/.simapp`:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd keys list \
    --home ./private/.simapp \
    --keyring-backend test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd)/private:/root \
    simd:v0.45.4 \
    simd keys list \
    --keyring-backend test
```

</CodeGroupItem>

</CodeGroup>

As you might have expected, you do not have any keys yet:

```json
[]
```

Now you can add a new key:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd keys add alice \
    --home ./private/.simapp \
    --keyring-backend test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd)/private:/root \
    simd:v0.45.4 \
    simd keys add alice \
    --keyring-backend test
```

</CodeGroupItem>

</CodeGroup>

It does not ask for any passphrase, and saves them _in the clear_ in `./private/.simapp/keyring-test`. Remember that these keys are only for testing, so you do not need to worry. When done, this prints something similar to:

```yaml
- name: alice
  type: local
  address: cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A6TrsRO/OH91fAEFLohw7RwFB832NRsRWhQvE2t8cfLK"}'
  mnemonic: ""

**Important:** write this mnemonic phrase in a safe place. It is the only way to recover your account if you ever forget your password.

ivory uniform actual spot floor vessel monster rose yellow noise smile odor veteran human reason miss stadium phrase assault puzzle sentence approve coral apology
```

You can see the mnemonic at the end of the above output. This sequence of words is a mnemonic that you can use to recover your public and private keys. In a production setting, the mnemonic must be stored in a reliable and confidential fashion as part of the key-management infrastructure.

Confirm that the key has been added with:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd keys list \
    --home ./private/.simapp \
    --keyring-backend test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd)/private:/root \
    simd:v0.45.4 \
    simd keys list \
    --keyring-backend test
```

</CodeGroupItem>

</CodeGroup>

You can also confirm that the key has been added with:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd keys show alice \
    --home ./private/.simapp \
    --keyring-backend test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd)/private:/root \
    simd:v0.45.4 \
    simd keys show alice \
    --keyring-backend test
```

</CodeGroupItem>

</CodeGroup>

## Make yourself a proper validator

As previously explained, a Cosmos SDK blockchain relies on identified validators to produce blocks. Initially there is no validator to generate blocks. You are in a catch-22 situation: your initialized and unstarted chain needs a genesis account and a validator for bootstrapping purposes.

You must make your key, also known as an account, have an initial balance in the genesis file. For that, you need to know the staking denomination:

```sh
$ grep bond_denom ./private/.simapp/config/genesis.json
```

This returns:

```txt
"bond_denom": "stake"
```

With this, you can give enough to alice in the genesis:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd add-genesis-account alice 100000000stake \
    --home ./private/.simapp \
    --keyring-backend test
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd)/private:/root \
    simd:v0.45.4 \
    simd add-genesis-account alice 100000000stake \
    --keyring-backend test
```

</CodeGroupItem>

</CodeGroup>

Appended here to the amount is the `stake` suffix. Therefore, this command adds `100000000` `stake` to your account.

Confirm in the genesis file itself that you have an initial balance:

```sh
$ grep -A 10 balances ./private/.simapp/config/genesis.json
```

Despite this initial balance, before you run your blockchain you still need to escape the catch-22 and include your bootstrap transactions in the genesis file.

<HighlightBox type="note">

In this scenario, for your network to even run you must meet the 2/3rds threshold of the weighted validators.
<br/><br/>
Because you will be alone on the network you can stake any number at or above the [minimum enforced](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/types/staking.go#L21-L22), i.e. `1000000stake`. However, to remind yourself that it is important that honest nodes stake a large amount, stake `70000000stake` of the `100000000stake` in the `alice` account you just created. Make sure not to use all of your tokens, so you can still pay for gas and so you don't run out of tokens later.
<br/><br/>
Do not forget to use your own `--chain-id`.

</HighlightBox>

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd gentx alice 70000000stake \
    --home ./private/.simapp \
    --keyring-backend test \
    --chain-id learning-chain-1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd)/private:/root \
    simd:v0.45.4 \
    simd gentx alice 70000000stake \
    --keyring-backend test \
    --chain-id learning-chain-1
```

</CodeGroupItem>

</CodeGroup>

Which confirms the action:

```txt
Genesis transaction written to "/Users/alice/cosmos/cosmos-sdk/private/.simapp/config/gentx/gentx-cf6bff39bb84da39d214138ebba8bcba4ccb848d.json"
```

After you have created this genesis transaction in its own file, collect all the genesis transactions with `collect-gentxs` to include them in your genesis file. Here you have only one anyway:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd collect-gentxs \
    --home ./private/.simapp
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    -v $(pwd)/private:/root \
    simd:v0.45.4 \
    simd collect-gentxs
```

</CodeGroupItem>

</CodeGroup>

This prints the resulting genesis file:

```json
{"app_message":{"auth":{"accounts":[{"@type":"/cosmos.auth.v1beta1.BaseAccount","account_number":"0","address":"cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq","pub_key":null,"sequence":"0"}],"params":{"max_memo_characters":"256","sig_verify_cost_ed25519":"590","sig_verify_cost_secp256k1":"1000","tx_sig_limit":"7","tx_size_cost_per_byte":"10"}},"authz":{"authorization":[]},"bank":{"balances":[{"address":"cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq","coins":[{"amount":"100000000","denom":"stake"}]}],"denom_metadata":[],"params":{"default_send_enabled":true,"send_enabled":[]},"supply":[{"amount":"100000000","denom":"stake"}]},"capability":{"index":"1","owners":[]},"crisis":{"constant_fee":{"amount":"1000","denom":"stake"}},"distribution":{"delegator_starting_infos":[],"delegator_withdraw_infos":[],"fee_pool":{"community_pool":[]},"outstanding_rewards":[],"params":{"base_proposer_reward":"0.010000000000000000","bonus_proposer_reward":"0.040000000000000000","community_tax":"0.020000000000000000","withdraw_addr_enabled":true},"previous_proposer":"","validator_accumulated_commissions":[],"validator_current_rewards":[],"validator_historical_rewards":[],"validator_slash_events":[]},"evidence":{"evidence":[]},"feegrant":{"allowances":[]},"genutil":{"gen_txs":[{"auth_info":{"fee":{"amount":[],"gas_limit":"200000","granter":"","payer":""},"signer_infos":[{"mode_info":{"single":{"mode":"SIGN_MODE_DIRECT"}},"public_key":{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A6TrsRO/OH91fAEFLohw7RwFB832NRsRWhQvE2t8cfLK"},"sequence":"0"}],"tip":null},"body":{"extension_options":[],"memo":"cf6bff39bb84da39d214138ebba8bcba4ccb848d@192.168.1.7:26656","messages":[{"@type":"/cosmos.staking.v1beta1.MsgCreateValidator","commission":{"max_change_rate":"0.010000000000000000","max_rate":"0.200000000000000000","rate":"0.100000000000000000"},"delegator_address":"cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq","description":{"details":"","identity":"","moniker":"demo","security_contact":"","website":""},"min_self_delegation":"1","pubkey":{"@type":"/cosmos.crypto.ed25519.PubKey","key":"0wnjKoRtWjv9NOLEPS6UrlwFurQAmsJIXFsmhtbigF8="},"validator_address":"cosmosvaloper1nw793j9xvdzl2uc9ly8fas5tcfwfetera4euvn","value":{"amount":"70000000","denom":"stake"}}],"non_critical_extension_options":[],"timeout_height":"0"},"signatures":["NA23q62Vhfm1z3E1XafPeSDEVDkcPuTWXZmQr9QAZuN5wY2V6UFSRBO0w8Z255OxxZV4j47SJo1HOYWvcH4qvw=="]}]},"gov":{"deposit_params":{"max_deposit_period":"172800s","min_deposit":[{"amount":"10000000","denom":"stake"}]},"deposits":[],"proposals":[],"starting_proposal_id":"1","tally_params":{"quorum":"0.334000000000000000","threshold":"0.500000000000000000","veto_threshold":"0.334000000000000000"},"votes":[],"voting_params":{"voting_period":"172800s"}},"mint":{"minter":{"annual_provisions":"0.000000000000000000","inflation":"0.130000000000000000"},"params":{"blocks_per_year":"6311520","goal_bonded":"0.670000000000000000","inflation_max":"0.200000000000000000","inflation_min":"0.070000000000000000","inflation_rate_change":"0.130000000000000000","mint_denom":"stake"}},"params":null,"slashing":{"missed_blocks":[],"params":{"downtime_jail_duration":"600s","min_signed_per_window":"0.500000000000000000","signed_blocks_window":"100","slash_fraction_double_sign":"0.050000000000000000","slash_fraction_downtime":"0.010000000000000000"},"signing_infos":[]},"staking":{"delegations":[],"exported":false,"last_total_power":"0","last_validator_powers":[],"params":{"bond_denom":"stake","historical_entries":10000,"max_entries":7,"max_validators":100,"unbonding_time":"1814400s"},"redelegations":[],"unbonding_delegations":[],"validators":[]},"upgrade":{},"vesting":{}},"chain_id":"learning-chain-1","gentxs_dir":"/Users/muratoener/.simapp/config/gentx","moniker":"demo","node_id":"cf6bff39bb84da39d214138ebba8bcba4ccb848d"}
```

If you are curious, you can find the updated `gen_txs` field in your genesis.

## Create blocks

Now you can start your single-node blockchain:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd start \
    --home ./private/.simapp
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker run --rm -it \
    --name simd \
    -v $(pwd)/private:/root \
    simd:v0.45.4 \
    simd start
```

Note that here you name the container `simd` so as to connect to it easily later.

</CodeGroupItem>

</CodeGroup>

You can see blocks being produced and validated in the terminal window where you ran the command:

```txt
6:23PM INF starting ABCI with Tendermint
6:23PM INF Starting multiAppConn service impl=multiAppConn module=proxy
6:23PM INF Starting localClient service connection=query impl=localClient module=abci-client
6:23PM INF Starting localClient service connection=snapshot impl=localClient module=abci-client
6:23PM INF Starting localClient service connection=mempool impl=localClient module=abci-client
6:23PM INF Starting localClient service connection=consensus impl=localClient module=abci-client
```

Open a new terminal in the same folder to check balances. First extract `alice`'s address value:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ export alice=$(./build/simd keys show alice --address \
    --home ./private/.simapp \
    --keyring-backend test)
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ export alice=$(docker run --rm \
    -v $(pwd)/private:/root \
    simd:v0.45.4 simd keys show alice --address \
    --keyring-backend test)
```

</CodeGroupItem>

</CodeGroup>

Then check her balance:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd query bank balances $alice
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec simd simd query bank balances $alice
```

</CodeGroupItem>

</CodeGroup>

Which prints:

```yaml
balances:
- amount: "30000000"
  denom: stake
pagination:
  next_key: null
  total: "0"
```

## Send a transaction

Practice sending a transaction. You can send tokens to any valid address. For instance, you can send tokens to an address whose private key you do not know. Head to [Mintscan for the Cosmos Hub](https://www.mintscan.io/cosmos), and pick a `cosmos1...` address from one of the latest transactions. For instance:

```sh
$ export bob=cosmos1ytt4z085fwxwnj0xdckk43ek4c9znuy00cghtq
```

Before sending any tokens confirm that the balance of the new account is absent:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd query bank balances $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec simd simd query bank balances $bob
```

</CodeGroupItem>

</CodeGroup>

Which returns:

```yaml
balances: []
pagination:
  next_key: null
  total: "0"
```

This account does not have a balance. Indeed, although you picked the address from the Cosmos Hub, and therefore `bob` has a balance on the Cosmos Hub, it does not yet exist on your local learning blockchain.

You need to send a transaction to change this _new_ account's balance:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd tx bank send $alice $bob 10stake \
    --home ./private/.simapp \
    --keyring-backend test \
    --chain-id learning-chain-1
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec -it simd simd tx bank send $alice $bob 10stake \
    --keyring-backend test \
    --chain-id learning-chain-1
```

</CodeGroupItem>

</CodeGroup>

You should be prompted to confirm the transaction before signing and broadcasting:

```txt
{"body":{"messages":[{"@type":"/cosmos.bank.v1beta1.MsgSend","from_address":"cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq","to_address":"cosmos1m95dh3uc2s7fkn4w6v3ueux3sya96dhdudwa24","amount":[{"denom":"stake","amount":"10"}]}],"memo":"","timeout_height":"0","extension_options":[],"non_critical_extension_options":[]},"auth_info":{"signer_infos":[],"fee":{"amount":[],"gas_limit":"200000","payer":"","granter":""},"tip":null},"signatures":[]}

confirm transaction before signing and broadcasting [y/N]: y
code: 0
codespace: ""
data: ""
gas_used: "0"
gas_wanted: "0"
height: "0"
info: ""
logs: []
raw_log: ""
timestamp: ""
tx: null
txhash: D2CCFD91452F8C144BB1E7B54B9723EE3ED85925EE2C8AD843392721D072B895
```

The command output could include useful information, such as `gas_used`. However, here it did not have time to collect the information because the command returned before the transaction was included in a block. Take note of the transaction hash. In the above example, it is:

```sh
$ export txhash=D2CCFD91452F8C144BB1E7B54B9723EE3ED85925EE2C8AD843392721D072B895
```

You can replace with your own value.

Whenever you need it, you can call back the transaction information using this transaction hash:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd query tx $txhash
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec simd simd query tx $txhash
```

</CodeGroupItem>

</CodeGroup>

<ExpansionPanel title="This returns something like this">

```yaml
code: 0
codespace: ""
data: 0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64
events:
- attributes:
  - index: true
    key: ZmVl
    value: null
  type: tx
- attributes:
  - index: true
    key: YWNjX3NlcQ==
    value: Y29zbW9zMXFxeWo3eXN2eWhrMG5hemF1Z2dwcTlxbmtxZGZnN2Y4eDAwNHJ4LzE=
  type: tx
- attributes:
  - index: true
    key: c2lnbmF0dXJl
    value: b2ZnWlRhOEJPZWRtSW1sc25Hc3FtaHphbDMrNS85RVBFQmdLeVZKaUVZcGlWRThOT2dYbXJYVkZUUEhjVWhpWDVBcEdBWDVyUFRjNWY4ZG1md2diVnc9PQ==
  type: tx
- attributes:
  - index: true
    key: YWN0aW9u
    value: L2Nvc21vcy5iYW5rLnYxYmV0YTEuTXNnU2VuZA==
  type: message
- attributes:
  - index: true
    key: c3BlbmRlcg==
    value: Y29zbW9zMXFxeWo3eXN2eWhrMG5hemF1Z2dwcTlxbmtxZGZnN2Y4eDAwNHJ4
  - index: true
    key: YW1vdW50
    value: MTBzdGFrZQ==
  type: coin_spent
- attributes:
  - index: true
    key: cmVjZWl2ZXI=
    value: Y29zbW9zMXl0dDR6MDg1Znd4d25qMHhkY2trNDNlazRjOXpudXkwMGNnaHRx
  - index: true
    key: YW1vdW50
    value: MTBzdGFrZQ==
  type: coin_received
- attributes:
  - index: true
    key: cmVjaXBpZW50
    value: Y29zbW9zMXl0dDR6MDg1Znd4d25qMHhkY2trNDNlazRjOXpudXkwMGNnaHRx
  - index: true
    key: c2VuZGVy
    value: Y29zbW9zMXFxeWo3eXN2eWhrMG5hemF1Z2dwcTlxbmtxZGZnN2Y4eDAwNHJ4
  - index: true
    key: YW1vdW50
    value: MTBzdGFrZQ==
  type: transfer
- attributes:
  - index: true
    key: c2VuZGVy
    value: Y29zbW9zMXFxeWo3eXN2eWhrMG5hemF1Z2dwcTlxbmtxZGZnN2Y4eDAwNHJ4
  type: message
- attributes:
  - index: true
    key: bW9kdWxl
    value: YmFuaw==
  type: message
gas_used: "62843"
gas_wanted: "200000"
height: "147"
info: ""
logs:
- events:
  - attributes:
    - key: receiver
      value: cosmos1ytt4z085fwxwnj0xdckk43ek4c9znuy00cghtq
    - key: amount
      value: 10stake
    type: coin_received
  - attributes:
    - key: spender
      value: cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq
    - key: amount
      value: 10stake
    type: coin_spent
  - attributes:
    - key: action
      value: /cosmos.bank.v1beta1.MsgSend
    - key: sender
      value: cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq
    - key: module
      value: bank
    type: message
  - attributes:
    - key: recipient
      value: cosmos1ytt4z085fwxwnj0xdckk43ek4c9znuy00cghtq
    - key: sender
      value: cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq
    - key: amount
      value: 10stake
    type: transfer
  log: ""
  msg_index: 0
raw_log: '[{"events":[{"type":"coin_received","attributes":[{"key":"receiver","value":"cosmos1ytt4z085fwxwnj0xdckk43ek4c9znuy00cghtq"},{"key":"amount","value":"10stake"}]},{"type":"coin_spent","attributes":[{"key":"spender","value":"cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq"},{"key":"amount","value":"10stake"}]},{"type":"message","attributes":[{"key":"action","value":"/cosmos.bank.v1beta1.MsgSend"},{"key":"sender","value":"cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq"},{"key":"module","value":"bank"}]},{"type":"transfer","attributes":[{"key":"recipient","value":"cosmos1ytt4z085fwxwnj0xdckk43ek4c9znuy00cghtq"},{"key":"sender","value":"cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq"},{"key":"amount","value":"10stake"}]}]}]'
timestamp: "2023-03-21T14:08:37Z"
tx:
  '@type': /cosmos.tx.v1beta1.Tx
  auth_info:
    fee:
      amount: []
      gas_limit: "200000"
      granter: ""
      payer: ""
    signer_infos:
    - mode_info:
        single:
          mode: SIGN_MODE_DIRECT
      public_key:
        '@type': /cosmos.crypto.secp256k1.PubKey
        key: AqgcX2J+bffZ35LD55j/cY0GmGlg6H31eg9ZzrTJsR0x
      sequence: "1"
  body:
    extension_options: []
    memo: ""
    messages:
    - '@type': /cosmos.bank.v1beta1.MsgSend
      amount:
      - amount: "10"
        denom: stake
      from_address: cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq
      to_address: cosmos1ytt4z085fwxwnj0xdckk43ek4c9znuy00cghtq
    non_critical_extension_options: []
    timeout_height: "0"
  signatures:
  - ofgZTa8BOedmImlsnGsqmhzal3+5/9EPEBgKyVJiEYpiVE8NOgXmrXVFTPHcUhiX5ApGAX5rPTc5f8dmfwgbVw==
txhash: D2CCFD91452F8C144BB1E7B54B9723EE3ED85925EE2C8AD843392721D072B895
```

</ExpansionPanel>

Now check the balance of the student account again:

<CodeGroup>

<CodeGroupItem title="Local">

```sh
$ ./build/simd query bank balances $bob
```

</CodeGroupItem>

<CodeGroupItem title="Docker">

```sh
$ docker exec simd simd query bank balances $bob
```

</CodeGroupItem>

</CodeGroup>

Which prints:

```yaml
balances:
- amount: "10"
  denom: stake
pagination:
  next_key: null
  total: "0"
```

That is a `10` stake, as expected.

## CLI routing

Now it is time for a bit of Go code. How does the `simd` interact via the command-line interface? Inspect the `cosmos-sdk/simapp/simd/main.go` file:

```go [https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/simd/main.go]
package main

import (
  "os"

  "github.com/cosmos/cosmos-sdk/server"
  svrcmd "github.com/cosmos/cosmos-sdk/server/cmd"
  "github.com/cosmos/cosmos-sdk/simapp"
  "github.com/cosmos/cosmos-sdk/simapp/simd/cmd"
)

func main() {
  rootCmd, _ := cmd.NewRootCmd()

  if err := svrcmd.Execute(rootCmd, simapp.DefaultNodeHome); err != nil {
    switch e := err.(type) {
    case server.ErrorCode:
      os.Exit(e.Code)

    default:
      os.Exit(1)
    }
  }
}
```

The [`cmd.NewRootCmd()`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/simd/main.go#L13) function is the CLI handler. It is imported via the [`"github.com/cosmos/cosmos-sdk/simapp/simd/cmd"`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/simd/main.go#L9) line. It can be found in the `cosmos-sdk/simapp/simd/cmd/root.go` file:

```go [https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/simd/cmd/root.go#L39]
func NewRootCmd() (*cobra.Command, params.EncodingConfig)
```

In it, basic properties such as the application name are defined:

```go [https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/simd/cmd/root.go#L51-L53]
rootCmd := &cobra.Command{
    Use:   "simd",
    Short: "simulation app",
```

In addition, observe that Cobra is imported and used for the CLI to redirect:

```go [https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/simd/cmd/root.go#L144-L155]
rootCmd.AddCommand(
    genutilcli.InitCmd(simapp.ModuleBasics, simapp.DefaultNodeHome),
    genutilcli.CollectGenTxsCmd(banktypes.GenesisBalancesIterator{}, simapp.DefaultNodeHome),
    genutilcli.MigrateGenesisCmd(),
    genutilcli.GenTxCmd(simapp.ModuleBasics, encodingConfig.TxConfig, banktypes.GenesisBalancesIterator{}, simapp.DefaultNodeHome),
    genutilcli.ValidateGenesisCmd(simapp.ModuleBasics),
    AddGenesisAccountCmd(simapp.DefaultNodeHome),
    tmcli.NewCompletionCmd(rootCmd, true),
    testnetCmd(simapp.ModuleBasics, banktypes.GenesisBalancesIterator{}),
    debug.Cmd(),
    config.Cmd(),
)
```

Also, look at [`simapp/app.go`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/app.go), in which each module and key keeper will be imported. The first thing you will see is a considerable list of modules that are used by most Cosmos-sdk applications:

```go [https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/simapp/app.go#L32-L49]
...
  "github.com/cosmos/cosmos-sdk/x/auth"
  "github.com/cosmos/cosmos-sdk/x/auth/ante"
  authrest "github.com/cosmos/cosmos-sdk/x/auth/client/rest"
  authkeeper "github.com/cosmos/cosmos-sdk/x/auth/keeper"
  authsims "github.com/cosmos/cosmos-sdk/x/auth/simulation"
  authtx "github.com/cosmos/cosmos-sdk/x/auth/tx"
  authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"
  "github.com/cosmos/cosmos-sdk/x/auth/vesting"
  vestingtypes "github.com/cosmos/cosmos-sdk/x/auth/vesting/types"
  "github.com/cosmos/cosmos-sdk/x/authz"
  authzkeeper "github.com/cosmos/cosmos-sdk/x/authz/keeper"
  authzmodule "github.com/cosmos/cosmos-sdk/x/authz/module"
  "github.com/cosmos/cosmos-sdk/x/bank"
  bankkeeper "github.com/cosmos/cosmos-sdk/x/bank/keeper"
  banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
  "github.com/cosmos/cosmos-sdk/x/capability"
  capabilitykeeper "github.com/cosmos/cosmos-sdk/x/capability/keeper"
  capabilitytypes "github.com/cosmos/cosmos-sdk/x/capability/types"
...
```

The modules in the `/cosmos-sdk/x/` folder are maintained by several organisations working on the Interchain Stack. To understand a module, the best way is to have a look at the respective `spec` folder. For example, look at the [`cosmos-sdk/x/bank/spec/01_state.md`](https://github.com/cosmos/cosmos-sdk/blob/v0.45.4/x/bank/spec/01_state.md) to understand the state of the `bank` module which you used in this section.

<HighlightBox type="tip">

Do you need a conceptual refresher about modules and their role in the Cosmos SDK? See the [Modules section in the previous chapter](/academy/2-cosmos-concepts/5-modules.md).

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to run and to interact with a blockchain by using `simapp`, which contains the code necessary to run a simulated version of the Cosmos SDK called `simd` so you can test commands without actually interacting with your chain.
* How to compile and initialize `simapp`, and to inspect the initial configuration of your chain's genesis state.
* How to prepare your account, including how to add, confirm, and inspect your keys, and review your mnemonic.
* How to make yourself a proper validator, by adding and confirming the presence of an initial balance and including bootstrap transactions in the genesis file.
* How to start your single-node blockchain, observe blocks being created through the terminal window, and check the balances.
* How to practice sending transactions to another account and transferring tokens to it, and checking the balance of the new account to confirm the successful transfer.
* CLI routing with the examination of the initial Go code, revealing various aspects of your nascent chain.

</HighlightBox>

<!--## Next up

It is time to begin developing your own chain. You will begin working with Ignite CLI in the [next section](/hands-on-exercise/1-ignite-cli/1-ignitecli.md).-->
