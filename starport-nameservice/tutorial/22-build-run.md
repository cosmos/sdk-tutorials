---
order: 22
---

# Build and run the app

## Building the `nameservice` application

This repo contains a complete `nameservice` application. If you want to build this completed version **Go 1.13.0+** is required.

Add some parameters to environment is necessary if you have never used the `go mod` before.

```bash
mkdir -p $HOME/go/bin
echo "export GOBIN=\$GOPATH/bin" >> ~/.bash_profile
echo "export PATH=\$PATH:\$GOBIN" >> ~/.bash_profile
source ~/.bash_profile
```

Now, you can install and run the application.

If you have not completed the tutorial then you can follow the below cloning instructions:

```
# Clone the source of the tutorial repository
git clone https://github.com/cosmos/sdk-tutorials.git
cd sdk-tutorials
cd nameservice
```

```bash
# Install the app into your $GOBIN
make install

# Now you should be able to run the following commands:
nsd help
nscli help
```

## Running the live network and using the commands

To initialize configuration and a `genesis.json` file for your application and an account for the transactions, start by running:

> _*NOTE*_: If you have run the tutorial before, you can start from scratch with a `nsd unsafe-reset-all` or by deleting both of the home folders `rm -rf ~/.nscli ~/.nsd`

> _*NOTE*_: If you have the Cosmos app for ledger and you want to use it, when you create the key with `nscli keys add jack` just add `--ledger` at the end. That's all you need. When you sign, `jack` will be recognized as a Ledger key and will require a device.

> _*NOTE*_: The following commands combined with `rm -rf ~/.nscli ~/.nsd` are also collected in the `init.sh` file in the root directory of this project. You can execute all of these commands using default values at once by running `./init.sh` in your terminal.

```bash
# Initialize configuration files and genesis file
# moniker is the name of your node
nsd init <moniker> --chain-id namechain

# Configure your CLI to eliminate need to declare them as flags
nscli config chain-id namechain
nscli config output json
nscli config indent true
nscli config trust-node true

# We'll use the "test" keyring backend which save keys unencrypted in the configuration directory of your project (defaults to ~/.nsd). You should **never** use the "test" keyring backend in production. For more information about other options for keyring-backend take a look at https://docs.cosmos.network/master/interfaces/keyring.html
nscli config keyring-backend test 

# Copy the `Address` output here and save it for later use
# [optional] add "--ledger" at the end to use a Ledger Nano S
nscli keys add jack

# Copy the `Address` output here and save it for later use
nscli keys add alice

# Add both accounts, with coins to the genesis file
nsd add-genesis-account $(nscli keys show jack -a) 1000nametoken,100000000stake
nsd add-genesis-account $(nscli keys show alice -a) 1000nametoken,100000000stake

# The "nscli config" command saves configuration for the "nscli" command but not for "nsd" so we have to 
# declare the keyring-backend with a flag here
nsd gentx --name jack <or your key_name> --keyring-backend test
```

> Note: There is not a need to specify an amount as by default it will set the minimum.

After you have generated a genesis transaction, you will have to input the genTx into the genesis file, so that your nameservice chain is aware of the validators. To do so, run:

`nsd collect-gentxs`

and to make sure your genesis file is correct, run:

`nsd validate-genesis`

You can now start `nsd` by calling `nsd start`. You will see logs begin streaming that represent blocks being produced, this will take a couple of seconds.

You have run your first node successfully.

```bash
# First check the accounts to ensure they have funds
nscli query account $(nscli keys show jack -a)
nscli query account $(nscli keys show alice -a)

# Buy your first name using your coins from the genesis file
nscli tx nameservice buy-name jack.id 5nametoken --from jack

# Set the value for the name you just bought
nscli tx nameservice set-name jack.id 8.8.8.8 --from jack

# Try out a resolve query against the name you registered
nscli query nameservice resolve jack.id
# > 8.8.8.8

# Try out a whois query against the name you just registered
nscli query nameservice whois jack.id
# > {"value":"8.8.8.8","owner":"cosmos1l7k5tdt2qam0zecxrx78yuw447ga54dsmtpk2s","price":[{"denom":"nametoken","amount":"5"}]}

# Alice buys name from jack
nscli tx nameservice buy-name jack.id 10nametoken --from alice

# Alice decides to delete the name she just bought from jack
nscli tx nameservice delete-name jack.id --from alice

# Try out a whois query against the name you just deleted
nscli query nameservice whois jack.id
# > {"value":"","owner":"","price":[{"denom":"nametoken","amount":"1"}]}
```

# Run second node on another machine (Optional)

Open terminal to run commands against that just created to install nsd and nscli

## init use another moniker and same namechain

```bash
nsd init <moniker-2> --chain-id namechain
```

## overwrite ~/.nsd/config/genesis.json with first node's genesis.json

## change persistent_peers

```bash
vim /.nsd/config/config.toml
persistent_peers = "id@first_node_ip:26656"
```

To find the node id of the first machine, run the following command on that machine:

```bash
nsd tendermint show-node-id
```

## start this second node

```bash
nsd start
```

### Congratulations, you have built a Cosmos SDK application! This tutorial is now complete. If you want to see how to run the same commands using the REST server you'll need to run the REST server.
