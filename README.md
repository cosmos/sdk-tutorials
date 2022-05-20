<!--
layout: ModuleLandingPage
main: true
order: 0
weekly: true 
image:
  title: Important Dates
  src: /ida-timeline.svg
intro:
  - title: Interchain Developer Academy
    image: /graphics-sdk-course.png
    description: |
      Welcome to the Interchain Developer Academy! <br/>
      In the next 6 weeks, you'll dive deep into the Cosmos ecosystem. Let's get started!
    action: 
      label: Start learning
      url: /#overview
    secondtext: |
      This is a beta version of the Developer Portal that will help you take your first steps with the Cosmos SDK.
      <br>We would be grateful for your feedback. At the end of each are three icons to rate the page and a small box where you can give us feedback about things to improve. Enjoy your journey through the portal and good luck with the HackAtom!
overview:
  title: Important program information
  items:
    - title: Timeline and deadlines
      description: |
        Academy start: May 12th <br/>
        Due dates of mandatory quizzes & exercises: May 20th and May 27th <br/>
        Exam period: June 23rd to July 7th <br/>
        Results available: August 3rd <br/>
    - title: What you'll learn
      description: |
        Over the next six weeks, you'll dive deep into the Cosmos ecosystem, starting with a high-level introduction to familiarize yourself with the main concepts. Next you'll put theory into practice by learning how to initiate and build an application-specific blockchain using the Cosmos SDK; how to use the Ignite CLI to scaffold modules for your blockchain; and how to connect a chain with other chains using the Inter-Blockchain Communication Protocol. You'll learn how to build frontend and backend applications using CosmJS; operate nodes and validate on a Cosmos blockchain; and run a relaying infrastructure between IBC-connected chains.
    - title: How to get the most out of the Academy
      description: |
        The Academy is self-paced and flexible, so you don't have to be online at particular times. You can follow the weekly plan or go through the learning material at your own pace. We recommend allocating about 10 hours a week to get through all the material. <br/><br/>
        The material is delivered in various formats, including text, images, videos, quizzes, and exercises. There's plenty of additional material embedded in the content to deepen your understanding of particular concepts. And if you want even more, ask your tutors and expert instructors, who'll point you in the right direction! <br/><br/>
        <div class="tm-bold">Mandatory exercises!</div>
        In each module, you will find quizzes and/or code exercises. Two of these need to be completed by a certain date. It doesn't matter if you pass a quiz or exercise - think of these as opportunities to practice and demonstrate your engagement with the program.<br/><br/>
        Week 1: Mandatory quiz - due date: Friday, May 20th <br/>
        Week 2: Mandatory exercise - due date: Friday, May 27th <br/><br/>
        You will also find exercises every week which are not mandatory. These are still highly recommended, as they are a good preparation for the final exam. <br/><br/>
        <div class="tm-bold">Technical requirements</div>
        No special technical requirements of HW or SW are needed. You need a computer with at least 8 GB RAM and 4GB free hard disk space. 
    - title: How much time do I need to dedicate to the Academy?
      description: |
       There are roughly 60 hours of learning material and exercises to work through. In addition, you need to plan for about 20 hours to complete the final exam. In our experience, participants who allocate about 10 hours of work per week tend to get the most out of the program and perform best. However, learning styles are different, so work at a pace that suits you! <br/><br/>
       All the materials are available right from the start of the program.
    - title: What support will I get in the Academy? 
      description: |
        We've set up a private Discord for the Academy for all teaching and ongoing communication. You can reach out to your tutors and expert instructors anytime for support. We encourage you to proactively collaborate with other participants in your cohort and with your instructors. Ask questions, request feedback, and seek help if you are stuck! That way, you'll get the most out of the Academy. <br/><br/>
        We aim to answer your questions within a few hours. Our maximum response time is 24 hours. Main support hours are on weekdays between 6AM UTC and 4PM UTC. We do not provide support during the weekends. <br/><br/>
        Click <a class="tm-link tm-link-underline-hover" href="/course-ida/discord-info.html" target="_blank">here</a> to learn how to join and use Discord.
    - title: How do I access Discord?
      description: |
        Follow these two steps to join the private Academy channels on Discord: 
        <ol>
          <li>Join the official Cosmos Discord by clicking <a class="tm-link tm-link-underline-hover" href="https://discord.gg/cosmosnetwork" target="_blank">here</a>.</li>
          <li>Follow the verification process. It's straightforward but if you need guidance, read this <a class="tm-link tm-link-underline-hover" href="https://medium.com/@alicemeowuk/cosmos-developers-discord-access-7c15951cc839" target="_blank">article</a>.</li>
          <li>After joining the Discord, follow the link we sent you in your welcome email and enter your Discord ID. You will automatically be added to the private Discord area called "Interchain Developer Academy".</li>
        </ol>
        <br/>
        If you have any problems, email us at <a class="tm-link tm-link-underline-hover" href="mailto:academy@interchain.io">academy@interchain.io</a>.<br/><br/>
        We've put together a quick <a class="tm-link tm-link-underline-hover" href="/course-ida/discord-info.html" target="_blank">guide</a> explaining how to best communicate on Discord.
    - title: How do I get certified?
      description: |
        After the 6-week program, you will have two weeks to complete an exam - a combination of quizzes and a code project. The exam will be open from <span class="tm-bold">June 23rd</span> and you have to complete it by <span class="tm-bold">July 7th</span>.<br/><br/>
        You'll receive an email and notification via Discord closer to the date. <br/><br/>
        If you complete the program earlier you can take the exam sooner. The earliest you can take the exam is from the program's second week. You will receive an email with further instructions on how to launch the exam request. <br/><br/>
        The exam is an individual exercise. <br/><br/>
        <div class="tm-bold">When do I get the results?</div>
        You'll receive your exam results by <span class="tm-bold">August 3rd.</span> 
