<!--
layout: ModuleLandingPage
main: true
order: 0
intro:
  - overline: Developer Course
    title: Interchain Developer Academy
    image: /graphics-sdk-course.png
    description: |
      Welcome to the Interchain Developer Academy!<br/><br/>
      Over the next seven weeks, you will dive deep into the Cosmos Ecosystem. Let's get started!
    action:
      label: Start learning!
      url: /ida-course/LPs/week-0/
overview:
  title: Important program information
  items:
    - title: Timeline and deadlines
      description: |
        Academy start: September 15th<br/><br/>
        Due dates of mandatory quizzes and exercises: September 23rd and September 30th<br/><br/>
        Exam period: November 3rd - December 1st<br/><br/>
        Results available: December 15th
    - title: What you will learn
      description: |
        Over the next seven weeks, you will dive deep into the Cosmos Ecosystem, starting with a high-level introduction to familiarize yourself with the main concepts. Next, you will put theory into practice by learning how to initiate and build an application-specific blockchain using the Cosmos SDK; how to use the Ignite CLI to scaffold modules for your blockchain; and how to connect a chain with other chains using the Inter-Blockchain Communication Protocol. You will learn how to build frontend and backend applications using CosmJS; operate nodes and validate on a Cosmos blockchain; and run a relaying infrastructure between IBC-connected chains.
    - title: How to get the most out of the Academy
      description: |
          The Academy is self-paced and flexible, so you don't have to be online at particular times. You can follow the weekly plan or go through the learning material at your own pace. We recommend allocating about 10 hours a week to get through all the material.<br/><br/>
          We will offer some live sessions with Cosmos experts about various topics. These live sessions will be announced via email and discord. The sessions will be recorded in case you can’t join them live.<br/><br/>
          The material is delivered in various formats, including text, images, videos, quizzes, and exercises. There is plenty of additional material embedded in the content to deepen your understanding of particular concepts. And if you want even more, ask your tutors and expert instructors, who will point you in the right direction!<br/><br/>
          <br/><br/>
          <b>Mandatory exercises</b><br/><br/>
          <br/><br/>
          In each module, you will find quizzes and/or code exercises. Two of these need to be completed by a certain date. It doesn’t matter if you pass a quiz or exercise - think of these as opportunities to practice and demonstrate your engagement with the program.<br/><br/>
          Week 1: Mandatory quiz - due date: Friday, September 23rd<br/><br/>
          Week 2: Mandatory exercise - due date: Friday, September 30th<br/><br/>
          You will also find exercises every week that are not mandatory. These are still highly recommended, as they are a good preparation for the final exam.<br/><br/>
          <br/><br/>
          <b>Technical requirements</b><br/><br/>
          No special technical requirements of HW or SW are needed. You need a computer with at least 8 GB RAM and 4 GB free hard disk space.
    - title: How much time do I need to dedicate to the Academy?
      description: |
        There are roughly 70 hours of learning material and exercises to work through. In addition, you need to plan for about 20 hours to complete the final exam. In our experience, participants who allocate about 10 hours of work per week tend to get the most out of the program and perform best. However, learning styles are different, so work at a pace that suits you!<br/><br/>
        All the materials are available right from the start of the program.
    - title: What support will I get in the Academy? 
      description: |
        We've set up a private Discord for the Academy for all teaching and ongoing communication. You can reach out to your tutors and expert instructors anytime for support. We encourage you to proactively collaborate with other participants in your cohort and with your instructors. Ask questions, request feedback, and seek help if you are stuck! That way, you'll get the most out of the Academy.<br/><br/>
        We aim to answer your questions within a few hours. Our maximum response time is 24 hours. Main support hours are on weekdays between 6AM UTC and 4PM UTC. We do not provide support during the weekends.<br/><br/>
