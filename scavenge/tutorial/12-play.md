---
order: 12
---

# Play

Your application is running! That's great but who cares unless you can play with it. The first command you will want to try is creating a new scavenge. Since our user `me` has way more `foo` token than the user `you`, let's create the scavenge from their account.

You can begin by running `scavengeCLI tx scavenge --help` to see all the commands we created for your new module. You should see the following options:
```bash
scavenge transactions subcommands

Usage:
  scavengeCLI tx scavenge [flags]
  scavengeCLI tx scavenge [command]

Available Commands:
  createScavenge Creates a new scavenge with a reward
  commitSolution Commits a solution for scavenge
  revealSolution Reveals a solution for scavenge

Flags:
  -h, --help   help for scavenge

Global Flags:
      --chain-id string   Chain ID of tendermint node
  -e, --encoding string   Binary encoding (hex|b64|btc) (default "hex")
      --home string       directory for config and data (default "/home/billy/.scavengeCLI")
  -o, --output string     Output format (text|json) (default "text")
      --trace             print out full stack trace on errors

Use "scavengeCLI tx scavenge [command] --help" for more information about a command.
```
We want to use the `createScavenge` command so let's check the help screen for it as well like `scavengeCLI scavenge createScavenge --help`. It should look like:
```bash
Creates a new scavenge with a reward

Usage:
  scavengeCLI tx scavenge createScavenge [reward] [solution] [description] [flags]

Flags:
  -a, --account-number uint     The account number of the signing account (offline mode only)
  -b, --broadcast-mode string   Transaction broadcasting mode (sync|async|block) (default "sync")
      --dry-run                 ignore the --gas flag and perform a simulation of a transaction, but don't broadcast it
      --fees string             Fees to pay along with transaction; eg: 10uatom
      --from string             Name or address of private key with which to sign
      --gas string              gas limit to set per-transaction; set to "auto" to calculate required gas automatically (default 200000) (default "200000")
      --gas-adjustment float    adjustment factor to be multiplied against the estimate returned by the tx simulation; if the gas limit is set manually this flag is ignored  (default 1)
      --gas-prices string       Gas prices to determine the transaction fee (e.g. 10uatom)
      --generate-only           Build an unsigned transaction and write it to STDOUT (when enabled, the local Keybase is not accessible and the node operates offline)
  -h, --help                    help for createScavenge
      --indent                  Add indent to JSON response
      --ledger                  Use a connected Ledger device
      --memo string             Memo to send along with transaction
      --node string             <host>:<port> to tendermint rpc interface for this chain (default "tcp://localhost:26657")
  -s, --sequence uint           The sequence number of the signing account (offline mode only)
      --trust-node              Trust connected full node (don't verify proofs for responses) (default true)
  -y, --yes                     Skip tx broadcasting prompt confirmation

Global Flags:
      --chain-id string   Chain ID of tendermint node
  -e, --encoding string   Binary encoding (hex|b64|btc) (default "hex")
      --home string       directory for config and data (default "/home/billy/.scavengeCLI")
  -o, --output string     Output format (text|json) (default "text")
```
Let's follow the instructions and create a new scavenge. The first parameter we need is the `reward`. Let's give away `69foo` as a reward for solving our scavenge (nice).

Next we should list our `solution`, but probably we should also know what the actual quesiton is that our solution solves (our `description`). How about our challenge question be something family friendly like: `What's brown and sticky?`. Of course the only solution to this question is: `A stick`.

Now we have all the pieces needed to create our Message. Let's piece them all together, adding the flag `--from` so the CLI knows who is sending it:

