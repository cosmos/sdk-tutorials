---
title: "Create a Custom IBC Middleware"
order: 9
description: Implementing interfaces
tags: 
  - guided-coding
  - ibc
  - dev-ops
---

# Create a Custom IBC Middleware

When developing a custom IBC application, one of the first things to do is to implement the `IBCModule` interface, as seen [previously](/hands-on-exercise/5-ibc-adv/6-ibc-app-steps.md).

The interface can be found [here](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go).

Likewise, when developing IBC middleware, the `Middleware` interface should be implemented. It can be found in the same file as the `IBCModule` and appears as follows:

```go
type Middleware interface {
    IBCModule
    ICS4Wrapper
}
```

<HighlightBox type="note">

Middleware must implement `IBCModule` to wrap communication from core IBC to the underlying application, and must implement `ICS4Wrapper` to wrap communication from the underlying application to core IBC.

</HighlightBox>

You know `IBCModule` from the IBC custom app section. `ICS4Wrapper` is an interface like so:

```go
// This is implemented by ICS4 and all middleware wrapping the base application.
// The base application will call `sendPacket` or `writeAcknowledgement` of the middleware directly above them
// which will call the next middleware until it reaches the core IBC handler.
type ICS4Wrapper interface {
    SendPacket(ctx sdk.Context, chanCap *capabilitytypes.Capability, packet exported.Packet) error
    WriteAcknowledgement(ctx sdk.Context, chanCap *capabilitytypes.Capability, packet exported.Packet, ack exported.Acknowledgement) error
    GetAppVersion(ctx sdk.Context, portID, channelID string) (string, bool)
}
```

When developing custom middleware, you can implement these interfaces for a new `IBCMiddleware` that has access to its keeper and an underlying application. In the `ibc_middleware.go` file:

```go
import (
	...
	porttypes "github.com/cosmos/ibc-go/v5/modules/core/05-port/types"
	...
)
var _ porttypes.Middleware = &IBCMiddleware{}

type IBCMiddleware struct {
	app    porttypes.IBCModule
	keeper keeper.Keeper    //add a keeper for stateful middleware
}

// IBCMiddleware creates a new IBCMiddleware given the associated keeper and underlying application
func NewIBCMiddleware(app porttypes.IBCModule, k keeper.Keeper) IBCMiddleware {
	return IBCMiddleware{
		app:    app,
		keeper: k,
	}
}
```

Below you will take a closer look at how to implement the handshake callbacks and the packet callbacks, to satisfy the `IBCModule` interface, and also the `SendPacket`, `WriteAcknowledgement` and `GetAppVersion` methods, to satisfy the `ICS4Wrapper` interface.

As a reminder, review once more the diagram representing the information flow between core IBC and the base application with a middleware (stack) applied:

![middleware_stack](/hands-on-exercise/5-ibc-adv/images/middleware-stack.png)

## Channel handshake callbacks

The first type of callbacks from core IBC to the application are the channel handshake callbacks. When a middleware (stack) is applied, every piece of middleware will have access to the underlying application (base application or downstream middleware). For the handshake callbacks, function calls happen from core IBC through the middleware and then to the base application. Each middleware will call the underlying application's callback but it can execute custom application logic before doing so.

Check out the code snippets below to see this in action, or use the links to see how it is implemented for fee middleware (ICS-29).

<HighlightBox type="info">

Middleware **may** choose not to call the underlying application's callback at all. However, these should generally be limited to error cases.

</HighlightBox>

### Middleware version negotiation

In the case where the IBC middleware expects to speak to a compatible IBC middleware on the counterparty chain, they must **use the channel handshake to negotiate the middleware version without interfering in the version negotiation of the underlying application**.

Middleware accomplishes this by formatting the version in a JSON-encoded string containing the middleware version and the application version. The application version may as well be a JSON-encoded string, possibly including further middleware and app versions if the application stack consists of multiple middlewares wrapping a base application. The format of the version is specified in ICS-30 as follows:

```json
{
  "<middleware_version_key>": "<middleware_version_value>",
  "app_version": "<application_version_value>"
  // ... other custom parameter fields
}
```

