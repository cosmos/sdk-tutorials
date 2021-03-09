# IBC Hello World

In this tutorial we will be looking into the Interblockchain Communication Protocol (IBC).
The IBC Protocol is an important part of the Cosmos SDK ecosystem. 
Understanding how to create and send packets across blockchain will help you navigate between blockchains with the Cosmos SDK.

You will learn how to create a basic blog post and save this post on another blockchain.
Both blockchain apps have has the according `blog` module installed that we create in this tutorial.

## Requirements 

For this tutorial we will be using [Starport](https://github.com/tendermint/starport) v0.15.0, an easy to use tool for building blockchains. To install `starport` into `/usr/local/bin`, run the following command:

```
curl https://get.starport.network/starport@v0.15.0! | bash
```

You can also use Starport v0.15.0 on the web in a [browser-based IDE](http://gitpod.io/#https://github.com/tendermint/starport/tree/v0.15.0). Learn more about other ways to [install Starport](https://github.com/tendermint/starport/blob/develop/docs/1%20Introduction/2%20Install.md).

## Overview

We will create a blog module to write posts on other blockchains that contain our Hello World message (or rather Hello Mars and Hello Earth) for an IBC module.

Making our module example simple, we create an app that contains a blog module which has a post transaction (title and text). 

After defining our logic, we will run two blockchains that have this module installed.
The chains can send posts between each other through IBC. 
On the sending chain, we save both: `acknowledged` and `timed out` posts.

Once the receiving chain `acknowledges` the transaction, we can be sure that the post is saved on both blockchains.
The sending chain will have the additional data `postID`. Acknowledged and timed out sent posts contain the title and the target chain of the post to identify it, this will be visible on the parameter `chain`. The following chart can help you making sense of the lifecycle of a packet that travels through IBC. 

[https://whimsical.com/ibc-hello-world-Mtnd3ERtqeLZDXapDLGR8P](https://whimsical.com/ibc-hello-world-Mtnd3ERtqeLZDXapDLGR8P)

## Initialize the blockchain

Let's scaffold a new blockchain named `planet`

```go
starport app github.com/tuto/planet
cd planet
```

This creates a new directory `planet` with a working blockchain app.

Let's scaffold a module inside our blockchain named `blog` with IBC capabilities.
We want the blog module to contain our logic for creating blog posts and routing them through IBC to another blockchain.

```go
starport module create blog --ibc
```

This will create a new directory with the code for an IBC module into `planet/x/blog`. 
The `--ibc` flag makes sure that we have all the logic for an IBC module scaffolded for us.

First let's create our transction types for the module. 
With using the `starport type` command you can scaffold a transaction message logic with starport.
The module will have the logic for:

- Creating Blog posts
- What happens with acknowledged sent posts
- What happens when a sent post timed out

```go
starport type post title content --module blog
starport type sentPost postID title chain --module blog
starport type timedoutPost title chain --module blog
```

Using it three times as defined above will create the foundation of our transaction handlers.

When handling multiple modules within your Starport app, the `--module` flag defines in which module the new transaction type will be added to.

We want to be able to send the blog posts over IBC. 
Let's scaffold a sendable and interpretable IBC packet that contains the title and the content of the blog post. 

The title and content will be stored on the target chain, while the `postID` will be acknowledged on the sending chain.

While `starport type` creates a new transaction type for us, the `starport packet` command creates the logic for an IBC packet that can be send to another blockchain. A packet is similar to a transaction but is meant to be stored on another blockchain. We will speak about "messages" when data gets stored on the blockchain that also creates the transaction. We will use "packets" when a transaction interacts via IBC.
{synopsis}

```go
starport packet ibcPost title content --ack postID --module blog
```

Please note, the `ibcPost` in our packet looks the same like the `post` transaction.
With the `--ack` tag we define which identifier will be returned to the sending blockchain.
We define it again to be part of our blog module with the tag `--module blog`, just like the `post` transaction.


The `starport packet` command scaffolds a transaction message packet for IBC, which will have the following parameters when executed. We will be using this command later in this tutorial.

```go
send-ibcPost <portID> <channelD> <title> <content>
```

## Source code modification

After creating our types and transactions, we have to manually insert the logic accordingly to what happens in our datatables.
Let's get into the code and make the modifications to save the data according to what we have defined above.

### Adding post creator to the packet

Let's start with the proto file, which defines the structure of our IBC packet.
We want the receiving blockchain to identify the creator of the post. We add the creator field inside the packet (we didn't specify this field directly in the command because it would automatically become a parameter in `SendIbcPost` CLI command)

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

We want to make sure the receiving chain has content on the creator of a blog post. We add this value to our IBC `packet`.
`SendIbcPost` message automatically has the content of the `sender` of the message, this value is already used and verified as the signer of the message. We can therefore add the `msg.Sender` as creator to the new packet before sending it over IBC

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

## Receiving the post

We are at the heart of our transaction logic, located inside `planet/x/blog/keeper/ibcPost.go`

This file contain three methods that will help us learn the core methods about IBC packets.

- `TransmitIbcPostPacket` called manually to send the packet over IBC, it can also define the logic before the packet is sent over IBC to another blockchain app
- `OnRecvIbcPostPacket` hook (automatically called) when a packet is received on the chain, we define here the logic of packet reception
- `OnAcknowledgementIbcPostPacket` hook when a sent packet is acknowledged on the source chain, we define here logics when we know the packet has been received
- `OnTimeoutIbcPostPacket` hook when a sent packet is timed out, we define here logics when we know the packet will never be received on the target chain

What we need to add into the source code is the logic inside those functions to add to the datatables accordingly.

On reception of the message, we create a new post with the title and the content on the receiving chain.

<!-- Though we didn't specify it in the command, the post type automatically contains a creator field. This field is filled when the type instance is created through a message. -->
<!-- We can reuse this field.  -->

In order to identify which blockchain app a message is coming from, but also who created the message, we will use an identifier in the following format:

`<portID>-<channelID>-<creatorAddress>`

These parameters need to be added when creating the IBC packet.

Finally, the AppendPost function generated by starport returns the ID of the new appended post. We can return this value to the source chain through acknowledgment.

Append the type instance on receiving the packet: the `ctx`, our above defined identifier format, the `title` and the `content` as `PostID`

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

### Receiving the post acknowledgement

On the sending blockchain, we store a `sentPost` when we know the post has been received on the target chain.

We store the title and the target to identify the post.

By default, when scaffolding a packet, the received acknowledgment data is a type that allows us to identify if the packet treatment has failed, we get `Acknowledgement_Error` if `OnRecvIbcPostPacket` returns an error from the packet.

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

### Storing information about timed out packet

In `timedoutPost` posts we store posts that have not been received by target chains. It follows the same format as `sentPost` 

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

That is our basic `blog` module setup.
The blockchain is now ready!

Let's spin it up and send a blog post from one blockchain app to the other.
We will need various terminal windows for this.

## IBC module tests

### Starting the chains

To test the IBC module, we will serve with starport two blockchain networks on the same machine. Both blockchains uses the same source code but with a different chain ID

We will have a blockchain network named `earth` and the other name `mars`

We need the two following files in the project directory:

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
  port: 4501
  name: bob
  coins:
    - "5token"
servers:
  rpc-address: "0.0.0.0:26659"
  p2p-address: "0.0.0.0:26658"
  prof-address: "0.0.0.0:6061"
  grpc-address: "0.0.0.0:9091"
  api-address: "0.0.0.0:1318"
  frontend-address: "0.0.0.0:8081"
  dev-ui-address: "0.0.0.0:12346"
genesis:
  chain_id: "mars"
init:
  home: "$HOME/.mars"
```

We can then run the two blockchain networks with the following commands on two separate terminals:

```
starport serve -c earth.yml
starport serve -c mars.yml
```

### Starting the relayer

First we need to configure the relayer, we use the configure command of starport with the `--advanced` option:

```
starport relayer configure -a --source-rpc "http://0.0.0.0:26657" --source-faucet "http://0.0.0.0:4500" --source-port "blog" --source-version "blog-1" --target-rpc "http://0.0.0.0:26659" --target-faucet "http://0.0.0.0:4501" --target-port "blog" --target-version "blog-1"
```

The output will be like:

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

Then we can start the relayer process in a separate terminal:

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

### Sending packets

We can now send packets and checks the received posts:

```
planetd tx blog send-ibcPost blog channel-0 "Hello" "Hello Mars, I'm Alice from Earth" --from alice --chain-id earth --home ~/.earth
```

We check if the post has been received on Mars:

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

Let's check if it has been acknowledge on Earth:

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

To test timeout, we can set the timeout time of a packet to 1 nanosecond, to be sure the packet will be timed out and to check the timed out posts:

```
planetd tx blog send-ibcPost blog channel-0 "Sorry" "Sorry Mars, you will never see this post" --from alice --chain-id earth --home ~/.earth --packet-timeout-timestamp 1
```

Let's check timed out posts:

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

We can send a post from Mars as well:

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

🎉 **Congratulation, you have created your first IBC module!** 🎉 