---
parent:
title: Good-To-Know Dev Terms
order: 0
description: Review some technical terms essential when developing in Cosmos
tags:
  - tutorial
---

# Good-To-Know Dev Terms

You can find an overview of several technical terms in this section, including an explanation of each term and links to further resources - all of which are essential when developing with the Cosmos SDK.

<HighlightBox type="learning">

In this section, you will take a look at the following terms:

* Cosmos and Interchain
* LCD
* RPC
* Protobuf - Protocol Buffers
* gRPC, gRPC-web, and gRPC-Gateway
* Amino

All these terms relate to how node interaction is conducted in Cosmos SDK blockchains.

</HighlightBox>

Let's dive right into it.

## Cosmos and Interchain

**Cosmos** refers to _the network of application-specific blockchains_, built with the Interchain Stack and inter-connected through the Inter-Blockchain Communication Protocol (IBC). However, Cosmos will soon become known as **the Interchain**. The terms "Cosmos", "Cosmos Ecosystem", and "Interchain" can be understood as synonyms.

### The Interchain Stack

The various tools available to Interchain developers can be referred to collectively as the **Interchain Stack**.

<HighlightBox type="info">

Tools within the Interchain Stack, which contain "Cosmos" in their name will remain unchanged by current terminology changes, such as the **Cosmos SDK** and **CosmWasm**. Any chain built with the Cosmos SDK can typically be referred to as "a Cosmos chain" or "appchain".

</HighlightBox>

### Cosmos Hub

The Cosmos Hub is a chain that serves as an economic hub of the Interchain and service provider to other Cosmos chains. Built with the Interchain Stack, the Hub is home to the ATOM token, Interchain Security, and builders of the Cosmos SDK, Tendermint, and IBC.

## Light client daemon (LCD)

A **light client**, compared to a full node, tracks only pieces of certain information on a blockchain. Light clients do not track the entire state of a blockchain and also do not contain every transaction/block of a chain.

In the Tendermint consensus, the light client protocol allows clients to benefit from the same degree of security that full nodes benefit from, while bandwidth requirements are minimized. A client can receive cryptographic proofs for blockchain states and transactions without having to sync all blocks or even their headers.

<HighlightBox type="tip">

