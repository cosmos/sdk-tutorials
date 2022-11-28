---
parent:
  title: Getting Started
  description: A short introduction to blockchain and Golang
  number: 1
tags:
order: 0
title: Week 0 - A Short Introduction to Blockchain, Golang and Docker
---

<div class="tm-overline tm-rf-1 tm-lh-title tm-medium tm-muted">A short introduction to blockchain and Golang</div>
<h1 class="mt-4 mb-6">Getting Started</h1>

This chapter provides an introduction to blockchain, Golang, Docker, and some of the technical terms you will encounter throughout the Academy program. 

<HighlightBox type="info">

**It is entirely optional and intended as a head start for those who might need it.**

</HighlightBox>

Do you want to refresh your blockchain knowledge? This chapter provides a general introduction to blockchain technology. Feel free to skip this chapter if you do not need a refresher and start your journey with the Week 1 content, which will be available by December 1st at 4 pm UTC when the program officially starts.

Working with Cosmos also means working with Golang. If you have not worked much with Go, do not worry.

<HighlightBox type="info">

As all blockchain ecosystems keep on growing and maturing, product stacks and terminologies evolve. Thus, please be aware that Cosmos is also known as **the Interchain**. The terms "Cosmos", "Cosmos Ecosystem", and "Interchain" are synonymous with each other, and the various tools available to developers ("the stack") can be referred to collectively as the **Interchain Stack**.

</HighlightBox>

This introduction to Golang is meant as a useful overview of Go and as such, a starting point for your journey in the Cosmos Ecosystem and developing with the Cosmos SDK.

The Docker introduction will help you understand the concepts behind this tool, as you will be using Docker in the upcoming tutorials.

<HighlightBox type="tip">

You can also use it as a refresher.

</HighlightBox>

You can find a short section at the end of the chapter with good-to-know dev terms.

![LP image - Week 0](/planets-large.svg)

## In this chapter

<HighlightBox type="learning">

In this chapter, you will:

_**Blockchain Basics**_

* Understand what a blockchain is.
* Learn how blockchain relates to the double-spending problem.
* Recap the historic development of blockchain technology.
* Dive into the cryptographic fundamentals that make blockchain possible.
* Discover the differentiating characteristics of public and managed chains.
* Revisit how consensus is established in distributed networks.

_**Introduction to Go**_

* Get a high-level introduction to Golang.
* Discover basic types, string formatting, functions, and methods.
* Begin exploring interfaces in Go.
* Find an introduction to control structures in Go with a closer look at if, switch, and for statements.
* Learn more about arrays and slices, as well as standard packages Go offers.
* Take a look at Go's built-in concurrency by exploring Goroutine and channels.

_**Introduction to Docker**_

* Get a high-level introduction to Docker.

_**Technical terms**_

* Review some technical terms essential when developing in Cosmos like LCD, RPC, Protobuf, gRPC, and Amino.
  
_**Docker intro**
  
* Get an introduction to Docker and explore how to use it. The main tutorials to come will also rely on using Docker.

</HighlightBox>

<HighlightBox type="info">

All other Academy chapters will be displayed on this page starting **December 1st**.

</HighlightBox>

## Next up

First, you can take a look at blockchain technology by starting with the section on [Blockchain 101](/ida-course/0-blockchain-basics/1-blockchain.md).

Then, for a quick overview on Golang, begin with the section [Go Introduction - First Steps](/tutorials/4-golang-intro/1-install.md).

In case you want to take a look at some technical terms, go ahead and visit the section [Good-To-Know Dev Terms](/tutorials/1-tech-terms/index.md).

Finally, so you are ready for the hands-on-exercises, consult the [introduction to Docker](tutorials/5-docker-intro/).

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

