---
title: "Integrating IBC Middleware Into a Chain"
order: 10
description: Integrate IBC middleware with a base application
tags: 
  - guided-coding
  - ibc
  - dev-ops
---

# Integrate IBC Middleware Into a Chain

<HighlightBox type="learning">

Learn how to integrate Inter-Blokchain Communication Protocol (IBC) middleware(s) with a base application to your chain. The following only applies to Cosmos SDK chains.

</HighlightBox>

You have now seen how to develop an IBC middleware, and the final step in order to use it is to integrate it into the chain. You can distinguish between a single piece of middleware and a stack of middleware, and between middleware that is stateful or stateless.

To integrate middleware (or a middleware stack) you must do the following in `app.go`:

* If the middleware is maintaining its state, processing SDK messages, or both, then it should **create and register its SDK module with the module manager**. Make sure not to create multiple `moduleManager`s but to register all modules in the same one.

  <ExpansionPanel title="Example code">

  ```go
  //app.go

  // create a keeper for the stateful middleware
  mw1Keeper := mw1.NewKeeper(storeKey1)
  mw3Keeper := mw3.NewKeeper(storeKey3)

  // instantiate the middleware as IBCModules
  mw1IBCModule := mw1.NewIBCModule(mw1Keeper)
  mw2IBCModule := mw2.NewIBCModule() // optional: middleware2 is stateless middleware
  mw3IBCModule := mw3.NewIBCModule(mw3Keeper)

  // register the middleware in app module
  // if the module maintains an independent state and/or processes sdk.Msgs
  app.moduleManager = module.NewManager(
      ...
      mw1.NewAppModule(mw1Keeper),
      mw3.NewAppModule(mw3Keeper),
      transfer.NewAppModule(transferKeeper),
      custom.NewAppModule(customKeeper)
  )

  ```

  </ExpansionPanel>

* As mentioned in the previous section, if the middleware wishes to send a packet or acknowledgment without the involvement of the underlying application, it should be given access to the same `scopedKeeper` as the base application so that it can retrieve the capabilities by itself.

  <ExpansionPanel title="Example code">

  ```go
      //app.go

      // add scoped keepers in case the middleware wishes to
      // send a packet or acknowledgment without
      // the involvement of the underlying application
      scopedKeeperTransfer := capabilityKeeper.NewScopedKeeper("transfer")
      scopedKeeperCustom1 := capabilityKeeper.NewScopedKeeper("custom1")
      scopedKeeperCustom2 := capabilityKeeper.NewScopedKeeper("custom2")


  ```

  </ExpansionPanel>

  For example, if the middleware `mw1` needs the ability to send a packet on custom2's port without involving the underlying application `custom2`, it would require access to the latter's `scopedKeeper`:

  ```diff
  - mw1Keeper := mw1.NewKeeper(storeKey1)
  + mw1Keeper := mw1.NewKeeper(storeKey1, scopedKeeperCustom2)
  ```

  <HighlightBox type="note">

  If no middleware (or other modules for that matter) need access to the `scopedKeeper`, there is no need to define them.

  </HighlightBox>

* Each application stack must reserve its own unique port with core IBC. Thus, two stacks with the same base application must bind to separate ports.

  <ExpansionPanel title="Example code">

  ```go
      // initialize base IBC applications
      //
      // if you want to create two different stacks with the same base application,
      // they must be given different scopedKeepers and assigned different ports
      transferIBCModule := transfer.NewIBCModule(transferKeeper)
      customIBCModule1 := custom.NewIBCModule(customKeeper, "portCustom1")
      customIBCModule2 := custom.NewIBCModule(customKeeper, "portCustom2")

  ```

  </ExpansionPanel>

* **The order of middleware matters.** Function calls from IBC to the application travel from top-level middleware through to bottom-level middleware and then to the application. Function calls from the application to IBC rise from the bottom middleware to the top middleware and then to core IBC handlers. Thus the same set of middleware arranged in different orders may produce different effects.

  <HighlightBox type="tip">

  In addition to the diagram shown in the [introduction](./8-ibc-mw-intro.md), also note the direction of information flow through the middleware by looking at the interface:

  ```go
      type Middleware interface {
          IBCModule
          ICS4Wrapper
  }
  ```

  The packet and channel callbacks defined by `IBCModule` run from IBC Core to the base application; the methods defined by `ICS4Wrapper` run from the base application to IBC Core.

  </HighlightBox>

  In the code snippet below, three different stacks are defined:

    <ExpansionPanel title="Example code">
    
    ```go
        // create IBC stacks by combining middleware with the base application
        // NOTE: since middleware2 is stateless it does not require a Keeper
        // stack 1 contains mw1 -> mw3 -> transfer
        stack1 := mw1.NewIBCMiddleware(mw3.NewIBCMiddleware(transferIBCModule, mw3Keeper), mw1Keeper)
        // stack 2 contains mw3 -> mw2 -> custom1
        stack2 := mw3.NewIBCMiddleware(mw2.NewIBCMiddleware(customIBCModule1), mw3Keeper)
        // stack 3 contains mw2 -> mw1 -> custom2
        stack3 := mw2.NewIBCMiddleware(mw1.NewIBCMiddleware(customIBCModule2, mw1Keeper))
        // associate each stack with the moduleName provided by the underlying scopedKeeper
        
    ```
    </ExpansionPanel>

