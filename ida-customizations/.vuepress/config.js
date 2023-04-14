const path = require("path");

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
      document.documentElement.className = userThemeMode`,
    ],
    [
      "script",
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-KZ2X8K22XG",
      },
    ],
    [
      "script",
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
    isIDAMode: true,
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
      filterByTagEnabled: true,
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
                  path: "/ida-course/LPs/week-0/",
                },
                {
                  title: "Blockchain 101",
                  path: "/ida-course/0-blockchain-basics/1-blockchain.html",
                },
                {
                  title: "Blockchain History",
                  path: "/ida-course/0-blockchain-basics/2-public.html",
                },
                {
                  title: "Public and Managed Blockchains",
                  path: "/ida-course/0-blockchain-basics/3-managed.html",
                },
                {
                  title: "Consensus in Distributed Networks",
                  path: "/ida-course/0-blockchain-basics/4-consensus.html",
                },
                {
                  title: "Cryptography",
                  path: "/ida-course/0-blockchain-basics/5-crypto.html",
                },
                {
                  title: "Self-Assessment Quiz",
                  path: "/ida-course/0-blockchain-basics/6-quiz.html",
                },
                {
                  title: "Go Introduction - First Steps",
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
                  path: "/tutorials/1-tech-terms/",
                },
                {
                  title: "Docker Introduction",
                  path: "/tutorials/5-docker-intro/",
                },
              ],
            },
            {
              title: "Week 1 - Introduction to Cosmos",
              directory: true,
              order: 2,
              children: [
                {
                  title: "Introduction to Cosmos",
                  path: "/ida-course/LPs/week-1/",
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
                  title: "Testing",
                  path: "/academy/2-cosmos-concepts/12-testing.html", // TODO uncomment when #1266 merged
                },
                {
                  title: "Migrations",
                  path: "/academy/2-cosmos-concepts/13-migrations.html",
                },
                {
                  title: "Bridges",
                  path: "/academy/2-cosmos-concepts/14-bridges.html",
                },
                {
                  title: "Week 1 Quiz",
                  path: "/ida-course/quiz-week1.html",
                },
              ],
            },
            {
              title: "Week 2 - First Steps",
              directory: true,
              order: 3,
              children: [
                {
                  title: "First Steps",
                  path: "/ida-course/LPs/week-2/",
                },
                {
                  title: "Setup Your Work Environment",
                  path: "/tutorials/2-setup/",
                },
                {
                  title: "Run a Node, API, and CLI",
                  path: "/tutorials/3-run-node/",
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
                  title: "Record the Game Winner",
                  path: "/hands-on-exercise/1-ignite-cli/8-game-winner.html",
                },
                {
                  title: "Week 2 Exercise",
                  path: "/ida-course/exercise-week2.html",
                },
              ],
            },
            {
              title: "Week 3 - Introduction to IBC and CosmJS",
              directory: true,
              order: 4,
              children: [
                {
                  title: "Introduction to IBC and CosmJS",
                  path: "/ida-course/LPs/week-3/",
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
                  title: "IBC Token Transfer",
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
                  path: "/tutorials/7-cosmjs/1-cosmjs-intro.html",
                },
                {
                  title: "Your First CosmJS Actions",
                  path: "/tutorials/7-cosmjs/2-first-steps.html",
                },
                {
                  title: "Compose Complex Transactions",
                  path: "/tutorials/7-cosmjs/3-multi-msg.html",
                },
                {
                  title: "Learn to Integrate Keplr",
                  path: "/tutorials/7-cosmjs/4-with-keplr.html",
                },
                {
                  title: "Create Custom CosmJS Interfaces",
                  path: "/tutorials/7-cosmjs/5-create-custom.html",
                },
              ],
            },
            {
              title: "Week 4 - Ignite CLI and IBC Advanced",
              directory: true,
              order: 5,
              children: [
                {
                  title: "Ignite CLI and IBC Advanced",
                  path: "/ida-course/LPs/week-4/",
                },
                {
                  title: "Keep an Up-To-Date Game Deadline",
                  path: "/hands-on-exercise/2-ignite-cli-adv/1-game-deadline.html",
                },
                {
                  title: "Record the Move Count",
                  path: "/hands-on-exercise/2-ignite-cli-adv/2-move-count.html",
                },
                {
                  title: "Put Your Games in Order",
                  path: "/hands-on-exercise/2-ignite-cli-adv/3-game-fifo.html",
                },
                {
                  title: "Auto-Expiring Games",
                  path: "/hands-on-exercise/2-ignite-cli-adv/4-game-forfeit.html",
                },
                {
                  title: "Let Players Set a Wager",
                  path: "/hands-on-exercise/2-ignite-cli-adv/4-game-wager.html",
                },
                {
                  title: "Handle wager payments",
                  path: "/hands-on-exercise/2-ignite-cli-adv/5-payment-winning.html",
                },
                {
                  title: "Incentivize Players",
                  path: "/hands-on-exercise/2-ignite-cli-adv/6-gas-meter.html",
                },
                {
                  title: "Help Find a Correct Move",
                  path: "/hands-on-exercise/2-ignite-cli-adv/7-can-play.html",
                },
                {
                  title: "Understand IBC Denoms",
                  path: "/tutorials/6-ibc-dev/",
                },
                {
                  title: "Play With Cross-Chain Tokens",
                  path: "/hands-on-exercise/2-ignite-cli-adv/8-wager-denom.html",
                },
                {
                  title: "Relaying With IBC",
                  path: "/hands-on-exercise/5-ibc-adv/2-relayer-intro.html",
                },
                {
                  title: "Go Relayer",
                  path: "/hands-on-exercise/5-ibc-adv/3-go-relayer.html",
                },
                {
                  title: "Hermes Relayer",
                  path: "/hands-on-exercise/5-ibc-adv/4-hermes-relayer.html",
                },
              ],
            },
            {
              title: "Week 5 - CosmJS Advanced",
              directory: true,
              order: 6,
              children: [
                {
                  title: "CosmJS Advanced",
                  path: "/ida-course/LPs/week-5/",
                },
                {
                  title: "Create Custom Objects",
                  path: "/hands-on-exercise/3-cosmjs-adv/1-cosmjs-objects.html",
                },
                {
                  title: "Create Custom Messages",
                  path: "/hands-on-exercise/3-cosmjs-adv/2-cosmjs-messages.html",
                },
                {
                  title: "Get an External GUI",
                  path: "/hands-on-exercise/3-cosmjs-adv/3-external-gui.html",
                },
                {
                  title: "Integrate CosmJS and Keplr",
                  path: "/hands-on-exercise/3-cosmjs-adv/4-cosmjs-gui.html",
                },
                {
                  title: "Backend Script for Game Indexing",
                  path: "/hands-on-exercise/3-cosmjs-adv/5-server-side.html",
                },
              ],
            },
            {
              title: "Week 6 - IBC Deep Dive",
              directory: true,
              order: 7,
              children: [
                {
                  title: "IBC Deep Dive",
                  path: "/ida-course/LPs/week-6/",
                },
                {
                  title: "IBC Application Developer Introduction",
                  path: "/hands-on-exercise/5-ibc-adv/5-ibc-app-intro.html",
                },
                {
                  title: "Make a Module IBC-Enabled",
                  path: "/hands-on-exercise/5-ibc-adv/6-ibc-app-steps.html",
                },
                {
                  title: "Adding Packet and Acknowledgment Data",
                  path: "/hands-on-exercise/5-ibc-adv/7-ibc-app-packets.html",
                },
                {
                  title: "Extend the Checkers Game With a Leaderboard",
                  path: "/hands-on-exercise/5-ibc-adv/8-ibc-app-checkers.html"
                },
                {
                  title: "Create a Leaderboard Chain",
                  path: "/hands-on-exercise/5-ibc-adv/9-ibc-app-leaderboard.html"
                },
                {
                  title: "IBC Middleware",
                  path: "/hands-on-exercise/5-ibc-adv/10-ibc-mw-intro.html",
                },
                {
                  title: "Create a Custom IBC Middleware",
                  path: "/hands-on-exercise/5-ibc-adv/11-ibc-mw-develop.html",
                },
                {
                  title: "Integrating IBC Middleware Into a Chain",
                  path: "/hands-on-exercise/5-ibc-adv/12-ibc-mw-integrate.html",
                },
              ],
            },
            {
              title: "Week 7 - From Code to MVP to Production and Migrations",
              directory: true,
              order: 8,
              children: [
                {
                  title: "From Code to MVP to Production and Migrations",
                  path: "/ida-course/LPs/week-7/",
                },
                {
                  title: "Overview",
                  path: "/tutorials/9-path-to-prod/1-overview.html",
                },
                {
                  title: "Prepare the Software to Run",
                  path: "/tutorials/9-path-to-prod/2-software.html",
                },
                {
                  title: "Prepare a Validator and Keys",
                  path: "/tutorials/9-path-to-prod/3-keys.html",
                },
                {
                  title: "Prepare Where the Node Starts",
                  path: "/tutorials/9-path-to-prod/4-genesis.html",
                },
                {
                  title: "Prepare and Connect to Other Nodes",
                  path: "/tutorials/9-path-to-prod/5-network.html",
                },
                {
                  title: "Configure, Run, and Set Up a Service",
                  path: "/tutorials/9-path-to-prod/6-run.html",
                },
                {
                  title: "Simulate Production in Docker",
                  path: "/hands-on-exercise/4-run-in-prod/1-run-prod-docker.html",
                },
                {
                  title: "Tally Player Info After Production",
                  path: "/hands-on-exercise/4-run-in-prod/2-migration-info.html",
                },
                {
                  title: "Add a Leaderboard Module After Production",
                  path: "/hands-on-exercise/4-run-in-prod/3-migration-leaderboard.html",
                },
                {
                  title: "Prepare and Do Migrations",
                  path: "/tutorials/9-path-to-prod/7-migration.html",
                },
                {
                  title: "Final Exam",
                  path: "/ida-course/final-exam/",
                },
              ],
            },
            {
              title: "What's Next?",
              directory: true,
              order: 9,
              path: "/academy/whats-next/",
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
        text: "Chat with Cosmos developers in <a href='https://discord.gg/cosmosnetwork' target='_blank'>Discord</a> or reach out in the <a href='https://forum.cosmos.network/c/cosmos-sdk' target='_blank'>SDK Developer Forum</a> to learn more.",
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
          url: "https://discord.gg/cosmosnetwork",
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
        },
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
      'dev-ops': {
        color: '#54ffe0',
        label: 'DevOps',
        isBright: true
      },
      'cosmos-sdk': {
        color: '#F69900',
        label: 'Cosmos SDK',
        isBright: true
      },
      'ibc': {
        color: '#ff1717',
        label: 'IBC'
      },
      'cosm-js': {
        color: '#6836D0',
        label: 'CosmJS'
      },
      'cosm-wasm': {
        color: '#05BDFC',
        label: 'CosmWasm'
      },
      'tendermint': {
        color: '#00B067',
        label: 'Tendermint'
      },
      'cosmos-hub': {
        color: '#f7f199',
        label: 'Cosmos Hub',
        isBright: true
      },
      'concepts': {
        color: '#AABAFF',
        label: 'Concept',
        isBright: true
      },
      'tutorial': {
        color: '#F46800',
        label: 'Tutorial'
      },
      'guided-coding': {
        color: '#F24CF4',
        label: 'Guided Coding'
      },
    },
    feedback: {
      formId: "xyylrkbl",
      captchaSiteKey: "6Ldu_iwdAAAAAF_kmEKihLNwB4qQNsGr9ox5t3Xd",
    },
    resources: [
      {
        title: "Cosmos SDK",
        description: "A framework to build application-specific blockchains",
        links: [
          {
            name: "Documentation",
            url: "https://docs.cosmos.network/",
          },
        ],
        image: "/cosmos-sdk-icon.svg",
      },
      {
        title: "Tendermint Core",
        description: "Blockchain consensus engine and application interface",
        links: [
          {
            name: "Documentation",
            url: "https://docs.tendermint.com/",
          },
        ],
        image: "/tendermint-icon.svg",
      },
      {
        title: "Cosmos Hub",
        description:
          "First interconnected public blockchain on the Cosmos network",
        links: [
          {
            name: "Documentation",
            url: "https://hub.cosmos.network/",
          },
        ],
        image: "/generic-star-icon.svg",
      },
      {
        title: "IBC",
        description:
          "Industry standard protocol for inter-blockchain communication",
        links: [
          {
            name: "Documentation",
            url: "https://ibc.cosmos.network/",
          },
        ],
        image: "/ibc-icon.svg",
      },
    ],
    assetsOptimization: {
      breakpoints: [200, 600, 988, 1200],
      blacklist: [
        "node_modules",
        ".vuepress/dist",
        ".vuepress/theme",
        ".vuepress/public/resized-images",
        ".vuepress/public/h5p",
      ],
    },
  },
  plugins: [
    [
      "@vuepress/google-analytics",
      {
        ga: "UA-62891515-12",
      },
    ],
    [
      "@vuepress/medium-zoom",
      {
        selector: ".layout__main__content :not(a) > img:not(.no-zoom)",
        options: {
          background: "#000000",
        },
      },
    ],
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
    "course-ida/*.md",
    "hands-on-exercise/*/*.md",
  ],
};
