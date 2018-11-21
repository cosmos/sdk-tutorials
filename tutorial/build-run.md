# Building and running the application

## Building the `nameservice` application

If you want to build the `nameservice` application in this repo to see the functionalities, first you need to install `dep`.

> _*NOTE*_: Below there is a command for using a shell script from `dep`'s site to preform this install. If you are uncomfortable `|`ing `curl` output to `sh` (you should be) then check out [your platform specific installation instructions](https://golang.github.io/dep/docs/installation.html).

```bash
# Install dep
curl https://raw.githubusercontent.com/golang/dep/master/install.sh | sh

# Initialize dep and install dependencies
make get_tools && make get_vendor_deps

# Install the app into your $GOBIN
make install

# Now you should be able to run the following commands:
nameserviced help
nameservicecli help
```

## Running the live network and using the commands

To initialize configuration and a `genesis.json` file for your application and an account for the transactions start by running:

> _*NOTE*_: Copy the `chain-id` from the output of the first command, and `Address` from the output of the second and save it for use when running the application commands a bit further down

```bash
# Copy the chain_id and app_message.secret output here and save it for later user
nameserviced init

# Use app_message.secret recover jack's account. 
# Copy the `Address` output here and save it for later use
nameservicecli keys add jack --recover

# Create another account with random secret.
# Copy the `Address` output here and save it for later use
nameservicecli keys add tim

```

Next open the generated file `~/.nameserviced/config/genesis.json` in a text editor and copy the address output from the `nameservicecli keys add` command in the `"address"` field under `"accounts"`. This will give you control over a wallet with some coins when you start your local network.

You can now start `nameserviced` by calling `nameserviced start`. You will see logs begin streaming that represent blocks being produced.

Open another terminal to run commands against the network you have just created:

> _*NOTE*_: In the below commands `--chain-id` and `accountaddr` are pulled using terminal utilities. You can also just input the raw strings saved from bootstrapping the network above. The commands require [`jq`](https://stedolan.github.io/jq/download/) to be installed on your machine.

```bash
# First check the accounts to ensure they have funds
nameservicecli query account $(nameservicecli keys list -o json | jq -r .[0].address) \
    --indent --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id) 
nameservicecli query account $(nameservicecli keys list -o json | jq -r .[1].address) \
    --indent --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id) 

# Buy your first name using your coins from the genesis file
nameservicecli tx buy-name jack.id 5mycoin \
    --from     $(nameservicecli keys list -o json | jq -r .[0].address) \
    --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id)

# Set the value for the name you just bought
nameservicecli tx set-name jack.id 8.8.8.8 \
    --from     $(nameservicecli keys list -o json | jq -r .[0].address) \
    --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id)

# Try out a resolve query against the name you registered
nameservicecli query resolve jack.id --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id)
# > 8.8.8.8

# Try out a whois query against the name you just registered
nameservicecli query whois jack.id --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id)
# > {"value":"8.8.8.8","owner":"cosmos1l7k5tdt2qam0zecxrx78yuw447ga54dsmtpk2s","price":[{"denom":"mycoin","amount":"5"}]}

# Jack send some coin to tim, then tim can buy name from jack.  
nameservicecli tx send \
    --from     $(nameservicecli keys list -o json | jq -r .[0].address) \
    --to       $(nameservicecli keys list -o json | jq -r .[1].address) \
    --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id) \
    --amount 1000mycoin

# Tim buy name from jack
nameservicecli tx buy-name jack.id 10mycoin \
    --from     $(nameservicecli keys list -o json | jq -r .[0].address) \
    --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id)


```

### This tutorial is now over! Click [here](./README.md) to go back at the beginning.
