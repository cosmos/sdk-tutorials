---
order: 3
---

# Get your XP

To get the `XP` begin by signing up for our newsletter at our Sponsor Booth. To claim the `XP` you'll need to build the Command Line Client for interacting with the Cosmos Burner Chain and generate a wallet. First make sure that you have [installed golang v13.0 or newer](https://golang.org/doc/install) and that your `$GOPATH` and `$GOROOT` are correctly configured.
```bash
go version
echo $GOPATH
echo $GOROOT
```
Now you can get the repo by cloning it directly with the correct branch (`okwme/minimal-scavenge`):
```bash
git clone -b okwme/minimal-scavenge https://github.com/cosmos/peggy
```
Afterwards you'll need to navigate into the newly downloaded directory and run `make install` like:
```bash
cd peggy
make install
```
> You may need to install `make` and `make-guile` before running `make install`

This should result in building three binaries:
```bash
make install
go install -mod=readonly ./cmd/ebd
go install -mod=readonly ./cmd/ebcli
go install -mod=readonly ./cmd/ebrelayer
```
The first binary (`ebd`) is used for running a node within the network (we're just going to be connecting to a node that's already running). The second binary (`ebrelayer`) is for running a relayer between the burner chain and xDai. You won't be allowed to do this unless you also run a validator so we won't look further into it at this point. The third binary (`ebcli`) is the one we want. Try running the help command to see what it can do:
```bash
ebcli --help
ethereum bridge client

Usage:
  ebcli [command]

Available Commands:
  status      Query remote node for status
  config      Create or query an application CLI configuration file
  query       Querying subcommands
  tx          Transactions subcommands
              
  rest-server Start LCD (light-client daemon), a local REST server
              
  keys        Add or view local private keys
              
  version     Print the app version
  help        Help about any command

Flags:
      --chain-id string   Chain ID of tendermint node
  -e, --encoding string   Binary encoding (hex|b64|btc) (default "hex")
  -h, --help              help for ebcli
      --home string       directory for config and data (default "/root/.ebcli")
  -o, --output string     Output format (text|json) (default "text")
      --trace             print out full stack trace on errors

Use "ebcli [command] --help" for more information about a command.
```
The first thing we'll want to do is add some values to the config of our CLI so you don't need to include them as flags with every other command. We add `indent`, `format` to help with formatting the CLI results, We'll use `trust-node` and `node` to point our CLI to the active burner node at http://167.99.167.78:26657 where it is running with the `chain-id` of `peggy`.
```bash
ebcli config indent true
ebcli config output json
ebcli config chain-id peggy
ebcli config trust-node true
ebcli config node tcp://167.99.167.78:26657
```
Next you'll want to generate a new account for this chain. You should come up with a nickname for this account that you can use to reference it while making other commands later on. This will also show you the mnemonic phrase that secures the account as well as the public key and your address as a bech32 encoded version of your public key with a cosmos prefix (the prefix can be modified per chain).
```bash
ebcli keys add your-nickname
Enter keyring passphrase:
{
  "name": "your-nickname",
  "type": "local",
  "address": "cosmos15d0vljwtyxnrz9quuk2mj7mjfmjfg8wjfedm90",
  "pubkey": "cosmospub1addwnpepqwhkspe65ewjerceu5dckqcfpcku0znx3c6q0ll3whyngjzycx4awd8pn5p",
  "mnemonic": "** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** ** **"
}
```
This is your new account! Now that you know your account **address**, you need to send it to us so we can give you your `XP`! You can submit it via email to [billy@tendermint.com](mailto:billy@tendermint.com) with the email address you signed up for the survey with. I'll reply letting you know you've received the `XP`. Once you've received it you should be able to check your balance like this:
```bash
ebcli query account $(ebcli keys show your-nickname -a)
Enter keyring passphrase:
{
  "type": "cosmos-sdk/Account",
  "value": {
    "address": "cosmos15d0vljwtyxnrz9quuk2mj7mjfmjfg8wjfedm90",
    "coins": [
      {
        "denom": "XP",
        "amount": "10"
      }
    ],
    "public_key": "cosmospub1addwnpepqwhkspe65ewjerceu5dckqcfpcku0znx3c6q0ll3whyngjzycx4awd8pn5p",
    "account_number": 0,
    "sequence": 2
  }
}
```
This uses the `ebcli keys` as a sub-command to grab your account address and uses it as a parameter in the `ebcli query` command. 
> If you have not yet received your `XP` tokens, you will see an error that your account does not exist. That's because accounts are not registered within the chain's memory until they execute their first transaction or receive a balance in some token.


**NOTE** This does not work yet because XP is non transferrable.
Once you have some `XP` you can send it back to your Ethereum address on the BuffiDai xDai chain. To do this use the following command:
```bash
ebcli tx ethbridge burn $(ebcli keys show your-nickname -a) ETHEREUM_RECIPIENT_ADDRESS 10XP \
--from your-nickname \
--ethereum-chain-id 100 \
--token-contract-address XP_TOKEN_ADDRESS
```
You should be able to see the balance show up in your BuffiDao wallet!