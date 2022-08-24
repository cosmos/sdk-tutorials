# IBC Application Developer Introduction

In the previous section you've learned how to create custom SDK modules. Additionally you've had an introduction to IBC, the ibc-go module in the SDK and how to spin up a relayer to send IBC packets.

Remember the separation of concerns in IBC between the transport layer (IBC/TAO) and the application layer (IBC/APP). The transport layer provides the basic infrastructure layer to _transport_, _authenticate_ and _order_ arbitrary packets of data. The encoding, decoding and interpretation of the data to trigger custom application logic, is then up to the application layer. In the examples of token transfer sent over IBC, we implicitly used the ICS-20 or _transfer_ IBC application module provided by the **ibc-go** SDK module (which also provides the core transport layer functionality).

In the following sections you'll learn how to develop your custom IBC application modules, either from upgrading an existing module or starting from scratch using Ignite CLI.

<highlightbox>
In the [integration](https://ibc.cosmos.network/v3.0.0/ibc/integration.html) section of the IBC documentation, the necessary steps to integrate IBC in a Cosmos SDK chain are outlined.

Note that this does not mean that the main application modules turn into IBC modules, it only means IBC is enabled for the chain. The IBC module has come out-of-the-box in Comsos SDK chains since the 0.40.x version of the SDK, so it is unlikely you'll have to implement these steps manually when developing a chain.

For example, the checkers appchain you developed in the previous section, **is IBC enabled**. This is revealed when trying to send IBC denoms from other chains to set a wager with. However, this does not make the `x/checkers` module an IBC-enabled module. We will investigate all the additions we need to make the module IBC-enabled in what follows.
</higlightbox>

## Structure of the section

In this section we will first investigate the code you have to add to make a module IBC-enabled. For this conceptual example we will build a simple chain from scratch with Ignite CLI. Ignite CLI provides the option to scaffold an IBC module, which does all of the hard work in terms of boilerplate code. Still, it makes sense to take a look at what exactly has changed. Therefore we will compare the code with a _git diff_ when scaffolding a chain with a regular module and when we scaffold an IBC module.

A similar approach will be taken to check what Ignite CLI implements when scaffolding an IBC packet.

After finishing the conceptual tour, we are going to expand the checkers blockchain you created to turn it into an IBC module and will create an additional leaderboard blockchain to act as a separate appchain that can interact via IBC with the checkers blockchain.

Let's dive into it!
