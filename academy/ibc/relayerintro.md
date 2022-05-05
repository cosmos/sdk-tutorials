---
title: "Relaying in General"
order: 
description: 
tag: deep-dive
---

# Relaying in General

![IBC overview](images/ibcoverview.png)

In IBC, blockchains do not directly pass messages to each other over the network. To communicate, blockchains commit the state to a precisely defined path reserved for a specific message type and a specific counterparty. Relayers monitor for updates on these paths, and relay messages by submitting the data stored under the path along with proof of that data to the counterparty chain.

Events are emitted for every transaction processed by the base application to indicate the execution of some logic clients may want to be aware of. This is extremely useful when relaying IBC packets. Any message that uses IBC will emit events for the corresponding TAO logic executed as defined in the IBC events document.

In the SDK, it can be assumed that for every message there is an event emitted with the type `message`, attribute key `action`, and an attribute value representing the type of message sent. If a relayer queries for transaction events, it can split message events using this **Event Type**/**Attribute Key** pair.

**The Event Type** `message` with the **Attribute Key** `module` may be emitted multiple times for a single message due to application callbacks. It can be assumed that any TAO logic executed will result in a module event emission with the attribute value `ibc_<submodulename>`.

Calling the Tendermint RPC method `Subscribe` via Tendermint's Websocket will return events using Tendermint's internal representation of them. Instead of receiving back a list of events as they were emitted, Tendermint will return the type `map[string][]string` which maps a string in the form `<event_type>.<attribute_key>` to `attribute_value`. This causes extraction of the event ordering to be non-trivial, but still possible.

# Hermes and Go Relayer

A relayer can create clients and etablish connections and channels. 
At the time of writing, Hermes is the most used relayer. It is written in Rust.
[IBC-Go Relayer](https://github.com/cosmos/relayer) is, as the name says, a Golang implementation of the relayer specification. 
Soon you will see [Hermes](https://hermes.informal.systems/) and [IBC-Go Relayer](https://github.com/cosmos/relayer) in action.

Usually after a channel is etablished, the relayer will automaticly relay packetes between the two endpoints of the channel. On rare occasions you will need to manually execute a command to fix a frozen client. In addition, relayer include commands to execute transactions for some application module specifications like **fungible token transfers** or **Interchain Accounts**.

# FAQ

Cosmos is developing fast and minor changes can cause big problems for unexprienced users. Luckily you have the option to get in direct contact with developers through the [Cosmos Developer Discord](https://discord.com/invite/cosmosnetwork). There you can find a channel dedicated to relayers and called **#ibc-relayer** in which you can ask for help.