modules:
  - title: Getting Started
    description: This chapter is completely optional and a good introduction if you are new to blockchain technology or need a refresher.
    number: 0
    url: /course-ida/landingpages/week0-lp.html
    submodules:
      - title: Introduction to Blockchain Technology
        description: Blockchain technology in general
        url: /course-ida/landingpages/week0-lp.html
        order: 0
      - title: Blockchain 101
        description: A universe to discover
        url: /academy/0.0-B9lab-Blockchains/1_blockchain.html
        order: 1
      - title: Blockchain History
        description: A brief history of blockchain technology
        url: /academy/0.0-B9lab-Blockchains/2_public.html
        order: 2
      - title: Public and Managed Blockchains
        description: Introduction to different deployment patterns
        url: /academy/0.0-B9lab-Blockchains/3_managed.html
        order: 3
      - title: Consensus in Distributed Networks
        description: An introduction to distributed consensus
        url: /academy/0.0-B9lab-Blockchains/4_consensus.html
        order: 4    
      - title: Cryptographic Fundamentals of Blockchain
        description: Public-key cryptography
        url: /academy/0.0-B9lab-Blockchains/5_crypto.html
        order: 5
      - title: Self-assessment Quiz
        description: Want to test your blockchain knowledge?
        url: /academy/0.0-B9lab-Blockchains/6_quiz.html
        order: 6
  - title: Cosmos and Its Main Concepts
    description: In Week 1, you'll discover the Cosmos ecosystem and learn about the main concepts of the Cosmos SDK, from its Tendermint consensus to learning how keys, accounts, and transactions relate to each other.
    number: 1
    url: /course-ida/landingpages/week1-lp.html
    submodules:
      - title: Cosmos and its Main Concepts
        description: From the vision to the ecosystem - A universe made up of particles
        url: /course-ida/landingpages/week1-lp.html
        order: 0
      - title: Blockchain Technology and Cosmos
        description: Cosmos as part of blockchain technology
        url: /academy/1-what-is-cosmos/blockchain-and-cosmos.html
        order: 1
      - title: The Cosmos Ecosystem
        description: A universe to discover
        url: /academy/1-what-is-cosmos/cosmos-ecosystem.html
        order: 2
      - title: Getting ATOM and Staking It
        description: Staking your first ATOM
        url: /academy/1-what-is-cosmos/atom-staking.html
        order: 3
      - title: A Blockchain App Architecture
        description: ABCI, Tendermint, and state machines
        url: /academy/2-main-concepts/architecture.html
        order: 5
      - title: Accounts
        description: Discover how accounts, addresses, keys, and keyrings relate to each other
        url: /academy/2-main-concepts/accounts.html
        order: 6
      - title: Transactions
        description: Generating, signing, and broadcasting transactions
        url: /academy/2-main-concepts/transactions.html
        order: 7
      - title: Messages
        description: Introduction to MsgService and the flow of messages
        url: /academy/2-main-concepts/messages.html
        order: 8
      - title: Modules
        description: Core Cosmos SDK modules and their components
        url: /academy/2-main-concepts/modules.html
        order: 9
      - title: Protobuf
        description: Working with Protocol Buffers
        url: /academy/2-main-concepts/protobuf.html
        order: 10
      - title: Multistore and Keepers
        description: Store types, the AnteHandler, and keepers
        url: /academy/2-main-concepts/multistore-keepers.html
        order: 11
      - title: BaseApp
        description: Working with BaseApp to implement applications
        url: /academy/2-main-concepts/base-app.html
        order: 12
      - title: Queries
        description: Query lifecycle and working with queries
        url: /academy/2-main-concepts/queries.html
        order: 13
      - title: Events
        description: Using events in app development
        url: /academy/2-main-concepts/events.html
        order: 14
      - title: Context
        description: Information on the state of the app, the block, and the transaction
        url: /academy/2-main-concepts/context.html
        order: 15
      - title: Migrations
        description: How to handle on-chain upgrades
        url: /academy/2-main-concepts/migrations.html
        order: 16
      - title: Bridges
        description: Bridging to other blockchains on different protocols
        url: /academy/2-main-concepts/bridges.html
        order: 18
      - title: Mandatory Quiz
        url: /course-ida/quiz-week1.html
        order: 19
  - title: Running Your Own Cosmos Chain - Part 1
    description: In Week 2, you'll discover how to run a node and learn how to build your own chain by following an example implementation of a checkers blockchain.
    number: 2
    url: /course-ida/landingpages/week2-lp.html
    submodules:
      - title: Running Your Own Cosmos Chain - Part 1
        description: Run a chain for the first time
        url: /course-ida/landingpages/week2-lp.html
        order: 0
      - title: Setup Your Work Environment
        description: All you need for the hands-on sections
        url: /course-ida/setup.html
        order: 1
      - title: Running a Node, API, and CLI
        description: Interacting with a Cosmos SDK chain through simapp
        url: /academy/3-running-a-chain/node-api-and-cli.html
        order: 2
      - title: Ignite CLI
        description: An easy way to build your application-specific blockchain
        url: /academy/4-my-own-chain/ignitecli.html
        order: 3
      - title: Store Object - Make a Checkers Blockchain
        description: Create the object that stores a game
        url: /academy/4-my-own-chain/stored-game.html
        order: 4
      - title: Message - Create a Message to Create a Game
        description: Introducing the message to create a game
        url: /academy/4-my-own-chain/create-message.html
        order: 5
      - title: Message Handler - Create and Save a Game Properly
        description: Creating a proper game
        url: /academy/4-my-own-chain/create-handling.html
        order: 6
      - title: Message and Handler - Add a Way to Make a Move
        description: Playing a game
        url: /academy/4-my-own-chain/play-game.html
        order: 7
      - title: Events - Emitting Game Information
        description: Emitting game information using events
        url: /academy/4-my-own-chain/events.html
        order: 8
      - title: Message and Handler - Make Sure a Player Can Reject a Game
        description: Rejecting a game
        url: /academy/4-my-own-chain/reject-game.html
        order: 9
      - title: Mandatory Exercise
        description: Mandatory Exercise
        url: /academy/2-main-concepts/exercise-week-2.html
        order: 10
  - title: Running Your Own Cosmos Chain - Part 2
    description: In Week 3, you'll dive deeper into customizing the checkers blockchain and discover how to make your own game more interesting and unique.
    number: 3
    url: /course-ida/landingpages/week3-lp.html
    submodules:
      - title: Running Your Own Cosmos Chain - Part 2
        description: It all comes together
        url: /course-ida/landingpages/week3-lp.html
        order: 0
      - title: Store FIFO - Put Your Games in Order
        description: Preparing to expire games
        url: /academy/4-my-own-chain/game-fifo.html
        order: 1
      - title: Store Field - Keep an Up-To-Date Game Deadline
        description: Games can expire
        url: /academy/4-my-own-chain/game-deadline.html
        order: 2
      - title: Store Field - Record the Game Winner
        description: Storing the winner of a game
        url: /academy/4-my-own-chain/game-winner.html
        order: 3
      - title: EndBlock - Auto-expiring Games
        description: Enforcing the expiration of games
        url: /academy/4-my-own-chain/game-forfeit.html
        order: 4
      - title: Token - Let Players Set a Wager
        description: Letting players set a wager
        url: /academy/4-my-own-chain/game-wager.html
        order: 5
      - title: Gas - Incentivize Players
        description: Rewarding validators proportional to their effort
        url: /academy/4-my-own-chain/gas-meter.html
        order: 6
      - title: Query - Help Find a Correct Move
        description: Helping players make good transactions
        url: /academy/4-my-own-chain/can-play.html
        order: 7
      - title: IBC Token - Play With Cross-Chain Tokens
        description: Letting players wager any fungible token
        url: /academy/4-my-own-chain/wager-denom.html
        order: 8
      - title: Migration - Introduce a Leaderboard After Production
        description: Introducing a leaderboard to your in-production blockchain
        url: /academy/4-my-own-chain/migration.html
        order: 9
      - title: CosmWasm
        description: Multi-chain smart contracts
        url: /academy/4-my-own-chain/cosmwasm.html
        order: 10
  - title: The Inter-Blockchain Communication Protocol
    description: In Week 4, you'll dive into IBC to learn more about the components that allow for cross-chain communication and how relaying works with IBC.
    number: 4
    url: /course-ida/landingpages/week4-lp.html
    submodules:
      - title: The Inter-Blockchain Communication Protocol
        description: Connecting chains
        url: /course-ida/landingpages/week4-lp.html
        order: 0
      - title: What is IBC?
        description: Introduction to the IBC Protocol
        url: /academy/ibc/what-is-ibc.html
        order: 1
      - title: Transport, Authentication, and Ordering Layer - Connections
        description: Establishing connections in IBC
        url: /academy/ibc/ibc-tao-dev.html
        order: 2
      - title: Transport, Authentication, and Ordering Layer - Channels
        description: The role of channels in IBC
        url: /academy/ibc/channels.html
        order: 3
      - title: Transport, Authentication, and Ordering Layer - Clients
        description: Clients in IBC
        url: /academy/ibc/clients.html
        order: 4
      - title: IBC Token Transfer
        description: Token transfers across chains
        url: /academy/ibc/token-transfer.html
        order: 5
      - title: Interchain Accounts
        description: Working with ICA
        url: /academy/ibc/ica.html
        order: 6
      - title: Relaying in General
        description: Relayers in IBC
        url: /academy/ibc/relayerintro.html
        order: 7
      - title: Go Relayer
        description: Relayer implementation in Golang
        url: /academy/ibc/gorelayer.html
        order: 8
      - title: Hermes Relayer
        description: Relayer implementation in Rust
        url: /academy/ibc/hermesrelayer.html
        order: 9
      - title: IBC Tooling
        description: Overview of some helpful tools
        url: /academy/ibc/ibc-tooling.html
        order: 10
  - title: CosmJS - Interfacing
    description: In Week 5, you'll learn how to use CosmJS for your chain and apply it to the checkers blockchain.
    number: 5
    url: /course-ida/landingpages/week5-lp.html
    submodules:
      - title: CosmJS - Interfacing
        description: The TypeScript library for the Cosmos SDK
        url: /course-ida/landingpages/week5-lp.html
        order: 0
      - title: What is CosmJS?
        description: CosmJS and what it can do for me
        url: /academy/xl-cosmjs/intro.html
        order: 1
      - title: Your First CosmJS Actions - Send Tokens
        description: Interacting with a Cosmos SDK chain through CosmJS
        url: /academy/xl-cosmjs/first-steps.html
        order: 2
      - title: Compose Complex Transactions
        description: Sending multiple tokens and messages through CosmJS
        url: /academy/xl-cosmjs/multi-msg.html
        order: 3
      - title: Learn to Integrate Keplr
        description: Interacting with a Cosmos SDK chain through CosmJS and Keplr
        url: /academy/xl-cosmjs/with-keplr.html
        order: 4
      - title: Create Custom CosmJS Interfaces
        description: Working with your blockchain
        url: /academy/xl-cosmjs/create-custom.html
        order: 5
      - title: The Custom Objects for Your Checkers Blockchain
        description: Creating the objects for your GUI
        url: /academy/4-my-own-chain/cosmjs-objects.html
        order: 6
      - title: Create Custom Messages for Your Checkers Blockchain
        description: Introducing the message to create a game
        url: /academy/4-my-own-chain/cosmjs-messages.html
        order: 7
  - title: CosmJS for Your Chain - GUI and Backend Script
    description: In Week 6, you'll build on your previous work with CosmJS to implement a sound game GUI and a backend script that improves the user experience.
    number: 6
    url: /course-ida/landingpages/week6-lp.html
    submodules:
      - title: CosmJS for Your Chain - GUI and Backend Script
        description: Diving deeper into CosmJS
        url: /course-ida/landingpages/week6-lp.html
        order: 0
      - title: Pick and Fix a Checkers GUI
        description: Finding a checkers GUI before integrating with CosmJS
        url: /academy/4-my-own-chain/external-gui.html
        order: 1
      - title: Integrate CosmJS and Keplr Into the GUI
        description: Taking a checkers GUI and using the elements
        url: /academy/4-my-own-chain/cosmjs-gui.html
        order: 2
      - title: CosmJS on a Backend Script for Game Indexing
        description: Introducing a Web2.0 server to track games per player
        url: /academy/4-my-own-chain/server-side.html
        order: 3
