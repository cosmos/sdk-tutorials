---
title: Prepare where the node starts
order: 3
description: Genesis preparation and insertion
tag: deep-dive
---

# Prepare where the node starts

When you run your chain with `myprojectd start`, the software will build from a genesis. This genesis needs to contain:

1. The original validators and their stakes.
2. The original state values that you see fit. This can be, for instance, the original parameters of your world if you are building a metaverse, or the original USD price of your token if you are building a stable coin.

## Generate

You are going to build this genesis file progressively. The genesis contains a lot of information such as [minting](https://hub.cosmos.network/main/resources/genesis.html#mint), [staking](https://hub.cosmos.network/main/resources/genesis.html#staking) or [slashing](https://hub.cosmos.network/main/resources/genesis.html#slashing) parameters. You can adjust [these parameters](https://hub.cosmos.network/main/resources/genesis.html) if you know what you are doing.

<!--

TODO add link that lists what can be changed in genesis.

-->

The genesis needs only be generated once, then it is distributed and copied onto machines.

### Token name(s)

One of the simpler parameters that you can decide on is the name of the staking token. The name you choose is for the indivisible denomination. For the Cosmos Hub that is `uatom`, which is understood as a millionth of an ATOM.

For instance, if you decide that your token is the STONE and that it contains a billion indivisible units, by convention, you would name the unit an `nstone`, as in a _nano STONE_.

Keeping on-brand, your new chain is named _stone-age_.

To create a brand new genesis file for your chain, run:

```sh
$ ./myprojectd init --chain-id stone-age --staking-bond-denom nstone
```

This creates a large genesis file with default values mirrored from the Cosmos Hub.

<HighlightBox type="remember">

Correctly identify where it is located. Most likely in `~/.myprojectd/config/genesis.json`. If this is not where you want to prepare your genesis file, you can add `--home another_folder` to all your commands.

</HighlightBox>

If you are planning on having more denominations than your staking token, this is defined in the next step.

### Genesis accounts

Genesis accounts are accounts that exist in the genesis. They can be there because of a pre-sale of tokens, because of simple allotments or for any other reason. You need to include them in the genesis. The command for that is `add-genesis-account`. For each genesis account you need to collect their address. If these are third-parties, make sure in more ways than one that you get the right values, whether by email or other means.

Here you can decide to allocate new tokens to your genesis accounts. There is no limit to the number of genesis accounts and the number of extra tokens in the genesis. If you introduce another token name `nflint`, then if Alice has the address `cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq` you could make her a genesis account with:

```sh
$ ./myprojectd add-genesis-account cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq 5000000000stone 2000000000nflint
```

This credits her with 5 STONE and 2 FLINT. It has also given her an `account_number` in the genesis.

You can do the same for all your genesis accounts, which includes your validators.

Advanced topics include [vesting](https://docs.cosmos.network/master/modules/auth/05_vesting.html) on these genesis accounts. For information on how to configure them do:

```sh
$ ./myprojectd add-genesis-account --help
```

When you have defined the genesis accounts, it is time to define the genesis validators.

### Validator stakes

The genesis needs to define the starting validators. That's because, at least, a validator needs to propose the first block that comes after the genesis. But if no validators have been agreed on by consensus, then the first block cannot be produced.

Assume that you have a team of validators that are your starting validators. They are also genesis accounts that you defined previously, so they _have_ tokens. Now you have to:

1. Credit each genesis validator the agreed staked token amounts.
2. Collect signed transactions from them that identify them as validators.

Each validator needs to generate a transaction locally and send it to you, the party that collects them into the genesis.

To each validator you send:

* The `account_number` that was given to them when calling `add-genesis-account`.
* A confirmation of the amount of tokens that you have credited them.

Each validator then has to run a command of the following type. If this is Alice, she may run:

```sh
$ ./myprojectd gentx cosmos1nw793j9xvdzl2uc9ly8fas5tcfwfetercpdfqq 3000000000stone --account-number 0 --sequence 0 --chain-id stone-age 
```

<!--
TODO Detail which keyring to use
-->

This creates a JSON file on the validator's computer. Typically in `~/.myprojectd/config/gentx/` of the form:

```json
{
  "body": {
    "messages": [
      {
        "@type": "/cosmos.staking.v1beta1.MsgCreateValidator",
        "description": {
          "moniker": "test",
          "identity": "",
          "website": "",
          "security_contact": "",
          "details": ""
        },
        "commission": {
          "rate": "0.100000000000000000",
          "max_rate": "0.200000000000000000",
          "max_change_rate": "0.010000000000000000"
        },
        "min_self_delegation": "1",
        "delegator_address": "cosmos15fsdc94dykrztg3rc70zu53ecsta23m0n0hhmr",
        "validator_address": "cosmosvaloper15fsdc94dykrztg3rc70zu53ecsta23m0kmrzhs",
        "pubkey": {
          "@type": "/cosmos.crypto.ed25519.PubKey",
          "key": "IDYUMStEbQ/QYfmIIsks8El7vwExIxUcKimUlMymjKk="
        },
        "value": {
          "denom": "stake",
          "amount": "1000000"
        }
      }
    ],
    "memo": "ce1c54ea7a2c50b4b9f2f869faf8fa4d1a1cf43a@192.168.100.5:26656",
    "timeout_height": "0",
    "extension_options": [],
    "non_critical_extension_options": []
  },
  "auth_info": {
    "signer_infos": [
      {
        "public_key": {
          "@type": "/cosmos.crypto.secp256k1.PubKey",
          "key": "AlQbw3YOqdKHQ/bud+27qi8dVOGVoT9XFUzFGsTz/0qn"
        },
        "mode_info": {
          "single": {
            "mode": "SIGN_MODE_DIRECT"
          }
        },
        "sequence": "0"
      }
    ],
    "fee": {
      "amount": [],
      "gas_limit": "200000",
      "payer": "",
      "granter": ""
    },
    "tip": null
  },
  "signatures": [
    "MKrPz/5eBouD116vj20yvdaFrRJC74d3pDofAePYSNFbvYPZ5bQIO/QatqUQvbSFIuoej6ahePby1Yob7AiVyg=="
  ]
}
```

<!--

TODO include better example of JSON file

-->

Because a validator can be configured with multiple flags, look at:

```sh
$ ./myprojectd gentx --help
```

Each validator then returns you their transaction file(s).

https://blog.althea.net/making-a-cosmos-chain/

### Validators aggregation

When a validator returns a signed transaction to you, you add the JSON in the `~/.myprojectd/config/gentx` folder along all the others.

When you have all of them, you add them all in the genesis like so:

```sh
$ ./myprojectd collect-gentxs 
```

In fact, if some validators are not cooperating fast enough, you can do it when you have enough of them to start a valid network. The late potential validators can always send transactions to the live network to become validators at a later date.

<!-- 
Confirm whether doing it multiple times is idempotent.
Also what happens when sequence numbers are incorrect.
-->

This completes your creation of the genesis. What do you do with it?

## Publish

All your genesis validators and all other potential node operators need access to this file for them to be technically able to start the network. So put it on a public server. Picking a dedicated Github repository for all things _production_ is a good example.

The relevant parties should also come to a consensus that this genesis represents the agreed initial state. Indeed, parties are being granted tokens and one may not accept being omitted. Parties are enroling to be validators. So there needs to be agreement on this file. This is the only _block_ that needs a social consensus on its content. All other blocks will be agreed on by technical PoS consensus.

## Import

In turn, each validator and node operator copies this file on their own machine, in the designated folder, typically `~/.myprojectd/config/genesis.json`.