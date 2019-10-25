---
order: 21
---

# Module

The Cosmos SDK provides a standard interface for modules. This [`AppModule`](https://github.com/cosmos/cosmos-sdk/blob/master/types/module.go) interface requires modules to provide a set of methods used by the `ModuleBasicsManager` to incorporate them into your application. First we will scaffold out the interface and implement **some** of its methods.

Lets start with adding the following code to `module.go`. We will leave a number of the functions unimplemented for now.

<<<@/auction/x/auction/module.go
