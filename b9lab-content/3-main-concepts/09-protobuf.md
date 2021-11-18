---
title: "Protobuf"
order: 7
description: Working with Protocol Buffers
tag: deep-dive
---

# Protobuf

## Overview

Protocol Buffers, also called Protobuf in short form, are an open-source, extensible, cross-platform, and language-agnostic method of serializing object data, primarily for network communication and storage. Libraries for multiple languages parse a common interface description language to generate source code for encoding and decoding streams of bytes representing structured data.

Originally designed and developed by Google, Protobuf has been an open-source project since 2008. It serves as the basis for Remote Procedure Call (RPC) systems. 

<HighlightBox type=”info”>

Google provides the [gRPC project](https://blog.conan.io/2019/03/06/Serializing-your-data-with-Protobuf.html), a universal RPC framework, that supports Protobuf directly. For more information on the process, take a look at the section entitled Compiler Invocation.

</HighlightBox>

`.proto` files contain data structures called messages. A compiler, `protoc`, interprets the `.proto` file and generates source code in supported languages - C++, C#, Dart, Go, Java, and Python.

### Working with Protocol Buffers

Define a data structure in a `.proto` file. This is a normal text file with descriptive syntax. Data is represented as a message containing name-value pairs called fields.

Then, compile your Protobuf Schema. `.protoc` generates data access classes with accessors for each field in your preferred language according to the command-line options. Accessors include serializing, deserializing, and parsing. 

## Protobuf basics for Go

The [gobs](https://golang.org/pkg/encoding/gob/) package for Go is a comprehensive package for the Go environment, but it doesn’t work well if you need to share information with applications written in other languages. Another challenge is how to contend with fields that may themselves contain information needing to be parsed or encoded.

For example, a JSON or XML object may contain discrete fields that are stored in a string field. In another example, a time may be stored as two integers representing hours and minutes. A Protobuf encapsulated the necessary conversions in both directions. The generated classes provide getters and setters for the fields and take care of the details for reading and writing the message as a unit.

Importantly, the Protobuf format supports extending the format over time in a way that code can still read data encoded in the old format. 

Go developers access the setters and getters in the generated source code through the Go Protobuf API. 

<HighlightBox type=”info”>

For more on encoding in Cosmos: https://docs.cosmos.network/master/core/encoding.html 
Protobuf documentation overview: https://docs.cosmos.network/master/core/proto-docs.html

</HighlightBox>

## gRPC

gRPC can use Protobuf as both its interface definition language and as its underlying message interchange format. With gRPC, a client can directly call a method on a server application on a different machine, as if it were a local object. 

gRPC is based on the idea of defining a service and specifying the methods that can be called remotely with their parameters and return types. Keep the following in mind regarding the gRPC clients and server sides:

* **Server side:** The server implements this interface and runs a gRPC server to handle client calls.
* **Client side:** The client has a stub (referred to as just a client in some languages) that provides the same methods as the server.

gRPC clients and servers can run and talk to each other in a variety of environments - from servers inside Google to your own desktop - and can be written in any of the gRPC’s supported languages. So, for example, you can easily create a gRPC server in Java with clients in Go, Python, or Ruby.

The latest Google APIs will have gRPC versions of their interfaces, letting you easily build Google functionality into your applications.

## Types

The core of a Cosmos SDK application mainly consists of type definitions and constructor functions. Defined in `app.go`, the type definition of a custom application is simply a struct comprised of the following:

* Reference to **BaseApp**: a reference to BaseApp defines a custom app type embedding BaseApp in your application. In other words, the reference to BaseApp allows the custom application to inherit most of BaseApp's core logic, such as the ABCI methods and the routing logic.
* List of **store keys**: each module in the Cosmos SDK uses multistore to persist their part of the state. Access to such stores requires a list of keys that are declared in the type definition of the app.
* List of each module’s **keepers**: a keeper is an abstract piece in each module to handle the module's interaction with stores, specify references to other modules' keepers, and implement other core functionalities of the module. For cross-module interactions to work, all modules need to have their keepers declared in the app's type definition and exported as interfaces to other modules, so that the keeper's methods of one module can be called and accessed in other modules, when authorized.
* Reference to **codec**: defaulted to go-amino, the codec in your Cosmos SDK application can be substituted with other suitable encoding frameworks, as long as they persist data stores in byte slices and are deterministic.
* Reference to the **module manager**: this acts as a router to all the applications modules.

## Long-running exercise

We have defined several data types: our transactions and our `FullGame`. Perhaps it is time to define them in Protobuf to enjoy its serialization facilities.

We try to reuse the pre-existing `Game` if possible. Otherwise, we provide a transformer to reuse the rules code.

<!-- TODO code detail. -->