Take a look at [Light Clients in Tendermint Consensus](https://blog.cosmos.network/light-clients-in-tendermint-consensus-1237cfbda104) by Ethan Frey to discover more about how light clients are used in the Tendermint consensus.

</HighlightBox>

Therefore, light clients are also vital to how the Inter-Blockchain Communication Protocol (IBC) can track information such as timestamps, root hashes, and the next validator set hash. This saves space and increases efficiency for state update processing.

The **light client daemon (LCD)** is an HTTP1.1 server exposed by the Cosmos SDK, and its default port is `1317`. It exposes a REST API for the chain, meaning a _representational state transfer application programming interface_ - this API allows for interaction with a RESTful web service. Traditionally, every query was re-implemented for LCD and routed to RPC behind the scenes.

<ExpansionPanel title="Why is it called light client daemon?">

Before SDK v0.40, to get a REST API it was necessary to run another backend service (or _[daemon](https://en.wikipedia.org/wiki/Daemon_(computing))_, a term inherited from Unix), for example using `gaiacli rest-server --laddr 0.0.0.0:1317 --node localhost:26657`. In Cosmos SDK v0.40, REST was moved inside the node service making it part of the Cosmos SDK, but the term "daemon" stuck, leading to the name _light client daemon_ (LDC).

</ExpansionPanel>

## Remote procedure call (RPC)

A **remote procedure call (RPC)** is _a software communication protocol_. The term is often found in distributed computing because RPC is a technique to realize inter-process communication (IPC) by allowing a program to cause a subroutine procedure that is executed in a different address space (a different machine).

RPC can be understood as a client-server interaction in which the "caller" is the client, more specifically the requesting program, and the "executor" is the server, more specifically the service-providing program. The interaction is implemented through a request-response message-passing system.

In short, RPC is a request-response protocol, initiated by a client sending a request to a remote server to execute the subroutine. 

RPC allows calling functions in different address spaces. Usually, the called functions are run on a different computer than the one calling them. However, with RPC, the developer codes as if the subroutine would be local; the developer does not have to code in details for remote interaction. Thus, with RPCs it is implied that all calling procedures are basically the same, independent of them being local or remote calls.

<HighlightBox type="note">

As RPCs implement remote request-response protocols, it is important to note that remote procedure calls can fail in case of network problems.

</HighlightBox>

### How does an RPC request work?

In general, when a remote procedure call is invoked the procedure parameters are transferred across the network to the execution environment where the procedure is executed. Once finished, the results of the procedure call invoked are transferred to the call environment. The execution then resumes in the call environment, just as it would in a regular local procedure call.

A step-by-step RPC request could look like the following:

1. A client calls a client stub - a piece of code converting parameters that are passed between client and servers during an RPC. The call is a local procedure call.

<HighlightBox type="info">

A stub is a small program routine substituting a longer program. This allows machines to behave as if a program on a remote machine was operating locally. The client has a stub which interfaces with the remote procedure, while the server has a stub to interface with the original request procedure.

<br/>

In RPCs, the client's stub substitutes for the program providing a request procedure. The stub accepts and forwards the request to the remote procedure. Once the remote procedure completes the request, it returns the results to the stub which in turn passes them to the request procedure.

<br/>

The server also has a stub to interface with the remote procedure.

</HighlightBox>

2. The client stub packs the procedure parameters into a message.

<HighlightBox type="info">

Packing procedure parameters is called **marshaling**.

<br/>

Specifically, this is _the process of gathering data from one or more applications, putting data pieces into a message buffer, and organizing the data into a prescribed data format_.

<br/>

Marshaling is vital to pass output parameters of a program written in one language as inputs to programs in a different language.

</HighlightBox>

3. The client stub then makes a system call to send the message.
4. The client's local operating system (OS) sends the message from the client (machine A) to the server (machine B) through the corresponding transport layers.
5. The server OS passes the incoming packets to the server stub.
6. The server stub unpacks the message and with it the included procedure parameters - this is called **unmarshaling**.
7. The server stub calls a server procedure and the procedure is executed.
8. Once the procedure is finalized, the output is returned to the server stub.
9. The server stub packs the return values into a message.
10. The message is sent to the transport layer, which sends the message to the client's transport layer.
11. The client stub unmarshals the return parameters and returns them to the original calling client.

<HighlightBox type="note">

In an Open Systems Interconnection (OSI) model, RPC touches the transport and application layers.

<br/>

The transport layer is tasked with the reliable sending and receiving of messages across a network. It requires error-checking mechanisms, data flow controls, data integrity assurance, congestion avoidance, multiplexing, and same order delivery.

<br/>

The application layer is tasked with ensuring effective communication between applications on different computer systems and networks. It is a component of an application that controls methods of communication with other devices.

</HighlightBox>

### RPC and Cosmos

In Cosmos, RPCs are used by the command-line interface (CLI) among other things to access chains. A node exposes several endpoints - gRPC, REST, and Tendermint endpoint.

Exposed by Tendermint, the Tendermint RPC endpoint is an HTTP1.1 server. The default port is `26657`. The gRPC server default port is `9090`, and the REST server default port is `1317`. The Tendermint RPC is independent of the Cosmos SDK and can be configured. It uses HTTP `POST` and JSON-RPC 2.0 for data encoding.

<HighlightBox type="tip">

For more information on the Tendermint RPC, gRPC, and the REST server, a closer look at the [Cosmos SDK documentation](https://docs.cosmos.network/main/core/grpc_rest.html) is recommended.

</HighlightBox>

<HighlightBox type="info">

Cosmos exposes both the Tendermint RPC and the Cosmos LCD. For example, [CosmJS](/tutorials/7-cosmjs/1-cosmjs-intro.md) uses RPC to implement a JSON-RPC API.

</HighlightBox>

## Protobuf

**Protobuf** (for "Protocol Buffers") is an open-source, cross-platform data format developed by Google. It helps serialize structured data and assists with program communication in networks or when storing data.

<HighlightBox type="tip">

If you want to get more accustomed to Protobuf, a look at the [official documentation](https://developers.google.com/protocol-buffers) helps dive deeper and offers guides and tutorials.

<br/>

Also take a look at the [section on this platform on Protobuf](/academy/2-cosmos-concepts/6-protobuf.md).

</HighlightBox>

In Cosmos, Protobuf is a data serialization method that developers use to describe message formats. There is a lot of internal communication within a Cosmos application, and Protobuf is central to how communication is done.

With Cosmos SDK v0.40, Protobuf began replacing Amino as the data encoding format of chain states and transactions, in part because encoding/decoding performance is better with Protobuf than Amino. In addition, the developer tooling is also better for Protobuf. Another benefit of switching is that the use of gRPC is fostered, as Protobuf automatically defines and generates gRPC functions. Thus developers no longer have to implement the same query for RPC, LCD, and CLI.

## gRPC

**gRPC** is _an open-source, high-performance remote procedure call (RPC) framework_. It was developed by Google to handle RPCs and released in 2016. gRPC can run in any environment and supports a variety of programming languages.

<HighlightBox type="tip">

For more on gRPC and very helpful information on getting started, take a look at the [gRPC documentation](https://grpc.io/).

</HighlightBox>

gRPC uses HTTP2 for transport and Protocol Buffers (Protobuf) to encode data. gRPCs have a single specification, which makes all gRPC implementations consistent.

### gRPC and Cosmos

In Cosmos, gRPCs are transmission control protocol (TCP) servers with Protobuf and are used for data encoding. The default port is `9090`.

<HighlightBox type="info">

Transmission control protocol (TCP) is one of the main internet protocols that allows establishing a connection between a client and server to send data. TCP makes communication between application programs and the internet protocol (IP) possible.

</HighlightBox>

In the Cosmos SDK, Protobuf is the main encoding library.

<ExpansionPanel title="Encoding in the Cosmos SDK">

A **wire encoding protocol** is _a protocol defining how data is transported from one point to another_. Wire protocols describe ways in which information is exchanged at the application level. Thus it is a communication protocol of the application layer protocol and not a transport protocol. To define the data exchange, the wire protocol requires specific attributes regarding:

* Data types - units of data, message formats, etc.
* Communication endpoints
* Capabilities - delivery guarantees, direction of communication, etc.

Wire protocols can be text-based or binary protocols.

In the Cosmos SDK, there are **two categories of binary wire encoding types**: client encoding, and store encoding. Whereas client encoding deals with transaction processing and signing transactions, store encoding tackles state-machine transactions and with it what is stored in the Merkle tree.

The Cosmos SDK uses two binary wire encoding protocols:

* **Amino:** an object encoding specification. Every Cosmos SDK module uses an Amino codec to serialize types and interfaces.
* **[Protocol Buffers (Protobuf)](/academy/2-cosmos-concepts/6-protobuf.md):** a data serialization method, which developers use to describe message formats.

Due to reasons such as performance drawbacks and missing cross-language/client support, Protocol Buffers are used more and more over Amino.

For more information on encoding in the Cosmos SDK, see the [Cosmos SDK documentation](https://docs.cosmos.network/main/core/encoding.html).

</ExpansionPanel>

### gRPC-web

gRPC is supported across different software and hardware platforms. **gRPC-web** is _a JavaScript implementation of gRPC for browser clients_. gRPC-web clients connect to gRPC services via a special proxy.

<HighlightBox type="tip">

For more on gRPC-web, a closer look at the [gRPC repository](https://github.com/grpc/grpc-web) is recommended.

<br/>


To dive into developing with gRPC-web, the [documentation's quick start](https://grpc.io/docs/platforms/web/quickstart/) and [basics tutorials](https://grpc.io/docs/platforms/web/basics/) are very valuable resources.

</HighlightBox>

As with gRPC in general, gRPC-web uses HTTP2 with Protobuf for data encoding. The default port is `9091`.

<HighlightBox type="info">

Secret.js is a JavaScript SDK used to write applications interacting with the [Secret Network](https://scrt.network/), which uses gRPC-web.

</HighlightBox>

### gRPC-gateway 

**gRPC-gateway** is a tool to expose gRPC endpoints as REST endpoints. It helps provide APIs in gRPC and RESTful style, and reads gRPC service definitions and generates reverse-proxy servers that can translate a RESTful JSON API into gRPC. For each gRPC endpoint defined in a Protobuf `Query` service, the Cosmos SDK offers a corresponding REST endpoint.

gRPC-Gateway's aim is ["to provide that HTTP+JSON interface to your gRPC service"](https://grpc-ecosystem.github.io/grpc-gateway/docs/overview/background/). With it, developers can benefit from all the advantages of gRPC and, at the same time, still provide a RESTful API - a very helpful tool when for example you want to develop a web application but have browsers that do not support HTTP2. This can help ensure backwards compatibility, and multi-language, multi-client support.

<HighlightBox type="tip">

If you want to explore gRPC-Gateway, a closer look at the [gRPC-Gateway documentation](https://grpc-ecosystem.github.io/grpc-gateway/) is recommended.

</HighlightBox>

In the Cosmos SDK, gRPC-Gateway provides an HTTP1.1 server with REST API and a base64-encoded Protobuf for data encoding; it exposes gRPC endpoints as REST endpoints. It routes on the server to gRPC and piggybacks off of LCD, thus it is also on port `1317`.

For example, if you cannot use gRPC for your application because a browser does not support HTTP2, you can still use the Cosmos SDK. The SDK provides REST routes via gRPC-Gateway.

<HighlightBox type="info">

[Terra.js](https://terra-money.github.io/terra.js/), a JavaScript SDK for applications interacting with the Terra blockchain, uses gRPC-gateway.

</HighlightBox>

## Amino

Amino is an object encoding specification. In the Cosmos SDK, every module uses an **Amino codec** that helps serialize types and interfaces. Amino handles interfaces by prefixing bytes before concrete types.

Usually, Amino codec types and interfaces are registered in the module's domain.

<HighlightBox type="info">

A concrete type is a non-interface type which implements a registered interface. Types need to be registered when stored in interface type fields, or in a list with interface elements.

<br/>

As a best practice, upon initialization make sure to:

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

Amino is basically JSON with some modifications. For example, the JSON specification does not define numbers greater than 2^53, so instead strings are used in Amino when encoding a type greater than uint64/int64.

<br/>

For more on the Amino types and their representation in JSON, see the [Secret.js documentation](https://github.com/scrtlabs/secret.js/blob/master/DEVELOPERS.md#amino-types-and-how-theyre-represented-in-json).

</HighlightBox>
