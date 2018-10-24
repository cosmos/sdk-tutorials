# Example SDK Application Tutorial

In this tutorial, you will build a functional [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) application and, in the process, learn the basic concepts and structures in the SDK. Then you can get started building your own modules and include them in decentralized applications of your own design.

By the end of this tutorial you will have a functional `nameservice` application, a mapping of strings to other strings (`map[string]string`). This is similar to [Namecoin](https://namecoin.org/), [ENS](https://ens.domains/), or [Handshake](https://handshake.org/), which all model the traditional DNS systems (`map[domain]zonefile`). Users will be able to buy unused names, or sell/trade their name.

All of the final source code for this tutorial project is in this directory (and compiles), however, it is best to follow along manually and try building the project yourself!

### Requirements:

- [`golang` >1.11](https://golang.org/doc/install) installed
- A working [`$GOPATH`](https://github.com/golang/go/wiki/SettingGOPATH)
- Desire to create your own blockchain!

### Tutorial Parts:

Through the course of this tutorial you will create the following files that make up your application:

```bash
./nameservice
├── Gopkg.toml
├── app.go
├── cmd
│   ├── nameservicecli
│   │   └── main.go
│   └── nameserviced
│       └── main.go
└── x
    └── nameservice
        ├── client
        │   └── cli
        │       ├── query.go
        │       └── tx.go
        ├── codec.go
        ├── handler.go
        ├── keeper.go
        ├── msgs.go
        └── querier.go
```

Start by creating a new git repository:

```bash
cd $GOPATH/src/github.com/{{ .Username }}
git init
```

Then, just follow along! The first step describes the design of your application. If you want to jump directly to the coding section, you can start with the [second step](./tutorial/keeper.md)

1. [Design](./tutorial/app-design.md) the application
1. Build your [`Keeper`](./tutorial/keeper.md)
2. Define interactions with your chain through [`Msgs` and `Handlers`](./tutorial/msgs-handlers.md)
    * [`SetName`](./tutorial/set-name.md)
    * [`BuyName`](./tutorial/buy-name.md)
3. Make views on your state machine with [`Queriers`](./tutorial/queriers.md)
4. Register your types in the encoding format using [`sdk.Codec`](./tutorial/codec.md)
5. Create [CLI interactions for your module](./tutorial/cli.md)
6. Import your module and build your application in [`./app.go`](./tutorial/app.md)!
7. Create the [`nameserviced` and `nameservicecli` entry points](./tutorial/entrypoint.md) to your application
8. Setup [dependency management using `dep`](./tutorial/dep.md)


### Building the `nameservice` application

If you want to build the `nameservice` application in this repo to see the functionality, first you need to install `dep`.

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

### Running the live network and using the commands

To initialize configuration and a `genesis.json` file for your application and an account for the transactions start by running:

> _*NOTE*_: Copy the `chain-id` from the output of the first command, and `Address` from the output of the second and save it for use when running the application commands a bit further down

```bash
# Copy the chain_id output here and save it for later user
nameserviced init

# Copy the `Address` output here and save it for later use
nameservicecli keys add jack
```

Next open the generated file `~/.nameserviced/config/genesis.json` in a text editor and copy in the address output by adding a key above. This will give you control over a wallet with some coins when you start your local network. You can now start `nameserviced` by calling `nameserviced start`. You will see logs begin streaming that represent blocks being produced.

Open another terminal to run commands against the network you have just created:

> _*NOTE*_: In the below commands `--chain-id` and `accountaddr` are pulled using terminal utilities. You can also just input the raw strings saved from bootstrapping the network above. The commands require [`jq`](https://stedolan.github.io/jq/download/) to be installed on your machine.

```bash
# First check the account to ensure you have funds
nameservicecli query account $(nameservicecli keys list -o json | jq -r .[0].address) --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id)

# Buy your first name using your coins from the genesis file
nameservicecli tx  buy-name jack.id 5mycoin --from $(nameservicecli keys list -o json | jq -r .[0].address) --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id)

# Set the value for the name you just bought
nameservicecli tx set-name jack.id 8.8.8.8 --from $(nameservicecli keys list -o json | jq -r .[0].address) --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id)

# Try out a resolve query against the name you registered
nameservicecli query resolve jack.id --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id)
# > 8.8.8.8

# Try out a whois query against the name you just registered
nameservicecli query whois jack.id --chain-id $(cat ~/.nameserviced/config/genesis.json | jq -r .chain_id)
# > {"value":"8.8.8.8","owner":"cosmos1l7k5tdt2qam0zecxrx78yuw447ga54dsmtpk2s","price":[{"denom":"mycoin","amount":"5"}]}
```
