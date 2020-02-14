---
order: 13
---

# CLI

Now that we have implemented `greeter`'s client CLI commands, let's add them to
our `hccli` CLI tool so we can create and query greetings!

Your `cmd/hccli/main.go` should look like this (add the highlighted lines).

<<< @/hellochain/cmd/hccli/main.go{8,13}

We call `starter.BuildModuleBasics()` to add `greeter`. `starter.GetTxCmd` and
`starter.GetQueryCmd` collect the Tx and query commands for every module in the
ModuleBasicManager (including `greeter`) to assemble a parent command.
