---
parent:
  title: IBC Deep Dive
  description: IBC custom app and IBC middleware
  number: 7
order: 0
title: Week 6 - IBC Custom App and IBC Middleware
tags:
---

<div class="tm-overline tm-rf-1 tm-lh-title tm-medium tm-muted">IBC custom app and IBC middleware</div>
<h1 class="mt-4 mb-6">IBC Deep Dive</h1>

In the IBC custom application sections, you will learn to scaffold an IBC-enabled blockchain via Ignite CLI and explore different aspects of IBC communication and packet handling. In the IBC middleware sections, you will learn about IBC middleware and understand how it can help you to simplify your application logic.

![LP image - Week 6](/moving-objects.svg)

## In this chapter

<HighlightBox type="learning">

In this chapter, you will:

* Learn to scaffold an IBC-enabled module.
* See IBC callbacks and packet flow in the generated code.
* Discover how to make an existing chain IBC-enabled and how to create an IBC-enabled chain. 
* Learn to write your own custom middleware to wrap an IBC application.
* Understand how to hook different middlewares to IBC base applications to form different IBC application stacks.

</HighlightBox>

## Next up

To start with custom IBC applications, begin with an [introduction to IBC application development](/hands-on-exercise/5-ibc-adv/35-ibc-app-intro.md) to then dive into [making an IBC-enabled module](/hands-on-exercise/5-ibc-adv/4-ibc-app-steps.md) and [adding packet and acknowledgement data](/hands-on-exercise/5-ibc-adv/5-ibc-app-packets.md).

You are then ready to dive into [extending your checkers game with a leaderboard](/hands-on-exercise/5-ibc-adv/6-ibc-app-checkers.md) making it IBC-enabled. Once you made an existing chain IBC-enabled, it is time to [create a global leaderboard chain](/hands-on-exercise/5-ibc-adv/7-ibc-app-leaderboard.md) that can receive information (player scores) from other chains.

<HighlightBox type="info">

Please be aware that the sections listed above are recommended as **essentials** for IBC and represent valuable knowledge if you choose to undertake the final exam.

However, this chapter also covers quite a lot of content that goes very deep into the intricacies of IBC. The following sections are optional and **NOT** final exam relevant:

* [IBC Middleware](/academy/3-ibc/9-ibc-mw-intro.md)
* [Create a Custom IBC Middleware](/academy/3-ibc/10-ibc-mw-develop.md)
* [Integrating IBC Middleware Into a Chain](/academy/3-ibc/11-ibc-mw-integrate.md)

</HighlightBox>

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
