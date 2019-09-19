# Full App

Ok, our `greeter` module is ready to be incorporated into our application. First
we will create its Keeper before we insert it into the ModuleManager alongside
those added by the `starter`. Then we create a keeper, construct an AppModule
and add greeter's AppModuleBasic and AppModule alongside the other modules.

Update your `app.go` to look like the following

<<< @/app.go{12,1326,27,34,37,40,45,46,50,51,54}
