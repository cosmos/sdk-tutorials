---
order: 9
---

# Module

Our `scaffold` tool has done most of the work for us in generating our `module.go` file inside `./x/scavenge/`. One way that our module is different than the simplest form of a module, is that it uses it's own `Keeper` as well as the `Keeper` from the `bank` module. The only real changes needed are under the `AppModule` and `NewAppModule`, where the `bank.Keeper` needs to be added and referenced. The file should look as follows afterwards:

<<< @/scavenge/x/scavenge/module.go

Congratulations you have completed the `scavenge` module!  

This module is now able to be incorporated into any Cosmos SDK application.

Since we don't want to _just_ build a module, but want to build an application that also uses that module, let's go though the process of configuring an app.