---
order: 12
---

# REST

Now it's time to build the tools for interacting with our app (submitting
transactions, queries, etc). Each module contains a client package that
provides its specific `tx` and `query` functionality. Generally modules provide
both CLI and REST client support. First we wil implement `GetTxCmd` and `GetQueryCmd` for our `greeter`
module's CLI command. these functions are included in the AppModule Interface and return cobra commands for our module,These will then later be used to incorporate
`greeter`'s functionality into our app'sCLI tool.

## TxCmd

Next we need to implement `greeter's`  `RegisterRoutes` a function that will specify the REST interface, routes and handler functions for our greeter module Like our CLI commands we will divide these routes by query (read-only) and Tx ( writes).We will specify the Handler functions in their own files and then register them to specific routes in `rest.go`
p
# Query REST Handlers
open `hellochain/x/greeter/client/rest/query.,go` and add the following query handler function.

<< @/hellochain/x/greeter/client/rest/query.go

# Tx REST Handlers
open `hellochain/x/greeter/client/rest/tx.go` and add the following Tx handler function.
<< @/hellochain/x/greeter/client/rest/tx.go

# RegisterRoutes
Lastly open `hellochain/x/greeter/client/rest/rest.go` and fill out `RegisterRoutes` as follows this fgunction ties together the REST interface for our module.
p<< @/hellochain/x/greeter/client/rest/rest.go
ellochain/x/greeter/client/rest/tx.go
