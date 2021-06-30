---
order: 22
---

# Build and run the app

## Building the `nameservice` application

This repo contains a complete `nameservice` application, scaffolded with starport. You should be able to run the application using `starport chain serve` in the home directory:

```
$ starport chain serve

📦 Installing dependencies...
🛠️  Building the app...
🙂 Created an account. Password (mnemonic): insane flash movie sketch saddle antique mean season damp thunder tag reunion quantum sock cube early glimpse cabbage smile photo hill relax couch sweet
🙂 Created an account. Password (mnemonic): whip bone crane flag lesson mule valley soup faith include october monkey volume iron mushroom cry acid case village clog abstract antenna wife eyebrow
🌍 Running a Cosmos 'nameservice' app with Tendermint at http://localhost:26657.
🌍 Running a server at http://localhost:1317 (LCD)

🚀 Get started: http://localhost:12345/
```


Now, you can install and run the application.

If you have not completed the tutorial then you can follow the below cloning instructions:

```
# Clone the source of the tutorial repository
git clone https://github.com/cosmos/sdk-tutorials.git
cd sdk-tutorials
cd nameservice/nameservice
starport chain serve
```

## Breaking down the `starport chain serve` command

Before running our application, `starport chain serve` runs a build similar to that in our `Makefile`.

Afterwards, it initializes our `genesis.json` file based on the contents of the `config.yml` file. You can see we've defined two `accounts` to the genesis, `user1` and `user2`, and have set up `user1` as the validator for the node we're going to run.

This setup can also be performed manually using the `nameserviced` and `nameservicecli` commands, which are available after the application is built.

<<< @/nameservice/nameservice/init.sh

> _*NOTE*_: If you have run the tutorial before, you can start from scratch with a `nameserviced unsafe-reset-all` or by deleting both of the home folders `rm -rf ~/.nameservicecli ~/.nameserviced`

> _*NOTE*_: If you have the Cosmos app for ledger and you want to use it, when you create the key with `nameservicecli keys add user1` just add `--ledger` at the end. That's all you need. When you sign, `user1` will be recognized as a Ledger key and will require a device.

> _*NOTE*_: The following commands combined with `rm -rf ~/.nameservicecli ~/.nameserviced` are also collected in the `init.sh` file in the root directory of this project. You can execute all of these commands using default values at once by running `./init.sh` in your terminal.


> Note: There is not a need to specify an amount as by default it will set the minimum.

After you have generated a genesis transaction, you will have to input the genTx into the genesis file, so that your nameservice chain is aware of the validators. To do so, run:

`nameserviced collect-gentxs`

and to make sure your genesis file is correct, run:

`nameserviced validate-genesis`

You can now start `nameserviced` by calling `nameserviced start`. You will see logs begin streaming that represent blocks being produced, this will take a couple of seconds.

You have run your first node successfully.

```bash
# First check the accounts to ensure they have funds
nameservicecli query account $(nameservicecli keys show user1 -a)
nameservicecli query account $(nameservicecli keys show user2 -a)

# Buy your first name using your coins from the genesis file
nameservicecli tx nameservice buy-name user1.id 5nametoken --from user1

# Set the value for the name you just bought
nameservicecli tx nameservice set-name user1.id 8.8.8.8 --from user1

# Try out a resolve query against the name you registered
nameservicecli query nameservice resolve user1.id
# > 8.8.8.8

# Try out a whois query against the name you just registered
nameservicecli query nameservice get-whois user1.id
# > {"value":"8.8.8.8","owner":"cosmos1l7k5tdt2qam0zecxrx78yuw447ga54dsmtpk2s","price":[{"denom":"nametoken","amount":"5"}]}

# user2 buys name from user1
nameservicecli tx nameservice buy-name user1.id 10nametoken --from user2

# user2 decides to delete the name she just bought from user1
nameservicecli tx nameservice delete-name user1.id --from user2

# Try out a whois query against the name you just deleted
nameservicecli query nameservice get-whois user1.id
# > {"value":"","owner":"","price":[{"denom":"nametoken","amount":"1"}]}
```

# Run second node on another machine (Optional)

Open terminal to run commands against that just created to install nameserviced and nameservicecli

## init use another moniker and same namechain

```bash
nameserviced init <moniker-2> --chain-id namechain
```

## overwrite ~/.nameserviced/config/genesis.json with first node's genesis.json

## change persistent_peers

```bash
vim /.nameserviced/config/config.toml
persistent_peers = "id@first_node_ip:26656"
```

To find the node id of the first machine, run the following command on that machine:

```bash
nameserviced tendermint show-node-id
```

## start this second node

```bash
nameserviced start
```

### Congratulations, you have built a Cosmos SDK application! This tutorial is now complete. If you want to see how to run the same commands using the REST server you'll need to run the REST server.
