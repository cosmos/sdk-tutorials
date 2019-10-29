---
order: 22
---

# Client

The Cosmos-SDK enables two forms of interaction with the chain. Currently it exposes a REST api for application developers to ingest and a command line interface.
Through this section we will be working on implementing both the REST server and the CLI.

Start by creating a folder named `client` in the root of the module.
Within this folder create two more folders, one named `rest` and the other `cli`.

## REST

To Begin we will be doing the REST implementation.

Start by creating a `rest.go` file in which you will Register your Tx and query routes.

You can copy the file from here:

<<<@/auction/x/auction/client/rest/rest.go

### Queries

Next we want to create our queries for the API. Create a `query.go` file and create the function that we are calling in `rest.go`, `registerQueryRoutes()`.

We want to have two functions one to query a specific auction `queryAuction()` and one to query all the auctions `queryAuctions()`. Within all these queries we will enable height queries, this allows the user to query for state at certain block heights.

Start with `queryAuction()`, this function takes one parameter cliCtx (type context.CLIContext) and returns a http.HandlerFunc.

Some of the things that will be included in this part can be reused in multiple queries.

```go
func queryData(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
    param := vars["param"]

    // Height Query, this allows you to query data from a specific height
		cliCtx, ok := rest.ParseQueryHeightOrReturnBadRequest(w, cliCtx, r)
		if !ok {
			return
		}

		params := types.ParamsOfTheUrl(param) // this was defined in the types section, some queries will not require params, and in that case you can skip this part and the next sectin.

		bz, err := cliCtx.Codec.MarshalJSON(params)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
    }

    // Here is where you will be querying the store of your application
		res, height, err := cliCtx.QueryWithData("custom/moduleName/route", bz)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
			return
		}
    // here you are returning the data that the user queried
		cliCtx = cliCtx.WithHeight(height)
		rest.PostProcessResponse(w, cliCtx, res)
	}
}
```

Next you want to implement a way to query all the auctions that are in you application state.

### Transactions

We want to have a way to create Transactions as well to alter the state of the application.

Start by creating a `tx.go` file and the function that you used in `rest.go`, `RegisterTxRoutes()` within it. Here you will register all of your Tx routes for your application.

We will start with a POST request to create auctions. To do this there are two things you need:

1. Create the type that the request will be. In the createAuction case it will consist of the baseReq type (Basreq), nftID, nftDenom, owner and endTime. Once these are created then you must create the function that will be used in order to execute your Tx.

```go
func createHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createAuctionReq

    // Check the request
		if !rest.ReadRESTReq(w, r, cliCtx.Codec, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}

		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
    }

    // addresses are recieved as strings so they must be transformed into a valid address type
		addr, err := sdk.AccAddressFromBech32(req.Owner)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
    }

		msg := types.NewMsgType(params) // here you will call your specific message type.
		err = msg.ValidateBasic() // do a sanity check in order to make sure the message meets the prefined criteria
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
    }

    // write your tx to the blockchain in order for it to be written to state.
		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}
```

You will have to create the function for the createAuction use case.

Next we need a to create a REST endpoint for submitting a bid. This type will need the BaseReq, nftID, bid and the bidder. The format of the function will share many similar characteristics with the above function.

## CLI

Next we will implement the command line interface for the application. The Cosmos-SDK uses [cobra](https://github.com/spf13/cobra) for the command line, this is a highly used library in the go ecosystem for command line interactions.

### Queries

We will be starting with the querying section of the CLI. To start create a `cli` folder in the `client` folder and then create a `query.go` folder. We will first define a function that is being called in `module.go` in the root of the module.

To get started we must define the main query command for the module

**Hint:**

```go
func GetQueryCmd(queryRoute string, cdc *codec.Codec) *cobra.Command {
	queryCmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "Querying commands for the nft auction module",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}

	queryCmd.AddCommand(client.GetCommands(
    // commands will be added here as they are created
	)...)

	return queryCmd
}
```

We need to define two queries, similar to how the ones that we defined for the REST api, one for a specific auction and one for all auctions.

**Hint:**

```go
func GetCmdName(queryRoute string, cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "<command> [args]"
		Short: "short description on the command",
		Args:  cobra.ExactArgs(1), // if you are not expecting ant args, this can left blank
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)
			arg := args[0]

      // define the route you will need to use to query your data
			res, _, err := cliCtx.QueryWithData(fmt.Sprintf("custom/%s/moduleName/%s", queryRoute, arg), nil)
			if err != nil {
				fmt.Printf("could not find the item")
				return err
      }

      // unmarshal the data and return it to be printed out to the terminal
			var item types.item
			cdc.MustUnmarshalJSON(res, &item)
			return cliCtx.PrintOutput(item)
		},
	}
}
```

### Transactions

Next we will implement the transactions for the command line.

Start by creating a `tx.go` file in the `client` folder. You will start the same way the queries file started, by creating a `GetTxCmd()`. Then we will create two functions:

1. `GetCmdCreateAuction(cdc *codec.Codec)`
2. `GetCmdPlaceBid(cdc *codec.Codec)`

**Hint:**

```go
func GetCmdAction(cdc *codec.Codec) *cobra.Command {
	return &cobra.Command{
		Use:   "<command> [args]"
		Short: "short description on the command",
		Args:  cobra.ExactArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			cliCtx := context.NewCLIContext().WithCodec(cdc)

      txBldr := auth.NewTxBuilderFromCLI().WithTxEncoder(utils.GetTxEncoder(cdc))

        // if you need to parse or change a type make sure to do it here

        // call the msg you created in msg.go, similar to how it was done in the REST section

        // here you will be submitting the tx to the chain to alter state
			return utils.GenerateOrBroadcastMsgs(cliCtx, txBldr, []sdk.Msg{msg})
		},
	}
}
```

### The next page will consist of the answer
