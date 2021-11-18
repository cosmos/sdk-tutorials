# Protobuf

## Overview

Protocol buffers, also called Protobuf in the short form, are an open-source, extensible, cross-platform, and language-neutral method of serializing object data, primarily used for network communication. There are several libraries for multiple platforms that all use a common interface description language to generate source code for encoding and decoding streams of bytes representing structured data.

Originally designed and developed by Google, Protobuf has been an open-source project since 2008 and serves as the basis for Remote Procedure Call (RPC) systems.

`.proto` files contain data structures called messages. A compiler, `protoc`, interprets the `.proto` file and generates source code in supported languages, such as Go, C++, C#, Dart, Java, Python, and others.

<HighlightBox type=”info”>

Google provides the [gRPC project](https://blog.conan.io/2019/03/06/Serializing-your-data-with-Protobuf.html), a universal RPC framework that supports Protobuf directly. See the section titled [Compiler Invocation](https://developers.google.com/protocol-buffers/docs/reference/cpp-generated#invocation) for more information on this process.

</HighlightBox>

### Working with Protocol Buffers

The `.proto` file is used to define a data structure. This is a normal text file with descriptive syntax. Data is represented as a message containing name-value pairs called fields.
To compile your Protobuf Schema, the `.protoc` file generates data access classes with accessors for each field in your preferred language according to command-line options. Accessors include serializing, deserializing and parsing.

## Protobuf Basics for Go

The [gobs](https://golang.org/pkg/encoding/gob/) package for Go is a comprehensive package for the Go environment but it doesn't work well if you need to share information with applications written in other languages. Another challenge is how to contend with fields that may themselves contain information that needs to be parsed or encoded.

For example, a JSON or XML object may contain discrete fields that are stored in a string field. In another example, a time may be stored as two integers representing hour and minute. A Protobuf encapsulates the necessary conversions in both directions. The generated classes provide getters and setters for the fields and take care of the details of reading and writing the message as a unit. Importantly, the Protobuf format supports extending the format over time in a way that code can still read data encoded in the old format.

Go developers access the setters and getters in the generated source code through the Go Protobuf API.

<HighlightBox type=”info”>

For more on encoding in Cosmos, take a peek at [the Cosmos SDK documentation on encoding](https://docs.cosmos.network/master/core/encoding.html).

Here you can find the [Protobuf documentation overview](https://docs.cosmos.network/master/core/proto-docs.html).

</HighlightBox>

## gRPC

gRPC can use Protobuf as both its Interface Definition Language and as its underlying message interchange format. With gRPC, a client can directly call a method on a server application on a different machine as if it were a local object.

gRPC is based on the idea of defining a service and specifying the methods that can be called remotely with their parameters and return types.

* **Server side**: The server implements this interface and runs a gRPC server to handle client calls.
* **Client side**: The client has a stub (referred to as just a client in some languages) that provides the same methods as the server.

gRPC clients and servers can run and talk to each other in a variety of environments - from servers inside Google to your own desktop - and can be written in any of gRPC's supported languages. So, for example, you can easily create a gRPC server in Java with clients in Go, Python, or Ruby.

The latest Google APIs will have gRPC versions of their interfaces, letting you easily build Google functionality into your applications.

## Types

The core of a Cosmos SDK application mainly consists of type definitions and constructor functions. Defined in `app.go` the type definition of a custom application is simply a `struct` comprised of the following:

* Reference to **baseapp**: A reference to the baseapp defines a custom app type embedding baseapp for your application. In other words, the reference to baseapp allows the custom application to inherit most of baseapp's core logic such as ABCI methods and routing logic.
* List of **Store Keys**: Each module in the Cosmos SDK uses a multistore to persist their part of the state. Access to such stores requires a list of keys that are declared in the type definition of the app.
* List of each module's **Keepers**: A Keeper is an abstract piece in each module to handle the module's interaction with stores, specify references to other modules' keepers, and implement other core functionalities of the module. For cross-module interactions to work, all modules in the Cosmos SDK need to have their keepers declared in the app's type definition and exported as interfaces to other modules so that the keeper's methods of one module can be called and accessed in other modules, when authorized.
* Reference to **codec**: Defaulted to go-amino, the codec in your Cosmos SDK application can be substituted with other suitable encoding frameworks as long as they persist data stores in byte slices and are deterministic.
* Reference to Module Manager: A reference to an object containing a list of the applications modules, known as the Module Manager.

<ExpansionPanel title="Show me some code for my checker's blockchain">

In the previous code samples, you saw something like:

```go
type StoredGame struct {
    Creator string
    Index string // The unique id that identifies this game.
    Game string // The serialized board.
    Turn string // "red" or "black"
    Red string
    Black string
    Wager uint64
}
```
With a _helpful_ note telling you that you still need to add serialization information, like:

```go
type StoredGame struct {
    Creator string `protobuf:"bytes,1,opt,name=creator,proto3" json:"creator,omitempty"`
    ...
}
```
How are you to add such cryptic commands without any error?

## Move upstream

This is where Protobuf comes in to simplify your life even more. The same `StoredGame` can in fact be declared as:

```protobuf
message StoredGame {
  string creator = 1;
  string index = 2;
  string game = 3;
  string turn = 4;
  string red = 5;
  string black = 6;
  uint64 wager = 7;
}
```
The `= 1` parts indicate how each field is identified in the serialized output and additionally, provides backward compatibility. As your application upgrades to newer versions, make sure to not reuse numbers for new fields but to keep increasing the `= x` value to preserve backward compatibility.

When _compiling_, Protobuf will add the `protobuf:"bytes..."` elements. Similarly, the messages to create a game can be declared in Protobuf as:

```protobuf
message MsgCreateGame {
  string creator = 1;
  string red = 2;
  string black = 3;
  uint64 wager = 4;
}

message MsgCreateGameResponse {
  string idValue = 1;
}
```

## Enter Starport

When Starport creates a message for you, it also creates the gRPC definitions and Go handling code. Using commands like the ones below makes it relatively easy to introduce Protobuf elements into your chain:

```sh
$ starport scaffold map storedGame game turn red black wager:uint --module checkers --no-message
$ starport scaffold message createGame red black wager:uint --module checkers --response idValue
```
<HighlightBox type="tip">

If you want to dive straight into coding your chain, head to [My Own Chain](../5-my-own-chain/01-index) for more details on using Starport.

</HighlightBox>

</ExpansionPanel>
