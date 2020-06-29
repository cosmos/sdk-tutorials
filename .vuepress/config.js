module.exports = {
  theme: 'cosmos',
  title: 'Cosmos SDK Tutorials',
  themeConfig: {
    repo: 'cosmos/sdk-tutorials',
    docsRepo: 'cosmos/sdk-tutorials',
    autoSidebar: false,
    editLinks: true,
    sidebar: {
      auto: false,
      nav: [
        {
          title: 'Tutorials',
          children: [
            {
              title: 'Nameservice',
              path: '/nameservice/tutorial/',
              directory: true
            },
            {
              title: 'Scavenge',
              path: '/scavenge/tutorial/',
              directory: true
            },
            {
              title: 'Cosmos Burner Chain',
              path: '/burner-chain/',
              directory: true
            }
          ]
        }
      ],
      footer: [
        {
          label: "sdk",
          name: "Cosmos<br>SDK",
          url: "https://docs.cosmos.network/",
          color: "#5064FB",
        },
        {
          label: "hub",
          name: "Cosmos<br>Hub",
          url: "https://hub.cosmos.network/",
          color: "#BA3FD9",
        },
        {
          label: "ibc",
          name: "IBC<br>Protocol",
          url: "https://github.com/cosmos/ics/tree/master/ibc",
          color: "#E6900A",
        },
        {
          label: "core",
          name: "Tendermint<br>Core",
          url: "https://docs.tendermint.com/",
          color: "#00BB00",
        },
      ],
    },
    footer: {
      question: {
        text: "Chat with Cosmos developers in <a href='https://discord.gg/W8trcGV' target='_blank'>Discord</a> or reach out on the <a href='https://forum.cosmos.network/c/cosmos-sdk' target='_blank'>SDK Developer Forum</a> to learn more."
      },
      logo: "/logo-bw.svg",
      textLink: {
        text: "cosmos.network",
        url: "https://cosmos.network"
      },
      services: [
        {
          service: "medium",
          url: "https://blog.cosmos.network/"
        },
        {
          service: "twitter",
          url: "https://twitter.com/cosmos"
        },
        {
          service: "linkedin",
          url: "https://www.linkedin.com/company/tendermint/"
        },
        {
          service: "reddit",
          url: "https://reddit.com/r/cosmosnetwork"
        },
        {
          service: "telegram",
          url: "https://t.me/cosmosproject"
        },
        {
          service: "youtube",
          url: "https://www.youtube.com/c/CosmosProject"
        }
      ],
      smallprint:
        "This website is maintained by Tendermint Inc. The contents and opinions of this website are those of Tendermint Inc.",
      links: [
        {
          title: "Documentation",
          children: [
            {
              title: "Cosmos SDK",
              url: "https://cosmos.network/docs"
            },
            {
              title: "Cosmos Hub",
              url: "https://hub.cosmos.network"
            },
            {
              title: "Tendermint Core",
              url: "https://docs.tendermint.com"
            }
          ]
        },
        {
          title: "Community",
          children: [
            {
              title: "Cosmos blog",
              url: "https://blog.cosmos.network"
            },
            {
              title: "Forum",
              url: "https://forum.cosmos.network"
            },
            {
              title: "Chat",
              url: "https://discord.gg/cr7N47p"
            }
          ]
        },
        {
          title: "Contributing",
          children: [
            {
              title: "Contributing to the docs",
              url:
                "https://github.com/cosmos/cosmos-sdk/blob/master/docs/DOCS_README.md"
            },
            {
              title: "Source code on GitHub",
              url: "https://github.com/cosmos/cosmos-sdk"
            }
          ]
        }
      ]
    }
  },
  plugins: [
    [
      "@vuepress/google-analytics",
      {
        ga: "UA-51029217-13"
      }
    ]
  ],
}
