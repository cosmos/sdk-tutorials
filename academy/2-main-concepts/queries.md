---
title: "Queries"
order: 10
description: Query lifecycle and working with queries
tag: deep-dive
---

# Queries

<HighlightBox type="synopsis">

Queries are one of two primary objects handled by modules. This section describes the lifecycle of a query in a Cosmos SDK application, from the user interface to application stores and back.

</HighlightBox>

A query is a request for information made by end users of applications through an interface and processed by a full-node. Users can query information about the network, the application itself, and the application state directly from the application's stores or modules. Note that queries are different from transactions particularly in that they do not require consensus to be processed, as they do not trigger state transitions. Queries can be fully handled by one full-node.

<HighlightBox type="tip">

Do you need a refresher of transaction lifecycles in the Cosmos SDK or want to directly compare the query lifecycle with the lifecycle of transactions? Take a look at the [section on transactions](./transactions.md).

</HighlightBox>

Assume `MyQuery` is requesting a list of delegations made by a certain delegator address in the application called `simapp`. As expected, the staking module handles this query. There are a few ways `MyQuery` can be created by users.

## CLI

The main interface for an application is the command-line interface (CLI). Users connect to a full-node and run the CLI directly from their machines - the CLI interacts directly with the full-node. Users type the following command to create `MyQuery` in the terminal:

```sh
simd query staking delegations <delegatorAddress>
```

This query command is defined by the staking module developer and is added to the list of subcommands by the application developer when creating the CLI.

Note that the general format is as follows:

```sh
simd query [moduleName] [command] <arguments> --flag <flagArg>
```

To provide values such as `--node` (the full-node the CLI connects to) the user can use the `app.toml` config file to set them or provide them as flags.

The CLI understands a specific set of commands. The commands are defined in a hierarchical structure by the application developer:

* The root command: `simd`
* The type of command: `Myquery`
* The module that contains the command: `staking`
* The command itself: `delegations`

The CLI knows exactly which module handles the command and directly passes the call.

## gRPC

A patch introduced in Go gRPC v1.34.0 made gRPC incompatible with the gogoproto library, making some gRPC queries panic. The Cosmos SDK requires that Go gRPC v1.33.2 is installed in your `go.mod`.

<HighlightBox type="info">