* All middleware must be connected to the IBC router and wrap over an underlying base IBC application. An IBC application may be wrapped by many layers of middleware, **but only the top-layer middleware should be hooked to the IBC router**, with all underlying middlewares and application getting wrapped by it.

  <ExpansionPanel title="Example code">

  ```go
      // associate each stack with the moduleName provided by the underlying scopedKeeper
      ibcRouter := porttypes.NewRouter()
      ibcRouter.AddRoute("transfer", stack1)
      ibcRouter.AddRoute("custom1", stack2)
      ibcRouter.AddRoute("custom2", stack3)
      app.IBCKeeper.SetRouter(ibcRouter)
  ```

  </ExpansionPanel>

Next, take a look at a full example integration, combining all of the above code snippets.

## Example integration

```go
// app.go

scopedKeeperTransfer := capabilityKeeper.NewScopedKeeper("transfer")
scopedKeeperCustom1 := capabilityKeeper.NewScopedKeeper("custom1")
scopedKeeperCustom2 := capabilityKeeper.NewScopedKeeper("custom2")

mw1Keeper := mw1.NewKeeper(storeKey1)
mw3Keeper := mw3.NewKeeper(storeKey3)

mw1IBCModule := mw1.NewIBCModule(mw1Keeper)
mw2IBCModule := mw2.NewIBCModule()
mw3IBCModule := mw3.NewIBCModule(mw3Keeper)

app.moduleManager = module.NewManager(
    ...
    mw1.NewAppModule(mw1Keeper),
    mw3.NewAppModule(mw3Keeper),
    transfer.NewAppModule(transferKeeper),
    custom.NewAppModule(customKeeper)

transferIBCModule := transfer.NewIBCModule(transferKeeper)
customIBCModule1 := custom.NewIBCModule(customKeeper, "portCustom1")
customIBCModule2 := custom.NewIBCModule(customKeeper, "portCustom2")

stack1 := mw1.NewIBCMiddleware(mw3.NewIBCMiddleware(transferIBCModule, mw3Keeper), mw1Keeper)
// stack 2 contains mw3 -> mw2 -> custom1
stack2 := mw3.NewIBCMiddleware(mw2.NewIBCMiddleware(customIBCModule1), mw3Keeper)
// stack 3 contains mw2 -> mw1 -> custom2
stack3 := mw2.NewIBCMiddleware(mw1.NewIBCMiddleware(customIBCModule2, mw1Keeper))

ibcRouter := porttypes.NewRouter()
ibcRouter.AddRoute("transfer", stack1)
ibcRouter.AddRoute("custom1", stack2)
ibcRouter.AddRoute("custom2", stack3)
app.IBCKeeper.SetRouter(ibcRouter)
```

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to integrate IBC middleware(s) with a base application to Cosmos SDK blockchains.
* Creating and registering a middleware's SDK module with the module manager, if the middleware is maintaining its state, processing SDK messages, or both.
* The importance of registering all modules to the same `moduleManger` rather than creating multiple ones.
* How middleware needing to send packets or acknowledgments without involving the underlying application will need access to the same `scopedKeeper` as the base application.
* How each application stack must reserve a unique port with core IBC, even if two stacks share the same base application.
* The importance of middleware ordering within a stack, since changes in the position of middlewares may produce different effects as function calls from and to the application transition up or down through the layers of the stack.
* How only the top-layer middleware should be hooked to the IBC router, regardless of how many underlying middlewares are wrapped by it along with the application.

</HighlightBox>

<!--## Next up

You have now been introduced to developing both custom IBC applications and middleware (and how to integrate these modules in the chain). This opens up a whole range of possibilities for building multichain applications leveraging IBC.

An excellent opportunity to put these newly acquired skills into practice is by following the checkers extension tutorial (soon to be published).-->
