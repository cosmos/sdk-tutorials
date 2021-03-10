---
order: 1
---

# IBC Hello World

The Hello World example is a time-honored tradition in computer programming.

The Interblockchain Communication Protocol is an important part of the Cosmos SDK ecosystem. 
Understanding how to create and send packets across blockchain will help you navigate between blockchains with the Cosmos SDK.

**You will learn how to**
- Use Interblockchain Communication Protocol (IBC) to create and send packets between blockchains.
- Navigate between blockchains using the Cosmos SDK and the Starport Relayer.
- Create a basic blog post and save the post on another blockchain.

## What is Cosmos SDK and IBC?

The Cosmos SDK is a framework to create a blockchain app. The Cosmos SDK allows developers to easily create custom blockchains that can natively interoperate with other blockchains.
The IBC module in the Cosmos SDK is the standard for the interaction between two blockchains. The IBC module defines how packets and messages are constructed to be interpreted by the sending and the receiving blockchain.
The Cosmos IBC relayer package lets you can connect between sets of IBC-enabled chains. This tutorial teaches you how to create two blockchains and then start and use the relayer with Starport to connect two blockchains.
This tutorial covers essentials like modules, IBC packets, relayer, and the lifecycle of packets routed through IBC.

## Prerequisites 

This tutorial uses [Starport](https://github.com/tendermint/starport) v0.15.0. The Starport tool is the easiest way to build a blockchain. 

To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.15.0! | bash
```

You can also use Starport v0.15.0 in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.15.0). For more installation options, see [Install Starport](https://github.com/tendermint/starport/blob/develop/docs/1%20Introduction/2%20Install.md).

## Create a Blockchain App

Create a blockchain app with a blog module to write posts on other blockchains that contain the Hello World message (or rather Hello Mars, Hello Cosmos and Hello Earth) for an IBC module.

For this simple example, create an app that contains a blog module that has a post transaction with title and text. 

After you define the logic, run two blockchains that have this module installed.
- The chains can send posts between each other using IBC. 
- On the sending chain, save the `acknowledged` and `timed out` posts.

After the transaction is acknowledged by the receiving chain, you know that the post is saved on both blockchains.
- The sending chain has the additional data `postID`. 
- Sent posts that are acknowledged and timed out contain the title and the target chain of the post. These identifiers are visible on the parameter `chain`. 
The following chart shows the lifecycle of a packet that travels through IBC.

[![The Lifecycle of an IBC packet in the blog module](./packet_sendpost.png)](./packet_sendpost.png)

## Initialize the Blockchain

Scaffold a new blockchain named `planet`

```go
starport app github.com/tuto/planet
cd planet
```

A new directory named planet is created. This directory contains a working blockchain app.

Scaffold a module inside your blockchain named `blog` with IBC capabilities.
The blog module contains the logic for creating blog posts and routing them through IBC to the second blockchain.

```go
starport module create blog --ibc
```

A new directory with the code for an IBC module is created in `planet/x/blog`. 
The `--ibc` flag includes all the logic for the scaffolded IBC module.

1. Create the transction types for the module. 
Use the `starport type` command to scaffold a transaction message with Starport.
The module has the logic for:

- Creating Blog posts
- Processing acknowledgments for sent posts
- Managing post time outs 

```go
starport type post title content --module blog
starport type sentPost postID title chain --module blog
starport type timedoutPost title chain --module blog
```

These three `starport type` commands create the foundation of the transaction handlers.

To manage multiple modules within your Starport app, use the `--module` flag to define which module the new transaction type is added to.

Scaffold a sendable and interpretable IBC packet that contains the title and the content of the blog post. 

The title and content will be stored on the target chain, while the `postID` will be acknowledged on the sending chain.

While the `starport type` command creates a new transaction type, the `starport packet` command creates the logic for an IBC packet that can be sent to another blockchain. 
A _packet_ is similar to a transaction but is meant to be stored on another blockchain. _Messages_ are generated when data gets stored on the blockchain that creates the transaction. _Packets_ are used when a transaction interacts using IBC.
{synopsis}

```go
starport packet ibcPost title content --ack postID --module blog
```

You see that the `ibcPost` in the packet looks the same as the `post` transaction.
- The `--ack` tag defines which identifier is returned to the sending blockchain.
- The `--module blog` tag specifies to return the identifier to be part of the blog module, just like the `post` transaction.

The `starport packet` command scaffolds a transaction message packet for IBC with the following parameters: 

```go
send-ibcPost <portID> <channelD> <title> <content>
```

## Modify the Source Code

After creating the types and transactions, you must manually insert the logic to manage updates in the data tables.
Modify the source code to save the data as specified earlier in this tutorial.

### Add Creator to the Blog Post Packet

Start with the proto file that defines the structure of the IBC packet.
To identify the creator of the post in the receiving blockchain, add the creator field inside the packet. 
We did not specify this field directly in the command because it would automatically become a parameter in `SendIbcPost` CLI command. 

```go
// planet/proto/blog/packet.proto
// this line is used by starport scaffolding # ibc/packet/proto/message
// IbcPostPacketData defines a struct for the packet payload
message IbcPostPacketData {
	string title = 1;
    string content = 2;
    string creator = 3; // < ---
}
```

To make sure the receiving chain has content on the creator of a blog post, add this value to the IBC `packet`.
The content of the `sender` of the message is automatically included in `SendIbcPost` message. The sender is verified as the signer of the message, so you can add the `msg.Sender` as the creator to the new packet before it is sent over IBC.

```go
// planet/x/blog/keeper/msg_server_ibcPost.go
// Construct the packet
	var packet types.IbcPostPacketData

	packet.Title = msg.Title
	packet.Content = msg.Content
	packet.Creator = msg.Sender // < ---
	
	// Transmit the packet
	err := k.TransmitIbcPostPacket(
		ctx,
		packet,
		msg.Port,
		msg.ChannelID,
		clienttypes.ZeroHeight(),
		msg.TimeoutTimestamp,
	)
```

## Receive the Post

The methods for primary transaction logic are in the `planet/x/blog/keeper/ibcPost.go` file. Use these methods to manage IBC packets:

- `TransmitIbcPostPacket` is called manually to send the packet over IBC. This method also defines the logic before the packet is sent over IBC to another blockchain app.
- `OnRecvIbcPostPacket` hook is automatically called when a packet is received on the chain. This method defines the packet reception logic.
- `OnAcknowledgementIbcPostPacket` hook is called when a sent packet is acknowledged on the source chain. This method defines the logic when the packet has been received.
- `OnTimeoutIbcPostPacket` hook is called when a sent packet times out. This method defines the logic when the packet is not received on the target chain

You must modify the source code to add the logic inside those functions so that the data tables are modified accordingly.

On reception of the message, we create a new post with the title and the content on the receiving chain.

To identify the blockchain app that a message is originating from and who created the message, use an identifier in the following format:

`<portID>-<channelID>-<creatorAddress>`

You must add these parameters when creating the IBC packet.
Finally, the AppendPost function that is generated by Starport returns the ID of the new appended post. You can return this value to the source chain through acknowledgment.

Append the type instance as `PostID` on receiving the packet:

- the context `ctx` is an [immutable data structure](https://docs.cosmos.network/master/core/context.html#go-context-package) that has header data from the transaction. [See how the context is initiated](https://github.com/cosmos/cosmos-sdk/blob/master/types/context.go#L71)
- the identifier format that you defined earlier
- the `title` is the Title of the blog post
- the `content` is the Content of the blog post

```go
// planet/x/blog/keeper/ibcPost.go
// OnRecvIbcPostPacket processes packet reception
func (k Keeper) OnRecvIbcPostPacket(ctx sdk.Context, packet channeltypes.Packet, data types.IbcPostPacketData) (packetAck types.IbcPostPacketAck, err error) {
	// validate packet data upon receiving
	if err := data.ValidateBasic(); err != nil {
		return packetAck, err
	}

	packetAck.PostID = k.AppendPost(
		ctx,
		packet.SourcePort+"-"+packet.SourceChannel+"-"+data.Creator,
		data.Title,
		data.Content,
	)

	return packetAck, nil
}
```

### Receive the Post Acknowledgement

On the sending blockchain, store a `sentPost` so you know that the post has been received on the target chain.

Store the title and the target to identify the post.

When a packet is scaffolded, the default type for the received acknowledgment data is a type that identifies if the packet treatment has failed. The `Acknowledgement_Error` type is set if `OnRecvIbcPostPacket` returns an error from the packet.

```go
// OnAcknowledgementIbcPostPacket responds to the the success or failure of a packet
// acknowledgement written on the receiving chain.
func (k Keeper) OnAcknowledgementIbcPostPacket(ctx sdk.Context, packet channeltypes.Packet, data types.IbcPostPacketData, ack channeltypes.Acknowledgement) error {
	switch dispatchedAck := ack.Response.(type) {
	case *channeltypes.Acknowledgement_Error:
		// We will not treat acknowledgment error in this tutorial
		return nil
	case *channeltypes.Acknowledgement_Result:
		// Decode the packet acknowledgment
		var packetAck types.IbcPostPacketAck
		err := packetAck.Unmarshal(dispatchedAck.Result)
		if err != nil {
			// The counter-party module doesn't implement the correct acknowledgment format
			return errors.New("cannot unmarshal acknowledgment")
		}

		k.AppendSentPost(
			ctx,
			data.Creator,
			packetAck.PostID,
			data.Title,
			packet.DestinationPort+"-"+packet.DestinationChannel,
		)

		return nil
	default:
		// The counter-party module doesn't implement the correct acknowledgment format
		return errors.New("invalid acknowledgment format")
	}
}
```

### Store Information about the Timed-out Packet

Store posts that have not been received by target chains in `timedoutPost` posts. This logic follows the same format as `sentPost`.

```go
// OnTimeoutIbcPostPacket responds to the case where a packet has not been transmitted because of a timeout
func (k Keeper) OnTimeoutIbcPostPacket(ctx sdk.Context, packet channeltypes.Packet, data types.IbcPostPacketData) error {

	k.AppendTimedoutPost(
		ctx,
		data.Creator,
		data.Title,
		packet.DestinationPort+"-"+packet.DestinationChannel,
	)

	return nil
}
```

This is the basic `blog` module setup.
The blockchain is now ready!

Spin up the blockchain and send a blog post from one blockchain app to the other.

Various terminal windows are required to complete these next steps.

## Test the IBC modules

To test the IBC module, start two blockchain networks on the same machine. Both blockchains use the same source code. Each blockchain has a unique chain ID.

One blockchain is named `earth` and the other blockchain is named `mars`.

The following files are required in the project directory:

`planet/earth.yml`

```yaml
accounts:
  - name: alice
    coins: ["1000token", "100000000stake"]
  - name: bob
    coins: ["500token"]
validator:
  name: alice
  staked: "100000000stake"
faucet:
  name: bob
  coins: ["5token"]
genesis:
  chain_id: "earth"
init:
  home: "$HOME/.earth"
```

`planet/mars.yml`

```yaml
accounts:
  - name: alice
    coins: ["1000token", "1000000000stake"]
  - name: bob
    coins: ["500token"]
validator:
  name: alice
  staked: "100000000stake"
faucet:
  host: "0.0.0.0:4501"
  name: bob
  coins:
    - "5token"
host:
  rpc: "0.0.0.0:26659"
  p2p: "0.0.0.0:26658"
  prof: "0.0.0.0:6061"
  grpc: "0.0.0.0:9091"
  api: "0.0.0.0:1318"
  frontend: "0.0.0.0:8081"
  dev-ui: "0.0.0.0:12346"
genesis:
  chain_id: "mars"
init:
  home: "$HOME/.mars"
```

Use a  different terminal window for each blockchain. Run the following commands for each blockchain:

```
starport serve -c earth.yml
starport serve -c mars.yml
```

### Start the Relayer

First, configure the relayer. Use the Starport `configure` command with the `--advanced` option:

```
starport relayer configure -a --source-rpc "http://0.0.0.0:26657" --source-faucet "http://0.0.0.0:4500" --source-port "blog" --source-version "blog-1" --target-rpc "http://0.0.0.0:26659" --target-faucet "http://0.0.0.0:4501" --target-port "blog" --target-version "blog-1"
```

The output looks like:

```
---------------------------------------------
Setting up chains
---------------------------------------------

🔐  Account on "source" is "cosmos1xcxgzq75yrxzd0tu2kwmwajv7j550dkj7m00za"

 |· received coins from a faucet
 |· (balance: 5token)

🔐  Account on "target" is "cosmos1nxg8e4mfp5v7sea6ez23a65rvy0j59kayqr8cx"

 |· received coins from a faucet
 |· (balance: 5token)

⛓  Configured chains: earth-mars
```

Then, start the relayer process in a separate terminal window:

```
starport relayer connect
```

Results:

```
🔌  Linked chains with 1 paths.

---------------------------------------------
Chains by paths
---------------------------------------------

earth-mars:
    earth > (port: blog) (channel: channel-0)
    mars  > (port: blog) (channel: channel-0)

---------------------------------------------
Listening and relaying packets between chains...
---------------------------------------------
```

### Send packets

You can now send packets and verify the received posts:

```
planetd tx blog send-ibcPost blog channel-0 "Hello" "Hello Mars, I'm Alice from Earth" --from alice --chain-id earth --home ~/.earth
```

To verify that the post has been received on Mars:

```
planetd q blog list-post --node tcp://localhost:26659
```

The packet has been received:

```
Post:
- content: Hello Mars, I'm Alice from Earth
  creator: blog-channel-0-cosmos1aew8dk9cs3uzzgeldatgzvm5ca2k4m98xhy20x
  id: "0"
  title: Hello
pagination:
  next_key: null
  total: "1"
```

To check if the packet has been acknowledged on Earth:

```
planetd q blog list-sentPost
```

Output:

```
SentPost:
- chain: blog-channel-0
  creator: cosmos1aew8dk9cs3uzzgeldatgzvm5ca2k4m98xhy20x
  id: "0"
  postID: "0"
  title: Hello
pagination:
  next_key: null
  total: "1"
```

To test timeout, set the timeout time of a packet to 1 nanosecond, verify that the packet is timed out, and check the timed-out posts:

```
planetd tx blog send-ibcPost blog channel-0 "Sorry" "Sorry Mars, you will never see this post" --from alice --chain-id earth --home ~/.earth --packet-timeout-timestamp 1
```

Check the timed-out posts:

```
planetd q blog list-timedoutPost
```

Results:

```
TimedoutPost:
- chain: blog-channel-0
  creator: cosmos1fhpcsxn0g8uask73xpcgwxlfxtuunn3ey5ptjv
  id: "0"
  title: Sorry
pagination:
  next_key: null
  total: "2"
```

You can also send a post from Mars:

```
planetd tx blog send-ibcPost blog channel-0 "Hello" "Hello Earth, I'm Alice from Mars" --from alice --chain-id mars --home ~/.mars --node tcp://localhost:26659
```

List post on Earth:

```
planetd q blog list-post
```

Results:

```
Post:
- content: Hello Earth, I'm Alice from Mars
  creator: blog-channel-0-cosmos1xtpx43l826348s59au24p22pxg6q248638q2tf
  id: "0"
  title: Hello
pagination:
  next_key: null
  total: "1"
```

🎉 **Congratulations.**  🎉 

By completing this tutorial, you’ve learned to build an IBC module for the Cosmos SDK, build your own blockchain app, and use the Interblockchain Communication Protocol (IBC).
Here’s what you accomplished in this tutorial:
- Built a Hello World blockchain app as an IBC module
- Used the relayer to connect two blockchains with each other
- Transferred IBC packets from one blockchain to another 