Please see [issue #8392](https://github.com/cosmos/cosmos-sdk/issues/8392) for more information on the Go gRPC issue with the Cosmos SDK.

</HighlightBox>

It is highly recommended to add the following line in your application's `go.mod` to make sure that gRPC is working properly:

```sh
replace google.golang.org/grpc => google.golang.org/grpc v1.33.2
```

Another interface through which users can make queries was introduced in Cosmos SDK v0.40: gRPC requests to a gRPC server. The endpoints are defined as Protocol Buffers service methods inside `.proto` files, written in Protobuf's own language-agnostic interface definition language (IDL). The Protobuf ecosystem developed tools for code generation from `.proto` files into various languages. These tools allow building gRPC clients easily.

One such tool is `grpcurl`. A gRPC request for `MyQuery` using this client looks like this:

```sh
Copy grpcurl \
    -plaintext                                           # We want results in plain test
    -import-path ./proto \                               # Import these .proto files
    -proto ./proto/cosmos/staking/v1beta1/query.proto \  # Look into this .proto file for the Query protobuf service
    -d '{"address":"$MY_DELEGATOR"}' \                   # Query arguments
    localhost:9090 \                                     # gRPC server endpoint
    cosmos.staking.v1beta1.Query/Delegations             # Fully-qualified service method name
```

## REST

Users can also make queries through HTTP requests to a [REST server](https://docs.cosmos.network/master/core/grpc_rest.html#rest-server). The REST server is fully auto-generated from Protobuf services using gRPC-gateway.

An example HTTP request for `MyQuery` would look like this:

```sh
GET http://localhost:1317/cosmos/staking/v1beta1/delegators/{delegatorAddr}/delegations
```

## How queries are handled by the CLI

The examples above show how an external user can interact with a node by querying its state.

<HighlightBox type="tip">

Dig into how the CLI prepares the query and how the node handles it to understand more in detail the exact lifecycle of a query.

</HighlightBox>

From a users' perspective, the interactions are a bit different, but the underlying functions are almost identical because they are implementations of the same command defined by the module developer. This processing step takes place within the CLI, gRPC, or REST server and heavily involves a `client.Context`.

## Context

The first thing created in the execution of a CLI command is a `client.Context`. A `client.Context` is an object that stores all the data needed to process a request on the user side. It stores the following:

* **Codec:** The [encoder/decoder](https://docs.cosmos.network/master/core/encoding.html) used by the application to marshal the parameters and query before making the Tendermint RPC request and unmarshal the returned response into a JSON object. The default codec used by the CLI is Protobuf.
* **Account decoder:** The account decoder from the [auth](https://docs.cosmos.network/master/x/auth/spec/) module, which translates `[]bytes` into accounts.
* **RPC client:** The Tendermint RPC client or node to which the request is relayed.
* **Keyring:** A [key manager](https://docs.cosmos.network/master/basics/accounts.html#keyring) used to sign transactions and handle other operations with keys.
* **Output writer:** A [writer](https://golang.org/pkg/io/#Writer) used to output the response.
* **Configurations:** The flags configured by the user for this command, including `--height` specifying the height of the blockchain to query and `--indent` indicating adding an indent to the JSON response.

The `client.Context` also contains various functions such as `Query()`, which retrieves the RPC Client and makes an ABCI call to relay a query to a full-node.

```sh
// Context implements a typical context created in SDK modules for transaction
// handling and queries.
type Context struct {
	FromAddress       sdk.AccAddress
	Client            rpcclient.Client
	ChainID           string
	JSONMarshaler     codec.JSONMarshaler
	InterfaceRegistry codectypes.InterfaceRegistry
	Input             io.Reader
	Keyring           keyring.Keyring
	Output            io.Writer
	OutputFormat      string
	Height            int64
	HomeDir           string
	KeyringDir        string
	From              string
	BroadcastMode     string
	FromName          string
	SignModeStr       string
	UseLedger         bool
	Simulate          bool
	GenerateOnly      bool
	Offline           bool
	SkipConfirm       bool
	TxConfig          TxConfig
	AccountRetriever  AccountRetriever
	NodeURI           string

	// TODO: Deprecated (remove).
	LegacyAmino *codec.LegacyAmino
}
```

The `client.Context`'s primary role is to store data used during interactions with the end user and provide methods to interact with this data - it is used before and after the query is processed by the full-node.

When handling `MyQuery` the `client.Context` is utilized to encode the query parameters, retrieve the full-node, and write the output. The query needs to be encoded into a `[]byte` form before being relayed to a full-node, as full-nodes are application-agnostic and do not understand specific types. The full-node (RPC client) itself is retrieved using the `client.Context`, which knows which node the user CLI is connected to. The query is relayed to this full-node to be processed. The `client.Context` contains a writer to write output when the response is returned.

## Arguments and route creation

At this point in the lifecycle, the user has created a CLI command with all of the data to be included in their query. A `client.Context` exists to assist with the rest of the `MyQuery`'s journey. The next step is to parse the command or request, extract the arguments, and encode everything. These steps all happen on the user-side within the interface the user interacts with.

## Encoding

`MyQuery` contains an address `delegatorAddress` as its only argument when querying an address' delegations. However, the request can only contain []bytes as it is relayed to a consensus engine (e.g. Tendermint Core) of a full-node, which has no inherent knowledge of the application types. The codec of `client.Context` is used to marshal the address.

Below see how the code looks like for the CLI command:

```sh

 			delAddr, err := sdk.AccAddressFromBech32(args[0])
			if err != nil {
				return err
			}

```

## gRPC query client creation

The Cosmos SDK leverages code generated by Protobuf services to make queries. The staking module's `MyQuery` service generates a `queryClient` used by the CLI to make queries:

```sh
 			clientCtx, err := client.GetClientQueryContext(cmd)
			if err != nil {
				return err
			}
			queryClient := types.NewQueryClient(clientCtx)

			delAddr, err := sdk.AccAddressFromBech32(args[0])
			if err != nil {
				return err
			}

			pageReq, err := client.ReadPageRequest(cmd.Flags())
			if err != nil {
				return err
			}

			params := &types.QueryDelegatorDelegationsRequest{
				DelegatorAddr: delAddr.String(),
				Pagination:    pageReq,
			}

			res, err := queryClient.DelegatorDelegations(context.Background(), params)
			if err != nil {
				return err
			}
```

The `client.Context` has a `Query()` function used to retrieve the pre-configured node and relay a query to it. The function takes the query fully-qualified service method name as path (here `/cosmos.staking.v1beta1.Query/Delegations`) and arguments as parameters. It first retrieves the RPC client (the node) configured by the user to relay the query to and creates the `ABCIQueryOptions`, the parameters formatted for the ABCI call. The node is then used to make the ABCI call `ABCIQueryWithOptions()`:

```go
func (ctx Context) queryABCI(req abci.RequestQuery) (abci.ResponseQuery, error) {
	node, err := ctx.GetNode()
	if err != nil {
		return abci.ResponseQuery{}, err
	}

	opts := rpcclient.ABCIQueryOptions{
		Height: ctx.Height,
		Prove:  req.Prove,
	}

	result, err := node.ABCIQueryWithOptions(context.Background(), req.Path, req.Data, opts)
	if err != nil {
		return abci.ResponseQuery{}, err
	}

	if !result.Response.IsOK() {
		return abci.ResponseQuery{}, errors.New(result.Response.Log)
	}

	// data from trusted node or subspace query doesn't need verification
	if !opts.Prove || !isQueryStoreWithProof(req.Path) {
		return result.Response, nil
	}

	return result.Response, nil
}
```

## RPC

With a call to `ABCIQueryWithOptions()` a full-node receives `MyQuery`. The node then processes the request.

While the RPC is made to the consensus engine (e.g. Tendermint Core) of a full-node, queries are not part of the consensus and will not be broadcast to the rest of the network, as they do not require anything the network needs to agree upon (consensus).

<HighlightBox type="info">

Read more on ABCI clients and Tendermint RPC in the Tendermint documentation on [RPC](https://tendermint.com/rpc).

</HighlightBox>

## Application query handling

When a query is received by the full-node after being relayed from the underlying consensus engine, it is handled within an environment that understands application-specific types and has a copy of the state. [`BaseApp`](https://docs.cosmos.network/master/core/baseapp.html) implements the ABCI [query](https://docs.cosmos.network/master/core/baseapp.html#query) function and handles gRPC queries. The query route is parsed and matches the fully-qualified service method name of an existing service method (most likely in one of the modules). `BaseApp` then relays the request to the relevant module.

Apart from gRPC routes, `BaseApp` also handles four different types of queries:

* `app`
* `store`
* `p2p`
* `custom`

The first three types, `app`, `store`, and `p2p`, are purely application-level and thus directly handled by `BaseApp` or the stores. The custom query type requires `BaseApp` to route the query to a module's [legacy queriers](https://docs.cosmos.network/master/building-modules/query-services.html#legacy-queriers).

<HighlightBox type="tip">

To learn more about these queries, check out the [Cosmos SDK documentation on Tendermint RPC](https://docs.cosmos.network/master/core/grpc_rest.html#tendermint-rpc).

</HighlightBox>

Since `MyQuery` has a fully-qualified Protobuf service method name from the staking module, `BaseApp`:

1. Parses the path.
2. Retrieves the corresponding gRPC handler with its own internal `GRPCQueryRouter`.
3. Routes the query to the module.

The gRPC handler is responsible for recognizing the query, retrieving the appropriate values from the application's stores, and returning a response.

<HighlightBox type="tip">

Take a closer look at the [Cosmos documentation on query services](https://docs.cosmos.network/master/building-modules/query-services.html) for more on query services.

</HighlightBox>

Once a result is received from the querier, `BaseApp` begins the process of returning a response to the user.

## Response

`BaseApp` returns the response as an [`abci.ResponseQuery`](https://tendermint.com/docs/spec/abci/abci.html#messages) type since `Query()` is an ABCI function. The `client.Context` `Query()` routine receives the response and responds to the user.

## CLI response

The application's [codec](https://docs.cosmos.network/master/core/encoding.html) is used to unmarshal the response to a JSON and the `client.Context` prints the output to the command line applying any configurations such as the output type (text, JSON, or YAML).

```go
func (ctx Context) printOutput(out []byte) error {
	if ctx.OutputFormat == "text" {
		// handle text format by decoding and re-encoding JSON as YAML
		var j interface{}

		err := json.Unmarshal(out, &j)
		if err != nil {
			return err
		}

		out, err = yaml.Marshal(j)
		if err != nil {
			return err
		}
	}

	writer := ctx.Output
	if writer == nil {
		writer = os.Stdout
	}

	_, err := writer.Write(out)
	if err != nil {
		return err
	}

	if ctx.OutputFormat != "text" {
		// append new-line for formats besides YAML
		_, err = writer.Write([]byte("\n"))
		if err != nil {
			return err
		}
	}

	return nil
}
```

The result of the query is outputted to the console by the CLI.

## Next up

You can now continue with the [next section](./events.md) if you want to skip ahead and read up on events.

If you prefer to see some code in action and continue with the checkers blockchain, take a look at the expandable box beneath.

<ExpansionPanel title="Show me some code for my checkers blockchain">

If you have used Starport so far, it has already created queries for you to get one stored game or a list of them. You still do not have a way to check whether a move works/is valid. It would be wasteful to send a transaction with an invalid move. It is better to catch such a mistake before submitting a transaction. So you are going to create a query to know whether a move is valid.

Starport can again help you with a simple command:

```sh
$ starport scaffold query canPlayMove idValue player fromX:uint fromY:uint toX:uint toY:uint --module checkers --response possible:bool
```

This creates the query objects:

```go
type QueryCanPlayMoveRequest struct {
    IdValue string
    Player  string
    FromX   uint64
    FromY   uint64
    ToX     uint64
    ToY     uint64
}

type QueryCanPlayMoveResponse struct {
    Possible bool
    Reason   string // Actually, you have to add this one by hand.
}
```

It also creates a function that should looks familiar:

```go
func (k Keeper) CanPlayMove(goCtx context.Context, req *types.QueryCanPlayMoveRequest) (*types.QueryCanPlayMoveResponse, error) {
    ...
    // TODO: Process the query

    return &types.QueryCanPlayMoveResponse{}, nil
}
```

So now you are left with filling in the gaps under `TODO`. Simply put:

1. Is the game finished? You should add a `Winner` to your `StoredGame` first.
2. Is it an expected player?

    ```go
    var player rules.Player
    if strings.Compare(rules.RED_PLAYER.Color, req.Player) == 0 {
        player = rules.RED_PLAYER
    } else if strings.Compare(rules.BLACK_PLAYER.Color, req.Player) == 0 {
        player = rules.BLACK_PLAYER
    } else {
        return &types.QueryCanPlayMoveResponse{
                Possible: false,
                Reason:   "message creator is not a player",
            }, nil
    }
    ```

3. Is it the player's turn?

    ```go
    fullGame := storedGame.ToFullGame()
        if !fullGame.Game.TurnIs(player) {
            return &types.QueryCanPlayMoveResponse{
                Possible: false,
                Reason:   "player tried to play out of turn",
            }, nil
        }
    ```

4. Attempt the move in memory without committing any new state:

    ```go
    _, moveErr := fullGame.Game.Move(
        rules.Pos{
            X: int(req.FromX),
            Y: int(req.FromY),
        },
        rules.Pos{
            X: int(req.ToX),
            Y: int(req.ToY),
        },
    )
    if moveErr != nil {
        return &types.QueryCanPlayMoveResponse{
            Possible: false,
            Reason:   fmt.Sprintf("wrong move", moveErr.Error()),
        }, nil
    }
    ```

5. If all checks passed, return the OK status:

    ```go
    return &types.QueryCanPlayMoveResponse{
        Possible: true,
        Reason:   "ok",
    }, nil
    ```

Note that the player's move will be tested against the latest validated state of the blockchain. It does not test against the intermediate state being calculated as transactions are delivered, nor does it test against the potential state that would result from delivering the transactions still in the transaction pool.

A player can test their move only once the opponent's move is included in a previous block. These types of edge-case scenarios are not common in your checkers game and you can expect little to no effect on the user experience.

This is not an exhaustive list of potential queries. Some examples of other possible queries would be to get a player's open games or to get a list of games that are timing out soon. It depends on the needs of your application and how much functionality you willingly provide.

</ExpansionPanel>
