module.exports = {
  theme: 'cosmos',
  markdown: {
    anchor: {
      permalinkSymbol: ''
    }
  },
  themeConfig: {
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
          }
        ]
      }
    ]
  }
}
