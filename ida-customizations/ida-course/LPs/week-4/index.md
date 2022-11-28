---
parent:
  title: Ignite CLI and IBC Advanced
  description: Let's get serious!
  number: 5
tags:
order: 0
title: Week 4 - Let's Get Serious!
---

<div class="tm-overline tm-rf-1 tm-lh-title tm-medium tm-muted">Let's get serious!</div>
<h1 class="mt-4 mb-6">Ignite CLI and IBC Advanced</h1>

This week you will work further on your checkers blockchain and take your next steps with Ignite CLI. You have a workable checkers blockchain, one which lets players play. But have you thought about everything? Is your blockchain safe from bad behavior? How do you incentivize good behavior? Can you also make it more fun?

Following the hands-on exercises, you will discover how IBC denoms work and get to grips with cross-chain tokens and relayers.

![LP image - Week 4](/planet-collection.svg)

## In this chapter

<HighlightBox type="learning">

* Learn about **Ignite CLI**:
  * Learn how to handle fungible tokens.
  * Learn how to add integration tests.
  * Learn how to use the end blocker.
  * Learn how to design your code in an O(1) way with an example.

* Learn about **IBC**:
  * Understand IBC denoms.
  * Play with cross-chain tokens.
  * Relay with IBC.
  * Work with the Go and Hermes relayers.

</HighlightBox>


## Next up

In this chapter, continue working on your checkers blockchain by first [putting your games in order](/hands-on-exercise/2-ignite-cli-adv/1-game-fifo.md), then [introducing a game deadline](/hands-on-exercise/2-ignite-cli-adv/2-game-deadline.md), [recording a game winner](/hands-on-exercise/2-ignite-cli-adv/3-game-winner.md), and some other important aspects to develop your checkers blockchain.

After, take a deeper dive into all that IBC has to offer by first tackling [IBC denoms](/tutorials/6-ibc-dev/index.md), [playing with some cross-chain tokens](/hands-on-exercise/2-ignite-cli-adv/8-wager-denom.md), and [taking a look at relaying with IBC](/hands-on-exercise/5-ibc-adv/2-relayer-intro.md).

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
