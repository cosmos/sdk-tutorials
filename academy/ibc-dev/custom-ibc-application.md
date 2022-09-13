---
title: "Implement a Custom IBC Application"
order:
description: Take a closer look at applications
tag: deep-dive
---

<!-- DO NOT INCLUDE -->

# Implement a Custom IBC Application

<HighlightBox type="prerequisite">

Before you dive into Go relayers, make sure to install Go.
<br></br>
For all installations, please see the [setup page](../3-my-own-chain/setup.md).

</HighlightBox>

<HighlightBox type="learning">

In this section, you will explore more regarding:

* Application callbacks
* The IBC Module Interface

</HighlightBox>

You can see that the application callbacks are coming from a [router](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/router.go):

```go
// GetRoute returns a IBCModule for a given module.
func (rtr *Router) GetRoute(module string) (IBCModule, bool) {
    if !rtr.HasRoute(module) {
        return nil, false
    }
    return rtr.routes[module], true
}
```

This returns an implementation of the [IBC Module Interface](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go):

```go
// IBCModule defines an interface that implements all the callbacks
// that modules must define as specified in ICS-26
type IBCModule interface {
    // OnChanOpenInit will verify that the relayer-chosen parameters are
    // valid and perform any custom INIT logic.It may return an error if
    // the chosen parameters are invalid in which case the handshake is aborted.
    // OnChanOpenInit should return an error if the provided version is invalid.
    OnChanOpenInit(
        ctx sdk.Context,
        order channeltypes.Order,
        connectionHops []string,
        portID string,
        channelID string,
        channelCap *capabilitytypes.Capability,
        counterparty channeltypes.Counterparty,
        version string,
    ) error
}
```

Here you can find all the callbacks your application needs to implement. So, in the `msg_serve.go` you can find the following in the `ChannelOpenInit`:

```go
// Perform application logic callback
if err = cbs.OnChanOpenInit(ctx, msg.Channel.Ordering, msg.Channel.ConnectionHops, msg.PortId, channelID, cap, msg.Channel.Counterparty, msg.Channel.Version); err != nil {
    return nil, sdkerrors.Wrap(err, "channel open init callback failed")
}
```

This calls custom logic of the application. The situation is similar for `OnChanOpenTry`, `OnChanOpenAck`, `OnChanOpenConfirm`, etc., in the [IBC Module Interface](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go):

```go
// OnChanOpenTry will verify the relayer-chosen parameters along with the
// counterparty-chosen version string and perform custom TRY logic.
// If the relayer-chosen parameters are invalid, the callback must return
// an error to abort the handshake. If the counterparty-chosen version is not
// compatible with this modules supported versions, the callback must return
// an error to abort the handshake. If the versions are compatible, the try callback
// must select the final version string and return it to core IBC.
// OnChanOpenTry may also perform custom initialization logic
OnChanOpenTry(
    ctx sdk.Context,
    order channeltypes.Order,
    connectionHops []string,
    portID,
    channelID string,
    channelCap *capabilitytypes.Capability,
    counterparty channeltypes.Counterparty,
    counterpartyVersion string,
) (version string, err error)

// OnChanOpenAck will error if the counterparty selected version string
// is invalid to abort the handshake. It may also perform custom ACK logic.
OnChanOpenAck(
    ctx sdk.Context,
    portID,
    channelID string,
    counterpartyChannelID string,
    counterpartyVersion string,
) error

// OnChanOpenConfirm will perform custom CONFIRM logic and may error to abort the handshake.
OnChanOpenConfirm(
    ctx sdk.Context,
    portID,
    channelID string,
) error

...
```

You will learn about applications soon, but the take away here is that an application developer will need to implement the [IBC Module Interface](https://github.com/cosmos/ibc-go/blob/main/modules/core/05-port/types/module.go).
