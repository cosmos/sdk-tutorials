---
order: 4
---

# Handler

Next we need to write a handler function to process the Messages for our module contained in
the transactions delivered in each block. Handlers determine what actions
should be taken (state transitions etc) upon receipt of a `Msg`. Each module
provides a single `NewHandler` method that handles all the `Msg` types for that
module. Here is the `NewHandler` function for our `greeter` module. In MVC
terms this would be the 'controller'. 


the Scaffold tool considers each Message  an Action. Hence you will see the `<Action>` tag in the boilerplate code. In our case our Action is to `Greet`, so lets update `Msg<Action>` to be `MsgGreet` and so forth.

When finished, `x/greeter/handler.go` should contain the following.

<<< @/hellochain/x/greeter/handler.go