```bash
scavengeCLI tx scavenge createScavenge 69foo "A stick" "What's brown and sticky?" --from me
```
After confirming the message looks correct and signing with your password (`1234567890`?) you should see something like the following:
```json
{
  "height": "0",
  "txhash": "3D088632B1C523EF2754153F5454E8FA464AE69747A4BD8ABC01A3428C31C185",
  "raw_log": "[{\"msg_index\":0,\"success\":true,\"log\":\"\",\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"CreateScavenge\"}]}]}]",
  "logs": [
    {
      "msg_index": 0,
      "success": true,
      "log": "",
      "events": [
        {
          "type": "message",
          "attributes": [
            {
              "key": "action",
              "value": "CreateScavenge"
            }
          ]
        }
      ]
    }
  ]
}
```
This tells you that the message was accepted into the app. Whether the message failed afterwards can not be told from this screen. However, the section under `txhash` is like a receipt for this interaction. To see if it was successfully processed after being successfully included you can run the following command:
```bash
scavengeCLI q tx <txhash>
```
But replace the `<txhash>` with your own. You should see something similar to this afterwards:
```json
{
  "height": "2622",
  "txhash": "3D088632B1C523EF2754153F5454E8FA464AE69747A4BD8ABC01A3428C31C185",
  "raw_log": "[{\"msg_index\":0,\"success\":true,\"log\":\"\",\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"sender\",\"value\":\"cosmos1uajgdapslnsthwscpy474t3k69u0r8z3u0aaer\"},{\"key\":\"module\",\"value\":\"scavenge\"},{\"key\":\"action\",\"value\":\"CreateScavenge\"},{\"key\":\"sender\",\"value\":\"cosmos1uajgdapslnsthwscpy474t3k69u0r8z3u0aaer\"},{\"key\":\"description\",\"value\":\"What's brown and sticky?\"},{\"key\":\"solutionHash\",\"value\":\"2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906\"},{\"key\":\"reward\",\"value\":\"69foo\"},{\"key\":\"action\",\"value\":\"CreateScavenge\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"cosmos13aupkh5020l9u6qquf7lvtcxhtr5jjama2kwyg\"},{\"key\":\"amount\",\"value\":\"69foo\"}]}]}]",
  "logs": [
    {
      "msg_index": 0,
      "success": true,
      "log": "",
      "events": [
        {
          "type": "message",
          "attributes": [
            {
              "key": "sender",
              "value": "cosmos1uajgdapslnsthwscpy474t3k69u0r8z3u0aaer"
            },
            {
              "key": "module",
              "value": "scavenge"
            },
            {
              "key": "action",
              "value": "CreateScavenge"
            },
            {
              "key": "sender",
              "value": "cosmos1uajgdapslnsthwscpy474t3k69u0r8z3u0aaer"
            },
            {
              "key": "description",
              "value": "What's brown and sticky?"
            },
            {
              "key": "solutionHash",
              "value": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906"
            },
            {
              "key": "reward",
              "value": "69foo"
            },
            {
              "key": "action",
              "value": "CreateScavenge"
            }
          ]
        },
        {
          "type": "transfer",
          "attributes": [
            {
              "key": "recipient",
              "value": "cosmos13aupkh5020l9u6qquf7lvtcxhtr5jjama2kwyg"
            },
            {
              "key": "amount",
              "value": "69foo"
            }
          ]
        }
      ]
    }
  ],
  "gas_wanted": "200000",
  "gas_used": "28218",
  "tx": {
    "type": "cosmos-sdk/StdTx",
    "value": {
      "msg": [
        {
          "type": "scavenge/CreateScavenge",
          "value": {
            "creator": "cosmos1uajgdapslnsthwscpy474t3k69u0r8z3u0aaer",
            "description": "What's brown and sticky?",
            "solutionHash": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906",
            "reward": [
              {
                "denom": "foo",
                "amount": "69"
              }
            ]
          }
        }
      ],
      "fee": {
        "amount": [],
        "gas": "200000"
      },
      "signatures": [
        {
          "pub_key": {
            "type": "tendermint/PubKeySecp256k1",
            "value": "Ag2Ukd9c1kczh/jpSNHAFZRkm2UfnVb+LHTqQ4SPGAVj"
          },
          "signature": "W222xWoImFlcspUhkb4BImM8WcTfmq8D3pQy83Ceo/109LWcBjRlsU+qrzOf2cC0rUz8EtakQJ5pcmU0+ZSUCQ=="
        }
      ],
      "memo": ""
    }
  },
  "timestamp": "2020-01-18T17:37:36Z",
  "events": [
    {
      "type": "message",
      "attributes": [
        {
          "key": "sender",
          "value": "cosmos1uajgdapslnsthwscpy474t3k69u0r8z3u0aaer"
        },
        {
          "key": "module",
          "value": "scavenge"
        },
        {
          "key": "action",
          "value": "CreateScavenge"
        },
        {
          "key": "sender",
          "value": "cosmos1uajgdapslnsthwscpy474t3k69u0r8z3u0aaer"
        },
        {
          "key": "description",
          "value": "What's brown and sticky?"
        },
        {
          "key": "solutionHash",
          "value": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906"
        },
        {
          "key": "reward",
          "value": "69foo"
        },
        {
          "key": "action",
          "value": "CreateScavenge"
        }
      ]
    },
    {
      "type": "transfer",
      "attributes": [
        {
          "key": "recipient",
          "value": "cosmos13aupkh5020l9u6qquf7lvtcxhtr5jjama2kwyg"
        },
        {
          "key": "amount",
          "value": "69foo"
        }
      ]
    }
  ]
}
```