-->

This repo contains the code and content for the published [Cosmos SDK Tutorials](https://tutorials.cosmos.network/).

Note: The layout metadata at the top of the README.md file controls how the tutorial page is published. Write permissions are limited to preserve the structure and contents.

These tutorials guide you through actionable steps and walk-throughs to teach you how to use Ignite CLI and the Cosmos SDK. The Cosmos SDK is the world’s most popular framework for building application-specific blockchains. Tutorials provide step-by-step instructions to help you build foundational knowledge and learn how to use Ignite CLI and the Cosmos SDK, including:

* Foundational knowledge to help you navigate between blockchains with the Cosmos SDK
* Learn how Ignite CLI works
* Create a blockchain polling application
* Build an exchange that works with two or more blockchains
* Interact with the Cosmos Hub testnet to test the functionality of your blockchain
* Use the liquidity module, known on the Cosmos Hub as Gravity DEX, to create liquidity pools so users can swap tokens
* Publish your blockchain application to a Droplet on DigitalOcean
* Connect to a testnet
* Design, build, and run an app as a scavenger hunt game

The code and docs for each tutorial are based on a specific version of the software. Be sure to follow the tutorial instructions to download and use the right version.

Use the tutorials landing page as your entry point to articles on [Cosmos blog](https://blog.cosmos.network/), videos on [Cosmos YouTube](https://www.youtube.com/c/CosmosProject/videos), and ways to get help and support.

This repo manages and publishes the tutorials. For details, see [CONTRIBUTING](CONTRIBUTING.md) and [TECHNICAL-SETUP](TECHNICAL-SETUP.md).
The tutorials are formatted using [markdownlint](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md).
