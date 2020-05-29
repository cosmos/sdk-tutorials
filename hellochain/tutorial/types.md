---
order: 2
---

# Types

Before we begin the module let generate the needed files. Using the scaffold app you can generate a general module.

```bash
cd x
scaffold module [user] [repo] [moduleName]
```

In the previous section we added a your username and HelloChain as the repo, for this part we have to name the module. Lets go with greeter for this tutorial.


The main struct of our module will be the `Greeting`. We will use this when
creating/updating and retrieving the "greetings" sent to our fullnode. Let's
define this struct and other necessary components for a types package in a types file inside the `x/greeter/types` directory

Save this to `x/greeter//types/types.go`

<<< @/hellochain/x/greeter/types/types.go
