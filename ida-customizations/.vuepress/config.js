const path = require('path');

module.exports = {
  theme: "cosmos",
  title: "Interchain Developer Academy",
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
      filterByTagEnabled: false,
      nav: [
        {
          title: "Cosmos Developer Academy",
          children: [
            {
              title: "Week 0 - Getting Started",
              directory: true,
              children: [
                {
                  title: "Getting Started",
                  path: "ida-customizations/ida-course/LPs/week-0/",
                },
                {
                  title: "Blockchain 101",
                  path: "ida-customizations/ida-course/0-blockchain-basics/1-blockchain.html",
                },
                {
                  title: "Blockchain History",
                  path: "ida-customizations/ida-course/0-blockchain-basics/2-public.html",
                },
                {
                  title: "Public and Managed Blockchains",
                  path: "ida-customizations/ida-course/0-blockchain-basics/3-managed.html",
                },
                {
                  title: "Consensus in Distributed Networks",
                  path: "ida-customizations/ida-course/0-blockchain-basics/4-consensus.html",
                },
                {
                  title: "Cryptography",
                  path: "ida-customizations/ida-course/0-blockchain-basics/5-crypto.html",
                },
                {
                  title: "Self-Assessment Quiz",
                  path: "ida-customizations/ida-course/0-blockchain-basics/6-quiz.html",
                },
                {
                  title: "Go Introduction - First Steps",
                  path: "/tutorials/4-golang-intro/1_install.html",
                },
                {
                  title: "Go Basics",
                  path: "/tutorials/4-golang-intro/2_basics.html",
                },
                {
                  title: "Go Interfaces",
                  path: "/tutorials/4-golang-intro/3_interfaces.html",
                },
                {
                  title: "Control Structures in Go",
                  path: "/tutorials/4-golang-intro/4_control.html",
                },
                {
                  title: "Arrays and Slices in Go",
                  path: "/tutorials/4-golang-intro/5_arrays.html",
                },
                {
                  title: "Standard Packages in Go",
                  path: "/tutorials/4-golang-intro/6_packages.html",
                },
                {
                  title: "Concurrency in Go",
                  path: "/tutorials/4-golang-intro/7_concurrency.html",
                },
                {
                  title: "Good-To-Know Dev Terms",
                  path: "/tutorials/1-tech-terms/",
                },
              ]
            },

            {
              title: "Week 1 - Introduction to Cosmos",
              directory: true,
              order: 2,
              children: [
                {
                  title: "Introduction to Cosmos",
                  path: "ida-customizations/ida-course/LPs/week-1",
                },
                {
                  title: "Blockchain Technology and Cosmos",
                  path: "/academy/1-what-is-cosmos/1-blockchain-and-cosmos.html",
                },
                {
                  title: "The Cosmos Ecosystem",
                  path: "/academy/1-what-is-cosmos/2-cosmos-ecosystem.html",
                },
                {
                  title: "Getting ATOM and Staking It",
                  path: "/academy/1-what-is-cosmos/3-atom-staking.html",
                },
                {
                  title: "A Blockchain App Architecture",
                  path: "/academy/2-cosmos-concepts/1-architecture.html",
                },
                {
                  title: "Accounts",
                  path: "/academy/2-cosmos-concepts/2-accounts.html",
                },
                {
                  title: "Transactions",
                  path: "/academy/2-cosmos-concepts/3-transactions.html",
                },
                {
                  title: "Messages",
                  path: "/academy/2-cosmos-concepts/4-messages.html",
                },
                {
                  title: "Modules",
                  path: "/academy/2-cosmos-concepts/5-modules.html",
                },
                {
                  title: "Protobuf",
                  path: "/academy/2-cosmos-concepts/6-protobuf.html",
                },
                {
                  title: "Multistore and Keepers",
                  path: "/academy/2-cosmos-concepts/7-multistore-keepers.html",
                },
                {
                  title: "BaseApp",
                  path: "/academy/2-cosmos-concepts/8-base-app.html",
                },
                {
                  title: "Queries",
                  path: "/academy/2-cosmos-concepts/9-queries.html",
                },
                {
                  title: "Events",
                  path: "/academy/2-cosmos-concepts/10-events.html",
                },
                {
                  title: "Context",
                  path: "/academy/2-cosmos-concepts/11-context.html",
                },
                {
                  title: "Migrations",
                  path: "/academy/2-cosmos-concepts/12-migrations.html",
                },
                {
                  title: "Bridges",
                  path: "/academy/2-cosmos-concepts/13-bridges.html",
                },
                {
                  title: "Mandatory Quiz",
                  path: "ida-customizations/ida-course/quiz-week1.html",
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
                  path: "ida-customizations/ida-course/LPs/week-2",
                },
                {
                  title: "Setup Your Work Environment",
                  path: "/tutorials/2-setup",
                },
                {
                  title: "Run a Node, API, and CLI",
                  path: "/tutorials/3-run-node",
                },
                {
                  title: "Ignite CLI",
                  path: "/hands-on-exercise/1-ignite-cli/1-ignitecli.html",
                },
                {
                  title: "Exercise - Make a Checkers Blockchain",
                  path: "/hands-on-exercise/1-ignite-cli/2-exercise-intro.html",
                },
                {
                  title: "Store Object - Make a Checkers Blockchain",
                  path: "/hands-on-exercise/1-ignite-cli/3-stored-game.html",
                },
                {
                  title: "Create Custom Messages",
                  path: "/hands-on-exercise/1-ignite-cli/4-create-message.html",
                },
                {
                  title: "Create and Save a Game Properly",
                  path: "/hands-on-exercise/1-ignite-cli/5-create-handling.html",
                },
                {
                  title: "Add a Way to Make a Move",
                  path: "/hands-on-exercise/1-ignite-cli/6-play-game.html",
                },
                {
                  title: "Emit Game Information",
                  path: "/hands-on-exercise/1-ignite-cli/7-events.html",
                },
                {
                  title: "Make Sure a Player Can Reject a Game",
                  path: "/hands-on-exercise/1-ignite-cli/8-reject-game.html",
                },
                {
                  title: "Mandatory Exercise",
                  path: "ida-customizations/ida-course/exercise-week2.html",
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
                  path: "ida-customizations/ida-course/LPs/week-3",
                },
                {
                  title: "What is IBC?",
                  path: "/academy/3-ibc/1-what-is-ibc.html",
                },
                {
                  title: "IBC/TAO - Connections",
                  path: "/academy/3-ibc/2-connections.html",
                },
                {
                  title: "IBC/TAO - Channels",
                  path: "/academy/3-ibc/3-channels.html",
                },
                {
                  title: "IBC/TAO - Clients",
                  path: "/academy/3-ibc/4-clients.html",
                },
                {
                  title: "IBC Fungible Token Transfer",
                  path: "/academy/3-ibc/5-token-transfer.html",
                },
                {
                  title: "Interchain Accounts",
                  path: "/academy/3-ibc/6-ica.html",
                },
                {
                  title: "IBC Tooling",
                  path: "/academy/3-ibc/7-ibc-tooling.html",
                },
                {
                  title: "What is CosmJS?",
                  path: "tutorials/6-comsjs/1-cosmjs-intro.html",
                },
                {
                  title: "Your First CosmJS Actions",
                  path: "tutorials/6-comsjs/2-first-steps.html",
                },
                {
                  title: "Compose Complex Transactions",
                  path: "tutorials/6-comsjs/2-multi-msg.html",
                },
                {
                  title: "Learn to Integrate Keplr",
                  path: "tutorials/6-comsjs/3-with-keplr.html",
                },
                {
                  title: "Create Custom CosmJS Interfaces",
                  path: "tutorials/6-comsjs/4-create-custom.html",
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
                  path: "ida-customizations/ida-course/LPs/week-4",
                },
                {
                  title: "Put Your Games in Order",
                  path: "/hands-on-exercise/2-ignite-cli/1-game-fifo.html",
                },
                {
                  title: "Keep an Up-To-Date Game Deadline",
                  path: "/hands-on-exercise/2-ignite-cli/2-game-deadline.html",
                },
                {
                  title: "Record the Game Winner",
                  path: "/hands-on-exercise/2-ignite-cli/3-game-winner.html",
                },
                {
                  title: "Auto-Expiring Games",
                  path: "/hands-on-exercise/2-ignite-cli/4-game-forfeit.html",
                },
                {
                  title: "Let Players Set a Wager",
                  path: "/hands-on-exercise/2-ignite-cli/5-game-wager.html",
                },
                {
                  title: "Incentivize Players",
                  path: "/hands-on-exercise/2-ignite-cli/6-gas-meter.html",
                },
                {
                  title: "Help Find a Correct Move",
                  path: "/hands-on-exercise/2-ignite-cli/7-can-play.html",
                },
                {
                  title: "Understand IBC Denoms",
                  path: "/tutorials/5-ibc-dev",
                },
                {
                  title: "Play With Cross-Chain Tokens",
                  path: "/hands-on-exercise/4-ibc-adv/1-wager-denom.html",
                },
                {
                  title: "Relaying With IBC",
                  path: "/hands-on-exercise/4-ibc-adv/2-relayer-intro.html",
                },
                {
                  title: "Go Relayer",
                  path: "/hands-on-exercise/4-ibc-adv/3-go-relayer.html",
                },
                {
                  title: "Hermes Relayer",
                  path: "/hands-on-exercise/4-ibc-adv/4-hermes-relayer.html",
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
                  path: "ida-customizations/ida-course/LPs/week-5",
                },
                {
                  title: "Create Custom Objects",
                  path: "hands-on-exercise/3-cosmjs/1-cosmjs-objects.html",
                },
                {
                  title: "Create Custom Messages",
                  path: "hands-on-exercise/3-cosmjs/2-cosmjs-messages.html",
                },
                {
                  title: "Get an External GUI",
                  path: "hands-on-exercise/3-cosmjs/3-external-gui.html",
                },
                {
                  title: "Integrate CosmJS and Keplr",
                  path: "hands-on-exercise/3-cosmjs/4-cosmjs-gui.html",
                },
                {
                  title: "Backend Script for Game Indexing",
                  path: "hands-on-exercise/3-cosmjs/5-server-side.html",
                },
                {
                  title: "Introduce a Leaderboard After Production",
                  path: "hands-on-exercise/3-cosmjs/6-migration.html",
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
                  path: "ida-customizations/ida-course/LPs/week-6",
                },
                {
                  title: "IBC Application Developer Introduction",
                  path: "/hands-on-exercise/4-ibc-dev/5-ibc-app-intro.html",
                },
                {
                  title: "Make a Module IBC-Enabled",
                  path: "/hands-on-exercise/4-ibc-dev/6-ibc-app-steps.html",
                },
                {
                  title: "Adding Packet and Acknowledgment Data",
                  path: "/hands-on-exercise/4-ibc-dev/7-ibc-app-packets.html",
                },
                {
                  title: "IBC Middleware",
                  path: "/hands-on-exercise/4-ibc-dev/8-ibc-mw-intro.html",
                },
                {
                  title: "Create a Custom IBC Middleware",
                  path: "/hands-on-exercise/4-ibc-dev/9-ibc-mw-develop.html",
                },
                {
                  title: "Integrating IBC Middleware Into a Chain",
                  path: "/hands-on-exercise/4-ibc-dev/10-ibc-mw-integrate.html",
                },
              ]
            },
            {
              title: "Week 7 - Run in Production",
              directory: true,
              order: 8,
              children: [
                {
                  title: "Run in Production",
                  path: "ida-customizations/ida-course/LPs/week-7",
                },
                {
                  title: "Overview",
                  path: "/hands-on-exercise/5-run-in-prod/1-overview.html",
                },
                {
                  title: "Prepare the Software to Run",
                  path: "/hands-on-exercise/5-run-in-prod/2-software.html",
                },
                {
                  title: "Prepare a Validator and Keys",
                  path: "/hands-on-exercise/5-run-in-prod/3-keys.html",
                },
                {
                  title: "Prepare Where the Node Starts",
                  path: "/hands-on-exercise/5-run-in-prod/4-genesis.html",
                },
                {
                  title: "Prepare and Connect to Other Nodes",
                  path: "/hands-on-exercise/5-run-in-prod/5-network.html",
                },
                {
                  title: "Configure, Run, and Set Up a Service",
                  path: "/hands-on-exercise/5-run-in-prod/6-run.html",
                },
                {
                  title: "Prepare and Do Migrations",
                  path: "/hands-on-exercise/5-run-in-prod/7-migration.html",
                },
                {
                  title: "Move to Production",
                  path: "/hands-on-exercise/5-run-in-prod/8-run-prod.html",
                },
                {
                  title: "Final Exam",
                  path: "/ida-course/final-exam.html"
                },
              ]
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
    "ida-course/*/*/*.md",
    "ida-course/*/*.md",
    "ida-course/*.md",
    "course-ida/*/*.md",
    "course-ida/*.md"
  ]
};
