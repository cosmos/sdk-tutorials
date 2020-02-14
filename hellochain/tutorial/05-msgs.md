---
order: 7
---

# Msgs

`Msgs` define your application's state transitions. They are encoded and passed
around the network wrapped in `Txs`. Messages are "owned" by a single module,
meaning they are routed to only one of your applications modules. Each module
has its own set of messages that it uses to update its subset of the chain
state. We will give our `greeter` module just one Message, `MsgGreet`, to keep
things simple. `MsgGreet` stores the addresses of the sender and reciever as
well as the body of the "greeting".

Save the following in `x/greeter/internal/types/msgs.go`

<<< @/hellochain/x/greeter/internal/types/msgs.go
