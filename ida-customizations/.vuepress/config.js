const path = require('path');

module.exports = {
  theme: "cosmos",
  title: "Cosmos Developer Portal",
  head: [
    [
      "link",
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
    ],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    ["meta", { name: "msapplication-TileColor", content: "#2e3148" }],
    ["meta", { name: "theme-color", content: "#ffffff" }],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon-svg.svg" }],
    [
      "link",
      {
        rel: "apple-touch-icon-precomposed",
        href: "/apple-touch-icon-precomposed.png",
      },
    ],
    [
      "script",
      {},
      `const userThemeMode = localStorage?.getItem("vuepress-theme-cosmos-user-theme") || 'dark-mode'
      document.documentElement.className = userThemeMode`
    ],
    [
      'script',
      {
        async: true,
        src: 'https://www.googletagmanager.com/gtag/js?id=G-KZ2X8K22XG',
      },
    ],
    [
        'script',
        {},
        [
          "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-KZ2X8K22XG');",
        ],
    ],
  ],
  themeConfig: {
    repo: "cosmos/sdk-tutorials",
    docsRepo: "cosmos/sdk-tutorials",
    editLinks: true,
    label: "sdk",
    algolia: {
      id: "BH4D9OD16A",
      key: "7976d773390a0be350dc24b0571eee15",
      index: "cosmos-sdk_tutorials",
    },
    topbar: {
      banner: true,
    },
    sidebar: {
      auto: false,
      hideProducts: true,
      nav: [
        {
          title: "Cosmos Developer Academy",
          children: [
            {
              title: "Welcome",
              path: "/",
              directory: false,
              order: 0
            },
            {
              title: "Week 0 - Getting Started",
              directory: true,
              order: 1,
              children: [
                {
                  title: "Getting Started",
                  path: "/ida-customization/ida-course/week-0/index.html",
                },
                {
                  title: "Blockchchain 101",
                  path: "/academy/0.0-B9lab-Blockchains/1_blockchain.html",
                },
                {
                  title: "Blockchain History",
                  path: "/academy/0.0-B9lab-Blockchains/2_public.html",
                },
                {
                  title: "Public and Managed Blockchains",
                  path: "/academy/0.0-B9lab-Blockchains/3_managed.html",
                },
                {
                  title: "Consensus in Distributed Networks",
                  path: "/academy/0.0-B9lab-Blockchains/4_consensus.html",
                },
                {
                  title: "Cryptography",
                  path: "/academy/0.0-B9lab-Blockchains/5_crypto.html",
                },
                {
                  title: "Self-Assessment Quiz",
                  path: "/academy/0.0-B9lab-Blockchains/6_quiz.html",
                },
                {
                  title: "Golang Introduction",
                  path: "/tutorials/4-golang-intro/index.html",
                },
                {
                  title: "First Steps",
                  path: "/tutorials/4-golang-intro/1-install.html",
                },
                {
                  title: "Go Basics",
                  path: "/tutorials/4-golang-intro/2-basics.html",
                },
                {
                  title: "Go Interfaces",
                  path: "/tutorials/4-golang-intro/3-interfaces.html",
                },
                {
                  title: "Control Structures in Go",
                  path: "/tutorials/4-golang-intro/4-control.html",
                },
                {
                  title: "Arrays and Slices in Go",
                  path: "/tutorials/4-golang-intro/5-arrays.html",
                },
                {
                  title: "Standard Packages in Go",
                  path: "/tutorials/4-golang-intro/6-packages.html",
                },
                {
                  title: "Concurrency in Go",
                  path: "/tutorials/4-golang-intro/7-concurrency.html",
                },
                {
                  title: "Good-To-Know Dev Terms",
                  path: "/tutorials/1-tech-terms/index.html",
                },
              ]
            },
            {
              title: "Week 1 - Introduction to Cosmos",
              directory: true,
              order: 2,
              children: [
                {
                  title: "Cosmos and its Main Concepts",
                  path: "/ida-customization/ida-course/week-1/index.html",
                },
                {
                  title: "Blockchain Technology and Cosmos",
                  path: "/academy/1-what-is-cosmos/blockchain-and-cosmos.html",
                },
                {
                  title: "The Cosmos Ecosystem",
                  path: "/academy/1-what-is-cosmos/cosmos-ecosystem.html",
                },
                {
                  title: "Getting ATOM and Staking It",
                  path: "/academy/1-what-is-cosmos/atom-staking.html",
                },
                {
                  title: "A Blockchain App Architecture",
                  path: "/academy/2-main-concepts/architecture.html",
                },
                {
                  title: "Accounts",
                  path: "/academy/2-main-concepts/accounts.html",
                },
                {
                  title: "Transactions",
                  path: "/academy/2-main-concepts/transactions.html",
                },
                {
                  title: "Messages",
                  path: "/academy/2-main-concepts/messages.html",
                },
                {
                  title: "Modules",
                  path: "/academy/2-main-concepts/modules.html",
                },
                {
                  title: "Protobuf",
                  path: "/academy/2-main-concepts/protobuf.html",
                },
                {
                  title: "Multistore and Keepers",
                  path: "/academy/2-main-concepts/multistore-keepers.html",
                },
                {
                  title: "BaseApp",
                  path: "/academy/2-main-concepts/base-app.html",
                },
                {
                  title: "Queries",
                  path: "/academy/2-main-concepts/queries.html",
                },
                {
                  title: "Events",
                  path: "/academy/2-main-concepts/events.html",
                },
                {
                  title: "Context",
                  path: "/academy/2-main-concepts/context.html",
                },
                {
                  title: "Migrations",
                  path: "/academy/2-main-concepts/migrations.html",
                },
                {
                  title: "Bridges",
                  path: "/academy/2-main-concepts/bridges.html",
                },
                {
                  title: "Mandatory Quiz",
                  path: "/ida-customization/ida-course/quiz-week1.html",
                },
              ]
            },
            {
              title: "Week 2 - First Steps",
              directory: true,
              order: 3,
              children: [
                {
                  title: "First Steps",
                  path: "/ida-customization/ida-course/week-2/index.html",
                },
                {
                  title: "Setup Your Work Environment",
                  path: "/tutorials/2-work-environment/setup.html",
                },
                {
                  title: "Run a Node, API, and CLI",
                  path: "/tutorials/3-run-node/node-api-and-cli.html",
                },
                {
                  title: "Ignite CLI",
                  path: "/hands-on-exercise/1-ignite-cli/ignitecli.html",
                },
                {
                  title: "Exercise - Make a Checkers Blockchain",
                  path: "/hands-on-exercise/1-ignite-cli/exercise-intro.html",
                },
                {
                  title: "Store Object - Make a Checkers Blockchain",
                  path: "/hands-on-exercise/1-ignite-cli/stored-game.html",
                },
                {
                  title: "Create Custom Messages",
                  path: "/hands-on-exercise/1-ignite-cli/create-message.html",
                },
                {
                  title: "Create and Save a Game Properly",
                  path: "/hands-on-exercise/1-ignite-cli/create-handling.html",
                },
                {
                  title: "Add a Way to Make a Move",
                  path: "/hands-on-exercise/1-ignite-cli/play-game.html",
                },
                {
                  title: "Emit Game Information",
                  path: "/hands-on-exercise/1-ignite-cli/events.html",
                },
                {
                  title: "Make Sure a Player Can Reject a Game",
                  path: "/hands-on-exercise/1-ignite-cli/reject-game.html",
                },
                {
                  title: "Mandatory Exercise",
                  path: "/ida-customization/ida-course/exercise-week2.html",
                },
              ]
            },
            {
              title: "Week 3 - Introduction to IBC and CosmJS",
              directory: true,
              order: 4,
              children: [
                {
                  title: "Introduction to IBC and CosmJS",
                  path: "/ida-customization/ida-course/week-3/index.html",
                },
                {
                  title: "What is IBC?",
                  path: "/academy/3-ibc/what-is-ibc.html",
                },
                {
                  title: "TAO - Connections",
                  path: "/academy/3-ibc/connections.html",
                },
                {
                  title: "TAO - Channels",
                  path: "/academy/3-ibc/channels.html",
                },
                {
                  title: "TAO - Clients",
                  path: "/academy/3-ibc/clients.html",
                },
                {
                  title: "IBC Fungible Token Transfer",
                  path: "/academy/3-ibc/token-transfer.html",
                },
                {
                  title: "Interchain Accounts",
                  path: "/academy/3-ibc/ica.html",
                },
                {
                  title: "IBC Tooling",
                  path: "/academy/3-ibc/ibc-tooling.html",
                },
                {
                  title: "What is CosmJS?",
                  path: "tutorials/6-comsjs/cosmjs-intro.html",
                },
                {
                  title: "Your First CosmJS Actions",
                  path: "tutorials/6-comsjs/first-steps.html",
                },
                {
                  title: "Compose Complex Transactions",
                  path: "tutorials/6-comsjs/multi-msg.html",
                },
                {
                  title: "Learn to Integrate Keplr",
                  path: "tutorials/6-comsjs/with-keplr.html",
                },
                {
                  title: "Create Custom CosmJS Interfaces",
                  path: "tutorials/6-comsjs/create-custom.html",
                },
              ]
            },
            {
              title: "Week 4 - Ignite CLI and IBC Advanced",
              directory: true,
              order: 5,
              children: [
                {
                  title: "Ignite CLI and IBC Advanced",
                  path: "/ida-customization/ida-course/week-4/index.html",
                },
                {
                  title: "Put Your Games in Order",
                  path: "/hands-on-exercise/2-ignite-cli/game-fifo.html",
                },
                {
                  title: "Keep an Up-To-Date Game Deadline",
                  path: "/hands-on-exercise/2-ignite-cli/game-deadline.html",
                },
                {
                  title: "Record the Game Winner",
                  path: "/hands-on-exercise/2-ignite-cli/game-winner.html",
                },
                {
                  title: "Auto-Expiring Games",
                  path: "/hands-on-exercise/2-ignite-cli/game-forfeit.html",
                },
                {
                  title: "Let Players Set a Wager",
                  path: "/hands-on-exercise/2-ignite-cli/game-wager.html",
                },
                {
                  title: "Incentivize Players",
                  path: "/hands-on-exercise/2-ignite-cli/gas-meter.html",
                },
                {
                  title: "Help Find a Correct Move",
                  path: "/hands-on-exercise/2-ignite-cli/can-play.html",
                },
                {
                  title: "Understanding IBC Denoms with Gaia",
                  path: "/tutorials/4-ibc-dev/understanding-ibc-denoms.html",
                },
                {
                  title: "Play With Cross-Chain Tokens",
                  path: "/tutorials/4-ibc-dev/wager-denom.html",
                },
                {
                  title: "Relaying With IBC",
                  path: "/tutorials/4-ibc-dev/relayer-intro.html",
                },
                {
                  title: "Go Relayer",
                  path: "/tutorials/4-ibc-dev/go-relayer.html",
                },
                {
                  title: "Hermes Relayer",
                  path: "/tutorials/4-ibc-dev/hermes-relayer.html",
                },

              ]
            },
            {
              title: "Week 5 - CosmJS Advanced",
              directory: true,
              order: 6,
              children: [
                {
                  title: "CosmJS Advanced",
                  path: "/ida-customization/ida-course/week-5/index.html",
                },
                {
                  title: "Create Custom Objects",
                  path: "hands-on-exercise/3-cosmjs/cosmjs-objects.html",
                },
                {
                  title: "Create Custom Messages",
                  path: "hands-on-exercise/3-cosmjs/cosmjs-messages.html",
                },
                {
                  title: "Get an External GUI",
                  path: "hands-on-exercise/3-cosmjs/external-gui.html",
                },
                {
                  title: "Integrate CosmJS and Keplr",
                  path: "hands-on-exercise/3-cosmjs/cosmjs-gui.html",
                },
                {
                  title: "Backend Script for Game Indexing",
                  path: "hands-on-exercise/3-cosmjs/server-side.html",
                },
                {
                  title: "Introduce a Leaderboard After Production",
                  path: "hands-on-exercise/3-cosmjs/migration.html",
                },
              ]
            },
            {
              title: "Week 6 - IBC Deep Dive",
              directory: true,
              order: 7,
              children: [
                {
                  title: "IBC Deep Dive",
                  path: "/ida-customization/ida-course/week-6/index.html",
                },
                {
                  title: "IBC Application Developer Introduction",
                  path: "/hands-on-exercise/4-ibc-dev/ibc-app-intro.html",
                },
                {
                  title: "Make a Module IBC-Enabled",
                  path: "/hands-on-exercise/4-ibc-dev/ibc-app-steps.html",
                },                {
                  title: "Adding Packet and Acknowledgement Data",
                  path: "/hands-on-exercise/4-ibc-dev/ibc-app-packets.html",
                },
                {
                  title: "IBC Middleware",
                  path: "/hands-on-exercise/4-ibc-dev/ibc-mw-intro.html",
                },
                {
                  title: "Create a Custom IBC Middleware",
                  path: "/hands-on-exercise/4-ibc-dev/ibc-mw-develop.html",
                },
                {
                  title: "Integrating IBC Middleware Into a Chain",
                  path: "/hands-on-exercise/4-ibc-dev/ibc-mw-integrate.html",
                },
              ]
            },
            {
              title: "Week 7 - Run in Production"
              directory: true,
              order: 8,
              children: [
                {
                  title: "Run in Production",
                  path: "/ida-customization/ida-course/week-7/index.html",
                },
                {
                  title: "Prepare the Software to Run",
                  path: "/hands-on-exercise/5-run-in-prod/1-software.html",
                },
                {
                  title: "Prepare a Validator and Keys",
                  path: "/hands-on-exercise/5-run-in-prod/2-keys.html",
                },
                {
                  title: "Prepare Where the Node Starts",
                  path: "/hands-on-exercise/5-run-in-prod/3-genesis.html",
                },
                {
                  title: "Prepare and Connect to Other Nodes",
                  path: "/hands-on-exercise/5-run-in-prod/4-network.html",
                },
                {
                  title: "Configure, Run and Set Up a Service",
                  path: "/hands-on-exercise/5-run-in-prod/5-run.html",
                },
                {
                  title: "Prepare and Do Migrations",
                  path: "/hands-on-exercise/5-run-in-prod/6-migration.html",
                },
                {
                  title: "Interconnect Your Chain",
                  path: "/hands-on-exercise/5-run-in-prod/.html",
                },
                {
                  title: "Move to Production",
                  path: "/hands-on-exercise/5-run-in-prod/.html",
                },
                {
                  title: "Final Exam",
                  path: "/ida-customization/ida-course/final-exam.html"
                },
              ]
            },
            {
              title: "What's Next?",
              path: "/ida-customization/academy/whats-next/index.html",
              directory: false,
              order: 9,
            },
          ],
        },
      ],
    },
    gutter: {
      title: "Help & Support",
      editLink: true,
      chat: {
        title: "Discord",
        text: "Chat with Cosmos developers on Discord.",
        url: "https://discordapp.com/channels/669268347736686612",
        bg: "linear-gradient(225.11deg, #2E3148 0%, #161931 95.68%)",
      },
      forum: {
        title: "Cosmos SDK Forum",
        text: "Join the SDK Developer Forum to learn more.",
        url: "https://forum.cosmos.network/",
        bg: "linear-gradient(225deg, #46509F -1.08%, #2F3564 95.88%)",
        logo: "cosmos",
      },
      github: {
        title: "Found an Issue?",
        text: "Help us improve this page by suggesting edits on GitHub.",
      },
    },
    footer: {
      privacy: "https://v1.cosmos.network/privacy",
      question: {
        text:
          "Chat with Cosmos developers in <a href='https://discord.gg/cosmosnetwork' target='_blank'>Discord</a> or reach out on the <a href='https://forum.cosmos.network/c/cosmos-sdk' target='_blank'>SDK Developer Forum</a> to learn more.",
      },
      logo: "/brand.png",
      textLink: {
        text: "cosmos.network",
        url: "https://cosmos.network",
      },
      services: [
        {
          service: "medium",
          url: "https://blog.cosmos.network/",
        },
        {
          service: "twitter",
          url: "https://twitter.com/cosmos",
        },
        {
          service: "discord",
          url: "https://discord.gg/cosmosnetwork"
        },
        {
          service: "linkedin",
          url: "https://www.linkedin.com/company/interchain-foundation/about/",
        },
        {
          service: "reddit",
          url: "https://reddit.com/r/cosmosnetwork",
        },
        {
          service: "telegram",
          url: "https://t.me/cosmosproject",
        },
        {
          service: "youtube",
          url: "https://www.youtube.com/c/CosmosProject",
        }
      ],
      smallprint:
        "† This website is maintained by the Interchain Foundation (ICF). The contents and opinions of this website are those of the ICF. The ICF provides links to cryptocurrency exchanges as a service to the public. The ICF does not warrant that the information provided by these websites is correct, complete, and up-to-date. The ICF is not responsible for their content and expressly rejects any liability for damages of any kind resulting from the use, reference to, or reliance on any information contained within these websites.",
      links: [
        {
          title: "Documentation",
          children: [
            {
              title: "Cosmos SDK",
              url: "https://docs.cosmos.network",
            },
            {
              title: "Cosmos Hub",
              url: "https://hub.cosmos.network",
            },
            {
              title: "Tendermint Core",
              url: "https://docs.tendermint.com",
            },
            {
              title: "IBC Protocol",
              url: "https://ibc.cosmos.network/",
            },
          ],
        },
        {
          title: "Community",
          children: [
            {
              title: "Cosmos blog",
              url: "https://blog.cosmos.network",
            },
            {
              title: "Forum",
              url: "https://forum.cosmos.network",
            },
            {
              title: "Discord",
              url: "https://discord.gg/cosmosnetwork",
            },
          ],
        },
        {
          title: "Contributing",
          children: [
            {
              title: "Source code on GitHub",
              url: "https://github.com/cosmos/sdk-tutorials",
            },
          ],
        },
      ],
    },
    tags: {
      'deep-dive': {
        color: 'var(--color-secondary)',
        label: 'Deep dive'
      },
      'fast-track': {
        color: 'var(--color-primary)',
        label: 'Fast track'
      }
    },
    feedback: {
      formId: "xyylrkbl",
      captchaSiteKey: "6Ldu_iwdAAAAAF_kmEKihLNwB4qQNsGr9ox5t3Xd",
    },
    resources: [
      {
        title: "Cosmos SDK",
        description: "A framework to build application-specific blockchains",
        links: [{
          name: "Documentation",
          url: "https://docs.cosmos.network/"
        }],
        image: "/cosmos-sdk-icon.svg"
      },
      {
        title: "Tendermint Core",
        description: "Blockchain consensus engine and application interface",
        links: [{
          name: "Documentation",
          url: "https://docs.tendermint.com/"
        }],
        image: "/tendermint-icon.svg"
      },
      {
        title: "Cosmos Hub",
        description: "First interconnected public blockchain on the Cosmos network",
        links: [{
          name: "Documentation",
          url: "https://hub.cosmos.network/"
        }],
        image: "/generic-star-icon.svg"
      },
      {
        title: "IBC",
        description: "Industry standard protocol for inter-blockchain communication",
        links: [{
          name: "Documentation",
          url: "https://ibc.cosmos.network/"
        }],
        image: "/ibc-icon.svg"
      }
    ],
    assetsOptimization: {
      breakpoints: [200, 600, 988, 1200],
      blacklist: ['node_modules', '.vuepress/dist', '.vuepress/theme', '.vuepress/public/resized-images', '.vuepress/public/h5p']
    }
  },
  plugins: [
    [
      "@vuepress/google-analytics",
      {
        ga: "UA-62891515-12",
      }
    ],
    [
      "@vuepress/medium-zoom",
      {
        selector: ".layout__main__content :not(a) > img:not(.no-zoom)",
        options: {
          background: "#000000"
        }
      }
    ]
  ],
  patterns: [
    "README.md",
    "feature-test/*.md",
    "academy/*/*.md",
    "tutorials/*/*.md",
    "authz-module/*.md",
    "course-ida/*/*.md",
    "course-ida/*.md"
  ]
};
