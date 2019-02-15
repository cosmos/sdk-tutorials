# Building and running the application

## Building the `nameservice` application

If you want to build the `nameservice` application in this repo to see the functionalities, first you need to install `dep`.

> _*NOTE*_: If you are building the application you started in your own repo, your application needs to import the code you just wrote. The code in this tutorial sets the import path is set to this repository (`github.com/cosmos/sdk-application-tutorial`). If you are following along in your own repo you will need to change the import path (in all the files) to reflect that (`github.com/{ .Username }/{ .Project.Repo }`) before building the application.

```bash
# Initialize dep and install dependencies
make get_tools && make get_vendor_deps

# Install the app into your $GOBIN
make install

# Now you should be able to run the following commands:
nsd help
nscli help
```

## Running the live network and using the commands

To initialize configuration and a `genesis.json` file for your application and an account for the transactions, start by running:

> _*NOTE*_: In the below commands addresses are are pulled using terminal utilities. You can also just input the raw strings saved from creating keys, shown below. The commands require [`jq`](https://stedolan.github.io/jq/download/) to be installed on your machine.

> _*NOTE*_: If you have run the tutorial before, you can start from scratch with a `nsd unsafe-reset-all` or by deleting both of the home folders `rm -rf ~/.ns*`

```bash
# Initialize configuration files and genesis file
nsd init --chain-id testchain

# Copy the `Address` output here and save it for later use
nscli keys add jack

# Copy the `Address` output here and save it for later use
nscli keys add alice

# Add both accounts, with coins to the genesis file
nsd add-genesis-account $(nscli keys show jack -a) 1000mycoin,1000jackcoin
nsd add-genesis-account $(nscli keys show alice -a) 1000mycoin,1000alicecoin

# Configure your CLI to eliminate need for chain-id flag
nscli config chain-id testchain
nscli config output json
nscli config indent true
nscli config trust-node true
```

You can now start `nsd` by calling `nsd start`. You will see logs begin streaming that represent blocks being produced, this will take a couple of seconds.

Open another terminal to run commands against the network you have just created:

```bash
# First check the accounts to ensure they have funds
nscli query account $(nscli keys show jack -a) 
nscli query account $(nscli keys show alice -a) 

# Buy your first name using your coins from the genesis file
nscli tx nameservice buy-name jack.id 5mycoin --from jack 

# Set the value for the name you just bought
nscli tx nameservice set-name jack.id 8.8.8.8 --from jack 

# Try out a resolve query against the name you registered
nscli query nameservice resolve jack.id
# > 8.8.8.8

# Try out a whois query against the name you just registered
nscli query nameservice whois jack.id
# > {"value":"8.8.8.8","owner":"cosmos1l7k5tdt2qam0zecxrx78yuw447ga54dsmtpk2s","price":[{"denom":"mycoin","amount":"5"}]}

# Alice buys name from jack
nscli tx nameservice buy-name jack.id 10mycoin --from alice 
```

### Congratulations, you have built a Cosmos SDK application! This tutorial is now complete. If you want to see how to run the same commands using the REST server [click here](./run-rest.md).
