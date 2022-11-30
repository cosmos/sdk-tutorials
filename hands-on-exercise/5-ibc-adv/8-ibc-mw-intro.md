---
title: "IBC Middleware"
order: 8
description: Custom middleware to wrap an IBC application
tags: 
  - concepts
  - ibc
  - dev-ops
---

# IBC Middleware

Middleware is a well-known concept in software engineering. In traditional web development (web 2.0) for example, middleware is a piece of software that is implemented in the HTTP request-response cycle. One or more pieces of middleware stacked on top have access to the request and response object when an HTTP request comes in at a web server. They can execute custom logic for adding authentication, requesting headers, parsing request bodies, error handling, and many other tasks.

The use of middleware enables the composability and reusability of logical building blocks while allowing applications to focus on their application-specific logic. This suits the Cosmos philosophy well, and it is, therefore, no surprise that middleware can also play an important role in Inter-Blokchain Communication Protocol (IBC) applications.

<HighlightBox type="learning">

In this section, you will learn how to:

* Write your own custom middleware to wrap an IBC application.
* Understand how to hook different middlewares to IBC base applications to form different IBC application stacks.

This document serves as a guide for middleware developers who want to write their own middleware, and for chain developers who want to use IBC middleware on their chains.

</HighlightBox>

## When to use middleware?

IBC applications are designed to be self-contained modules that implement their own application-specific logic through a set of interfaces with the core IBC handlers. This was discussed in the [previous section](./6-ibc-app-steps.md).

These core IBC handlers are designed to enforce the correctness properties of [IBC (transport, authentication, ordering)](/academy/3-ibc/1-what-is-ibc.md) while delegating all application-specific handling to the IBC application modules. **However, there are cases where some functionality may be desired by many applications, yet not appropriate to place in core IBC**...this is where middleware enters the picture.

Middleware allows developers to define the extensions to the application and core IBC logic as separate modules that can wrap over the base application. This middleware can perform its custom logic and pass data into the application, which in turn may run its own logic without being aware of the middleware's existence.

<HighlightBox type="info">

This design allows both the application and the middleware to implement their own isolated logic while still being able to run as part of a single packet flow.
<br/><br/>
In addition, as multiple middlewares can be stacked this design enables modularity, where chain developers can build the required business logic using _plug-and-play_ components consisting of a base IBC application module and a stack of middlewares.

</HighlightBox>

## Definitions

Before we continue, it is important to define the semantics:

* `Middleware`: A self-contained module that sits between core IBC and an underlying IBC application during packet execution. All messages between core IBC and the underlying application must flow through the middleware, which may perform its own custom logic.
* `Underlying Application`: An underlying application is an application that is directly connected to the middleware in question. This underlying application may itself be middleware that is chained to a base application.
* `Base Application`: A base application is an IBC application that does not contain any middleware. It may be nested by 0 or multiple middlewares to form an application stack.
* `Application Stack (or stack)`: A stack is the complete set of application logic (middleware(s) + base application) that is connected to core IBC. A stack may be just a base application, or it may be a series of middlewares that nest a base application.

The diagram below gives an overview of a middleware stack consisting of two middlewares (one stateless, the other stateful).

![Middleware stack](/hands-on-exercise/5-ibc-adv/images/middleware-stack.png)

<HighlightBox type="note">

Keep in mind that:

* **The order of the middleware matters** (more on how to correctly define your stack in the code will follow in the [integration section](./10-ibc-mw-integrate.md)).
* Depending on the type of message, it will either be passed on from the base application up the middleware stack to core IBC or down the stack in the reverse situation (handshake and packet callbacks).
* IBC middleware will wrap over an underlying IBC application and sits between core IBC and the application. It has complete control in modifying any message coming from IBC to the application, and any message coming from the application to core IBC. **Middleware must be completely trusted by chain developers who wish to integrate them**, as this gives them complete flexibility in modifying the application(s) they wrap.
* Scaffolding middleware modules with Ignite CLI is currently not supported.

</HighlightBox>

<HighlightBox type="synopsis">

To summarize, this section has explored:

* The adoption of **middleware**, software implemented in the HTTP request-response cycle to execute custom logic for a wide variety of tasks, from web 2.0.
* The applicability of middleware for composing and reusing logical building blocks which free applications to focus on their own specific logic, and the utility of this development philosophy to IBC applications.
* How middleware can assist the dynamic between applications and core IBC by allowing developers to add desired functionalities which are not appropriate to place in core IBC.
* How the custom logic performed by middleware can pass data to an application which itself operates with no awareness of the middleware's existence, allowing both to run as part of a single packet flow.
* How middlewares can be stacked as modular, plug-and-play components providing an app with the logic inputs its developer desires.

</HighlightBox>

<!--## Next up

In the next sections, you will first see how to develop an IBC middleware, after which you will see how to integrate a piece of middleware or stack on the chain.

Note that, unlike the IBC application module section, you will not be scaffolding the middleware module with Ignite CLI, because this is currently not yet supported.-->

<!-- OPTIONAL if there's time: include ICS29 as example -->

<!-- OPTIONAL: refer to checkers extension tutorial if mw is added there -->
