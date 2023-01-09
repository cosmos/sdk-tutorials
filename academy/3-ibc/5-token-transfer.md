---
title: "IBC Token Transfer"
order: 6
description: Fungible token transfers across chains
tags:
  - concepts
  - ibc
  - dev-ops
---

# IBC Token Transfer

<HighlightBox type="learning">

Transferring tokens between chains is both a common requirement and a significant technical challenge when two chains are incompatible. A convenient solution for moving tokens between chains is essential.
<br/><br/>
In this section, you will explore how a fungible token transfer can be done with IBC.

</HighlightBox>

Having looked at IBC's transport, authentication, and ordering layer (IBC/TAO), you can now take a look at [ICS-20](https://github.com/cosmos/ibc/blob/master/spec/app/ics-020-fungible-token-transfer/README.md). ICS-20 describes **fungible token transfers**.

<HighlightBox type="info">

Fungibility refers to an instance in which a token is interchangeable with other instances of that token or not. Fungible tokens can be exchanged and replaced.

</HighlightBox>

There are many use cases involving token transfers on blockchains, like the tokenization of assets holding value or initial coin offerings (ICOs) to finance blockchain projects. IBC makes it possible to transfer tokens and other digital assets between (sovereign) chains, both fungible and non-fungible tokens. For example, fungible token transfers allow you to build applications relying on cross-chain payments and token exchanges. Therefore, IBC frees up great potential for cross-chain Decentralized Finance (DeFi) applications by offering a technically reliable cross-chain interoperability protocol that is compatible with digital assets on multiple networks.

