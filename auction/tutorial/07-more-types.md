---
order: 7
---

# Types Files

## Codec

Within this section we will cover some of the smaller files. In particular we will be covering `codec.go`, `errors.go`, `keys.go`, `querier.go`

The Cosmos-SDK uses its own serialization standard, called [Amino](https://github.com/tendermint/go-amino). In the previous section you created messages, in order for the message to be encoded/decoded they must be registered in the module's codec.

Start By creating a codec file within the types folder: `types/codec.go`

You can do this like so:

<<<@/auction/x/auction/internal/types/codec.go

## Events

Events can be used to index transactions and blocks, you can read in depth on them [here](https://github.com/tendermint/tendermint/blob/f323c80cb3b78e123ea6238c8e136a30ff749ccc/docs/spec/abci/abci.md#events). This is defined in the state transition functions that we will be covering later, but in order to write DRY code we should set some values for the keys of the event.

Start By creating a events file within the types folder: `types/events.go`

Then setting variables like so:

<<<@/auction/x/auction/internal/types/events.go

## Key

Keys fo the modules are defined in the `internal/types` directory then exposed via the `alias.go` file. With in the `key.go` file we want to define three constants:

1. A `ModuleName` which is the modules name
2. A `RouterKey` which is the `ModuleName`
3. A `StoreKey` which is the `ModuleName` as well.

<<<@/auction/x/auction/internal/types/key.go

## Querier

Queries to the stores from the rest server will consist of some parameters in the URL. To help with this we define the parameters in `querier.go` in order to simplify the queries that we will be writing later on. In our case we will only have two query routes from this module, one of which will come with a parameter.

Here you can see how it is defined:

<<<@/auction/x/auction/internal/types/querier.go
