---
title: "Running a Node, API, and CLI"
order: 2
description: Interacting with a Cosmos SDK chain through simapp
tag: deep-dive
---

# Running a Node, API, and CLI

Run a blockchain and discover how to interact with it.

There are different ways to run a node of a Cosmos blockchain. You will explore how to do so using [`simapp`](https://github.com/cosmos/cosmos-sdk/tree/master/simapp).

## See what you are going to do

<YoutubePlayer videoId="qzUgh8mvyJE"/>

## Compile `simapp`

The Cosmos SDK repository contains a folder called [`simapp`](https://github.com/cosmos/cosmos-sdk/blob/master/simapp/). In this folder you can find the code to run a simulated version of the Cosmos SDK, so you can test commands without actually interacting with your chain. The binary is called `simd` and you will be using it to interact with your node.

First, create and change the directory into a `cosmos` folder and then clone the `cosmos-sdk` repo into that folder:

```sh
$ mkdir cosmos
$ cd cosmos
$ git clone https://github.com/cosmos/cosmos-sdk
```

Then build `cosmos-sdk`:

```sh
$ cd cosmos-sdk
$ make build
```

The build takes a few minutes and creates a `build` folder and a `simapp` binary named `simd`:

```sh
$ ls build
```

## Initialize `simapp`

Now reset the database. Run this step not only when the database has already been initialized but even if this is the first time you are testing `simapp`:

```sh
$ cd build
$ ./simd unsafe-reset-all

3:58PM INF Removed all blockchain history dir=/Users/b9lab/.simapp/data
3:58PM INF Generated private validator file keyFile=/Users/b9lab/.simapp/config/priv_validator_key.json stateFile=/Users/b9lab/.simapp/data/priv_validator_state.json
```

The command output lists all of the files set to their initial state with their locations.

Time to initialize the application. The initialization creates the genesis block and an initial chain state:

```sh
$ ./simd init demo
{"app_message":{"auth":{"accounts":[],"params":{"max_memo_characters":"256","sig_verify_cost_ed25519":"590","sig_verify_cost_secp256k1":"1000","tx_sig_limit":"7","tx_size_cost_per_byte":"10"}},"authz":{"authorization":[]},"bank":{"balances":[],"denom_metadata":[],"params":{"default_send_enabled":true,"send_enabled":[]},"supply":[]},"capability":{"index":"1","owners":[]},"crisis":{"constant_fee":{"amount":"1000","denom":"stake"}},"distribution":{"delegator_starting_infos":[],"delegator_withdraw_infos":[],"fee_pool":{"community_pool":[]},"outstanding_rewards":[],"params":{"base_proposer_reward":"0.010000000000000000","bonus_proposer_reward":"0.040000000000000000","community_tax":"0.020000000000000000","withdraw_addr_enabled":true},"previous_proposer":"","validator_accumulated_commissions":[],"validator_current_rewards":[],"validator_historical_rewards":[],"validator_slash_events":[]},"evidence":{"evidence":[]},"feegrant":{"allowances":[]},"genutil":{"gen_txs":[]},"gov":{"deposit_params":{"max_deposit_period":"172800s","min_deposit":[{"amount":"10000000","denom":"stake"}]},"deposits":[],"proposals":[],"starting_proposal_id":"1","tally_params":{"quorum":"0.334000000000000000","threshold":"0.500000000000000000","veto_threshold":"0.334000000000000000"},"votes":[],"voting_params":{"voting_period":"172800s"}},"mint":{"minter":{"annual_provisions":"0.000000000000000000","inflation":"0.130000000000000000"},"params":{"blocks_per_year":"6311520","goal_bonded":"0.670000000000000000","inflation_max":"0.200000000000000000","inflation_min":"0.070000000000000000","inflation_rate_change":"0.130000000000000000","mint_denom":"stake"}},"params":null,"slashing":{"missed_blocks":[],"params":{"downtime_jail_duration":"600s","min_signed_per_window":"0.500000000000000000","signed_blocks_window":"100","slash_fraction_double_sign":"0.050000000000000000","slash_fraction_downtime":"0.010000000000000000"},"signing_infos":[]},"staking":{"delegations":[],"exported":false,"last_total_power":"0","last_validator_powers":[],"params":{"bond_denom":"stake","historical_entries":10000,"max_entries":7,"max_validators":100,"unbonding_time":"1814400s"},"redelegations":[],"unbonding_delegations":[],"validators":[]},"upgrade":{},"vesting":{}},"chain_id":"test-chain-rT4wZY","gentxs_dir":"","moniker":"demo","node_id":"cf6bff39bb84da39d214138ebba8bcba4ccb848d"}
```

<ExpansionPanel title="A more readable version">

Just in case you need a "prettier" version:

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
        "min_deposit": [
          {
            "amount": "10000000",
            "denom": "stake"
          }
        ]
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
  "chain_id": "test-chain-rT4wZY",
  "gentxs_dir": "",
  "moniker": "demo",
  "node_id": "cf6bff39bb84da39d214138ebba8bcba4ccb848d"
}
```

</ExpansionPanel>

You can find your `chain_id` in your output, which in our build happens to be called `test-chain-rT4wZY`. Make a note of the one you have as you will need it later to determine the chain ID by passing it to `simapp` via the flag `--chain-id`.

You can inspect the initial configuration with:

```sh
$ cat ~/.simapp/config/genesis.json
```

## Prepare your account

<HighlightBox type="tip">

It helps to have the concepts very clear in mind when working hands-on with the Cosmos SDK. Need a refresher? Dive right into the [section on _Accounts_ in the _Main Concepts_ chapter](../2-main-concepts/accounts.md).

</HighlightBox>

You can also inspect your keys. These are held in the backend keyring, which by default is that of the operating system:

```sh
$ ./simd keys list
[]
```

As you might have expected, you do not have any keys yet.

Fix that and add a new key:

```sh
$ ./simd keys add b9lab

- name: b9lab
  type: local
  address: cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A6TrsRO/OH91fAEFLohw7RwFB832NRsRWhQvE2t8cfLK"}'
  mnemonic: ""


**Important** write this mnemonic phrase in a safe place.
It is the only way to recover your account if you ever forget your password.

ivory uniform actual spot floor vessel monster rose yellow noise smile odor veteran human reason miss stadium phrase assault puzzle sentence approve coral apology
```

You can see the mnemonic at the end of the above output. This sequence of words is a mnemonic that you can use to recover your public and private keys. In a production setting, the mnemonic must be stored in a reliable and confidential fashion as part of the key-management infrastructure.

Confirm that the key has been added with:

```sh
$ ./simd keys list
```

or with:

```sh
$ ./simd keys show b9lab
```

## Make yourself a proper validator

As you know by now, a Cosmos SDK blockchain relies on identified validators to produce blocks. Initially there is no validator to generate blocks. You are in a catch-22 situation: your initialized and unstarted chain needs a genesis account and validator for bootstrapping purposes.

Make your key, also known as an account, have an initial balance in the genesis file:

```sh
$ ./simd add-genesis-account b9lab 100000000stake
```

Appended here to the amount is the `stake` suffix. This `stake` represents the unit for the tokens in this chain as per the genesis file. Therefore, this command adds `100000000` `stake` to your account. If in doubt, you can confirm the proper suffix in the `genesis.json` file with:

```sh
$ grep -A 2 -B 2 denom ~/.simapp/config/genesis.json
```

You can also confirm in the genesis file itself that you have an initial balance:

```sh
grep -A 10 balances ~/.simapp/config/genesis.json
```

With this initial balance and before you run your blockchain, you still need to escape the catch-22 and include your bootstrap transactions in the genesis file.

**Note:** In this scenario you must meet the 2/3 threshold for validation, so you must stake at least `70000000stake` of your `100000000stake` in the `b9lab` account you just created. Make sure to not use all your stake, so you still have tokens to pay for gas. Do not forget to use your own `--chain-id`.

```sh
$ ./simd gentx b9lab 70000000stake --chain-id test-chain-rT4wZY
Genesis transaction written to "/Users/muratoener/.simapp/config/gentx/gentx-cf6bff39bb84da39d214138ebba8bcba4ccb848d.json"
```

After having created this genesis transaction in its own file, collect all the genesis transactions with `collect-gentxs` to include it into your genesis file:

```sh
$ ./simd collect-gentxs
{"app_message":{"auth":{"accounts":[{"@type":"/cosmos.auth.v1beta1.BaseAccount","account_number":"0","address":"cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq","pub_key":null,"sequence":"0"}],"params":{"max_memo_characters":"256","sig_verify_cost_ed25519":"590","sig_verify_cost_secp256k1":"1000","tx_sig_limit":"7","tx_size_cost_per_byte":"10"}},"authz":{"authorization":[]},"bank":{"balances":[{"address":"cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq","coins":[{"amount":"100000000","denom":"stake"}]}],"denom_metadata":[],"params":{"default_send_enabled":true,"send_enabled":[]},"supply":[{"amount":"100000000","denom":"stake"}]},"capability":{"index":"1","owners":[]},"crisis":{"constant_fee":{"amount":"1000","denom":"stake"}},"distribution":{"delegator_starting_infos":[],"delegator_withdraw_infos":[],"fee_pool":{"community_pool":[]},"outstanding_rewards":[],"params":{"base_proposer_reward":"0.010000000000000000","bonus_proposer_reward":"0.040000000000000000","community_tax":"0.020000000000000000","withdraw_addr_enabled":true},"previous_proposer":"","validator_accumulated_commissions":[],"validator_current_rewards":[],"validator_historical_rewards":[],"validator_slash_events":[]},"evidence":{"evidence":[]},"feegrant":{"allowances":[]},"genutil":{"gen_txs":[{"auth_info":{"fee":{"amount":[],"gas_limit":"200000","granter":"","payer":""},"signer_infos":[{"mode_info":{"single":{"mode":"SIGN_MODE_DIRECT"}},"public_key":{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A6TrsRO/OH91fAEFLohw7RwFB832NRsRWhQvE2t8cfLK"},"sequence":"0"}],"tip":null},"body":{"extension_options":[],"memo":"cf6bff39bb84da39d214138ebba8bcba4ccb848d@192.168.1.7:26656","messages":[{"@type":"/cosmos.staking.v1beta1.MsgCreateValidator","commission":{"max_change_rate":"0.010000000000000000","max_rate":"0.200000000000000000","rate":"0.100000000000000000"},"delegator_address":"cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq","description":{"details":"","identity":"","moniker":"demo","security_contact":"","website":""},"min_self_delegation":"1","pubkey":{"@type":"/cosmos.crypto.ed25519.PubKey","key":"0wnjKoRtWjv9NOLEPS6UrlwFurQAmsJIXFsmhtbigF8="},"validator_address":"cosmosvaloper1nw793j9xvdzl2uc9ly8fas5tcfwfetera4euvn","value":{"amount":"70000000","denom":"stake"}}],"non_critical_extension_options":[],"timeout_height":"0"},"signatures":["NA23q62Vhfm1z3E1XafPeSDEVDkcPuTWXZmQr9QAZuN5wY2V6UFSRBO0w8Z255OxxZV4j47SJo1HOYWvcH4qvw=="]}]},"gov":{"deposit_params":{"max_deposit_period":"172800s","min_deposit":[{"amount":"10000000","denom":"stake"}]},"deposits":[],"proposals":[],"starting_proposal_id":"1","tally_params":{"quorum":"0.334000000000000000","threshold":"0.500000000000000000","veto_threshold":"0.334000000000000000"},"votes":[],"voting_params":{"voting_period":"172800s"}},"mint":{"minter":{"annual_provisions":"0.000000000000000000","inflation":"0.130000000000000000"},"params":{"blocks_per_year":"6311520","goal_bonded":"0.670000000000000000","inflation_max":"0.200000000000000000","inflation_min":"0.070000000000000000","inflation_rate_change":"0.130000000000000000","mint_denom":"stake"}},"params":null,"slashing":{"missed_blocks":[],"params":{"downtime_jail_duration":"600s","min_signed_per_window":"0.500000000000000000","signed_blocks_window":"100","slash_fraction_double_sign":"0.050000000000000000","slash_fraction_downtime":"0.010000000000000000"},"signing_infos":[]},"staking":{"delegations":[],"exported":false,"last_total_power":"0","last_validator_powers":[],"params":{"bond_denom":"stake","historical_entries":10000,"max_entries":7,"max_validators":100,"unbonding_time":"1814400s"},"redelegations":[],"unbonding_delegations":[],"validators":[]},"upgrade":{},"vesting":{}},"chain_id":"test-chain-rT4wZY","gentxs_dir":"/Users/muratoener/.simapp/config/gentx","moniker":"demo","node_id":"cf6bff39bb84da39d214138ebba8bcba4ccb848d"}
```

If you are curious, you can find the updated `gen_txs` field in your genesis.

## Create blocks

Now you can start your single-node blockchain:

```sh
$ ./simd start

6:23PM INF starting ABCI with Tendermint
6:23PM INF Starting multiAppConn service impl=multiAppConn module=proxy
6:23PM INF Starting localClient service connection=query impl=localClient module=abci-client
6:23PM INF Starting localClient service connection=snapshot impl=localClient module=abci-client
6:23PM INF Starting localClient service connection=mempool impl=localClient module=abci-client
6:23PM INF Starting localClient service connection=consensus impl=localClient module=abci-client
```

In the terminal window where you ran the command, you can see blocks being produced and validated.

Open a new terminal in the same folder and check the balances:

```sh
$ ./simd query bank balances $(./simd keys show b9lab -a)
balances:
- amount: "30000000"
  denom: stake
pagination:
  next_key: null
  total: "0"
```

## Send a transaction

Practice sending a transaction. For that you are going to create another account named "student" and transfer some tokens to the account:

```sh
$ ./simd keys add student

- name: student
  type: local
  address: cosmos1m95dh3uc2s7fkn4w6v3ueux3sya96dhdudwa24
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"AgDYHucSs5vZ4viGyyoC0Qz6M7/+fEdqgOesEmeTdPE/"}'
  mnemonic: ""


**Important** record this mnemonic phrase in a safe place.
It is the only way to recover your account if you ever forget your password.

gown all scissors page panel table hill acoustic junior run winter cement mass clump moon adjust glare never satoshi easily illness hip rib multiply
```

Before sending any tokens confirm that the balance of the new account is absent:

```sh
$ ./simd query bank balances $(./simd keys show student -a)
balances: []
pagination:
  next_key: null
  total: "0"
```

This account does not have a balance. The new account does not yet exist in your blockchain. Only the key pair has been generated and stored in your keyring. You need to send a transaction to change this new account's balance:

```sh
$ ./simd tx bank send $(./simd keys show b9lab -a) $(./simd keys show student -a) 10stake --chain-id test-chain-rT4wZY

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

You are prompted to confirm the transaction before signing and broadcasting. This is a good sign.

The command output includes useful information such as `gas_used`.

Now check the balance of the student account again:

```sh
$ ./simd query bank balances $(./simd keys show student -a)
balances:
- amount: "10"
  denom: stake
pagination:
  next_key: null
  total: "0"
```

That is a `10` stake.

## CLI routing

Now it is time for a bit of Go code. How does this `simd` interact via the command-line interface? Inspect the [`cosmos-sdk/simapp/simd/main.go`](https://github.com/cosmos/cosmos-sdk/blob/d83a3bf92c9a84bddf3f5eb6692a1101c18b42f1/simapp/simd/main.go) file:

```go
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

This [`cmd.NewRootCmd()`](https://github.com/cosmos/cosmos-sdk/blob/d83a3bf92c9a84bddf3f5eb6692a1101c18b42f1/simapp/simd/main.go#L13) function is the CLI handler. It is imported via the [`"github.com/cosmos/cosmos-sdk/simapp/simd/cmd"`](https://github.com/cosmos/cosmos-sdk/blob/d83a3bf92c9a84bddf3f5eb6692a1101c18b42f1/simapp/simd/main.go#L9) line. It can be found in the [`cosmos-sdk/simapp/simd/cmd/root.go`](https://github.com/cosmos/cosmos-sdk/blob/d83a3bf92c9a84bddf3f5eb6692a1101c18b42f1/simapp/simd/cmd/root.go#L39) file:

```go
func NewRootCmd() (*cobra.Command, params.EncodingConfig)
```

In it [basic properties](https://github.com/cosmos/cosmos-sdk/blob/d83a3bf92c9a84bddf3f5eb6692a1101c18b42f1/simapp/simd/cmd/root.go#L51-L53) such as the application name are defined:

```go
rootCmd := &cobra.Command{
    Use:   "simd",
    Short: "simulation app",
```

In addition, observe that Cobra is imported and [used for the CLI](https://github.com/cosmos/cosmos-sdk/blob/d83a3bf92c9a84bddf3f5eb6692a1101c18b42f1/simapp/simd/cmd/root.go#L144-L155) to redirect:

```go
rootCmd.AddCommand(
    genutilcli.InitCmd(simapp.ModuleBasics, simapp.DefaultNodeHome),
    genutilcli.CollectGenTxsCmd(banktypes.GenesisBalancesIterator{}, simapp.DefaultNodeHome),
    genutilcli.MigrateGenesisCmd(),
    genutilcli.GenTxCmd(simapp.ModuleBasics, encodingConfig.TxConfig, banktypes.GenesisBalancesIterator{}, simapp.DefaultNodeHome),
    genutilcli.ValidateGenesisCmd(simapp.ModuleBasics),
    AddGenesisAccountCmd(simapp.DefaultNodeHome),
    tmcli.NewCompletionCmd(rootCmd, true),
    NewTestnetCmd(simapp.ModuleBasics, banktypes.GenesisBalancesIterator{}),
    debug.Cmd(),
    config.Cmd(),
)
```

Also, have a look at [`simapp/app.go`](https://github.com/cosmos/cosmos-sdk/blob/d83a3bf92c9a84bddf3f5eb6692a1101c18b42f1/simapp/app.go), in which each module and key keeper will be imported. The first thing you will see is a considerable [list of modules](https://github.com/cosmos/cosmos-sdk/blob/d83a3bf92c9a84bddf3f5eb6692a1101c18b42f1/simapp/app.go#L33-L44) that are used by most Cosmos-sdk applications:

```go
...
  "github.com/cosmos/cosmos-sdk/x/auth"
  "github.com/cosmos/cosmos-sdk/x/auth/ante"
  authkeeper "github.com/cosmos/cosmos-sdk/x/auth/keeper"
  authsims "github.com/cosmos/cosmos-sdk/x/auth/simulation"
  authtx "github.com/cosmos/cosmos-sdk/x/auth/tx"
  authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"
  "github.com/cosmos/cosmos-sdk/x/auth/vesting"
  "github.com/cosmos/cosmos-sdk/x/bank"
  bankkeeper "github.com/cosmos/cosmos-sdk/x/bank/keeper"
  banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
  "github.com/cosmos/cosmos-sdk/x/capability"
  capabilitykeeper "github.com/cosmos/cosmos-sdk/x/capability/keeper"
  capabilitytypes "github.com/cosmos/cosmos-sdk/x/capability/types"
...
```

The modules in the `/cosmos-sdk/x/` folder are maintained by several organisations working on the Cosmos stack. To understand a module, the best way is to have a look at the respective `spec` folder. For example, have a look at the [`cosmos-sdk/x/bank/spec/01_state.md`](https://github.com/cosmos/cosmos-sdk/blob/d83a3bf92c9a84bddf3f5eb6692a1101c18b42f1/x/bank/spec/01_state.md) to understand the state of the `bank` module which you used in this section.

<HighlightBox type="tip">

Do you need a conceptual refresher about modules and their role in the Cosmos SDK? Take a look at the [Modules section in the previous chapter](../2-main-concepts/modules.md).

</HighlightBox>

## Next up

It is time to begin developing your own chain. You will begin working with Ignite CLI and look into CosmJS and CosmWasm in the [next chapter](../4-my-own-chain/index.md).