Here you can see all the events we defined within our `Handler` that describes exactly what happened when this message was processed. Since our message was formatted correctly and since the user `me` had enough `foo` to pay the bounty, our `Scavenge` was accepted. You can also see what the solution looks like now that it has been hashed:
```json
{
    "key": "solutionHash",
    "value": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906"
}
```

Since we know the solution to this question and since we have another user at hand that can submit it, let's begin the process of committing and revealing that solution.

First we should check the CLI command for `commitSolution` by running `scavengeCLI tx scavenge commitSolution --help` in order to see:
```bash
Commits a solution for scavenge

Usage:
  scavengeCLI tx scavenge commitSolution [solution] [flags]

Flags:
  -a, --account-number uint     The account number of the signing account (offline mode only)
  -b, --broadcast-mode string   Transaction broadcasting mode (sync|async|block) (default "sync")
      --dry-run                 ignore the --gas flag and perform a simulation of a transaction, but don't broadcast it
      --fees string             Fees to pay along with transaction; eg: 10uatom
      --from string             Name or address of private key with which to sign
      --gas string              gas limit to set per-transaction; set to "auto" to calculate required gas automatically (default 200000) (default "200000")
      --gas-adjustment float    adjustment factor to be multiplied against the estimate returned by the tx simulation; if the gas limit is set manually this flag is ignored  (default 1)
      --gas-prices string       Gas prices to determine the transaction fee (e.g. 10uatom)
      --generate-only           Build an unsigned transaction and write it to STDOUT (when enabled, the local Keybase is not accessible and the node operates offline)
  -h, --help                    help for commitSolution
      --indent                  Add indent to JSON response
      --ledger                  Use a connected Ledger device
      --memo string             Memo to send along with transaction
      --node string             <host>:<port> to tendermint rpc interface for this chain (default "tcp://localhost:26657")
  -s, --sequence uint           The sequence number of the signing account (offline mode only)
      --trust-node              Trust connected full node (don't verify proofs for responses) (default true)
  -y, --yes                     Skip tx broadcasting prompt confirmation

Global Flags:
      --chain-id string   Chain ID of tendermint node
  -e, --encoding string   Binary encoding (hex|b64|btc) (default "hex")
      --home string       directory for config and data (default "/home/billy/.scavengeCLI")
  -o, --output string     Output format (text|json) (default "text")
```
Let's follow the instructions and submit the answer as a commit on behalf of `you`:
```bash
scavengeCLI tx scavenge commitSolution "A stick" --from you 
```
We don't need to put the `solutionHash` because it can be generated by hashing our actual solution. After confirming the transaction and signing it we should see our `txhash` again. To confirm the `txhash` let's look at it again with `scavengeCLI q tx <txhash>`. This time you should see something like:
```json
{
  "height": "2733",
  "txhash": "2E27A06BA7047FD41DC0DAD5481D99D5E58BC84DA0D7E0F4E1AC789F7A410186",
  "raw_log": "[{\"msg_index\":0,\"success\":true,\"log\":\"\",\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"module\",\"value\":\"scavenge\"},{\"key\":\"action\",\"value\":\"CommitSolution\"},{\"key\":\"sender\",\"value\":\"cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79\"},{\"key\":\"solutionHash\",\"value\":\"2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906\"},{\"key\":\"solutionScavengerHash\",\"value\":\"c65363ed8f6af5d5bd5d9fc9f955106fb7f3356cb218f939a5b658d8a46365a8\"},{\"key\":\"action\",\"value\":\"CommitSolution\"}]}]}]",
  "logs": [
    {
      "msg_index": 0,
      "success": true,
      "log": "",
      "events": [
        {
          "type": "message",
          "attributes": [
            {
              "key": "module",
              "value": "scavenge"
            },
            {
              "key": "action",
              "value": "CommitSolution"
            },
            {
              "key": "sender",
              "value": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79"
            },
            {
              "key": "solutionHash",
              "value": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906"
            },
            {
              "key": "solutionScavengerHash",
              "value": "c65363ed8f6af5d5bd5d9fc9f955106fb7f3356cb218f939a5b658d8a46365a8"
            },
            {
              "key": "action",
              "value": "CommitSolution"
            }
          ]
        }
      ]
    }
  ],
  "gas_wanted": "200000",
  "gas_used": "17130",
  "tx": {
    "type": "cosmos-sdk/StdTx",
    "value": {
      "msg": [
        {
          "type": "scavenge/CommitSolution",
          "value": {
            "scavenger": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79",
            "solutionhash": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906",
            "solutionScavengerHash": "c65363ed8f6af5d5bd5d9fc9f955106fb7f3356cb218f939a5b658d8a46365a8"
          }
        }
      ],
      "fee": {
        "amount": [],
        "gas": "200000"
      },
      "signatures": [
        {
          "pub_key": {
            "type": "tendermint/PubKeySecp256k1",
            "value": "AxHwDfJwPnyoTrt5o8L7iSCiUzIOsCOPovWicfgAyIZp"
          },
          "signature": "tUmtFxvNISe8SiUMRAYFkKuDJ58tcMQHfsAU0gZ55ZEcybAwvPou3ggTvVTIxicuI1bwjl7mTiLbplxJMQo6kA=="
        }
      ],
      "memo": ""
    }
  },
  "timestamp": "2020-01-18T17:46:54Z",
  "events": [
    {
      "type": "message",
      "attributes": [
        {
          "key": "module",
          "value": "scavenge"
        },
        {
          "key": "action",
          "value": "CommitSolution"
        },
        {
          "key": "sender",
          "value": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79"
        },
        {
          "key": "solutionHash",
          "value": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906"
        },
        {
          "key": "solutionScavengerHash",
          "value": "c65363ed8f6af5d5bd5d9fc9f955106fb7f3356cb218f939a5b658d8a46365a8"
        },
        {
          "key": "action",
          "value": "CommitSolution"
        }
      ]
    }
  ]
}
```
You'll notice that the `solutionHash` matches the one before. We've also created a new hash for the `solutionScavengerHash` which is the combination of the solution and our account address. We can make sure the commit has been made by querying it directly as well:
```bash
scavengeCLI q scavenge committed "A stick" $(scavengeCLI keys show you -a)
```
Hopefully you should see something like:
```json
{
  "scavenger": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79",
  "solutionHash": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906",
  "solutionScavengerHash": "c65363ed8f6af5d5bd5d9fc9f955106fb7f3356cb218f939a5b658d8a46365a8"
}
```
This confirms that your commit was successfully submitted and is awaiting the follow-up reveal. To make that command let's first check the `--help` command using `scavengeCLI tx scavenge revealSolution --help`. This should show the following screen:

