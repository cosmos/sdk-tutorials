---
parent:
  title: From Code to MVP to Production
  description: See your chain in action
  number: 4
order: 0
title: Chapter Overview - See Your Chain in Action
tags:
---

<div class="tm-overline tm-rf-1 tm-lh-title tm-medium tm-muted">See your chain in action</div>
<h1 class="mt-4 mb-6">From Code to MVP to Production and Migrations</h1>

After having developed your chain, now you will take the next step to move your chain to a proof-of-concept and into production.

![](/lp-images/universe.svg)

## In this chapter

<HighlightBox type="learning">

In this chapter, you will learn:

* How to apply the learnings from the section [Path to Production](/tutorials/9-path-to-prod/index.md) to simulate a small production for your checkers application with the help of Docker Compose.
* How to prepare and program a blockchain state migration (a.k.a. "a breaking change"), using the example of the introduction of a leaderboard to the checkers application.
* How to prepare your server when an upgrade is upcoming.

</HighlightBox>

## Next up

It is time to move your checkers blockchain into production. In the [next section](/hands-on-exercise/4-run-in-prod/1-run-prod-docker.md), you can explore how to simulate production with Docker Compose.

After, you will [introduce a leaderboard after production](/hands-on-exercise/4-run-in-prod/2-migration.md) into your checkers blockchain. Upgrading your chain in production and dealing with data migrations and logic upgrades will become easier to understand after this guided coding section.

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
