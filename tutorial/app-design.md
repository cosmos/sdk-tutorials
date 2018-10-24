## The application

The goal of the application is to let users buy names and set a value these names resolve to. The owner is the current highest bidder for a given name. Let us try to understand how these simple requirements translate in terms of application design. 

A decentralised application is just a replicated deterministic state-machine. As a developer, you just have to define the state-machine (i.e. a state and messages that trigger state-transititons), and *Tendermint* will replicate it for you. 

The [Cosmos-SDK](https://github.com/cosmos/cosmos-sdk/) is there to help you build this state-machine. The SDK is a modular framework, meaning applications are built by aggregating a collection of interoperable modules. Each module represents its own little message processor, and the SDK is responsible for routing each message to its respective module. 

Let us list the modules we need for your nameservice application:
- `auth`: This module is needed to handle accounts and fees.
- `bank`: This module enables the application to have tokens.
- `nameservice`: This module does not exist yet! It will handle the logic for our nameservice. It's the main piece of software you have to work on to build your application. 

Now, let us look at the two main parts of your application, the state and the message types. 

### State

The state represents your application at a given moment. It tells how much token each account possesses, what are the owners and price of each name, and to what value each name resolves to. 

The state of tokens and accounts is defined by the `auth` and `bank` modules, which means you don't have to concern yourself with it for now. What you need to do is define the part of the state that relates specifically to your `nameservice` module.

In the SDK, everything is stored in one store called the `multistore`. Any number of KVStores can be created in this multistore. For your application, you need to store:

- A mapping of `name` to `value`. We will create a `nameStore` in the `multistore` for it.
- A mapping of `name` to `owner`. We will create a `ownerStore` in the `multistore` for it.
- A mapping of `name` to `price`. We will create a `priceStore` in the `multistore` for it.

### Messages

Messages are contained in transaction, and trigger state-transitions. Each module defines a list of messages and how to handle them. Here are the messages you need for your nameservice application:

- `MsgSetName`: This message allows name owners to set a value for a given name in the `nameStore`.
- `MsgBuyName`: This message allows accounts to buy a name and become their owner in the `ownerStore`. 

When a transaction (included in a block) reaches a Tendermint node, it is passed to the application via the [ABCI](https://github.com/tendermint/tendermint/tree/master/abci) and decoded to get the message. The message is then routed to the appropriate module and handled there according to the logic defined in the `handler`. If the state needs to be updated, the `handler` calls the `keeper` to perform the update. You will learn more about these concepts as you go through the tutorial. 

### Now that you have defined how your application works from a high-level perspective, you can [start implementing it](./keeper.md)! 