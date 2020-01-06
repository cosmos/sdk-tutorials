---
order: 6
---

# Module

Cosmos-SDK applications are composed from a set of mostly decoupled reuseable
modules that are then tied together in and configured in `app.go`. Modules are
responsible for defining Messages that trigger state transitions as well as
handler and querier functions for receiving messages and retrieving chain
state.

For this tutorial we are going to build a `greeter` module that adds the "hello
world" functionality we want while relying upon several other modules from the
SDK to provide the rest of the blockchain functionality.

Every module must implement the [AppModule
interface](https://github.com/cosmos/cosmos-sdk/blob/master/types/module/module.go#L130).
Let's make use of `starter.BlankModule` to skip much of the boilerplate here.
Then we will come back and implement the methods for our module that we need.
Save the following in `x/greeter/module.go`

<<< @/hellochain/x/greeter/module.go