```bash
Reveals a solution for scavenge

Usage:
  scavengeCLI tx scavenge revealSolution [solution] [flags]

Flags:
  -a, --account-number uint     The account number of the signing account (offline mode only)
  -b, --broadcast-mode string   Transaction broadcasting mode (sync|async|block) (default "sync")
      --dry-run                 ignore the --gas flag and perform a simulation of a transaction, but don't broadcast it
      --fees string             Fees to pay along with transaction; eg: 10uatom
      --from string             Name or address of private key with which to sign
      --gas string              gas limit to set per-transaction; set to "auto" to calculate required gas automatically (default 200000) (default "200000")
      --gas-adjustment float    adjustment factor to be multiplied against the estimate returned by the tx simulation; if the gas limit is set manually this flag is ignored  (default 1)
      --gas-prices string       Gas prices to determine the transaction fee (e.g. 10uatom)
      --generate-only           Build an unsigned transaction and write it to STDOUT (when enabled, the local Keybase is not accessible and the node operates offline)
  -h, --help                    help for revealSolution
      --indent                  Add indent to JSON response
      --ledger                  Use a connected Ledger device
      --memo string             Memo to send along with transaction
      --node string             <host>:<port> to tendermint rpc interface for this chain (default "tcp://localhost:26657")
  -s, --sequence uint           The sequence number of the signing account (offline mode only)
      --trust-node              Trust connected full node (don't verify proofs for responses) (default true)
  -y, --yes                     Skip tx broadcasting prompt confirmation

Global Flags:
      --chain-id string   Chain ID of tendermint node
  -e, --encoding string   Binary encoding (hex|b64|btc) (default "hex")
      --home string       directory for config and data (default "/home/billy/.scavengeCLI")
  -o, --output string     Output format (text|json) (default "text")
      --trace             print out full stack trace on errors
```
Since all we need is the solution again let's send and confirm our final message:
```bash
scavengeCLI tx scavenge revealSolution "A stick" --from you
```
We can gather the `txhash` and query it again using `scavengeCLI q tx <txhash>` to reveal:
```json
{
  "height": "2810",
  "txhash": "086B122735C728B2556E04D537E53D6C91C3B46CE0ED0BB6C5001006A4BD2B0F",
  "raw_log": "[{\"msg_index\":0,\"success\":true,\"log\":\"\",\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"sender\",\"value\":\"cosmos13aupkh5020l9u6qquf7lvtcxhtr5jjama2kwyg\"},{\"key\":\"module\",\"value\":\"scavenge\"},{\"key\":\"action\",\"value\":\"SolveScavenge\"},{\"key\":\"sender\",\"value\":\"cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79\"},{\"key\":\"solutionHash\",\"value\":\"2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906\"},{\"key\":\"description\",\"value\":\"What's brown and sticky?\"},{\"key\":\"solution\",\"value\":\"A stick\"},{\"key\":\"scavenger\",\"value\":\"cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79\"},{\"key\":\"reward\",\"value\":\"69foo\"},{\"key\":\"action\",\"value\":\"RevealSolution\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79\"},{\"key\":\"amount\",\"value\":\"69foo\"}]}]}]",
  "logs": [
    {
      "msg_index": 0,
      "success": true,
      "log": "",
      "events": [
        {
          "type": "message",
          "attributes": [
            {
              "key": "sender",
              "value": "cosmos13aupkh5020l9u6qquf7lvtcxhtr5jjama2kwyg"
            },
            {
              "key": "module",
              "value": "scavenge"
            },
            {
              "key": "action",
              "value": "SolveScavenge"
            },
            {
              "key": "sender",
              "value": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79"
            },
            {
              "key": "solutionHash",
              "value": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906"
            },
            {
              "key": "description",
              "value": "What's brown and sticky?"
            },
            {
              "key": "solution",
              "value": "A stick"
            },
            {
              "key": "scavenger",
              "value": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79"
            },
            {
              "key": "reward",
              "value": "69foo"
            },
            {
              "key": "action",
              "value": "RevealSolution"
            }
          ]
        },
        {
          "type": "transfer",
          "attributes": [
            {
              "key": "recipient",
              "value": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79"
            },
            {
              "key": "amount",
              "value": "69foo"
            }
          ]
        }
      ]
    }
  ],
  "gas_wanted": "200000",
  "gas_used": "30740",
  "tx": {
    "type": "cosmos-sdk/StdTx",
    "value": {
      "msg": [
        {
          "type": "scavenge/RevealSolution",
          "value": {
            "scavenger": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79",
            "solutionHash": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906",
            "solution": "A stick"
          }
        }
      ],
      "fee": {
        "amount": [],
        "gas": "200000"
      },
      "signatures": [
        {
          "pub_key": {
            "type": "tendermint/PubKeySecp256k1",
            "value": "AxHwDfJwPnyoTrt5o8L7iSCiUzIOsCOPovWicfgAyIZp"
          },
          "signature": "w0wgQzYL2OeNYsnSJ3WwQo9tNv3RC+Qu6Oo+AdsyFDduASZ4p4vioBxGq/iMn4bNOG5mCKS6eUJZmHN0x6gx9g=="
        }
      ],
      "memo": ""
    }
  },
  "timestamp": "2020-01-18T17:53:21Z",
  "events": [
    {
      "type": "message",
      "attributes": [
        {
          "key": "sender",
          "value": "cosmos13aupkh5020l9u6qquf7lvtcxhtr5jjama2kwyg"
        },
        {
          "key": "module",
          "value": "scavenge"
        },
        {
          "key": "action",
          "value": "SolveScavenge"
        },
        {
          "key": "sender",
          "value": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79"
        },
        {
          "key": "solutionHash",
          "value": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906"
        },
        {
          "key": "description",
          "value": "What's brown and sticky?"
        },
        {
          "key": "solution",
          "value": "A stick"
        },
        {
          "key": "scavenger",
          "value": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79"
        },
        {
          "key": "reward",
          "value": "69foo"
        },
        {
          "key": "action",
          "value": "RevealSolution"
        }
      ]
    },
    {
      "type": "transfer",
      "attributes": [
        {
          "key": "recipient",
          "value": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79"
        },
        {
          "key": "amount",
          "value": "69foo"
        }
      ]
    }
  ]
}
```
You'll notice that the final event that was submitted was a transfer. This shows the movement of the reward into the account of the user `you`. To confirm `you` now has `69foo` more you can query their account balance as follows:
```bash
scavengeCLI q account $(scavengeCLI keys show you -a)
```
This should show a healthy account balance of `70foo` since `you` began with `1foo`:
```json
{
  "type": "cosmos-sdk/Account",
  "value": {
    "address": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79",
    "coins": [
      {
        "denom": "foo",
        "amount": "70"
      }
    ],
    "public_key": {
      "type": "tendermint/PubKeySecp256k1",
      "value": "AxHwDfJwPnyoTrt5o8L7iSCiUzIOsCOPovWicfgAyIZp"
    },
    "account_number": "1",
    "sequence": "5"
  }
}
```
If you'd like to take a look at the completed scavenge you can first query all scavenges with:
```bash
scavengeCLI q scavenge list 
```
To see the specific one just use 
```bash
scavengeCLI q scavenge get 2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906
```
Which should show you that the scavenge has in fact been completed:
```json
{
  "creator": "cosmos1uajgdapslnsthwscpy474t3k69u0r8z3u0aaer",
  "description": "What's brown and sticky?",
  "solutionHash": "2f9457a6e8fb202f9e10389a143a383106268c460743dd59d723c0f82d9ba906",
  "reward": [
    {
      "denom": "foo",
      "amount": "69"
    }
  ],
  "solution": "A stick",
  "scavenger": "cosmos1m9pxr3nrra2cl07kh8hzdty5x0mejf44997f79"
}
```
<img src="./img/carmen.jpg" style="margin:auto;display:block;">

---

**Thanks for joining me** in building a deterministic state machine and using it as a game. I hope you can see that even such a simple app can be extremely powerful as it contains digital scarcity. 

If you'd like to keep going, consider trying to expand on the capabilities of this application by doing one of the following:
* Allow the `Creator` of a `Scavenge` to edit or delete a scavenge.
* Create a query that lists all commits.

If you're interested in learning more about the Cosmos SDK check out the rest of our [docs](https://docs.cosmos.network) or join our [forum](https://forum.cosmos.network).

Topics to look out for in future tutorials are:
* [Communication between applications (IBC)](https://cosmos.network/ibc/)
* [Digital Collectibles (NFTs)](https://github.com/cosmos/modules)
* [Using the Ethereum Virtual Machine (EVM) as a module within an application](https://github.com/chainsafe/ethermint)

If you have any questions or comments feel free to open an issue on this tutorial's [github](https://github.com/cosmos/sdk-tutorials).


If you'd like to stay in touch with me follow my github at [@okwme](https://github.com/okwme) or twitter at [@billyrennekamp](https://twitter.com/billyrennekamp).