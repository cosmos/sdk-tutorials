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
    ]
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
    allowedIDAOrigins: [
      "preview-5bxuue6kafu5ocp5", 
      "deploy-preview-995", 
      "deploy-preview-994", 
      "deploy-preview-991",
      "deploy-preview-1047"
    ],
    sidebar: {
      auto: false,
      hideProducts: true,
      nav: [
        {
          title: "Cosmos Academy",
          children: [
            {
              title: "Welcome",
              path: "/academy/0-welcome/",
              directory: false,
            },
            {
              title: "What is Cosmos?",
              path: "/academy/1-what-is-cosmos",
              directory: true,
            },
            {
              title: "Main Concepts",
              path: "/academy/2-main-concepts",
              directory: true,
            },
            {
              title: "Run Your Own Cosmos Chain",
              path: "/academy/3-my-own-chain",
              directory: true,
            },
            {
              title: "The Inter-Blockchain Communication Protocol",
              path: "/academy/4-ibc",
              directory: true,
            },

            {
              title: "CosmJS",
              path: "/academy/5-cosmjs",
              directory: true,
            },
            {
              title: "What's Next?",
              path: "/academy/6-whats-next/",
              directory: false,
            },
          ],
        },
        {
          title: "Cosmos Academy IDA",
          children: [
            {
              title: "Welcome",
              path: "/course-ida/welcome/",
              directory: false,
              order: 0
            },
            {
              title: "Getting started",
              directory: true,
              order: 1,
              children: [
                {
                  title: "Introduction to Blockchain Technology",
                  path: "/course-ida/landingpages/week0-lp.html"
                },
                {
                  title: "Blockchchain 101",
                  path: "/academy/0.0-B9lab-Blockchains/1_blockchain.html"
                },
                {
                  title: "Blockchain History",
                  path: "/academy/0.0-B9lab-Blockchains/2_public.html"
                },
                {
                  title: "Public and Managed Blockchains",
                  path: "/academy/0.0-B9lab-Blockchains/3_managed.html"
                },
                {
                  title: "Consensus in Distributed Networks",
                  path: "/academy/0.0-B9lab-Blockchains/4_consensus.html"
                },
                {
                  title: "Cryptography",
                  path: "/academy/0.0-B9lab-Blockchains/5_crypto.html"
                },
                {
                  title: "Self-Assessment Quiz",
                  path: "/academy/0.0-B9lab-Blockchains/6_quiz.html"
                }
              ]
            },
            {
              title: "Week 1 - Cosmos and Its Main Concepts",
              directory: true,
              order: 2,
              children: [
                {
                  title: "Cosmos and its Main Concepts",
                  path: "/course-ida/landingpages/week1-lp.html"
                },
                {
                  title: "Blockchain Technology and Cosmos",
                  path: "/academy/1-what-is-cosmos/blockchain-and-cosmos.html"
                },
                {
                  title: "The Cosmos Ecosystem",
                  path: "/academy/1-what-is-cosmos/cosmos-ecosystem.html"
                },
                {
                  title: "Getting ATOM and Staking It",
                  path: "/academy/1-what-is-cosmos/atom-staking.html"
                },
                {
                  title: "A Blockchain App Architecture",
                  path: "/academy/2-main-concepts/architecture.html"
                },
                {
                  title: "Accounts",
                  path: "/academy/2-main-concepts/accounts.html"
                },
                {
                  title: "Transactions",
                  path: "/academy/2-main-concepts/transactions.html"
                },
                {
                  title: "Messages",
                  path: "/academy/2-main-concepts/messages.html"
                },
                {
                  title: "Modules",
                  path: "/academy/2-main-concepts/modules.html"
                },
                {
                  title: "Protobuf",
                  path: "/academy/2-main-concepts/protobuf.html"
                },
                {
                  title: "Multistore and Keepers",
                  path: "/academy/2-main-concepts/multistore-keepers.html"
                },
                {
                  title: "BaseApp",
                  path: "/academy/2-main-concepts/base-app.html"
                },
                {
                  title: "Queries",
                  path: "/academy/2-main-concepts/queries.html"
                },
                {
                  title: "Events",
                  path: "/academy/2-main-concepts/events.html"
                },
                {
                  title: "Context",
                  path: "/academy/2-main-concepts/context.html"
                },
                {
                  title: "Migrations",
                  path: "/academy/2-main-concepts/migrations.html"
                },
                {
                  title: "Bridges",
                  path: "/academy/2-main-concepts/bridges.html"
                },
                {
                  title: "Mandatory Quiz",
                  path: "/course-ida/quiz-week1.html"
                },
              ]
            },
            {
              title: "Week 2 - Run Your Own Cosmos Chain - Part 1",
              directory: true,
              order: 3,
              children: [
                {
                  title: "Run Your Own Cosmos Chain - Part 1",
                  path: "/course-ida/landingpages/week2-lp.html"
                },
                {
                  title: "Setup Your Work Environment",
                  path: "/course-ida/setup.html"
                },
                {
                  title: "Run a Node, API, and CLI",
                  path: "/academy/3-running-a-chain/node-api-and-cli.html"
                },
                {
                  title: "Ignite CLI",
                  path: "/academy/4-my-own-chain/ignitecli.html"
                },
                {
                  title: "Store Object - Make a Checkers Blockchain",
                  path: "/academy/4-my-own-chain/stored-game.html"
                },
                {
                  title: "Message - Create a Message to Create a Game",
                  path: "/academy/4-my-own-chain/create-message.html"
                },
                {
                  title: "Message Handler - Create and Save a Game Properly",
                  path: "/academy/4-my-own-chain/create-handling.html"
                },
                {
                  title: "Message and Handler - Add a Way to Make a Move",
                  path: "/academy/4-my-own-chain/play-game.html"
                },
                {
                  title: "Events - Emit Game Information",
                  path: "/academy/4-my-own-chain/events.html"
                },
                {
                  title: "Message and Handler - Make Sure a Player Can Reject a Game",
                  path: "/academy/4-my-own-chain/reject-game.html"
                },
                {
                  title: "Mandatory Exercise",
                  path: "/feature-test"
                },
              ]
            },
            {
              title: "Week 3 - Run Your Own Cosmos Chain - Part 2",
              directory: true,
              order: 4,
              children: [
                {
                  title: "Run Your Own Cosmos Chain - Part 2",
                  path: "/course-ida/landingpages/week3-lp.html"
                },
                {
                  title: "Store FIFO - Put Your Games in Order",
                  path: "/academy/4-my-own-chain/game-fifo.html"
                },
                {
                  title: "Store Field - Keep an Up-To-Date Game Deadline",
                  path: "/academy/4-my-own-chain/game-deadline.html"
                },
                {
                  title: "Store Field - Record the Game Winner",
                  path: "/academy/4-my-own-chain/game-winner.html"
                },
                {
                  title: "EndBlock - Auto-expiring Games",
                  path: "/academy/4-my-own-chain/game-forfeit.html"
                },
                {
                  title: "Token - Let Players Set a Wager",
                  path: "/academy/4-my-own-chain/game-wager.html"
                },
                {
                  title: "Gas - Incentivize Players",
                  path: "/academy/4-my-own-chain/gas-meter.html"
                },
                {
                  title: "Query - Help Find a Correct Move",
                  path: "/academy/4-my-own-chain/can-play.html"
                },
                {
                  title: "IBC Token - Play With Cross-Chain Tokens",
                  path: "/academy/4-my-own-chain/wager-denom.html"
                },
                {
                  title: "Migration - Introduce a Leaderboard After Production",
                  path: "/academy/4-my-own-chain/migration.html"
                },
                {
                  title: "CosmWasm",
                  path: "/academy/4-my-own-chain/cosmwasm.html"
                },
              ]
            },
            {
              title: "Week 4 - The Inter-Blockchain Communication Protocol",
              directory: true,
              order: 5,
              children: [
                {
                  title: "The Inter-Blockchain Communication Protocol",
                  path: "/course-ida/landingpages/week4-lp.html"
                },
                {
                  title: "What is IBC?",
                  path: "/academy/ibc/what-is-ibc.html"
                },
                {
                  title: "Transport, Authentication, and Ordering Layer - Connections",
                  path: "/academy/ibc/ibc-tao-dev.html"
                },
                {
                  title: "Transport, Authentication, and Ordering Layer - Channels",
                  path: "/academy/ibc/channels.html"
                },
                {
                  title: "Transport, Authentication, and Ordering Layer - Clients",
                  path: "/academy/ibc/clients.html"
                },
                {
                  title: "IBC Token Transfer",
                  path: "/academy/ibc/token-transfer.html"
                },
                {
                  title: "Interchain Accounts",
                  path: "/academy/ibc/ica.html"
                },
                {
                  title: "Relayers in General",
                  path: "/academy/ibc/relayerintro.html"
                },
                {
                  title: "Go Relayer",
                  path: "/academy/ibc/gorelayer.html"
                },
                {
                  title: "Hermes Relayer",
                  path: "/academy/ibc/hermesrelayer.html"
                },
                {
                  title: "Overview IBC Tooling",
                  path: "/academy/ibc/ibc-tooling.html"
                },
              ]
            },
            {
              title: "Week 5 - CosmJS and Building Your CosmJS Chain",
              directory: true,
              order: 6,
              children: [
                {
                  title: "CosmJS and Building Your CosmJS Chain",
                  path: "/course-ida/landingpages/week5-lp.html"
                },
                {
                  title: "What is CosmJS",
                  path: "/academy/xl-cosmjs/intro.html"
                },
                {
                  title: "Your First CosmJS Actions",
                  path: "/academy/xl-cosmjs/first-steps.html"
                },
                {
                  title: "Compose Complex Transactions",
                  path: "/academy/xl-cosmjs/multi-msg.html"
                },
                {
                  title: "Learn to Integrate Keplr",
                  path: "/academy/xl-cosmjs/with-keplr.html"
                },
                {
                  title: "Create Custom Objects",
                  path: "/academy/xl-cosmjs/create-custom.html"
                },
                {
                  title: "Custom Objects for Your Checkers Blockchain",
                  path: "/academy/4-my-own-chain/cosmjs-objects.html"
                },
                {
                  title: "Custom Messages for Your Checkers Blockchain",
                  path: "/academy/4-my-own-chain/cosmjs-messages.html"
                },
              ]
            },
            {
              title: "Week 6 - CosmJS for Your Chain - GUI and Backend Script",
              directory: true,
              order: 7,
              children: [
                {
                  title: "CosmJS for Your Chain - GUI and Backend Script",
                  path: "/course-ida/landingpages/week6-lp.html"
                },
                {
                  title: "Pick and Fix a Checkers GUI",
                  path: "/academy/4-my-own-chain/external-gui.html"
                },
                {
                  title: "Integrate CosmJS and Keplr Into the GUI",
                  path: "/academy/4-my-own-chain/cosmjs-gui.html"
                },
                {
                  title: "CosmJS on a Backend Script for Game Indexing",
                  path: "/academy/4-my-own-chain/server-side.html"
                },
                {
                  title: "Final exam (todo)",
                  path: "/feature-test/"
                },
              ]
            },
            {
              title: "What's Next?",
              path: "/academy/5-whats-next/",
              directory: false,
              order: 8,
            },
          ],
        },
        {
          title: "Tutorials",
          children: [
            {
              title: "Good to Know Dev Terms",
              path: "/tutorials/tech-terms/",
              directory: false,
            },
            {
              title: "Golang Introduction",
              path: "/academy/golang-intro/",
              directory: true,
            },
            {
              title: "Understanding IBC denoms",
              path: "/tutorials/understanding-ibc-denoms/",
              directory: false,
            },
            {
              title: "Understanding the Authz Module",
              path: "/tutorials/understanding-authz/",
              directory: false,
            },
            {
              title: "Understanding the Feegrant Module",
              path: "/tutorials/understanding-feegrant/",
              directory: false,
            },
            {
              title: "Understanding the Group Module",
              path: "/tutorials/understanding-group/",
              directory: false,
            }
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
        ga: "UA-51029217-2",
      }
    ],
    [
      "vuepress-plugin-google-tag-manager",
      {
        gtm: "UA-51029217-2",
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
    "course-ida/*/*.md",
    "course-ida/*.md"
  ]
};
