---
order: 3
---

# Module

Cosmos-SDK applications are composed from a set of mostly decoupled reuseable
modules that are then tied together in and configured in `app.go`. Modules are
responsible for defining Messages that trigger state transitions as well as
handler and querier functions for receiving messages and retrieving the chain
state modified by those Messages.

For this tutorial we are going to build a `greeter` module that adds the "hello
world" functionality we want while relying upon a bundle of several other modules from the
SDK to provide the rest of the blockchain functionality ( bank, auth, staking, genacounts, etc; for a full list see the import() section at the top of `app.go`)

Every module must implement the [AppModule
interface](https://github.com/cosmos/cosmos-sdk/blob/master/types/module/module.go#L130).
Let's make use of the`stcaffold module` command to generate much of the boilerplate reqiured.
Then we will come back and implement the methods for our module that we need.
`scaffold module` works as follows
```bash
Usage:
  scaffold module [user] [repo] [moduleName] [flags]
  ````

  assuming our app is at `$GOPATH/github.com/cosmos/sdk-tutorials/hellochain`we would want to run the following to generate our module (note modules live in the `x/` directory by convention).
  ```
  bash
  $ cd hellochain/x
  $ scaffold module cosmos sdk-tutorials/hellochain greeter
  ```
  This will generate a module scaffold for us called greeter Like our app scaffold it contains many ToDos. This tutorial will walk through completing each one.




<<< @/hellochain/x/greeter/module.go
