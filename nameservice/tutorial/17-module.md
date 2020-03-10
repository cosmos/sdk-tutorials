---
order: 17
---

# AppModule Interface

The Cosmos SDK provides a standard interface for modules. This [`AppModule`](https://github.com/cosmos/cosmos-sdk/blob/master/types/module.go) interface requires modules to provide a set of methods used by the `ModuleBasicsManager` to incorporate them into your application. First we will scaffold out the interface and implement **some** of its methods. Then we will incorporate our nameservice module alongside `auth` and `bank` into our app.

Start by opening two new files, `module.go` and `genesis.go`. We will implement the AppModule interface in `module.go` and the functions specific to genesis state management in `genesis.go`. The genesis-specific methods on your AppModule struct will be pass-though calls to those defined in `genesis.go`.

Lets start with adding the following code to `module.go`. The scaffolding tool has already filled in all the functions with the data that is needed but there are still a couple of to-dos. You will have to add the modules that this module depends on in the `AppModule` type.

<<< @/nameservice/x/nameservice/module.go

To see more examples of AppModule implementation, check out some of the other modules in the SDK such as [x/staking](https://github.com/cosmos/cosmos-sdk/blob/master/x/staking/genesis.go)

### Next, we need to implement the genesis-specific methods called above.