The `<middleware_version_key>` key in the JSON struct should be replaced by the actual name of the key for the corresponding middleware (e.g. `fee_version`).

During the handshake callbacks, the middleware can unmarshal the version string and retrieve the middleware and application versions. It can do its negotiation logic on `<middleware_version_value>`, and pass the `<application_version_value>` to the underlying application.

<HighlightBox type="note">

Middleware that does not need to negotiate with a counterparty middleware on the remote stack will not implement the version unmarshalling and negotiation, and may simply perform its own custom logic on the callbacks without relying on the counterparty behaving similarly.

</HighlightBox>

### Capabilities

The middleware should simply pass the capability in the callback arguments along to the underlying application so that it may be claimed by the base application. The base application will then pass the capability up the stack in order to authenticate an outgoing packet/acknowledgment.

### Code snippets

Note that the code snippets below contain _pseudo code_, like `doCustomLogic(args)`. Every code snippet is accompanied by a reference to the respective function in the [fee middleware IBC application](https://github.com/cosmos/ibc-go/tree/main/modules/apps/29-fee) from the official `ibc-go` repository.

<ExpansionPanel title="`OnChanOpenInit`">

```go
func (im IBCMiddleware) OnChanOpenInit(
    ctx sdk.Context,
    order channeltypes.Order,
    connectionHops []string,
    portID string,
    channelID string,
    channelCap *capabilitytypes.Capability,
    counterparty channeltypes.Counterparty,
    version string,
) (string, error) {
    if version != "" {
        // try to unmarshal JSON-encoded version string and pass
        // the app-specific version to app callback.
        // otherwise, pass version directly to app callback.
        metadata, err := Unmarshal(version)
        if err != nil {
            // Since it is valid for the fee version to not be specified,
            // the above middleware version may be for another middleware.
            // Pass the entire version string onto the underlying application.
            return im.app.OnChanOpenInit(
                ctx,
                order,
                connectionHops,
                portID,
                channelID,
                channelCap,
                counterparty,
                version,
            )
        }
        else {
        metadata = {
            // set middleware version to default value
            MiddlewareVersion: defaultMiddlewareVersion,
            // allow the application to return its default version
            AppVersion: "",
            }
        }
    doCustomLogic()
    // if the version string is empty, OnChanOpenInit is expected to return
    // a default version string representing the version(s) it supports
    appVersion, err := im.app.OnChanOpenInit(
        ctx,
        order,
        connectionHops,
        portID,
        channelID,
        channelCap,
        counterparty,
        metadata.AppVersion, // note you only pass app version here
    )
    if err != nil {
        return "", err
    }
    version := constructVersion(metadata.MiddlewareVersion, appVersion)
    return version, nil
    }
}
```

</ExpansionPanel>

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L34-L82) for an example implementation of this callback for the ICS29 Fee Middleware module.

<ExpansionPanel title="`OnChanOpenTry`">

```go
func (im IBCMiddleware) OnChanOpenTry(
    ctx sdk.Context,
    order channeltypes.Order,
    connectionHops []string,
    portID,
    channelID string,
    channelCap *capabilitytypes.Capability,
    counterparty channeltypes.Counterparty,
    counterpartyVersion string,
) (string, error) {
    // try to unmarshal JSON-encoded version string and pass
    // the app-specific version to app callback.
    // otherwise, pass version directly to app callback.
    cpMetadata, err := Unmarshal(counterpartyVersion)
    if err != nil {
        return app.OnChanOpenTry(
            ctx,
            order,
            connectionHops,
            portID,
            channelID,
            channelCap,
            counterparty,
            counterpartyVersion,
        )
    }
    doCustomLogic()
    // Call the underlying application's OnChanOpenTry callback.
    // The try callback must select the final app-specific version string and return it.
    appVersion, err := app.OnChanOpenTry(
        ctx,
        order,
        connectionHops,
        portID,
        channelID,
        channelCap,
        counterparty,
        cpMetadata.AppVersion, // note you only pass counterparty app version here
    )
    if err != nil {
        return "", err
    }
    // negotiate final middleware version
    middlewareVersion := negotiateMiddlewareVersion(cpMetadata.MiddlewareVersion)
    version := constructVersion(middlewareVersion, appVersion)
    return version, nil
}
```

