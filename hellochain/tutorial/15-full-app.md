---
order: 15
---

# Full App

Ok, our `greeter` module is ready to be incorporated into our application. First
we will create its Keeper before we insert it into the ModuleManager alongside
those added by the `starter`. Then we create a keeper, construct an AppModule
and add greeter's AppModuleBasic and AppModule alongside the other modules.

Update your `app.go` to look like the following

<<< @/hellochain/app.go