---
parent:
  title: IBC Deep Dive
  description: IBC custom app and IBC middleware
  number: 7
tags:
order: 0
title: Week 6 - IBC Custom App and IBC Middleware
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
* Learn to write your own custom middleware to wrap an IBC application.
* Understand how to hook different middlewares to IBC base applications to form different IBC application stacks.

</HighlightBox>

<HighlightBox type="info">

This chapter covers quite a lot of content that goes very deep into the intricacies of IBC.

Please be aware that the recommended **essentials** for IBC are:

* [IBC Application Developer Introduction](/hands-on-exercise/5-ibc-adv/5-ibc-app-intro.md)
* [Make a Module IBC-Enabled](/hands-on-exercise/5-ibc-adv/6-ibc-app-steps.md)
* [Adding Packet and Acknowledgement Data](/hands-on-exercise/5-ibc-adv/7-ibc-app-packets.md)

The following sections are optional and **NOT** final exam relevant:

* [IBC Middleware](/hands-on-exercise/5-ibc-adv/8-ibc-mw-intro.md)
* [Create a Custom IBC Middleware](/hands-on-exercise/5-ibc-adv/9-ibc-mw-develop.md)
* [Integrating IBC Middleware Into a Chain](/hands-on-exercise/5-ibc-adv/10-ibc-mw-integrate.md)

</HighlightBox>

## Next up

To start with custom IBC applications, begin with an [introduction to IBC application development](/hands-on-exercise/5-ibc-adv/5-ibc-app-intro.md) to then dive into [making an IBC-enabled module](/hands-on-exercise/5-ibc-adv/6-ibc-app-steps.md) and [adding packet and acknowledgment data](/hands-on-exercise/5-ibc-adv/7-ibc-app-packets.md).

After, take a look at [IBC middleware](/hands-on-exercise/5-ibc-adv/8-ibc-mw-intro.md). You will first [create a custom IBC middleware](/hands-on-exercise/5-ibc-adv/9-ibc-mw-develop.md) and then [integrate it into a chain](/hands-on-exercise/5-ibc-adv/10-ibc-mw-integrate.md).

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
