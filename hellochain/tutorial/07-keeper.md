---
order: 9
---

# Keeper

Each module's Keeper is responsible for CRUD operations to the main datastore
of the application. In MVC terms it would be the "model". With more
sophisticated applications, modules may have access to each other's Keepers for
cross-module interactions but in this simple case our Keeper will manage the
state of Greetings on its own.

Add this to `x/greeter/internal/keeper/keeper.go`

<<< @/hellochain/x/greeter/internal/keeper/keeper.go
