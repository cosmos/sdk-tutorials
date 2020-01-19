---
order: 10
---

# Querier

Now that we have a running distributed state machine, it's time to enable
querying our blockchain state. This is done through `Queriers`. These define the
queries that clients can send via websocket/rpc to which our application will
respond. We will keep it simple with a single query for all "greetings" that
takes an optional "from" parameter.

Save this in `x/greeter/internal/keeper/querier.go`

<<< @/hellochain/x/greeter/internal/keeper/querier.go
