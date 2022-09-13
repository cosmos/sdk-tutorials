---
parent:
  title: IBC Deep Dive
  description: IBC custom app and IBC middleware
  number: 6
tag: fast-track
---

<div class="tm-overline tm-rf-1 tm-lh-title tm-medium tm-muted">...</div>
<h1 class="mt-4 mb-6">IBC Deep Dive</h1>

In the IBC Custom Application chapter, you'll learn to scaffold an IBC-enabled blockchain via Ignite CLI and about different aspects of IBC communication and packet handling. In the IBC Middleware chapter, you'll learn about IBC middleware and understand how it can help you to simplify your application logic.

![](/)

## In this chapter

<HighlightBox type="learning">

In this chapter, you will:

* Learn to scaffold an IBC-enabled module.
* See IBC callbacks and packet flow in the generated code.
* Learn to write your own custom middleware to wrap an IBC application.
* Understand how to hook different middlewares to IBC base applications to form different IBC application stacks.


</HighlightBox>

<HighlightBox type=”info”>

This chapter covers quite a lot of content that goes very deep into the intricacies of IBC.

Please be aware that the recommended essentials for IBC are:

[IBC Application Developer Introduction](/hands-on-exercise/4-ibc-dev/ibc-app-intro.md)
[Make a Module IBC-Enabled](/hands-on-exercise/4-ibc-dev/ibc-app-steps.md)
[Adding Packet and Acknowledgement Data](/hands-on-exercise/4-ibc-dev/ibc-app-packets.md)

The following sections are optional and **NOT** final exam relevant:

[IBC Middleware](/hands-on-exercise/4-ibc-dev/ibc-mw-intro.md)
[Create a Custom IBC Middleware](/hands-on-exercise/4-ibc-dev/ibc-mw-develop.md)
[Integrating IBC Middleware Into a Chain](/hands-on-exercise/4-ibc-dev/ibc-mw-integrate.md)

</HighlightBox>


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
