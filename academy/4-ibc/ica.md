---
title: "Interchain Accounts"
order: 7
description: Work with ICA
tag: deep-dive
---

# Interchain Accounts

<HighlightBox type="learning">

**Interchain accounts (ICAs)** allow you to control an account on a **host chain** from a **controller chain**.

In this section, you will learn more about:

* Hosting chains and controller chains
* ICA module code
* The authentication module

</HighlightBox>

Another application module [implemented in the IBC-Go](https://github.com/cosmos/ibc-go/tree/main/docs/apps/interchain-accounts) repository is [interchain accounts (ICS-27)](https://github.com/cosmos/ibc/blob/master/spec/app/ics-027-interchain-accounts/README.md).

![ICA Overview](/academy/4-ibc/images/icaoverview.png)

**Host Chain:** the chain where the interchain account is registered. The host chain listens for IBC packets from a controller chain which should contain instructions (e.g. cosmos SDK messages) which the interchain account will execute.

**Controller Chain:** the chain that registers and controls an account on a host chain. The controller chain sends IBC packets to the host chain to control the account. A controller chain must have at least one interchain accounts authentication module in order to act as a controller chain.

<HighlightBox type="info">

The interchain accounts application module is structured to support the ability of exclusively enabling controller or host functionality. This can be achieved by simply omitting either controller or host `Keeper` from the interchain accounts `NewAppModule` constructor function, and mounting only the desired submodule via the `IBCRouter`. Alternatively, submodules can be enabled and disabled dynamically using on-chain parameters.

</HighlightBox>

**Authentication Module:** a custom IBC application module on the controller chain that uses the interchain accounts module API to build custom logic for the creation and management of interchain accounts. An authentication module is required for a controller chain to utilize the interchain accounts module functionality.

**Interchain account (ICA):** an account on a host chain. An interchain account has all the capabilities of a normal account. However, rather than signing transactions with a private key, a controller chain's authentication module will send IBC packets to the host chain which signal what transactions the interchain account should execute.

The ICA module provides an API for registering an account and for sending interchain transactions. A developer will use this module by implementing an **ICA Auth Module** (_authentication module_) and can expose gRPC endpoints for an application or user. Regular accounts use a private key to sign transactions on-chain. interchain accounts are instead controlled programmatically by separate chains via IBC transactions. interchain accounts are implemented as sub-accounts of the interchain accounts module account.

First, look how an account is registered:

![Register account](/academy/4-ibc/images/icaregister.png)

To register an account on the host chain, the function [`RegisterInterchainAccount`](https://github.com/cosmos/ibc-go/blob/main/modules/apps/27-interchain-accounts/controller/keeper/account.go) is called on the controller chain:

```go
// RegisterInterchainAccount is the entry point to registering an interchain account.
// It generates a new port identifier using the owner address. It will bind to the
// port identifier and call 04-channel 'ChanOpenInit'. An error is returned if the port
// identifier is already in use. Gaining access to interchain accounts whose channels
// have closed cannot be done with this function. A regular MsgChanOpenInit must be used.
func (k Keeper) RegisterInterchainAccount(ctx sdk.Context, connectionID, owner string) error {
    portID, err := icatypes.NewControllerPortID(owner)

    ...

    // if there is an active channel for this portID / connectionID return an error
    activeChannelID, found := k.GetOpenActiveChannel(ctx, connectionID, portID)
    if found {
        return sdkerrors.Wrapf(icatypes.ErrActiveChannelAlreadySet, "existing active channel %s for portID %s on connection %s for owner %s", activeChannelID, portID, connectionID, owner)
    }

    ...

    connectionEnd, err := k.channelKeeper.GetConnection(ctx, connectionID)

    ...

    msg := channeltypes.NewMsgChannelOpenInit(portID, string(versionBytes), channeltypes.ORDERED, []string{connectionID}, icatypes.PortID, icatypes.ModuleName)

    ...
}
```

The `portID` will be the address of the **interchain account Owner** prefixed by the default port prefix of the interchain accounts controller submodule `icacontroller-`. The ICA module assumes that there is already an IBC connection established between the host and controller chains. As part of `RegisterInterchainAccount`, it will open an `ORDERED` channel.

The ICA module uses `ORDERED` channels to maintain the order of transactions when sending packets from a controller chain to a host chain. A limitation when using `ORDERED` channels is that when a packet times out the channel will be closed. In the case of a channel closing, a controller chain needs to be able to regain access to the interchain account registered on this channel.

ICAs offer **active channels** to create a new channel using the same controller prefixed chain `portID`. This means that when an interchain account is registered using the `RegisterInterchainAccount` API, a new channel is created on a particular port. During the `OnChanOpenAck` and `OnChanOpenConfirm` steps (controller & host chain), the `Active Channel` for this interchain account is stored in state.

Using the `Active Channel` stored in state, it is then possible to create a new channel using the same controller chain portID even if the previously set `Active Channel` is in a `CLOSED` state.

If the message gets to the host chain (with the `NewMsgChannelOpenInit` call shown previously), the ICA module on the host chain also calls [`RegisterInterchainAccount`](https://github.com/cosmos/ibc-go/blob/main/modules/apps/27-interchain-accounts/host/keeper/account.go):

```go
// RegisterInterchainAccount attempts to create a new account using the provided address and
// stores it in state keyed by the provided connection and port identifiers
// If an account for the provided address already exists this function returns early (no-op)
func (k Keeper) RegisterInterchainAccount(ctx sdk.Context, connectionID, controllerPortID string, accAddress sdk.AccAddress) {
    if acc := k.accountKeeper.GetAccount(ctx, accAddress); acc != nil {
        return
    }

    interchainAccount := icatypes.NewInterchainAccount(
        authtypes.NewBaseAccountWithAddress(accAddress),
        controllerPortID,
    )

    k.accountKeeper.NewAccount(ctx, interchainAccount)
    k.accountKeeper.SetAccount(ctx, interchainAccount)

    k.SetInterchainAccountAddress(ctx, connectionID, controllerPortID, interchainAccount.Address)
}
```

This call goes through the `OnChanOpenTry` implementation in the [`handshake.go`](https://github.com/cosmos/ibc-go/blob/main/modules/apps/27-interchain-accounts/host/keeper/handshake.go) on the host chain:

```go
// OnChanOpenTry performs basic validation of the ICA channel
// and registers a new interchain account (if it doesn't exist).
// The version returned will include the registered interchain
// account address.
func (k Keeper) OnChanOpenTry(
    ...
) (string, error) {
    ...

    // Register interchain account if it does not already exist
    k.RegisterInterchainAccount(ctx, metadata.HostConnectionId, counterparty.PortId, accAddress)

    ...
}
```

As a result, a fresh **interchain account** is created on the host chain. You can find the implementations of `OnChanOpenInit` and ` OnChanOpenAck` in the [`handshake.go`](https://github.com/cosmos/ibc-go/blob/main/modules/apps/27-interchain-accounts/controller/keeper/handshake.go):

```go
// OnChanOpenInit performs basic validation of channel initialization.
// The channel order must be ORDERED, the counterparty port identifier
// must be the host chain representation as defined in the types package,
// the channel version must be equal to the version in the types package,
// there must not be an active channel for the specfied port identifier,
// and the interchain accounts module must be able to claim the channel
// capability.
func (k Keeper) OnChanOpenInit(
    ctx sdk.Context,
    order channeltypes.Order,
    connectionHops []string,
    portID string,
    channelID string,
    chanCap *capabilitytypes.Capability,
    counterparty channeltypes.Counterparty,
    version string,
) error {
    ...

    activeChannelID, found := k.GetActiveChannelID(ctx, connectionHops[0], portID)
    if found {
        channel, found := k.channelKeeper.GetChannel(ctx, portID, activeChannelID)
        if !found {
            panic(fmt.Sprintf("active channel mapping set for %s but channel does not exist in channel store", activeChannelID))
        }

        if channel.State == channeltypes.OPEN {
            return sdkerrors.Wrapf(icatypes.ErrActiveChannelAlreadySet, "existing active channel %s for portID %s is already OPEN", activeChannelID, portID)
        }

        if !icatypes.IsPreviousMetadataEqual(channel.Version, metadata) {
            return sdkerrors.Wrap(icatypes.ErrInvalidVersion, "previous active channel metadata does not match provided version")
        }
    }

    return nil
}
```

<HighlightBox type="note">

There is a one-to-one mapping between an interchain account and a channel to fulfill the requirements for the Active Channels.

</HighlightBox>

In the `OnChanOpenAck` you can see that the channel ID and account address will be set in the state:

```go
// OnChanOpenAck sets the active channel for the interchain account/owner pair
// and stores the associated interchain account address in state keyed by it's corresponding port identifier
func (k Keeper) OnChanOpenAck(
    ctx sdk.Context,
    portID,
    channelID string,
    counterpartyVersion string,
) error {
    ...

    k.SetActiveChannelID(ctx, metadata.ControllerConnectionId, portID, channelID)
    k.SetInterchainAccountAddress(ctx, metadata.ControllerConnectionId, portID, metadata.Address)

    return nil
}
```

After registration, the registered account can be used to sign transactions on the host chain:

![Send transaction](/academy/4-ibc/images/icasendtx.png)

You can find `SendTx` in the [`relay.go`](https://github.com/cosmos/ibc-go/blob/main/modules/apps/27-interchain-accounts/controller/keeper/relay.go):

```go
// SendTx takes pre-built packet data containing messages to be executed on the host chain from an authentication module and attempts to send the packet.
// The packet sequence for the outgoing packet is returned as a result.
// If the base application has the capability to send on the provided portID. An appropriate
// absolute timeoutTimestamp must be provided. If the packet is timed out, the channel will be closed.
// In the case of channel closure, a new channel may be reopened to reconnect to the host chain.
func (k Keeper) SendTx(ctx sdk.Context, chanCap *capabilitytypes.Capability, connectionID, portID string, icaPacketData icatypes.InterchainAccountPacketData, timeoutTimestamp uint64) (uint64, error) {
    activeChannelID, found := k.GetOpenActiveChannel(ctx, connectionID, portID)

    ...

    sourceChannelEnd, found := k.channelKeeper.GetChannel(ctx, portID, activeChannelID)

    ...

    destinationPort := sourceChannelEnd.GetCounterparty().GetPortID()
    destinationChannel := sourceChannelEnd.GetCounterparty().GetChannelID()

    ...

    return k.createOutgoingPacket(ctx, portID, activeChannelID, destinationPort, destinationChannel, chanCap, icaPacketData, timeoutTimestamp)
}
```

This validates the source and destination IDs and uses `createOutgoingPacket` to send a transaction, which calls `SendPacket` of the IBC core module.

On the host chain, if a packet arrives, `OnRecvPacket` in the [`relay.go`](https://github.com/cosmos/ibc-go/blob/main/modules/apps/27-interchain-accounts/host/keeper/relay.go) is called:

```go
// OnRecvPacket handles a given interchain accounts packet on a destination host chain.
// If the transaction is successfully executed, the transaction response bytes will be returned.
func (k Keeper) OnRecvPacket(ctx sdk.Context, packet channeltypes.Packet) ([]byte, error) {
    var data icatypes.InterchainAccountPacketData

    if err := icatypes.ModuleCdc.UnmarshalJSON(packet.GetData(), &data); err != nil {
        // UnmarshalJSON errors are indeterminate and therefore are not wrapped and included in failed acks
        return nil, sdkerrors.Wrapf(icatypes.ErrUnknownDataType, "cannot unmarshal ICS-27 interchain account packet data")
    }

    switch data.Type {
        case icatypes.EXECUTE_TX:
            msgs, err := icatypes.DeserializeCosmosTx(k.cdc, data.Data)
            if err != nil {
                return nil, err
            }

            txResponse, err := k.executeTx(ctx, packet.SourcePort, packet.DestinationPort, packet.DestinationChannel, msgs)
            if err != nil {
                return nil, err
            }

            return txResponse, nil
        default:
            return nil, icatypes.ErrUnknownDataType
    }
}
```

This calls `executeTx` to apply the received transaction on the host chain:

```go
// executeTx attempts to execute the provided transaction. It begins by authenticating the transaction signer.
// If authentication succeeds, it does basic validation of the messages before attempting to deliver each message
// into state. The state changes will only be committed if all messages in the transaction succeed. Thus the
// execution of the transaction is atomic, all state changes are reverted if a single message fails.
func (k Keeper) executeTx(ctx sdk.Context, sourcePort, destPort, destChannel string, msgs []sdk.Msg) ([]byte, error) {
    channel, found := k.channelKeeper.GetChannel(ctx, destPort, destChannel)

    ...

    if err := k.authenticateTx(ctx, msgs, channel.ConnectionHops[0], sourcePort);

    ...

    // CacheContext returns a new context with the multi-store branched into a cached storage object
    // writeCache is called only if all msgs succeed, performing state transitions atomically
    cacheCtx, writeCache := ctx.CacheContext()
    for i, msg := range msgs {
        if err := msg.ValidateBasic(); err != nil {
            return nil, err
        }

        msgResponse, err := k.executeMsg(cacheCtx, msg)
        if err != nil {
            return nil, err
        }

        txMsgData.Data[i] = &sdk.MsgData{
            MsgType: sdk.MsgTypeURL(msg),
            Data:    msgResponse,
        }
    }

    ...
}
```

`authenticateTx` ensures that the provided message contains the correct interchain account owner address. `executeMsg` will call the message handler and therefore execute the message.

## SDK security model

SDK modules on a chain are assumed to be trustworthy. For example, there are no checks to prevent an untrustworthy module from accessing the bank keeper.

The implementation of [ICS-27](https://github.com/cosmos/ibc/blob/master/spec/app/ics-027-interchain-accounts/README.md) on [ibc-go](https://github.com/cosmos/ibc-go/tree/main/modules/apps/27-interchain-accounts) uses this assumption in its security considerations. The implementation assumes the authentication module will not try to open channels on owner addresses it does not control.

The implementation assumes other IBC application modules will not bind to ports within the [ICS-27](https://github.com/cosmos/ibc/blob/master/spec/app/ics-027-interchain-accounts/README.md) namespace.

## Authentication module

The [controller submodule](https://github.com/cosmos/ibc-go/tree/main/modules/apps/27-interchain-accounts/controller) is used for account registration and packet sending. It executes only logic required of all controllers of interchain accounts. The type of authentication used to manage the interchain accounts remains unspecified. There may exist many different types of authentication which are desirable for different use cases. Thus the purpose of the authentication module is to wrap the controller module with custom authentication logic.

In [ibc-go](https://github.com/cosmos/ibc-go), authentication modules are connected to the controller chain via a [middleware](https://github.com/cosmos/ibc-go/blob/main/modules/apps/27-interchain-accounts/controller/ibc_middleware.go) stack. The controller module is implemented as [middleware](https://github.com/cosmos/ibc/tree/master/spec/app/ics-030-middleware) and the authentication module is connected to the controller module as the base application of the middleware stack. To implement an authentication module, the `IBCModule` interface must be fulfilled. By implementing the controller module as middleware, any amount of authentication modules can be created and connected to the controller module without writing redundant code.

The **authentication module** must:

* Authenticate interchain account owners
* Track the associated interchain account address for an owner
* Claim the channel capability in `OnChanOpenInit`
* Send packets on behalf of an owner (after authentication)

The following [`IBCModule`](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go) callbacks must be implemented with appropriate custom logic:

```go
// OnChanOpenInit implements the IBCModule interface
func (im IBCModule) OnChanOpenInit(
    ctx sdk.Context,
    order channeltypes.Order,
    connectionHops []string,
    portID string,
    channelID string,
    chanCap *capabilitytypes.Capability,
    counterparty channeltypes.Counterparty,
    version string,
) error {
    // the authentication module *must* claim the channel capability on OnChanOpenInit
    if err := im.keeper.ClaimCapability(ctx, chanCap, host.ChannelCapabilityPath(portID, channelID)); err != nil {
        return err
    }

    // perform custom logic

    return nil
}

// OnChanOpenAck implements the IBCModule interface
func (im IBCModule) OnChanOpenAck(
    ctx sdk.Context,
    portID,
    channelID string,
    counterpartyVersion string,
) error {
    // perform custom logic

    return nil
}

// OnChanCloseConfirm implements the IBCModule interface
func (im IBCModule) OnChanCloseConfirm(
    ctx sdk.Context,
    portID,
    channelID string,
) error {
    // perform custom logic

    return nil
}

// OnAcknowledgementPacket implements the IBCModule interface
func (im IBCModule) OnAcknowledgementPacket(
    ctx sdk.Context,
    packet channeltypes.Packet,
    acknowledgement []byte,
    relayer sdk.AccAddress,
) error {
    // perform custom logic

    return nil
}

// OnTimeoutPacket implements the IBCModule interface.
func (im IBCModule) OnTimeoutPacket(
    ctx sdk.Context,
    packet channeltypes.Packet,
    relayer sdk.AccAddress,
) error {
    // perform custom logic

    return nil
}
```

The functions `OnChanOpenTry`, `OnChanOpenConfirm`, `OnChanCloseInit`, and `OnRecvPacket` must be defined to fulfill the `IBCModule` interface, but they will never be called by the controller module, so they may error or panic.

The authentication module can begin registering interchain accounts by calling `RegisterInterchainAccount`:

```go
if err := keeper.icaControllerKeeper.RegisterInterchainAccount(ctx, connectionID, owner.String()); err != nil {
    return err
}

return nil
```

The authentication module can attempt to send a packet by calling `SendTx`:

```go

// Authenticate owner
// perform custom logic

// Construct controller portID based on interchain account owner address
portID, err := icatypes.NewControllerPortID(owner.String())
if err != nil {
    return err
}

channelID, found := keeper.icaControllerKeeper.GetActiveChannelID(ctx, portID)
if !found {
    return sdkerrors.Wrapf(icatypes.ErrActiveChannelNotFound, "failed to retrieve active channel for port %s", portID)
}

// Obtain the channel capability, claimed in OnChanOpenInit
chanCap, found := keeper.scopedKeeper.GetCapability(ctx, host.ChannelCapabilityPath(portID, channelID))
if !found {
    return sdkerrors.Wrap(channeltypes.ErrChannelCapabilityNotFound, "module does not own channel capability")
}

// Obtain data to be sent to the host chain.
// In this example, the owner of the interchain account would like to send a bank MsgSend to the host chain.
// The appropriate serialization function should be called. The host chain must be able to deserialize the transaction.
// If the host chain is using the ibc-go host module, `SerializeCosmosTx` should be used.
msg := &banktypes.MsgSend{FromAddress: fromAddr, ToAddress: toAddr, Amount: amt}
data, err := icatypes.SerializeCosmosTx(keeper.cdc, []sdk.Msg{msg})
if err != nil {
    return err
}

// Construct packet data
packetData := icatypes.InterchainAccountPacketData{
    Type: icatypes.EXECUTE_TX,
    Data: data,
}

// Obtain timeout timestamp
// An appropriate timeout timestamp must be determined based on the usage of the interchain account.
// If the packet times out, the channel will be closed requiring a new channel to be created
timeoutTimestamp := obtainTimeoutTimestamp()

// Send the interchain accounts packet, returning the packet sequence
seq, err = keeper.icaControllerKeeper.SendTx(ctx, chanCap, portID, packetData, timeoutTimestamp)
```

The data within an `InterchainAccountPacketData` must be serialized using a format supported by the host chain. If the host chain is using the [IBC-Go host chain submodule](https://github.com/cosmos/ibc-go/tree/main/modules/apps/27-interchain-accounts/host), `SerializeCosmosTx` should be used. If the `InterchainAccountPacketData.Data` is serialized using a format not support by the host chain, the packet will not be successfully received.

Controller chains will be able to access the acknowledgement written into the host chain state once a relayer relays the acknowledgement. The acknowledgement bytes will be passed to the Authentication Module via the `OnAcknowledgementPacket` callback. Authentication Modules are expected to know how to decode the acknowledgement.

If the controller chain is connected to a host chain using the host module on ibc-go, it may interpret the acknowledgement bytes as follows:

```go
var ack channeltypes.Acknowledgement
if err := channeltypes.SubModuleCdc.UnmarshalJSON(acknowledgement, &ack); err != nil {
    return err
}

txMsgData := &sdk.TxMsgData{}
if err := proto.Unmarshal(ack.GetResult(), txMsgData); err != nil {
    return err
}
```

If the `txMsgData.Data` is empty, the host chain is using SDK version > v0.45. The auth module should interpret the `txMsgData.Responses` as follows:

```go
...
// switch statement from above
case 0:
    for _, any := range txMsgData.MsgResponses {
        if err := handleAny(any); err != nil {
            return err
        }
    }
}
```

A handler is needed to interpret what actions to perform based on the type url of the Any. A router could be used, or more simply a switch statement:

```go
func handleAny(any *codectypes.Any) error {
    switch any.TypeURL {
        case banktypes.MsgSend:
            msgResponse, err := unpackBankMsgSendResponse(any)
            if err != nil {
                return err
            }

            handleBankSendMsg(msgResponse)

        case stakingtypes.MsgDelegate:
            msgResponse, err := unpackStakingDelegateResponse(any)
            if err != nil {
                return err
            }

            handleStakingDelegateMsg(msgResponse)

            case transfertypes.MsgTransfer:
            msgResponse, err := unpackIBCTransferMsgResponse(any)
            if err != nil {
                return err
            }

            handleIBCTransferMsg(msgResponse)

        default:
            return
    }
}
```

## Example integration

[Here](https://github.com/cosmos/interchain-accounts-demo) is  an end-to-end working demo of interchain accounts. You will notice that it contains a similar `app.go` to the generic one which follows.


```go
// app.go

// Register the AppModule for the interchain accounts module and the authentication module
// Note: No `icaauth` exists, this must be substituted with an actual interchain accounts authentication module
ModuleBasics = module.NewBasicManager(
    ...
    ica.AppModuleBasic{},
    icaauth.AppModuleBasic{},
    ...
)

...

// Add module account permissions for the interchain accounts module
// Only necessary for host chain functionality
// Each interchain account created on the host chain is derived from the module account created
maccPerms = map[string][]string{
    ...
    icatypes.ModuleName:            nil,
}

...

// Add interchain account keepers for each submodule used and the authentication module
// If a submodule is being statically disabled, the associated Keeper does not need to be added.

type App struct {
    ...

    ICAControllerKeeper icacontrollerkeeper.Keeper
    ICAHostKeeper       icahostkeeper.Keeper
    ICAAuthKeeper       icaauthkeeper.Keeper

    ...
}

...

// Create store keys for each submodule Keeper and the authentication module
keys := sdk.NewKVStoreKeys(
    ...
    icacontrollertypes.StoreKey,
    icahosttypes.StoreKey,
    icaauthtypes.StoreKey,
    ...
)

...

// Create the scoped keepers for each submodule keeper and authentication keeper
scopedICAControllerKeeper := app.CapabilityKeeper.ScopeToModule(icacontrollertypes.SubModuleName)
scopedICAHostKeeper := app.CapabilityKeeper.ScopeToModule(icahosttypes.SubModuleName)
scopedICAAuthKeeper := app.CapabilityKeeper.ScopeToModule(icaauthtypes.ModuleName)

...

// Create the Keeper for each submodule
app.ICAControllerKeeper = icacontrollerkeeper.NewKeeper(
    appCodec, keys[icacontrollertypes.StoreKey], app.GetSubspace(icacontrollertypes.SubModuleName),
    app.IBCKeeper.ChannelKeeper, // may be replaced with middleware such as ics29 fee
    app.IBCKeeper.ChannelKeeper, &app.IBCKeeper.PortKeeper,
    app.AccountKeeper, scopedICAControllerKeeper, app.MsgServiceRouter(),
)
app.ICAHostKeeper = icahostkeeper.NewKeeper(
    appCodec, keys[icahosttypes.StoreKey], app.GetSubspace(icahosttypes.SubModuleName),
    app.IBCKeeper.ChannelKeeper, &app.IBCKeeper.PortKeeper,
    app.AccountKeeper, scopedICAHostKeeper, app.MsgServiceRouter(),
)

// Create interchain accounts AppModule
icaModule := ica.NewAppModule(&app.ICAControllerKeeper, &app.ICAHostKeeper)

// Create your interchain accounts authentication module
app.ICAAuthKeeper = icaauthkeeper.NewKeeper(appCodec, keys[icaauthtypes.StoreKey], app.ICAControllerKeeper, scopedICAAuthKeeper)

// ICA auth AppModule
icaAuthModule := icaauth.NewAppModule(appCodec, app.ICAAuthKeeper)

// ICA auth IBC Module
icaAuthIBCModule := icaauth.NewIBCModule(app.ICAAuthKeeper)

// Create host and controller IBC Modules as desired
icaControllerIBCModule := icacontroller.NewIBCModule(app.ICAControllerKeeper, icaAuthIBCModule)
icaHostIBCModule := icahost.NewIBCModule(app.ICAHostKeeper)

// Register host and authentication routes
ibcRouter.AddRoute(icacontrollertypes.SubModuleName, icaControllerIBCModule).
    AddRoute(icahosttypes.SubModuleName, icaHostIBCModule).
    AddRoute(icaauthtypes.ModuleName, icaControllerIBCModule) // Note, the authentication module is routed to the top level of the middleware stack

...

// Register interchain accounts and authentication module AppModule's
app.moduleManager = module.NewManager(
    ...
    icaModule,
    icaAuthModule,
)

...

// Add interchain accounts module InitGenesis logic
app.mm.SetOrderInitGenesis(
    ...
    icatypes.ModuleName,
    ...
)
```

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How an **Interchain account** (ICA) allows you to control an account on a "host chain" from a "controller chain".
* How the ICA **application module** can be set to function exclusively in the host or controller role, or for these submodules to be enabled and disabled dynamically using on-chain parameters.
* How an ICA **authentication module** is required on the controller chain for the creation and management of ICAs.

</HighlightBox>

<!--## Next up

After having a closer look at the Cosmos SDK security model, the authentication module, and an example integration, discover relaying with IBC in the [next section](./relayer-intro.md).-->
