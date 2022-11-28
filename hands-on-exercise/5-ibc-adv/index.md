---
parent:
  title: IBC Advanced
  description: Deep dive into IBC - Relaying, custom application, and middleware
  number: 1
tag:
order: 1
title: Chapter Overview - Relaying, custom application, and middleware
---

<div class="tm-overline tm-rf-1 tm-lh-title tm-medium tm-muted">Deep dive into IBC - relaying, custom application, and middleware</div>
<h1 class="mt-4 mb-6">IBC Advanced</h1>

It is time to dive deeper into IBC!

As you probably already can imagine, relayers are an important concept when dealing with inter-blockchain communication. Thus, you can have a more detailed look at relaying with IBC in the following sections. Then an introduction into IBC custom applications follows. At the end of the chapter, you can find some sections on IBC middleware elaborating on how you can create a custom IBC middleware and integrate it into your chains.

![](/hands-on-exercise/5-ibc-adv/images/cosmos_dev_portal_module-04-lp.png)

## In this chapter

<HighlightBox type="learning">

In this chapter, you will:

* Explore relaying with IBC, including how to work with the Go and Hermes relayers.
* Take a closer look at custom IBC apps and how to make a module IBC-enabled.
* Discover how to add packet and acknodledgment data.
* Learn what an IBC middleware is and how to create a custom middleware to integrate it into your chain.

</HighlightBox>

<card-module/>

## Next up

Start of with an introduction to relaying with IBC in the [next section](./2-relayer-intro.md). After, you can dive into more details on the Go and Hermes relayer and apply your knowledge to practice.

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