# All items below should not be displayed for Week O release but on official start date - end is signaled with another comment
#        Click [here](ida-customization/ida-course/discord-info.md) to learn how to join and use Discord.<br/><br/>
#        You will get detailed information on how to join and use Discord via email.
#    - title: How do I access Discord?
#      description: |
#        Follow these two steps to join the private Academy channels on Discord:<br/><br/>
#        1. Join the official Cosmos Discord by clicking here [https://discord.gg/cosmosnetwork].
#        2. Follow the verification process. It’s straightforward but if you need guidance, read [this article](https://medium.com/@alicemeowuk/cosmos-developers-discord-access-7c15951cc839).
#        3. After joining the Discord server, go to [INSERT LINK] and enter your Discord ID. You’ll automatically be added to the Discord area for participants called “Interchain Developer Academy”.<br/><br/>
#        4. If you have any problems, email us at (academy@interchain.io)[academy@interchain.io].<br/><br/>
#        <br/><br/>
#        We’ve put together a quick guide [insert LINK to Discord content page] explaining how to best communicate on Discord.
# Please continue here for Week 0 release
    - title: How do I get certified?
      description: |
        After the 6-week program, you will have two weeks to complete an exam - a combination of quizzes and a code project. The exam will be open from <span class="tm-bold">June 23rd</span> and you have to complete it by <span class="tm-bold">July 7th</span>.<br/><br/>
        You'll receive an email and notification via Discord closer to the date. <br/><br/>
        If you complete the program earlier you can take the exam sooner. The earliest you can take the exam is from the program's second week. You will receive an email with further instructions on how to launch the exam request. <br/><br/>
        The exam is an individual exercise. <br/><br/>
        <div class="tm-bold">When do I get the results?</div>
        You'll receive your exam results by <span class="tm-bold">August 3rd.</span> 
customModules:
  title: Weekly Plan
  description: |
    The Academy runs for 7 weeks. You can follow the weekly structure or decide to go your individual path - just make sure to be ready for the Final Exam after 7 weeks.
  sections:
    - image: /cosmos_dev_portal_module-02-lp.png
      title: Getting started
      href: /ida-course/0-blockchain-basics/
      description: |
        This chapter is completely optional and a good introduction if you are new to blockchain technology or need a refresher on:
      links: [{'title': 'Blockchain Basics', 'path': '/ida-course/0-blockchain-basics/1-blockchain.html'}, {'title': 'Golang', 'path': '/tutorials/4-golang-intro/1_install.html'}, '/tutorials/1-tech-terms/']
-->

This repo contains the code and content for the published [Cosmos SDK Tutorials](https://tutorials.cosmos.network/).

Note: The layout metadata at the top of the README.md file controls how the tutorial page is published. Write permissions are limited to preserve the structure and contents.

These tutorials guide you through actionable steps and walk-throughs to teach you how to use Ignite CLI and the Cosmos SDK. The Cosmos SDK is the world’s most popular framework for building application-specific blockchains. Tutorials provide step-by-step instructions to help you build foundational knowledge and learn how to use Ignite CLI and the Cosmos SDK, including:

* Foundational knowledge to help you navigate between blockchains with the Cosmos SDK
* Learn how Ignite CLI works
* Create a blockchain polling application
* Build an exchange that works with two or more blockchains
* Interact with the Cosmos Hub Testnet to test the functionality of your blockchain
* Use the liquidity module, known on the Cosmos Hub as Gravity DEX, to create liquidity pools so users can swap tokens
* Publish your blockchain application to a Droplet on DigitalOcean
* Connect to a testnet
* Design, build, and run an app as a scavenger hunt game

The code and docs for each tutorial are based on a specific version of the software. Be sure to follow the tutorial instructions to download and use the right version.

Use the tutorials landing page as your entry point to articles on [Cosmos blog](https://blog.cosmos.network/), videos on [Cosmos YouTube](https://www.youtube.com/c/CosmosProject/videos), and ways to get help and support.

This repo manages and publishes the tutorials. For details, see [CONTRIBUTING](CONTRIBUTING.md) and [TECHNICAL-SETUP](TECHNICAL-SETUP.md).
The tutorials are formatted using [markdownlint](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md).
