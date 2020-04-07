---
order: 9
---

# Keeper

Each module's Keeper is responsible for CRUD operations to the module's sub section of the main datastore
of the application. In MVC terms it would be the "model". With more
sophisticated applications, modules may have access to each other's Keepers for
cross-module interactions,  but in this simple case our Keeper will manage the
To see how a module can specify interfaces for the keepers of other modules that it needs to access, check out `expected_keepers.go`
state of Greetings on its own. Lets build out our keeper package to contain the following:

We will put functionality for saving Greetings in`x/greeter/keeper.go` And `x/greeter/keeper/querier.go` wil hiold functions for querying our applicatiuon datastore.
Chain specific params will go in `x/greeter/keeper.pareams.go`
Going through `keeper.go` Fill in the missing types in the scaffolded method signatures with `types.Greeting` and `types.GreetingsList` where the comments in our scaffold indicate.


<<< @/hellochain/x/greeter/keeper/keeper.go
