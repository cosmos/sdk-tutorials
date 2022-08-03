---
parent:
title: Good to Know Dev Terms
order: 0
description: Review some technical terms helpful when developing in Cosmos
---

# Good to Know Dev Terms

You can find an overview of several technical terms in this section, including an explanation of each and links to further resources - all of which are essential when developing with the Cosmos SDK.

<HighlightBox type="learning">

In this section, you will take a look at the following terms:

* RPC
* gRPC, gRPC-web, and gRPC-Gateway
* LCD
* Amino
* Protocol Buffers

All terms relate to how node interaction is conducted in Cosmos SDK blockchains.

</HighlightBox>

Let's dive right into it.

## Light client daemon (LCD)

A **light client**, compared to a full node, tracks only pieces of certain information on a blockchain. Light clients do not track the entire state of a blockchain and also do not contain every transaction/block of a chain.

In the Tendermint consensus, the light client protocol allows clients to benefit from the same degree of security as full nodes do, while bandwidth requirements are minimized. A client can receive cryptographic proofs for blockchain states and transactions without having to sync all blocks or even their headers.

<HighlightBox type="tip">

Take a look at [Light Clients in Tendermint Consensus](https://blog.cosmos.network/light-clients-in-tendermint-consensus-1237cfbda104) by Ethan Frey to discover more about how light clients are used in the Tendermint consensus.

</HighlightBox>

Therefore, light clients are also vital for the Inter-Blockchain Communication (IBC) Protocol to track information such as timestamps, root hash, and the next validator set hash. This saves space and increases efficiency for state update processing.

The **light client daemon (LCD)** is also an HTTP1.1 server exposed by the Cosmos SDK. Its default port is `1317`. It exposes a REST API for the chain - a _representational state transfer application programming interface_, in short, REST API, is an application programming interface that allows for the interaction with a RESTful web service. Traditionally, every query was re-implemented for LCD and behind the scene routed to RPC.

<ExpansionPanel title="Why is it called light client daemon?">

It is called a light client daemon (LCD) because pre-SDK v0.40, you had to run another service using for example, `gaiacli rest-server --laddr 0.0.0.0:1317 --node localhost:26657`, to get a REST API. In Cosmos SDK v0.40, REST was moved inside the node service. The name stuck.

</ExpansionPanel>

## Remote procedure call (RPC)

A **remote procedure call (RPC)** is _a software communication protocol_. The term is often found in distributed computing because RPC is a technic to realize inter-process communication (IPC) by allowing a program to cause a procedure, subroutine, that is executed in a different address space (machine).

RPC can be understood as a client-server interaction, in which the "caller" is the client, more specifically the requesting program, and the "executor" is the server, more specifically the service-providing program. The interaction is implemented through a request-response message-passing system. In short, RPC is a request-response protocol, initiated by a client sending a request to a remote server to execute the subroutine.

For example, it allows calling functions in different address spaces. Usually, the called functions are run on a different computer than the one calling them.

With RPC, the developer codes as if the subroutine would be local; the developer does not have to code in the details for the remote interaction. Thus, with RPCs it is implied that calling procedures are basically the same, independent of it being a local or remote call.

<HighlightBox type="note">

As RPCs implement remote request-response protocols, it is important to note that remote procedure calls can fail in case of network problems.

</HighlightBox>

### How does an RPC request work?

In general: when a remote procedure call is invoked, the procedure parameters are transferred across the network to the execution environment. The procedure is executed in the environment. Once finished, the results of the procedure call invoked are transferred to the call environment. The execution then resumes in the call environment, like it would in a regular local procedure call.

A step-by-step RPC request could look like the following:

1. A client calls a client stub - a piece of code converting parameters that are passed between client and servers during an RPC. The call is a local procedure call.

<HighlightBox type="info">

A stub is a small program routine substituting a longer program.

In RPCS, the client's stub substitutes for the program providing a request procedure. The stub accepts and forwards the request to the remote procedure. Once the remote procedure completed the request, it returns the request results to the stub that passes it to the request procedure.

The server also has a stub to interface with the remote procedure.

</HighlightBox>

2. The client stub packs the procedure parameters into a message.

<HighlightBox type="info">

**Packing procedure parameters is called marshaling.**

**Marshaling** is _the process of gathering data from one or more applications, putting data pieces into a message buffer, and organizing the data into a prescribed data format_.

Marshaling is vital to pass output parameters of a program written in one language as inputs to programs in a different language.

</HighlightBox>

3. The client stub then makes a system call to send the message.
4. The client's local operating system (OS) sends the message from the client (machine) to the server (machine) through the corresponding transport layers.
5. Then the server OS passes the incoming packets to the server stub.
5. The server stub unpacks the message and with it the included procedure parameters - this is called unmarshaling.
6. The server stub calls a server procedure and the procedure is executed.
7. Once the procedure is finalized, the output is returned to the server stub.
8. The server stub packs the return values into a message.
9. The message is sent to the transport layer, which sends the message to the client's transport layer.
10. The client stub unmarshals the return parameters.

<HighlightBox type="note">

In an Open Systems Interconnection (OSI) model, RPC touches the transport and application layer.

The transport layer is tasked with the reliable sending and receiving of messages across a network. It requires error-checking mechanisms, data flow controls, data integrity assurance, congestion avoidance, multiplexing, and same order delivery.

The application layer is tasked with ensuring effective communication between applications on different computer systems and networks. It is a component of an application controlling methods to communicate with other devices.

</HighlightBox>

### RPC and Cosmos

In Cosmos, RPCs are used by the command-line interface (CLI) among others to access chains. A node exposes several endpoints - gRPC, REST, and Tendermint endpoint.

The Tendermint RPC endpoint is an HTTP1.1 server exposed by Tendermint. The default port is `26657`. The gRPC server default port is `9090`, and the REST server default port is `1317`.

The Tendermint RPC is independent of the Cosmos SDK and can be configured. It uses HTTP `POST` and JSON-RPC 2.0 for data encoding.

<HighlightBox type="tip">

For more information on the Tendermint RPC, gRPC, and REST server, a closer look at the [Cosmos SDK documentation](https://docs.cosmos.network/master/core/grpc_rest.html).

</HighlightBox>

Cosmos exposes both the Tendermint RPC and the Cosmos LCD. Now, dive into LCD and specifically the Cosmos LCD.

<HighlightBox type="info">

For example, [CosmJS] uses RPC to implement a JSON-RPC API.

</HighlightBox>

## gRPC

**gRPC** is _an open-source, high-performance remote procedure call (RPC) framework_. It was developed by Google to handle RPCs and released in 2016. gRPC can run in any environment and supports a variety of programming languages.

<HighlightBox type="tip">

For more on gRPC and very helpful information on getting started, take a look at the [gRPC documentation](https://grpc.io/).

</HighlightBox>

gRPC uses HTTP2 for transport and Protocol Buffers (Protobuf) to encode data. gRPCs have a single specification, which makes all gRPC implementations consistent.

### gRPC and Cosmos

In Cosmos, gRPCs are transmission control protocol (TCP) servers with Protobuf used for data encoding. Its default port is `9090`.

<HighlightBox type="info">

Transmission control protocol (TCP) is one of the main internet protocols that allows establishing a connection between a client and server to send data. TCP makes communication between application programs and the internet protocol possible.

</HighlightBox>

In the Cosmos SDK, Protobuf is the main encoding library.

<ExpansionPanel title="Encoding in the Cosmos SDK">

A **wire encoding protocol** is _a protocol defining how data is transported from one point to another_. Wire protocols describe ways in which information is exchanged at the application level. Thus, it is a communication protocol of the application layer protocol and not a transport protocol. To define the data exchange, the wire protocol requires specific attributes regarding:

* Data types - units of data, message formats, etc.
* Communication endpoints
* Capabilities - delivery guarantees, direction of communication, etc.

Wire protocols can be text-based or binary protocols.

In the Cosmos SDK, there are **two categories of binary wire encoding types**: client encoding and store encoding. Whereas client encoding deals with transaction processing and signing transactions, and store encoding tackles state-machine transactions and with it what is stored in the Merkle tree.

The Cosmos SDK uses two binary wire encoding protocols:

* **Amino:** an object encoding specification. Every Cosmos SDK module uses an Amino codec to serialize types and interfaces.
* **[Protocol Buffers (Protobuf)](../academy/2-main-concepts/protobuf.md):** a data serialization method, which developers use to describe message formats.

Due to several reasons, such as performance drawbacks and missing cross-language/client support, Protocol Buffers are used more and more over Amino.

For more information on encoding in the Cosmos SDK, see the [Cosmos SDK documentation](https://docs.cosmos.network/master/core/encoding.html).

</ExpansionPanel>

### gRPC-web

gRPC is supported across different software and hardware platforms. **gRPC-web** is _a JavaScript implementation of gRPC for browser clients_. gRPC-web clients connect to gRPC services via a special proxy.

<HighlightBox type="tip">

For more on gRPC-web, a closer look at the [gRPC repository](https://github.com/grpc/grpc-web) is recommended.

To dive into developing with gRPC-web, the [documentation's quick start](https://grpc.io/docs/platforms/web/quickstart/) and [basics tutorials](https://grpc.io/docs/platforms/web/basics/) are very valuable sources.

</HighlightBox>

As with gRPC in general, gRPC-web uses HTTP2 with Protobuf for data encoding. The default port is `9091`.

<HighlightBox type="info">

Secret.js is a JavaScript SDK to write applications interacting with the [Secret Network](https://scrt.network/). It uses gRPC-web.

</HighlightBox>

### gRPC-gateway 

**gRPC-gateway** is a tool to expose gRPC endpoints as REST endpoints. gRPC-gateway helps provide APIs in gRPC and RESTful style; it reads gRPC service definitions and generates reverse-proxy servers that can translate a RESTful JSON API into gRPC. For each gRPC endpoint defined in a Protobuf `Query` service, the Cosmos SDK offers a corresponding REST endpoint.

gRPC-Gateway's aim is ["to provide that HTTP+JSON interface to your gRPC service"](https://grpc-ecosystem.github.io/grpc-gateway/docs/overview/background/). With it, developers can benefit from all the advantages of gRPC and at the same time, still provide a RESTful API - a very helpful tool, when, for example, you want to develop a web application but have browsers that do not support HTTP2. This can help ensure backwards compatibility, multi-language, and multi-client support.

<HighlightBox type="tip">

If you want to explore gRPC-Gateway, a closer look at the [gRPC-Gateway documentation](https://grpc-ecosystem.github.io/grpc-gateway/) is recommended.

</HighlightBox>

In the Cosmos SDK, gRPC-Gateway provides an HTTP1.1 server with REST API and a base64-encoded Protobuf for data encoding; it exposes gRPC endpoints as REST endpoints. It routes on the server to gRPC and piggybacks off of LCD. Thus, it is also on port `1317`.

For example, if you cannot use gRPC for your application because a browser does not support HTTP2, you can still use the Cosmos SDK. The SDK provides REST routes via gRPC-Gateway.

<HighlightBox type="info">

[Terra.js](https://terra-money.github.io/terra.js/), a JavaScript SDK for applications interacting with the Terra blockchain, uses gRPC-gateway.

</HighlightBox>

## Amino

Amino is an object encoding specification. In the Cosmos SDK, every module uses an **Amino codec** that _helps serialize types and interfaces_. Amino handles interfaces by prefixing bytes before concrete types.

Usually, the Amino codec types and interfaces are registered in the module's domain.

<HighlightBox type="info">

A concrete type is a non-interface type which implements a registered interface. Types need to be registered when stored in interface type fiels, or a list with interface elements.

As a best practice, upon initialization, make sure to:

* Register the interfaces.
* Implement concrete types.
* Check for issues, like conflicting prefix bytes.

</HighlightBox>

Every module exposes a function, `RegisterLegacyAminoCodec`. With it, users can provide a codec and register all types. Applications call this method for necessary modules.

With Amino, raw wire bytes are encoded and decoded to concrete types or interfaces when there is no Protobuf-based type definition for a module.

<HighlightBox type="tip">

For more on Amino specifications and implementation for Go, see the [Tendermint Go Amino documentation](https://github.com/tendermint/go-amino).

</HighlightBox>

<HighlightBox type="note">

Amino is basically JSON with some modifications.

For example, the JSON specification does not define numbers greater than 2^53, so instead strings are used in Amino when encoding a type greater than uint64/int64.

For more on the Amino types and their representation in JSON, see the [Secret.js documentation](https://github.com/scrtlabs/secret.js/blob/master/DEVELOPERS.md#amino-types-and-how-theyre-represented-in-json).

</HighlightBox>

## Protobuf

**Protocol Buffers (Protobuf)** is an open-source, cross-platform data format developed by Google. It helps serliaize structured data and assists with program communication in networks or when storing data.

<HighlightBox type="tip">

If you want to get more accustumed to Protobuf, a look at the [official documentation](https://developers.google.com/protocol-buffers) helps dive deeper, and offers guides and tutorials.

Also take a look at the [section on this platform on Protobuf](../academy/2-main-concepts/protobuf.md).

</HighlightBox>

In Cosmos, Protobuf is a data serialization method, which developers use to describe message formats. There is a lot of internal communication within a Cosmos application, and Protobuf is central to how communication is done.

With Cosmos SDK v0.40, Protobuf began replacing Amino as the data encoding format of chain states and transactions. One of the reasons was that the encoding/decoding performance is better with Protobuf than Amino. In addition, the developer tooling is also better for Protobuf. Another benefit of switching to Protobuf is that the use of gRPC is fostered - Protobuf automatically defines and generates gRPC functions. Thus, developers no longer have to implement the same query for RPC, LCD, and CLI.