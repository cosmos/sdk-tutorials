---
layout: ModuleLandingPage
main: true
order: 0
weekly: true 
image:
  title: Important Dates
  src: /graphics-sdk-course.png
intro:
  - title: Interchain Developer Academy
    image: /graphics-sdk-course.png
    description: |
      Welcome to the Interchain Developer Academy! <br/>
      In the next 6 weeks you will dive into the Cosmos universe. We hope you are excited as we are. Let’s get started! 
    action: 
      label: Start learning
      url: /course-ida/welcome/#weekly-path
    secondtext: |
      This is a beta version of the Developer Portal that will help you take your first steps with the Cosmos SDK.
      <br>We would be grateful for your feedback. At the end of each are three icons to rate the page and a small box where you can give us feedback about things to improve. Enjoy your journey through the portal and good luck with the HackAtom!
overview:
  title: All you need to know / Program info
  items:
    - title: What’s inside / What you will learn
      description: |
        During the next 6 weeks you will get into the Cosmos universe, beginning with a big picture perspective and getting into how to create your own application-specific blockchain with the Cosmos SDK, the Tendermint consensus algorithm and the Inter Blockchain Protocol in particular. After getting acquainted with the main concepts the program takes you through hands-on exercises to put theory into practice. You will get to know how to build a custom blockchain using the Cosmos SDK and how to use Ignite CLI to scaffold modules for a blockchain. <br/>
        You will learn how to build front- and back-end applications using CosmJS, how to operate nodes and validating on a Cosmos blockchain and how to run relaying infrastructure between IBC connected chains. <br/><br/>
        The weekly modules in detail: <br/>
        Week 1: 
    - title: How to go through this program?
      description: |
        The program is self-paced and flexible in that you do not have to be online at a certain time. You can either follow the weekly path or you can go through the learning material at your own pace. Each week contains learning material of about 10 hours of learning effort. <br/><br/>
        The learning content is delivered through a mixture of reading material, images, videos, quizzes & exercises. There is also further reading to deepen your understanding in different areas. In addition to the learning material your tutors and expert instructors will point you to further material of interest. <br/><br/>
        <div class="tm-bold">Mandatory exercises!</div>
        In each module you will find quizzes and/or code exercises. Some of them need to be completed at a certain due date. No matter if you do not pass a quiz or an exercise. We want you to show us that you are engaged and you are still following the program. <br/>
        Week 1: mandatory quiz - due date: Thursday, 19th <br/>
        Week 2: mandatory quiz - due date. Thursday, 26th <br/>
    - title: What is the learning effort?
      description: |
        There are roughly 60 hours of content and exercises to work through and roughly 20 hours for the exam. Our previous experience with these kinds of programs has shown that - on average - most people get the best results doing 10 hours of work a week. However, learning styles are different! You may be an intense worker who likes to deep dive in long chunks! So all the materials are available at the start of the course and you can work at your own pace.
    - title: How do I get support?
      description: |
        Teaching and communication during the whole program will take place in a private discord area. You can reach out to your tutors and expert instructors anytime and they will come back to you in a short while. We encourage you to collaborate with other participants in your cohort and instructors who will help you with questions or when you hit a snag. <br/><br/>
        We will answer your questions as soon as possible. Most of the questions will be addressed within a few hours. The maximum response time will be 24 hours. <br/><br/>
        Read here [link to discord content page] how to join and work with discord 
    - title: How do I get in discord?
      description: |
        There are only 2 steps to follow to join the private Academy discord area:
        <ol>
          <li>Join the official Cosmos Discord by clicking here [https://discord.gg/cosmosnetwork].</li>
          <li>After joining the Discord, go to [INSERT LINK] and enter your Discord ID and you should be automatically added to the private Discord area “Interchain Developer Academy”.</li>
        </ol>
        If you do have any problems, just write an email [academy@interchain.io] <br/><br/>
        To find your way through Discord and to ensure that your messages and questions are caught by our tutors and expert instructors we’ve put together a quick guideline [insert LINK to discord content page] on how to communicate on Discord.
    - title: How do I get certified?
      description: |
        After the 6-week program you will have 2 weeks to complete the exam. The exam will be a combination of quizzes and a code project. At the end of the 6-weeks program, the exam will automatically be unlocked for you on <span class="tm-bold">June 23rd.</span><br/>
        You will receive notification by email and in the discord. <br/><br/>
        If you complete the course earlier you can ask to get the exam unlocked the moment you feel ready - 2 weeks after the start of the course at earliest. To get your exam unlocked you must make a request in the private academy Discord area. <br/><br/>
        The exam must be taken as an individual - you have to work on your own! <br/><br/>
        When do I get the results? <br/>
        Whenever you choose to take your exam, you will receive the results not before <span class="tm-bold">August 3rd.</span> 
modules:
  - title: What is Cosmos & Main Concepts
    description: In Week 1 you get into the Cosmos Ecosystem and learn about the main concepts of the Cosmos universe.
    number: 1
    url: /academy/1-what-is-cosmos/
    submodules:
      - title: What is Cosmos
        description: How does the Cosmos network of interoperable blockchains fit into the overall development of blockchain technology?
        url: /academy/1-what-is-cosmos/
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
      - title: Main Concepts
        description: A universe made up of particles
        url: /academy/2-main-concepts/
        order: 4
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
      - title: Inter-Blockchain Communication
        description: Connecting chains with the IBC Protocol
        url: /academy/2-main-concepts/ibc.html
        order: 17
      - title: Bridges
        description: Bridging to other blockchains on different protocols
        url: /academy/2-main-concepts/bridges.html
        order: 18
  - title: My own Cosmos Chain
    description: In Week 2 you will discover how to run a node and how to build your own chain by following the example of a famous game being built progressively
    number: 2
    url: /academy/4-my-own-chain/
    submodules:
      - title: Chapter Overview - First Steps to Run Your Own Chain
        description: It all comes together
        url: /academy/4-my-own-chain/
        order: 0
      - title: Setup (todo)
        url: /feature-test/
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
        description: You introduce the message to create a game
        url: /academy/4-my-own-chain/create-message.html
        order: 5
      - title: Message Handler - Create and Save a Game Properly
        description: You create a proper game
        url: /academy/4-my-own-chain/create-handling.html
        order: 6
      - title: Message and Handler - Add a Way to Make a Move
        description: You play a game
        url: /academy/4-my-own-chain/play-game.html
        order: 7
      - title: Events - Emitting Game Information
        description: You emit game information using events
        url: /academy/4-my-own-chain/events.html
        order: 8
      - title: Message and Handler - Make Sure a Player Can Reject a Game
        description: You reject a game
        url: /academy/4-my-own-chain/reject-game.html
        order: 9
  - title: My Own Cosmos Chain - Advanced, what makes a chain interesting 
    description: In Week 3 you will dive deeper into how you can make your own game more interesting and special 
    number: 3
    url: /feature-test/
    submodules:
      - title: Module lp (todo)
        url: /feature-test/
        order: 0
      - title: Store FIFO - Put Your Games in Order
        description: You prepare to expire games
        url: /academy/4-my-own-chain/game-fifo.html
        order: 1
      - title: Store Field - Keep an Up-To-Date Game Deadline
        description: You expire games
        url: /academy/4-my-own-chain/game-deadline.html
        order: 2
      - title: Store Field - Record the Game Winner
        description: You store the winner of a game
        url: /academy/4-my-own-chain/game-winner.html
        order: 3
      - title: EndBlock - Auto-expiring Games
        description: You enforce the expiration of games
        url: /academy/4-my-own-chain/game-forfeit.html
        order: 4
      - title: Token - Let Players Set a Wager
        description: You let players set a wager
        url: /academy/4-my-own-chain/game-wager.html
        order: 5
      - title: Gas - Incentivize Players
        description: Reward validators proportional to their effort
        url: /academy/4-my-own-chain/gas-meter.html
        order: 6
      - title: Query - Help Find a Correct Move
        description: Help players make good transactions
        url: /academy/4-my-own-chain/can-play.html
        order: 7
      - title: IBC Token - Play With Cross-Chain Tokens
        description: Let players wager any fungible token
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
  - title: IBC
    description: Subtitle tbd
    number: 4
    url: /feature-test/
    submodules:
      - title: IBC (todo)
        url: /feature-test/
        order: 0
      - title: What is IBC (todo)
        url: /feature-test/
        order: 1
      - title: Token transfer (todo)
        url: /feature-test/
        order: 2
      - title: ICA (todo)
        url: /feature-test/
        order: 3
      - title: IBC TAO dev (todo)
        url: /feature-test/
        order: 4
  - title: CosmJS & My Own CosmJS Chain
    description: In Week 5 you will learn how to prepare CosmJs parts and pieces to work with your own blockchain, and apply it to the game blockchain.
    number: 5
    url: /feature-test/
    submodules:
      - title: CosmJs & My Own Cosmos Chain (todo)
        url: /feature-test/
        order: 0
      - title: What is Cosmjs (todo)
        url: /feature-test/
        order: 1
      - title: Your first CosmJs actions (todo)
        url: /feature-test/
        order: 2
      - title: Compose complex transactions (todo)
        url: /feature-test/
        order: 3
      - title: Learn to integrate Keplr (todo)
        url: /feature-test/
        order: 4
      - title: Create custom objects in general (todo)
        url: /feature-test/
        order: 5
      - title: Create custom objects for Checkers (todo)
        url: /feature-test/
        order: 6
      - title: Create custom messages for Checkers (todo)
        url: /feature-test/
        order: 7
  - title: "CosmJS for My Own Chain: GUI and backend script"
    description: In Week 6 you will use the CosmJs parts you have created to make a proper game GUI and a back script that improves user experience 
    number: 6
    url: /feature-test/
    submodules:
      - title: Create a GUI for your CosmJS Chain (todo)
        url: /feature-test/
        order: 0
      - title: Pick and fix a Checkers GUI (todo)
        url: /feature-test/
        order: 1
      - title: Integrate Cosmjs and Keplr into the GUI (todo)
        url: /feature-test/
        order: 2
      - title: Cosmjs on a backend script for game indexing (todo)
        url: /feature-test/
        order: 3
      - title: What’s Next
        description: Continue your Cosmos journey
        url: /academy/5-whats-next/
        order: 4
---

# Welcome to the Cosmos SDK Developer Platform