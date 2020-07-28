module.exports = {
  theme: "cosmos",
  title: "Cosmos SDK Tutorials",
  themeConfig: {
    repo: "cosmos/sdk-tutorials",
    docsRepo: "cosmos/sdk-tutorials",
    editLinks: true,
    label: "sdk",
    topbar: {
      banner: false,
    },
    sidebar: {
      auto: false,
      nav: [
        {
          title: "Tutorials",
          children: [
            {
              title: "Nameservice",
              path: "/nameservice/tutorial/",
              directory: true,
            },
            {
              title: "Scavenge",
              path: "/scavenge/tutorial/",
              directory: true,
            },
            {
              title: "Cosmos Burner Chain",
              path: "/burner-chain/",
              directory: true,
            },
            {
              title: "Starport Blog",
              path: "/starport-blog/",
              directory: true,
            },
            {
              title: "Starport Polling App",
              path: "/starport-polling-app/",
              directory: true,
            },
          ],
        },
      ],
    },
    footer: {
      question: {
        text:
          "Chat with Cosmos developers in <a href='https://discord.gg/W8trcGV' target='_blank'>Discord</a> or reach out on the <a href='https://forum.cosmos.network/c/cosmos-sdk' target='_blank'>SDK Developer Forum</a> to learn more.",
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
        "This website is maintained by Tendermint Inc. The contents and opinions of this website are those of Tendermint Inc.",
    },
  },
  plugins: [
    [
      "@vuepress/google-analytics",
      {
        ga: "UA-51029217-13",
      },
    ],
  ],
};
