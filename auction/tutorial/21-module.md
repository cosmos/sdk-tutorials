---
order: 21
---

# Module

The Cosmos SDK provides a standard interface for modules. This [`AppModule`](https://github.com/cosmos/cosmos-sdk/blob/master/types/module.go) interface requires modules to provide a set of methods used by the `ModuleBasicsManager` to incorporate them into your application.

For this section I recommend copying the page as these functions stay the same throughout modules, other than minor changes to allow for your module specific uses, In our case we will be using endblocker.

<<<@/auction/x/auction/module.go
