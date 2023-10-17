---
title: "Interchain Accounts"
order: 9
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

![ICA Overview](/academy/3-ibc/images/icaoverview.png)

## What are Interchain Accounts?

The interoperable internet of blockchains made possible by IBC opens up many new frontiers for cross-chain interactions, and for applications leveraging these primitives. In this interoperability narrative, it should be possible to interact with a given chain (call it the _host chain_) through a remote interface, i.e. from another chain (the _controller chain_). Interchain accounts, or ICA for short, enable just that: they allow for a chain, a module, or a user on that chain to programmatically control an account (the Interchain account) on a remote chain.

Sometimes Interchain accounts are referred to as _cross-chain writes_. This is in conjunction with Interchain queries (ICQ) or the ability to read data from a remote chain, i.e. _cross-chain reads_.

The specification describing the Interchain accounts application protocol is [ICS-27](https://github.com/cosmos/ibc/tree/main/spec/app/ics-027-interchain-accounts).

<HighlightBox type="docs">

The ibc-go implementation of ICA can be found [in the apps sub-directory](https://github.com/cosmos/ibc-go/tree/main/modules/apps/27-interchain-accounts).
<br/><br/>
The corresponding documentation can be found in the [ibc-go docs](https://ibc.cosmos.network/main/apps/interchain-accounts/overview.html).

</HighlightBox>

## ICA core functionality: controller & host

From the description above, a distinction needs to be made between the so-called "host" and "controller" chains. Unlike ICS-20, which is inherently bi-directional in the sense that both chains can use the transfer module to send and receive tokens, ICA has a more unidirectional design. Only the controller chain can send executable logic over the channel, which will then always be executed on the host chain.

Several relevant definitions relating to ICA are as follows:

**Host Chain:** the chain where the Interchain account is registered. The host chain listens for IBC packets from a controller chain which should contain instructions (e.g. cosmos SDK messages) which the Interchain account will execute.

**Controller Chain:** the chain that registers and controls an account on a host chain. The controller chain sends IBC packets to the host chain to control the account.

<HighlightBox type="info">

The Interchain accounts application module is structured to **support the ability to exclusively enable controller or host functionality**. This can be achieved by simply omitting either the controller or host `Keeper` from the Interchain account's `NewAppModule` constructor function, and mounting only the desired submodule via the `IBCRouter`. Alternatively, [submodules can be enabled and disabled dynamically using on-chain parameters](https://ibc.cosmos.network/main/apps/interchain-accounts/parameters.html).

</HighlightBox>

**Interchain account (ICA):** an account on a host chain. An Interchain account has all the capabilities of a normal account. However, rather than signing transactions with a private key, a controller chain's authentication module will send IBC packets to the host chain which contain the transactions that the Interchain account should execute.

**Interchain account owner:** an account on the controller chain. Every Interchain account on a host chain has a respective owner account on a controller chain. This owner account could be a module account (in Cosmos SDK chains) or an analogous account, it is not strictly limited to regular user accounts.

Now it's time to look at the API on both the controller and host sides.

### Controller API

The controller chain is the chain on which the controller account lives. This controller account is then able to open an ICA channel to a host chain, and create an Interchain account on the other side of the channel which lives on the host chain. The owner of the controller account can then send instructions (via transactions) with the ICA module to the account that it controls on the host chain. How to authenticate owners will be handled in a later section.

The provided API on the controller submodule consists of:

* `RegisterInterchainAccount`: this enables the registration of Interchain accounts on the host side, associated with an owner on the controller side.
* `SendTx`: once an ICA has been established, this allows you to send transaction bytes over an IBC channel to have the ICA execute it on the host side.

#### Register an Interchain account

`RegisterInterchainAccount` is a self-explanatory entry point to the process. Specifically, it generates a new controller portID using the owner account address; it binds an IBC port to the controller portID, and initiates a channel handshake to open a channel on a connection between the controller and host chains. An error is returned if the controller portID is already in use.

A `ChannelOpenInit` event is emitted that can be picked up by an off-chain process such as a relayer. The account will be registered during the `OnChanOpenTry` step on the host chain. This function must be called after an OPEN connection is already established with the given connection identifier.

``` typescript
// pseudo code
function RegisterInterchainAccount(connectionId: Identifier, owner: string, version: string) returns (error)
```

![ica-register](/academy/3-ibc/images/icaregister.png)

<HighlightBox type="best-practice">

It is best practice that the `portId` for an ICA channel is `icahost` on the host side, while on the controller side it will be dependent on the owner account, for example `icacontroller-<owner-account>`.

</HighlightBox>

#### Sending a transaction

`SendTx` allows the owner of an Interchain account to send an IBC packet containing instructions (messages) to an Interchain account on a host chain.

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
    // Interchain account has been registered using
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

The packet data that is sent over IBC, `icaPacketData`, should be of type `EXECUTE_TX` and have a **non nil** data field.
<br/><br/>
Additionally, note that `SendTx` calls core IBC's `sendPacket` API to transport the packet over the ICS-27 channel.

</HighlightBox>

![ica-sendtx](/academy/3-ibc/images/icasendtx.png)

#### ICS-27 channels

After an Interchain account has been registered on the host side, the main functionality is provided by `SendTx`. When designing ICA for the ibc-go implementation, a decision was made to use [`ORDERED` channels](./3-channels.md), to ensure that messages are executed in the desired order on the host side, akin to the use of the transaction `sequence` for regular accounts.

A limitation when using `ORDERED` channels is that when a packet times out the channel will be closed. In the case of a channel closing, it is desirable that a controller chain is able to regain access to the Interchain account registered on this channel. The concept of _active channels_ enables this functionality.

When an Interchain account is registered using the `RegisterInterchainAccount` flow, a new channel is created on a particular port. During the `OnChanOpenAck` and `OnChanOpenConfirm` steps (on the controller and host chains respectively) the active channel for this Interchain account is stored in state.

It is possible to create a new channel using the same controller chain `portID` if the previously set active channel is now in a `CLOSED` state.

<HighlightBox type="info">

For example, **in ibc-go** one can create a new channel using the Interchain account programmatically by sending a new `MsgChannelOpenInit` message, like:

```go
msg := channeltypes.NewMsgChannelOpenInit(
  portID,
  string(versionBytes),
  channeltypes.ORDERED,
  []string{connectionID},
  icatypes.HostPortID,
  authtypes.NewModuleAddress(icatypes.ModuleName).String())
handler := keeper.msgRouter.Handler(msg)
res, err := handler(ctx, msg)
if err != nil {
  return err
}
```

Alternatively, any relayer operator may initiate a new channel handshake for this Interchain account once the previously set `Active Channel` is in a `CLOSED` state. This is done by initiating the channel handshake on the controller chain **using the same portID** associated with the Interchain account in question.

</HighlightBox>

It is important to note that once a channel has been opened for a given Interchain account, new channels cannot be opened for this account until the current `Active Channel` is set to `CLOSED`.

### Host API

The host chain is the chain where the Interchain account is created and the transaction (sent by the controller) is executed.

Therefore, the provided API on the host submodule consists of:

* `RegisterInterchainAccount`: enables the registration of Interchain accounts on the host, associated with an owner on the controller side.
* `ExecuteTx`: enables the transaction data to be executed, provided successful authentication.
* `AuthenticateTx`: checks that the signer of a particular message is the Interchain account associated with the counterparty portID of the channel that the IBC packet was sent on.

<HighlightBox type="note">

The host API methods run automatically as part of the flow and need not be exposed to an end-user or module, as is the case on the controller side with `RegisterInterchainAccount` and `SendTx`.

</HighlightBox>

#### Register an Interchain account

The `RegisterInterchainAccount` flow was discussed on the controller side already, where it triggered a handshake. On the host side is a complementary part of the flow, but here it's triggered in the `OnChanOpenTry` step of the handshake, which will create the Interchain account.

<HighlightBox type="note">

Although from the spec point of view we can call this the `RegisterInterchainAccount` flow, the actual function being called on the host side in ibc-go is called [`createInterchainAccount`](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/apps/27-interchain-accounts/host/keeper/account.go#L14).

</HighlightBox>

#### Executing transaction data

The host chain state machine will be able to execute the transaction data by extracting it from the `InterchainPacketData`:

```protobuf
message InterchainAccountPacketData  {
    enum type
    bytes data = 1;
    string memo = 2;
}
```

The type should be `EXECUTE_TX` and data contains an array of messages the host chain can execute.

<HighlightBox type="info">

Executing the transaction data will depend on the execution environment (which blockchain you are on). An example for the ibc-go implementation can be found [here](https://github.com/cosmos/ibc-go/blob/v7.0.0/modules/apps/27-interchain-accounts/host/keeper/relay.go).

</HighlightBox>

#### Authenticating the transaction

`AuthenticateTx` is called before `ExecuteTx`. It checks that the signer of a particular message is the Interchain account owner associated with the counterparty portID of the channel that the IBC packet was sent on.

<HighlightBox type="remember">

Remember that the port ID on the controller side was recommended to be of the format `icacontroller-<owner-account>`. Therefore, the owner account to be authenticated can be found from the counterparty port ID.

</HighlightBox>

Up until this point you may have wondered how authentication is handled on the controller side. This will be the topic of the next section.

<HighlightBox type="note">

The above information is applicable to all implementations of ICS-27, unless explicitly stated otherwise.
<br/><br/>
By contrast, be aware that the following information deals with the ibc-go implementation specifically.

</HighlightBox>

## Authentication

The ICA controller submodule provides an API for registering an account and for sending Interchain transactions. It has been purposefully made lean and limited to generic controller functionality. For authentication of the owner accounts, the developer is expected to provide an authentication module with the ability to interact with the ICA controller submodule.

Here are some relevant definitions:

**Authentication Module:**

* Generic authentication module: Cosmos SDK modules (`x/auth`, `x/gov`, or `x/group`) that offer authentication functionality and can send messages to the ICS-27 module through a `MsgServer`.
* Custom authentication module: a custom SDK module (satisfying only the `AppModule` but not `IBCModule` interface) that offers custom authentication and can send messages to the ICS-27 module through a `MsgServer`.
* Legacy authentication module: an IBC application module on the controller chain that acts as underlying application for the ICS-27 controller submodule middleware. It forms an IBC middleware stack with the ICS-27 controller module, facilitating communication across the stack.

An **authentication module** must:

* Authenticate Interchain account owners.
* Track the associated Interchain account address for an owner.
* Send packets on behalf of an owner (after authentication).

<HighlightBox type="docs">

Originally, when ICA was first introduced in ibc-go v3, developers had to develop a custom authentication module as an IBC application that was wrapped by the ICS-27 module acting as middleware. In ibc-go v6, a refactor of ICA took place that enabled Cosmos SDK modules (`x/auth`, `x/gov`, or `x/group`) to act as generic authentication modules that required no extra development.
<br/><br/>
A `MsgServer` was added to the ICA controller submodule to facilitate this.
<br/><br/>
More information regarding the details and context for the redesign can be found in [ADR-009](https://github.com/cosmos/ibc-go/blob/main/docs/architecture/adr-009-v6-ics27-msgserver.md) or in a [dedicated blog post](https://medium.com/the-interchain-foundation/ibc-go-v6-changes-to-interchain-accounts-and-how-it-impacts-your-chain-806c185300d7) on the topic.
<br/><br/>
For now, the legacy API remains available for those developers who have already built custom IBC authentication modules, but it will be deprecated in the future.

</HighlightBox>

<HighlightBox type="info">

**SDK Security Model**
<br/><br/>
SDK modules on a chain are assumed to be trustworthy. For example, there are no checks to prevent an untrustworthy module from accessing the bank keeper.
<br/><br/>
The implementation of [ICS-27](https://github.com/cosmos/ibc/blob/master/spec/app/ics-027-interchain-accounts/README.md) on [ibc-go](https://github.com/cosmos/ibc-go/tree/main/modules/apps/27-interchain-accounts) uses this assumption in its security considerations. It assumes that:

* The authentication module will not try to open channels on owner addresses it does not control.
* Other IBC application modules will not bind to ports within the [ICS-27](https://github.com/cosmos/ibc/blob/master/spec/app/ics-027-interchain-accounts/README.md) namespace.

</HighlightBox>

More information on which type of authentication module to use for which development use case can be found [here](https://ibc.cosmos.network/main/apps/interchain-accounts/development.html).

There you will find references to development use cases requiring access to the packet callbacks, which are discussed in the next section.

## Application callbacks

Custom authentication is one potential use case for the use of Interchain accounts; however, another important use case quickly became apparent: Interchain accounts packets being sent as part of a composable programmatic flow.

As an example, consider a remote-controlled atomic swap:

1. Send an ICS-20 packet to a remote chain.
2. If it is successful, then send an ICA-packet to swap tokens on a liquidity pool (LP) on the host chain.
3. Return the funds back to the sender (on the controller chain).

<HighlightBox type="best-practice">

The request from the community to enable a standard for this type of flow resulted in [ADR-008](https://github.com/cosmos/ibc-go/blob/main/docs/architecture/adr-008-app-caller-cbs.md), which extends the ability for general use cases.
<br/><br/>
It is advisable to follow developments around ADR-008 and the so-called _callback interface for IBC actors_, i.e. secondary applications (like smart contracts for example) that want to call into IBC apps as part of their state machine logic.

</HighlightBox>

## Practical exercise

Ready to get your hands dirty now that you understand how ICA works? Try out [this tutorial](https://github.com/cosmos/ibc-go/wiki/How-to-use-groups-with-ICA) on how to use groups with Interchain accounts.
