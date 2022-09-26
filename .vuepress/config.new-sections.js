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
      filterByTagEnabled: false,
      nav: [
        {
          title: "Cosmos Developer Portal",
          children: [
            {
              title: "Welcome",
              path: "/academy/0-welcome/",
              directory: false,
            }
          ],
        },
        {
          title: "Introduction to Cosmos",
          children: [
            {
              title: "What is Cosmos?",
              path: "/academy/1-what-is-cosmos",
              directory: true,
            },
            {
              title: "Cosmos Concepts",
              path: "/academy/2-cosmos-concepts",
              directory: true,
            },
            {
              title: "Introduction to IBC",
              path: "/academy/3-ibc",
              directory: true,
            }
          ],
        },
        {
          title: "Tutorials",
          children: [
            {
              title: "Good-To-Know Dev Terms",
              path: "/tutorials/1-tech-terms/",
              directory: true,
            },
            {
              title: "Set Up Your Work Environment",
              path: "/tutorials/2-setup/",
              directory: true,
            },
            {
              title: "Run a Node, API, and CLI",
              path: "/tutorials/3-run-node/",
              directory: true,
            },
            {
              title: "Golang Introduction",
              path: "/tutorials/4-golang-intro/",
              directory: true,
            },
            {
              title: "IBC Developers",
              path: "/tutorials/5-ibc-dev/",
              directory: true,
            },
            {
              title: "Introduction to CosmJS",
              path: "/tutorials/6-cosmjs/",
              directory: true,
            }
            {
              title: "Understand SDK modules",
              path: "/tutorials/7-understand-sdk-modules/",
              directory: true,
            }
          ],
        },
        {
          title: "Hands-on Exercise",
          children: [
            {
              title: "Run Your Own Cosmos Chain",
              path: "/hands-on-exercise/1-ignite-cli/",
              directory: true,
            },
            {
              title: "Continue Developing Your Chain",
              path: "/hands-on-exercise/2-ignite-cli-adv/",
              directory: true,
            },
            {
              title: "CosmJS for Your Chain",
              path: "/hands-on-exercise/3-cosmjs-adv/",
              directory: true,
            },
            {
              title: "IBC Advanced",
              path: "/hands-on-exercise/4-ibc-adv/",
              directory: true,
            },
            {
              title: "Run in Production",
              path: "/hands-on-exercise/5-run-in-prod/",
              directory: true,
            },
          ],
        },
        {
          title: "What's Next",
          children: [
            {
              title: "Continue Your Cosmos Journey",
              path: "academy/whats-next/",
              directory: true,
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
