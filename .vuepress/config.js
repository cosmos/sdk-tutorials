module.exports = {
  theme: "cosmos",
  title: "Cosmos SDK Tutorials",
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
      nav: [
        {
          title: "Tutorials",
          children: [
            {
              title: "Install Starport",
              path: "/starport/",
              directory: true,
            },
            {
              title: "Create a Blog Module",
              path: "/blog/tutorial/",
              directory: true,
            },
            {
              title: "Create a Voting Module",
              path: "/voter/",
              directory: true,
            },
            {
              title: "Create a IBC Hello World module",
              path: "/hello-world/tutorial/",
              directory: true,
            },
            {
              title: "Scavenger Hunt",
              path: "/scavenge/tutorial/",
              directory: true,
            },
            {
              title: "Create an IBC Interchain Exchange module",
              path: "/interchain-exchange/tutorial/",
              directory: true,
            },
            {
              title: "Connect to the cosmoshub-testnet",
              path: "/connecting-to-testnet/",
              directory: true,
            },
            {
              title: "Understand IBC Denoms",
              path: "understanding-ibc-denoms/",
              directory: true,
            },
            {
              title: "Understand the Liquidity Module",
              path: "liquidity-module/",
              directory: true,
            },
            {
              title: "Deploy Your Blockchain on Digital Ocean",
              path: "/publish-app-do/",
              directory: true,
            },
          ],
        },
        {
          title: "Migrate to Stargate",
          children: [
            {
              title: "Proof of File Existence example",
              path: "/launchpad-to-stargate/tutorial/",
              directory: true,
            },
          ],
        },
        {
          title: "B9lab content",
          children: [
            {
              title: "Welcome",
              path: "/b9lab-content/1-welcome/",
              directory: true,
            },
            {
              title: "What is Cosmos?",
              path: "/b9lab-content/2-what-is-cosmos",
              directory: true,
            },
            {
              title: "Main Concepts",
              path: "/b9lab-content/3-main-concepts",
              directory: true,
            },
            {
              title: "Running a Chain",
              path: "/b9lab-content/4-running-a-chain",
              directory: true,
            },
            {
              title: "My Own Cosmos Chain",
              path: "/b9lab-content/5-my-own-chain",
              directory: true,
            },
            {
              title: "What's Next?",
              path: "/b9lab-content/6-whats-next",
              directory: true,
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
      question: {
        text:
          "Chat with Cosmos developers in <a href='https://discord.gg/cosmosnetwork' target='_blank'>Discord</a> or reach out on the <a href='https://forum.cosmos.network/c/cosmos-sdk' target='_blank'>SDK Developer Forum</a> to learn more.",
      },
      logo: "/logo-bw.svg",
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
          service: "linkedin",
          url: "https://www.linkedin.com/company/tendermint/",
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
        "† This website is maintained by Tendermint. The contents and opinions of this website are those of Tendermint. Tendermint provides links to cryptocurrency exchanges as a service to the public. Tendermint does not warrant that the information provided by these websites is correct, complete, and up-to-date. Tendermint is not responsible for their content and expressly rejects any liability for damages of any kind resulting from the use, reference to, or reliance on any information contained within these websites.",
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
              url: "https://github.com/cosmos/ics/tree/master/ibc",
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
              title: "Chat",
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
    }
  },
  plugins: [
    [
      "@vuepress/google-analytics",
      {
        ga: "UA-51029217-2",
      },
    ],
  ],
  patterns: [
    "hello-world/tutorial/*.md",
    "burner-chain/*.md",
    "README.md",
    "home/*.md",
    "nameservice/tutorial/*.md",
    "scavenge/tutorial/*.md",
    "proof-of-file-existence/tutorial/*.md",
    "launchpad-to-stargate/tutorial/*.md",
    "voter/*.md",
    "connecting-to-testnet/*.md",
    "voter-legacy/*.md",
    "blog-legacy/tutorial/*.md",
    "blog/tutorial/*.md",
    "interchain-exchange/tutorial/*.md",
    "liquidity-module/*.md",
    "publish-app-do/*.md",
    "starport/*.md",
    "understanding-ibc-denoms/*.md",
    "feature-test/*.md",
    "b9lab-content/*/*.md"
  ],
};
