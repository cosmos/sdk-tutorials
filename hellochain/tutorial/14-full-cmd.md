---
order: 14
---

# Full Daemon

Now that our `greeter` module has been integrated into our application, we can
update our daemon command the include greeter as well. This requires inserting
greeter into the ModuleBasicManager.

Your `cmd/hcd/main.go` should look like this (you will need to add the two
highlighted lines).

<<< @/hellochain/cmd/hcd/main.go{13,8}