</ExpansionPanel>

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L84-L124) for an example implementation of this callback for the ICS29 Fee Middleware module.

<ExpansionPanel title="`OnChanOpenAck`">

```go
func (im IBCMiddleware) OnChanOpenAck(
    ctx sdk.Context,
    portID,
    channelID string,
    counterpartyChannelID string,
    counterpartyVersion string,
) error {
    // try to unmarshal JSON-encoded version string and pass
    // the app-specific version to app callback.
    // otherwise, pass version directly to app callback.
    cpMetadata, err = UnmarshalJSON(counterpartyVersion)
    if err != nil {
        return app.OnChanOpenAck(ctx, portID, channelID, counterpartyChannelID, counterpartyVersion)
    }
    if !isCompatible(cpMetadata.MiddlewareVersion) {
        return error
    }
    doCustomLogic()
    // call the underlying application's OnChanOpenTry callback
    return app.OnChanOpenAck(ctx, portID, channelID, counterpartyChannelID, cpMetadata.AppVersion)
}
```

</ExpansionPanel>

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L126-L152) for an example implementation of this callback for the ICS29 Fee Middleware module.

<ExpansionPanel title="`OnChanOpenConfirm`">

```go
func (im IBCMiddleware) OnChanOpenConfirm(
    ctx sdk.Context,
    portID,
    channelID string,
) error {
    doCustomLogic()
    return app.OnChanOpenConfirm(ctx, portID, channelID)
}
```

</ExpansionPanel>

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L154-L162) for an example implementation of this callback for the ICS29 Fee Middleware module.

Similarly, for the channel closing:

<ExpansionPanel title="`OnChanCloseInit`">

```go
func (im IBCMiddleware) OnChanCloseInit(
    ctx sdk.Context,
    portID,
    channelID string,
) error {
    doCustomLogic()
    return app.OnChanCloseInit(ctx, portID, channelID)
}
```

</ExpansionPanel>

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L164-L187) for an example implementation of this callback for the ICS29 Fee Middleware module.

<ExpansionPanel title="`OnChanCloseConfirm`">

```go
func (im IBCMiddleware) OnChanCloseConfirm(
    ctx sdk.Context,
    portID,
    channelID string,
) error {
    doCustomLogic()
    return app.OnChanCloseConfirm(ctx, portID, channelID)
}
```

</ExpansionPanel>

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L189-L212) for an example implementation of this callback for the ICS29 Fee Middleware module.

## Packet callbacks

The middleware's packet callbacks wrap the application's packet callbacks, just like the middleware's handshake callbacks wrapped the application's handshake callbacks.

<HighlightBox type="note">

The packet callbacks are where the middleware performs most of its custom logic. The middleware may read the packet flow data and perform some additional packet handling, or it may modify the incoming data before it reaches the underlying application. This enables a wide degree of use cases, as a simple base application like token transfer can be transformed for a variety of use cases by combining it with custom middleware.

</HighlightBox>

### Code snippets

Note that the code snippets below contain _pseudo code_, like `doCustomLogic(args)`. Every code snippet is accompanied by a reference to the respective function in the [fee middleware IBC application](https://github.com/cosmos/ibc-go/tree/main/modules/apps/29-fee) from the official `ibc-go` repository.

<ExpansionPanel title="`OnRecvPacket`">

```go
func (im IBCMiddleware) OnRecvPacket(
    ctx sdk.Context,
    packet channeltypes.Packet,
    relayer sdk.AccAddress,
) ibcexported.Acknowledgement {
    doCustomLogic(packet)
    ack := app.OnRecvPacket(ctx, packet, relayer)
    doCustomLogic(ack) // middleware may modify outgoing ack
    return ack
}
```

</ExpansionPanel>

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L214-L237) for an example implementation of this callback for the ICS29 Fee Middleware module.

<ExpansionPanel title="`OnAcknowledgementPacket`">

