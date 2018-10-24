# Application Goals

The goal of the application you are building is to let users buy names and to set a value these names resolve to. The owner of an given name will be the current highest bidder. This piece of the tutorial should help you understand how these simple requirements translate to application design.

A decentralized application is just a [replicated deterministic state machine](https://en.wikipedia.org/wiki/State_machine_replication). As a developer, you just have to define the state machine (i.e. a starting state and messages that trigger state transitions), and [*Tendermint*](https://tendermint.com/docs/introduction/introduction.html) will handle replication over the network for you.

The [Cosmos SDK](https://github.com/cosmos/cosmos-sdk/) is designed to help you build state machines. The SDK is a modular framework, meaning applications are built by aggregating a collection of interoperable modules. Each module contains its own message/transaction processor, while the SDK is responsible for routing each message to its respective module.

Here are the modules you will need for the nameservice application:
- `auth`: This module contains the concepts of accounts and fees while giving access to these functionalities to the rest of your application.
- `bank`: This module enables the application to create and manage tokens and token balances.
- `nameservice`: This module does not exist yet! It will handle the logic for the `nameservice` you are building. It's the main piece of software you have to work on to build your application.

Now, take a look at the two main parts of your application: the state and the message types.

## State

The state represents your application at a given moment. It tells how much token each account possesses, what are the owners and price of each name, and to what value each name resolves to.

The state of tokens and accounts is defined by the `auth` and `bank` modules, which means you don't have to concern yourself with it for now. What you need to do is define the part of the state that relates specifically to your `nameservice` module.

In the SDK, everything is stored in one store called the `multistore`. Any number of key/value stores (called [`KVStores`](https://godoc.org/github.com/cosmos/cosmos-sdk/types#KVStore) in the CosmosSDK) can be created in this multistore. For your application, you need to store:

- A mapping of `name` to `value`. Create a `nameStore` in the `multistore` to hold this data.
- A mapping of `name` to `owner`. Create a `ownerStore` in the `multistore` to hold this data.
- A mapping of `name` to `price`. Create a `priceStore` in the `multistore` to hold this data.

## Messages

Messages are contained in transactions. They trigger state transitions. Each module defines a list of messages and how to handle them. Here are the messages you need to implement the desired functionality for your nameservice application:

- `MsgSetName`: This message allows name owners to set a value for a given name in the `nameStore`.
- `MsgBuyName`: This message allows accounts to buy a name and become their owner in the `ownerStore`.

When a transaction (included in a block) reaches a Tendermint node, it is passed to the application via the [ABCI](https://github.com/tendermint/tendermint/tree/master/abci) and decoded to get the message. The message is then routed to the appropriate module and handled there according to the logic defined in the `Handler`. If the state needs to be updated, the `Handler` calls the `Keeper` to perform the update. You will learn more about these concepts in the next couple of modules of this tutorial.

### Now that you have decided on how your application functions from a high-level perspective, its time to [start implementing the `nameservice` module](./keeper.md)!
