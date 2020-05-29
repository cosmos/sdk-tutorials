---
order: 9
---
# CLI

Now it's time to build the tools for interacting with our app (submitting
transactions, queries, etc). Each module contains a client package that
provides its specific `tx` and `query` functionality. Generally modules provide
both CLI and REST client support. First we will implement `GetTxCmd` and `GetQueryCmd` for our `greeter`
module's CLI command. these functions are included in the AppModule Interface and return cobra commands for our module,These will then later be used to incorporate
`greeter`'s functionality into our app'sCLI tool.


## QueryCmd

And for `greeter`'s `Query CmdListGreetings` we will implement `list`, the command for
querying our blockchain for all greetings from a given address.

And add this to `x/greeter/client/cli/query.go`

<<< @/hellochain/x/greeter/client/cli/query.go


## TxCmd


For `greeter`'s `TxCmd` we will implement `CmdSayHello`, the command for creating and
sending a greeting to an account address.

Add this to `x/greeter/client/cli/tx.go`

<<< @/hellochain/x/greeter/client/cli/tx.go

For a more thorough explanation of an SDK module's CLI client see the [nameservice tutorial here](../../nameservice/tutorial/15-climd.)
