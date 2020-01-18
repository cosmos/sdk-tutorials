---
order: 8
---

# Handler

Next we need to write a handler function to process the Messages contained in
the transactions delivered in each block. Handlers determine what actions
should be taken (state transitions etc) upon receipt of a `Msg`. Each module
provides a single `NewHandler` method that handles all the `Msg` types for that
module. Here is the `NewHandler` function for our `greeter` module. In MVC
terms this would be the 'controller'. 

Add this to `x/greeter/handler.go`

<<< @/hellochain/x/greeter/handler.go
