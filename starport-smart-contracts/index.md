# Smart contracts with CosmWasm

Cosmos application are often written in Go using the Cosmos SDK. The code gets compiled before the chain is launched and effectively the app becomes an intergral part of the chain. If you ever need to update the code of the application, the chain has to go though a process of upgrading.

Another way of building applications is by writing smart contracts. A smart contract is a piece of code that gets written (uploaded) to the chain like any other transaction and then can be executed. The main difference (compared to an SDK module) is that you can create new contracts after the chain has launched, thus adding new functionality while the chain is running.

In this example we'll be using CosmWasm to build, upload, instantiate and execute a smart contract. CosmWasm is implemented as a Cosmos SDK module that includes a WebAssembly virtual machine. Contract code is written using Rust language, compiled locally and uploaded to a chain using the same `appcli` binary used to interact with the chain (where `app` is the name of your application).

## Prerequisites

- [Rust programming language](https://www.rust-lang.org/)
- [Cargo package manager](https://doc.rust-lang.org/cargo/)
- [Docker](https://www.docker.com/)
- [Starport](https://github.com/tendermint/starport)

## Creating a chain

Let's start by creating a new Cosmos application:

```
starport app github.com/example/contracts
```

Inside the `./contracts` directory run the following command to enable CosmWasm:

```
starport add wasm
```

You can also enable it manually by editing several files in the project directory: see "Adding CosmWasm support manually".

Star your application to see that everything builds and launches correctly:

```
starport serve
```

While the command above is running, execute a command in a different terminal to check that `wasm` subcommand has been added:

```
contractscli tx wasm
```

You should see a list of available subcommands: `store`, `instantiate`, `execute`, etc.

## Building and uploading a contract

Now that we have a chain running, let's get ourselves a contract. Using `cargo` clone an existing contract that implements a simple counter application.

```
cargo generate --git https://github.com/CosmWasm/cosmwasm-template.git --name counter
```

This has created a `counter` directory with a contract template. The source code is in `src` directory, where `contracts.rs` implements the main business logic of the contract, `msg.rs` messages that are emitted and handled whenever an action is executed and `state.rs`, which contains the initial state.

Let's build the contract. `Developing.md` contains detailed instructions on testing and building a contract. Run the following command inside `counter` directory to run a production-ready build:

```sh
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/rust-optimizer:0.8.0
```

The contract is built inside a Docker container, where it gets optimized for production. Optimization reduces the size of the resulting bytecode, in our case from 2MB to 100KB.

After the build is complete, there should be a new `contract.wasm` file. This file contains the bytecode of the contract that we will upload to the chain.

Make sure that the blockchain is running and execute:

```
contractcli tx wasm store contract.wasm --from user1 --gas 1000000
```

Subcommand `store` takes `contract.wasm` file, creates a transaction, signs it with the key of `user1`, provides enough gas and broadcasts the transaction.

To check that we have successfully uploaded a contract to the chain run a command and see a list of contract codes (in our case just one):

```
contractscli q wasm list-code
```

Each contract code can be used to create multiple contract instances. Now that we have uploaded the code, let's instantiate our contract. We'll be using `contractscli tx wasm instatitate` command. If we run it with a `--help` flag, we'll see that it expects two arguments (`code_id_int64`, and `json_encoded_init_args`) and a flag (`--label`).

Code ID can be found in the output of the previous `list-code` command: our first code upload was recorded under ID of 1. To see a list of initial arguments, look inside `counter/src/msg.rs` and find a `InitMsg` struct. In this sample counter application it has only one field: `count`.

Run the following command to instantiate our contract:

```
contractscli tx wasm instantiate 1 '{"count": 5}' --from user1 --label mycounter --gas 1000000
```

Now we can see our instantiated contract using `list-contract-by-code` command:

```
contractscli q wasm list-contract-by-code 1
```

Note that a contract has an address, which is used to execute commands on the contract.

We have instantiated a contract with `count` having a value of `5`. Let's check the state of our contract to verify that it indeed stores a value `5`. Make sure to replace the `cosmos17vd8f...` address with the one returned by the previous command:

```
contractscli q wasm contract-state all cosmos18vd8fpwxzck93qlwghaj6arh4p7c5n89uzcee5
```

This command should return a JSON array of objects with `key` and `val` properties. Copy the base64 encoded value of `val` and decode it:

```
echo eyJjb3VudCI6NSwib3duZXIiOiJMUjRLcjhzNHNmNGpQRXZIbG | base64 --decode
```

Going back to `counter/src/msg.rs`, we can see that it has two actions available: increment and reset. Increment does not accept any arguments.

```
contractscli tx wasm execute cosmos18vd8fpwxzck93qlwghaj6arh4p7c5n89uzcee5 '{"increment": {}}' --from user1 --gas 1000000
```

Make sure to use the address of the contract you have instantiated. Notice that even though `increment` does not accept arguments, we still pass an empty object.

To verify that this command has executed successfully, run `contract-state` command and notice how the `count` value has changed. Also, try running `reset` action to reset the value.

Smart contracts are powerful tools that can be used to add features to your blockchain after the launch.

## Adding CosmWasm support manually

### `app/app.go`

```go
import (
  // existing imports
  "path/filepath"
	"github.com/CosmWasm/wasmd/x/wasm"
	"github.com/tendermint/tendermint/libs/cli"
	"github.com/spf13/viper"
)
```

Enable `wasm` module in the module manager:

```go
ModuleBasics = module.NewBasicManager(
  // ...
  wasm.AppModuleBasic{},
)
```

```go
type NewApp struct {
  // ...
  wasmKeeper    wasm.Keeper
  mm *module.Manager
	sm *module.SimulationManager
}
```

```go
keys := sdk.NewKVStoreKeys(
  // ...
  wasm.StoreKey,
)
```

Add the following code before `app.mm = module.NewManager...`

```go
type WasmWrapper struct {
  Wasm wasm.WasmConfig `mapstructure:"wasm"`
}
var wasmRouter = bApp.Router()
homeDir := viper.GetString(cli.HomeFlag)
wasmDir := filepath.Join(homeDir, "wasm")
wasmWrap := WasmWrapper{Wasm: wasm.DefaultWasmConfig()}
err := viper.Unmarshal(&wasmWrap)
if err != nil {
  panic("error while reading wasm config: " + err.Error())
}
wasmConfig := wasmWrap.Wasm
supportedFeatures := "staking"
app.wasmKeeper = wasm.NewKeeper(app.cdc, keys[wasm.StoreKey], app.accountKeeper, app.bankKeeper, app.stakingKeeper, wasmRouter, wasmDir, wasmConfig, supportedFeatures, nil, nil)
```

```go
app.mm = module.NewManager(
  // ...
  wasm.NewAppModule(app.wasmKeeper),
)
```

```go
app.mm.SetOrderInitGenesis(
  // ...
  wasm.ModuleName,
)
```

### `cmd/contractscli/main.go`

Add CLI commands to `contractscli` as `contractscli tx wasm ...` and `contractscli q wasm ...`.

```go
import (
  // ...
  wasmrest "github.com/CosmWasm/wasmd/x/wasm/client/rest"
)
```

```go
func registerRoutes(rs *lcd.RestServer) {
  // ...
	wasmrest.RegisterRoutes(rs.CliCtx, rs.Mux)
}
```
