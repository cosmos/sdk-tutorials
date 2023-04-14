---
title: "Interchain Accounts"
order: -1
description: Understand ICA
tags: 
  - concepts
  - ibc
---

# Interchain Accounts

<HighlightBox type="learning">

**Interchain accounts (ICAs)** allow you to control an account on a **host chain** from a **controller chain**.
<br/><br/>
In this section, you will learn more about:

* Host chains and controller chains
* ICA (sub)module(s)
* The authentication module for custom authentication
* ADR 008 middleware for secondary application logic

</HighlightBox>

## What are Interchain Accounts?

The interoperable internet of blockchains made possible by IBC, opens up many new frontiers for cross-chain interactions and applications leveraging these primitives. In this interoperability narrative, it should be possible to interact with a certain chain -let's call it the _host chain_- through a remote interface, i.e. from another chain - the _controller chain_. Interchain accounts or ICA for short, enables just that; it allows for a chain, a module or a user on that chain to programmatically control an account, the interchain account, on a remote chain.

Sometimes interchain accounts are referred to as _cross-chain writes_ in conjunction with interchain queries (ICQ) or the ability to read data from a remote chain, i.e. _cross-chain reads_.

[The specification describing the interchain accounts](https://github.com/cosmos/ibc/tree/main/spec/app/ics-027-interchain-accounts) application protocol is ICS-27.

<HighlightBox type="docs">

The ibc-go implemenation of ICA can be found [in the apps subdirectory](https://github.com/cosmos/ibc-go/tree/main/modules/apps/27-interchain-accounts).

The corresponding documentation can be found in the [ibc-go docs](https://ibc.cosmos.network/main/apps/interchain-accounts/overview.html)

</HighlightBox>

## ICA core functionality: controller & host

From the description above, you'll be able to note that a distinction needs to be made between the so-called host and controller chains. Unlike ICS-20 which has an inherent symmetric design (if an ICS-20 channel is created between two chains, both chains can use the transfer module to send and receive tokens), ICA has a more asymmetric design in nature. Let's take a look at some relevant definitions:

**Host Chain:** the chain where the interchain account is registered. The host chain listens for IBC packets from a controller chain which should contain instructions (e.g. cosmos SDK messages) which the interchain account will execute.

**Controller Chain:** the chain that registers and controls an account on a host chain. The controller chain sends IBC packets to the host chain to control the account.

<HighlightBox type="info">

The interchain accounts application module is structured to **support the ability of exclusively enabling controller or host functionality**. This can be achieved by simply omitting either controller or host `Keeper` from the interchain accounts `NewAppModule` constructor function, and mounting only the desired submodule via the `IBCRouter`. Alternatively, [submodules can be enabled and disabled dynamically using on-chain parameters](https://ibc.cosmos.network/main/apps/interchain-accounts/parameters.html).

</HighlightBox>

**Interchain account (ICA):** an account on a host chain. An interchain account has all the capabilities of a normal account. However, rather than signing transactions with a private key, a controller chain's authentication module will send IBC packets to the host chain which signal what transactions the interchain account should execute.

**Interchain Account Owner:** An account on the controller chain. Every interchain account on a host chain has a respective owner account on the controller chain. This could be module account or analogous, not just regular user accounts.

Let's take a look at the API on both the controller and host side.

### Controller API

The controller chain is the chain where some owner account (how to authenticate owners will be handled in a later section) is able to create an interchain account on a host chain and send instructions (a transactions) to it over IBC.

Thus, the provided API on the controller submodule consists of:

* `RegisterInterchainAccount`: enables the registration of interchain accounts on the host, associated with an owner on the controller side
* `SendTx`: Once an ICA has been established we can send transaction bytes over an IBC channel to have the ICA execute it on the host side

#### Register an interchain account

`RegisterInterchainAccount` is the entry point to registering an interchain account. It generates a new controller portID using the owner account address. It will bind an IBC port to the controller portID and initiate a channel handshake to open a channel on a connection between the controller and host chains. An error is returned if the controller portID is already in use. 

A `ChannelOpenInit` event is emitted which can be picked up by an offchain process such as a relayer. The account will be registered during the `OnChanOpenTry` step on the host chain. This function must be called after an OPEN connection is already established with the given connection identifier. 

``` typescript
// pseudo code
function RegisterInterchainAccount(connectionId: Identifier, owner: string, version: string) returns (error) {
}
```

<HighlightBox type="best-practice">

It is best practice that the `portId` for an ICA channel is `icahost` on the host side, while on the controller side it will be dependent on the owner account, `icacontroller-<owner-account>`.

</HighlightBox>

#### Sending a transaction

`SendTx` allows the owner of an interchain account to send an IBC packet containing instructions (messages) to an interchain account on a host chain.

```typescript
// pseudo code
function SendTx(
  capability: CapabilityKey, 
  connectionId: Identifier,
  portId: Identifier, 
  icaPacketData: InterchainAccountPacketData, 
  timeoutTimestamp uint64): uint64 {
    // check if there is a currently active channel for
    // this portId and connectionId, which also implies an 
    // interchain account has been registered using 
    // this portId and connectionId
    activeChannelID, found = GetActiveChannelID(portId, connectionId)
    abortTransactionUnless(found)

    // validate timeoutTimestamp
    abortTransactionUnless(timeoutTimestamp <= currentTimestamp())

    // validate icaPacketData
    abortTransactionUnless(icaPacketData.type == EXECUTE_TX)
    abortTransactionUnless(icaPacketData.data != nil)

    // send icaPacketData to the host chain on the active channel
    sequence = handler.sendPacket(
      capability,
      portId, // source port ID
      activeChannelID, // source channel ID 
      0,
      timeoutTimestamp,
      icaPacketData
    )

    return sequence
}
```

<HighlightBox type="note">

Note that the packet data you'll be sending over IBC, `icaPacketData` should be of type `EXECUTE_TX` and have a non nil data field.
<br/>
Additionally, you'll note that `SendTx` calls core IBCs `sendPacket` API to transport the packet over the ICS-27 channel.

</HighlightBox>

#### ICS-27 channels

After an interchain account has been registered on the host side, the main functionality is provided by `SendTx`. When designing ICA for the ibc-go implementation, a decision was made to use [`ORDERED` channels](./3-channels.md), to ensure that messages are executed in the desired order on the host side.

A limitation when using `ORDERED` channels is that when a packet times out the channel will be closed. In the case of a channel closing, it is desirable that a controller chain is able to regain access to the interchain account registered on this channel. The concept of _active channels_ enables this functionality.

When an Interchain Account is registered using `RegisterInterchainAccount` flow, a new channel is created on a particular port. During the `OnChanOpenAck` and `OnChanOpenConfirm` steps (on controller & host chain respectively) the active channel for this interchain account is stored in state.

It is possible to create a new channel using the same controller chain `portID` if the previously set active channel is now in a `CLOSED` state.

<HighlightBox type="info">

For example **in ibc-go**, one can create a new channel using the interchain account programatically by sending a new `MsgChannelOpenInit` message like so:

```go
msg := channeltypes.NewMsgChannelOpenInit(portID, string(versionBytes), channeltypes.ORDERED, []string{connectionID}, icatypes.HostPortID, authtypes.NewModuleAddress(icatypes.ModuleName).String())
handler := keeper.msgRouter.Handler(msg)
res, err := handler(ctx, msg)
if err != nil {
  return err
}
```

Alternatively, any relayer operator may initiate a new channel handshake for this interchain account once the previously set `Active Channel` is in a `CLOSED` state. This is done by initiating the channel handshake on the controller chain using the same portID associated with the interchain account in question.

</HighlightBox>

It is important to note that once a channel has been opened for a given interchain account, new channels can not be opened for this account until the currently set `Active Channel` is set to `CLOSED`.


### Host API

The host chain is the chain where the interchain account is created and the transaction data (sent by the controller) are executed.

Thus, the provided API on the host submodule consists of:

* `RegisterInterchainAccount`: enables the registration of interchain accounts on the host, associated with an owner on the controller side
* `ExecuteTx`: enables the transaction data to be executed, provided successful authentication
* `AuthenticateTx`: checks that the signer of a particular message is the interchain account associated with the counterparty portID of the channel that the IBC packet was sent on.

<HighlightBox type="note">

Note that the host API methods will run automatically as part of the flow and need not be exposed to an end-user or module as is the case on the controller side with `RegisterInterchainAccount` and `SendTx`.

</HighlightBox>

#### Register an interchain account

The `RegisterInterchainAccount` flow was discussed on the controller side already, where it triggered a handshake. On the host side, there's an complementary part of the flow, but here it's triggered in the `OnChanOpenTry` step of the handshake which will create the interchain account.

<HighlightBox type="note">

Although from the spec point of view, we can call it the `RegisterInterchainAccount` flow, the actual function being called on the host side in ibc-go is called [`createInterchainAccount`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/apps/27-interchain-accounts/host/keeper/account.go#L14).

</HighlightBox>

#### Executing transaction data

The host chain state machine will be able to execute the transaction data by extracting it from the `InterchainPacketData`:

```typescript
message InterchainAccountPacketData  {
    enum type
    bytes data = 1;
    string memo = 2;
}
```

Where the type (at the moment of writing) should be `EXECUTE_TX` and data contains an array of messages the host chain can execute.

<HighlightBox type="info">

Executing the transaction data will be dependent on the execution environment (which blockchain you're on), an example for the ibc-go implementation can be found [here](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/apps/27-interchain-accounts/host/keeper/relay.go).

</HighlightBox>

#### Authenticating the transaction

`AuthenticateTx` is called before `ExecuteTx`. It checks that the signer of a particular message is the interchain account owner associated with the counterparty portID of the channel that the IBC packet was sent on.

<HighlightBox type="remember">

Remember that the port ID on the controller side was recommended to be of the format: `icacontroller-<owner-account>`. So the owner account to be authenticated can be found from the counterparty port ID.

</HighlightBox>

Up until this point you might have wondered how the authentication is handled on the controller side. This will be the topic of the next section.

<HighlightBox type="note">

From here onwards, it will be implicitly assumed that we are dealing with the ibc-go implmenation specifically, whereas all of the above held true for all implentations of ICS-27, unless explicitly stated otherwise.

</HighlightBox>

## Authentication

The ICA controller submodule provides an API for registering an account and for sending interchain transactions. It has been purposefully made lean and limited to generic contoller functionality. For authentication of the owner accounts, the developer is expected to provide an authentication module the ability to interact with the ICA controller submodule.

Let's take a look at some definitions:

**Authentication Module:** 

* Generic authentication module: Cosmos SDK modules (`x/auth`, `x/gov` or `x/group`) that offer authentication functionality and can send messages to the ICS-27 module through a `MsgServer`.
* Custom authentication module: a custom SDK module (satisfying only the `AppModule` but not `IBCModule` interface) that offers custom authentication and can send messages to the ICS-27 module through a `MsgServer`.
* Legacy authentication module: an IBC application module on the controller chain that acts as underlying application for the ICS-27 controller submodule middleware. It forms an IBC middleware stack with the ICS-27 controller module, facilitating communication across the stack.

An **authentication module** must:

* Authenticate interchain account owners
* Track the associated interchain account address for an owner
* Send packets on behalf of an owner (after authentication)

<HighlightBox type="docs">

Originally when ICA was first introduced in ibc-go v3, developers had to develop a custom authentication module as an IBC application that was wrapped by the ICS-27 module acting as middleware. In ibc-go v6 a refactor of ICA  took place that enabled Cosmos SDK modules (`x/auth`, `x/gov` or `x/group`) to act as generic authentication modules that required no extra development. 

A `MsgServer` was added to the ICA controller submodule to facilitate this.

More information regarding the details and context for the redesign can be found in [ADR-009](https://github.com/cosmos/ibc-go/blob/main/docs/architecture/adr-009-v6-ics27-msgserver.md) or in a [dedicated blog post](https://medium.com/the-interchain-foundation/ibc-go-v6-changes-to-interchain-accounts-and-how-it-impacts-your-chain-806c185300d7) on the topic.

For now, the legacy API will remain available for those developers that had already built custom IBC authentication modules, but will be deprecated in the future.

</HighlightBox>

<HighlightBox type="info">

**SDK Security Model**
<br/>
SDK modules on a chain are assumed to be trustworthy. For example, there are no checks to prevent an untrustworthy module from accessing the bank keeper.

The implementation of [ICS-27](https://github.com/cosmos/ibc/blob/master/spec/app/ics-027-interchain-accounts/README.md) on [ibc-go](https://github.com/cosmos/ibc-go/tree/main/modules/apps/27-interchain-accounts) uses this assumption in its security considerations. The implementation assumes the authentication module will not try to open channels on owner addresses it does not control.

The implementation assumes other IBC application modules will not bind to ports within the [ICS-27](https://github.com/cosmos/ibc/blob/master/spec/app/ics-027-interchain-accounts/README.md) namespace.

</HighlightBox>

More information on what type of authentication module to use for what development use case can be found [here](https://ibc.cosmos.network/main/apps/interchain-accounts/development.html).

There you'll find reference to development use cases requiring access to the packet callbacks, which is discussed in the next section.

## Application callbacks