```go
func (im IBCMiddleware) OnAcknowledgementPacket(
    ctx sdk.Context,
    packet channeltypes.Packet,
    acknowledgement []byte,
    relayer sdk.AccAddress,
) error {
    doCustomLogic(packet, ack)
    return app.OnAcknowledgementPacket(ctx, packet, ack, relayer)
}
```

</ExpansionPanel>

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L239-L292) for an example implementation of this callback for the ICS29 Fee Middleware module.

<ExpansionPanel title="`OnTimeoutPacket`">

```go
func (im IBCMiddleware) OnTimeoutPacket(
    ctx sdk.Context,
    packet channeltypes.Packet,
    relayer sdk.AccAddress,
) error {
    doCustomLogic(packet)
    return app.OnTimeoutPacket(ctx, packet, relayer)
}
```

</ExpansionPanel>

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L294-L334) for an example implementation of this callback for the ICS29 Fee Middleware module.

## ICS-4 wrappers

Middleware must also implement the `ICS4Wrapper` interface so that any communication from the application to the `channelKeeper` goes through the middleware first. Similar to the packet callbacks, the middleware may modify outgoing acknowledgments and packets in any way it wishes.

### Capabilities

Earlier you saw that the handshake callbacks passed the capability in the callback arguments along to the underlying application so that it may be claimed by the base application. In the `ICS4Wrapper` methods, the base application will then pass the capability up the stack in order to authenticate an outgoing packet or acknowledgement.

If the middleware wishes to send a packet or acknowledgment without the involvement of the underlying application, it should be given access to the same `scopedKeeper` as the base application so that it can retrieve the capabilities by itself.

### Code snippets

Note that the code snippets below contain _pseudo code_, like `doCustomLogic(args)`. Every code snippet is accompanied by a reference to the respective function in the [fee middleware IBC application](https://github.com/cosmos/ibc-go/tree/main/modules/apps/29-fee) from the official `ibc-go` repository.

<ExpansionPanel title="`SendPacket`">

```go
func SendPacket(
    ctx sdk.Context,
    chanCap *capabilitytypes.Capability,
    appPacket exported.PacketI,
) {
    // middleware may modify packet
    packet = doCustomLogic(appPacket)
    return ics4Keeper.SendPacket(ctx, chanCap, packet)
}
```

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L336-L343) for an example implementation of this function for the ICS29 Fee Middleware module.

</ExpansionPanel>

<ExpansionPanel title="`WriteAcknowledgement`">

```go
// only called for async acks
func WriteAcknowledgement(
    ctx sdk.Context,
    chanCap *capabilitytypes.Capability,
    packet exported.PacketI,
    ack exported.Acknowledgement,
) {
    // middleware may modify acknowledgement
    ack_bytes = doCustomLogic(ack)
    return ics4Keeper.WriteAcknowledgement(packet, ack_bytes)
}
```

See [here](https://github.com/cosmos/ibc-go/blob/48a6ae512b4ea42c29fdf6c6f5363f50645591a2/modules/apps/29-fee/ibc_middleware.go#L345-L353) for an example implementation of this function for the ICS29 Fee Middleware module.

</ExpansionPanel>

<ExpansionPanel title="`GetAppVersion`">

```go
// middleware must return the underlying application version
func GetAppVersion(
    ctx sdk.Context,
    portID,
    channelID string,
) (string, bool) {
    version, found := ics4Keeper.GetAppVersion(ctx, portID, channelID)
    if !found {
        return "", false
    }
    if !MiddlewareEnabled {
        return version, true
    }
    // unwrap channel version
    metadata, err := Unmarshal(version)
    if err != nil {
        panic(fmt.Errof("unable to unmarshal version: %w", err))
    }
    return metadata.AppVersion, true
}
```

</ExpansionPanel>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How to integrate middleware (or a middleware stack) in `app.go`.
* The importance of middleware order in the middleware stack.
* How only the top-layer middleware of any stack should be connected to the IBC router.

</HighlightBox>

<!--## Next up

After implementing the interfaces `IBCModule` and `ICS4Wrapper` and the custom middleware logic, the remaining work is to integrate the middleware into the chain. You will have to keep in mind the order in the middleware stack (in case there are multiple middlewares) and whether or not the middleware is stateful. This is the topic of the next section.-->
