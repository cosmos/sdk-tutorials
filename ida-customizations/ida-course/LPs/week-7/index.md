---
parent:
  title: From Code to MVP to Production and Migrations
  description: See your chain in action
  number: 8
tags:
order: 0
title: Week 5 - See Your Chain in Action
---

<div class="tm-overline tm-rf-1 tm-lh-title tm-medium tm-muted">See your chain in action</div>
<h1 class="mt-4 mb-6">From Code to MVP to Production and Migrations</h1>

After having developed your chain, now you will take the next step to move your chain to a proof-of-concept and into production.

![LP image - Week 7](/universe.svg)

## In this chapter

<HighlightBox type="learning">

In this chapter, you will learn:

* About the different considerations that need to be covered before you can get your blockchain into production.
* How to compile your blockchain for distribution to interested parties.
* How to prepare, use, and protect the private cryptographic keys that you need.
* How to prepare a genesis and coordinate its creation between stakeholders.
* How to prepare your network topology and configuration to be part of your blockchain.
* How to prepare your server for convenience and reliability.
* How to apply this knowdlege to simulate a small production for your checkers application with the help of Docker Compose.
* How to prepare and program a blockchain state migration (a.k.a. "a breaking change"), using the example of the introduction of a leaderboard to the checkers application.
* How to prepare your server when an upgrade is upcoming.

</HighlightBox>

## Next up

It is time to move your checkers blockchain into production. In the [next section](/tutorials/9-path-to-prod/1-overview.md), you can find an overview of the different aspects one needs to address to move a Cosmos blockchain into production.

## Developer Resources

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