The corresponding [implementation](https://github.com/cosmos/ibc-go/tree/main/modules/apps/transfer) is a module on the application level.

![Overview of a token transfer](/academy/3-ibc/images/transferoverview.png)

Look at the picture above. You can see two chains, A and B. You also see there is a channel connecting both chains.

How can tokens be transferred between chains and channels?

To understand the application logic for a token transfer, first, you have to determine the **source** chain:

![Source chain](/academy/3-ibc/images/sourcechain.png)

Then the application logic can be summarized:

![Application logic](/academy/3-ibc/images/applicationlogic.png)

Shortly you will see the corresponding code. Now again have a look at a transfer from **source** to **sink**:

![Source to sink](/academy/3-ibc/images/sourcetosink.png)

Above the **source** is chain A. The source channel is **channel-2** and the destination channel is **channel-40**. The token denominations are represented as `{Port}/{Channel}/{denom}` (or rather their [IBC denom representation](../../tutorials/5-ibc-dev/index.md) on chain). The prefixed port and channel pair indicate which channel the funds were previously sent through. You see **transfer/channel-...** because the transfer module will bind to a port, which is named transfer. If chain A sends 100 ATOM tokens, chain B will receive 100 ATOM tokens and append the destination prefix **port/channel-id**. So chain B will mint those 100 ATOM tokens as **ibc/<hash of transfer/channel-40/uatom>**. The **channel-id** will be increased sequentially per channel on a given connection.

<HighlightBox type="note">

We can send assets (or their IBC voucher representation) in multiple _hops_ across multiple chains. Every single time the path will be prepended with the _port/channel-id/..._ prefix.
</br></br>
When sending this IBC denom (having had multiple hops) back to its source chain, for every hop back one _port/channel-id/..._ prefix will be taken off. This results in a return to the original denom if all the hops are reversed.

</HighlightBox>

If the tokens are sent back from the **same channel** as they were received:

![Sink to source](/academy/3-ibc/images/sinktosource.png)

Chain A will "un-escrow" 100 **ATOM tokens**, thus, the prefix will be removed. Chain B will burn **transfer/channel-40/atoms**.

<HighlightBox type="note">

The prefix determines the **source** chain. If the module sends the token from another channel, chain B is the source chain and chain A mints new tokens with a prefix instead of un-escrowing ATOM tokens. You can have different channels between two chains, but you cannot transfer the same token across different channels back and forth. If `{denom}` contains `/`, then it must also follow the ICS-20 form, which indicates that this token has a multi-hop record. This requires that the character `/` is prohibited in non-IBC token denomination names.

</HighlightBox>

![Source sink logic](/academy/3-ibc/images/sourcesinklogic.png)

You already know that an application needs to implement the [IBC Module Interface](https://github.com/cosmos/ibc-go/blob/v5.1.0/modules/core/05-port/types/module.go), so have a look at the [implementation for the token transfer](https://github.com/cosmos/ibc-go/blob/v5.1.0/modules/apps/transfer/ibc_module.go), e.g. for `OnChanOpenInit`:

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
    if err := ValidateTransferChannelParams(ctx, im.keeper, order, portID, channelID); err != nil {
        return err
    }

    if version != types.Version {
        return sdkerrors.Wrapf(types.ErrInvalidVersion, "got %s, expected %s", version, types.Version)
    }

    // Claim channel capability passed back by IBC module
    if err := im.keeper.ClaimCapability(ctx, chanCap, host.ChannelCapabilityPath(portID, channelID)); err != nil {
        return err
    }

    return nil
}
```

`OnChanOpenAck`, `OnChanOpenConfirm`, `OnChanCloseInit`, and `OnChanCloseConfirm` will do (almost) no checks.

## Transfer packet flow

You have seen an introduction to the application packet flow in [the section on channels](./3-channels.md/#application-packet-flow). This section will analyze this packet flow for the specific case of the _transfer_ module.

### Sending a transfer packet

After a channel is established, the module can start sending and receiving packets.

So where does the module send a token? Take a look at the [msg_server.go](https://github.com/cosmos/ibc-go/blob/v5.1.0/modules/apps/transfer/keeper/msg_server.go) of the token transfer module:

```go
// Transfer defines an rpc handler method for MsgTransfer.
func (k Keeper) Transfer(goCtx context.Context, msg *types.MsgTransfer) (*types.MsgTransferResponse, error) {
    ...

    if err := k.SendTransfer(
        ctx, msg.SourcePort, msg.SourceChannel, msg.Token, sender, msg.Receiver, msg.TimeoutHeight, msg.TimeoutTimestamp,
        ); err != nil {
        return nil, err
    }
    ...
}
```

There you see `SendTransfer`, which implements the application logic after [checking if the sender is a source or sink chain](https://github.com/cosmos/ibc-go/blob/v5.1.0/modules/apps/transfer/types/coin.go):

```go
func (k Keeper) SendTransfer(
    ctx sdk.Context,
    sourcePort,
    sourceChannel string,
    token sdk.Coin,
    sender sdk.AccAddress,
    receiver string,
    timeoutHeight clienttypes.Height,
    timeoutTimestamp uint64,
) {
  ...

    // deconstruct the token denomination into the denomination trace info
    // to determine if the sender is the source chain
    if strings.HasPrefix(token.Denom, "ibc/") {
        fullDenomPath, err = k.DenomPathFromHash(ctx, token.Denom)
        if err != nil {
            return err
        }
    }

    ...

    // NOTE: SendTransfer simply sends the denomination as it exists on its own
    // chain inside the packet data. The receiving chain will perform denom
    // prefixing as necessary.

    if types.SenderChainIsSource(sourcePort, sourceChannel, fullDenomPath) {
        ...

        // create the escrow address for the tokens
        escrowAddress := types.GetEscrowAddress(sourcePort, sourceChannel)

        // escrow source tokens. It fails if balance insufficient.
        if err := k.bankKeeper.SendCoins(...) {
        } else {
            ...

            if err := k.bankKeeper.SendCoinsFromAccountToModule(...);

            ...

            if err := k.bankKeeper.BurnCoins(...);

            ...
        }

        packetData := types.NewFungibleTokenPacketData(
            fullDenomPath, token.Amount.String(), sender.String(), receiver,
        )
        ...
    }
}
```

Take a look at the [type definition of a token packet](https://github.com/cosmos/ibc-go/blob/v5.1.0/proto/ibc/applications/transfer/v2/packet.proto) before diving further into the code:

```protobuf
syntax = "proto3";

package ibc.applications.transfer.v2;

option go_package = "github.com/cosmos/ibc-go/v3/modules/apps/transfer/types";

// FungibleTokenPacketData defines a struct for the packet payload
// See FungibleTokenPacketData spec:
// https://github.com/cosmos/ibc/tree/master/spec/app/ics-020-fungible-token-transfer#data-structures
message FungibleTokenPacketData {
    // the token denomination to be transferred
    string denom = 1;
    // the token amount to be transferred
    string amount = 2;
    // the sender address
    string sender = 3;
    // the recipient address on the destination chain
    string receiver = 4;
    // optional memo
    string memo = 5;
}
```

<HighlightBox type="note">

An optional _memo_ field was recently added to the packet definition. More details on the motivation, use cases, and consequences can be found in the [accompanying blog post](https://medium.com/the-interchain-foundation/moving-beyond-simple-token-transfers-d42b2b1dc29b).

</HighlightBox>

### Receiving a transfer packet

A relayer will then pick up the `SendPacket` event and submit a `MsgRecvPacket` on the destination chain.

This will trigger an `OnRecvPacket` callback that will decode a packet and apply the transfer token application logic:

```go
// OnRecvPacket implements the IBCModule interface. A successful acknowledgement
// is returned if the packet data is successfully decoded and the receive application
// logic returns without error.
func (im IBCModule) OnRecvPacket(
    ctx sdk.Context,
    packet channeltypes.Packet,
    relayer sdk.AccAddress,
) ibcexported.Acknowledgement {
    ack := channeltypes.NewResultAcknowledgement([]byte{byte(1)})

	var data types.FungibleTokenPacketData
	var ackErr error
	if err := types.ModuleCdc.UnmarshalJSON(packet.GetData(), &data); err != nil {
		ackErr = sdkerrors.Wrapf(sdkerrors.ErrInvalidType, "cannot unmarshal ICS-20 transfer packet data")
		ack = channeltypes.NewErrorAcknowledgement(ackErr)
	}

	// only attempt the application logic if the packet data
	// was successfully decoded
	if ack.Success() {
		err := im.keeper.OnRecvPacket(ctx, packet, data)
		if err != nil {
			ack = channeltypes.NewErrorAcknowledgement(err)
			ackErr = err
		}
	}

	eventAttributes := []sdk.Attribute{
		sdk.NewAttribute(sdk.AttributeKeyModule, types.ModuleName),
		sdk.NewAttribute(sdk.AttributeKeySender, data.Sender),
		sdk.NewAttribute(types.AttributeKeyReceiver, data.Receiver),
		sdk.NewAttribute(types.AttributeKeyDenom, data.Denom),
		sdk.NewAttribute(types.AttributeKeyAmount, data.Amount),
		sdk.NewAttribute(types.AttributeKeyMemo, data.Memo),
		sdk.NewAttribute(types.AttributeKeyAckSuccess, fmt.Sprintf("%t", ack.Success())),
	}

	if ackErr != nil {
		eventAttributes = append(eventAttributes, sdk.NewAttribute(types.AttributeKeyAckError, ackErr.Error()))
	}

	ctx.EventManager().EmitEvent(
		sdk.NewEvent(
			types.EventTypePacket,
			eventAttributes...,
		),
	)

	// NOTE: acknowledgement will be written synchronously during IBC handler execution.
	return ack
}
```

<HighlightBox type="note">

Observe in the previous example how we redirect to the module keeper's `OnRecvPacket` method and are constructing the acknowledgment to be sent back.

</HighlightBox>

### Acknowledging or timing out packets

A useful exercise is to try to find and analyze the code corresponding to this. The place to start is the packet callbacks, usually defined in a file like `module_ibc.go` or `ibc_module.go`.

<HighlightBox type="remember">

When a packet times out, the submission of a `MsgTimeout` is essential to get the locked funds unlocked again. As an exercise, try to find the code where this is executed.

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* How IBC provides a reliable solution to the technical challenge of transferring fungible and non-fungible tokens between two different blockchains, freeing up great potential for cross-chain Decentralized Finance (DeFi) applications.
* How the process for transferring value differs based on whether or not the IBC tokens are native to the source chain, or whether or not they are being sent on a channel they were previously received on.

</HighlightBox>

<!--## Next up

In the [next section](./6-ica.md), discover how you can control an account on a host chain from a controller chain using interchain accounts (ICAs).-->
