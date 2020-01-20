module.exports = {
  theme: 'cosmos',
  markdown: {
    anchor: {
      permalinkSymbol: ''
    }
  },
  themeConfig: {
    // if your docs are in a different repo from your main project:
    docsRepo: 'cosmos/sdk-tutorials',
    autoSidebar: false,
    sidebar: [
      {
        title: 'Tutorials',
        children: [
          {
            title: 'Hellochain',
            path: '/hellochain/tutorial/',
           directory: true,
          },
          {
            title: 'Nameservice',
            path: '/nameservice/tutorial/',
            directory: true
          },
          {
            title: 'Scavenge',
            path: '/scavenge/tutorial/',
            directory: true
          }
        ]
      }
    ]
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
