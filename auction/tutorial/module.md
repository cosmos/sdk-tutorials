---
order: 2
---

# Module Design

The Cosmos-SDK has a recommended module structure that we will be using within this tutorial. You can read more in depth on how the structure works [here](https://github.com/cosmos/cosmos-sdk/blob/0992c2994ca15131712ab19369f558190434f231/docs/building-modules/structure.md)

The structure is as follows:

```
x/auction
├── client
│   ├── cli
│   │   ├── query.go
│   │   └── tx.go
│   └── rest
│       ├── query.go
│       ├── rest.go
│       └── tx.go
├── exported
│   └── exported.go
├── internal
│   ├── keeper
│   │   ├── invariants.go
│   │   ├── keeper.go
│   │   ├── ...
│   │   └── querier.go
│   └── types
│       ├── codec.go
│       ├── errors.go
│       ├── events.go
│       ├── expected_keepers.go
│       ├── genesis.go
│       ├── keys.go
│       ├── msgs.go
│       ├── params.go
│       ├── ...
│       └── querier.go
├── abci.go
├── alias.go
├── genesis.go
├── handler.go
├── module.go
└── ...
```

- The `client` folder is how you will interact with your module. By default the Cosmos-SDK has the option of exposing a REST server for interaction with the modules directly.
- The `internal` folder is there to define functions and types that are not meant to be directly imported into places outside module. The functions and types that need to be exposed will be aliased from the `alias.go` in the root of the module.
  - With in the `internal folder there are two folders:
    - The `keeper` folder will contain you business logic, your Gets, Sets, and Deletes.
    - The `types` folder will contain the types that you wish your business logic to use for its functionality.
- The `exprorted` folder will house what this module expects from other modules. Primarily the file within this folder will contain [interfaces](https://gobyexample.com/interfaces).
- `abci.go` contains BeginBlocker and EndBlocker functionality, for our module we will be using the endblocker functionality. <Link to docs on this>
- `genesis.go` is the module's genesis related business logic (e.g. InitGenesis). Note, genesis types are defined in internal/types.
- `handler.go` handles all the updates to state msgs. The messages that you require for your application will be in `/internal/types/msgs.go`
- `module.go` is module's implementation of the `AppModule` and `AppModuleBasic` interfaces.

### Next you will begin coding, you will be able to start from a empty directoy.
