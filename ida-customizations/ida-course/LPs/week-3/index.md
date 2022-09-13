---
parent:
  title: Introduction to IBC and CosmJS
  description: Learn how to connect chains, and how to use CosmJS for the Cosmos SDK
  number: 3
tag: fast-track
---

<div class="tm-overline tm-rf-1 tm-lh-title tm-medium tm-muted">...</div>
<h1 class="mt-4 mb-6">Introduction to IBC and CosmJS</h1>

Ever wondered how cross-chain communication is possible? Get a fast introduction to the world of the **Inter-Blockchain Communication (IBC) Protocol**.

You'll learn more about the transportation, authentication, and ordering layer of IBC and take a deeper dive into how token transfers between chains become possible. Finally, you'll take a more detailed look at relaying with IBC.

<HighlightBox type="info">
  
**OPTIONAL**: the sections on TAO Connections, Channels & Clients, and Interchain Accounts are made available in case you want to dive deeper. This content **won’t** be tested in the final exam.
  
</HighlightBox>

You'll also learn about CosmJS, the typescript library for the Cosmos SKD. With step-by-step examples, you'll learn how to work with CosmJS when building your application-specific blockchain.


![Chain between 1s and 0s image](/cosmos_dev_portal_module-04-lp.png)

## In this chapter

<HighlightBox type="learning">

In this chapter, you will:

Learn about IBC:
* Discover what IBC is.
* Get an introduction to the different layers of IBC and how connections, channels, and clients relate to each other in IBC.
* Take a look at IBC token transfers.
* Explore interchain accounts.
* Dive into relaying with IBC.
* Get an overview of helpful tools for IBC.

Learn about CosmJS:
* Discover what CosmJS is.
* Learn how to load CosmJS and Stargate into your projects.
* Learn how to interact with a Cosmos blockchain using the existing methods of CosmJS.
* Learn how to interface with the Keplr wallet in the browser.
* Learn how to create new CosmJS methods so your users can query your specific module and blockchain.


</HighlightBox>

<HighlightBox type=”info”>

This chapter covers quite a lot of content that goes very deep into the intricacies of IBC.

Please be aware that the recommended essentials for IBC are:

[What is IBC?](/academy/3-ibc/what-is-ibc.md)
[IBC Fungible Token Transfer](/academy/3-ibc/token-transfer.md)
[IBC Tooling](/academy/3-ibc/ibc-tooling.md)

The following sections are optional and **NOT** final exam relevant:

[IBC/TAO - Connections](/academy/3-ibc/connections.md)
[IBC/TAO - Channels](/academy/3-ibc/channels.md)
[INC/TAO - Clients](/academy/3-ibc/clients.md)
[Interchain Accounts](/academy/3-ibc/ica.md)

</HighlightBox>

**Live Session**

This week you can join the third live session on **September 29th, 3PM UTC**: _Introduction to CosmJS_ with Noam Cohen, Developer Relations Lead for Cosmos Hub.

Detailed information on how to join the session will be provided via email and Discord.

You should have received an email with a link to each session to be added to your calendar. We will post the session links on the day of the session on discord. Don't worry if you cannot make it to the session, we will record and publish them in the Academy.


## Next up

First....

## Developer resources

<div v-for="resource in $themeConfig.resources">
  <Resource
    :title="resource.title"
    :description="resource.description"
    :links="resource.links"
    :image="resource.image"
    :large="true"
  />
  <br/>
</div>
